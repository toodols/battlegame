import { ItemType, Item, APPEAL, destroyItem } from "..";
import { TargetType } from "../../attack";
import { Entity } from "../../entity";
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
					usageType: "unlimited",
					use: (self, [target]) => {
						if (
							Math.random() <
							Math.max(0, 20 / (10 - target.health))
						) {
							self.owner.game.currentLevel!.setTeam(
								target,
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
