import { SlashCommandBuilder, EmbedBuilder, ChannelType } from "discord.js";
import type { Command } from "../client.js";
import { numberGames, carGames, wordGames, threadToNumberGame, threadToCarGame, threadToWordGame } from "../state.js";

export const stopGame: Command = {
  data: new SlashCommandBuilder()
    .setName("стоп-игра")
    .setDescription("Остановить текущую игру в этом канале/ветке"),

  async execute(interaction) {
    await interaction.deferReply({ flags: 64 });

    const channelId = interaction.channelId;
    const channel = interaction.channel;
    const isThread = channel?.type === ChannelType.PublicThread || channel?.type === ChannelType.PrivateThread;
    const ch = channel as { send: (opts: unknown) => Promise<unknown> } | null;

    // Угадай число
    if (numberGames.has(channelId)) {
      const game = numberGames.get(channelId)!;
      numberGames.delete(channelId);
      threadToNumberGame.delete(channelId);
      const e = new EmbedBuilder()
        .setTitle("🛑 Игра остановлена")
        .setDescription(`Загаданное число было: **${game.number}**\nПриз: ${game.prize}`)
        .setColor(0xe74c3c)
        .setTimestamp();
      if (ch) await ch.send({ embeds: [e] });
      await interaction.editReply("✅ Игра остановлена.");
      if (isThread) {
        try { await (channel as { setLocked: (v: boolean) => Promise<unknown>; setArchived: (v: boolean) => Promise<unknown> }).setLocked(true); } catch { }
        try { await (channel as { setArchived: (v: boolean) => Promise<unknown> }).setArchived(true); } catch { }
      }
      return;
    }

    // Угадай машину
    if (carGames.has(channelId)) {
      const game = carGames.get(channelId)!;
      carGames.delete(channelId);
      threadToCarGame.delete(channelId);
      const e = new EmbedBuilder()
        .setTitle("🛑 Игра остановлена")
        .setDescription(`Машина была: **${game.car}**\nПриз: ${game.prize}`)
        .setColor(0xe74c3c)
        .setImage(game.photo)
        .setTimestamp();
      if (ch) await ch.send({ embeds: [e] });
      await interaction.editReply("✅ Игра остановлена.");
      if (isThread) {
        try { await (channel as { setLocked: (v: boolean) => Promise<unknown>; setArchived: (v: boolean) => Promise<unknown> }).setLocked(true); } catch { }
        try { await (channel as { setArchived: (v: boolean) => Promise<unknown> }).setArchived(true); } catch { }
      }
      return;
    }

    // Угадай слово
    if (wordGames.has(channelId)) {
      const game = wordGames.get(channelId)!;
      wordGames.delete(channelId);
      threadToWordGame.delete(channelId);
      const e = new EmbedBuilder()
        .setTitle("🛑 Игра остановлена")
        .setDescription(`Слово было: **${game.word.toUpperCase()}**\nПриз: ${game.prize}`)
        .setColor(0xe74c3c)
        .setTimestamp();
      if (ch) await ch.send({ embeds: [e] });
      await interaction.editReply("✅ Игра остановлена.");
      if (isThread) {
        try { await (channel as { setLocked: (v: boolean) => Promise<unknown>; setArchived: (v: boolean) => Promise<unknown> }).setLocked(true); } catch { }
        try { await (channel as { setArchived: (v: boolean) => Promise<unknown> }).setArchived(true); } catch { }
      }
      return;
    }

    await interaction.editReply("❌ В этом канале нет активной игры.");
  },
};
