import { Client, GatewayIntentBits, Partials, Collection } from "discord.js";
import type { SharedSlashCommand, ChatInputCommandInteraction } from "discord.js";

export interface Command {
  data: SharedSlashCommand;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.Channel],
});

const commands = new Collection<string, Command>();

export { client, commands };
