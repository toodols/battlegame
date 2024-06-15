import { ItemType, Item } from "..";
import { Attack, AttackType } from "../../attack";
import { Entity } from "../../entity";
import { bounce } from "../abilities/bounce";
import { strike } from "../abilities/strike";
import { ItemDescriptor, withProps, items } from "../items";

export const undead: ItemDescriptor = {
	name: "Undead",
	type: ItemType.StatusEffect,
	id: "undead",
	description:
		"Takes 100% more damage from Light damage. On kill, summons a Zombie with MAX HP and SPD equal to half of the victim's MAX HP and SPD respectively and HP equal to 25% of MAX HP",
	hidden: true,
	init: (owner: Entity): Item => {
		return {
			owner,
			transferrable: false,
			passives: {
				onEntityKill: (self, target: Entity, attack: Attack) => {
					if (target.getItem("undead")) {
						return;
					}
					const entity = new Entity(target.game);
					entity.name = "Undead " + target.name;
					entity.health = target.maxHealth / 4;
					entity.maxHealth = target.maxHealth / 2;
					entity.speed = target.speed / 2;
					entity.addItem(undead.init(entity));
					if (target.getItem("slime-based")) {
						entity.addItem(bounce.init(entity));
					} else {
						entity.addItem(strike.init(entity));
					}
					target.game.currentLevel!.addEntity(
						entity,
						self.owner.team!
					);
					self.owner.game.eventBuffer.push({
						type: "message",
						message: target.name + " has become an undead.",
					});
				},
				onEntityDamaging: (self, attack: Attack) => {
					if (attack.type === AttackType.Light) {
						attack.scaleFactor! += 1;
					}
				},
			},
			...withProps(undead),
		};
	},
};
