import { ItemType, Item } from "..";
import { TargetType, AttackType, UsageType } from "../../attack";
import { Entity } from "../../entity";
import { ItemDescriptor, items, withProps } from "../items";
export const mist: ItemDescriptor = {
	name: "Mist",
	type: ItemType.StatusEffect,
	id: "mist",
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
			...withProps(mist),
		};
		return item;
	},
};
export const disperse: ItemDescriptor = {
	name: "Disperse",
	type: ItemType.Ability,
	id: "disperse",
	description: "Lose 10% MAX HP. Gain 1 stack of Mist: " + mist.description,
	init: (owner: Entity): Item => {
		return {
			owner,
			transferrable: false,
			actives: {
				default: {
					targetType: TargetType.Self,
					usageType: UsageType.PerTurn,
					usageEnergyCost: 50,
					use: (self, [target]: Entity[]) => {
						self.owner.getItem("mist").data.stacks += 1;
						self.owner.setMaxHealth(self.owner.maxHealth * 0.9);
						self.owner.game.io.onOutputEvent({
							type: "message",
							message: "You feel more free...",
						});
						return { ok: true };
					},
				},
			},
			...withProps(disperse),
		};
	},
};
