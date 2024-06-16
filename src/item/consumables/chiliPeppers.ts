import { ItemType, Item, APPEAL } from "..";
import { TargetType } from "../../attack";
import { Entity } from "../../entity";
import { items, withProps } from "../items";
import { spicy } from "../statuses/spicy";

export const chiliPeppers = {
	name: "Chili Peppers",
	type: ItemType.Consumable,
	id: "chili-peppers",
	description: "On use, gain 'Spicy': " + spicy.description,
	baseShopCost: 8,
	baseShopWeight: 10,
	init: (owner: Entity): Item => {
		return {
			owner,
			transferrable: true,
			actives: {
				default: {
					appeal: () => APPEAL.LOW,
					targetType: TargetType.Self,
					usageType: "unlimited",
					use: (self, _targets) => {
						self.owner.addItem(items.spicy.init(self.owner));
						return { ok: true };
					},
					destroyedAfterUses: true,
				},
			},

			...withProps(chiliPeppers),
		};
	},
};
