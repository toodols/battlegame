import { Game, GameState } from "./game";
import { Entity } from "./entity";

export type Team = Entity[];
export class Level {
	actionQueue: Entity[];
	currentEntity: Entity = {} as Entity;
	sumActionValue = 0;
	levelConditionFlag: "ongoing" | "clear" | "loss" = "ongoing";
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
		this.reorder();
		this.nextEntity();
		this.currentEntity.turnStart();
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

	getEnemyOf(entity: Entity): Team {
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
}
