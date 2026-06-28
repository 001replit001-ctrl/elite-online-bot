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
    .addUserOption((opt) =>
      opt.setName("организатор").setDescription("Тег организатора").setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const channel = interaction.channel;
    if (!channel || channel.type !== ChannelType.GuildText) {
      await interaction.reply({ content: "❌ Только для текстовых каналов.", flags: 64 });
      return;
    }

    await interaction.deferReply({ flags: 64 });

    const car = interaction.options.getString("название", true);
    const prize = interaction.options.getString("приз", true);
    const photo = interaction.options.getString("фото", true);
    const organizer = interaction.options.getUser("организатор") ?? interaction.user;

    const e = new EmbedBuilder()
      .setTitle("🚗 Игра \"Угадай машину\" началась!")
      .addFields(
        { name: "🎁 Приз", value: prize },
        { name: "🎯 Организатор", value: `<@${organizer.id}>` },
        { name: "📌 Как участвовать", value: "Открой ветку ниже и напиши название машины!" },
      )
      .setImage(photo)
      .setColor(0xe74c3c)
      .setTimestamp();

    const msg = await channel.send({ content: "<@&1486708220234825949>", embeds: [e] });

    const thread = await channel.threads.create({
      name: "Угадай машину 🚗",
      startMessage: msg.id,
      type: ChannelType.PublicThread,
    });

    carGames.set(thread.id, {
      car: car.toLowerCase().trim(),
      prize,
      photo,
      hostId: organizer.id,
      threadId: thread.id,
      guesses: new Set(),
      messageCount: 0,
    });
    threadToCarGame.set(thread.id, thread.id);

    await thread.send(`👋 Игра началась! Напишите название марки и модели машины на фото.`);
    await interaction.editReply("✅ Игра создана!");
  },
};
