import { ItemType } from "..";
import { EnemyDescriptor } from "../../enemies";
import { ItemDescriptor, withProps } from "../items";

export const slimeBased: ItemDescriptor = {
	id: "slime-based",
	name: "Slime Based",
	type: ItemType.StatusEffect,
	description: "",
	init: (owner) => {
		return {
			owner,
			...withProps(slimeBased),
		};
	},
};
