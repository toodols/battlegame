import { ItemType, Item } from "..";
import { TargetType, AttackType } from "../../attack";
import { Entity } from "../../entity";
import { ItemDescriptor, roll, withProps, items } from "../items";

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
					targetType: TargetType.EnemyOne,
					usageType: "per-turn",
					use: (self, [target]: Entity[]) => {
						let attack = {
							type: AttackType.Physical,
							gauge: roll(6) + roll(6),
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
