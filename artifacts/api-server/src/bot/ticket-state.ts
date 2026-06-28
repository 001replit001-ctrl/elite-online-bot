import fs from "node:fs";
import path from "node:path";

export interface TicketSetup {
  logChannelId: string;
  staffRoleId: string;
}

export interface TicketData {
  ticketNumber: number;
  userId: string;
  guildId: string;
  channelId: string;
  claimedBy?: string;
  claimedByName?: string;
  subject: string;
  description: string;
  createdAt: number;
}

export const ticketSetups = new Map<string, TicketSetup>();
export const openTickets = new Map<string, TicketData>();
export const ticketCounters = new Map<string, number>();

const DATA_FILE = path.join(process.cwd(), "data", "ticket-state.json");

export function saveTicketState(): void {
  try {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    const data = {
      setups: [...ticketSetups.entries()],
      tickets: [...openTickets.entries()],
      counters: [...ticketCounters.entries()],
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch { }
}

export function loadTicketState(): void {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    const data = JSON.parse(raw) as {
      setups?: [string, TicketSetup][];
      tickets?: [string, TicketData][];
      counters?: [string, number][];
    };
    for (const [k, v] of data.setups ?? []) ticketSetups.set(k, v);
    for (const [k, v] of data.tickets ?? []) openTickets.set(k, v);
    for (const [k, v] of data.counters ?? []) ticketCounters.set(k, v);
  } catch { }
}

export function nextTicketNumber(guildId: string): number {
  const next = (ticketCounters.get(guildId) ?? 0) + 1;
  ticketCounters.set(guildId, next);
  saveTicketState();
  return next;
}
