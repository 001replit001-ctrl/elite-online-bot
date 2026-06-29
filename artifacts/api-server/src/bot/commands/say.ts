import { SlashCommandBuilder } from "discord.js";
import type { Command } from "../client.js";

export const say: Command = {
  data: new SlashCommandBuilder()
    .setName("say")
    .setDescription("Бот отправит твоё сообщение")
    .addStringOption((opt) =>
      opt.setName("сообщение").setDescription("Текст сообщения").setRequired(true)
    )
    .addChannelOption((opt) =>
      opt.setName("канал").setDescription("Канал для отправки (по умолчанию — текущий)").setRequired(false)
    ),

  async execute(interaction) {
    await interaction.deferReply({ flags: 64 });

    const text = interaction.options.getString("сообщение", true);
    const channel = interaction.options.getChannel("канал") ?? interaction.channel;

    if (!channel || !("send" in channel)) {
      await interaction.editReply("❌ Не могу отправить в этот канал.");
      return;
    }

    await (channel as { send: (text: string) => Promise<unknown> }).send(text);
    await interaction.editReply("✅ Отправлено!");
  },
};
