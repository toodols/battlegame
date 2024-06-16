import { Item, ItemType, destroyItem } from "..";
import { AttackType } from "../../attack";
import { Entity } from "../../entity";
import { withProps } from "../items";
import { Desirability } from "..";

export const rangerPassive = {
	name: "Ranger Passive",
	id: "ranger-passive",
	type: ItemType.ClassPassive,
	description: "Ranged weapons have a 30% chance not to use ammo",
	init: (owner: Entity): Item => {
		const item: Item = {
			owner,
			passives: {
				onEntityUseItem: (self, item, active) => {
					if (
						item.ranged &&
						active.uses !== undefined &&
						Math.random() < 0.3
					) {
						active.uses += 1;
					}
				},
			},
			...withProps(rangerPassive),
		};
		return item;
	},
};
