import { ItemType, Item, destroyItem } from "..";
import { AttackType } from "../../attack";
import { Entity } from "../../entity";
import { withProps, items } from "../items";
import { Desirability } from "..";

export const slowness = {
	name: "Slowness",
	id: "slowness",
	type: ItemType.StatusEffect,
	desirability: Desirability.Negative,
	description: "Entity speed is slowed by 20% for 2turns.",
	init: (owner: Entity): Item => {
		return {
			owner,
			turnsUntilDestroyed: 2,
			passives: {
				calculateEntitySpeed: (item, speed) => {
					speed.scaleFactor -= 0.2;
				},
			},
			...withProps(slowness),
		};
	},
};
