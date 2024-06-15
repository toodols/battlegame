import { Entity } from "../entity";
import { Game, Player } from "../game";
import { heal } from "../item/abilities/heal";
import { rest } from "../item/abilities/rest";
import { stick } from "../item/weapons/stick";
import { fireball } from "../item/abilities/fireball";
import { woodenBow } from "../item/weapons/woodenBow";
import { rangerPassive } from "../item/statuses/rangerPassive";

export const ranger = (game: Game, player: Player) => {
	const entity = new Entity(game);
	entity.playerId = player.id;
	entity.name = player.name;
	entity.speed = 120;
	entity.maxEnergy = 100;
	entity.energy = 100;
	entity.addItem(stick.init(entity));
	entity.addItem(rest.init(entity));
	entity.addItem(woodenBow.init(entity));
	entity.addItem(rangerPassive.init(entity));
	return entity;
};
