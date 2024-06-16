import { ItemType, Item } from "..";
import { TargetType, AttackType } from "../../attack";
import { zombie } from "../../enemies/zombie";
import { Entity } from "../../entity";
import { ItemDescriptor, items, roll, withProps } from "../items";

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
					usageEnergyCost: 40,
					targetType: TargetType.Self,
					usageType: "per-turn",
					use: (self, _target: Entity[]) => {
						const entity = zombie.init(self.owner.game);
						entity.name = "Reanimated " + entity.name;
						self.owner.game.currentLevel!.addEntity(
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
