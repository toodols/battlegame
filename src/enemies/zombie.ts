import { EnemyDescriptor } from ".";
import { Entity } from "../entity";
import { Game } from "../game";
import { dullSword } from "../item/weapons/dullSword";
import { undead } from "../item/statuses/undead";
import { npcRest } from "../item/abilities/npcRest";

export const zombie: EnemyDescriptor = {
	id: "zombie",
	difficultyCost: 20,
	// midpoint 75
	minDifficultyPresence: -75,
	maxDifficultyPresence: 225,
	baseWeight: 15,
	init: (game: Game) => {
		const entity = new Entity(game);
		entity.name = "Zombie";
		entity.maxHealth = 50;
		entity.health = 50;
		entity.speed = 80;
		entity.addItem(undead.init(entity));
		entity.addItem(dullSword.init(entity));
		entity.addItem(npcRest.init(entity));
		return entity;
	},
};
