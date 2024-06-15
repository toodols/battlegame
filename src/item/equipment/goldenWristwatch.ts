import { Item, ItemType } from "..";
import { Entity } from "../../entity";
import { ItemDescriptor, withProps } from "../items";

export const goldenWristwatch: ItemDescriptor = {
	name: "Golden Wristwatch",
	id: "golden-wristwatch",
	description: "Increases your speed by 40% for 3 turns on level start.",
	type: ItemType.Equipment,
	baseShopCost: 15,
	baseShopWeight: 10,
	init: (owner: Entity): Item => {
		return {
			owner,
			data: {
				turnsSinceStart: 3,
			},
			passives: {
				onLevelStart: (self) => {
					self.data.turnsSinceStart = 3;
				},
				onEntityTurnEnd(self) {
					self.data.turnsSinceStart -= 1;
				},
				calculateEntitySpeed: (self, speed) => {
					if (self.data.turnsSinceStart >= 0) {
						speed.scaleFactor += 0.4;
					}
				},
			},
			...withProps(goldenWristwatch),
		};
	},
};
