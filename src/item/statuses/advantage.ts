import { Item, ItemType } from "..";
import { Attack, AttackType } from "../../attack";
import { Entity } from "../../entity";
import { ItemDescriptor, withProps } from "../items";

export const advantage: ItemDescriptor = {
	name: "Advantage",
	type: ItemType.StatusEffect,
	id: "advantage",
	description: "Grants +1 advantage to all attacks.",
	hidden: true,
	init: (owner: Entity): Item => {
		return {
			owner,
			transferrable: false,
			passives: {
				init: () => {
					owner.advantage += 1;
				},
				deinit: () => {
					owner.advantage -= 1;
				},
			},
			...withProps(advantage),
		};
	},
};

export const disadvantage: ItemDescriptor = {
	name: "Disadvantage",
	type: ItemType.StatusEffect,
	id: "disadvantage",
	description: "Grants -1 advantage to all attacks.",
	hidden: true,
	init: (owner: Entity): Item => {
		return {
			owner,
			transferrable: false,
			passives: {
				init: () => {
					owner.advantage -= 1;
				},
				deinit: () => {
					owner.advantage += 1;
				},
			},
			...withProps(disadvantage),
		};
	},
};
