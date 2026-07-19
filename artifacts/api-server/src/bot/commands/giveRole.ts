import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, GuildMember } from "discord.js";
import type { Command } from "../client.js";

export const giveRole: Command = {
  data: new SlashCommandBuilder()
    .setName("giverole")
    .setDescription("Выдать несколько ролей пользователю")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addUserOption((opt) =>
      opt
        .setName("пользователь")
        .setDescription("Кому выдать роли")
        .setRequired(true)
    )
    .addStringOption((opt) =>
      opt
        .setName("роли")
        .setDescription("ID ролей через запятую")
        .setRequired(true)
    ),

  async execute(interaction) {
    const member = interaction.options.getMember("пользователь");
    const rolesInput = interaction.options.getString("роли");

    if (!member || !rolesInput) {
      return interaction.reply({
        content: "❌ Ошибка данных.",
        flags: 64,
      });
    }

    if (!("roles" in member)) {
      return interaction.reply({
        content: "❌ Пользователь не является участником сервера.",
        flags: 64,
      });
    }

    const guildMember = member as GuildMember;

    const roleIds = rolesInput
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);

    const addedRoles: string[] = [];
    const failedRoles: string[] = [];

    for (const roleId of roleIds) {
      const role = interaction.guild?.roles.cache.get(roleId);

      if (!role) {
        failedRoles.push(roleId);
        continue;
      }

      try {
        if (!guildMember.roles.cache.has(role.id)) {
          await guildMember.roles.add(role);
          addedRoles.push(role.name);
        }
      } catch {
        failedRoles.push(role.name);
      }
    }

    const embed = new EmbedBuilder()
      .setTitle("✅ Роли выданы")
      .setDescription(
        `Пользователь: <@${guildMember.id}>\n\n` +
        `Выдано:\n${
          addedRoles.length
            ? addedRoles.map((r) => `✅ ${r}`).join("\n")
            : "Нет"
        }\n\n` +
        `${
          failedRoles.length
            ? `Ошибки:\n${failedRoles.map((r) => `❌ ${r}`).join("\n")}`
            : ""
        }`
      )
      .setColor(0x57f287)
      .setTimestamp();

    return interaction.reply({
      embeds: [embed],
    });
  },
};