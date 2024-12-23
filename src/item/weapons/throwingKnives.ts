import { ItemType, Item } from "..";
import { TargetType, AttackType, UsageType } from "../../attack";
import { Entity } from "../../entity";
import { withProps, items, ItemDescriptor, } from "../items";

export const throwingKnives: ItemDescriptor = {
	name: "Throwing Knives",
	type: ItemType.Weapon,
	ranged: true,
	id: "throwing-knives",
	description: "Ranged weapon with 3 charges. Deals 3d6 damage.",
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
					usageType: UsageType.PerItemPerTurn,
					destroyedAfterUses: true,
					use: (self, [target]: Entity[]) => {
						let res = self.owner.doDamage(target, {
							type: AttackType.Physical,
							gauge:
								owner.roll(6) + owner.roll(6) + owner.roll(6),
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
