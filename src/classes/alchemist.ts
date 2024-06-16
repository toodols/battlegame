import { Entity } from "../entity";
import { Game, Player } from "../game";
import { brew } from "../item/abilities/brew";
import { mist, disperse } from "../item/abilities/disperse";
import { rest } from "../item/abilities/rest";
import { weaknessPotion } from "../item/consumables/potions";
import { stick } from "../item/weapons/stick";

export const alchemist = (game: Game, player: Player) => {
	const entity = new Entity(game);
	entity.playerId = player.id;
	entity.name = player.name;
	entity.speed = 120;
	entity.addItem(stick.init(entity));
	entity.addItem(brew.init(entity));
	entity.addItem(rest.init(entity));
	return entity;
};
