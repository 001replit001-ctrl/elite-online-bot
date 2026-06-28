import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from "discord.js";
import type { Command } from "../client.js";
import { carGames } from "../state.js";

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
    const channelId = interaction.channelId;

    if (carGames.has(channelId)) {
      await interaction.reply({ content: "❌ В этом канале уже идёт игра! Завершите её командой `/стоп-игра`.", flags: 64 });
      return;
    }

    const car = interaction.options.getString("название", true);
    const prize = interaction.options.getString("приз", true);
    const photo = interaction.options.getString("фото", true);

    carGames.set(channelId, {
      car: car.toLowerCase().trim(),
      prize,
      photo,
      hostId: interaction.user.id,
      guesses: new Set(),
    });

    const e = new EmbedBuilder()
      .setTitle("🚗 Угадай машину!")
      .setDescription(
        `Что это за машина на фото?\n\n🎁 **Приз:** ${prize}\n\n👉 Используй **\`/угадать\`** чтобы назвать модель!`
      )
      .setImage(photo)
      .setColor(0xe74c3c)
      .setFooter({ text: `Начал: ${interaction.user.username}` })
      .setTimestamp();

    await interaction.reply({ embeds: [e] });
  },
};
