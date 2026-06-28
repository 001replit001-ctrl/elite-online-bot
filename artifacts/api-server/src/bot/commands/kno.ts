import {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import type { Command } from "../client.js";
import { knoGames } from "../state.js";

export const kno: Command = {
  data: new SlashCommandBuilder()
    .setName("кно")
    .setDescription("Камень-ножницы-бумага против другого игрока")
    .addUserOption((opt) =>
      opt.setName("игрок").setDescription("Кого вызвать на бой").setRequired(true)
    ),

  async execute(interaction) {
    const target = interaction.options.getUser("игрок", true);

    if (target.id === interaction.user.id) {
      await interaction.reply({ content: "❌ Нельзя играть с самим собой!", flags: 64 });
      return;
    }
    if (target.bot) {
      await interaction.reply({ content: "❌ Нельзя играть против бота!", flags: 64 });
      return;
    }

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId("kno_камень").setLabel("🪨 Камень").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId("kno_ножницы").setLabel("✂️ Ножницы").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId("kno_бумага").setLabel("📄 Бумага").setStyle(ButtonStyle.Secondary)
    );

    const e = new EmbedBuilder()
      .setTitle("✂️ Камень-Ножницы-Бумага")
      .setDescription(
        `<@${interaction.user.id}> вызвал <@${target.id}> на бой!\n\nОба игрока нажимают кнопку — выбор скрытый. Побеждает сильнейший!\n\n⏳ Ожидаем выборы...`
      )
      .setColor(0x3498db)
      .setTimestamp();

    const msg = await interaction.reply({ embeds: [e], components: [row], fetchReply: true });

    knoGames.set(msg.id, {
      hostId: interaction.user.id,
      targetId: target.id,
      hostChoice: null,
      targetChoice: null,
      messageId: msg.id,
    });
  },
};
