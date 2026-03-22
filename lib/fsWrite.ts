import fs from "fs";
import fsp from "fs/promises";
import path from "path";

/** Ensures a directory path exists (e.g. before writing a file inside it). */
export function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/** Ensures the parent directory of `filePath` exists. */
export function ensureDirForFile(filePath: string): void {
  ensureDir(path.dirname(filePath));
}

export function writeFileSyncUtf8(filePath: string, data: string): void {
  ensureDirForFile(filePath);
  try {
    fs.writeFileSync(filePath, data, "utf8");
  } catch (e) {
    throw e instanceof Error ? e : new Error(String(e));
  }
}

export async function writeFileUtf8(filePath: string, data: string): Promise<void> {
  ensureDirForFile(filePath);
  try {
    await fsp.writeFile(filePath, data, "utf8");
  } catch (e) {
    throw e instanceof Error ? e : new Error(String(e));
  }
}
