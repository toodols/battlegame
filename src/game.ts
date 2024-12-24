import { classes } from "./classes";
import { Battle, Level, Shop } from "./level";
import { Entity } from "./entity";
import { canUseItemActive, destroyItem, useItemActive } from "./item";
import { IO, IOEvent } from "./io";
import { createEnemies } from "./spawning";

export enum GameState {
	PreGame,
	Game,
}

export interface Player {
	entity?: Entity;
	name: string;
	className: string | null;
	id: PlayerId;
}

export function selectRandomFromPool<T>(
	pool: T[],
	weight: (value: T) => number
): T {
	const sumWeight = pool.reduce((sum, current) => sum + weight(current), 0);
	let value = Math.random();
	let cur: T;
	let curIdx = 0;
	while (true) {
		cur = pool[curIdx];
		value -= weight(cur) / sumWeight;
		curIdx += 1;
		if (value < 0) {
			break;
		}
	}
	return cur;
}

export class Game {
	io: IO = new IO();
	// how difficult the current level is
	difficulty: number = 0;
	// how fast the difficulty grows per level
	difficultyScale: number = 0;
	levelNumber: number = 0;
	level?: Level;
	state = GameState.PreGame;
	hostPlayer?: Player;
	players: Record<PlayerId, Player> = {};
	// only for death messages that i want to play *after* the damage message
	eventBuffer: IOEvent[] = [];
	flushEvents() {
		for (const event of this.eventBuffer /*.sort(
			(event) =>
				//@ts-ignore
				({
					"entity-death": 5,
					"level-clear": 6,
				}[event.type] || 10)
		)*/) {
			this.io.onOutputEvent(event);
		}
		this.eventBuffer = [];
	}

	onLevelClear() {}

	constructor() {
		this.io.onInputCommand = (command) => {
			const player = this.players[command.playerId];
			switch (command.type) {
				case "initialize":
					for (const playerId in command.players) {
						this.players[playerId] = {
							id: playerId,
							name: command.players[playerId].name,
							className: "fighter",
						};
					}

					this.hostPlayer = this.players[command.playerId];
					this.io.onOutputEvent({ type: "game-init" });
					return;
				case "start-game":
					if (
						!this.players[command.playerId] ||
						this.state !== GameState.PreGame
					) {
						return;
					}
					if (this.hostPlayer?.id !== command.playerId) {
						this.io.onOutputEvent({
							type: "command-error",
							message: "Only host may start",
						});
						return;
					}
					for (const playerId in this.players) {
						const player = this.players[playerId];
						if (player.className === null) {
							this.io.onOutputEvent({
								type: "command-error",
								message: `${player.name} no has no class`,
							});
							return;
						}
					}
					this.difficulty = Math.max(10, command.initialDifficulty);
					this.difficultyScale = Math.max(0, command.difficultyScale);
					for (const playerId in this.players) {
						const player = this.players[playerId];
						player.entity = classes[
							player.className as keyof typeof classes
						](this, player);
					}
					this.state = GameState.Game;
					this.io.onOutputEvent({ type: "game-start" });
					this.level = new Battle(
						this,
						createEnemies(this),
						Object.values(this.players).map((p) => p.entity!)
					);
					return;
				case "set-class":
					if (this.state !== GameState.PreGame) {
						this.io.onOutputEvent({
							type: "command-error",
							message:
								"Can only choose class before the game starts",
						});
						return;
					}
					if (command.className in classes) {
						player.className = command.className;
						this.io.onOutputEvent({
							type: "player-class-changed",
							player,
						});
					} else {
						this.io.onOutputEvent({
							type: "command-error",
							message: `${command.className} is not a class`,
						});
					}
					return;

				case "buy-item":
					if (!player.entity) {
						this.io.onOutputEvent({
							type: "command-error",
							message: "No player entity",
						});
						return;
					}
					if (!(this.level instanceof Shop)) {
						return;
					}
					const offer = this.level.offers.find(
						(offer) => offer.item.id === command.name
					);
					if (!offer) {
						this.io.onOutputEvent({
							type: "command-error",
							message: `Shop item ${command.name} not found`,
						});
						return;
					}
					const res = player.entity.consumeCredits(offer.cost);
					if (res.ok) {
						const item = offer.item.init(player.entity);
						player.entity.addItem(item);
						this.io.onOutputEvent({
							type: "item-bought",
							entity: player.entity!,
							item,
						});
						this.level.offers = this.level.offers.filter(
							(o) => o !== offer
						);
					} else {
						this.io.onOutputEvent({
							type: "command-error",
							message: res.error,
						});
					}
					return;
				case "continue":
					if (!(this.level instanceof Shop)) {
						return;
					}
					if (this.hostPlayer?.id !== command.playerId) {
						this.io.onOutputEvent({
							type: "command-error",
							message: "Only host may continue",
						});
						return;
					}
					this.level = new Battle(
						this,
						createEnemies(this),
						Object.values(this.players).map((p) => p.entity!)
					);
					this.difficulty += this.difficultyScale;
					return;
				case "use-item":
					if (this.state !== GameState.Game) {
						this.io.onOutputEvent({
							type: "command-error",
							message: "The game has not started yet",
						});
						return;
					}
					if (!(this.level instanceof Battle)) {
						this.io.onOutputEvent({
							type: "command-error",
							message: "Not in battle",
						});
						return;
					}

					if (
						this.players[command.playerId].entity! !==
						this.level!.currentEntity
					) {
						this.io.onOutputEvent({
							type: "command-error",
							message: "Not your turn",
						});
						return;
					}

					const active = command.active;
					if (canUseItemActive(command.item, active)) {
						this.io.onOutputEvent({
							type: "entity-use-item",
							item: command.item,
							active,
							target: command.target,
							entity: player.entity!,
						});
						const res = useItemActive(
							command.item,
							active,
							command.target
						);
						if (res.ok) {
							this.level.doTurns();
						} else {
							this.io.onOutputEvent({
								type: "command-error",
								message: res.error,
							});
						}
					}

					return;
			}
		};
	}
}

export type Result = { ok: true } | { ok: false; error: string };
export type PlayerId = string;
