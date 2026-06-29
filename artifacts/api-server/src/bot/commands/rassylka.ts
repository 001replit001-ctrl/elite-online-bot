import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import type { Command } from "../client.js";

export const rassylka: Command = {
  data: new SlashCommandBuilder()
    .setName("рассылка")
    .setDescription("Разослать сообщение всем участникам сервера в ЛС")
    .addStringOption((opt) =>
      opt.setName("сообщение").setDescription("Текст рассылки").setRequired(true)
    )
    .addStringOption((opt) =>
      opt.setName("заголовок").setDescription("Заголовок embed (необязательно)").setRequired(false)
    )
    .addStringOption((opt) =>
      opt.setName("цвет").setDescription("Цвет embed HEX (по умолчанию #5865F2)").setRequired(false)
    ),

  async execute(interaction) {
    await interaction.deferReply({ flags: 64 });

    const text = interaction.options.getString("сообщение", true);
    const title = interaction.options.getString("заголовок") ?? null;
    const colorRaw = interaction.options.getString("цвет") ?? "#5865F2";

    const colorHex = colorRaw.startsWith("#") ? colorRaw.slice(1) : colorRaw;
    const colorNum = parseInt(colorHex, 16);
    const color = isNaN(colorNum) ? 0x5865f2 : colorNum;

    const guild = interaction.guild;
    if (!guild) {
      await interaction.editReply("❌ Команда доступна только на сервере.");
      return;
    }

    await guild.members.fetch();
    const members = guild.members.cache.filter((m) => !m.user.bot);

    let sent = 0;
    let failed = 0;
    let closed = 0;

    const e = new EmbedBuilder()
      .setDescription(text)
      .setColor(color)
      .setTimestamp()
      .setFooter({ text: `Рассылка от ${guild.name}`, iconURL: guild.iconURL() ?? undefined });

    if (title) e.setTitle(title);

    const statusMsg = await interaction.editReply(`⏳ Начинаю рассылку... 0 / ${members.size}`);

    let i = 0;
    for (const [, member] of members) {
      i++;
      try {
        await member.send({ embeds: [e] });
        sent++;
      } catch (err: unknown) {
        const code = (err as { code?: number }).code;
        if (code === 50007) {
          closed++;
        } else {
          failed++;
        }
      }

      if (i % 10 === 0) {
        await statusMsg.edit(`⏳ Рассылка... ${i} / ${members.size}`).catch(() => {});
      }

      await new Promise((r) => setTimeout(r, 300));
    }

    const resultEmbed = new EmbedBuilder()
      .setTitle("📬 Рассылка завершена")
      .addFields(
        { name: "✅ Доставлено", value: `${sent}`, inline: true },
        { name: "🔒 ЛС закрыто", value: `${closed}`, inline: true },
        { name: "❌ Ошибки", value: `${failed}`, inline: true }
      )
      .setColor(0x2ecc71)
      .setTimestamp();

    await statusMsg.edit({ content: "", embeds: [resultEmbed] });
  },
};
