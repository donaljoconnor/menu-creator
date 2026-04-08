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
    <div className="min-h-screen bg-ink">
      {/* Top bar */}
      <div className="border-b border-rim">
        <div className="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-gold" />
            <span className="text-ash text-xs tracking-[0.2em] uppercase font-medium">
              Menu Creator
            </span>
          </div>
          <Link
            href="/admin/menus/new"
            className="flex items-center gap-2 bg-gold text-ink text-sm font-semibold px-4 py-2 rounded-lg hover:bg-gilt transition-colors duration-150"
          >
            <span className="text-base leading-none">+</span>
            New Menu
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Page heading */}
        <div className="mb-10">
          <h1
            className="text-4xl font-bold text-parchment"
            style={{ fontFamily: "var(--font-display)" }}
          >
            My Menus
          </h1>
          <div className="mt-3 h-px bg-gradient-to-r from-gold via-rim to-transparent" />
        </div>

        {loading && (
          <div className="flex items-center gap-3 text-ash">
            <div className="w-4 h-4 border border-ash border-t-gold rounded-full animate-spin" />
            <span className="text-sm">Loading your menus…</span>
          </div>
        )}

        {!loading && menus.length === 0 && (
          <div className="text-center py-24 border border-dashed border-rim rounded-2xl">
            <p
              className="text-2xl text-parchment mb-2"
              style={{ fontFamily: "var(--font-display)" }}
            >
              No menus yet
            </p>
            <p className="text-sm text-ash">Create your first menu to get started.</p>
          </div>
        )}

        <div className="space-y-3">
          {menus.map((menu) => (
            <div
              key={menu.id}
              className="group bg-canvas border border-rim rounded-xl p-5 flex items-center justify-between gap-4 hover:border-gold/40 transition-colors duration-200"
            >
              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-parchment truncate">
                  {menu.name}
                </h2>
                {menu.description && (
                  <p className="text-sm text-ash mt-0.5 truncate">{menu.description}</p>
                )}
                <p className="text-xs text-dust mt-1 font-mono">/menu/{menu.slug}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={`/menu/${menu.slug}`}
                  target="_blank"
                  className="px-3 py-1.5 text-xs tracking-wide rounded-lg border border-rim text-ash hover:border-ash hover:text-parchment transition-colors duration-150"
                >
                  View ↗
                </Link>
                <button
                  onClick={() => router.push(`/admin/menus/${menu.id}`)}
                  className="px-3 py-1.5 text-xs tracking-wide rounded-lg bg-lift text-gold border border-gold/30 hover:bg-gold hover:text-ink transition-colors duration-150 font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteMenu(menu.id, menu.name)}
                  className="px-3 py-1.5 text-xs tracking-wide rounded-lg text-ember hover:bg-ember-dim transition-colors duration-150"
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
