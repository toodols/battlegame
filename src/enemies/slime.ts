import { EnemyDescriptor } from ".";
import { Entity } from "../entity";
import { Game } from "../game";
import { bounce } from "../item/abilities/bounce";
import { fireBased, waterBased } from "../item/statuses/elementBased";
import { slimeBased } from "../item/statuses/slimeBased";

export const fireSlime: EnemyDescriptor = {
	id: "fire-slime",
	difficultyCost: 10,
	// midpoint 50
	minDifficultyPresence: 0,
	maxDifficultyPresence: 100,
	baseWeight: 10,
	init: (game: Game) => {
		const entity = new Entity(game);
		entity.name = "Fire Slime";
		entity.maxHealth = 30;
		entity.health = 30;
		entity.speed = 70;
		entity.addItem(fireBased.init(entity));
		entity.addItem(bounce.init(entity));
		entity.addItem(slimeBased.init(entity));
		return entity;
	},
};

export const waterSlime: EnemyDescriptor = {
	id: "water-slime",
	difficultyCost: 10,
	minDifficultyPresence: 0,
	maxDifficultyPresence: 100,
	baseWeight: 10,
	init: (game: Game) => {
		const entity = new Entity(game);
		entity.name = "Water Slime";
		entity.maxHealth = 30;
		entity.health = 30;
		entity.speed = 70;
		entity.addItem(bounce.init(entity));
		entity.addItem(waterBased.init(entity));
		entity.addItem(slimeBased.init(entity));
		return entity;
	},
};
