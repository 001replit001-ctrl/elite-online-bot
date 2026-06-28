import {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
} from "discord.js";
import type { Command } from "../client.js";

export const poll: Command = {
  data: new SlashCommandBuilder()
    .setName("опрос")
    .setDescription("Создать опрос с кнопками голосования")
    .addStringOption((opt) =>
      opt.setName("вопрос").setDescription("Вопрос опроса").setRequired(true)
    )
    .addStringOption((opt) =>
      opt.setName("вариант1").setDescription("Вариант 1").setRequired(true)
    )
    .addStringOption((opt) =>
      opt.setName("вариант2").setDescription("Вариант 2").setRequired(true)
    )
    .addStringOption((opt) =>
      opt.setName("вариант3").setDescription("Вариант 3").setRequired(false)
    )
    .addStringOption((opt) =>
      opt.setName("вариант4").setDescription("Вариант 4").setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const question = interaction.options.getString("вопрос", true);
    const options = [
      interaction.options.getString("вариант1", true),
      interaction.options.getString("вариант2", true),
      interaction.options.getString("вариант3"),
      interaction.options.getString("вариант4"),
    ].filter(Boolean) as string[];

    const emojis = ["1️⃣", "2️⃣", "3️⃣", "4️⃣"];
    const votes = new Map<string, Set<string>>(options.map((_, i) => [String(i), new Set()]));

    const buildEmbed = () => {
      const votes_desc = options
        .map((opt, i) => `${emojis[i]} **${opt}** — ${votes.get(String(i))?.size ?? 0} голосов`)
        .join("\n\n");

      const embed = new EmbedBuilder().setColor(0x3498db).setTimestamp()
        .setFooter({ text: `Опрос от ${interaction.user.username}` });

      if (question.length <= 256) {
        embed.setTitle(`📊 ${question.slice(0, 253)}`);
        embed.setDescription(votes_desc);
      } else {
        embed.setTitle("📊 Опрос");
        embed.setDescription(`${question}\n\n${votes_desc}`);
      }

      return embed;
    };

    const buildRow = () =>
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        ...options.map((opt, i) =>
          new ButtonBuilder()
            .setCustomId(`poll_${interaction.id}_${i}`)
            .setLabel(`${emojis[i]} ${opt}`)
            .setStyle(ButtonStyle.Primary)
        )
      );

    const msg = await interaction.reply({ embeds: [buildEmbed()], components: [buildRow()], fetchReply: true });

    const collector = msg.createMessageComponentCollector({ time: 24 * 60 * 60 * 1000 });

    collector.on("collect", async (btn) => {
      if (!btn.customId.startsWith(`poll_${interaction.id}_`)) return;
      const idx = btn.customId.split("_").pop()!;

      for (const [key, set] of votes) {
        set.delete(btn.user.id);
        votes.set(key, set);
      }
      votes.get(idx)?.add(btn.user.id);

      await btn.update({ embeds: [buildEmbed()], components: [buildRow()] });
    });
  },
};
