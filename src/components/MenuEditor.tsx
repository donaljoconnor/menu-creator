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

  const inputClass =
    "w-full bg-ink border border-rim rounded-lg px-3 py-2.5 text-sm text-parchment placeholder:text-dust focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-colors duration-150";

  return (
    <div className="min-h-screen bg-ink">
      {/* Top bar */}
      <div className="border-b border-rim">
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center gap-4">
          <button
            onClick={() => router.push("/admin")}
            className="text-ash hover:text-parchment text-sm transition-colors duration-150 flex items-center gap-1.5"
          >
            ← Back
          </button>
          <span className="text-rim">|</span>
          <h1
            className="text-xl font-semibold text-parchment"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {mode === "new" ? "New Menu" : "Edit Menu"}
          </h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10">
        {error && (
          <div className="mb-6 p-4 bg-ember-dim border border-ember/30 text-ember rounded-lg text-sm flex items-start gap-2">
            <span className="shrink-0">⚠</span>
            {error}
          </div>
        )}

        {/* Menu details */}
        <section className="bg-canvas border border-rim rounded-xl p-6 mb-6 space-y-4">
          <h2 className="text-xs font-semibold tracking-[0.15em] uppercase text-ash">
            Menu Details
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-ash mb-1.5 tracking-wide">
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
              <label className="block text-xs font-medium text-ash mb-1.5 tracking-wide">
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
        <div className="space-y-4 mb-4">
          {menu.categories.map((cat, catIdx) => (
            <section
              key={catIdx}
              className="bg-canvas border border-rim rounded-xl p-6"
            >
              {/* Category header */}
              <div className="flex items-center gap-3 mb-5">
                <div className="w-1 h-5 bg-gold rounded-full shrink-0" />
                <input
                  type="text"
                  value={cat.name}
                  onChange={(e) => updateCategory(catIdx, { name: e.target.value })}
                  placeholder="Category name (e.g. Starters)"
                  className="flex-1 bg-transparent border-b border-rim text-parchment font-medium text-base pb-1 focus:outline-none focus:border-gold transition-colors duration-150 placeholder:text-dust"
                />
                <button
                  onClick={() => removeCategory(catIdx)}
                  className="text-dust hover:text-ember text-sm transition-colors duration-150 ml-2"
                >
                  Remove
                </button>
              </div>

              {/* Items */}
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
                        onChange={(e) =>
                          updateItem(catIdx, itemIdx, { price: e.target.value })
                        }
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        className="w-24 bg-ink border border-rim rounded-lg px-3 py-2.5 text-sm text-gold placeholder:text-dust focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-colors duration-150"
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
                className="mt-4 text-xs tracking-wide text-gold hover:text-gilt font-medium transition-colors duration-150 flex items-center gap-1"
              >
                <span className="text-base leading-none">+</span> Add item
              </button>
            </section>
          ))}
        </div>

        <button
          onClick={addCategory}
          className="w-full py-4 border border-dashed border-rim rounded-xl text-ash hover:border-gold/50 hover:text-gold transition-colors duration-200 text-sm font-medium mb-10"
        >
          + Add Category
        </button>

        {/* Save */}
        <div className="flex items-center gap-4">
          <button
            onClick={save}
            disabled={saving}
            className="bg-gold text-ink px-7 py-2.5 rounded-lg text-sm font-semibold hover:bg-gilt disabled:opacity-40 transition-colors duration-150 flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="w-3.5 h-3.5 border border-ink/40 border-t-ink rounded-full animate-spin" />
                Saving…
              </>
            ) : (
              "Save Menu"
            )}
          </button>
          {saved && (
            <span className="text-sprout text-sm font-medium flex items-center gap-1.5">
              <span>✓</span> Saved
            </span>
          )}
        </div>

        {/* QR Code */}
        {mode === "edit" && menuUrl && (
          <div className="mt-10 bg-canvas border border-rim rounded-xl p-6">
            <h2 className="text-xs font-semibold tracking-[0.15em] uppercase text-ash mb-5">
              QR Code
            </h2>
            <QRCodeDisplay url={menuUrl} menuName={menu.name} />
          </div>
        )}
      </div>
    </div>
  );
}
