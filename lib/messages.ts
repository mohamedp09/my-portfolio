import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { ensureDirForFile, writeFileUtf8 } from "@/lib/fsWrite";

const DATA_DIR = path.join(process.cwd(), "data");
const MESSAGES_FILE = path.join(DATA_DIR, "messages.json");

export type Message = {
  id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  createdAt: string;
};

async function ensureStore(): Promise<void> {
  ensureDirForFile(MESSAGES_FILE);
  try {
    await fs.access(MESSAGES_FILE);
  } catch {
    await writeFileUtf8(MESSAGES_FILE, "[]\n");
  }
}

export async function getMessages(): Promise<Message[]> {
  await ensureStore();
  const raw = await fs.readFile(MESSAGES_FILE, "utf8");
  const json = JSON.parse(raw) as unknown;
  if (!Array.isArray(json)) return [];
  return json as Message[];
}

export async function writeMessages(messages: Message[]): Promise<void> {
  await ensureStore();
  await writeFileUtf8(MESSAGES_FILE, `${JSON.stringify(messages, null, 2)}\n`);
}

export async function addMessage(input: {
  name: string;
  email: string;
  message: string;
}): Promise<Message> {
  const messages = await getMessages();
  const entry: Message = {
    id: randomUUID(),
    name: input.name,
    email: input.email,
    message: input.message,
    read: false,
    createdAt: new Date().toISOString(),
  };
  messages.unshift(entry);
  await writeMessages(messages);
  return entry;
}

export async function getMessageById(id: string): Promise<Message | null> {
  const messages = await getMessages();
  return messages.find((m) => m.id === id) ?? null;
}

export async function setMessageRead(id: string, read: boolean): Promise<Message | null> {
  const messages = await getMessages();
  const idx = messages.findIndex((m) => m.id === id);
  if (idx === -1) return null;
  messages[idx] = { ...messages[idx], read };
  await writeMessages(messages);
  return messages[idx];
}

export async function deleteMessage(id: string): Promise<boolean> {
  const messages = await getMessages();
  const next = messages.filter((m) => m.id !== id);
  if (next.length === messages.length) return false;
  await writeMessages(next);
  return true;
}
