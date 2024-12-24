import { Item, ItemType } from "..";
import { targetIsNumber } from "../../assertions";
import { TargetType, UsageType } from "../../attack";
import { Entity } from "../../entity";
import { ItemDescriptor, withProps } from "../items";

export const piggyBank: ItemDescriptor = {
	name: "Piggy Bank",
	id: "piggy-bank",
	description:
		"Deposit credits. Gains 15% interest each level (rounded down). Can be broken to withdrawl all the credits.",
	type: ItemType.Equipment,
	baseShopCost: 15,
	baseShopWeight: 10,
	init: (owner: Entity): Item => {
		return {
			data: {
				credits: 0,
			},
			owner,
			passives: {
				onLevelEnd: (self) => {
					self.data.credits = Math.floor(self.data.credits * 1.15);
				},
			},
			actives: {
				deposit: {
					usageType: UsageType.Unlimited,
					targetType: TargetType.Number,
					targeting: (self) => {
						return {
							type: "number",
							value: Math.floor(
								Math.random() * (self.owner.credits + 1)
							),
						};
					},
					use: (self, target) => {
						if (!targetIsNumber(target))
							return { ok: false, error: "Invalid target" };
						const res = self.owner.consumeCredits(target.value);
						if (!res.ok) return res;

						self.data.credits += target.value;
						self.owner.game.io.onOutputEvent({
							type: "message",
							message: `Deposited ${target.value} credits`,
						});
						return { ok: true };
					},
				},
				withdraw: {
					usageType: UsageType.Unlimited,
					destroyedAfterUses: true,
					targetType: TargetType.None,
					use: (self, target) => {
						if (!targetIsNumber(target))
							return { ok: false, error: "Invalid target" };
						self.data.credits -= target.value;
						self.owner.setCredits(self.data.credits + target.value);
						self.owner.game.io.onOutputEvent({
							type: "message",
							message: `Withdrew ${target.value} credits`,
						});
						return { ok: true };
					},
				},
			},
			...withProps(piggyBank),
		};
	},
};
