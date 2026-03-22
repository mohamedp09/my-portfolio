import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { writeFileSyncUtf8 } from "@/lib/fsWrite";

const PATH = path.join(process.cwd(), "content", "products.json");

export type Product = {
  id: string;
  emoji: string;
  title: string;
  price: string;
  desc: string;
  tags: string[];
  link: string;
  order: number;
};

function readAll(): Product[] {
  try {
    const raw = fs.readFileSync(PATH, "utf8");
    const data = JSON.parse(raw) as unknown;
    return Array.isArray(data) ? (data as Product[]) : [];
  } catch {
    return [];
  }
}

function writeAll(rows: Product[]): void {
  writeFileSyncUtf8(PATH, `${JSON.stringify(rows, null, 2)}\n`);
}

function sortByOrder(rows: Product[]): Product[] {
  return [...rows].sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
}

export function getAllProducts(): Product[] {
  return sortByOrder(readAll());
}

/** Public: sorted products for homepage */
export function getProductsForSite(): Product[] {
  return sortByOrder(readAll());
}

export function getProductById(id: string): Product | null {
  return readAll().find((p) => p.id === id) ?? null;
}

export function createProduct(input: Omit<Product, "id">): Product {
  const rows = readAll();
  const row: Product = {
    id: randomUUID(),
    emoji: input.emoji || "📦",
    title: input.title.trim(),
    price: input.price.trim(),
    desc: input.desc.trim(),
    tags: Array.isArray(input.tags) ? input.tags : [],
    link: input.link.trim(),
    order: typeof input.order === "number" && !Number.isNaN(input.order) ? input.order : rows.length,
  };
  if (!row.title) throw new Error("Title is required.");
  rows.push(row);
  writeAll(rows);
  return row;
}

export function updateProduct(id: string, input: Partial<Omit<Product, "id">>): Product | null {
  const rows = readAll();
  const idx = rows.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  const prev = rows[idx];
  const next: Product = {
    ...prev,
    emoji: typeof input.emoji === "string" ? input.emoji : prev.emoji,
    title: typeof input.title === "string" ? input.title.trim() : prev.title,
    price: typeof input.price === "string" ? input.price.trim() : prev.price,
    desc: typeof input.desc === "string" ? input.desc.trim() : prev.desc,
    tags: input.tags !== undefined ? (Array.isArray(input.tags) ? input.tags : prev.tags) : prev.tags,
    link: typeof input.link === "string" ? input.link.trim() : prev.link,
    order: typeof input.order === "number" && !Number.isNaN(input.order) ? input.order : prev.order,
  };
  rows[idx] = next;
  writeAll(rows);
  return next;
}

export function deleteProduct(id: string): boolean {
  const rows = readAll();
  const next = rows.filter((p) => p.id !== id);
  if (next.length === rows.length) return false;
  writeAll(next);
  return true;
}
