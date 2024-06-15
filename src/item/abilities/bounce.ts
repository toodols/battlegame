import { ItemType, Item } from "..";
import { TargetType, AttackType } from "../../attack";
import { Entity } from "../../entity";
import { ItemDescriptor, roll, withProps, items } from "../items";

export const bounce: ItemDescriptor = {
	name: "Bounce",
	type: ItemType.Ability,
	id: "bounce",
	description: "A bouncing ability that deals 1d6 damage.",
	init: (owner: Entity): Item => {
		return {
			owner,
			transferrable: false,
			actives: {
				default: {
					targetType: TargetType.EnemyOne,
					usageType: "per-turn",
					use: (self, [target]: Entity[]) => {
						let damage = {
							type: AttackType.Physical,
							gauge: roll(6),
						};
						let res = self.owner.doDamage(target, damage);
						self.owner.game.io.onOutputEvent({
							type: "entity-do-damage",
							target,
							attack: res.attack,
							effectiveDamage: res.effectiveDamage,
						});
						return { ok: true };
					},
				},
			},
			...withProps(bounce),
		};
	},
};
