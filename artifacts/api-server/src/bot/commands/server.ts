import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import type { Command } from "../client.js";

export const server: Command = {
  data: new SlashCommandBuilder()
    .setName("сервер")
    .setDescription("Информация о сервере"),

  async execute(interaction) {
    const guild = interaction.guild;
    if (!guild) {
      await interaction.reply({ content: "❌ Только для серверов.", flags: 64 });
      return;
    }

    await guild.members.fetch();
    const bots = guild.members.cache.filter((m) => m.user.bot).size;
    const humans = guild.memberCount - bots;

    const e = new EmbedBuilder()
      .setTitle(`🏠 ${guild.name}`)
      .setThumbnail(guild.iconURL() ?? null)
      .addFields(
        { name: "🆔 ID", value: guild.id, inline: true },
        { name: "👑 Владелец", value: `<@${guild.ownerId}>`, inline: true },
        { name: "📅 Создан", value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:D>`, inline: true },
        { name: "👥 Участников", value: `${humans}`, inline: true },
        { name: "🤖 Ботов", value: `${bots}`, inline: true },
        { name: "📺 Каналов", value: `${guild.channels.cache.size}`, inline: true },
        { name: "🎭 Ролей", value: `${guild.roles.cache.size}`, inline: true },
        { name: "😀 Эмодзи", value: `${guild.emojis.cache.size}`, inline: true },
      )
      .setColor(0x5865f2)
      .setTimestamp();

    await interaction.reply({ embeds: [e] });
  },
};
