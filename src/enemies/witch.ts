import { EnemyDescriptor } from ".";
import { Entity } from "../entity";
import { Game } from "../game";
import { strike } from "../item/abilities/strike";
import { brew } from "../item/abilities/brew";
import { Item, ItemType } from "../item";
import { withProps } from "../item/items";
import { potions } from "../item/consumables/potions";
import { npcRest } from "../item/abilities/npcRest";

export const witchPassive = {
	name: "Witch Passive",
	id: "witch-passive",
	type: ItemType.ClassPassive,
	description: "On death, has a 20% chance to drop a potion",
	init: (owner: Entity): Item => {
		const item: Item = {
			owner,
			passives: {
				onEntityDeath: (self, res) => {
					if (Math.random() < 0.2) {
						const potionsPool = potions;
						const selectedPotions = Array.from({
							length: 1,
						}).map(
							(e) =>
								potionsPool[
									Math.floor(
										Math.random() * potionsPool.length
									)
								]
						);
						let entity: Entity;
						if (
							res.attack.source instanceof Entity &&
							res.attack.source.playerId
						) {
							entity = res.attack.source;
						} else {
							const players = Object.values(
								self.owner.game.players
							).map((p) => p.entity!);
							entity =
								players[
									Math.floor(players.length * Math.random())
								];
						}
						// if (entity) {
						for (const potion of selectedPotions) {
							entity.addItem(potion.init(entity));
						}
						// }
					}
				},
			},
			...withProps(witchPassive),
		};
		return item;
	},
};
export const witch: EnemyDescriptor = {
	id: "witch",
	difficultyCost: 30,
	// midpoint 100
	minDifficultyPresence: -50,
	maxDifficultyPresence: 250,
	baseWeight: 10,
	init: (game: Game) => {
		const entity = new Entity(game);
		entity.name = "Witch";
		entity.maxHealth = 70;
		entity.health = 70;
		entity.speed = 70;
		entity.addItem(strike.init(entity));
		entity.addItem(brew.init(entity));
		entity.addItem(npcRest.init(entity));
		entity.addItem(witchPassive.init(entity));
		return entity;
	},
};
