import { ItemType, Item, APPEAL } from "..";
import { TargetType, UsageType } from "../../attack";
import { Entity } from "../../entity";
import { ItemDescriptor, items, withProps } from "../items";

export const energyDrink: ItemDescriptor = {
	name: "Energy Drink",
	type: ItemType.Consumable,
	id: "energy-drink",
	baseShopCost: 5,
	baseShopWeight: 10,
	description: "On use, recovers 30 energy.",
	init: (owner: Entity): Item => {
		return {
			owner,
			transferrable: true,
			actives: {
				default: {
					appeal: (self) =>
						self.owner.energy < 10 ? APPEAL.NORMAL : APPEAL.NO,
					targetType: TargetType.None,
					usageType: UsageType.Unlimited,
					use: (self, _) => {
						self.owner.recoverEnergy(30);
						return { ok: true };
					},
					destroyedAfterUses: true,
				},
			},
			...withProps(energyDrink),
		};
	},
};
