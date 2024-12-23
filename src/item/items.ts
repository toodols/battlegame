import { Item, ItemType, canUseItemActive, destroyItem } from ".";
import { AttackType, TargetType } from "../attack";
import { Entity } from "../entity";
import { bounce } from "./abilities/bounce";
import { brew } from "./abilities/brew";
import { chiliPeppers } from "./consumables/chiliPeppers";
import { heal } from "./abilities/heal";
import { poisoned } from "./statuses/poisoned";
import {
	healPotion,
	poisonPotion,
	slownessPotion,
	weaknessPotion,
} from "./consumables/potions";
import { rest } from "./abilities/rest";
import { slowness } from "./statuses/slowness";
import { spicy } from "./statuses/spicy";
import { stick } from "./weapons/stick";
import { undead } from "./statuses/undead";
import { dullSword } from "./weapons/dullSword";



export interface ItemDescriptor {
	name: string;
	id: string;
	type: ItemType;
	description: string;
	minShopDifficultyPresence?: number;
	maxShopDifficultyPresence?: number;
	baseShopWeight?: number;
	baseShopCost?: number;
	hidden?: boolean;
	ranged?: boolean;
	init: (owner: Entity) => Item;
}
export function withProps(item: ItemDescriptor) {
	return {
		name: item.name,
		id: item.id,
		type: item.type,
		description: item.description,
		hidden: item.hidden,
		ranged: item.ranged,
	};
}
export const items: Record<string, ItemDescriptor> = {
	spicy,
	"chili-peppers": chiliPeppers,
	stick,
	undead,
	rest,
	bounce,
	heal,
	brew,
	"heal-potion": healPotion,
	"weakness-potion": weaknessPotion,
	"poison-potion": poisonPotion,
	"slowness-potion": slownessPotion,
	poisoned,
	slowness,
	sword: dullSword,
};
