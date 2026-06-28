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
    .addUserOption((opt) =>
      opt.setName("организатор").setDescription("Тег организатора").setRequired(false)
    )
    .addStringOption((opt) =>
      opt.setName("описание").setDescription("Дополнительное описание розыгрыша").setRequired(false)
    )
    .addIntegerOption((opt) =>
      opt
        .setName("победителей")
        .setDescription("Количество победителей (по умолчанию 1)")
        .setRequired(false)
        .setMinValue(1)
        .setMaxValue(10)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const channel = interaction.channel;
    if (!channel || channel.type !== ChannelType.GuildText) {
      await interaction.reply({ content: "❌ Только для текстовых каналов.", flags: 64 });
      return;
    }

    await interaction.deferReply({ flags: 64 });

    const prize = interaction.options.getString("приз", true);
    const organizer = interaction.options.getUser("организатор") ?? interaction.user;
    const description = interaction.options.getString("описание") ?? "";
    const winnersCount = interaction.options.getInteger("победителей") ?? 1;

    const e = new EmbedBuilder()
      .setTitle("🎉 РОЗЫГРЫШ 🎉")
      .addFields(
        { name: "🎁 Приз", value: prize },
        { name: "🏆 Победителей", value: `${winnersCount}`, inline: true },
        { name: "👥 Участников", value: "0", inline: true },
        { name: "🎯 Организатор", value: `<@${organizer.id}>` },
        ...(description ? [{ name: "📝 Описание", value: description }] : []),
      )
      .setColor(0xf39c12)
      .setTimestamp()
      .setFooter({ text: `Нажмите кнопку чтобы участвовать!` });

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId("giveaway_join").setLabel("🎉 Участвовать").setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId("giveaway_leave").setLabel("❌ Выйти").setStyle(ButtonStyle.Danger)
    );

    const msg = await channel.send({ embeds: [e], components: [row] });

    let threadId: string | undefined;
    try {
      const thread = await channel.threads.create({
        name: "🎉 Участники розыгрыша",
        startMessage: msg.id,
        type: ChannelType.PublicThread,
      });
      threadId = thread.id;
      await thread.send(`👋 Участвуй в розыгрыше нажав кнопку на сообщении выше!\n🎁 **Приз:** ${prize}\n🎯 **Организатор:** <@${organizer.id}>`);
    } catch {
    }

    giveaways.set(msg.id, {
      prize,
      participants: new Set(),
      channelId: interaction.channelId,
      hostId: organizer.id,
      messageId: msg.id,
      ended: false,
      winnersCount,
      threadId,
    });

    await interaction.editReply("✅ Розыгрыш создан!");
  },
};
