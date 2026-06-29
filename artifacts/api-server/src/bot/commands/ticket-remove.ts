import { SlashCommandBuilder, ChannelType } from "discord.js";
import type { Command } from "../client.js";
import { openTickets } from "../ticket-state.js";

export const ticketRemove: Command = {
  data: new SlashCommandBuilder()
    .setName("тикет-убрать")
    .setDescription("Убрать пользователя из текущего тикета")
    .addUserOption((opt) =>
      opt.setName("пользователь").setDescription("Кого убрать").setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply({ flags: 64 });

    const ticket = openTickets.get(interaction.channelId);
    if (!ticket) {
      await interaction.editReply("❌ Эта команда работает только внутри тикет-канала.");
      return;
    }

    const target = interaction.options.getUser("пользователь", true);

    if (target.id === ticket.userId) {
      await interaction.editReply("❌ Нельзя убрать автора тикета.");
      return;
    }

    const channel = interaction.channel;
    if (!channel || channel.type !== ChannelType.GuildText) {
      await interaction.editReply("❌ Неверный тип канала.");
      return;
    }

    await channel.permissionOverwrites.edit(target.id, {
      ViewChannel: false,
      SendMessages: false,
    });

    await interaction.editReply(`✅ <@${target.id}> убран из тикета.`);
  },
};
