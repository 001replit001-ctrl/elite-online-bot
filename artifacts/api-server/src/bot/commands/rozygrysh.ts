import {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
} from "discord.js";
import type { Command } from "../client.js";
import { giveaways } from "../state.js";

export const rozygrysh: Command = {
  data: new SlashCommandBuilder()
    .setName("розыгрыш")
    .setDescription("Запустить розыгрыш с кнопкой участия")
    .addStringOption((opt) =>
      opt.setName("приз").setDescription("Приз для победителя").setRequired(true)
    )
    .addStringOption((opt) =>
      opt.setName("описание").setDescription("Дополнительное описание розыгрыша").setRequired(false)
    )
    .addIntegerOption((opt) =>
      opt.setName("победителей").setDescription("Количество победителей (по умолчанию 1)").setRequired(false).setMinValue(1).setMaxValue(10)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const prize = interaction.options.getString("приз", true);
    const description = interaction.options.getString("описание") ?? "";
    const winnersCount = interaction.options.getInteger("победителей") ?? 1;

    const e = new EmbedBuilder()
      .setTitle("🎉 РОЗЫГРЫШ")
      .setDescription(
        `🎁 **Приз:** ${prize}\n${description ? `📝 ${description}\n` : ""}\n👥 **Участников:** 0\n🏆 **Победителей:** ${winnersCount}\n\n➡️ Нажми кнопку **«Участвовать»** чтобы войти в розыгрыш!\n\nЧтобы завершить: \`/завершить-розыгрыш\``
      )
      .setColor(0xf39c12)
      .setTimestamp()
      .setFooter({ text: `Организатор: ${interaction.user.username}` });

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("giveaway_join")
        .setLabel("🎉 Участвовать")
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId("giveaway_leave")
        .setLabel("❌ Выйти")
        .setStyle(ButtonStyle.Danger)
    );

    const msg = await interaction.reply({ embeds: [e], components: [row], fetchReply: true });

    giveaways.set(msg.id, {
      prize,
      participants: new Set(),
      channelId: interaction.channelId,
      hostId: interaction.user.id,
      messageId: msg.id,
      ended: false,
      winnersCount,
    });
  },
};
