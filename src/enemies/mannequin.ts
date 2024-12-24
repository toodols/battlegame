import { EnemyDescriptor } from ".";
import { TargetType, UsageType } from "../attack";
import { Entity } from "../entity";
import { Game, Result } from "../game";
import { ItemType, cloneItem } from "../item";
import { ItemDescriptor, items, withProps } from "../item/items";
import { strike } from "../item/abilities/strike";
import { targetIsEntities } from "../assertions";
export const copy: ItemDescriptor = {
	name: "Copy",
	description: "Copies a random ability from a target. 3 Uses",
	id: "copy",
	type: ItemType.Ability,
	init: (owner: Entity) => {
		return {
			owner,
			actives: {
				default: {
					uses: 3,
					usageType: UsageType.PerTurn,
					targetType: TargetType.EnemyOne,
					usageEnergyCost: 30,
					use: (self, target): Result => {
						if (!targetIsEntities(target))
							return { ok: false, error: "Invalid target" };
						const entityTarget = target.entities[0];
						const candidates = entityTarget.items.filter(
							(item) => item.type === ItemType.Ability
						);
						const candidate =
							candidates[
								Math.floor(Math.random() * candidates.length)
							];
						let item = cloneItem(candidate);
						item.owner = self.owner;
						self.owner.addItem(item);
						return { ok: true };
					},
				},
			},
			...withProps(copy),
		};
	},
};
export const mannequin: EnemyDescriptor = {
	id: "mannequin",
	difficultyCost: 40,
	// midpoint 120
	minDifficultyPresence: -60,
	maxDifficultyPresence: 300,
	baseWeight: 10000000,
	init: (game: Game) => {
		const entity = new Entity(game);
		entity.name = "Mannequin";
		entity.maxHealth = 100;
		entity.health = 100;
		entity.speed = 100;
		entity.addItem(strike.init(entity));
		entity.addItem(copy.init(entity));
		return entity;
	},
};
