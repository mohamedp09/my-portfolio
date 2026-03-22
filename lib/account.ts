import fs from "fs";
import path from "path";
import { pbkdf2Sync, randomBytes, timingSafeEqual } from "crypto";
import { writeFileSyncUtf8 } from "@/lib/fsWrite";

const ACCOUNT_PATH = path.join(process.cwd(), "content", "account.json");

export type AccountFile = {
  password?: { salt: string; hash: string };
  avatarUrl?: string;
};

function readFile(): AccountFile | null {
  try {
    const raw = fs.readFileSync(ACCOUNT_PATH, "utf8");
    return JSON.parse(raw) as AccountFile;
  } catch {
    return null;
  }
}

function writeFile(data: AccountFile): void {
  writeFileSyncUtf8(ACCOUNT_PATH, `${JSON.stringify(data, null, 2)}\n`);
}

const ITER = 120_000;
const KEYLEN = 64;

export function hashPassword(password: string): { salt: string; hash: string } {
  const salt = randomBytes(16).toString("hex");
  const hash = pbkdf2Sync(password, salt, ITER, KEYLEN, "sha512").toString("hex");
  return { salt, hash };
}

export function verifyPassword(password: string, salt: string, hash: string): boolean {
  const h = pbkdf2Sync(password, salt, ITER, KEYLEN, "sha512").toString("hex");
  try {
    return timingSafeEqual(Buffer.from(h, "hex"), Buffer.from(hash, "hex"));
  } catch {
    return false;
  }
}

export function getAccount(): AccountFile | null {
  return readFile();
}

export function setPasswordHash(newPassword: string): void {
  const { salt, hash } = hashPassword(newPassword);
  const prev = readFile() ?? {};
  writeFile({ ...prev, password: { salt, hash } });
}

export function setAvatarUrl(url: string): void {
  const prev = readFile() ?? {};
  if (!url) {
    const next = { ...prev };
    delete next.avatarUrl;
    writeFile(next);
  } else {
    writeFile({ ...prev, avatarUrl: url });
  }
}

export function hasStoredPassword(): boolean {
  const a = readFile();
  return Boolean(a?.password?.hash && a?.password?.salt);
}

export function verifyStoredPassword(password: string): boolean {
  const a = readFile();
  if (!a?.password?.hash || !a?.password?.salt) return false;
  return verifyPassword(password, a.password.salt, a.password.hash);
}
