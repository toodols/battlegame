import { ItemType, Item } from "..";
import { TargetType, AttackType } from "../../attack";
import { Entity } from "../../entity";
import { withProps, items, ItemDescriptor, roll } from "../items";

export const throwingKnives: ItemDescriptor = {
	name: "Throwing Knives",
	type: ItemType.Weapon,
	ranged: true,
	id: "throwing-knives",
	description: "Ranged weapon with 3 charges. Deals 2d6 damage.",
	baseShopCost: 7,
	baseShopWeight: 10,
	init: (owner: Entity): Item => {
		return {
			owner,
			transferrable: false,
			actives: {
				default: {
					targetType: TargetType.EnemyOne,
					uses: 3,
					usageType: "per-item-per-turn",
					destroyedAfterUses: true,
					use: (self, [target]: Entity[]) => {
						let res = self.owner.doDamage(target, {
							type: AttackType.Physical,
							gauge: roll(6) + roll(6),
							source: self.owner,
						});
						self.owner.game.io.onOutputEvent({
							type: "entity-do-damage",
							target,
							attack: res.attack,
							effectiveDamage: res.effectiveDamage,
						});
						return { ok: true };
					},
				},
			},
			...withProps(throwingKnives),
		};
	},
};
