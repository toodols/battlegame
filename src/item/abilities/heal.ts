import { ItemType, Item, APPEAL } from "..";
import { targetIsEntities } from "../../assertions";
import { TargetType, AttackType, UsageType } from "../../attack";
import { Entity } from "../../entity";
import { Battle } from "../../level";
import { ItemDescriptor, items, withProps } from "../items";

export const heal: ItemDescriptor = {
	name: "Heal",
	type: ItemType.Ability,
	id: "heal",
	description: "At the cost of 30 energy, heals 4d6 health.",
	init: (owner: Entity): Item => {
		return {
			owner,
			transferrable: false,
			actives: {
				default: {
					usageEnergyCost: 0,
					targetType: TargetType.FriendlyOne,
					usageType: UsageType.PerTurn,
					appeal: (self) =>
						(1 - self.owner.health / self.owner.health) *
						APPEAL.HIGH,
					targeting: (self, active) => {
						return {
							type: "entities",
							entities: [self.owner],
						};
					},
					use: (self, target) => {
						if (!targetIsEntities(target)) {
							return { ok: false, error: "Invalid target" };
						}
						let entity = target.entities[0];
						let healing = {
							type: AttackType.Healing,
							gauge:
								owner.roll(6) +
								owner.roll(6) +
								owner.roll(6) +
								owner.roll(6),
							source: self.owner,
						};
						let res = entity.doDamage(entity, healing);
						self.owner.game.io.onOutputEvent({
							type: "entity-do-healing",
							target: entity,
							attack: res.attack,
							effectiveDamage: res.effectiveDamage,
						});
						return { ok: true };
					},
				},
			},
			...withProps(heal),
		};
	},
};
