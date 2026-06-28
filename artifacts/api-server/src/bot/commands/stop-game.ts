import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from "discord.js";
import type { Command } from "../client.js";
import { numberGames, carGames } from "../state.js";

export const stopGame: Command = {
  data: new SlashCommandBuilder()
    .setName("стоп-игра")
    .setDescription("Остановить текущую игру в канале")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const channelId = interaction.channelId;

    if (numberGames.has(channelId)) {
      const game = numberGames.get(channelId)!;
      numberGames.delete(channelId);
      const e = new EmbedBuilder()
        .setTitle("🛑 Игра остановлена")
        .setDescription(`Загаданное число было: **${game.number}**\nПриз: ${game.prize}`)
        .setColor(0xe74c3c)
        .setTimestamp();
      await interaction.reply({ embeds: [e] });
      return;
    }

    if (carGames.has(channelId)) {
      const game = carGames.get(channelId)!;
      carGames.delete(channelId);
      const e = new EmbedBuilder()
        .setTitle("🛑 Игра остановлена")
        .setDescription(`Машина была: **${game.car}**\nПриз: ${game.prize}`)
        .setColor(0xe74c3c)
        .setImage(game.photo)
        .setTimestamp();
      await interaction.reply({ embeds: [e] });
      return;
    }

    await interaction.reply({ content: "❌ В этом канале нет активной игры.", flags: 64 });
  },
};
