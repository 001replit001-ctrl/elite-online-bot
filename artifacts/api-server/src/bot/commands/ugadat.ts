import { SlashCommandBuilder } from "discord.js";
import type { Command } from "../client.js";

export const ugadat: Command = {
  data: new SlashCommandBuilder()
    .setName("угадать")
    .setDescription("Написать ответ в ветке игры (или просто пиши в ветке напрямую)")
    .addStringOption((opt) =>
      opt.setName("ответ").setDescription("Твой ответ").setRequired(true)
    ),

  async execute(interaction) {
    await interaction.reply({
      content: "👇 Просто напиши своё число/название прямо в ветке игры — бот проверит автоматически!",
      flags: 64,
    });
  },
};
