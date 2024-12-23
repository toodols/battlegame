import { ItemType, Item, APPEAL } from "..";
import { TargetType, AttackType, UsageType } from "../../attack";
import { Entity } from "../../entity";
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
						if (self.owner.health < 30) {
							return [self.owner];
						}
					},
					use: (self, [target]: Entity[]) => {
						let healing = {
							type: AttackType.Healing,
							gauge:
								owner.roll(6) +
								owner.roll(6) +
								owner.roll(6) +
								owner.roll(6),
							source: self.owner,
						};
						let res = target.doDamage(target, healing);
						self.owner.game.io.onOutputEvent({
							type: "entity-do-healing",
							target,
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
