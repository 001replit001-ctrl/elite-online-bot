import { SlashCommandBuilder } from "discord.js";
import type { Command } from "../client.js";
import { OWNER_ID, allowedUsers, saveAccessState } from "../access-state.js";

export const zabratDostup: Command = {
  data: new SlashCommandBuilder()
    .setName("забрать-доступ")
    .setDescription("Забрать доступ к модер-командам у пользователя")
    .addUserOption((opt) =>
      opt.setName("пользователь").setDescription("У кого забрать доступ").setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply({ flags: 64 });

    if (interaction.user.id !== OWNER_ID) {
      await interaction.editReply("❌ Только владелец может забирать доступ.");
      return;
    }

    const target = interaction.options.getUser("пользователь", true);

    if (target.id === OWNER_ID) {
      await interaction.editReply("❌ Нельзя забрать доступ у владельца.");
      return;
    }

    if (!allowedUsers.has(target.id)) {
      await interaction.editReply(`ℹ️ У <@${target.id}> и так нет доступа.`);
      return;
    }

    allowedUsers.delete(target.id);
    saveAccessState();

    await interaction.editReply(`✅ Доступ <@${target.id}> к модер-командам забран.`);
  },
};
