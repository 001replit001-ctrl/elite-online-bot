import {
  SlashCommandBuilder,
  EmbedBuilder,
  ChannelType,
} from "discord.js";
import type { Command } from "../client.js";
import { wordGames, threadToWordGame } from "../state.js";

export function buildBoard(word: string, revealed: boolean[]): string {
  return word
    .split("")
    .map((ch, i) => (revealed[i] ? ch.toUpperCase() : "＿"))
    .join(" ");
}

export const ugadajSlovo: Command = {
  data: new SlashCommandBuilder()
    .setName("угадай-слово")
    .setDescription("Запустить игру «Угадай слово» (Поле чудес)")
    .addStringOption((opt) =>
      opt.setName("слово").setDescription("Загаданное слово").setRequired(true)
    )
    .addStringOption((opt) =>
      opt.setName("приз").setDescription("Приз для победителя").setRequired(true)
    )
    .addUserOption((opt) =>
      opt.setName("организатор").setDescription("Тег организатора").setRequired(false)
    ),

  async execute(interaction) {
    const channel = interaction.channel;
    if (!channel || channel.type !== ChannelType.GuildText) {
      await interaction.reply({ content: "❌ Только для текстовых каналов.", flags: 64 });
      return;
    }

    await interaction.deferReply({ flags: 64 });

    const word = interaction.options.getString("слово", true).toLowerCase().trim();
    const prize = interaction.options.getString("приз", true);
    const organizer = interaction.options.getUser("организатор") ?? interaction.user;

    if (!/^[а-яёa-z]+$/i.test(word)) {
      await interaction.editReply("❌ Слово должно содержать только буквы (без пробелов и символов).");
      return;
    }

    const revealed = new Array<boolean>(word.length).fill(false);
    const board = buildBoard(word, revealed);

    const e = new EmbedBuilder()
      .setTitle("🔤 Игра «Угадай слово» началась!")
      .addFields(
        { name: "🎁 Приз", value: prize },
        { name: "🔡 Букв в слове", value: `**${word.length}**`, inline: true },
        { name: "🎯 Организатор", value: `<@${organizer.id}>`, inline: true },
        { name: "📌 Как участвовать", value: "Открой ветку ниже и называй буквы или угадывай слово целиком!" },
      )
      .setColor(0x9b59b6)
      .setTimestamp();

    const msg = await channel.send({ content: "<@&1486708220234825949>", embeds: [e] });

    const thread = await channel.threads.create({
      name: "Угадай слово 🔤",
      startMessage: msg.id,
      type: ChannelType.PublicThread,
    });

    const boardMsg = await thread.send(
      `## ${board}\n\n🔡 Угадано букв: **0 / ${word.length}** | ❌ Промахов: **0**`
    );

    wordGames.set(thread.id, {
      word,
      prize,
      hostId: organizer.id,
      threadId: thread.id,
      revealed,
      guessedLetters: new Set(),
      boardMessageId: boardMsg.id,
    });
    threadToWordGame.set(thread.id, thread.id);

    await interaction.editReply("✅ Игра создана!");
  },
};
