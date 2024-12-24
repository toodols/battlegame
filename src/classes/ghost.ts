import { Entity } from "../entity";
import { Game, Player } from "../game";
import { mist, disperse } from "../item/abilities/disperse";
import { ItemDescriptor, items, withProps } from "../item/items";
import { rest } from "../item/abilities/rest";
import { stick } from "../item/weapons/stick";
import { ItemType } from "../item";
import { TargetType, UsageType } from "../attack";
import { zombieSpawnEgg } from "../item/consumables/zombieSpawnEgg";
import { Battle } from "../level";
import { targetIsEntities } from "../assertions";

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
					usageType: UsageType.PerTurn,
					usageEnergyCost: 20,
					description: "Summons a friendly to act immediately",
					targetType: TargetType.FriendlyOne,
					use: (self, target) => {
						if (!targetIsEntities(target))
							return { ok: false, error: "Invalid target" };
						target.entities[0].actionValue = -1;
						(self.owner.game.level as Battle).reorder();
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
	entity.speed = 120;
	entity.addItem(stick.init(entity));
	entity.addItem(mist.init(entity));
	entity.addItem(disperse.init(entity));
	entity.addItem(rest.init(entity));
	entity.addItem(combatRedeployment.init(entity));
	return entity;
};
