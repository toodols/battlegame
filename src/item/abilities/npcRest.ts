import { ItemType, Item, APPEAL } from "..";
import { TargetType, AttackType } from "../../attack";
import { Entity } from "../../entity";
import { ItemDescriptor, roll, withProps, items } from "../items";

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
					usageType: "per-turn",
					use: (self, [_target]: Entity[]) => {
						const energyRecovery =
							roll(6) + roll(6) + roll(6) + roll(6);

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
