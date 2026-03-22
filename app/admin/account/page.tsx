"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function AdminAccountPage() {
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void Promise.resolve().then(() => {
      fetch("/api/admin/account")
        .then((r) => r.json())
        .then((d: { username?: string; avatarUrl?: string | null; error?: string }) => {
          if (d.error) setError(d.error);
          else {
            if (d.username) setUsername(d.username);
            setAvatarUrl(d.avatarUrl ?? null);
          }
        })
        .catch(() => setError("Failed to load account."));
    });
  }, []);

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setError(null);
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/admin/account", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError((d as { error?: string }).error ?? "Update failed.");
        return;
      }
      setMessage("Password updated.");
      setCurrentPassword("");
      setNewPassword("");
    } finally {
      setBusy(false);
    }
  }

  async function uploadAvatar(file: File) {
    setMessage(null);
    setError(null);
    setBusy(true);
    try {
      const fd = new FormData();
      fd.set("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError((d as { error?: string }).error ?? "Upload failed.");
        return;
      }
      const url = (d as { url?: string }).url;
      if (!url) {
        setError("No URL returned.");
        return;
      }
      const res2 = await fetch("/api/admin/account", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarUrl: url }),
      });
      const d2 = await res2.json().catch(() => ({}));
      if (!res2.ok) {
        setError((d2 as { error?: string }).error ?? "Failed to save avatar.");
        return;
      }
      setAvatarUrl(url);
      setMessage("Avatar updated.");
    } finally {
      setBusy(false);
    }
  }

  async function clearAvatar() {
    setBusy(true);
    try {
      const res = await fetch("/api/admin/account", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarUrl: "" }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError((d as { error?: string }).error ?? "Failed to clear avatar.");
        return;
      }
      setAvatarUrl(null);
      setMessage("Avatar removed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <h1 className="font-[family-name:var(--font-syne)] text-3xl font-extrabold">Account</h1>
      <p className="mt-2 text-sm text-[#e8e8ef]/45">Signed in as {username || "…"}</p>

      {error ? <p className="mt-4 text-sm text-red-400">{error}</p> : null}
      {message ? <p className="mt-4 text-sm text-emerald-400">{message}</p> : null}

      <div className="mt-10 max-w-lg space-y-10">
        <section>
          <h2 className="text-lg font-semibold text-[#e8e8ef]">Avatar</h2>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <div className="relative h-20 w-20 overflow-hidden rounded-full border border-[#8b5cf6]/20 bg-[#08080c]">
              {avatarUrl ? (
                <Image src={avatarUrl} alt="" fill className="object-cover" sizes="80px" unoptimized />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-[#e8e8ef]/35">
                  No image
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <label className="cursor-pointer rounded-full border border-[#8b5cf6]/30 px-4 py-2 text-sm font-semibold text-[#e8e8ef] hover:bg-[#8b5cf6]/10">
                Upload image
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={busy}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void uploadAvatar(f);
                    e.target.value = "";
                  }}
                />
              </label>
              {avatarUrl ? (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void clearAvatar()}
                  className="rounded-full border border-red-500/30 px-4 py-2 text-sm text-red-300"
                >
                  Remove
                </button>
              ) : null}
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#e8e8ef]">Change password</h2>
          <p className="mt-2 text-sm text-[#e8e8ef]/45">
            After the first change, the new password is stored securely in{" "}
            <code className="text-[#e8e8ef]/65">content/account.json</code> (hash). Environment password still works
            until you change it here.
          </p>
          <form className="mt-6 space-y-4" onSubmit={savePassword}>
            <input
              type="password"
              autoComplete="current-password"
              className="w-full rounded-lg border border-[#8b5cf6]/15 bg-[#08080c] px-3 py-2 text-sm text-[#e8e8ef]"
              placeholder="Current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
            <input
              type="password"
              autoComplete="new-password"
              className="w-full rounded-lg border border-[#8b5cf6]/15 bg-[#08080c] px-3 py-2 text-sm text-[#e8e8ef]"
              placeholder="New password (min 8 characters)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
            />
            <button
              type="submit"
              disabled={busy}
              className="rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed] px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              Update password
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
