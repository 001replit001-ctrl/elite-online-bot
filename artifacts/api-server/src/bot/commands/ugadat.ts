import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import type { Command } from "../client.js";
import { numberGames, carGames } from "../state.js";

export const ugadat: Command = {
  data: new SlashCommandBuilder()
    .setName("угадать")
    .setDescription("Назвать ответ в активной игре")
    .addStringOption((opt) =>
      opt.setName("ответ").setDescription("Твой ответ (число или название машины)").setRequired(true)
    ),

  async execute(interaction) {
    const channelId = interaction.channelId;
    const userId = interaction.user.id;
    const answer = interaction.options.getString("ответ", true).trim();

    const numGame = numberGames.get(channelId);
    if (numGame) {
      const attempts = numGame.attempts.get(userId) ?? 0;
      const maxAttempts = 5;

      if (attempts >= maxAttempts) {
        await interaction.reply({ content: `❌ У тебя закончились попытки в этой игре!`, flags: 64 });
        return;
      }

      const guess = parseInt(answer);
      if (isNaN(guess)) {
        await interaction.reply({ content: "❌ Введи число!", flags: 64 });
        return;
      }

      numGame.attempts.set(userId, attempts + 1);
      const left = maxAttempts - attempts - 1;

      if (guess === numGame.number) {
        numberGames.delete(channelId);
        const e = new EmbedBuilder()
          .setTitle("🎉 Победитель!")
          .setDescription(
            `<@${userId}> угадал число **${numGame.number}**!\n\n🎁 **Приз:** ${numGame.prize}`
          )
          .setColor(0x2ecc71)
          .setTimestamp();
        await interaction.reply({ embeds: [e] });
      } else if (guess < numGame.number) {
        await interaction.reply({ content: `📉 **${guess}** — слишком мало! Осталось попыток: **${left}**`, flags: 64 });
      } else {
        await interaction.reply({ content: `📈 **${guess}** — слишком много! Осталось попыток: **${left}**`, flags: 64 });
      }
      return;
    }

    const carGame = carGames.get(channelId);
    if (carGame) {
      if (carGame.guesses.has(userId)) {
        await interaction.reply({ content: "❌ Ты уже угадывал в этой игре и не угадал!", flags: 64 });
        return;
      }

      carGame.guesses.add(userId);
      const guess = answer.toLowerCase();

      if (guess === carGame.car) {
        carGames.delete(channelId);
        const e = new EmbedBuilder()
          .setTitle("🎉 Правильно!")
          .setDescription(
            `<@${userId}> угадал машину — **${answer}**!\n\n🎁 **Приз:** ${carGame.prize}`
          )
          .setColor(0x2ecc71)
          .setTimestamp();
        await interaction.reply({ embeds: [e] });
      } else {
        await interaction.reply({ content: `❌ **${answer}** — неверно! Попробуй ещё раз... хотя у тебя только одна попытка 😅`, flags: 64 });
      }
      return;
    }

    await interaction.reply({ content: "❌ В этом канале нет активной игры.", flags: 64 });
  },
};
