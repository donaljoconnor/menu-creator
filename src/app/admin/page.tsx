"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Menu {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  createdAt: string;
}

export default function AdminPage() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/menus")
      .then((r) => r.json())
      .then((data) => {
        setMenus(data);
        setLoading(false);
      });
  }, []);

  async function deleteMenu(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    await fetch(`/api/menus/${id}`, { method: "DELETE" });
    setMenus((prev) => prev.filter((m) => m.id !== id));
  }

  return (
    <div className="bg-ink min-h-screen">
      {/* Top bar */}
      <div className="border-rim border-b">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="bg-gold h-2 w-2 rounded-full" />
            <span className="text-ash text-xs font-medium tracking-[0.2em] uppercase">
              Menu Creator
            </span>
          </div>
          <Link
            href="/admin/menus/new"
            className="bg-gold text-ink hover:bg-gilt flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors duration-150"
          >
            <span className="text-base leading-none">+</span>
            New Menu
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-12">
        {/* Page heading */}
        <div className="mb-10">
          <h1
            className="text-parchment text-4xl font-bold"
            style={{ fontFamily: "var(--font-display)" }}
          >
            My Menus
          </h1>
          <div className="from-gold via-rim mt-3 h-px bg-gradient-to-r to-transparent" />
        </div>

        {loading && (
          <div className="text-ash flex items-center gap-3">
            <div className="border-ash border-t-gold h-4 w-4 animate-spin rounded-full border" />
            <span className="text-sm">Loading your menus…</span>
          </div>
        )}

        {!loading && menus.length === 0 && (
          <div className="border-rim rounded-2xl border border-dashed py-24 text-center">
            <p
              className="text-parchment mb-2 text-2xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              No menus yet
            </p>
            <p className="text-ash text-sm">Create your first menu to get started.</p>
          </div>
        )}

        <div className="space-y-3">
          {menus.map((menu) => (
            <div
              key={menu.id}
              className="group bg-canvas border-rim hover:border-gold/40 flex items-center justify-between gap-4 rounded-xl border p-5 transition-colors duration-200"
            >
              <div className="min-w-0">
                <h2 className="text-parchment truncate text-lg font-semibold">{menu.name}</h2>
                {menu.description && (
                  <p className="text-ash mt-0.5 truncate text-sm">{menu.description}</p>
                )}
                <p className="text-dust mt-1 font-mono text-xs">/menu/{menu.slug}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Link
                  href={`/menu/${menu.slug}`}
                  target="_blank"
                  className="border-rim text-ash hover:border-ash hover:text-parchment rounded-lg border px-3 py-1.5 text-xs tracking-wide transition-colors duration-150"
                >
                  View ↗
                </Link>
                <button
                  onClick={() => router.push(`/admin/menus/${menu.id}`)}
                  className="bg-lift text-gold border-gold/30 hover:bg-gold hover:text-ink rounded-lg border px-3 py-1.5 text-xs font-medium tracking-wide transition-colors duration-150"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteMenu(menu.id, menu.name)}
                  className="text-ember hover:bg-ember-dim rounded-lg px-3 py-1.5 text-xs tracking-wide transition-colors duration-150"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
