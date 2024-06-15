import { Item, ItemType } from "..";
import { Entity } from "../../entity";
import { ItemDescriptor, withProps } from "../items";

export const ominousFangs: ItemDescriptor = {
	name: "Ominous Fangs",
	id: "ominous-fangs",
	description:
		"Every time an enemy is killed damage is increased by 15%. Lost after 2 turns",
	type: ItemType.Equipment,
	baseShopCost: 20,
	baseShopWeight: 10,
	init: (owner: Entity): Item => {
		return {
			owner,
			data: {
				stacks: 0,
				turns: 2,
			},
			passives: {
				onEntityDoDamage: (self, target, atk) => {
					atk.scaleFactor += 0.15 * self.data.stacks;
				},
				onEntityKill: (self, target, attack) => {
					self.data.turns = 3;
					self.data.stacks += 1;
				},
				onEntityTurnEnd: (self) => {
					if (self.data.turns > 0) {
						self.data.turns -= 1;
						if (self.data.turns === 0) {
							self.data.stacks = 0;
						}
					}
				},
			},
			...withProps(ominousFangs),
		};
	},
};
