import { ItemType, Item, destroyItem } from "..";
import { AttackType } from "../../attack";
import { Entity } from "../../entity";
import { items, roll, withProps } from "../items";

export const spicy = {
	name: "Spicy",
	id: "spicy",
	type: ItemType.StatusEffect,
	description:
		"Take 3d6 nonlethal piercing damage each turn for 3 turns. Double all outgoing damage.",
	init: (owner: Entity): Item => {
		return {
			owner,
			turnsUntilDestroyed: 3,
			passives: {
				init: (self) => {
					const res = self.owner.takeDamage({
						source: null,
						gauge: roll(6) + roll(6) + roll(6),
						lethal: false,
						type: AttackType.Piercing,
					});
					self.owner.game.io.onOutputEvent({
						type: "message",
						message:
							"Spicy did " +
							res.effectiveDamage +
							" to " +
							self.owner.name,
					});
				},
				onEntityTurnStart: (self) => {
					const res = self.owner.takeDamage({
						source: null,
						gauge: roll(6) + roll(6) + roll(6),
						lethal: false,
						type: AttackType.Piercing,
					});
					self.owner.game.io.onOutputEvent({
						type: "message",
						message:
							"Spicy did " +
							res.effectiveDamage +
							" to " +
							self.owner.name,
					});
				},
				onEntityDoDamage: (self, target, damage) => {
					damage.scaleFactor! += 1;
				},
			},
			...withProps(spicy),
		};
	},
};
