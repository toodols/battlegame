import { enemies } from "./enemies";
import { Game, selectRandomFromPool } from "./game";

// random gpt generated math function that might help with organic spawning
function calculateDifficultyWeight(
	difficulty: number,
	mindifficultypresence: number,
	maxdifficultypresence: number
) {
	return Math.exp(
		-Math.pow(
			difficulty - (mindifficultypresence + maxdifficultypresence) / 2,
			2
		) / 2000
	);
}
const calculateSizeWeight = (cost: number, diff: number) =>
	Math.exp(-Math.pow(cost - diff / 5, 2) / 500);

export function createEnemies(game: Game) {
	let difficultyBudget = game.difficulty;
	let enemyTeam = [];
	console.log({ difficultyBudget });
	while (difficultyBudget > 0) {
		let pool = enemies
			.filter(
				(enemy) =>
					enemy.difficultyCost &&
					enemy.baseWeight &&
					enemy.difficultyCost <= difficultyBudget &&
					(enemy.minDifficultyPresence || 0) <= game.difficulty &&
					(enemy.maxDifficultyPresence || Infinity) >= game.difficulty
			)
			.map((descriptor) => {
				return {
					weight:
						descriptor.baseWeight! *
						calculateSizeWeight(
							descriptor.difficultyCost!,
							game.difficulty
						) *
						(descriptor.minDifficultyPresence &&
						descriptor.maxDifficultyPresence
							? calculateDifficultyWeight(
									game.difficulty,
									descriptor.minDifficultyPresence!,
									descriptor.maxDifficultyPresence!
							  )
							: 0.5),
					descriptor,
				};
			});
		// console.table(
		// 	pool.map(({ descriptor, weight }) => ({
		// 		baseWeight: descriptor.baseWeight,
		// 		sizeWeight: calculateSizeWeight(
		// 			descriptor.difficultyCost!,
		// 			game.difficulty
		// 		),
		// 		difficultyWeight: descriptor.maxDifficultyPresence
		// 			? calculateDifficultyWeight(
		// 					game.difficulty,
		// 					descriptor.minDifficultyPresence || 0,
		// 					descriptor.maxDifficultyPresence!
		// 			  )
		// 			: 0.5,
		// 		weight,
		// 		name: descriptor.id,
		// 	}))
		// );
		if (pool.length === 0) {
			break;
		}
		const cur = selectRandomFromPool(
			pool,
			(entry) => entry.weight
		).descriptor;
		difficultyBudget -= cur.difficultyCost!;
		enemyTeam.push(cur!.init(game));
	}
	return enemyTeam;
}
