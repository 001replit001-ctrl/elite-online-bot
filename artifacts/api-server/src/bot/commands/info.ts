import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import type { Command } from "../client.js";

export const info: Command = {
  data: new SlashCommandBuilder()
    .setName("инфо")
    .setDescription("Информация о пользователе")
    .addUserOption((opt) =>
      opt.setName("пользователь").setDescription("Пользователь (по умолчанию — ты)").setRequired(false)
    ),

  async execute(interaction) {
    await interaction.deferReply({ flags: 64 });

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

    const channel = interaction.channel;
    if (channel && "send" in channel) {
      await (channel as { send: (opts: unknown) => Promise<unknown> }).send({ embeds: [e] });
      await interaction.editReply("✅");
    } else {
      await interaction.editReply({ embeds: [e] });
    }
  },
};
