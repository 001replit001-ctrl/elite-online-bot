import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import type { Command } from "../client.js";

export const kubik: Command = {
  data: new SlashCommandBuilder()
    .setName("кубик")
    .setDescription("Бросить кубик")
    .addIntegerOption((opt) =>
      opt.setName("стороны").setDescription("Количество сторон (по умолчанию 6)").setRequired(false).setMinValue(2).setMaxValue(1000)
    )
    .addUserOption((opt) =>
      opt.setName("игрок").setDescription("Бросить против другого игрока").setRequired(false)
    ),

  async execute(interaction) {
    const sides = interaction.options.getInteger("стороны") ?? 6;
    const target = interaction.options.getUser("игрок");

    const emoji = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

    if (target && target.id !== interaction.user.id) {
      const r1 = Math.floor(Math.random() * sides) + 1;
      const r2 = Math.floor(Math.random() * sides) + 1;
      const e1 = sides === 6 ? emoji[r1 - 1] : `**${r1}**`;
      const e2 = sides === 6 ? emoji[r2 - 1] : `**${r2}**`;

      let result: string;
      if (r1 > r2) result = `🏆 Победил <@${interaction.user.id}>!`;
      else if (r2 > r1) result = `🏆 Победил <@${target.id}>!`;
      else result = "🤝 Ничья!";

      const e = new EmbedBuilder()
        .setTitle(`🎲 Дуэль на кубик (d${sides})`)
        .setDescription(
          `<@${interaction.user.id}>: ${e1} (${r1})\n<@${target.id}>: ${e2} (${r2})\n\n${result}`
        )
        .setColor(0x9b59b6)
        .setTimestamp();
      await interaction.reply({ embeds: [e] });
    } else {
      const r = Math.floor(Math.random() * sides) + 1;
      const em = sides === 6 ? emoji[r - 1] : `**${r}**`;
      const e = new EmbedBuilder()
        .setTitle(`🎲 Кубик d${sides}`)
        .setDescription(`<@${interaction.user.id}> бросает кубик...\n\n${em} **${r}**`)
        .setColor(0x9b59b6)
        .setTimestamp();
      await interaction.reply({ embeds: [e] });
    }
  },
};
