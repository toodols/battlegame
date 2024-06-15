import { Client, GatewayIntentBits } from "discord.js";
import { GameState, PlayerId } from "./game";
import { IO, IOCommand, IOEvent } from "./io";
import { Game } from "./game";
import { TargetType } from "./attack";
import { Entity } from "./entity";
import { Active, Item, ItemType } from "./item";

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
				event.targets.length > 0
					? `on ${event.targets
							.map((e) => `**${e.name}**`)
							.join(", ")}`
					: event.targets.length === 0 &&
					  event.targets[0] === event.entity
					? "on self"
					: ""
			}`;
		case "entity-recover-energy":
			return `🔋 **${event.entity.name}** recovered ${event.amount} energy -> ${event.entity.energy} / ${event.entity.maxEnergy}`;
		case "message":
			return event.message;
		case "command-error":
			return "❌ " + event.message;
		case "game-init":
			return "Playing textrogue (name subject to change)";
		case "game-start":
			return "Game start";
		case "entity-turn-start":
			return `It is now ${event.entity.name}'s turn`;
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
	if ((result = name?.match(/battle!([a-zA-Z0-9]+)/))) {
		let matched = result[1];
		switch (matched) {
			case "start":
				return {
					type: "start-game",
					playerId,
					initialDifficulty: parseInt(args[0]) || 60,
					difficultyScale: parseInt(args[1]) || 20,
					// commandId: Math.floor(Math.random() * 10000000),
				};
			case "inspect":
			case "inspectenemy":
				if (game.state === GameState.PreGame) {
					return displayEvent({
						type: "command-error",
						message: "Game has not started yet",
					});
				}
				let inspectTarget: Entity | undefined;
				let team =
					matched === "inspect"
						? game.currentLevel!.players
						: game.currentLevel!.enemies;
				if (args[0]) {
					inspectTarget =
						Object.values(team).find(
							(player) => player.name === args[0]
						) || team[parseInt(args[0]) - 1];
				} else {
					inspectTarget = game.players[playerId].entity;
				}
				if (inspectTarget) {
					return `**${inspectTarget.name}** (${
						inspectTarget.health
					} / ${inspectTarget.maxHealth})
Energy: ${inspectTarget.energy} / ${inspectTarget.maxEnergy}
Credits: ${inspectTarget.credits}
Speed: ${inspectTarget.getEffectiveSpeed()}
Status Effects: ${inspectTarget.items
						.filter((item) => item.type === ItemType.StatusEffect)
						.map((i) => i.name)
						.join(", ")}`;
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
				const [name, activeName] = args[0].split(".");
				const target = args[1];
				const item = game.players[playerId].entity?.getItem(name);
				if (item && item.actives) {
					const active = item.actives[activeName || "default"];
					console.log(active);
					if (!active) {
						return null;
					}
					let targetEntities: Entity[] = [];
					if (active.targetType == TargetType.EnemyOne) {
						let num = parseInt(target);
						let enemyTarget = isNaN(num)
							? game.currentLevel?.enemies.find(
									(value) =>
										value.name === target ||
										value.typeId === target
							  )
							: game.currentLevel?.enemies[num - 1];
						console.log(enemyTarget);
						if (enemyTarget) {
							targetEntities = [enemyTarget];
						} else {
							return null;
						}
					} else if (active.targetType == TargetType.FriendlyOne) {
						let num = parseInt(target);
						const playerTarget = isNaN(num)
							? Object.values(game.players).find(
									(player) => player.name === target
							  )?.entity
							: game.currentLevel!.players[num - 1];
						if (playerTarget) {
							targetEntities = [playerTarget];
						}
					}
					// console.log(targetEntities);
					return {
						type: "use-item",
						item,
						active,
						playerId,
						targets: targetEntities,
					};
				}
				return null;
			case "buy":
				return {
					type: "buy-item",
					name: args[0],
					playerId,
				};
			case "shop":
				return displayEvent({
					type: "display-shop",
					shop: game.shop!,
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
				return game.players[playerId]
					.entity!.items.map((item) => `${item.name} (${item.id})`)
					.join(", ");
			case "actions":
				return (
					"**" +
					game.currentLevel?.currentEntity.name +
					"** | " +
					game.currentLevel?.actionQueue
						.map(
							(entity) =>
								`${entity.name} (${Math.floor(
									entity.actionValue
								)})`
						)
						.join(", ")
				);
			case "enemies":
				return game
					.currentLevel!.enemies.map(
						(entity, idx) =>
							`${idx}. ${!entity.isAlive() ? "~~" : ""}**${
								entity.name
							}**${!entity.isAlive() ? "~~" : ""} (${
								entity.health
							} / ${entity.maxHealth})`
					)
					.join("\n");
			case "friendlies":
				return game
					.currentLevel!.players.map(
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
	return null;
}

export function discord() {
	let discordClient = new Client({
		intents: [
			GatewayIntentBits.Guilds,
			GatewayIntentBits.GuildMessages,
			GatewayIntentBits.MessageContent,
			GatewayIntentBits.GuildMembers,
		],
	});
	let games: Record<string, Game> = {};
	discordClient.login(process.env.DISCORD_TOKEN);
	discordClient.on("ready", () => {
		console.log("Bot is ready!");
	});
	discordClient.on("messageCreate", (message) => {
		if (message.content.startsWith("+BattleGame")) {
			if (games[message.channelId]) {
				message.reply("ongoing game");
			}
			const players: Record<PlayerId, { name: string }> = {
				[message.author.id]: { name: message.author.username },
			};
			for (const [_, user] of message.mentions.users) {
				players[user.id] = { name: user.username };
			}

			const game = new Game();

			let buffer: string[] = [];
			let timeoutId: any;

			function resetDebounce(delay: number) {
				if (timeoutId) {
					clearTimeout(timeoutId);
				}
				timeoutId = setTimeout(() => {
					flushMessageBuffer();
				}, delay);
			}

			function flushMessageBuffer() {
				if (buffer.length > 0) {
					for (let i = 0; i < buffer.length; i += 10) {
						let head = buffer.slice(i, i + 10);
						message.channel.send(head.join("\n"));
						buffer = buffer.slice(i + 10);
					}
				}
			}

			game.io.onOutputEvent = function (event) {
				buffer.push(displayEvent(event));
				resetDebounce(100);
			};

			games[message.channelId] = game;
			game.io.onInputCommand({
				type: "initialize",
				players: players,
				playerId: message.author.id,
			});
		} else if (games[message.channelId]) {
			let command = parseCommand(
				message.content,
				games[message.channelId],
				message.author.id
			);
			if (typeof command === "string") {
				if (command.length === 0) {
					message.channel.send("???");
				} else {
					message.channel.send(command);
				}
			} else if (command !== null) {
				games[message.channelId].io.onInputCommand(command);
			}
		}
	});
}
