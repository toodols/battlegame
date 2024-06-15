import { ItemType, Item, destroyItem } from "..";
import { AttackType } from "../../attack";
import { Entity } from "../../entity";
import { withProps, items } from "../items";
import { Desirability } from "..";

export const weakness = {
	name: "Weakness",
	id: "weakness",
	type: ItemType.StatusEffect,
	desirability: Desirability.Negative,
	description: "Entity does 25% less damage for 3 turns.",
	init: (owner: Entity): Item => {
		const item: Item = {
			owner,
			turnsUntilDestroyed: 3,
			passives: {
				onEntityDoDamage: (self, target, attack) => {
					attack.scaleFactor -= 0.25;
				},
			},
			...withProps(weakness),
		};
		return item;
	},
};
