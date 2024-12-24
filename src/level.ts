import { Game, GameState, selectRandomFromPool } from "./game";
import { Entity } from "./entity";
import { AttackType } from "./attack";
import { chiliPeppers } from "./item/consumables/chiliPeppers";
import {
	poisonPotion,
	healPotion,
	weaknessPotion,
	slownessPotion,
} from "./item/consumables/potions";
import { puppeteerMask } from "./item/consumables/puppeteerMask";
import { zombieSpawnEgg } from "./item/consumables/zombieSpawnEgg";
import { crystalHeart } from "./item/equipment/crystalHeart";
import { goldenWristwatch } from "./item/equipment/goldenWristwatch";
import { ominousFangs } from "./item/equipment/ominousFangs";
import { wealthTalisman } from "./item/equipment/wealthTalisman";
import { throwingKnives } from "./item/weapons/throwingKnives";
import { woodenBow } from "./item/weapons/woodenBow";
import { ItemDescriptor } from "./item/items";

export type Team = Entity[];
export interface Level {}

export class Shop implements Level {
	offers: {
		item: ItemDescriptor;
		cost: number;
	}[] = [];
	constructor(public game: Game) {
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
			puppeteerMask,
		];

		const shopItemsCount = 2 + Math.floor(Math.sqrt(this.game.levelNumber));
		for (let i = 0; i < shopItemsCount; i += 1) {
			let selected = selectRandomFromPool(
				shopPool,
				(descriptor) => descriptor.baseShopWeight || 10
			);
			this.offers.push({
				cost: selected.baseShopCost || 5,
				item: selected,
			});
		}
		this.game.io.onOutputEvent({
			type: "display-shop",
			shop: this,
		});
	}
}

export class Battle implements Level {
	type = "battle";
	actionQueue: Entity[];
	currentEntity: Entity = {} as Entity;
	sumActionValue = 0;
	levelConditionFlag: "ongoing" | "clear" | "loss" = "ongoing";
	state: any;
	constructor(public game: Game, public enemies: Team, public players: Team) {
		this.actionQueue = [...players, ...enemies];
		for (const enemy of enemies) {
			enemy.team = enemies;
		}
		for (const player of players) {
			player.team = players;
		}
		for (const entity of this.actionQueue) {
			entity.actionValue = entity.getBaseActionValue();
		}
		for (const player of Object.values(this.game.players)) {
			const entity = player.entity!;
			entity.items.forEach((item) => item.passives?.onLevelStart?.(item));
		}
		this.reorder();
		this.nextEntity();

		this.currentEntity.turnStart();

		this.doTurns();
	}

	doTurns() {
		this.game.flushEvents();
		while (
			this.currentEntity!.endTurnFlag &&
			this.levelConditionFlag === "ongoing"
		) {
			this.currentEntity.endTurnFlag = false;
			this.game.flushEvents();
			this.nextTurn();
		}
		if (this.levelConditionFlag === "clear") {
			this.currentEntity.endTurnFlag = false;
			this.game.onLevelClear();
		} else if (this.levelConditionFlag === "loss") {
			this.game.io.onOutputEvent({
				type: "message",
				message: "you lose",
			});
		}
	}

	reorder() {
		this.actionQueue.sort((a, b) => a.actionValue - b.actionValue);
	}

	setTeam(entity: Entity, team: Team) {
		this.enemies = this.enemies.filter((e) => e !== entity);
		this.players = this.players.filter((e) => e !== entity);
		entity.team = team;
		team.push(entity);
		this.reorder();
	}

	addEntity(entity: Entity, team: Team) {
		entity.team = team;
		entity.team!.push(entity);
		entity.actionValue = entity.getBaseActionValue();
		this.actionQueue.push(entity);
		this.reorder();
	}

	nextTurn() {
		this.currentEntity.turnEnd();
		this.nextEntity();
		this.currentEntity.turnStart();
	}

	getEnemiesOf(entity: Entity): Team {
		if (entity.team === this.enemies) {
			return this.players;
		} else {
			return this.enemies;
		}
	}

	removeEntity(entity: Entity) {
		this.actionQueue = this.actionQueue.filter((e) => e !== entity);
		if (this.enemies.every((entity) => entity.health === 0)) {
			this.levelConditionFlag = "clear";
		} else if (this.players.every((entity) => entity.health === 0)) {
			this.levelConditionFlag = "loss";
		}
	}

	nextEntity() {
		const entity = this.actionQueue.shift()!;
		entity.actionValue = Math.max(0, entity.actionValue);
		const primaryActionValue = entity.actionValue;
		this.sumActionValue += primaryActionValue;
		for (let i = 0; i < this.actionQueue.length; i += 1) {
			this.actionQueue[i].actionValue -= primaryActionValue;
		}

		entity.actionValue = entity.getBaseActionValue();
		this.actionQueue.push(entity);
		this.actionQueue.sort((a, b) => a.actionValue - b.actionValue);

		this.currentEntity = entity;
	}

	onClear() {
		this.game.flushEvents();
		this.game.io.onOutputEvent({
			type: "level-clear",
			sumActionValue: this.sumActionValue,
		});
		// remove dead npcs
		this.players = this.players.filter(
			(entity) => entity.playerId || entity.health > 0
		);

		for (const player of Object.values(this.game.players)) {
			const playerEntity = player.entity!;
			playerEntity.setCredits(
				playerEntity.credits + 5 + 3 * this.game.levelNumber
			);
			this.game.io.onOutputEvent({
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
		for (const player of Object.values(this.game.players)) {
			const entity = player.entity!;
			entity.items.forEach((item) => item.passives?.onLevelEnd?.(item));
		}

		this.game.level = new Shop(this.game);
	}
}
