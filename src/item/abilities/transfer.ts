import { ItemType, Item, APPEAL } from "..";
import { targetIsEntities } from "../../assertions";
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
					use: (self, target) => {
						if (!targetIsEntities(target))
							return { ok: false, error: "Invalid target" };
						const res = target.entities[0].recoverEnergy(30);
						self.owner.game.io.onOutputEvent({
							type: "message",
							message: `Gave ${res} to **${target.entities[0].name}**`,
						});
						return { ok: true };
					},
				},
			},
			...withProps(transfer),
		};
	},
};
