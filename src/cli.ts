import { Game } from "./game";
import * as readline from "readline";
import { displayEvent, parseCommand } from "./text";

export function cliMain() {
	const game = new Game();
	//@ts-ignore
	const rl = readline.createInterface(process.stdin, process.stdout);
	game.io.onOutputEvent = (event) => console.log(displayEvent(event));
	rl.on("line", (input) => {
		const command = parseCommand(input, game, "player1");
		if (command === null || typeof command === "string") {
			console.log(command);
		} else {
			game.io.onInputCommand(command);
		}
	});
	game.io.onInputCommand({
		type: "initialize",
		players: { player1: { name: "player1" } },
		playerId: "player1",
	});
}
