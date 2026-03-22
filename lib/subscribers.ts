import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { writeFileSyncUtf8 } from "@/lib/fsWrite";

const PATH = path.join(process.cwd(), "content", "subscribers.json");

export type Subscriber = {
  id: string;
  email: string;
  name: string;
  subscribedAt: string;
  confirmed: boolean;
};

function readAll(): Subscriber[] {
  try {
    const raw = fs.readFileSync(PATH, "utf8");
    const data = JSON.parse(raw) as unknown;
    return Array.isArray(data) ? (data as Subscriber[]) : [];
  } catch {
    return [];
  }
}

function writeAll(rows: Subscriber[]): void {
  writeFileSyncUtf8(PATH, `${JSON.stringify(rows, null, 2)}\n`);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email.trim().toLowerCase());
}

export function getAllSubscribers(): Subscriber[] {
  return [...readAll()].sort((a, b) => b.subscribedAt.localeCompare(a.subscribedAt));
}

export function addSubscriber(email: string, name = ""): Subscriber {
  const norm = email.trim().toLowerCase();
  if (!isValidEmail(norm)) {
    throw new Error("Invalid email.");
  }
  const list = readAll();
  if (list.some((s) => s.email.toLowerCase() === norm)) {
    throw new Error("Already subscribed.");
  }
  const row: Subscriber = {
    id: randomUUID(),
    email: norm,
    name: name.trim(),
    subscribedAt: new Date().toISOString(),
    confirmed: true,
  };
  list.push(row);
  writeAll(list);
  return row;
}

export function removeSubscriber(email: string): boolean {
  const norm = email.trim().toLowerCase();
  const list = readAll();
  const next = list.filter((s) => s.email.toLowerCase() !== norm);
  if (next.length === list.length) return false;
  writeAll(next);
  return true;
}

export function removeSubscriberById(id: string): boolean {
  const list = readAll();
  const next = list.filter((s) => s.id !== id);
  if (next.length === list.length) return false;
  writeAll(next);
  return true;
}

export function isSubscribed(email: string): boolean {
  const norm = email.trim().toLowerCase();
  return readAll().some((s) => s.email.toLowerCase() === norm);
}

export function getSubscriberCount(): number {
  return readAll().length;
}
