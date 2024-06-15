import { Item, ItemType } from "..";
import { Entity } from "../../entity";
import { ItemDescriptor, withProps } from "../items";

export const wealthTalisman: ItemDescriptor = {
	name: "Wealth Talisman",
	id: "wealth-talisman",
	description:
		"Increases incoming DMG by 1. Gains 1 credit for each attack received that exceeds 10 DMG.",
	type: ItemType.Equipment,
	baseShopCost: 20,
	baseShopWeight: 10,
	init: (owner: Entity): Item => {
		return {
			owner,
			passives: {
				onEntityDamaging: (self, atk) => {
					atk.flatFactor += 1;
				},
				onEntityDamaged: (self, res) => {
					if (res.effectiveDamage >= 0) {
						self.owner.setCredits(self.owner.credits + 1);
					}
				},
			},
			...withProps(wealthTalisman),
		};
	},
};
