import { ItemType, Item } from "..";
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
					use: (self, [target]: Entity[]) => {
						target.addItem(weakness.init(target));
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
					use: (self, [target]: Entity[]) => {
						self.owner.doDamage(target, {
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
					use: (self, [target]: Entity[]) => {
						target.addItem(poisoned.init(target));
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
					use: (self, [target]: Entity[]) => {
						target.addItem(items.slowness.init(target));
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
