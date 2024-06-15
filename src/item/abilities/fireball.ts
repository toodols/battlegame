import { ItemType, Item } from "..";
import { TargetType, AttackType } from "../../attack";
import { Entity } from "../../entity";
import { ItemDescriptor, roll, withProps, items } from "../items";

export const fireball: ItemDescriptor = {
	name: "Fireball",
	type: ItemType.Ability,
	id: "fireball",
	description: "A fiery explosion that deals 2d6 damage to all enemies.",
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
								type: AttackType.Fire,
								gauge: roll(6) + roll(6),
								source: self.owner,
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
			...withProps(fireball),
		};
	},
};
