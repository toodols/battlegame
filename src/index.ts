import { discord } from "./discord";
import { configDotenv } from "dotenv";

export { Game } from "./game";

function discordMain() {
	configDotenv();
	discord();
}

discordMain();
