import { ItemType, Item } from "..";
import { TargetType, AttackType } from "../../attack";
import { Entity } from "../../entity";
import { withProps, items, ItemDescriptor, roll } from "../items";

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
				sweep: {
					name: "Sweep",
					id: "sweep",
					description: "Deals 2d6 damage to all targets",
					usageEnergyCost: 20,
					targetType: TargetType.EnemyAll,
					usageType: "per-turn",
					use: (self, targets: Entity[]) => {
						for (const target of targets) {
							let res = self.owner.doDamage(target, {
								type: AttackType.Physical,
								gauge: roll(6) + roll(6),
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
					usageType: "per-turn",
					description: "Deals 4d6 damage to all targets",
					usageEnergyCost: 0,
					use: (self, [target]: Entity[]) => {
						let res = self.owner.doDamage(target, {
							type: AttackType.Physical,
							gauge: roll(6) + roll(6) + roll(6) + roll(6),
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
