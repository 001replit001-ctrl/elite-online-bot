import { SlashCommandBuilder } from "discord.js";
import type { Command } from "../client.js";
import { OWNER_ID, allowedUsers, saveAccessState } from "../access-state.js";

export const vydatDostup: Command = {
  data: new SlashCommandBuilder()
    .setName("выдать-доступ")
    .setDescription("Выдать доступ к модер-командам пользователю")
    .addUserOption((opt) =>
      opt.setName("пользователь").setDescription("Кому выдать доступ").setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply({ flags: 64 });

    if (interaction.user.id !== OWNER_ID) {
      await interaction.editReply("❌ Только владелец может выдавать доступ.");
      return;
    }

    const target = interaction.options.getUser("пользователь", true);

    if (target.id === OWNER_ID) {
      await interaction.editReply("ℹ️ У владельца всегда есть полный доступ.");
      return;
    }

    if (allowedUsers.has(target.id)) {
      await interaction.editReply(`ℹ️ У <@${target.id}> уже есть доступ.`);
      return;
    }

    allowedUsers.add(target.id);
    saveAccessState();

    await interaction.editReply(`✅ <@${target.id}> получил доступ к модер-командам.`);
  },
};
