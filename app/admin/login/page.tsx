"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(typeof data.error === "string" ? data.error : "Login failed.");
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a12] px-6">
      <div className="w-full max-w-sm rounded-2xl border border-[#8b5cf6]/15 bg-[rgb(15,13,28)]/80 p-8">
        <h1 className="font-[family-name:var(--font-syne)] text-2xl font-extrabold text-[#e8e8ef]">Admin login</h1>
        <p className="mt-2 text-sm text-[#e8e8ef]/45">Sign in to manage posts and messages.</p>
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-[#e8e8ef]/55">
              Username
            </label>
            <input
              className="mt-1 w-full rounded-lg border border-[#8b5cf6]/15 bg-[#0a0a12] px-3 py-2 text-[#e8e8ef] outline-none focus:border-[#8b5cf6]/45"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-[#e8e8ef]/55">
              Password
            </label>
            <input
              type="password"
              className="mt-1 w-full rounded-lg border border-[#8b5cf6]/15 bg-[#0a0a12] px-3 py-2 text-[#e8e8ef] outline-none focus:border-[#8b5cf6]/45"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed] py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
