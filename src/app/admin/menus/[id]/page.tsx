import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import MenuEditor from "@/components/MenuEditor";

export default async function EditMenuPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const menu = await prisma.menu.findUnique({
    where: { id },
    include: {
      categories: {
        orderBy: { order: "asc" },
        include: { items: { orderBy: { order: "asc" } } },
      },
    },
  });

  if (!menu) notFound();
  const m = menu!;

  const initial = {
    id: m.id,
    name: m.name,
    slug: m.slug,
    description: m.description ?? "",
    categories: m.categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      items: cat.items.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description ?? "",
        price: String(item.price),
      })),
    })),
  };

  return <MenuEditor mode="edit" initial={initial} />;
}
