import { ItemType, Item } from "..";
import { TargetType, AttackType } from "../../attack";
import { Entity } from "../../entity";
import { ItemDescriptor, roll, withProps } from "../items";

export const smash: ItemDescriptor = {
	name: "Smash",
	type: ItemType.Ability,
	id: "smash",
	description: "Deals 2d6 physical damage to every entity.",
	init: (owner: Entity): Item => {
		return {
			owner,
			transferrable: false,
			actives: {
				default: {
					targetType: TargetType.EnemyAll,
					usageType: "per-turn",
					usageEnergyCost: 20,
					use: (self, targets: Entity[]) => {
						for (const target of targets) {
							let damage = {
								type: AttackType.Physical,
								gauge: roll(6) + roll(6),
							};
							let res = self.owner.doDamage(target, damage);
							self.owner.game.io.onOutputEvent({
								type: "entity-do-damage",
								target,
								attack: res.attack,
								effectiveDamage: res.effectiveDamage,
							});
						}
						return { ok: true };
					},
				},
			},
			...withProps(smash),
		};
	},
};
