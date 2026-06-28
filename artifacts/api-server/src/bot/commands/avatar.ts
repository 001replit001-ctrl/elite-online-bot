import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import type { Command } from "../client.js";

export const avatar: Command = {
  data: new SlashCommandBuilder()
    .setName("аватар")
    .setDescription("Показать аватарку пользователя в большом размере")
    .addUserOption((opt) =>
      opt.setName("пользователь").setDescription("Пользователь (по умолчанию — ты)").setRequired(false)
    ),

  async execute(interaction) {
    await interaction.deferReply({ flags: 64 });

    const target = interaction.options.getUser("пользователь") ?? interaction.user;

    const e = new EmbedBuilder()
      .setTitle(`🖼️ Аватар ${target.username}`)
      .setImage(target.displayAvatarURL({ size: 4096 }))
      .setColor(0x5865f2)
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
