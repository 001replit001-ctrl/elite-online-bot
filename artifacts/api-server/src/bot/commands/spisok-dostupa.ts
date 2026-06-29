import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import type { Command } from "../client.js";
import { OWNER_ID, allowedUsers } from "../access-state.js";

export const spisokDostupa: Command = {
  data: new SlashCommandBuilder()
    .setName("список-доступа")
    .setDescription("Показать пользователей с доступом к модер-командам"),

  async execute(interaction) {
    await interaction.deferReply({ flags: 64 });

    const lines: string[] = [`👑 <@${OWNER_ID}> — владелец`];

    if (allowedUsers.size === 0) {
      lines.push("\n*Дополнительных пользователей нет*");
    } else {
      for (const id of allowedUsers) {
        lines.push(`🛡️ <@${id}>`);
      }
    }

    const embed = new EmbedBuilder()
      .setTitle("🔑 Список доступа к модер-командам")
      .setDescription(lines.join("\n"))
      .setColor(0x5865f2)
      .setTimestamp()
      .setFooter({ text: `Всего: ${1 + allowedUsers.size} чел.` });

    await interaction.editReply({ embeds: [embed] });
  },
};
