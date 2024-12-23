import { ItemType, Item, APPEAL } from "..";
import { TargetType, AttackType, UsageType } from "../../attack";
import { Entity } from "../../entity";
import { ItemDescriptor, withProps, items } from "../items";

export const transfer: ItemDescriptor = {
	name: "Transfer",
	type: ItemType.Ability,
	id: "transfer",
	description: "Transfers 30 energy to a friendly target.",
	init: (owner: Entity): Item => {
		return {
			owner,
			transferrable: false,
			actives: {
				default: {
					appeal: () => APPEAL.LOW,
					usageEnergyCost: 30,
					targetType: TargetType.FriendlyOne,
					usageType: UsageType.PerTurn,
					use: (self, [target]: Entity[]) => {
						const res = target.recoverEnergy(30);
						self.owner.game.io.onOutputEvent({
							type: "message",
							message: `Gave ${res} to **${target.name}**`,
						});
						return { ok: true };
					},
				},
			},
			...withProps(transfer),
		};
	},
};
