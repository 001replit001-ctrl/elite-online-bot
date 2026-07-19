import {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import type { Command } from "../client.js";

export const verify: Command = {
  data: new SlashCommandBuilder()
    .setName("verify")
    .setDescription("Создать сообщение верификации")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption((opt) =>
      opt
        .setName("роль")
        .setDescription("ID роли для выдачи")
        .setRequired(true)
    )
    .addStringOption((opt) =>
      opt
        .setName("заголовок")
        .setDescription("Заголовок сообщения")
        .setRequired(true)
    )
    .addStringOption((opt) =>
      opt
        .setName("описание")
        .setDescription("Описание сообщения")
        .setRequired(true)
    ),

  async execute(interaction) {
    const roleId = interaction.options.getString("роль");
    const title = interaction.options.getString("заголовок");
    const description = interaction.options.getString("описание");

    if (!roleId || !title || !description) {
      return interaction.reply({
        content: "❌ Не все данные указаны.",
        flags: 64,
      });
    }

    const role = interaction.guild?.roles.cache.get(roleId);

    if (!role) {
      return interaction.reply({
        content: "❌ Роль не найдена.",
        flags: 64,
      });
    }

    const embed = new EmbedBuilder()
      .setTitle(title)
      .setDescription(description)
      .setColor(0x5865f2)
      .setTimestamp();

    const button = new ButtonBuilder()
      .setCustomId(`verify_role_${role.id}`)
      .setLabel("✅ Верифицироваться")
      .setStyle(ButtonStyle.Success);

    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(button);

    await interaction.channel?.send({
      embeds: [embed],
      components: [row],
    });

    await interaction.reply({
      content: "✅ Сообщение верификации создано.",
      flags: 64,
    });
  },
};
