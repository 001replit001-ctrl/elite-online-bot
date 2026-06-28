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
const actions = ["прорвался сквозь защиту", "нанёс смертельный удар", "застал врасплох", "использовал хитрый приём", "одержал победу в честном бою"];

export const duel: Command = {
  data: new SlashCommandBuilder()
    .setName("дуэль")
    .setDescription("Вызвать игрока на дуэль")
    .addUserOption((opt) =>
      opt.setName("игрок").setDescription("Кого вызвать").setRequired(true)
    )
    .addStringOption((opt) =>
      opt.setName("ставка").setDescription("Что поставить на кон (необязательно)").setRequired(false)
    ),

  async execute(interaction) {
    const target = interaction.options.getUser("игрок", true);
    const prize = interaction.options.getString("ставка") ?? "";

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

    const e = new EmbedBuilder()
      .setTitle("⚔️ Вызов на дуэль!")
      .setDescription(
        `<@${interaction.user.id}> вызывает <@${target.id}> на дуэль!\n\n${prize ? `🏆 **Ставка:** ${prize}\n\n` : ""}⏳ <@${target.id}>, принимаешь вызов?`
      )
      .setColor(0xe74c3c)
      .setTimestamp();

    const msg = await interaction.reply({ embeds: [e], components: [row], fetchReply: true });

    duelRequests.set(msg.id, {
      hostId: interaction.user.id,
      targetId: target.id,
      prize,
    });

    setTimeout(() => {
      if (duelRequests.has(msg.id)) {
        duelRequests.delete(msg.id);
        msg.edit({ components: [] }).catch(() => {});
      }
    }, 60_000);
  },
};

export function resolveDuel(hostId: string, targetId: string, prize: string) {
  const winner = Math.random() < 0.5 ? hostId : targetId;
  const loser = winner === hostId ? targetId : hostId;
  const weapon = weapons[Math.floor(Math.random() * weapons.length)];
  const action = actions[Math.floor(Math.random() * actions.length)];

  const e = new EmbedBuilder()
    .setTitle("⚔️ Дуэль завершена!")
    .setDescription(
      `Бойцы сошлись в схватке...\n\n🗡️ <@${winner}> взял **${weapon}** и ${action}!\n\n🏆 **Победитель:** <@${winner}>\n💀 **Проиграл:** <@${loser}>${prize ? `\n\n🎁 **Ставка:** ${prize}` : ""}`
    )
    .setColor(0xe74c3c)
    .setTimestamp();

  return e;
}
