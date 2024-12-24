import { ItemType, Item } from "..";
import { targetIsEntities, targetIsNumber } from "../../assertions";
import { TargetType, AttackType, UsageType } from "../../attack";
import { Entity } from "../../entity";
import { ItemDescriptor, withProps, items } from "../items";

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
					usageType: UsageType.PerTurn,
					use: (self, target) => {
						if (!targetIsEntities(target))
							return { ok: false, error: "Invalid target" };
						let damage = {
							type: AttackType.Necrotic,
							gauge: owner.roll(6),
						};
						let res = self.owner.doDamage(
							target.entities[0],
							damage
						);
						self.owner.game.io.onOutputEvent({
							type: "entity-do-damage",
							target: target.entities[0],
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
