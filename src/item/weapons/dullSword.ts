import { ItemType, Item } from "..";
import { targetIsEntities } from "../../assertions";
import { TargetType, AttackType, UsageType } from "../../attack";
import { Entity } from "../../entity";
import { withProps, items, ItemDescriptor } from "../items";

export const dullSword: ItemDescriptor = {
	name: "Dull Sword",
	type: ItemType.Weapon,
	id: "dull-sword",
	description: "This sword looks like it's about to break.",
	init: (owner: Entity): Item => {
		return {
			owner,
			transferrable: false,
			actives: {
				sweep: {
					name: "Sweep",
					id: "sweep",
					usageEnergyCost: 20,
					description:
						"Sweep: At the cost of 20 energy, do 2d4 damage to all targets",
					targetType: TargetType.EnemyAll,
					usageType: UsageType.PerTurn,
					use: (self, target) => {
						if (!targetIsEntities(target))
							return { ok: false, error: "Invalid target" };
						for (const entity of target.entities) {
							let res = self.owner.doDamage(entity, {
								type: AttackType.Physical,
								gauge: owner.roll(4) + owner.roll(4),
								source: self.owner,
							});
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
				slash: {
					name: "Slash",
					id: "slash",
					description: "Slash: Do 4d4 damage to 1 target.",
					targetType: TargetType.EnemyOne,
					usageType: UsageType.PerTurn,
					usageEnergyCost: 0,
					use: (self, target) => {
						if (!targetIsEntities(target))
							return { ok: false, error: "Invalid target" };
						let res = self.owner.doDamage(target.entities[0], {
							type: AttackType.Physical,
							gauge:
								owner.roll(4) +
								owner.roll(4) +
								owner.roll(4) +
								owner.roll(4),
							source: self.owner,
						});
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
			...withProps(dullSword),
		};
	},
};
