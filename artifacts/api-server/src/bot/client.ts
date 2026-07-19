import { Client, GatewayIntentBits, Partials, Collection } from "discord.js";
import type { ChatInputCommandInteraction, InteractionResponse } from "discord.js";
import type { SharedSlashCommand } from "discord.js";

export interface Command {
  data: SharedSlashCommand;
  execute: (
    interaction: ChatInputCommandInteraction
  ) => Promise<void | InteractionResponse>;
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
client.on("error", (err) => {
  console.error("❌ Discord client error:", err);
});

client.on("shardDisconnect", (event, shardId) => {
  console.error(`❌ Shard ${shardId} отключился`, event);
});

client.on("shardReconnecting", (shardId) => {
  console.log(`🔄 Shard ${shardId} переподключается`);
});

client.on("shardReady", (shardId) => {
  console.log(`✅ Shard ${shardId} подключён`);
});

const commands = new Collection<string, Command>();

export { client, commands };