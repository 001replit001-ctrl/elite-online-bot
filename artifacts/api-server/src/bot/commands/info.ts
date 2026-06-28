import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import type { Command } from "../client.js";

export const info: Command = {
  data: new SlashCommandBuilder()
    .setName("инфо")
    .setDescription("Информация о пользователе или сервере")
    .addUserOption((opt) =>
      opt.setName("пользователь").setDescription("Пользователь (по умолчанию — ты)").setRequired(false)
    ),

  async execute(interaction) {
    const target = interaction.options.getUser("пользователь") ?? interaction.user;
    const member = interaction.guild?.members.cache.get(target.id);

    const e = new EmbedBuilder()
      .setTitle(`👤 ${target.username}`)
      .setThumbnail(target.displayAvatarURL({ size: 256 }))
      .addFields(
        { name: "🆔 ID", value: target.id, inline: true },
        { name: "📅 Зарегистрирован", value: `<t:${Math.floor(target.createdTimestamp / 1000)}:D>`, inline: true },
      )
      .setColor(0x3498db)
      .setTimestamp();

    if (member) {
      e.addFields(
        { name: "📥 На сервере с", value: `<t:${Math.floor((member.joinedTimestamp ?? 0) / 1000)}:D>`, inline: true },
        { name: "🎭 Ролей", value: `${member.roles.cache.size - 1}`, inline: true },
        { name: "🔝 Высшая роль", value: `${member.roles.highest}`, inline: true }
      );
    }

    await interaction.reply({ embeds: [e] });
  },
};
