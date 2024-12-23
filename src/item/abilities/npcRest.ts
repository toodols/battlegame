import { ItemType, Item, APPEAL } from "..";
import { TargetType, AttackType, UsageType } from "../../attack";
import { Entity } from "../../entity";
import { ItemDescriptor, withProps, items } from "../items";

export const npcRest: ItemDescriptor = {
	name: "Rest",
	type: ItemType.Ability,
	id: "npc-rest",
	description: "Npc resting ability that recovers and 4d6 energy.",
	init: (owner: Entity): Item => {
		return {
			owner,
			transferrable: false,

			actives: {
				default: {
					appeal: (self) =>
						(1 - self.owner.energy / self.owner.maxEnergy) *
						APPEAL.FAVORABLE,
					targetType: TargetType.Self,
					usageType: UsageType.PerTurn,
					use: (self, [_target]: Entity[]) => {
						const energyRecovery =
							owner.roll(6) +
							owner.roll(6) +
							owner.roll(6) +
							owner.roll(6);

						const energyGain =
							self.owner.recoverEnergy(energyRecovery);
						self.owner.game.io.onOutputEvent({
							type: "entity-recover-energy",
							entity: self.owner,
							amount: energyGain,
						});

						return { ok: true };
					},
				},
			},
			...withProps(npcRest),
		};
	},
};
