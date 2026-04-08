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
    <div className="min-h-screen bg-amber-50">
      {/* Header */}
      <div className="bg-amber-900 text-white py-10 px-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight">{m.name}</h1>
        {m.description && (
          <p className="mt-2 text-amber-200 text-lg max-w-xl mx-auto">
            {m.description}
          </p>
        )}
      </div>

      {/* Menu content */}
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-10">
        {m.categories.length === 0 && (
          <p className="text-center text-gray-500">This menu has no items yet.</p>
        )}
        {m.categories.map((category) => (
          <section key={category.id}>
            <h2 className="text-2xl font-semibold text-amber-900 border-b-2 border-amber-200 pb-2 mb-4">
              {category.name}
            </h2>
            <ul className="space-y-4">
              {category.items.map((item) => (
                <li
                  key={item.id}
                  className="flex justify-between gap-4 items-start"
                >
                  <div>
                    <p className="font-medium text-gray-900">{item.name}</p>
                    {item.description && (
                      <p className="text-sm text-gray-500 mt-0.5">
                        {item.description}
                      </p>
                    )}
                  </div>
                  <span className="font-semibold text-amber-900 whitespace-nowrap">
                    {formatPrice(item.price.toString())}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
