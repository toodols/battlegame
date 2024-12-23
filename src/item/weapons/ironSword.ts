import { ItemType, Item } from "..";
import { TargetType, AttackType, UsageType } from "../../attack";
import { Entity } from "../../entity";
import { withProps, items, ItemDescriptor, } from "../items";

export const ironSword: ItemDescriptor = {
	name: "Iron Sword",
	type: ItemType.Weapon,
	id: "iron-sword",
	description: "A basic sword.",
	init: (owner: Entity): Item => {
		return {
			owner,
			transferrable: false,
			actives: {
				stun: {
					name: "stun",
					id: "stun",
					description:
						"50 / (target max hp - 5) chance to reduces an enemy's action value by 50. ",
					usageEnergyCost: 30,
					targetType: TargetType.EnemyOne,
					usageType: UsageType.PerTurn,
					use: (self, [target]: Entity[]) => {
						if (50 / (target.maxHealth - 10)) {
							target.actionValue -= 50;
						}
						return { ok: true };
					},
				},
				sweep: {
					name: "Sweep",
					id: "sweep",
					description: "Deals 2d6 damage to all targets",
					usageEnergyCost: 30,
					targetType: TargetType.EnemyAll,
					usageType: UsageType.PerTurn,
					use: (self, targets: Entity[]) => {
						for (const target of targets) {
							let res = self.owner.doDamage(target, {
								type: AttackType.Physical,
								gauge: owner.roll(6) + owner.roll(6),
								source: self.owner,
							});
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
				slash: {
					name: "Slash",
					id: "slash",
					targetType: TargetType.EnemyOne,
					usageType: UsageType.PerTurn,
					description: "Deals 4d6 damage to all targets",
					usageEnergyCost: 0,
					use: (self, [target]: Entity[]) => {
						let res = self.owner.doDamage(target, {
							type: AttackType.Physical,
							gauge:
								owner.roll(6) +
								owner.roll(6) +
								owner.roll(6) +
								owner.roll(6),
							source: self.owner,
						});
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
			...withProps(ironSword),
		};
	},
};
