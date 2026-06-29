import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import type { Command } from "../client.js";

export const embed: Command = {
  data: new SlashCommandBuilder()
    .setName("embed")
    .setDescription("Отправить красивое embed-сообщение")
    .addStringOption((opt) =>
      opt.setName("заголовок").setDescription("Заголовок embed").setRequired(true)
    )
    .addStringOption((opt) =>
      opt.setName("описание").setDescription("Текст embed").setRequired(true)
    )
    .addStringOption((opt) =>
      opt.setName("цвет").setDescription("Цвет (HEX, например #5865F2)").setRequired(false)
    )
    .addStringOption((opt) =>
      opt.setName("фото").setDescription("Ссылка на изображение").setRequired(false)
    )
    .addStringOption((opt) =>
      opt.setName("иконка").setDescription("Ссылка на иконку в заголовке").setRequired(false)
    )
    .addChannelOption((opt) =>
      opt.setName("канал").setDescription("Куда отправить (по умолчанию текущий)").setRequired(false)
    ),

  async execute(interaction) {
    await interaction.deferReply({ flags: 64 });

    const title = interaction.options.getString("заголовок", true);
    const description = interaction.options.getString("описание", true);
    const colorRaw = interaction.options.getString("цвет") ?? "#5865F2";
    const image = interaction.options.getString("фото");
    const thumbnail = interaction.options.getString("иконка");
    const channel = interaction.options.getChannel("канал") ?? interaction.channel;

    if (!channel || !("send" in channel)) {
      await interaction.editReply("❌ Не могу отправить в этот канал.");
      return;
    }

    const colorHex = colorRaw.startsWith("#") ? colorRaw.slice(1) : colorRaw;
    const colorNum = parseInt(colorHex, 16);
    const color = isNaN(colorNum) ? 0x5865f2 : colorNum;

    const e = new EmbedBuilder()
      .setTitle(title)
      .setDescription(description)
      .setColor(color)
      .setTimestamp();

    if (image) e.setImage(image);
    if (thumbnail) e.setThumbnail(thumbnail);

    await (channel as { send: (opts: unknown) => Promise<unknown> }).send({ embeds: [e] });
    await interaction.editReply("✅ Embed отправлен!");
  },
};
