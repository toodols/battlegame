import { Item, ItemType, destroyItem } from "..";
import { AttackType } from "../../attack";
import { Entity } from "../../entity";
import { roll, withProps } from "../items";
import { Desirability } from "..";

export const poisoned = {
	name: "Poisoned",
	id: "poisoned",
	type: ItemType.StatusEffect,
	desirability: Desirability.Negative,
	description: "Take 2d6 damage every turn for 3 turns",
	init: (owner: Entity): Item => {
		const item: Item = {
			owner,
			turnsUntilDestroyed: 3,
			passives: {
				onEntityTurnStart: (self) => {
					self.owner.doDamage(self.owner, {
						source: item,
						gauge: roll(6) + roll(6),
						lethal: false,
						type: AttackType.Poison,
					});
				},
			},
			...withProps(poisoned),
		};
		return item;
	},
};
