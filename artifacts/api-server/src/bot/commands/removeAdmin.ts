import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from "discord.js";
import type { Command } from "../client.js";

const ADMIN_ROLE_ID = "1486707682852343859";

export const removeadmin: Command = {
  data: new SlashCommandBuilder()
    .setName("removeadmin")
    .setDescription("Снять роль администратора пользователю")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addUserOption((opt) =>
      opt
        .setName("пользователь")
        .setDescription("Пользователь, у которого снять администратора")
        .setRequired(true)
    ),

  async execute(interaction) {
    const user = interaction.options.getUser("пользователь");

    if (!user) {
      return interaction.reply({
        content: "❌ Пользователь не указан.",
        flags: 64,
      });
    }

    const member = await interaction.guild?.members.fetch(user.id);

    if (!member) {
      return interaction.reply({
        content: "❌ Пользователь не найден.",
        flags: 64,
      });
    }

    const role = interaction.guild?.roles.cache.get(ADMIN_ROLE_ID);

    if (!role) {
      return interaction.reply({
        content: "❌ Роль администратора не найдена.",
        flags: 64,
      });
    }

    if (!member.roles.cache.has(role.id)) {
      return interaction.reply({
        content: "⚠️ У пользователя нет роли администратора.",
        flags: 64,
      });
    }

    await member.roles.remove(role);

    const embed = new EmbedBuilder()
      .setTitle("🔻 Администратор снят")
      .setDescription(
        `У пользователя <@${member.id}> снята роль администратора.`
      )
      .setColor(0xff0000)
      .setTimestamp();

    return interaction.reply({
      embeds: [embed],
    });
  },
};