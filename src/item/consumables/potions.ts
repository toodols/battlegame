import { ItemType, Item } from "..";
import { targetIsEntities } from "../../assertions";
import { AttackType, TargetType, UsageType } from "../../attack";
import { Entity } from "../../entity";
import { ItemDescriptor, items, withProps } from "../items";
import { poisoned } from "../statuses/poisoned";
import { weakness } from "../statuses/weakness";

export const weaknessPotion: ItemDescriptor = {
	name: "Weakness Potion",
	type: ItemType.Consumable,
	id: "weakness-potion",
	baseShopCost: 5,
	baseShopWeight: 5,
	description: "On use, apply 'Weakness' status effect to target enemy.",
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
						target.entities[0].addItem(
							weakness.init(target.entities[0])
						);
						return { ok: true };
					},
					destroyedAfterUses: true,
				},
			},
			...withProps(weaknessPotion),
		};
	},
};

export const healPotion: ItemDescriptor = {
	name: "Heal Potion",
	type: ItemType.Consumable,
	id: "heal-potion",
	baseShopCost: 5,
	baseShopWeight: 5,
	description: "On use, heals 30 health to the target.",
	init: (owner: Entity): Item => {
		return {
			owner,
			transferrable: true,
			actives: {
				default: {
					targetType: TargetType.FriendlyOne,
					usageType: UsageType.Unlimited,
					use: (self, target) => {
						if (!targetIsEntities(target))
							return { ok: false, error: "Invalid target" };
						self.owner.doDamage(target.entities[0], {
							gauge: 30,
							type: AttackType.Healing,
							source: self.owner,
						});
						return { ok: true };
					},
					destroyedAfterUses: true,
				},
			},
			...withProps(healPotion),
		};
	},
};

export const poisonPotion: ItemDescriptor = {
	name: "Poison Potion",
	type: ItemType.Consumable,
	id: "poison-potion",
	baseShopCost: 5,
	baseShopWeight: 5,
	description: "On use, apply 'Poison' status effect to target enemy.",
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
						target.entities[0].addItem(
							poisoned.init(target.entities[0])
						);
						return { ok: true };
					},
					destroyedAfterUses: true,
				},
			},
			...withProps(poisonPotion),
		};
	},
};

export const slownessPotion: ItemDescriptor = {
	name: "Slowness Potion",
	type: ItemType.Consumable,
	id: "slowness-potion",
	baseShopCost: 5,
	baseShopWeight: 5,
	description: "On use, apply 'Slowness' status effect to target enemy.",
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
						target.entities[0].addItem(
							items.slowness.init(target.entities[0])
						);
						return { ok: true };
					},
					destroyedAfterUses: true,
				},
			},
			...withProps(slownessPotion),
		};
	},
};

export const potions = [
	weaknessPotion,
	poisonPotion,
	slownessPotion,
	healPotion,
];
