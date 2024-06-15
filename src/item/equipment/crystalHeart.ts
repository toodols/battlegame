import { Item, ItemType, destroyItem } from "..";

import { Entity } from "../../entity";
import { ItemDescriptor, withProps } from "../items";

export const crystalHeart: ItemDescriptor = {
	name: "Crystal Heart",
	id: "crystal-heart",
	description:
		"The next time you die, you are immediately revived to 50% of your max hp",
	type: ItemType.Equipment,
	baseShopCost: 15,
	baseShopWeight: 10,
	init: (owner: Entity): Item => {
		return {
			owner,
			passives: {
				onEntityDeath: (self, res) => {
					self.owner.health = self.owner.maxHealth / 50;
					destroyItem(self);
					self.owner.game.eventBuffer.push({
						type: "message",
						message: "The Crystal Heart has shattered",
					});
				},
			},
			...withProps(crystalHeart),
		};
	},
};
