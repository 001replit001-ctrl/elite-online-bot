import {
  Events,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  REST,
  Routes,
} from "discord.js";
import { client, commands } from "./client.js";
import { logger } from "../lib/logger.js";
import { giveaways, knoGames, tttGames, duelRequests } from "./state.js";
import { renderBoard, checkWinner } from "./commands/krestiki.js";
import { resolveDuel } from "./commands/duel.js";

import { say } from "./commands/say.js";
import { embed } from "./commands/embed.js";
import { ssylka } from "./commands/ssylka.js";
import { ugadajChislo } from "./commands/ugadaj-chislo.js";
import { ugadajMashinu } from "./commands/ugadaj-mashinu.js";
import { ugadat } from "./commands/ugadat.js";
import { stopGame } from "./commands/stop-game.js";
import { rassylka } from "./commands/rassylka.js";
import { rozygrysh } from "./commands/rozygrysh.js";
import { zavershitRozygrysh } from "./commands/zavershit-rozygrysh.js";
import { monetka } from "./commands/monetka.js";
import { kubik } from "./commands/kubik.js";
import { kno } from "./commands/kno.js";
import { duel } from "./commands/duel.js";
import { krestiki } from "./commands/krestiki.js";
import { info } from "./commands/info.js";
import { server } from "./commands/server.js";
import { poll } from "./commands/poll.js";
import { avatar } from "./commands/avatar.js";
import { ping } from "./commands/ping.js";

const allCommands = [
  say, embed, ssylka,
  ugadajChislo, ugadajMashinu, ugadat, stopGame,
  rassylka, rozygrysh, zavershitRozygrysh,
  monetka, kubik, kno, duel, krestiki,
  info, server, poll, avatar, ping,
];

for (const cmd of allCommands) {
  commands.set(cmd.data.name, cmd);
}

async function deployCommands() {
  const token = process.env["DISCORD_BOT_TOKEN"];
  const clientId = process.env["DISCORD_CLIENT_ID"];
  const guildIdRaw = process.env["DISCORD_GUILD_ID"] ?? "";

  if (!token || !clientId) {
    logger.error("Missing DISCORD_BOT_TOKEN or DISCORD_CLIENT_ID");
    return;
  }

  const guildIds = guildIdRaw.split(",").map((s) => s.trim()).filter(Boolean);
  const rest = new REST().setToken(token);
  const body = allCommands.map((c) => c.data.toJSON());

  for (const guildId of guildIds) {
    try {
      await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body });
      logger.info({ guildId }, "✅ Команды зарегистрированы");
    } catch (err) {
      logger.error({ err, guildId }, "❌ Ошибка регистрации команд");
    }
  }
}

client.once(Events.ClientReady, async (c) => {
  logger.info(`🤖 Бот запущен как ${c.user.tag}`);
  await deployCommands();
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.isChatInputCommand()) {
    const command = commands.get(interaction.commandName);
    if (!command) return;
    try {
      await command.execute(interaction);
    } catch (err) {
      logger.error({ err, cmd: interaction.commandName }, "Ошибка выполнения команды");
      const msg = { content: "❌ Произошла ошибка при выполнении команды.", flags: 64 as const };
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(msg).catch(() => {});
      } else {
        await interaction.reply(msg).catch(() => {});
      }
    }
    return;
  }

  if (!interaction.isButton()) return;

  const customId = interaction.customId;

  // ── Розыгрыш ──
  if (customId === "giveaway_join" || customId === "giveaway_leave") {
    const msgId = interaction.message.id;
    const giveaway = giveaways.get(msgId);
    if (!giveaway || giveaway.ended) {
      await interaction.reply({ content: "❌ Этот розыгрыш уже завершён.", flags: 64 });
      return;
    }

    const userId = interaction.user.id;
    let reply: string;

    if (customId === "giveaway_join") {
      if (giveaway.participants.has(userId)) {
        await interaction.reply({ content: "✅ Ты уже участвуешь!", flags: 64 });
        return;
      }
      giveaway.participants.add(userId);
      reply = "🎉 Ты в розыгрыше! Удачи!";
    } else {
      if (!giveaway.participants.has(userId)) {
        await interaction.reply({ content: "❌ Ты не участвуешь.", flags: 64 });
        return;
      }
      giveaway.participants.delete(userId);
      reply = "👋 Ты вышел из розыгрыша.";
    }

    const winnersCount = (giveaway as { winnersCount?: number }).winnersCount ?? 1;
    const e = new EmbedBuilder()
      .setTitle("🎉 РОЗЫГРЫШ")
      .setDescription(
        `🎁 **Приз:** ${giveaway.prize}\n👥 **Участников:** ${giveaway.participants.size}\n🏆 **Победителей:** ${winnersCount}\n\n➡️ Нажми кнопку **«Участвовать»** чтобы войти!\n\nЧтобы завершить: \`/завершить-розыгрыш\``
      )
      .setColor(0xf39c12)
      .setTimestamp()
      .setFooter({ text: `Организатор: ${interaction.guild?.members.cache.get(giveaway.hostId)?.user.username ?? "Неизвестен"}` });

    await interaction.update({ embeds: [e] });
    await interaction.followUp({ content: reply, flags: 64 });
    return;
  }

  // ── КНО ──
  if (customId.startsWith("kno_")) {
    const choice = customId.replace("kno_", "");
    const msgId = interaction.message.id;
    const game = knoGames.get(msgId);

    if (!game) {
      await interaction.reply({ content: "❌ Игра не найдена.", flags: 64 });
      return;
    }

    const userId = interaction.user.id;
    if (userId !== game.hostId && userId !== game.targetId) {
      await interaction.reply({ content: "❌ Ты не участник этой игры!", flags: 64 });
      return;
    }

    if (userId === game.hostId) {
      if (game.hostChoice) {
        await interaction.reply({ content: "✅ Ты уже выбрал!", flags: 64 });
        return;
      }
      game.hostChoice = choice;
    } else {
      if (game.targetChoice) {
        await interaction.reply({ content: "✅ Ты уже выбрал!", flags: 64 });
        return;
      }
      game.targetChoice = choice;
    }

    if (!game.hostChoice || !game.targetChoice) {
      await interaction.reply({ content: "✅ Выбор принят! Ждём второго игрока...", flags: 64 });
      return;
    }

    knoGames.delete(msgId);

    const beats: Record<string, string> = { камень: "ножницы", ножницы: "бумага", бумага: "камень" };
    const emojiMap: Record<string, string> = { камень: "🪨", ножницы: "✂️", бумага: "📄" };

    let result: string;
    if (game.hostChoice === game.targetChoice) {
      result = "🤝 Ничья!";
    } else if (beats[game.hostChoice] === game.targetChoice) {
      result = `🏆 Победил <@${game.hostId}>!`;
    } else {
      result = `🏆 Победил <@${game.targetId}>!`;
    }

    const disabledRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId("kno_done").setLabel("Игра окончена").setStyle(ButtonStyle.Secondary).setDisabled(true)
    );

    const e = new EmbedBuilder()
      .setTitle("✂️ Камень-Ножницы-Бумага — Результат")
      .setDescription(
        `<@${game.hostId}>: ${emojiMap[game.hostChoice]} **${game.hostChoice}**\n<@${game.targetId}>: ${emojiMap[game.targetChoice]} **${game.targetChoice}**\n\n${result}`
      )
      .setColor(0x3498db)
      .setTimestamp();

    await interaction.update({ embeds: [e], components: [disabledRow] });
    return;
  }

  // ── Крестики-нолики ──
  if (customId.startsWith("ttt_")) {
    const idx = parseInt(customId.replace("ttt_", ""));
    const msgId = interaction.message.id;
    const game = tttGames.get(msgId);

    if (!game) {
      await interaction.reply({ content: "❌ Игра не найдена.", flags: 64 });
      return;
    }

    const userId = interaction.user.id;
    const currentPlayerId = game.players[game.currentTurn];

    if (userId !== currentPlayerId) {
      await interaction.reply({ content: `❌ Сейчас ход <@${currentPlayerId}>!`, flags: 64 });
      return;
    }

    if (game.board[idx] !== null) {
      await interaction.reply({ content: "❌ Эта клетка уже занята!", flags: 64 });
      return;
    }

    const symbol = game.currentTurn === 0 ? "❌" : "⭕";
    game.board[idx] = symbol;

    const winner = checkWinner(game.board);
    const isFull = game.board.every((c) => c !== null);

    if (winner) {
      tttGames.delete(msgId);
      const winnerEmbed = new EmbedBuilder()
        .setTitle("🎉 Игра окончена!")
        .setDescription(`🏆 Победил <@${currentPlayerId}> (${symbol})!`)
        .setColor(0x2ecc71)
        .setTimestamp();

      const disabledRows = renderBoard(game.board).map((row) => {
        row.components.forEach((btn) => btn.setDisabled(true));
        return row;
      });
      await interaction.update({ embeds: [winnerEmbed], components: disabledRows });
      return;
    }

    if (isFull) {
      tttGames.delete(msgId);
      const drawEmbed = new EmbedBuilder()
        .setTitle("🤝 Ничья!")
        .setDescription("Все клетки заполнены — никто не победил!")
        .setColor(0xf39c12)
        .setTimestamp();
      const disabledRows = renderBoard(game.board).map((row) => {
        row.components.forEach((btn) => btn.setDisabled(true));
        return row;
      });
      await interaction.update({ embeds: [drawEmbed], components: disabledRows });
      return;
    }

    game.currentTurn = game.currentTurn === 0 ? 1 : 0;
    const nextPlayer = game.players[game.currentTurn];
    const nextSymbol = game.currentTurn === 0 ? "❌" : "⭕";

    const updatedEmbed = new EmbedBuilder()
      .setTitle("❌ Крестики-нолики ⭕")
      .setDescription(
        `<@${game.players[0]}> ❌ vs <@${game.players[1]}> ⭕\n\n🎯 Ход: <@${nextPlayer}> (${nextSymbol})`
      )
      .setColor(0x3498db)
      .setTimestamp();

    await interaction.update({ embeds: [updatedEmbed], components: renderBoard(game.board) });
    return;
  }

  // ── Дуэль ──
  if (customId === "duel_accept" || customId === "duel_decline") {
    const msgId = interaction.message.id;
    const duelData = duelRequests.get(msgId);

    if (!duelData) {
      await interaction.reply({ content: "❌ Вызов устарел или уже обработан.", flags: 64 });
      return;
    }

    if (interaction.user.id !== duelData.targetId) {
      await interaction.reply({ content: "❌ Этот вызов не для тебя!", flags: 64 });
      return;
    }

    duelRequests.delete(msgId);

    if (customId === "duel_decline") {
      const e = new EmbedBuilder()
        .setTitle("🏳️ Вызов отклонён")
        .setDescription(`<@${duelData.targetId}> отказался от дуэли с <@${duelData.hostId}>.`)
        .setColor(0x95a5a6)
        .setTimestamp();
      await interaction.update({ embeds: [e], components: [] });
      return;
    }

    const resultEmbed = resolveDuel(duelData.hostId, duelData.targetId, duelData.prize);
    await interaction.update({ embeds: [resultEmbed], components: [] });
    return;
  }
});

export async function startBot() {
  const token = process.env["DISCORD_BOT_TOKEN"];
  if (!token) {
    logger.error("DISCORD_BOT_TOKEN не задан — бот не запущен");
    return;
  }
  await client.login(token);
}
