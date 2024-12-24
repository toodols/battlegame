import { cliMain } from "./cli";
import { discord } from "./discord";
import { configDotenv } from "dotenv";

export { Game } from "./game";

function discordMain() {
	configDotenv();
	discord();
}

if (process.argv[2] === "cli") {
	cliMain();
} else {
	discordMain();
}
