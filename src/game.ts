import { classes } from "./classes";
import { AttackType, TargetType } from "./attack";
import { Level } from "./level";
import { Entity } from "./entity";
import { canUseItemActive, destroyItem, useItemActive } from "./item";
import { populate } from "dotenv";
import { EnemyDescriptor, enemies } from "./enemies";
import { chiliPeppers } from "./item/consumables/chiliPeppers";
import { ItemDescriptor } from "./item/items";
import { IO, IOEvent } from "./io";
import {
	healPotion,
	poisonPotion,
	slownessPotion,
	weaknessPotion,
} from "./item/consumables/potions";
import { goldenWristwatch } from "./item/equipment/goldenWristwatch";
import { zombieSpawnEgg } from "./item/consumables/zombieSpawnEgg";
import { wealthTalisman } from "./item/equipment/wealthTalisman";
import { stick } from "./item/weapons/stick";
import { throwingKnives } from "./item/weapons/throwingKnives";
import { woodenBow } from "./item/weapons/woodenBow";
import { ominousFangs } from "./item/equipment/ominousFangs";
import { crystalHeart } from "./item/equipment/crystalHeart";
export enum GameState {
	PreGame,
	Game,
	Shop,
}

export interface Player {
	entity?: Entity;
	name: string;
	className: string | null;
	id: PlayerId;
}

export interface Shop {
	offers: {
		item: ItemDescriptor;
		cost: number;
	}[];
}

function selectRandomFromPool<T>(pool: T[], weight: (value: T) => number): T {
	const sumWeight = pool.reduce((sum, current) => sum + weight(current), 0);
	let value = Math.random();
	let cur: T;
	let curIdx = 0;
	while (true) {
		cur = pool[curIdx];
		value -= weight(cur) / sumWeight;
		curIdx += 1;
		if (value < 0) {
			break;
		}
	}
	return cur;
}

export class Game {
	io: IO = new IO();
	// how difficult the current level is
	difficulty: number = 0;
	// how fast the difficulty grows per level
	difficultyScale: number = 0;
	levelNumber: number = 0;
	currentLevel?: Level;
	state = GameState.PreGame;
	hostPlayer?: Player;
	shop?: Shop;
	players: Record<PlayerId, Player> = {};
	// only for death messages that i want to play *after* the damage message
	eventBuffer: IOEvent[] = [];
	flushEvents() {
		for (const event of this.eventBuffer /*.sort(
			(event) =>
				//@ts-ignore
				({
					"entity-death": 5,
					"level-clear": 6,
				}[event.type] || 10)
		)*/) {
			this.io.onOutputEvent(event);
		}
		this.eventBuffer = [];
	}
	createEnemies() {
		let difficultyGauge = this.difficulty;
		let enemyTeam = [];
		while (difficultyGauge > 0) {
			let pool = enemies.filter(
				(enemy) =>
					enemy.difficultyCost <= difficultyGauge &&
					(enemy.minDifficultyPresence || 0) <= this.difficulty &&
					(enemy.maxDifficultyPresence || Infinity) >= this.difficulty
			);
			if (pool.length === 0) {
				break;
			}
			const cur = selectRandomFromPool(
				pool,
				(descriptor) => descriptor.baseWeight
			);
			difficultyGauge -= cur.difficultyCost;
			enemyTeam.push(cur!.init(this));
		}
		return enemyTeam;
	}
	onLevelClear() {
		this.flushEvents();
		this.io.onOutputEvent({
			type: "level-clear",
			sumActionValue: this.currentLevel!.sumActionValue,
		});
		// remove dead npcs
		this.currentLevel!.players = this.currentLevel!.players.filter(
			(entity) => entity.playerId || entity.health > 0
		);

		for (const player of Object.values(this.players)) {
			const playerEntity = player.entity!;
			playerEntity.setCredits(
				playerEntity.credits + 5 + 3 * this.levelNumber
			);
			this.io.onOutputEvent({
				type: "message",
				message: `${playerEntity.name} now has ${playerEntity.credits} credits`,
			});
			playerEntity.takeDamage({
				type: AttackType.Healing,
				gauge: 50,
				source: null,
			});
			playerEntity.recoverEnergy(50);
		}
		for (const player of Object.values(this.players)) {
			const entity = player.entity!;
			entity.items.forEach((item) => item.passives?.onLevelEnd?.(item));
		}
		this.state = GameState.Shop;
		const shopPool = [
			goldenWristwatch,
			zombieSpawnEgg,
			chiliPeppers,
			poisonPotion,
			healPotion,
			weaknessPotion,
			slownessPotion,
			wealthTalisman,
			woodenBow,
			throwingKnives,
			ominousFangs,
			crystalHeart,
		];

		const shop: Shop = { offers: [] };
		const shopItemsCount = 2 + Math.floor(Math.sqrt(this.levelNumber));
		for (let i = 0; i < shopItemsCount; i += 1) {
			let selected = selectRandomFromPool(
				shopPool,
				(descriptor) => descriptor.baseShopWeight || 10
			);
			shop.offers.push({
				cost: selected.baseShopCost || 5,
				item: selected,
			});
		}
		this.shop = shop;
		this.io.onOutputEvent({
			type: "display-shop",
			shop: this.shop,
		});
	}
	makeLevel() {
		this.levelNumber += 1;
		this.currentLevel = new Level(
			this,
			this.createEnemies(),
			this.currentLevel?.players ||
				Object.values(this.players).map((p) => p.entity!)
		);
		for (const player of Object.values(this.players)) {
			const entity = player.entity!;
			entity.items.forEach((item) => item.passives?.onLevelStart?.(item));
		}
		this.doTurns();
	}
	doTurns() {
		this.flushEvents();
		while (
			this.currentLevel!.currentEntity!.endTurnFlag &&
			this.currentLevel!.levelConditionFlag === "ongoing"
		) {
			this.currentLevel!.currentEntity.endTurnFlag = false;
			this.flushEvents();
			this.currentLevel!.nextTurn();
		}
		if (this.currentLevel!.levelConditionFlag === "clear") {
			this.currentLevel!.currentEntity.endTurnFlag = false;
			this.onLevelClear();
		} else if (this.currentLevel!.levelConditionFlag === "loss") {
			this.io.onOutputEvent({
				type: "message",
				message: "you lose",
			});
		}
	}
	constructor() {
		this.io.onInputCommand = (command) => {
			const player = this.players[command.playerId];
			switch (command.type) {
				case "initialize":
					for (const playerId in command.players) {
						this.players[playerId] = {
							id: playerId,
							name: command.players[playerId].name,
							className: "mage",
						};
					}

					this.hostPlayer = this.players[command.playerId];
					this.io.onOutputEvent({ type: "game-init" });
					return;
				case "start-game":
					if (
						!this.players[command.playerId] ||
						this.state !== GameState.PreGame
					) {
						return;
					}
					if (this.hostPlayer?.id !== command.playerId) {
						this.io.onOutputEvent({
							type: "command-error",
							message: "Only host may start",
						});
						return;
					}
					for (const playerId in this.players) {
						const player = this.players[playerId];
						if (player.className === null) {
							this.io.onOutputEvent({
								type: "command-error",
								message: `${player.name} no has no class`,
							});
							return;
						}
					}
					this.difficulty = Math.max(10, command.initialDifficulty);
					this.difficultyScale = Math.max(0, command.difficultyScale);
					for (const playerId in this.players) {
						const player = this.players[playerId];
						player.entity = classes[
							player.className as keyof typeof classes
						](this, player);
					}
					this.state = GameState.Game;
					this.io.onOutputEvent({ type: "game-start" });
					this.makeLevel();
					return;
				case "set-class":
					if (this.state !== GameState.PreGame) {
						this.io.onOutputEvent({
							type: "command-error",
							message:
								"Can only choose class before the game starts",
						});
						return;
					}
					if (command.className in classes) {
						player.className = command.className;
						this.io.onOutputEvent({
							type: "player-class-changed",
							player,
						});
					} else {
						this.io.onOutputEvent({
							type: "command-error",
							message: `${command.className} is not a class`,
						});
					}
					return;

				case "buy-item":
					if (!player.entity) {
						this.io.onOutputEvent({
							type: "command-error",
							message: "No player entity",
						});
						return;
					}
					const offer = this.shop?.offers.find(
						(offer) => offer.item.id === command.name
					);
					if (!offer) {
						this.io.onOutputEvent({
							type: "command-error",
							message: `Shop item ${command.name} not found`,
						});
						return;
					}
					const res = player.entity.consumeCredits(offer.cost);
					if (res.ok) {
						const item = offer.item.init(player.entity);
						player.entity.addItem(item);
						this.io.onOutputEvent({
							type: "item-bought",
							entity: player.entity!,
							item,
						});
						this.shop!.offers = this.shop!.offers.filter(
							(o) => o !== offer
						);
					} else {
						this.io.onOutputEvent({
							type: "command-error",
							message: res.error,
						});
					}
					return;
				case "continue":
					if (this.hostPlayer?.id !== command.playerId) {
						this.io.onOutputEvent({
							type: "command-error",
							message: "Only host may continue",
						});
						return;
					}
					this.difficulty += this.difficultyScale;
					this.makeLevel();
					this.state = GameState.Game;
					return;
				case "use-item":
					if (this.state === GameState.Game) {
						const active = command.active;
						if (canUseItemActive(command.item, active)) {
							this.io.onOutputEvent({
								type: "entity-use-item",
								item: command.item,
								active,
								targets: command.targets,
								entity: player.entity!,
							});
							const res = useItemActive(
								command.item,
								active,
								command.targets
							);
							if (res.ok) {
								this.doTurns();
							} else {
								this.io.onOutputEvent({
									type: "command-error",
									message: res.error,
								});
							}
						}

						return;
					} else {
						this.io.onOutputEvent({
							type: "command-error",
							message: "The game has not started yet",
						});
					}
			}
		};
	}
}

export type Result = { ok: true } | { ok: false; error: string };
export type PlayerId = string;
