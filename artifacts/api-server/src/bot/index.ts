import {
  Events,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  REST,
  Routes,
  ChannelType,
} from "discord.js";
import { client, commands } from "./client.js";
import { logger } from "../lib/logger.js";
import {
  giveaways,
  knoGames,
  tttGames,
  duelRequests,
  numberGames,
  carGames,
  threadToNumberGame,
  threadToCarGame,
} from "./state.js";
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

const CROSS_KEYWORDS = ["x_mark", "xmark", "cross", "крест", "wrong", "no", "close", "deny", "decline", "reject", "nope", "bad", "minus", "delete", "remove"];
const CHECK_KEYWORDS = ["red_check", "redcheck", "verify", "check", "correct", "yes", "ok", "tick", "done", "success", "approve", "accept", "right", "good", "plus"];

function findAnimatedEmoji(guildId: string | null, type: "cross" | "check"): string {
  if (!guildId) return type === "cross" ? "❌" : "✅";
  const guild = client.guilds.cache.get(guildId);
  if (!guild) return type === "cross" ? "❌" : "✅";

  const keywords = type === "cross" ? CROSS_KEYWORDS : CHECK_KEYWORDS;

  // 1. Animated emoji matching keywords
  const animated = guild.emojis.cache.find(
    (e) => e.animated === true && keywords.some((k) => e.name?.toLowerCase().includes(k))
  );
  if (animated) return `<a:${animated.name}:${animated.id}>`;

  // 2. Any animated emoji as last resort
  const anyAnimated = guild.emojis.cache.find((e) => e.animated === true);
  if (anyAnimated && type === "cross") return `<a:${anyAnimated.name}:${anyAnimated.id}>`;

  // 3. Static emoji matching keywords
  const staticEmoji = guild.emojis.cache.find(
    (e) => !e.animated && keywords.some((k) => e.name?.toLowerCase().includes(k))
  );
  if (staticEmoji) return `<:${staticEmoji.name}:${staticEmoji.id}>`;

  return type === "cross" ? "❌" : "✅";
}

client.once(Events.ClientReady, async (c) => {
  logger.info(`🤖 Бот запущен как ${c.user.tag}`);
  await deployCommands();
});

// ── MessageCreate: обработка ответов в ветках ──
client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;
  if (message.channel.type !== ChannelType.PublicThread && message.channel.type !== ChannelType.PrivateThread) return;

  const threadId = message.channel.id;
  const guildId = message.guildId;

  // Игра "Угадай число"
  if (threadToNumberGame.has(threadId)) {
    const game = numberGames.get(threadId);
    if (!game) return;

    const guess = parseInt(message.content.trim());
    if (isNaN(guess)) return;

    const wrongEmoji = findAnimatedEmoji(guildId, "cross");
    const rightEmoji = findAnimatedEmoji(guildId, "check");

    if (guess === game.number) {
      try { await message.react(rightEmoji); } catch { await message.react("✅").catch(() => {}); }

      numberGames.delete(threadId);
      threadToNumberGame.delete(threadId);

      await message.channel.send(
        `## Стоп! Победитель мероприятия - <@${message.author.id}>\n\n🎁 **Приз:** ${game.prize}\n🔢 **Загаданное число:** ${game.number}`
      );

      await new Promise((r) => setTimeout(r, 2000));
      try {
        await message.channel.setLocked(true);
        await message.channel.setArchived(true);
      } catch {
        logger.warn({ threadId }, "Не удалось закрыть ветку");
      }
    } else {
      try { await message.react(wrongEmoji); } catch { await message.react("❌").catch(() => {}); }
    }
    return;
  }

  // Игра "Угадай машину"
  if (threadToCarGame.has(threadId)) {
    const game = carGames.get(threadId);
    if (!game) return;

    const wrongEmoji = findAnimatedEmoji(guildId, "cross");
    const rightEmoji = findAnimatedEmoji(guildId, "check");

    const guess = message.content.trim().toLowerCase();
    if (guess === game.car) {
      try { await message.react(rightEmoji); } catch { await message.react("✅").catch(() => {}); }

      carGames.delete(threadId);
      threadToCarGame.delete(threadId);

      await message.channel.send(
        `## Стоп! Победитель мероприятия - <@${message.author.id}>\n\n🎁 **Приз:** ${game.prize}\n🚗 **Машина была:** ${game.car}`
      );

      await new Promise((r) => setTimeout(r, 2000));
      try {
        await message.channel.setLocked(true);
        await message.channel.setArchived(true);
      } catch {
        logger.warn({ threadId }, "Не удалось закрыть ветку");
      }
    } else {
      try { await message.react(wrongEmoji); } catch { await message.react("❌").catch(() => {}); }
    }
    return;
  }
});

// ── Slash команды ──
client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.isChatInputCommand()) {
    const command = commands.get(interaction.commandName);
    if (!command) return;
    try {
      await command.execute(interaction);
    } catch (err) {
      logger.error({ err, cmd: interaction.commandName }, "Ошибка выполнения команды");
      const msg = { content: "❌ Произошла ошибка.", flags: 64 as const };
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

    const updatedEmbed = EmbedBuilder.from(interaction.message.embeds[0])
      .spliceFields(2, 1, { name: "👥 Участников", value: `${giveaway.participants.size}`, inline: true });

    await interaction.update({ embeds: [updatedEmbed] });
    await interaction.followUp({ content: reply, flags: 64 });
    return;
  }

  // ── КНО ──
  if (customId.startsWith("kno_")) {
    const choice = customId.replace("kno_", "");
    const msgId = interaction.message.id;
    const game = knoGames.get(msgId);

    if (!game) { await interaction.reply({ content: "❌ Игра не найдена.", flags: 64 }); return; }

    const userId = interaction.user.id;
    if (userId !== game.hostId && userId !== game.targetId) {
      await interaction.reply({ content: "❌ Ты не участник этой игры!", flags: 64 });
      return;
    }

    if (userId === game.hostId) {
      if (game.hostChoice) { await interaction.reply({ content: "✅ Ты уже выбрал!", flags: 64 }); return; }
      game.hostChoice = choice;
    } else {
      if (game.targetChoice) { await interaction.reply({ content: "✅ Ты уже выбрал!", flags: 64 }); return; }
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
    if (game.hostChoice === game.targetChoice) result = "🤝 Ничья!";
    else if (beats[game.hostChoice] === game.targetChoice) result = `🏆 Победил <@${game.hostId}>!`;
    else result = `🏆 Победил <@${game.targetId}>!`;

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

    if (!game) { await interaction.reply({ content: "❌ Игра не найдена.", flags: 64 }); return; }

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
      const disabledRows = renderBoard(game.board).map((row) => { row.components.forEach((b) => b.setDisabled(true)); return row; });
      await interaction.update({ embeds: [winnerEmbed], components: disabledRows });
      return;
    }

    if (isFull) {
      tttGames.delete(msgId);
      const drawEmbed = new EmbedBuilder().setTitle("🤝 Ничья!").setDescription("Все клетки заполнены!").setColor(0xf39c12).setTimestamp();
      const disabledRows = renderBoard(game.board).map((row) => { row.components.forEach((b) => b.setDisabled(true)); return row; });
      await interaction.update({ embeds: [drawEmbed], components: disabledRows });
      return;
    }

    game.currentTurn = game.currentTurn === 0 ? 1 : 0;
    const nextPlayer = game.players[game.currentTurn];
    const nextSymbol = game.currentTurn === 0 ? "❌" : "⭕";

    const updatedEmbed = new EmbedBuilder()
      .setTitle("❌ Крестики-нолики ⭕")
      .setDescription(`<@${game.players[0]}> ❌ vs <@${game.players[1]}> ⭕\n\n🎯 Ход: <@${nextPlayer}> (${nextSymbol})`)
      .setColor(0x3498db)
      .setTimestamp();

    await interaction.update({ embeds: [updatedEmbed], components: renderBoard(game.board) });
    return;
  }

  // ── Дуэль ──
  if (customId === "duel_accept" || customId === "duel_decline") {
    const msgId = interaction.message.id;
    const duelData = duelRequests.get(msgId);

    if (!duelData) { await interaction.reply({ content: "❌ Вызов устарел.", flags: 64 }); return; }
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

  // Keep-alive: пинг себя каждые 4 минуты чтобы не отключаться
  const port = process.env["PORT"] ?? "8080";
  setInterval(async () => {
    try {
      await fetch(`http://localhost:${port}/api/healthz`);
    } catch {
      // ignore
    }
  }, 4 * 60 * 1000);

  await client.login(token);
}
