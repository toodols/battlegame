import { EnemyDescriptor } from ".";
import { Entity } from "../entity";
import { Game } from "../game";
import { heal } from "../item/abilities/heal";
import { rest } from "../item/abilities/rest";
import { strike } from "../item/abilities/strike";
import { brew } from "../item/abilities/brew";

export const witch: EnemyDescriptor = {
	id: "witch",
	difficultyCost: 30,
	minDifficultyPresence: 40,
	baseWeight: 15,
	init: (game: Game) => {
		const entity = new Entity(game);
		entity.name = "Witch";
		entity.maxHealth = 60;
		entity.health = 60;
		entity.speed = 70;
		entity.addItem(strike.init(entity));
		entity.addItem(heal.init(entity));
		entity.addItem(rest.init(entity));
		entity.addItem(brew.init(entity));
		return entity;
	},
};
