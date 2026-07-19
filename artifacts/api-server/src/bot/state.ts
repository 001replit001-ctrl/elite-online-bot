export interface NumberGame {
  number: number;
  prize: string;
  hostId: string;
  min: number;
  max: number;
  threadId: string;
  messageCount: number;
}

export interface CarGame {
  car: string;
  prize: string;
  photo: string;
  hostId: string;
  threadId: string;
  guesses: Set<string>;
  messageCount: number;
}

export interface Giveaway {
  prize: string;
  participants: Set<string>;
  channelId: string;
  hostId: string;
  messageId: string;
  ended: boolean;
  winnersCount: number;
  threadId?: string;
  endTime: number;
}

export interface KnoGame {
  hostId: string;
  targetId: string;
  hostChoice: string | null;
  targetChoice: string | null;
  messageId: string;
}

export interface TttGame {
  board: (string | null)[];
  players: [string, string];
  currentTurn: number;
  messageId: string;
}

export interface DuelRequest {
  hostId: string;
  targetId: string;
  prize: string;
}

export interface WordGame {
  word: string;
  prize: string;
  hostId: string;
  threadId: string;
  revealed: boolean[];
  guessedLetters: Set<string>;
  boardMessageId: string;
}

export const numberGames = new Map<string, NumberGame>();
export const carGames = new Map<string, CarGame>();
export const wordGames = new Map<string, WordGame>();
export const giveaways = new Map<string, Giveaway>();
export const knoGames = new Map<string, KnoGame>();
export const tttGames = new Map<string, TttGame>();
export const duelRequests = new Map<string, DuelRequest>();

export const threadToNumberGame = new Map<string, string>();
export const threadToCarGame = new Map<string, string>();
export const threadToWordGame = new Map<string, string>();
