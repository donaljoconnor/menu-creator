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
    <div className="relative min-h-screen bg-cream text-page-ink">
      {/* Dot grid texture */}
      <div
        aria-hidden
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 0,
          backgroundImage:
            "radial-gradient(circle, #C9BFB0 1.5px, transparent 1.5px)",
          backgroundSize: "26px 26px",
          opacity: 0.55,
        }}
      />

      <div className="relative" style={{ zIndex: 1 }}>
        {/* ── Hero header ── */}
        <header
          className="px-6 pt-10 pb-10 border-b-[3px] border-page-ink menu-fade"
          style={{ animationDelay: "0s" }}
        >
          <div className="max-w-2xl mx-auto">
            {/* Rotated badge */}
            <div className="mb-5">
              <span
                className="inline-block bg-punch text-cream text-[10px] font-bold tracking-[0.35em] uppercase px-4 py-2 select-none"
                style={{
                  transform: "rotate(-2deg)",
                  fontFamily: "var(--font-sans)",
                  display: "inline-block",
                }}
              >
                ✦ Menu
              </span>
            </div>

            <h1
              className="font-extrabold text-page-ink leading-[0.88] tracking-tight"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(2.8rem, 11vw, 6.5rem)",
              }}
            >
              {m.name}
            </h1>

            {m.description && (
              <p
                className="mt-5 text-base text-muted max-w-sm leading-relaxed font-medium"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                {m.description}
              </p>
            )}

            {/* Decorative colour strip */}
            <div className="mt-8 flex">
              <div className="w-16 h-[3px] bg-punch" />
              <div className="w-6 h-[3px] bg-lime" />
              <div className="w-10 h-[3px] bg-border" />
            </div>
          </div>
        </header>

        {/* ── Menu content ── */}
        <main className="max-w-2xl mx-auto px-6 py-12">
          {m.categories.length === 0 && (
            <p className="text-center text-muted py-12 font-medium">
              This menu has no items yet.
            </p>
          )}

          {m.categories.map((category, catIdx) => (
            <section
              key={category.id}
              className={`menu-fade${catIdx > 0 ? " mt-16" : ""}`}
              style={{ animationDelay: `${catIdx * 0.1 + 0.15}s` }}
            >
              {/* Category heading with marker-highlight treatment */}
              <div className="mb-7">
                <h2
                  style={{
                    fontFamily: "var(--font-sans)",
                    background:
                      "linear-gradient(transparent 42%, rgba(197, 227, 50, 0.75) 42%)",
                    display: "inline",
                    paddingRight: "6px",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    letterSpacing: "0.28em",
                    textTransform: "uppercase",
                    color: "#111111",
                  }}
                >
                  {category.name}
                </h2>
                <div className="h-[2px] bg-page-ink mt-3" />
              </div>

              {/* Items */}
              <ul className="space-y-7">
                {category.items.map((item) => (
                  <li key={item.id} className="menu-item flex items-start justify-between gap-6">
                    <div className="flex-1 min-w-0">
                      <div
                        className="font-bold text-page-ink text-xl leading-snug"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        {item.name}
                      </div>
                      {item.description && (
                        <p
                          className="text-sm text-muted mt-1 leading-relaxed"
                          style={{ fontFamily: "var(--font-sans)" }}
                        >
                          {item.description}
                        </p>
                      )}
                    </div>
                    <span
                      className="font-extrabold text-punch text-base whitespace-nowrap tabular-nums shrink-0 mt-0.5"
                      style={{ fontFamily: "var(--font-sans)" }}
                    >
                      {formatPrice(item.price.toString())}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ))}

          {/* Footer mark */}
          <div className="mt-20 flex items-center gap-3">
            <div className="flex-1 h-[2px] bg-page-ink" />
            <div className="w-3 h-3 bg-punch rotate-45" />
            <div className="flex-1 h-[2px] bg-page-ink" />
          </div>
        </main>
      </div>
    </div>
  );
}
