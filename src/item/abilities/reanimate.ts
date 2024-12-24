import { ItemType, Item } from "..";
import { TargetType, AttackType, UsageType } from "../../attack";
import { zombie } from "../../enemies/zombie";
import { Entity } from "../../entity";
import { Battle } from "../../level";
import { ItemDescriptor, items, withProps } from "../items";

export const reanimate: ItemDescriptor = {
	name: "Reanimate",
	type: ItemType.Ability,
	id: "reanimate",
	description: "At the cost of 40 energy, summon a Zombie.",
	init: (owner: Entity): Item => {
		return {
			owner,
			transferrable: false,
			actives: {
				default: {
					usageEnergyCost: 50,
					targetType: TargetType.None,
					usageType: UsageType.PerTurn,
					use: (self, _) => {
						const entity = zombie.init(self.owner.game);
						entity.name = "Reanimated " + entity.name;
						(self.owner.game.level as Battle).addEntity(
							entity,
							self.owner.team!
						);

						return { ok: true };
					},
				},
			},
			...withProps(reanimate),
		};
	},
};
