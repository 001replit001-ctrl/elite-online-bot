import {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import type { Command } from "../client.js";
import { tttGames } from "../state.js";

const MP_ROLE = "<@&1486708220234825949>";

export function renderBoard(board: (string | null)[]): ActionRowBuilder<ButtonBuilder>[] {
  const rows: ActionRowBuilder<ButtonBuilder>[] = [];
  for (let r = 0; r < 3; r++) {
    const row = new ActionRowBuilder<ButtonBuilder>();
    for (let c = 0; c < 3; c++) {
      const idx = r * 3 + c;
      const cell = board[idx];
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`ttt_${idx}`)
          .setLabel(cell ?? "·")
          .setStyle(cell === "❌" ? ButtonStyle.Danger : cell === "⭕" ? ButtonStyle.Primary : ButtonStyle.Secondary)
          .setDisabled(cell !== null)
      );
    }
    rows.push(row);
  }
  return rows;
}

export function checkWinner(board: (string | null)[]): string | null {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
  ];
  for (const [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
  }
  return null;
}

export const krestiki: Command = {
  data: new SlashCommandBuilder()
    .setName("крестики-нолики")
    .setDescription("Сыграть в крестики-нолики с другим игроком")
    .addUserOption((opt) =>
      opt.setName("игрок").setDescription("Соперник").setRequired(true)
    )
    .addUserOption((opt) =>
      opt.setName("организатор").setDescription("Тег организатора").setRequired(false)
    ),

  async execute(interaction) {
    const target = interaction.options.getUser("игрок", true);
    const organizer = interaction.options.getUser("организатор");

    if (target.id === interaction.user.id) {
      await interaction.reply({ content: "❌ Нельзя играть с самим собой!", flags: 64 });
      return;
    }
    if (target.bot) {
      await interaction.reply({ content: "❌ Нельзя играть против бота!", flags: 64 });
      return;
    }

    const board: (string | null)[] = Array(9).fill(null);
    const players: [string, string] = [interaction.user.id, target.id];
    const orgField = organizer ? [{ name: "🎯 Организатор", value: `<@${organizer.id}>` }] : [];

    const e = new EmbedBuilder()
      .setTitle("❌ Крестики-нолики ⭕")
      .setDescription(`<@${players[0]}> ❌ vs <@${players[1]}> ⭕\n\n🎯 Ход: <@${players[0]}> (❌)`)
      .addFields(orgField)
      .setColor(0x3498db)
      .setTimestamp();

    const rows = renderBoard(board);
    const msg = await interaction.reply({ content: MP_ROLE, embeds: [e], components: rows, fetchReply: true });

    tttGames.set(msg.id, { board, players, currentTurn: 0, messageId: msg.id });
  },
};
