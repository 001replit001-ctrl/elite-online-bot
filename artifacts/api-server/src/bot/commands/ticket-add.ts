import { SlashCommandBuilder, PermissionFlagsBits, ChannelType } from "discord.js";
import type { Command } from "../client.js";
import { openTickets } from "../ticket-state.js";

export const ticketAdd: Command = {
  data: new SlashCommandBuilder()
    .setName("тикет-добавить")
    .setDescription("Добавить пользователя в текущий тикет")
    .addUserOption((opt) =>
      opt.setName("пользователь").setDescription("Кого добавить").setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    await interaction.deferReply({ flags: 64 });

    const ticket = openTickets.get(interaction.channelId);
    if (!ticket) {
      await interaction.editReply("❌ Эта команда работает только внутри тикет-канала.");
      return;
    }

    const target = interaction.options.getUser("пользователь", true);
    const channel = interaction.channel;
    if (!channel || channel.type !== ChannelType.GuildText) {
      await interaction.editReply("❌ Неверный тип канала.");
      return;
    }

    await channel.permissionOverwrites.edit(target.id, {
      ViewChannel: true,
      SendMessages: true,
      ReadMessageHistory: true,
      AttachFiles: true,
    });

    await interaction.editReply(`✅ <@${target.id}> добавлен в тикет.`);
    await channel.send(
      `📌 <@${target.id}> был добавлен в тикет сотрудником <@${interaction.user.id}>.`
    );
  },
};
