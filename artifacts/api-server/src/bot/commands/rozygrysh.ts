import {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
} from "discord.js";
import type { Command } from "../client.js";
import { giveaways } from "../state.js";

export const rozygrysh: Command = {
  data: new SlashCommandBuilder()
    .setName("розыгрыш")
    .setDescription("Запустить розыгрыш с кнопкой участия")
    .addStringOption((opt) =>
      opt
        .setName("приз")
        .setDescription("Приз для победителя")
        .setRequired(true),
    )
    .addStringOption((opt) =>
      opt
        .setName("время")
        .setDescription("Время розыгрыша: 1m, 30m, 1h")
        .setRequired(true),
    )
    .addUserOption((opt) =>
      opt
        .setName("организатор")
        .setDescription("Тег организатора")
        .setRequired(false),
    )
    .addStringOption((opt) =>
      opt
        .setName("описание")
        .setDescription("Дополнительное описание розыгрыша")
        .setRequired(false),
    )
    .addIntegerOption((opt) =>
      opt
        .setName("победителей")
        .setDescription("Количество победителей")
        .setRequired(false)
        .setMinValue(1)
        .setMaxValue(10),
    ),
    
  async execute(interaction) {
    const channel = interaction.channel;

    if (!channel || channel.type !== ChannelType.GuildText) {
      await interaction.reply({
        content: "❌ Только для текстовых каналов.",
        flags: 64,
      });
      return;
    }

    await interaction.deferReply({ flags: 64 });

    const prize = interaction.options.getString("приз", true);
    const organizer =
      interaction.options.getUser("организатор") ?? interaction.user;
    const description =
      interaction.options.getString("описание") ?? "";
    const winnersCount =
      interaction.options.getInteger("победителей") ?? 1;

    const time = interaction.options.getString("время", true);

    const match = time.match(/^(\d+)(m|h)$/);

    if (!match) {
      await interaction.editReply(
        "❌ Неверный формат времени. Используй: 1m, 30m, 1h",
      );
      return;
    }

    const value = Number(match[1]);
    const unit = match[2];

    const duration =
      unit === "m"
        ? value * 60 * 1000
        : value * 60 * 60 * 1000;

    if (duration < 60 * 1000) {
      await interaction.editReply(
        "❌ Минимальное время — 1 минута.",
      );
      return;
    }

    if (duration > 24 * 60 * 60 * 1000) {
      await interaction.editReply(
        "❌ Максимальное время — 24 часа.",
      );
      return;
    }

    const endTime = Date.now() + duration;

    const embed = new EmbedBuilder()
      .setTitle("🎉 РОЗЫГРЫШ 🎉")
      .addFields(
        {
          name: "🎁 Приз",
          value: prize,
        },
        {
          name: "🏆 Победителей",
          value: `${winnersCount}`,
          inline: true,
        },
        {
          name: "👥 Участников",
          value: "0",
          inline: true,
        },
        {
          name: "⏳ Закончится",
          value: `<t:${Math.floor(endTime / 1000)}:R>`,
          inline: true,
        },
        {
          name: "🎯 Организатор",
          value: `<@${organizer.id}>`,
        },
        ...(description
          ? [{ name: "📝 Описание", value: description }]
          : []),
      )
      .setColor(0xf39c12)
      .setTimestamp()
      .setFooter({
        text: "Нажмите кнопку чтобы участвовать!",
      });

    const row =
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId("giveaway_join")
          .setLabel("🎉 Участвовать")
          .setStyle(ButtonStyle.Success),

        new ButtonBuilder()
          .setCustomId("giveaway_leave")
          .setLabel("❌ Выйти")
          .setStyle(ButtonStyle.Danger),
      );

    const msg = await channel.send({
      content: "<@&1486708220234825949>",
      embeds: [embed],
      components: [row],
    });

    giveaways.set(msg.id, {
      prize,
      participants: new Set(),
      channelId: interaction.channelId,
      hostId: organizer.id,
      messageId: msg.id,
      ended: false,
      winnersCount,
      endTime,
    });

    setTimeout(async () => {
      const giveaway = giveaways.get(msg.id);

      if (!giveaway || giveaway.ended) return;

      giveaway.ended = true;

      const disabledRow =
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setCustomId("giveaway_join")
            .setLabel("🎉 Участвовать")
            .setStyle(ButtonStyle.Success)
            .setDisabled(true),

          new ButtonBuilder()
            .setCustomId("giveaway_leave")
            .setLabel("❌ Выйти")
            .setStyle(ButtonStyle.Danger)
            .setDisabled(true),
        );

      await msg.edit({
        components: [disabledRow],
      });

      const participants = [...giveaway.participants];

      if (participants.length === 0) {
        await channel.send(
          "❌ Розыгрыш завершён, участников нет.",
        );
        return;
      }

      const winners = [];

      const pool = [...participants];

      for (
        let i = 0;
        i < Math.min(winnersCount, pool.length);
        i++
      ) {
        const index = Math.floor(
          Math.random() * pool.length,
        );

        winners.push(pool[index]);
        pool.splice(index, 1);
      }

      await channel.send({
        content:
          `🎉 **Розыгрыш завершён!**\n\n` +
          `🎁 **Приз:**\n${prize}\n\n` +
          `🏆 **Победитель:**\n${winners
            .map((id) => `<@${id}>`)
            .join("\n")}`,
      });
    }, duration);

    await interaction.editReply(
      "<a:1000022454:1521448449407455363> Розыгрыш создан!",
    );
  },
};