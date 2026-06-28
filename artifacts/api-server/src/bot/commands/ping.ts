import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import type { Command } from "../client.js";

export const ping: Command = {
  data: new SlashCommandBuilder()
    .setName("пинг")
    .setDescription("Проверить задержку бота"),

  async execute(interaction) {
    await interaction.deferReply({ flags: 64 });

    const latency = Date.now() - interaction.createdTimestamp;
    const ws = interaction.client.ws.ping;

    const e = new EmbedBuilder()
      .setTitle("🏓 Понг!")
      .addFields(
        { name: "📡 Задержка API", value: `${latency}ms`, inline: true },
        { name: "💓 WebSocket", value: `${ws}ms`, inline: true }
      )
      .setColor(latency < 200 ? 0x2ecc71 : latency < 500 ? 0xf39c12 : 0xe74c3c)
      .setTimestamp();

    const channel = interaction.channel;
    if (channel && "send" in channel) {
      await (channel as { send: (opts: unknown) => Promise<unknown> }).send({ embeds: [e] });
      await interaction.editReply("✅");
    } else {
      await interaction.editReply({ embeds: [e] });
    }
  },
};
