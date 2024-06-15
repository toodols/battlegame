import { Item, ItemType, destroyItem } from "..";
import { AttackType } from "../../attack";
import { Entity } from "../../entity";
import { withProps } from "../items";
import { Desirability } from "..";

// export const magePassive = {
// 	name: "Mage Passive",
// 	id: "mage-passive",
// 	type: ItemType.StatusEffect,
// 	desirability: Desirability.Positive,
// 	description: "Regenerates 2x extra energy",
// 	init: (owner: Entity): Item => {
// 		const item: Item = {
// 			owner,
// 			passives: {
// 				onEntityGainEnergy: (value) => {
// 					value.gauge *= 2;
// 				},
// 			},
// 			...withProps(magePassive),
// 		};
// 		return item;
// 	},
// };
