import {
  SlashCommandBuilder,
  EmbedBuilder,
  type ChatInputCommandInteraction,
  type GuildMember,
} from "discord.js";

function getUserStatus(member: GuildMember): string {
  const statuses = [
    { role: "The gold of the project", text: "👑 The Gold of the Project" },
    { role: "Команда проекта", text: "👑 Команда проекта" },
    { role: "Помощник команды проекта", text: "🛡️ Помощник команды проекта" },
    { role: "Куратор проекта", text: "👑 Куратор проекта" },
    { role: "Помощник куратора проекта", text: "🛡️ Помощник куратора проекта" },
    { role: "Главный администратор", text: "👑 Главный администратор" },
    {
      role: "Основной заместитель главного администратора",
      text: "🛡️ Основной заместитель главного администратора",
    },
    {
      role: "Заместитель главного администратора",
      text: "🛡️ Заместитель главного администратора",
    },
    { role: "Главный следящий ГОС", text: "👮 Главный следящий ГОС" },
    { role: "Главный следящий ОПГ", text: "👮 Главный следящий ОПГ" },
    {
      role: "Главный следящий младшей администрации",
      text: "👮 Главный следящий младшей администрации",
    },
    {
      role: "Зам. главного следящего ГОС",
      text: "👮 Зам. главного следящего ГОС",
    },
    {
      role: "Зам. главного следящего ОПГ",
      text: "👮 Зам. главного следящего ОПГ",
    },
    {
      role: "Лидер гос. организации",
      text: "⭐ Лидер государственной организации",
    },
    {
      role: "Зам. лидера гос. организации",
      text: "⭐ Заместитель лидера государственной организации",
    },
    {
      role: "Лидер нелегальной организации",
      text: "⭐ Лидер нелегальной организации",
    },
    {
      role: "Зам. лидера нелегальной организации",
      text: "⭐ Заместитель лидера нелегальной организации",
    },
    { role: "Администратор", text: "🛡️ Администратор" },
    { role: "Гражданин", text: "👤 Гражданин" },
  ];

  for (const status of statuses) {
    if (member.roles.cache.some((role) => role.name === status.role)) {
      return status.text;
    }
  }

  return "👤 Игрок";
}

function getOrganization(member: GuildMember): string {
  const organizations = [
    { role: "Правительство", text: "🏛️ Правительство" },
    { role: "УФСБ", text: "🛡️ УФСБ" },
    { role: "МВД г. Арзамас", text: "🚔 МВД г. Арзамас" },
    { role: "МВД г. Южный", text: "🚔 МВД г. Южный" },
    { role: "Воинская часть", text: "🎖️ Воинская часть" },
    { role: "Больница г. Арзамас", text: "🚑 Больница г. Арзамас" },
    { role: "Больница г. Южный", text: "🚑 Больница г. Южный" },
    { role: "Новостная сеть", text: "📰 Новостная сеть" },
  ];

  for (const org of organizations) {
    if (member.roles.cache.some((role) => role.name === org.role)) {
      return org.text;
    }
  }

  return "🚫 Не состоит в организации";
}

export const profile = {
  data: new SlashCommandBuilder()
    .setName("профиль")
    .setDescription("Показать профиль игрока")
    .addUserOption((option) =>
      option
        .setName("игрок")
        .setDescription("Игрок, профиль которого показать")
        .setRequired(false),
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const user = interaction.options.getUser("игрок") ?? interaction.user;

    const member = await interaction.guild?.members.fetch(user.id);

    if (!member) {
      await interaction.reply({
        content: "❌ Игрок не найден.",
        ephemeral: true,
      });
      return;
    }

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle("👤 Профиль игрока")
      .setThumbnail(user.displayAvatarURL())
      .addFields(
        {
          name: "👤 Игрок",
          value: `${user}`,
          inline: true,
        },
        {
          name: "🆔 ID",
          value: user.id,
          inline: true,
        },
        {
          name: "⭐ Статус",
          value: getUserStatus(member),
          inline: false,
        },
        {
          name: "🏢 Организация",
          value: getOrganization(member),
          inline: false,
        },
      )
      .setTimestamp();

    await interaction.reply({
      embeds: [embed],
    });
  },
};