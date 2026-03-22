"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { Project } from "@/lib/projects";

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    fetch("/api/admin/projects")
      .then((r) => {
        if (!r.ok) throw new Error("Unauthorized");
        return r.json();
      })
      .then((d: { projects?: Project[] }) => setProjects(Array.isArray(d.projects) ? d.projects : []))
      .catch(() => setError("Failed to load projects."));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function remove(id: string) {
    if (!confirm("Delete this project?")) return;
    const res = await fetch(`/api/admin/projects/${encodeURIComponent(id)}`, { method: "DELETE" });
    if (res.ok) load();
  }

  if (error) return <p className="text-red-400">{error}</p>;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-syne)] text-3xl font-extrabold">Projects</h1>
          <p className="mt-2 text-sm text-[#e8e8ef]/45">Manage portfolio projects.</p>
        </div>
        <Link
          href="/admin/projects/new"
          className="rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed] px-6 py-2.5 text-sm font-semibold text-white"
        >
          Add Project
        </Link>
      </div>

      <div className="mt-10 overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[#8b5cf6]/15 text-[#e8e8ef]/45">
              <th className="py-3 pr-4">Title</th>
              <th className="py-3 pr-4">Status</th>
              <th className="py-3 pr-4">Date</th>
              <th className="py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr key={p.id} className="border-b border-[#8b5cf6]/8">
                <td className="py-3 pr-4 font-medium text-[#e8e8ef]">{p.title}</td>
                <td className="py-3 pr-4 capitalize text-[#e8e8ef]/65">{p.status}</td>
                <td className="py-3 pr-4 text-[#e8e8ef]/45">{p.date}</td>
                <td className="py-3">
                  <Link href={`/admin/projects/edit/${encodeURIComponent(p.id)}`} className="mr-3 text-[#8b5cf6] hover:underline">
                    Edit
                  </Link>
                  <button type="button" onClick={() => void remove(p.id)} className="text-red-400 hover:underline">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
