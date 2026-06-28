import {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ChannelType,
} from "discord.js";
import type { Command } from "../client.js";
import { numberGames, threadToNumberGame } from "../state.js";

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
      opt.setName("мин").setDescription("Минимум диапазона (по умолчанию 1)").setRequired(false).setMinValue(1)
    )
    .addIntegerOption((opt) =>
      opt.setName("макс").setDescription("Максимум диапазона (по умолчанию 100)").setRequired(false).setMinValue(2)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const channel = interaction.channel;
    if (!channel || channel.type !== ChannelType.GuildText) {
      await interaction.reply({ content: "❌ Эту команду можно использовать только в текстовых каналах.", flags: 64 });
      return;
    }

    const number = interaction.options.getInteger("число", true);
    const prize = interaction.options.getString("приз", true);
    const min = interaction.options.getInteger("мин") ?? 1;
    const max = interaction.options.getInteger("макс") ?? 100;

    if (number < min || number > max) {
      await interaction.reply({ content: `❌ Загаданное число должно быть в диапазоне от **${min}** до **${max}**.`, flags: 64 });
      return;
    }

    const e = new EmbedBuilder()
      .setTitle("🎮 Игра \"Угадай число\" началась!")
      .addFields(
        { name: "🎁 Приз", value: prize },
        { name: "🔢 Диапазон", value: `от **${min}** до **${max}**` },
        { name: "🎯 Организатор", value: `<@${interaction.user.id}>` },
        { name: "📌 Как участвовать", value: "Открой ветку ниже и пиши своё число!" },
      )
      .setColor(0x3498db)
      .setTimestamp();

    await interaction.reply({ embeds: [e] });
    const msg = await interaction.fetchReply();

    const thread = await channel.threads.create({
      name: "Угадай число ❄️",
      startMessage: msg.id,
      type: ChannelType.PublicThread,
    });

    numberGames.set(thread.id, {
      number,
      prize,
      hostId: interaction.user.id,
      min,
      max,
      threadId: thread.id,
      messageCount: 0,
    });
    threadToNumberGame.set(thread.id, thread.id);

    await thread.send(`👋 Игра началась! Диапазон: **${min}–${max}**. Пишите своё число и проверяйте!`);
  },
};
