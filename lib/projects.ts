import fs from "fs";
import path from "path";
import { writeFileSyncUtf8 } from "@/lib/fsWrite";

const PROJECTS_PATH = path.join(process.cwd(), "content", "projects.json");

export type Project = {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  tags: string[];
  image: string;
  liveUrl: string;
  githubUrl: string;
  status: "launched" | "building" | "planned";
  featured: boolean;
  date: string;
  order: number;
};

function readRaw(): Project[] {
  try {
    const raw = fs.readFileSync(PROJECTS_PATH, "utf8");
    const data = JSON.parse(raw) as unknown;
    return Array.isArray(data) ? (data as Project[]) : [];
  } catch {
    return [];
  }
}

function writeAll(projects: Project[]): void {
  writeFileSyncUtf8(PROJECTS_PATH, `${JSON.stringify(projects, null, 2)}\n`);
}

function sortByOrder(projects: Project[]): Project[] {
  return [...projects].sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
}

export function getAllProjects(): Project[] {
  return sortByOrder(readRaw());
}

export function getFeaturedProjects(): Project[] {
  return getAllProjects().filter((p) => p.featured);
}

export function getProjectById(id: string): Project | null {
  return readRaw().find((p) => p.id === id) ?? null;
}

function nextId(projects: Project[]): string {
  const nums = projects.map((p) => parseInt(p.id, 10)).filter((n) => !Number.isNaN(n));
  const max = nums.length ? Math.max(...nums) : 0;
  return String(max + 1);
}

export function createProject(project: Omit<Project, "id">): Project {
  const projects = readRaw();
  const id = nextId(projects);
  const row: Project = { ...project, id };
  projects.push(row);
  writeAll(sortByOrder(projects));
  return row;
}

export function updateProject(id: string, data: Partial<Project>): Project | null {
  const projects = readRaw();
  const idx = projects.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  const prev = projects[idx];
  const next: Project = { ...prev, ...data, id: prev.id };
  projects[idx] = next;
  writeAll(sortByOrder(projects));
  return next;
}

export function deleteProject(id: string): boolean {
  const projects = readRaw();
  const next = projects.filter((p) => p.id !== id);
  if (next.length === projects.length) return false;
  writeAll(next);
  return true;
}
