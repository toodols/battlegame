import { Entity } from "./entity";
import { Target } from "./attack";

export function targetIsNumber(
	target: Target
): target is { type: "number"; value: number } {
	return target.type === "number";
}

export function targetIsEntities(
	target: Target
): target is { type: "entities"; entities: Entity[] } {
	return target.type === "entities";
}
