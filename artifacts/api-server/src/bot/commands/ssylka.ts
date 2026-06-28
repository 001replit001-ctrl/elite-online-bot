import {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
} from "discord.js";
import type { Command } from "../client.js";

export const ssylka: Command = {
  data: new SlashCommandBuilder()
    .setName("ссылка")
    .setDescription("Embed с кнопкой-ссылкой")
    .addStringOption((opt) =>
      opt.setName("заголовок").setDescription("Заголовок embed").setRequired(true)
    )
    .addStringOption((opt) =>
      opt.setName("сообщение").setDescription("Текст embed").setRequired(true)
    )
    .addStringOption((opt) =>
      opt.setName("кнопка").setDescription("Название кнопки").setRequired(true)
    )
    .addStringOption((opt) =>
      opt.setName("ссылка").setDescription("URL кнопки").setRequired(true)
    )
    .addStringOption((opt) =>
      opt.setName("цвет").setDescription("Цвет embed HEX (например #2ecc71)").setRequired(false)
    )
    .addStringOption((opt) =>
      opt.setName("фото").setDescription("Ссылка на картинку").setRequired(false)
    )
    .addChannelOption((opt) =>
      opt.setName("канал").setDescription("Куда отправить").setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const title = interaction.options.getString("заголовок", true);
    const message = interaction.options.getString("сообщение", true);
    const btnLabel = interaction.options.getString("кнопка", true);
    const url = interaction.options.getString("ссылка", true);
    const colorRaw = interaction.options.getString("цвет") ?? "#5865F2";
    const image = interaction.options.getString("фото");
    const channel = interaction.options.getChannel("канал") ?? interaction.channel;

    if (!channel || !("send" in channel)) {
      await interaction.reply({ content: "❌ Не могу отправить в этот канал.", flags: 64 });
      return;
    }

    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      await interaction.reply({ content: "❌ Ссылка должна начинаться с http:// или https://", flags: 64 });
      return;
    }

    const colorHex = colorRaw.startsWith("#") ? colorRaw.slice(1) : colorRaw;
    const colorNum = parseInt(colorHex, 16);
    const color = isNaN(colorNum) ? 0x5865f2 : colorNum;

    const e = new EmbedBuilder()
      .setTitle(title)
      .setDescription(message)
      .setColor(color)
      .setTimestamp()
      .setFooter({ text: `Отправил ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() });

    if (image) e.setImage(image);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setLabel(btnLabel).setStyle(ButtonStyle.Link).setURL(url)
    );

    await (channel as { send: (opts: unknown) => Promise<unknown> }).send({ embeds: [e], components: [row] });
    await interaction.reply({ content: "✅ Сообщение со ссылкой отправлено!", flags: 64 });
  },
};
