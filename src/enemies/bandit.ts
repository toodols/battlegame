import { EnemyDescriptor } from ".";
import { Entity } from "../entity";
import { Game } from "../game";
import { dullSword } from "../item/weapons/dullSword";
import { undead } from "../item/statuses/undead";
import { strike } from "../item/abilities/strike";
import { healPotion } from "../item/consumables/potions";
import { throwingKnives } from "../item/weapons/throwingKnives";

export const bandit: EnemyDescriptor = {
	id: "bandit",
	difficultyCost: 25,
	// midpoint 100
	minDifficultyPresence: -50,
	maxDifficultyPresence: 250,
	baseWeight: 10,
	init: (game: Game) => {
		const entity = new Entity(game);
		entity.name = "Bandit";
		entity.maxHealth = 50;
		entity.health = 50;
		entity.speed = 80;
		entity.addItem(strike.init(entity));
		entity.addItem(throwingKnives.init(entity));
		entity.addItem(healPotion.init(entity));
		return entity;
	},
};
