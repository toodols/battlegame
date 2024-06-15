import { ItemType, Item } from "..";
import { Attack, AttackType } from "../../attack";
import { Entity } from "../../entity";
import { ItemDescriptor, withProps } from "../items";

export const fireBased: ItemDescriptor = {
	name: "Fire Based",
	type: ItemType.StatusEffect,
	id: "fire-based",
	description:
		"Takes 100% more damage from Water damage. Immune to Fire damage.",
	hidden: true,
	init: (owner: Entity): Item => {
		return {
			owner,
			transferrable: false,
			passives: {
				onEntityDamaging: (self, attack: Attack) => {
					if (attack.type === AttackType.Water) {
						attack.scaleFactor! += 1;
					} else if (attack.type === AttackType.Fire) {
						attack.gauge = 0;
					}
				},
			},
			...withProps(fireBased),
		};
	},
};

export const waterBased: ItemDescriptor = {
	name: "Water Based",
	type: ItemType.StatusEffect,
	id: "water-based",
	description: "Takes 50% less damage from Fire damage.",
	hidden: true,
	init: (owner: Entity): Item => {
		return {
			owner,
			transferrable: false,
			passives: {
				onEntityDamaging: (self, attack: Attack) => {
					if (attack.type === AttackType.Fire) {
						attack.scaleFactor! -= 0.5;
					}
				},
			},
			...withProps(waterBased),
		};
	},
};
