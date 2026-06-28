import {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import type { Command } from "../client.js";
import { duelRequests } from "../state.js";

const weapons = ["⚔️ Меч", "🏹 Лук", "🔱 Трезубец", "🪓 Топор", "🗡️ Кинжал"];
const actions = [
  "прорвался сквозь защиту",
  "нанёс смертельный удар",
  "застал врасплох",
  "использовал хитрый приём",
  "одержал победу в честном бою",
];

export const duel: Command = {
  data: new SlashCommandBuilder()
    .setName("дуэль")
    .setDescription("Вызвать игрока на дуэль")
    .addUserOption((opt) =>
      opt.setName("игрок").setDescription("Кого вызвать").setRequired(true)
    )
    .addStringOption((opt) =>
      opt.setName("ставка").setDescription("Что поставить на кон (необязательно)").setRequired(false)
    )
    .addUserOption((opt) =>
      opt.setName("организатор").setDescription("Тег организатора").setRequired(false)
    ),

  async execute(interaction) {
    const target = interaction.options.getUser("игрок", true);
    const prize = interaction.options.getString("ставка") ?? "";
    const organizer = interaction.options.getUser("организатор");

    if (target.id === interaction.user.id) {
      await interaction.reply({ content: "❌ Нельзя вызвать самого себя!", flags: 64 });
      return;
    }
    if (target.bot) {
      await interaction.reply({ content: "❌ Боты не принимают вызовы!", flags: 64 });
      return;
    }

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId("duel_accept").setLabel("⚔️ Принять вызов").setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId("duel_decline").setLabel("🏳️ Отказаться").setStyle(ButtonStyle.Danger)
    );

    const fields = [
      ...(prize ? [{ name: "🏆 Ставка", value: prize }] : []),
      ...(organizer ? [{ name: "🎯 Организатор", value: `<@${organizer.id}>` }] : []),
    ];

    const e = new EmbedBuilder()
      .setTitle("⚔️ Вызов на дуэль!")
      .setDescription(
        `<@${interaction.user.id}> вызывает <@${target.id}> на дуэль!\n\n⏳ <@${target.id}>, принимаешь вызов?`
      )
      .setColor(0xe74c3c)
      .setTimestamp();

    if (fields.length) e.addFields(fields);

    await interaction.deferReply({ flags: 64 });

    const ch = interaction.channel;
    if (!ch || !("send" in ch)) { await interaction.editReply("❌ Не могу отправить."); return; }

    const msg = await (ch as {
      send: (opts: unknown) => Promise<{ id: string; edit: (opts: unknown) => Promise<unknown> }>;
    }).send({ embeds: [e], components: [row] });

    duelRequests.set(msg.id, { hostId: interaction.user.id, targetId: target.id, prize });

    setTimeout(() => {
      if (duelRequests.has(msg.id)) {
        duelRequests.delete(msg.id);
        msg.edit({ components: [] }).catch(() => {});
      }
    }, 60_000);

    await interaction.editReply("✅ Вызов отправлен!");
  },
};

export function resolveDuel(hostId: string, targetId: string, prize: string) {
  const winner = Math.random() < 0.5 ? hostId : targetId;
  const loser = winner === hostId ? targetId : hostId;
  const weapon = weapons[Math.floor(Math.random() * weapons.length)];
  const action = actions[Math.floor(Math.random() * actions.length)];

  return new EmbedBuilder()
    .setTitle("⚔️ Дуэль завершена!")
    .setDescription(
      `Бойцы сошлись в схватке...\n\n🗡️ <@${winner}> взял **${weapon}** и ${action}!\n\n🏆 **Победитель:** <@${winner}>\n💀 **Проиграл:** <@${loser}>${prize ? `\n\n🎁 **Ставка:** ${prize}` : ""}`
    )
    .setColor(0xe74c3c)
    .setTimestamp();
}
