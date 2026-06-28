import {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
  ChannelType,
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
      opt.setName("победителей")
        .setDescription("Количество победителей (по умолчанию 1)")
        .setRequired(false)
        .setMinValue(1)
        .setMaxValue(10)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const prize = interaction.options.getString("приз", true);
    const description = interaction.options.getString("описание") ?? "";
    const winnersCount = interaction.options.getInteger("победителей") ?? 1;

    const e = new EmbedBuilder()
      .setTitle("🎉 РОЗЫГРЫШ 🎉")
      .addFields(
        { name: "🎁 Приз", value: prize },
        { name: "🏆 Победителей", value: `${winnersCount}` },
        { name: "👥 Участников", value: "0" },
        ...(description ? [{ name: "📝 Описание", value: description }] : []),
        { name: "📌 Участие", value: "Нажмите кнопку **«Участвовать»** ниже!" },
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

    let threadId: string | undefined;
    const channel = interaction.channel;
    if (channel && channel.type === ChannelType.GuildText) {
      try {
        const thread = await channel.threads.create({
          name: "🎉 Участники розыгрыша",
          startMessage: msg.id,
          type: ChannelType.PublicThread,
        });
        threadId = thread.id;
        await thread.send(`👋 Участвуй в розыгрыше нажав кнопку на сообщении выше!\n🎁 **Приз:** ${prize}`);
      } catch {
      }
    }

    giveaways.set(msg.id, {
      prize,
      participants: new Set(),
      channelId: interaction.channelId,
      hostId: interaction.user.id,
      messageId: msg.id,
      ended: false,
      winnersCount,
      threadId,
    });
  },
};
