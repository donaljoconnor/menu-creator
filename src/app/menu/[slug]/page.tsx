import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const menu = await prisma.menu.findUnique({ where: { slug } });
  if (!menu) return { title: "Menu Not Found" };
  return { title: menu.name };
}

export default async function MenuPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const menu = await prisma.menu.findUnique({
    where: { slug },
    include: {
      categories: {
        orderBy: { order: "asc" },
        include: { items: { orderBy: { order: "asc" } } },
      },
    },
  });

  if (!menu) notFound();
  const m = menu!;

  return (
    <div className="min-h-screen bg-ink">
      {/* Hero header */}
      <header className="relative pt-16 pb-14 px-6 text-center overflow-hidden">
        {/* Decorative radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(200,145,74,0.08) 0%, transparent 70%)",
          }}
        />

        {/* Top rule */}
        <div className="max-w-xs mx-auto mb-8 flex items-center gap-3">
          <div className="flex-1 h-px bg-rim" />
          <div className="w-1.5 h-1.5 bg-gold rotate-45" />
          <div className="flex-1 h-px bg-rim" />
        </div>

        <p className="text-xs tracking-[0.3em] uppercase text-ash mb-4">
          Menu
        </p>
        <h1
          className="text-5xl md:text-6xl font-bold text-parchment leading-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {m.name}
        </h1>
        {m.description && (
          <p
            className="mt-4 text-lg text-ash max-w-md mx-auto italic"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {m.description}
          </p>
        )}

        {/* Bottom rule */}
        <div className="max-w-xs mx-auto mt-8 flex items-center gap-3">
          <div className="flex-1 h-px bg-linear-to-r from-transparent to-gold" />
          <div className="w-1.5 h-1.5 bg-gold rotate-45" />
          <div className="flex-1 h-px bg-linear-to-l from-transparent to-gold" />
        </div>
      </header>

      {/* Menu content */}
      <main className="max-w-2xl mx-auto px-6 pb-20">
        {m.categories.length === 0 && (
          <p className="text-center text-ash py-12">This menu has no items yet.</p>
        )}

        {m.categories.map((category, catIdx) => (
          <section
            key={category.id}
            className={catIdx > 0 ? "mt-14" : ""}
          >
            {/* Category heading */}
            <div className="flex items-center gap-4 mb-6">
              <h2
                className="text-sm font-semibold tracking-[0.2em] uppercase text-gold"
              >
                {category.name}
              </h2>
              <div className="flex-1 h-px bg-rim" />
            </div>

            {/* Items */}
            <ul className="space-y-5">
              {category.items.map((item) => (
                <li key={item.id} className="group">
                  <div className="flex items-baseline justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span
                          className="font-semibold text-parchment text-base"
                          style={{ fontFamily: "var(--font-display)" }}
                        >
                          {item.name}
                        </span>
                        {/* Dot leader */}
                        <span className="flex-1 border-b border-dotted border-dust/40 mb-0.5" />
                      </div>
                      {item.description && (
                        <p className="text-sm text-ash mt-0.5 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>
                    <span className="font-semibold text-gold whitespace-nowrap text-sm tabular-nums">
                      {formatPrice(item.price.toString())}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}

        {/* Footer mark */}
        <div className="mt-20 flex items-center gap-3 max-w-xs mx-auto">
          <div className="flex-1 h-px bg-rim" />
          <div className="w-1 h-1 bg-dust rotate-45" />
          <div className="flex-1 h-px bg-rim" />
        </div>
      </main>
    </div>
  );
}
