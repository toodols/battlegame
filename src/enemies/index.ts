import { Entity } from "../entity";
import { Game } from "../game";
import { mannequin } from "./mannequin";
import { fireSlime, waterSlime } from "./slime";
import { witch } from "./witch";
import { zombie } from "./zombie";
export type EnemyDescriptor = {
	id: string;
	// how high a difficulty must be for this enemy to show up
	minDifficultyPresence?: number;
	maxDifficultyPresence?: number;
	// the 'cost' of having this enemy
	difficultyCost: number;
	init: (game: Game) => Entity;
	// how likely this enemy is to be picked
	baseWeight: number;
};
export const enemies: EnemyDescriptor[] = [
	fireSlime,
	waterSlime,
	witch,
	zombie,
	mannequin,
];
