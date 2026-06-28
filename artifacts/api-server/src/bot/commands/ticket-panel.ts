import {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
  ChannelType,
} from "discord.js";
import type { Command } from "../client.js";
import { ticketSetups, saveTicketState } from "../ticket-state.js";

export const ticketPanel: Command = {
  data: new SlashCommandBuilder()
    .setName("тикет-панель")
    .setDescription("Создать панель тикетов в этом канале")
    .addChannelOption((opt) =>
      opt
        .setName("лог-канал")
        .setDescription("Канал для сохранения транскриптов закрытых тикетов")
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildText)
    )
    .addRoleOption((opt) =>
      opt
        .setName("роль-staff")
        .setDescription("Роль сотрудников поддержки (видят все тикеты)")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    await interaction.deferReply({ flags: 64 });

    const logChannel = interaction.options.getChannel("лог-канал", true);
    const staffRole = interaction.options.getRole("роль-staff", true);
    const guildId = interaction.guildId!;

    ticketSetups.set(guildId, {
      logChannelId: logChannel.id,
      staffRoleId: staffRole.id,
    });
    saveTicketState();

    const embed = new EmbedBuilder()
      .setTitle("🎫 Служба поддержки")
      .setDescription(
        "### Добро пожаловать в систему поддержки!\n\n" +
        "Если у вас возникли вопросы, проблемы или предложения — создайте тикет.\n" +
        "Наша команда ответит вам в ближайшее время.\n\n" +
        "**📌 Правила:**\n" +
        "• Описывайте проблему чётко и подробно\n" +
        "• Не создавайте несколько тикетов по одной теме\n" +
        "• Будьте вежливы — это ускорит решение вашего вопроса\n\n" +
        "⏱️ Среднее время ответа: **до 24 часов**"
      )
      .setColor(0x5865f2)
      .setThumbnail(interaction.guild?.iconURL({ size: 256 }) ?? null)
      .setFooter({ text: "ELITE ONLINE • Система тикетов" })
      .setTimestamp();

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("ticket_create")
        .setLabel("📩 Создать тикет")
        .setStyle(ButtonStyle.Primary)
    );

    const channel = interaction.channel;
    if (!channel || !("send" in channel)) {
      await interaction.editReply("❌ Не могу отправить в этот канал.");
      return;
    }

    await (channel as { send: (opts: unknown) => Promise<unknown> }).send({
      embeds: [embed],
      components: [row],
    });

    await interaction.editReply(
      `✅ Панель тикетов создана!\n📊 Лог-канал: <#${logChannel.id}>\n👷 Staff-роль: <@&${staffRole.id}>`
    );
  },
};
