import { EnemyDescriptor } from ".";
import { Entity } from "../entity";
import { Game } from "../game";
import { bounce } from "../item/abilities/bounce";
import { npcRest } from "../item/abilities/npcRest";
import { reanimate } from "../item/abilities/reanimate";
import { strike } from "../item/abilities/strike";
import { fireBased, waterBased } from "../item/statuses/elementBased";
import { slimeBased } from "../item/statuses/slimeBased";

export const necromancer: EnemyDescriptor = {
	id: "necromancer",
	difficultyCost: 80,
	// midpoint 200
	minDifficultyPresence: 0,
	maxDifficultyPresence: 400,
	baseWeight: 10,
	init: (game: Game) => {
		const entity = new Entity(game);
		entity.name = "Necromancer";
		entity.maxHealth = 120;
		entity.health = 120;
		entity.speed = 100;
		entity.addItem(strike.init(entity));
		entity.addItem(reanimate.init(entity));
		entity.addItem(npcRest.init(entity));
		return entity;
	},
};
