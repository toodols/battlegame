import { ItemType, Item } from "..";
import { targetIsEntities } from "../../assertions";
import { TargetType, AttackType, UsageType, Target } from "../../attack";
import { Entity } from "../../entity";
import { ItemDescriptor, withProps, items } from "../items";

export const fireball: ItemDescriptor = {
	name: "Fireball",
	type: ItemType.Ability,
	id: "fireball",
	description:
		"At the cost of 30, shoot a fiery explosion that deals 2d6 damage to all enemies.",
	init: (owner: Entity): Item => {
		return {
			owner,
			transferrable: false,
			actives: {
				default: {
					targetType: TargetType.EnemyAll,
					usageType: UsageType.PerTurn,
					usageEnergyCost: 30,
					use: (self, target: Target) => {
						if (!targetIsEntities(target))
							return { ok: false, error: "Invalid target" };
						for (const entity of target.entities) {
							let damage = {
								type: AttackType.Fire,
								gauge: owner.roll(6) + owner.roll(6),
								source: self.owner,
							};
							let res = self.owner.doDamage(entity, damage);
							self.owner.game.io.onOutputEvent({
								type: "entity-do-damage",
								target: entity,
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
