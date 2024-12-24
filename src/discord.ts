import { Client, GatewayIntentBits } from "discord.js";
import { GameState, PlayerId } from "./game";
import { IO, IOCommand, IOEvent } from "./io";
import { Game } from "./game";
import { TargetType } from "./attack";
import { Entity } from "./entity";
import { Active, Item, ItemType } from "./item";
import { Battle, Shop } from "./level";
import { displayEvent, parseCommand } from "./text";

export function discord() {
	let discordClient = new Client({
		intents: [
			GatewayIntentBits.Guilds,
			GatewayIntentBits.GuildMessages,
			GatewayIntentBits.MessageContent,
			GatewayIntentBits.GuildMembers,
		],
	});
	let games: Record<
		string,
		{ game: Game; buffer: string[]; resetDebounce: (time: number) => void }
	> = {};
	discordClient.login(process.env.DISCORD_TOKEN);
	discordClient.on("ready", () => {
		console.log("Bot is ready!");
	});
	discordClient.on("messageCreate", (message) => {
		if (message.content.startsWith("+BattleGame")) {
			if (games[message.channelId]) {
				message.reply("ongoing game");
			}
			const players: Record<PlayerId, { name: string }> = {
				[message.author.id]: { name: message.author.username },
			};
			for (const [_, user] of message.mentions.users) {
				players[user.id] = { name: user.username };
			}

			const game = new Game();
			let timeoutId: any;

			let data = (games[message.channelId] = {
				game,
				buffer: [] as string[],
				resetDebounce,
			});

			function resetDebounce(delay: number) {
				if (timeoutId) {
					clearTimeout(timeoutId);
				}
				timeoutId = setTimeout(() => {
					flushMessageBuffer();
				}, delay);
			}

			function flushMessageBuffer() {
				if (data.buffer.length > 0) {
					let head = data.buffer.slice(0, 10);
					let msg = head.join("\n");
					if (msg.length > 1900) {
						msg = msg.slice(0, 1900) + "... (too long to display)";
					}
					message.channel.send(msg);
					data.buffer = data.buffer.slice(10);
					resetDebounce(1000);
				}
			}

			game.io.onOutputEvent = function (event) {
				data.buffer.push(displayEvent(event));
				resetDebounce(100);
			};

			game.io.onInputCommand({
				type: "initialize",
				players: players,
				playerId: message.author.id,
			});
		} else if (games[message.channelId]) {
			let commandText = message.content.match(/^battle!(.*)/);
			if (commandText) {
				let command = parseCommand(
					commandText[1],
					games[message.channelId].game,
					message.author.id
				);
				if (typeof command === "string") {
					if (command.length === 0) {
						message.channel.send("???");
					} else {
						games[message.channelId].buffer.push(command);
						games[message.channelId].resetDebounce(100);
					}
				} else if (command !== null) {
					games[message.channelId].game.io.onInputCommand(command);
				}
			}
		}
	});
}
