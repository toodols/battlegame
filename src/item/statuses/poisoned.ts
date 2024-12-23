import { Item, ItemType, destroyItem } from "..";
import { AttackType } from "../../attack";
import { Entity } from "../../entity";
import { withProps } from "../items";
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
						gauge: owner.roll(6) + owner.roll(6),
						nonlethal: false,
						type: AttackType.Poison,
					});
				},
			},
			...withProps(poisoned),
		};
		return item;
	},
};
