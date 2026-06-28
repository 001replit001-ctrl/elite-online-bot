import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import type { Command } from "../client.js";

export const monetka: Command = {
  data: new SlashCommandBuilder()
    .setName("монетка")
    .setDescription("Подбросить монетку")
    .addUserOption((opt) =>
      opt.setName("игрок").setDescription("Бросить монетку с другим игроком").setRequired(false)
    ),

  async execute(interaction) {
    const target = interaction.options.getUser("игрок");
    const result = Math.random() < 0.5 ? "🦅 Орёл" : "🔵 Решка";

    if (target && target.id !== interaction.user.id) {
      const winner = Math.random() < 0.5 ? interaction.user : target;
      const e = new EmbedBuilder()
        .setTitle("🪙 Бросок монетки")
        .setDescription(
          `<@${interaction.user.id}> бросил монетку с <@${target.id}>!\n\n${result}\n\n🏆 **Победитель:** <@${winner.id}>`
        )
        .setColor(0xf1c40f)
        .setTimestamp();
      await interaction.reply({ embeds: [e] });
    } else {
      const e = new EmbedBuilder()
        .setTitle("🪙 Монетка")
        .setDescription(`<@${interaction.user.id}> подбросил монетку...\n\n**${result}!**`)
        .setColor(0xf1c40f)
        .setTimestamp();
      await interaction.reply({ embeds: [e] });
    }
  },
};
