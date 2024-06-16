import { EnemyDescriptor } from ".";
import { Entity } from "../entity";
import { Game } from "../game";
import { Desirability, Item, ItemType } from "../item";
import { bounce } from "../item/abilities/bounce";
import { smash } from "../item/abilities/smash";
import { strike } from "../item/abilities/strike";
import { withProps } from "../item/items";
import { fireBased, waterBased } from "../item/statuses/elementBased";
import { slimeBased } from "../item/statuses/slimeBased";

export const golemPassive = {
	name: "Golem Passive",
	id: "golem-passive",
	type: ItemType.ClassPassive,
	description: "On death, split into two Golemites.",
	init: (owner: Entity): Item => {
		const item: Item = {
			owner,
			passives: {
				onEntityDeath: (self, attack) => {
					const ent1 = golemite.init(self.owner.game);
					self.owner.game.currentLevel!.addEntity(
						ent1,
						self.owner.team!
					);
					const ent2 = golemite.init(self.owner.game);
					self.owner.game.currentLevel!.addEntity(
						ent2,
						self.owner.team!
					);
				},
			},
			...withProps(golemPassive),
		};
		return item;
	},
};

export const golem: EnemyDescriptor = {
	id: "golem",
	difficultyCost: 60,
	// midpoint 150
	minDifficultyPresence: 0,
	maxDifficultyPresence: 300,
	baseWeight: 10,
	init: (game: Game) => {
		const entity = new Entity(game);
		entity.name = "Golem";
		entity.maxHealth = 250;
		entity.health = 250;
		entity.speed = 60;
		entity.addItem(smash.init(entity));
		entity.addItem(golemPassive.init(entity));
		return entity;
	},
};

export const golemite: EnemyDescriptor = {
	id: "golemite",
	init: (game: Game) => {
		const entity = new Entity(game);
		entity.name = "Golemite";
		entity.maxHealth = 120;
		entity.health = 120;
		entity.speed = 100;
		entity.addItem(strike.init(entity));
		return entity;
	},
};
