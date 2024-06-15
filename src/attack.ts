import { Entity } from "./entity";
import { Item } from "./item";

// Healing is grouped together with Damage. The gauge remains positive for both.
export interface Attack {
	type: AttackType;
	source: Entity | Item | null;
	scaleFactor: number; // Defaults to 1
	flatFactor: number; // Defaults to 0
	gauge: number; // Gauge is calculated as scaleFactor * gauge + flatFactor
	lethal: boolean;
}
export enum AttackType {
	Fire,
	Water,
	Ice,
	Light,
	Poison,
	Physical,
	Healing,
	Piercing,
}
export enum TargetType {
	FriendlyOne,
	EnemyOne,
	FriendlyAll,
	EnemyAll,
	Self,
}
