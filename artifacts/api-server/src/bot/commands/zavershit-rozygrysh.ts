import {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import type { Command } from "../client.js";
import { giveaways } from "../state.js";

export const zavershitRozygrysh: Command = {
  data: new SlashCommandBuilder()
    .setName("завершить-розыгрыш")
    .setDescription("Завершить розыгрыш и выбрать победителя")
    .addStringOption((opt) =>
      opt.setName("id").setDescription("ID сообщения розыгрыша (если несколько активных)").setRequired(false)
    ),

  async execute(interaction) {
    await interaction.deferReply({ flags: 64 });

    const inputId = interaction.options.getString("id");

    let giveaway = inputId ? giveaways.get(inputId) : undefined;
    let giveawayId = inputId ?? "";

    if (!giveaway) {
      for (const [id, g] of giveaways) {
        if (g.channelId === interaction.channelId && !g.ended) {
          giveaway = g;
          giveawayId = id;
          break;
        }
      }
    }

    if (!giveaway) {
      await interaction.editReply("❌ В этом канале нет активных розыгрышей.");
      return;
    }

    if (giveaway.hostId !== interaction.user.id && !interaction.memberPermissions?.has("Administrator")) {
      await interaction.editReply("❌ Завершить розыгрыш может только организатор или администратор.");
      return;
    }

    giveaway.ended = true;

    const participants = [...giveaway.participants];
    const winnersCount = (giveaway as { winnersCount?: number }).winnersCount ?? 1;

    const channel = interaction.channel;
    if (!channel || !("send" in channel)) {
      await interaction.editReply("❌ Не могу отправить результат в канал.");
      return;
    }
    const ch = channel as { send: (opts: unknown) => Promise<unknown> };

    if (participants.length === 0) {
      const e = new EmbedBuilder()
        .setTitle("🎉 Розыгрыш завершён")
        .setDescription(`**Приз:** ${giveaway.prize}\n\n😔 Никто не участвовал...`)
        .setColor(0xe74c3c)
        .setTimestamp();
      await ch.send({ embeds: [e] });
      await interaction.editReply("✅ Розыгрыш завершён.");
      giveaways.delete(giveawayId);
      return;
    }

    const shuffled = participants.sort(() => Math.random() - 0.5);
    const winners = shuffled.slice(0, Math.min(winnersCount, participants.length));
    const winnersMentions = winners.map((id) => `<@${id}>`).join(", ");

    const e = new EmbedBuilder()
      .setTitle("🎉 Розыгрыш завершён!")
      .setDescription(
        `🎁 **Приз:** ${giveaway.prize}\n\n🏆 **Победитель${winners.length > 1 ? "и" : ""}:** ${winnersMentions}\n\n👥 Участвовало: **${participants.length}** чел.`
      )
      .setColor(0x2ecc71)
      .setTimestamp()
      .setFooter({ text: `Организатор: ${interaction.user.username}` });

    const disabledRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("giveaway_join_done")
        .setLabel("🎉 Розыгрыш завершён")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true)
    );

    try {
      const origChannel = await interaction.client.channels.fetch(giveaway.channelId);
      if (origChannel && "messages" in origChannel) {
        const origMsg = await (origChannel as { messages: { fetch: (id: string) => Promise<{ edit: (opts: unknown) => Promise<unknown> }> } }).messages.fetch(giveawayId);
        await origMsg.edit({ components: [disabledRow] });
      }
    } catch { }

    await ch.send({ embeds: [e] });
    await interaction.editReply("✅ Розыгрыш завершён.");
    giveaways.delete(giveawayId);
  },
};
