import { ItemType, Item } from "..";
import { TargetType } from "../../attack";
import { Entity } from "../../entity";
import { ItemDescriptor, items, withProps } from "../items";
import {
	healPotion,
	poisonPotion,
	slownessPotion,
	weaknessPotion,
} from "../consumables/potions";

export const brew: ItemDescriptor = {
	name: "Brew",
	type: ItemType.Ability,
	id: "brew",
	description:
		"Brews a random potion. Brewed potions disappears after 3 turns.",
	init: (owner: Entity): Item => {
		return {
			owner,
			transferrable: false,
			actives: {
				default: {
					targetType: TargetType.Self,
					usageType: "per-turn",
					usageEnergyCost: 20,
					use: (self, targets) => {
						const potionsPool = [
							weaknessPotion,
							poisonPotion,
							healPotion,
							slownessPotion,
						];
						const potions = Array.from({ length: 1 }).map(
							(e) =>
								potionsPool[
									Math.floor(
										Math.random() * potionsPool.length
									)
								]
						);
						self.owner.game.io.onOutputEvent({
							type: "message",
							message: `**${self.owner.name}** brewed ${potions[0].name}`,
						});
						for (const potion of potions) {
							const item = potion.init(self.owner);
							item.name = "Alchemist's " + item.name;
							item.turnsUntilDestroyed = 4; // +1 because it is not usable the first turn
							self.owner.addItem(item);
						}
						return { ok: true };
					},
				},
			},
			...withProps(brew),
		};
	},
};
