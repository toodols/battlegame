import { TargetType } from "./attack";
import { Entity } from "./entity";
import { Target } from "./attack";
import { Game, PlayerId, GameState } from "./game";
import { IOEvent, IOCommand } from "./io";
import { Item, Active, ItemType } from "./item";
import { Battle, Shop } from "./level";

export function formatItem(item: Item, active: Active): string {
	const isDefault = item.actives!.default === active;
	return `${isDefault ? item.name : `${item.name}'s ${active.name}`} ${
		active.uses ? `(${active.uses})` : ""
	}${isDefault ? "" : ` \`${item.id}.${active.id}\``}`;
}

export function displayEvent(event: IOEvent): string {
	switch (event.type) {
		case "entity-death":
			return `🪦 **${event.entity.name}** has died to ${event.attack.source?.name}`;
		case "level-clear":
			return `🏆 Level cleared in ${Math.ceil(
				event.sumActionValue / 100
			)} turns. You may now buy stuff.\n`;
		case "display-shop":
			return `**Shop**\n${event.shop.offers
				.map(
					(offer) =>
						`(${offer.cost}) **${offer.item.name}** (\`${offer.item.id}\`): ${offer.item.description}`
				)
				.join("\n")}`;
		case "item-bought":
			return `💰 **${event.entity.name}** bought ${event.item.name}`;
		case "entity-use-item":
			return `\n🛠️ **${event.entity.name}** used ${formatItem(
				event.item,
				event.active
			)} ${
				event.target.type === "entities"
					? event.target.entities.length > 0
						? `on ${event.target.entities
								.map((e) => `**${e.name}**`)
								.join(", ")}`
						: event.target.entities.length === 0 &&
						  event.target.entities[0] === event.entity
						? "on self"
						: ""
					: ""
			}`;
		case "entity-recover-energy":
			return `🔋 **${event.entity.name}** recovered ${event.amount} energy -> ${event.entity.energy} / ${event.entity.maxEnergy}`;
		case "message":
			return event.message;
		case "command-error":
			return "❌ " + event.message;
		case "game-init":
			return "Playing battle game (name subject to change)";
		case "game-start":
			return "Game start";
		case "entity-turn-start":
			return `It is now **${event.entity.name}**'s turn`;
		case "entity-do-healing":
			if (event.attack.source === event.target) {
				return `🚑 **${event.attack.source!.name}** healed for ${
					event.effectiveDamage
				} (${event.target.health} / ${event.target.maxHealth})`;
			}
			return `🚑 **${event.attack.source!.name}** healed ${
				event.effectiveDamage
			} HP to ${event.target.name} (${event.target.health} / ${
				event.target.maxHealth
			})`;
		case "entity-do-damage":
			return `🗡️ **${
				event.attack.source ? event.attack.source.name : "unknown"
			}** did ${event.effectiveDamage} DMG to **${event.target.name}** (${
				event.target.health
			} / ${event.target.maxHealth})`;
		case "player-class-changed":
			return `${event.player.name} changed their class to ${event.player.className}`;
	}
}

export function parseCommand(
	command: string,
	game: Game,
	playerId: PlayerId
): IOCommand | string | null {
	let args = command.split(" ");
	let name = args.shift();
	let result;
	if ((result = name?.match(/([a-zA-Z0-9]+)/))) {
		let matched = result[1];
		switch (matched) {
			case "start":
				return {
					type: "start-game",
					playerId,
					initialDifficulty: parseInt(args[0]) || 30,
					difficultyScale: parseInt(args[1]) || 15,
					// commandId: Math.floor(Math.random() * 10000000),
				};
			case "stats":
			case "enemystats":
				if (
					game.state !== GameState.Game ||
					!(game.level instanceof Battle)
				) {
					return null;
				}
				let inspectTarget: Entity | undefined;
				let team =
					matched === "enemystats"
						? game.level.players
						: game.level.enemies;
				if (args[0]) {
					inspectTarget =
						Object.values(team).find(
							(player) => player.name === args[0]
						) || team[parseInt(args[0]) - 1];
				} else if (matched === "stats") {
					inspectTarget = game.players[playerId].entity;
				}
				if (inspectTarget) {
					return (
						`**${inspectTarget.name}** (${inspectTarget.health} / ${inspectTarget.maxHealth})` +
						`Energy: ${inspectTarget.energy} / ${inspectTarget.maxEnergy}` +
						`Credits: ${inspectTarget.credits}` +
						`Speed: ${inspectTarget.getEffectiveSpeed()}` +
						`Status Effects: ${inspectTarget.items
							.filter(
								(item) => item.type === ItemType.StatusEffect
							)
							.map((i) => i.name)
							.join(", ")}`
					);
				} else {
					return displayEvent({
						type: "command-error",
						message: "Target not found",
					});
				}
				return null;
			case "setclass":
				return {
					type: "set-class",
					playerId,
					className: args[0],
				};
			case "use":
				if (
					game.state !== GameState.Game ||
					!(game.level instanceof Battle)
				) {
					return null;
				}
				if (args[0] === undefined) {
					return displayEvent({
						type: "command-error",
						message: "Specify an item",
					});
				}
				const [name, activeName] = args[0].split(".");
				const rawTarget = args[1];
				const item = game.players[playerId].entity?.getItem(name);
				if (item && item.actives) {
					const active = item.actives[activeName || "default"];
					if (!active) {
						return displayEvent({
							type: "command-error",
							message: `Active \`${
								activeName || "default"
							}\` in item \`${name}\` not found`,
						});
					}
					let target: Target = { type: "raw", value: rawTarget };

					if (active.targetType == TargetType.EnemyOne) {
						let num = parseInt(rawTarget);
						let enemyTarget = isNaN(num)
							? game.level?.enemies.find(
									(value) =>
										value.name === rawTarget ||
										value.typeId === rawTarget
							  )
							: game.level?.enemies[num - 1];
						if (enemyTarget) {
							target = {
								type: "entities",
								entities: [enemyTarget],
							};
						} else {
							return displayEvent({
								type: "command-error",
								message: "Target not found",
							});
						}
					} else if (active.targetType == TargetType.FriendlyOne) {
						let num = parseInt(rawTarget);
						const playerTarget = isNaN(num)
							? Object.values(game.players).find(
									(player) => player.name === rawTarget
							  )?.entity
							: game.level!.players[num - 1];
						if (playerTarget) {
							target = {
								type: "entities",
								entities: [playerTarget],
							};
						}
					} else if (active.targetType == TargetType.Number) {
						let num = parseInt(rawTarget);
						target = {
							type: "number",
							value: num,
						};
					}
					// console.log(targetEntities);
					return {
						type: "use-item",
						item,
						active,
						playerId,
						target,
					};
				} else {
					return displayEvent({
						type: "command-error",
						message: "Item not found",
					});
				}
			case "buy":
				return {
					type: "buy-item",
					name: args[0],
					playerId,
				};
			case "shop":
				if (!(game.level instanceof Shop)) {
					return null;
				}
				return displayEvent({
					type: "display-shop",
					shop: game.level,
				});
			case "continue":
				return {
					type: "continue",
					playerId,
				};
			case "items":
				if (game.state === GameState.PreGame) {
					return null;
				}
				let consumables: Record<string, [number, Item]> = {};
				let weapons: Record<string, [number, Item]> = {};
				let abilities: Record<string, [number, Item]> = {};
				let equipment: Record<string, [number, Item]> = {};
				for (const item of game.players[playerId].entity!.items) {
					let bin = (
						{
							[ItemType.Ability]: abilities,
							[ItemType.Consumable]: consumables,
							[ItemType.Weapon]: weapons,
							[ItemType.Equipment]: equipment,
						} as Record<
							ItemType,
							Record<string, [number, Item] | undefined>
						>
					)[item.type];
					if (bin) {
						if (bin[item.id]) {
							bin[item.id]![0] += 1;
						} else {
							bin[item.id] = [1, item];
						}
					}
				}
				function displayItem([count, item]: [number, Item]) {
					return [
						`${count > 1 ? `${count}x ` : ""} **${item.name}** ${
							item.actives?.default?.uses
								? `(${item.actives.default.uses} uses)`
								: ""
						} \`${item.id}\`: ${item.description}`,
						...(item.actives
							? Object.entries(item.actives)
									.map(([name, active]) =>
										name === "default"
											? null
											: `- *${active.name}* \`${
													item.id
											  }.${active.id}\`${
													active.usageEnergyCost
														? ` (${active.usageEnergyCost} energy)`
														: ""
											  } ${active.description ?? ""}`
									)
									.filter((e) => e !== null)
							: []),
					].join("\n");
				}
				return [
					Object.values(weapons).length > 0 ? "## Weapons" : "",
					...Object.values(weapons).map(displayItem),
					Object.values(abilities).length > 0 ? "## Abilities" : "",
					...Object.values(abilities).map(displayItem),
					Object.values(consumables).length > 0
						? "## Consumables"
						: "",
					...Object.values(consumables).map(displayItem),
					Object.values(equipment).length > 0 ? "## Equipment" : "",
					...Object.values(equipment).map(displayItem),
				].join("\n");
			case "actions":
				if (
					game.state !== GameState.Game ||
					!(game.level instanceof Battle)
				) {
					return null;
				}
				return (
					"**" +
					game.level?.currentEntity.name +
					"** | " +
					game.level?.actionQueue
						.map(
							(entity) =>
								`${entity.name} (${Math.floor(
									entity.actionValue
								)})`
						)
						.join(", ")
				);
			case "enemies":
				if (
					game.state !== GameState.Game ||
					!(game.level instanceof Battle)
				) {
					return null;
				}
				return game.level.enemies
					.map(
						(entity, idx) =>
							`${idx}. ${!entity.isAlive() ? "~~" : ""}**${
								entity.name
							}**${!entity.isAlive() ? "~~" : ""} (${
								entity.health
							} / ${entity.maxHealth})`
					)
					.join("\n");
			case "friendlies":
				if (
					game.state !== GameState.Game ||
					!(game.level instanceof Battle)
				) {
					return null;
				}
				return game.level.players
					.map(
						(entity, idx) =>
							`${idx}. ${!entity.isAlive() ? "~~" : ""}**${
								entity.name
							}**${!entity.isAlive() ? "~~" : ""} (${
								entity.health
							} / ${entity.maxHealth})`
					)
					.join("\n");
			default:
				return "Not a command";
		}
	}

	return `Failed to parse \`{${command}}\``;
}
