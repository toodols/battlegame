import { Entity } from "../entity";
import { Game, Player } from "../game";
import { rest } from "../item/abilities/rest";
import { ironSword } from "../item/weapons/ironSword";

export const fighter = (game: Game, player: Player) => {
	const entity = new Entity(game);
	entity.playerId = player.id;
	entity.name = player.name;
	entity.speed = 100;
	entity.health = 150;
	entity.maxHealth = 150;
	entity.addItem(ironSword.init(entity));
	entity.addItem(rest.init(entity));
	return entity;
};
