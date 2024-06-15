import { Entity } from "../entity";
import { Game, Player } from "../game";
import { fragment, fracture } from "../item/abilities/fracture";
import { ItemDescriptor, items, withProps } from "../item/items";
import { rest } from "../item/abilities/rest";
import { stick } from "../item/weapons/stick";
import { ItemType } from "../item";
import { TargetType } from "../attack";
import { zombieSpawnEgg } from "../item/consumables/zombieSpawnEgg";

// :)
const combatRedeployment: ItemDescriptor = {
	name: "Combat Redeployment",
	id: "combat-redeployment",
	description: "",
	type: ItemType.Ability,
	init: (owner: Entity) => {
		return {
			owner,
			actives: {
				default: {
					usageType: "per-turn",
					targetType: TargetType.FriendlyOne,
					use: (self, [target]: Entity[]) => {
						target.actionValue = -1;
						self.owner.game.currentLevel!.reorder();
						return { ok: true };
					},
				},
			},
			...withProps(combatRedeployment),
		};
	},
};

export const ghost = (game: Game, player: Player) => {
	const entity = new Entity(game);
	entity.playerId = player.id;
	entity.name = player.name;
	entity.maxHealth = 70;
	entity.health = 70;
	entity.speed = 100;
	entity.addItem(stick.init(entity));
	entity.addItem(fragment.init(entity));
	entity.addItem(fracture.init(entity));
	entity.addItem(rest.init(entity));
	entity.addItem(zombieSpawnEgg.init(entity));
	entity.addItem(combatRedeployment.init(entity));
	return entity;
};
