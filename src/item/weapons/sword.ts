import { ItemType, Item } from "..";
import { TargetType, AttackType } from "../../attack";
import { Entity } from "../../entity";
import { withProps, items, ItemDescriptor, roll } from "../items";

export const dullSword: ItemDescriptor = {
	name: "Dull Sword",
	type: ItemType.Weapon,
	id: "dull-sword",
	description:
		"A basic sword. Slash: Do 3d6 damage to 1 target. Sweep: At the cost of 20 energy, do 2d4 damage to all targets",
	init: (owner: Entity): Item => {
		return {
			owner,
			transferrable: false,
			actives: {
				sweep: {
					name: "Sweep",
					id: "sweep",
					usageEnergyCost: 20,
					targetType: TargetType.EnemyAll,
					usageType: "per-turn",
					use: (self, targets: Entity[]) => {
						for (const target of targets) {
							let res = self.owner.doDamage(target, {
								type: AttackType.Physical,
								gauge: roll(4) + roll(4),
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
					usageEnergyCost: 0,
					use: (self, [target]: Entity[]) => {
						let res = self.owner.doDamage(target, {
							type: AttackType.Physical,
							gauge: roll(6) + roll(6) + roll(6),
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
			...withProps(dullSword),
		};
	},
};
