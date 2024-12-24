import { ItemType, Item, APPEAL } from "..";
import { targetIsEntities } from "../../assertions";
import { TargetType, AttackType, UsageType } from "../../attack";
import { Entity } from "../../entity";
import { ItemDescriptor, withProps, items } from "../items";

export const strike: ItemDescriptor = {
	name: "Strike",
	type: ItemType.Ability,
	id: "strike",
	description: "A deals 2d6 damage.",
	init: (owner: Entity): Item => {
		return {
			owner,
			transferrable: false,
			actives: {
				default: {
					appeal: () => APPEAL.LOW,
					targetType: TargetType.EnemyOne,
					usageType: UsageType.PerTurn,
					use: (self, target) => {
						if (!targetIsEntities(target))
							return { ok: false, error: "Invalid target" };
						let attack = {
							type: AttackType.Physical,
							gauge: owner.roll(6) + owner.roll(6),
							source: self.owner,
						};
						let res = self.owner.doDamage(
							target.entities[0],
							attack
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
			...withProps(strike),
		};
	},
};
