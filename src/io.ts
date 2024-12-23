import { Attack } from "./attack";
import { Entity } from "./entity";
import { Active, Item } from "./item";
import { PlayerId, Player } from "./game";
import { Shop } from "./level";

export type IOCommand = (
	| {
			type: "start-game";
			playerId: PlayerId;
			initialDifficulty: number;
			difficultyScale: number;
	  }
	| {
			type: "set-class";
			className: string;
			playerId: PlayerId;
	  }
	| {
			type: "initialize";
			players: Record<PlayerId, { name: string }>;
			playerId: PlayerId;
	  }
	| {
			type: "use-item";
			item: Item;
			targets: Entity[];
			playerId: PlayerId;
			active: Active;
	  }
	| {
			type: "buy-item";
			name: string;
			playerId: PlayerId;
	  }
	| {
			type: "continue";
			playerId: PlayerId;
	  }
) & {};

export type IOEvent =
	| {
			type: "entity-death";
			entity: Entity;
			attack: Attack;
	  }
	| {
			type: "entity-turn-start";
			entity: Entity;
	  }
	| {
			type: "game-init";
	  }
	| {
			type: "game-start";
	  }
	// i like catch alls
	| {
			type: "command-error";
			message: string;
	  }
	| {
			type: "message";
			message: string;
	  }
	| {
			type: "player-class-changed";
			player: Player;
	  }
	| {
			type: "level-clear";
			sumActionValue: number;
	  }
	| {
			type: "display-shop";
			shop: Shop;
	  }
	| {
			type: "entity-do-healing";
			target: Entity;
			attack: Attack;
			effectiveDamage: number;
	  }
	| {
			type: "entity-recover-energy";
			entity: Entity;
			amount: number;
	  }
	| {
			type: "entity-do-damage";
			target: Entity;
			attack: Attack;
			effectiveDamage: number;
	  }
	| {
			type: "entity-use-item";
			entity: Entity;
			item: Item;
			active: Active;
			targets: Entity[];
	  }
	| {
			type: "item-bought";
			entity: Entity;
			item: Item;
	  };

export class IO {
	onInputCommand: (command: IOCommand) => void = () => {};
	onOutputEvent: (event: IOEvent) => void = () => {};
}
