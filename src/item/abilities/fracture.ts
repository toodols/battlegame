import { ItemType, Item } from "..";
import { TargetType, AttackType } from "../../attack";
import { Entity } from "../../entity";
import { ItemDescriptor, items, roll, withProps } from "../items";
export const fragment: ItemDescriptor = {
	name: "Fragment",
	type: ItemType.StatusEffect,
	id: "fragment",
	description:
		"Increases your speed by 10 for each stack you have. Starts with 2 stacks.",
	init: (owner: Entity): Item => {
		const item: Item = {
			owner,
			transferrable: false,
			data: { stacks: 2 },
			passives: {
				calculateEntitySpeed: (item, speed) => {
					speed.flatFactor += 10 * item.data.stacks;
				},
			},
			...withProps(fragment),
		};
		return item;
	},
};
export const fracture: ItemDescriptor = {
	name: "Fracture",
	type: ItemType.Ability,
	id: "fracture",
	description:
		"Lose 10% MAX HP. Gain 1 stack of Fragment: " + fragment.description,
	init: (owner: Entity): Item => {
		return {
			owner,
			transferrable: false,
			actives: {
				default: {
					targetType: TargetType.Self,
					usageType: "per-turn",
					usageEnergyCost: 50,
					use: (self, [target]: Entity[]) => {
						self.owner.getItem("fragment").data.stacks += 1;
						self.owner.setMaxHealth(self.owner.maxHealth * 0.9);
						self.owner.game.io.onOutputEvent({
							type: "message",
							message: "You feel more free...",
						});
						return { ok: true };
					},
				},
			},
			...withProps(fracture),
		};
	},
};
