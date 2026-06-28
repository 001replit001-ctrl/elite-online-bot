import {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ChannelType,
} from "discord.js";
import type { Command } from "../client.js";
import { carGames, threadToCarGame } from "../state.js";

export const ugadajMashinu: Command = {
  data: new SlashCommandBuilder()
    .setName("угадай-машину")
    .setDescription("Запустить игру «Угадай машину»")
    .addStringOption((opt) =>
      opt.setName("название").setDescription("Название машины (ответ)").setRequired(true)
    )
    .addStringOption((opt) =>
      opt.setName("приз").setDescription("Приз для победителя").setRequired(true)
    )
    .addStringOption((opt) =>
      opt.setName("фото").setDescription("Ссылка на фото машины").setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const channel = interaction.channel;
    if (!channel || channel.type !== ChannelType.GuildText) {
      await interaction.reply({ content: "❌ Эту команду можно использовать только в текстовых каналах.", flags: 64 });
      return;
    }

    const car = interaction.options.getString("название", true);
    const prize = interaction.options.getString("приз", true);
    const photo = interaction.options.getString("фото", true);

    const e = new EmbedBuilder()
      .setTitle("🚗 Игра \"Угадай машину\" началась!")
      .addFields(
        { name: "🎁 Приз", value: prize },
        { name: "🎯 Организатор", value: `<@${interaction.user.id}>` },
        { name: "📌 Как участвовать", value: "Открой ветку ниже и напиши название машины!" },
      )
      .setImage(photo)
      .setColor(0xe74c3c)
      .setTimestamp();

    await interaction.reply({ embeds: [e] });
    const msg = await interaction.fetchReply();

    const thread = await channel.threads.create({
      name: "Угадай машину 🚗",
      startMessage: msg.id,
      type: ChannelType.PublicThread,
    });

    carGames.set(thread.id, {
      car: car.toLowerCase().trim(),
      prize,
      photo,
      hostId: interaction.user.id,
      threadId: thread.id,
      guesses: new Set(),
      messageCount: 0,
    });
    threadToCarGame.set(thread.id, thread.id);

    await thread.send(`👋 Игра началась! Напишите название марки и модели машины на фото.`);
  },
};
