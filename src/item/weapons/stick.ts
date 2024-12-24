import { ItemType, Item } from "..";
import { targetIsEntities } from "../../assertions";
import { TargetType, AttackType, UsageType } from "../../attack";
import { Entity } from "../../entity";
import { withProps, items, ItemDescriptor } from "../items";

export const stick: ItemDescriptor = {
	name: "Stick",
	type: ItemType.Weapon,
	id: "stick",
	description: "A simple stick. Does 2d6 damage.",
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
							type: AttackType.Physical,
							gauge: owner.roll(6) + owner.roll(6),
							source: self.owner,
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
			...withProps(stick),
		};
	},
};
