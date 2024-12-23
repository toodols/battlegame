import { ItemType, Item, APPEAL } from "..";
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
					use: (self, [target]: Entity[]) => {
						let attack = {
							type: AttackType.Physical,
							gauge: owner.roll(6) + owner.roll(6),
							source: self.owner,
						};
						let res = self.owner.doDamage(target, attack);
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
			...withProps(strike),
		};
	},
};
