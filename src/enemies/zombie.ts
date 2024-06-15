import { EnemyDescriptor } from ".";
import { Entity } from "../entity";
import { Game } from "../game";
import { items } from "../item/items";
import { rest } from "../item/abilities/rest";
import { dullSword } from "../item/weapons/sword";
import { undead } from "../item/statuses/undead";

export const zombie: EnemyDescriptor = {
	id: "zombie",
	difficultyCost: 20,
	minDifficultyPresence: 30,
	baseWeight: 15,
	init: (game: Game) => {
		const entity = new Entity(game);
		entity.name = "Zombie";
		entity.maxHealth = 50;
		entity.health = 50;
		entity.speed = 80;
		entity.addItem(undead.init(entity));
		entity.addItem(dullSword.init(entity));
		return entity;
	},
};
