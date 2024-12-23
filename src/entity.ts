import { Game, Result, selectRandomFromPool } from "./game";
import { Attack, AttackType, TargetType } from "./attack";
import { PlayerId } from "./game";
import {
	APPEAL,
	Active,
	Item,
	canUseItemActive,
	destroyItem,
	useItemActive as useItemActive,
} from "./item";
import { Battle, Team } from "./level";

export type AttackResult = {
	effectiveDamage: number;
	didKill: boolean;
	attack: Attack;
};

function rollWithAdvantage(n: number, advantage: number): number {
	if (advantage >= 0) {
		let max = Math.floor(Math.random() * n) + 1;
		for (let i = 0; i < advantage; i++) {
			let roll = Math.floor(Math.random() * n) + 1;
			if (roll > max) {
				max = roll;
			}
		}
		return max;
	} else {
		let min = Math.floor(Math.random() * n) + 1;
		for (let i = 0; i < -advantage; i++) {
			let roll = Math.floor(Math.random() * n) + 1;
			if (roll < min) {
				min = roll;
			}
		}
		return min;
	}
}

export class Entity {
	name: string = "Unnamed entity";
	team?: Team;
	typeId: string = "blank";
	health: number = 100;
	maxHealth: number = 100;
	defense: number = 0;
	energy: number = 100;
	maxEnergy: number = 100;
	// advantage > 0: roll |advantage| + 1 die, picking the highest one
	// advantage < 0: roll |advantage| + 1 die, picking the lowest one
	advantage: number = 0;
	credits: number = 0;
	playerId?: PlayerId;
	speed: number = 100;
	items: Item[] = [];
	endTurnFlag = false;

	roll(n: number) {
		return rollWithAdvantage(n, this.advantage);
	}
	consumeCredits(amount: number): Result {
		if (this.credits >= amount) {
			this.setCredits(this.credits - amount);
			return { ok: true };
		} else {
			return { ok: false, error: "not enough credits" };
		}
	}
	recoverEnergy(amount: number) {
		let energy = { gauge: amount };
		this.items.forEach((item) =>
			item.passives?.onEntityRecoverEnergy?.(item, energy)
		);
		let effectiveEnergyGain = Math.min(
			energy.gauge,
			this.maxEnergy - this.energy
		);
		this.energy = this.energy + effectiveEnergyGain;
		return effectiveEnergyGain;
	}
	consumeEnergy(amount: number): Result {
		if (this.energy >= amount) {
			this.energy -= amount;
			return { ok: true };
		} else {
			return { ok: false, error: "not enough energy" };
		}
	}
	getEffectiveSpeed() {
		const speedStat = { gauge: this.speed, scaleFactor: 1, flatFactor: 0 };
		this.items.forEach((item) =>
			item.passives?.calculateEntitySpeed?.(item, speedStat)
		);
		return speedStat.scaleFactor * speedStat.gauge + speedStat.flatFactor;
	}
	actionValue: number = this.getBaseActionValue();
	getBaseActionValue() {
		return 10000 / this.getEffectiveSpeed();
	}
	addItem(item: Item) {
		// wouldn't want onEntityGainItem to trigger itself as it is being added
		this.items.forEach((i) => i.passives?.onEntityGainItem?.(i, item));
		this.items.push(item);
		item.passives?.init?.(item);
	}
	turnStart() {
		// passively regenerate energy
		this.recoverEnergy(10);
		if (this.playerId) {
			this.game.io.onOutputEvent({
				type: "entity-turn-start",
				entity: this,
			});
			this.items.forEach((item) =>
				item.passives?.onEntityTurnStart?.(item)
			);
		} else {
			this.items.forEach((item) =>
				item.passives?.onEntityTurnStart?.(item)
			);
			if (!this.isAlive()) {
				// don't allow enemy to act if they die to dot
				this.endTurnFlag = true;
				return;
			}
			// ai part
			const itemPool: [Item, Active][] = this.items
				.map(
					(item) =>
						item.actives &&
						Object.values(item.actives)
							.filter(
								(active) => canUseItemActive(item, active).ok
							)
							.map((active) => [item, active])
				)
				.filter((i) => i)
				.flat() as any;

			if (itemPool.length === 0) {
				this.endTurnFlag = true;
				return;
			}
			const [item, active] = selectRandomFromPool(
				itemPool,
				([i, active]) => active.appeal?.(i) ?? APPEAL.NORMAL
			);
			console.table(
				itemPool.map(([i, a]) => {
					return {
						name: i.name,
						activeName: a.name,
						appeal: a.appeal?.(i) ?? APPEAL.NORMAL,
					};
				})
			);
			let targets: Entity[] | undefined;
			if (active.targeting) {
				targets = active.targeting(item, active);
			}
			if (targets === undefined) {
				switch (active.targetType) {
					case TargetType.EnemyAll:
						targets = (this.game.level as Battle)
							.getEnemyOf(this)
							.filter((entity) => entity.isAlive());
						break;
					case TargetType.FriendlyAll:
						targets = this.team!.filter((entity) =>
							entity.isAlive()
						);
						break;
					case TargetType.EnemyOne:
						const enemyTeam = (this.game.level as Battle)
							.getEnemyOf(this)
							.filter((v) => v.isAlive());
						targets = [
							enemyTeam[
								Math.floor(Math.random() * enemyTeam.length)
							],
						];
						if (targets[0] === undefined) {
							this.game.io.onOutputEvent({
								type: "message",
								message: "ERROR CHECK LOGS",
							});
							console.log(enemyTeam);
							console.log(targets);
						}
						break;
					case TargetType.FriendlyOne:
						targets = [
							this.team!.filter((entity) => entity.isAlive())[
								Math.floor(Math.random() * this.team!.length)
							],
						];
						break;
					case TargetType.Self:
						targets = [this];
				}
			}
			this.game.io.onOutputEvent({
				type: "entity-use-item",
				item,
				active,
				entity: this,
				targets,
			});
			const result = useItemActive(item, active, targets);
			if (result.ok) {
				this.endTurnFlag = true;
			} else {
				this.game.io.onOutputEvent({
					type: "command-error",
					message: result.error,
				});
				// no point in giving the ai a second chance.
				this.endTurnFlag = true;
			}
		}
	}
	turnEnd() {
		this.items.forEach((item) => item.passives?.onEntityTurnEnd?.(item));
		this.items.forEach((item) => {
			if (item.turnsUntilDestroyed !== undefined) {
				item.turnsUntilDestroyed -= 1;
				if (item.turnsUntilDestroyed <= 0) {
					destroyItem(item);
				}
			}
			if (item.actives) {
				for (const active of Object.values(item.actives)) {
					if (active.wasUsedThisTurn) {
						active.wasUsedThisTurn = false;
					}
				}
			}
		});
	}
	setMaxHealth(maxHealth: number) {
		const old = this.maxHealth;
		this.maxHealth = Math.round(maxHealth);
		this.items.forEach((item) =>
			item.passives?.onEntityMaxHealthChanged?.(item, old)
		);
		if (this.health > this.maxHealth) {
			this.health = this.maxHealth;
		}
	}
	setCredits(credits: number) {
		// credits = Math.max(credits, 0);
		const old = this.credits;
		this.credits = credits;
		this.items.forEach((item) =>
			item.passives?.onEntityCreditsChanged?.(item, old)
		);
	}
	getItem(id: string) {
		return this.items.filter((item) => item.id === id)[0];
	}
	isAlive() {
		return this.health > 0;
	}
	doDamage(target: Entity, partialAttack: Partial<Attack>) {
		partialAttack.scaleFactor = partialAttack.scaleFactor || 1;
		partialAttack.flatFactor = partialAttack.flatFactor || 0;
		partialAttack.source = this;
		partialAttack.nonlethal = !!partialAttack.nonlethal;
		let attack = partialAttack as Attack;
		if (attack.type === AttackType.Healing) {
			this.items.forEach((item) =>
				item.passives?.onEntityDoHealing?.(item, target, attack)
			);
		} else {
			this.items.forEach((item) =>
				item.passives?.onEntityDoDamage?.(item, target, attack)
			);
		}
		const res = target.takeDamage(attack);
		if (attack.type === AttackType.Healing) {
			this.items.forEach((item) =>
				item.passives?.onEntityDidHealing?.(item, target, res)
			);
		} else {
			this.items.forEach((item) =>
				item.passives?.onEntityDidDamage?.(item, target, res)
			);
		}
		if (res.didKill) {
			this.items.forEach((item) =>
				item.passives?.onEntityKill?.(item, target, attack)
			);
		}
		return res;
	}
	takeDamage(partialAttack: Partial<Attack>): AttackResult {
		partialAttack.scaleFactor = partialAttack.scaleFactor || 1;
		partialAttack.flatFactor = partialAttack.flatFactor || 0;
		partialAttack.nonlethal = !!partialAttack.nonlethal;
		partialAttack.source = partialAttack.source || null;
		let attack = partialAttack as Attack;
		if (attack.type === AttackType.Healing) {
			this.items.forEach((item) =>
				item.passives?.onEntityHealing?.(item, attack)
			);
			const effectiveDamage = Math.floor(
				Math.min(
					this.maxHealth - this.health,
					(attack.scaleFactor || 1) * attack.gauge +
						(attack.flatFactor || 0)
				)
			);
			this.health += effectiveDamage;

			const res = { effectiveDamage, didKill: false, attack };
			this.items.forEach((item) =>
				item.passives?.onEntityHealed?.(item, res)
			);
			return res;
		} else {
			this.items.forEach((item) =>
				item.passives?.onEntityDamaging?.(item, attack)
			);

			const effectiveDamage = Math.floor(
				Math.max(
					0,
					Math.min(
						attack.nonlethal ? this.health - 1 : this.health,
						(attack.scaleFactor || 1) * attack.gauge +
							(attack.flatFactor || 0)
					)
				)
			);
			this.health -= effectiveDamage;
			const res = { effectiveDamage, didKill: this.health === 0, attack };
			this.items.forEach((item) =>
				item.passives?.onEntityDamaged?.(item, res)
			);
			if (res.didKill) {
				this.items.forEach((item) =>
					item.passives?.onEntityDeath?.(item, res)
				);
			}
			if (res.didKill) {
				this.game.eventBuffer.push({
					type: "entity-death",
					entity: this,
					attack: attack,
				});
				(this.game.level as Battle).removeEntity(this);
			}
			return res;
		}
	}
	constructor(public game: Game) {}
}
