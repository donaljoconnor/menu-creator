import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const menu = await prisma.menu.findUnique({ where: { slug } });
  if (!menu) return { title: "Menu Not Found" };
  return { title: menu.name };
}

export default async function MenuPage({ params }: { params: Promise<{ slug: string }> }) {
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
    <div className="bg-cream text-page-ink relative min-h-screen">
      {/* Dot grid texture */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{
          zIndex: 0,
          backgroundImage: "radial-gradient(circle, #C9BFB0 1.5px, transparent 1.5px)",
          backgroundSize: "26px 26px",
          opacity: 0.55,
        }}
      />

      <div className="relative" style={{ zIndex: 1 }}>
        {/* ── Hero header ── */}
        <header
          className="border-page-ink menu-fade border-b-[3px] px-6 pt-10 pb-10"
          style={{ animationDelay: "0s" }}
        >
          <div className="mx-auto max-w-2xl">
            {/* Rotated badge */}
            <div className="mb-5">
              <span
                className="bg-punch text-cream inline-block px-4 py-2 text-[10px] font-bold tracking-[0.35em] uppercase select-none"
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
              className="text-page-ink leading-[0.88] font-extrabold tracking-tight"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(2.8rem, 11vw, 6.5rem)",
              }}
            >
              {m.name}
            </h1>

            {m.description && (
              <p
                className="text-muted mt-5 max-w-sm text-base leading-relaxed font-medium"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                {m.description}
              </p>
            )}

            {/* Decorative colour strip */}
            <div className="mt-8 flex">
              <div className="bg-punch h-[3px] w-16" />
              <div className="bg-lime h-[3px] w-6" />
              <div className="bg-border h-[3px] w-10" />
            </div>
          </div>
        </header>

        {/* ── Menu content ── */}
        <main className="mx-auto max-w-2xl px-6 py-12">
          {m.categories.length === 0 && (
            <p className="text-muted py-12 text-center font-medium">This menu has no items yet.</p>
          )}

          {m.categories.map((category, catIdx) => (
            <section
              key={category.id}
              className={`menu-fade${catIdx > 0 ? "mt-16" : ""}`}
              style={{ animationDelay: `${catIdx * 0.1 + 0.15}s` }}
            >
              {/* Category heading with marker-highlight treatment */}
              <div className="mb-7">
                <h2
                  style={{
                    fontFamily: "var(--font-sans)",
                    background: "linear-gradient(transparent 42%, rgba(197, 227, 50, 0.75) 42%)",
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
                <div className="bg-page-ink mt-3 h-[2px]" />
              </div>

              {/* Items */}
              <ul className="space-y-7">
                {category.items.map((item) => (
                  <li key={item.id} className="menu-item flex items-start justify-between gap-6">
                    <div className="min-w-0 flex-1">
                      <div
                        className="text-page-ink text-xl leading-snug font-bold"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        {item.name}
                      </div>
                      {item.description && (
                        <p
                          className="text-muted mt-1 text-sm leading-relaxed"
                          style={{ fontFamily: "var(--font-sans)" }}
                        >
                          {item.description}
                        </p>
                      )}
                    </div>
                    <span
                      className="text-punch mt-0.5 shrink-0 text-base font-extrabold whitespace-nowrap tabular-nums"
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
            <div className="bg-page-ink h-[2px] flex-1" />
            <div className="bg-punch h-3 w-3 rotate-45" />
            <div className="bg-page-ink h-[2px] flex-1" />
          </div>
        </main>
      </div>
    </div>
  );
}
