import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import type { Command } from "../client.js";

const MP_ROLE = "<@&1486708220234825949>";

export const monetka: Command = {
  data: new SlashCommandBuilder()
    .setName("монетка")
    .setDescription("Подбросить монетку")
    .addUserOption((opt) =>
      opt.setName("игрок").setDescription("Бросить монетку с другим игроком").setRequired(false)
    )
    .addUserOption((opt) =>
      opt.setName("организатор").setDescription("Тег организатора").setRequired(false)
    ),

  async execute(interaction) {
    const target = interaction.options.getUser("игрок");
    const organizer = interaction.options.getUser("организатор");
    const result = Math.random() < 0.5 ? "🦅 Орёл" : "🔵 Решка";
    const orgField = organizer ? [{ name: "🎯 Организатор", value: `<@${organizer.id}>` }] : [];

    if (target && target.id !== interaction.user.id) {
      const winner = Math.random() < 0.5 ? interaction.user : target;
      const e = new EmbedBuilder()
        .setTitle("🪙 Бросок монетки")
        .setDescription(
          `<@${interaction.user.id}> бросил монетку с <@${target.id}>!\n\n${result}\n\n🏆 **Победитель:** <@${winner.id}>`
        )
        .addFields(orgField)
        .setColor(0xf1c40f)
        .setTimestamp();
      await interaction.reply({ content: MP_ROLE, embeds: [e] });
    } else {
      const e = new EmbedBuilder()
        .setTitle("🪙 Монетка")
        .setDescription(`<@${interaction.user.id}> подбросил монетку...\n\n**${result}!**`)
        .addFields(orgField)
        .setColor(0xf1c40f)
        .setTimestamp();
      await interaction.reply({ content: MP_ROLE, embeds: [e] });
    }
  },
};
