import {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
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
    ),

  async execute(interaction) {
    const channel = interaction.channel;
    if (!channel || channel.type === ChannelType.DM) {
      await interaction.reply({ content: "❌ Только для серверных каналов.", flags: 64 });
      return;
    }

    await interaction.deferReply({ flags: 64 });

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

      if (question.length <= 250) {
        embed.setTitle(`📊 ${question}`);
        embed.setDescription(votes_desc);
      } else {
        embed.setTitle("📊 Опрос");
        embed.setDescription(`${question}\n\n${votes_desc}`);
      }

      return embed;
    };

    const buildRow = (msgId: string) =>
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        ...options.map((opt, i) =>
          new ButtonBuilder()
            .setCustomId(`poll_${msgId}_${i}`)
            .setLabel(`${emojis[i]} ${opt}`)
            .setStyle(ButtonStyle.Primary)
        )
      );

    const ch = channel as { send: (opts: unknown) => Promise<import("discord.js").Message> };
    const msg = await ch.send({
      embeds: [buildEmbed()],
      components: [buildRow("placeholder")],
      allowedMentions: { parse: ["roles", "users", "everyone"] },
    });

    // Пересобираем кнопки с реальным ID сообщения
    await msg.edit({ components: [buildRow(msg.id)] });

    await interaction.editReply("✅ Опрос создан!");

    const collector = msg.createMessageComponentCollector({ time: 24 * 60 * 60 * 1000 });

    collector.on("collect", async (btn) => {
      if (!btn.customId.startsWith(`poll_${msg.id}_`)) return;
      const idx = btn.customId.split("_").pop()!;

      for (const [key, set] of votes) {
        set.delete(btn.user.id);
        votes.set(key, set);
      }
      votes.get(idx)?.add(btn.user.id);

      await btn.update({ embeds: [buildEmbed()], components: [buildRow(msg.id)] });
    });
  },
};
