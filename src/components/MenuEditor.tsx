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
      items: [...updated[catIdx].items, { name: "", description: "", price: "" }],
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
            categories: updated.categories.map(
              (cat: {
                id: string;
                name: string;
                items: { id: string; name: string; description: string | null; price: string }[];
              }) => ({
                id: cat.id,
                name: cat.name,
                items: cat.items.map((item) => ({
                  id: item.id,
                  name: item.name,
                  description: item.description ?? "",
                  price: String(item.price),
                })),
              })
            ),
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

  const inputClass =
    "w-full bg-ink border border-rim rounded-lg px-3 py-2.5 text-sm text-parchment placeholder:text-dust focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-colors duration-150";

  return (
    <div className="bg-ink min-h-screen">
      {/* Top bar */}
      <div className="border-rim border-b">
        <div className="mx-auto flex max-w-3xl items-center gap-4 px-6 py-5">
          <button
            onClick={() => router.push("/admin")}
            className="text-ash hover:text-parchment flex items-center gap-1.5 text-sm transition-colors duration-150"
          >
            ← Back
          </button>
          <span className="text-rim">|</span>
          <h1
            className="text-parchment text-xl font-semibold"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {mode === "new" ? "New Menu" : "Edit Menu"}
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-10">
        {error && (
          <div className="bg-ember-dim border-ember/30 text-ember mb-6 flex items-start gap-2 rounded-lg border p-4 text-sm">
            <span className="shrink-0">⚠</span>
            {error}
          </div>
        )}

        {/* Menu details */}
        <section className="bg-canvas border-rim mb-6 space-y-4 rounded-xl border p-6">
          <h2 className="text-ash text-xs font-semibold tracking-[0.15em] uppercase">
            Menu Details
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-ash mb-1.5 block text-xs font-medium tracking-wide">
                Name <span className="text-gold">*</span>
              </label>
              <input
                type="text"
                value={menu.name}
                onChange={(e) => updateMenu({ name: e.target.value })}
                placeholder="e.g. Dinner Menu"
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-ash mb-1.5 block text-xs font-medium tracking-wide">
                Description
              </label>
              <input
                type="text"
                value={menu.description}
                onChange={(e) => updateMenu({ description: e.target.value })}
                placeholder="e.g. Available from 5pm – 10pm"
                className={inputClass}
              />
            </div>
          </div>
        </section>

        {/* Categories */}
        <div className="mb-4 space-y-4">
          {menu.categories.map((cat, catIdx) => (
            <section key={catIdx} className="bg-canvas border-rim rounded-xl border p-6">
              {/* Category header */}
              <div className="mb-5 flex items-center gap-3">
                <div className="bg-gold h-5 w-1 shrink-0 rounded-full" />
                <input
                  type="text"
                  value={cat.name}
                  onChange={(e) => updateCategory(catIdx, { name: e.target.value })}
                  placeholder="Category name (e.g. Starters)"
                  className="border-rim text-parchment focus:border-gold placeholder:text-dust flex-1 border-b bg-transparent pb-1 text-base font-medium transition-colors duration-150 focus:outline-none"
                />
                <button
                  onClick={() => removeCategory(catIdx)}
                  className="text-dust hover:text-ember ml-2 text-sm transition-colors duration-150"
                >
                  Remove
                </button>
              </div>

              {/* Items */}
              <div className="space-y-3">
                {cat.items.map((item, itemIdx) => (
                  <div key={itemIdx} className="flex items-start gap-2">
                    <div className="grid flex-1 grid-cols-[1fr_1fr_auto] gap-2">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => updateItem(catIdx, itemIdx, { name: e.target.value })}
                        placeholder="Item name"
                        className={inputClass}
                      />
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) =>
                          updateItem(catIdx, itemIdx, { description: e.target.value })
                        }
                        placeholder="Description (optional)"
                        className={inputClass}
                      />
                      <input
                        type="number"
                        value={item.price}
                        onChange={(e) => updateItem(catIdx, itemIdx, { price: e.target.value })}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        className="bg-ink border-rim text-gold placeholder:text-dust focus:border-gold focus:ring-gold/30 w-24 rounded-lg border px-3 py-2.5 text-sm transition-colors duration-150 focus:ring-1 focus:outline-none"
                      />
                    </div>
                    <button
                      onClick={() => removeItem(catIdx, itemIdx)}
                      className="text-dust hover:text-ember mt-3 text-lg leading-none transition-colors duration-150"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={() => addItem(catIdx)}
                className="text-gold hover:text-gilt mt-4 flex items-center gap-1 text-xs font-medium tracking-wide transition-colors duration-150"
              >
                <span className="text-base leading-none">+</span> Add item
              </button>
            </section>
          ))}
        </div>

        <button
          onClick={addCategory}
          className="border-rim text-ash hover:border-gold/50 hover:text-gold mb-10 w-full rounded-xl border border-dashed py-4 text-sm font-medium transition-colors duration-200"
        >
          + Add Category
        </button>

        {/* Save */}
        <div className="flex items-center gap-4">
          <button
            onClick={save}
            disabled={saving}
            className="bg-gold text-ink hover:bg-gilt flex items-center gap-2 rounded-lg px-7 py-2.5 text-sm font-semibold transition-colors duration-150 disabled:opacity-40"
          >
            {saving ? (
              <>
                <div className="border-ink/40 border-t-ink h-3.5 w-3.5 animate-spin rounded-full border" />
                Saving…
              </>
            ) : (
              "Save Menu"
            )}
          </button>
          {saved && (
            <span className="text-sprout flex items-center gap-1.5 text-sm font-medium">
              <span>✓</span> Saved
            </span>
          )}
        </div>

        {/* QR Code */}
        {mode === "edit" && menuUrl && (
          <div className="bg-canvas border-rim mt-10 rounded-xl border p-6">
            <h2 className="text-ash mb-5 text-xs font-semibold tracking-[0.15em] uppercase">
              QR Code
            </h2>
            <QRCodeDisplay url={menuUrl} menuName={menu.name} />
          </div>
        )}
      </div>
    </div>
  );
}
