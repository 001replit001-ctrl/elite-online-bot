import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import type { Command } from "../client.js";

export const ping: Command = {
  data: new SlashCommandBuilder()
    .setName("пинг")
    .setDescription("Проверить задержку бота"),

  async execute(interaction) {
    const sent = await interaction.reply({ content: "⏳ Замеряю...", fetchReply: true });
    const latency = sent.createdTimestamp - interaction.createdTimestamp;
    const ws = interaction.client.ws.ping;

    const e = new EmbedBuilder()
      .setTitle("🏓 Понг!")
      .addFields(
        { name: "📡 Задержка API", value: `${latency}ms`, inline: true },
        { name: "💓 WebSocket", value: `${ws}ms`, inline: true }
      )
      .setColor(latency < 200 ? 0x2ecc71 : latency < 500 ? 0xf39c12 : 0xe74c3c)
      .setTimestamp();

    await sent.edit({ content: "", embeds: [e] });
  },
};
