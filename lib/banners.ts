import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { writeFileSyncUtf8 } from "@/lib/fsWrite";

const PATH = path.join(process.cwd(), "content", "banners.json");

export type Banner = {
  id: string;
  title: string;
  imageUrl: string;
  link: string;
  active: boolean;
  order: number;
};

function readAll(): Banner[] {
  try {
    const raw = fs.readFileSync(PATH, "utf8");
    const data = JSON.parse(raw) as unknown;
    return Array.isArray(data) ? (data as Banner[]) : [];
  } catch {
    return [];
  }
}

function writeAll(rows: Banner[]): void {
  writeFileSyncUtf8(PATH, `${JSON.stringify(rows, null, 2)}\n`);
}

function sortByOrder(rows: Banner[]): Banner[] {
  return [...rows].sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
}

export function getAllBanners(): Banner[] {
  return sortByOrder(readAll());
}

export function getActiveBanners(): Banner[] {
  return sortByOrder(readAll().filter((b) => b.active));
}

export function getBannerById(id: string): Banner | null {
  return readAll().find((b) => b.id === id) ?? null;
}

export function createBanner(input: Omit<Banner, "id">): Banner {
  const rows = readAll();
  const row: Banner = {
    id: randomUUID(),
    title: input.title.trim(),
    imageUrl: input.imageUrl.trim(),
    link: typeof input.link === "string" ? input.link.trim() : "",
    active: Boolean(input.active),
    order: typeof input.order === "number" && !Number.isNaN(input.order) ? input.order : rows.length,
  };
  if (!row.title) throw new Error("Title is required.");
  if (!row.imageUrl) throw new Error("Image URL is required.");
  rows.push(row);
  writeAll(rows);
  return row;
}

export function updateBanner(id: string, input: Partial<Omit<Banner, "id">>): Banner | null {
  const rows = readAll();
  const idx = rows.findIndex((b) => b.id === id);
  if (idx === -1) return null;
  const prev = rows[idx];
  const next: Banner = {
    ...prev,
    title: typeof input.title === "string" ? input.title.trim() : prev.title,
    imageUrl: typeof input.imageUrl === "string" ? input.imageUrl.trim() : prev.imageUrl,
    link: typeof input.link === "string" ? input.link.trim() : prev.link,
    active: typeof input.active === "boolean" ? input.active : prev.active,
    order: typeof input.order === "number" && !Number.isNaN(input.order) ? input.order : prev.order,
  };
  rows[idx] = next;
  writeAll(rows);
  return next;
}

export function deleteBanner(id: string): boolean {
  const rows = readAll();
  const next = rows.filter((b) => b.id !== id);
  if (next.length === rows.length) return false;
  writeAll(next);
  return true;
}
