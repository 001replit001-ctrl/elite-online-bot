import fs from "node:fs";
import path from "node:path";

export const OWNER_ID = "1469271394536915056";

// Granted users (OWNER always has access regardless of this set)
export const allowedUsers = new Set<string>();

const DATA_FILE = path.join(process.cwd(), "data", "access-state.json");

export function hasModAccess(userId: string): boolean {
  return userId === OWNER_ID || allowedUsers.has(userId);
}

export function saveAccessState(): void {
  try {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify([...allowedUsers]), "utf-8");
  } catch { }
}

export function loadAccessState(): void {
  try {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8")) as string[];
    for (const id of data) allowedUsers.add(id);
  } catch { }
}
