import { ItemType, Item } from "..";
import { TargetType, AttackType, UsageType } from "../../attack";
import { Entity } from "../../entity";
import { ItemDescriptor, withProps, items } from "../items";

export const rest: ItemDescriptor = {
	name: "Rest",
	type: ItemType.Ability,
	id: "rest",
	description: "A resting ability that recovers 2d6 health and 4d6 energy.",
	init: (owner: Entity): Item => {
		return {
			owner,
			transferrable: false,
			actives: {
				default: {
					targetType: TargetType.None,
					usageType: UsageType.PerTurn,
					use: (self, _) => {
						const healthRecovery = owner.roll(6) + owner.roll(6);
						const energyRecovery =
							owner.roll(6) +
							owner.roll(6) +
							owner.roll(6) +
							owner.roll(6);
						const res = self.owner.doDamage(self.owner, {
							type: AttackType.Healing,
							gauge: healthRecovery,
							source: self.owner,
						});
						self.owner.game.io.onOutputEvent({
							type: "entity-do-healing",
							target: self.owner,
							attack: res.attack,
							effectiveDamage: res.effectiveDamage,
						});

						// const energyGain =
						// 	self.owner.recoverEnergy(energyRecovery);

						// self.owner.game.io.onOutputEvent({
						// 	type: "entity-recover-energy",
						// 	entity: self.owner,
						// 	amount: energyGain,
						// });

						return { ok: true };
					},
				},
			},
			...withProps(rest),
		};
	},
};
