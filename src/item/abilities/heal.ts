import { ItemType, Item } from "..";
import { TargetType, AttackType } from "../../attack";
import { Entity } from "../../entity";
import { ItemDescriptor, items, roll, withProps } from "../items";

export const heal: ItemDescriptor = {
	name: "Heal",
	type: ItemType.Ability,
	id: "heal",
	description: "At the cost of 20 energy, heals 4d6 health.",
	init: (owner: Entity): Item => {
		return {
			owner,
			transferrable: false,
			actives: {
				default: {
					usageEnergyCost: 0,
					targetType: TargetType.FriendlyOne,
					usageType: "per-turn",
					use: (self, [target]: Entity[]) => {
						let healing = {
							type: AttackType.Healing,
							gauge: roll(6) + roll(6) + roll(6) + roll(6),
							source: self.owner,
						};
						let res = target.doDamage(target, healing);
						self.owner.game.io.onOutputEvent({
							type: "entity-do-healing",
							target,
							attack: res.attack,
							effectiveDamage: res.effectiveDamage,
						});
						return { ok: true };
					},
				},
			},
			...withProps(heal),
		};
	},
};
