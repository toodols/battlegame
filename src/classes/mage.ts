import { Entity } from "../entity";
import { Game, Player } from "../game";
import { brew } from "../item/abilities/brew";
import { chiliPeppers } from "../item/consumables/chiliPeppers";
import { heal } from "../item/abilities/heal";
import { items } from "../item/items";
import { rest } from "../item/abilities/rest";
import { stick } from "../item/weapons/stick";
import { fireball } from "../item/abilities/fireball";
import { transfer } from "../item/abilities/transfer";

export const mage = (game: Game, player: Player) => {
	const entity = new Entity(game);
	entity.playerId = player.id;
	entity.name = player.name;
	entity.speed = 120;
	entity.maxEnergy = 150;
	entity.energy = 150;
	entity.addItem(stick.init(entity));
	entity.addItem(fireball.init(entity));
	entity.addItem(rest.init(entity));
	entity.addItem(heal.init(entity));
	entity.addItem(transfer.init(entity));
	return entity;
};
