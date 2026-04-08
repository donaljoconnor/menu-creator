"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import QRCodeDisplay from "./QRCodeDisplay";

interface MenuItemForm {
  id?: string;
  name: string;
  description: string;
  price: string;
}

interface CategoryForm {
  id?: string;
  name: string;
  items: MenuItemForm[];
}

interface MenuForm {
  id?: string;
  name: string;
  slug?: string;
  description: string;
  categories: CategoryForm[];
}

interface Props {
  initial?: MenuForm;
  mode: "new" | "edit";
}

export default function MenuEditor({ initial, mode }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [menu, setMenu] = useState<MenuForm>(
    initial ?? { name: "", description: "", categories: [] }
  );

  function updateMenu(patch: Partial<MenuForm>) {
    setMenu((prev) => ({ ...prev, ...patch }));
    setSaved(false);
  }

  function addCategory() {
    updateMenu({
      categories: [...menu.categories, { name: "", items: [] }],
    });
  }

  function removeCategory(idx: number) {
    updateMenu({ categories: menu.categories.filter((_, i) => i !== idx) });
  }

  function updateCategory(idx: number, patch: Partial<CategoryForm>) {
    const updated = [...menu.categories];
    updated[idx] = { ...updated[idx], ...patch };
    updateMenu({ categories: updated });
  }

  function addItem(catIdx: number) {
    const updated = [...menu.categories];
    updated[catIdx] = {
      ...updated[catIdx],
      items: [
        ...updated[catIdx].items,
        { name: "", description: "", price: "" },
      ],
    };
    updateMenu({ categories: updated });
  }

  function removeItem(catIdx: number, itemIdx: number) {
    const updated = [...menu.categories];
    updated[catIdx] = {
      ...updated[catIdx],
      items: updated[catIdx].items.filter((_, i) => i !== itemIdx),
    };
    updateMenu({ categories: updated });
  }

  function updateItem(catIdx: number, itemIdx: number, patch: Partial<MenuItemForm>) {
    const updated = [...menu.categories];
    const items = [...updated[catIdx].items];
    items[itemIdx] = { ...items[itemIdx], ...patch };
    updated[catIdx] = { ...updated[catIdx], items };
    updateMenu({ categories: updated });
  }

  async function save() {
    setError("");
    if (!menu.name.trim()) {
      setError("Menu name is required.");
      return;
    }

    for (const cat of menu.categories) {
      if (!cat.name.trim()) {
        setError("All categories must have a name.");
        return;
      }
      for (const item of cat.items) {
        if (!item.name.trim()) {
          setError("All items must have a name.");
          return;
        }
        if (isNaN(parseFloat(item.price)) || parseFloat(item.price) < 0) {
          setError(`Item "${item.name}" has an invalid price.`);
          return;
        }
      }
    }

    setSaving(true);
    try {
      const payload = {
        name: menu.name,
        description: menu.description,
        categories: menu.categories.map((cat) => ({
          name: cat.name,
          items: cat.items.map((item) => ({
            name: item.name,
            description: item.description,
            price: parseFloat(item.price),
          })),
        })),
      };

      let res: Response;
      if (mode === "new") {
        res = await fetch("/api/menus", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const created = await res.json();
          router.push(`/admin/menus/${created.id}`);
          return;
        }
      } else {
        res = await fetch(`/api/menus/${menu.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const updated = await res.json();
          setMenu({
            ...menu,
            slug: updated.slug,
            categories: updated.categories.map((cat: { id: string; name: string; items: { id: string; name: string; description: string | null; price: string }[] }) => ({
              id: cat.id,
              name: cat.name,
              items: cat.items.map((item) => ({
                id: item.id,
                name: item.name,
                description: item.description ?? "",
                price: String(item.price),
              })),
            })),
          });
          setSaved(true);
        }
      }

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to save.");
      }
    } finally {
      setSaving(false);
    }
  }

  const menuUrl =
    typeof window !== "undefined" && menu.slug
      ? `${window.location.origin}/menu/${menu.slug}`
      : null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.push("/admin")}
          className="text-gray-500 hover:text-gray-700 text-sm"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {mode === "new" ? "New Menu" : "Edit Menu"}
        </h1>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Menu details */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 space-y-4">
        <h2 className="font-semibold text-gray-700">Menu Details</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Menu Name *
          </label>
          <input
            type="text"
            value={menu.name}
            onChange={(e) => updateMenu({ name: e.target.value })}
            placeholder="e.g. Dinner Menu"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <input
            type="text"
            value={menu.description}
            onChange={(e) => updateMenu({ description: e.target.value })}
            placeholder="e.g. Available from 5pm - 10pm"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-4 mb-6">
        {menu.categories.map((cat, catIdx) => (
          <div
            key={catIdx}
            className="bg-white rounded-xl border border-gray-200 p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <input
                type="text"
                value={cat.name}
                onChange={(e) => updateCategory(catIdx, { name: e.target.value })}
                placeholder="Category name (e.g. Starters)"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button
                onClick={() => removeCategory(catIdx)}
                className="text-red-400 hover:text-red-600 text-sm px-2"
              >
                Remove
              </button>
            </div>

            <div className="space-y-3">
              {cat.items.map((item, itemIdx) => (
                <div key={itemIdx} className="flex gap-2 items-start">
                  <div className="flex-1 grid grid-cols-[1fr_1fr_auto] gap-2">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) =>
                        updateItem(catIdx, itemIdx, { name: e.target.value })
                      }
                      placeholder="Item name"
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) =>
                        updateItem(catIdx, itemIdx, { description: e.target.value })
                      }
                      placeholder="Description (optional)"
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <input
                      type="number"
                      value={item.price}
                      onChange={(e) =>
                        updateItem(catIdx, itemIdx, { price: e.target.value })
                      }
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <button
                    onClick={() => removeItem(catIdx, itemIdx)}
                    className="text-red-400 hover:text-red-600 mt-2"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={() => addItem(catIdx)}
              className="mt-3 text-sm text-amber-700 hover:text-amber-900 font-medium"
            >
              + Add item
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={addCategory}
        className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-amber-400 hover:text-amber-700 transition-colors text-sm font-medium mb-8"
      >
        + Add Category
      </button>

      {/* Save button */}
      <div className="flex items-center gap-4">
        <button
          onClick={save}
          disabled={saving}
          className="bg-amber-900 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-amber-800 disabled:opacity-50 transition-colors"
        >
          {saving ? "Saving…" : "Save Menu"}
        </button>
        {saved && (
          <span className="text-green-600 text-sm font-medium">Saved!</span>
        )}
      </div>

      {/* QR Code — only shown after save in edit mode */}
      {mode === "edit" && menuUrl && (
        <div className="mt-10 bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-700 mb-4">QR Code</h2>
          <QRCodeDisplay url={menuUrl} menuName={menu.name} />
        </div>
      )}
    </div>
  );
}
