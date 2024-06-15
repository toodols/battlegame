import { ItemType, Item } from "..";
import { TargetType } from "../../attack";
import { zombie } from "../../enemies/zombie";
import { Entity } from "../../entity";
import { items, withProps } from "../items";
import { spicy } from "../statuses/spicy";

export const zombieSpawnEgg = {
	name: "Zombie Spawn Egg",
	type: ItemType.Consumable,
	id: "zombie-spawn-egg",
	description: "On use, spawn a friendly zombie",
	baseShopCost: 12,
	baseShopWeight: 10,
	init: (owner: Entity): Item => {
		return {
			owner,
			transferrable: true,
			actives: {
				default: {
					targetType: TargetType.Self,
					usageType: "unlimited",
					use: (self, _targets) => {
						const entity = zombie.init(self.owner.game);
						entity.name = "Friendly " + entity.name;
						self.owner.game.currentLevel!.addEntity(
							entity,
							self.owner.team!
						);
						return { ok: true };
					},
					destroyedAfterUses: true,
				},
			},

			...withProps(zombieSpawnEgg),
		};
	},
};
