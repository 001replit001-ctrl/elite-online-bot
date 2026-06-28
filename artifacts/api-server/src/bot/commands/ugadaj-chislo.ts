import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from "discord.js";
import type { Command } from "../client.js";
import { numberGames } from "../state.js";

export const ugadajChislo: Command = {
  data: new SlashCommandBuilder()
    .setName("угадай-число")
    .setDescription("Запустить игру «Угадай число»")
    .addIntegerOption((opt) =>
      opt.setName("число").setDescription("Загаданное число").setRequired(true).setMinValue(1).setMaxValue(10000)
    )
    .addStringOption((opt) =>
      opt.setName("приз").setDescription("Приз для победителя").setRequired(true)
    )
    .addIntegerOption((opt) =>
      opt.setName("попытки").setDescription("Максимум попыток на игрока (по умолчанию 5)").setRequired(false).setMinValue(1).setMaxValue(20)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const channelId = interaction.channelId;

    if (numberGames.has(channelId)) {
      await interaction.reply({ content: "❌ В этом канале уже идёт игра! Завершите её командой `/стоп-игра`.", flags: 64 });
      return;
    }

    const number = interaction.options.getInteger("число", true);
    const prize = interaction.options.getString("приз", true);
    const maxAttempts = interaction.options.getInteger("попытки") ?? 5;

    numberGames.set(channelId, {
      number,
      prize,
      hostId: interaction.user.id,
      attempts: new Map(),
    });

    const e = new EmbedBuilder()
      .setTitle("🔢 Угадай число!")
      .setDescription(
        `Я загадал число от **1** до **10000**.\n\n🎁 **Приз:** ${prize}\n🎯 **Попытки на каждого:** ${maxAttempts}\n\n👉 Используй **\`/угадать\`** чтобы назвать своё число!`
      )
      .setColor(0x3498db)
      .setFooter({ text: `Начал: ${interaction.user.username}` })
      .setTimestamp();

    await interaction.reply({ embeds: [e] });
  },
};
