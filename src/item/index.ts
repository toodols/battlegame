import { AttackResult, Entity } from "../entity";
import { Target } from "../attack";
import { Attack, TargetType, UsageType } from "../attack";
import { Result } from "../game";
import { Battle } from "../level";
export enum ItemType {
	StatusEffect,
	Weapon,
	Consumable,
	Ability,
	Equipment,
	ClassPassive,
}
export enum Desirability {
	Positive,
	Negative,
	Neutral,
}

// makes ai more likely to pick a certain chose
export const APPEAL = {
	CRITICAL: 100,
	HIGH: 40,
	FAVORABLE: 30,
	NORMAL: 20,
	LOW: 10,
	NO: 0,
};

export const PASSIVE_PRIORITY = {
	HIGH: 40,
};

export interface Item {
	owner: Entity;
	id: string;
	name: string;
	level?: number;
	type: ItemType;
	ranged?: boolean;
	description: string;
	transferrable?: boolean; // false by default
	hidden?: boolean; // false by default
	turnsUntilDestroyed?: number;
	actives?: Record<string, Active>;
	passives?: Passives;
	passivePriority?: number;
	data?: any;
}

export function cloneActive(active: Active) {
	const newActive: any = {};
	for (const k in active) {
		newActive[k] = active[k as keyof Active];
	}
	return newActive;
}

export function cloneItem(item: Item): Item {
	const newItem: any = {};
	for (const k in item) {
		if (k === "owner") {
			// do nothing
		} else if (k === "actives") {
			const newActives: any = {};
			for (const name in item.actives) {
				newActives[name] = cloneActive(item.actives[name]);
			}
			newItem.actives = newActives;
		} else {
			newItem[k] = item[k as keyof Item];
		}
	}
	return newItem;
}

export function destroyItem(item: Item) {
	item.passives?.deinit?.(item);
	item.owner.items.forEach((i) => i.passives?.onEntityLoseItem?.(i, item));
	item.owner.items = item.owner.items.filter((i) => i !== item);
}
export function canUseItemActive(item: Item, active: Active): Result {
	const game = item.owner.game;

	if (!active) {
		throw new Error("no active");
	}
	if (active.wasUsedThisTurn) {
		return {
			ok: false,
			error: "Item was already used this turn",
		};
	}
	if (active.usageEnergyCost && item.owner.energy < active.usageEnergyCost) {
		return {
			ok: false,
			error: `Not enough energy. ${item.owner.energy} / ${active.usageEnergyCost}`,
		};
	}
	if (active.uses !== undefined && active.uses === 0) {
		return { ok: false, error: "Item is out of uses" };
	}
	return active.canUse?.() || { ok: true };
}

export function useItemActive(
	item: Item,
	active: Active,
	target: Target
): Result {
	const game = item.owner.game;
	if (!active) {
		throw new Error("no active");
	}
	if (active.wasUsedThisTurn) {
		return { ok: false, error: "Item was already used this turn" };
	}
	if (target.type == "entities") {
		target.entities = target.entities.filter(
			(t) => t !== undefined && t.isAlive()
		);
		// filter out dead enemies
		if (active.targetType === TargetType.EnemyAll) {
			target.entities = (item.owner.game.level as Battle)
				.getEnemiesOf(item.owner)
				.filter((entity) => entity.isAlive());
		} else if (active.targetType === TargetType.FriendlyAll) {
			target.entities = item.owner.team!.filter((entity) =>
				entity.isAlive()
			);
		}

		// bad targets?
		if (
			(active.targetType === TargetType.EnemyOne &&
				target.entities[0].team !==
					(game.level as Battle).getEnemiesOf(item.owner)) ||
			(active.targetType === TargetType.FriendlyOne &&
				target.entities[0].team !== item.owner.team)
		) {
			return { ok: false, error: "Bad Targets" };
		}
	}
	if (active.usageEnergyCost) {
		const consumeEnergyResult = item.owner.consumeEnergy(
			active.usageEnergyCost
		);
		if (!consumeEnergyResult.ok) {
			return consumeEnergyResult;
		}
	}

	if (active.usageType === UsageType.PerTurn) {
	} else if (active.usageType === UsageType.PerItemPerTurn) {
		active.wasUsedThisTurn = true;
	}
	active.use(item, target);
	item.owner.items.forEach((i) =>
		i.passives?.onEntityUseItem?.(i, item, active, target)
	);
	if (active.uses !== undefined) {
		active.uses -= 1;
		if (active.uses === 0 && active.destroyedAfterUses) {
			destroyItem(item);
		}
	} else if (active.destroyedAfterUses) {
		destroyItem(item);
	}
	if (active.usageType === UsageType.PerTurn) {
		item.owner.endTurnFlag = true;
	} else if (active.usageType === UsageType.PerItemPerTurn) {
	}
	return { ok: true };
}

export interface Passives {
	init?: (self: Item) => void;
	deinit?: (self: Item) => void;
	onEntityDeath?: (self: Item, res: AttackResult) => void;
	onEntityKill?: (self: Item, target: Entity, damage: Attack) => void;
	onLevelEnd?: (self: Item) => void;
	onLevelStart?: (self: Item) => void;
	onEntityCreditsChanged?: (self: Item, old: number) => void;
	onEntityMaxHealthChanged?: (self: Item, old: number) => void;
	onEntityTurnStart?: (self: Item) => void;
	onEntityTurnEnd?: (self: Item) => void;

	onEntityRecoverEnergy?: (self: Item, energy: { gauge: number }) => void;
	calculateEntitySpeed?: (
		self: Item,
		speed: {
			scaleFactor: number;
			flatFactor: number;
			gauge: number;
		}
	) => void;

	// This entity is being damaged
	onEntityDamaging?: (self: Item, damage: Attack) => void;
	// This entity has been damaged
	onEntityDamaged?: (self: Item, result: AttackResult) => void;

	onEntityGainItem?: (self: Item, item: Item) => void;
	onEntityLoseItem?: (self: Item, item: Item) => void;
	onEntityUseItem?: (
		self: Item,
		item: Item,
		active: Active,
		target: Target
	) => void;

	onEntityDoHealing?: (self: Item, target: Entity, healing: Attack) => void;
	onEntityDidHealing?: (
		self: Item,
		target: Entity,
		result: AttackResult
	) => void;

	onEntityHealing?: (self: Item, healing: Attack) => void;
	onEntityHealed?: (self: Item, result: AttackResult) => void;

	onEntityDoDamage?: (self: Item, target: Entity, damage: Attack) => void;
	onEntityDidDamage?: (
		self: Item,
		target: Entity,
		result: AttackResult
	) => void;
}

export interface Active {
	wasUsedThisTurn?: boolean;
	targetType: TargetType;
	usageType: UsageType;
	description?: string;
	canUse?: () => Result;
	// undefined to defer to random selection
	targeting?: (item: Item, active: Active) => Target;
	usageEnergyCost?: number;
	name?: string;
	appeal?: (self: Item) => number;
	id?: string;
	uses?: number;
	destroyedAfterUses?: boolean;
	use: (self: Item, target: Target) => Result;
}
