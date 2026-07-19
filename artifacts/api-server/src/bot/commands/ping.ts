import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import type { Command } from "../client.js";

export const ping: Command = {
  data: new SlashCommandBuilder()
    .setName("пинг")
    .setDescription("Показывает задержку бота"),

  async execute(interaction) {
    await interaction.deferReply({ flags: 64 });

    const latency = Date.now() - interaction.createdTimestamp;
    const apiPing = interaction.client.ws.ping;

    const embed = new EmbedBuilder()
      .setTitle("🏓 Pong!")
      .setColor(0x5865f2)
      .addFields(
        { name: "⚡ Задержка", value: `${latency} мс`, inline: true },
        { name: "🌐 API", value: `${apiPing} мс`, inline: true }
      )
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};