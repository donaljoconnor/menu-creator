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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Menus</h1>
          <Link
            href="/admin/menus/new"
            className="bg-amber-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-amber-800 transition-colors"
          >
            + New Menu
          </Link>
        </div>

        {loading && (
          <p className="text-gray-500">Loading...</p>
        )}

        {!loading && menus.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <p className="text-xl">No menus yet.</p>
            <p className="mt-2">Create your first menu to get started.</p>
          </div>
        )}

        <div className="grid gap-4">
          {menus.map((menu) => (
            <div
              key={menu.id}
              className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-between gap-4"
            >
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{menu.name}</h2>
                {menu.description && (
                  <p className="text-sm text-gray-500 mt-0.5">{menu.description}</p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  /menu/{menu.slug}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Link
                  href={`/menu/${menu.slug}`}
                  target="_blank"
                  className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  View
                </Link>
                <button
                  onClick={() => router.push(`/admin/menus/${menu.id}`)}
                  className="px-3 py-1.5 text-sm rounded-lg bg-amber-100 text-amber-900 hover:bg-amber-200 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteMenu(menu.id, menu.name)}
                  className="px-3 py-1.5 text-sm rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
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
