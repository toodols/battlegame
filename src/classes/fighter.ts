import { Entity } from "../entity";
import { Game, Player } from "../game";
import { brew } from "../item/abilities/brew";
import { fragment, fracture } from "../item/abilities/fracture";
import { rest } from "../item/abilities/rest";
import { stick } from "../item/weapons/stick";
import { dullSword } from "../item/weapons/sword";

export const fighter = (game: Game, player: Player) => {
	const entity = new Entity(game);
	entity.playerId = player.id;
	entity.name = player.name;
	entity.speed = 100;
	entity.health = 150;
	entity.maxHealth = 150;
	entity.addItem(dullSword.init(entity));
	entity.addItem(rest.init(entity));
	return entity;
};
