import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
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
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const text = interaction.options.getString("сообщение", true);
    const channel = interaction.options.getChannel("канал") ?? interaction.channel;

    if (!channel || !("send" in channel)) {
      await interaction.reply({ content: "❌ Не могу отправить в этот канал.", flags: 64 });
      return;
    }

    await (channel as { send: (text: string) => Promise<unknown> }).send(text);
    await interaction.reply({ content: "✅ Сообщение отправлено!", flags: 64 });
  },
};
