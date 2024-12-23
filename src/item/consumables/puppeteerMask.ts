import { ItemType, Item, APPEAL, destroyItem } from "..";
import { targetIsEntities } from "../../assertions";
import { TargetType, UsageType } from "../../attack";
import { Entity } from "../../entity";
import { Battle } from "../../level";
import { items, withProps } from "../items";
import { spicy } from "../statuses/spicy";

export const puppeteerMask = {
	name: "Puppeteer Mask",
	type: ItemType.Consumable,
	id: "puppeteer-mask",
	description:
		"Converts an enemy to your side. Success rate is equal to 20/(10-target hp) ",
	baseShopCost: 13,
	baseShopWeight: 10,
	init: (owner: Entity): Item => {
		return {
			owner,
			transferrable: true,
			actives: {
				default: {
					targetType: TargetType.EnemyOne,
					usageType: UsageType.Unlimited,
					use: (self, target) => {
						if (!targetIsEntities(target))
							return { ok: false, error: "Invalid target" };
						if (
							Math.random() <
							Math.max(0, 20 / (10 - target.entities[0].health))
						) {
							(self.owner.game.level as Battle).setTeam(
								target.entities[0],
								self.owner.team!
							);
							self.owner.game.io.onOutputEvent({
								type: "message",
								message: "Successs",
							});
						} else {
							self.owner.game.io.onOutputEvent({
								type: "message",
								message: "Fail",
							});
						}
						return { ok: true };
					},
					destroyedAfterUses: true,
				},
			},

			...withProps(puppeteerMask),
		};
	},
};
