import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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
  if (!menu) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(menu);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { name, description, categories } = body;

  if (!name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const existing = await prisma.menu.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let slug = existing.slug;
  if (name.trim() !== existing.name) {
    slug = slugify(name.trim());
    const conflict = await prisma.menu.findFirst({
      where: { slug, id: { not: id } },
    });
    if (conflict) slug = `${slug}-${Date.now()}`;
  }

  // Delete all categories and recreate (simplest approach for full save)
  await prisma.category.deleteMany({ where: { menuId: id } });

  const menu = await prisma.menu.update({
    where: { id },
    data: {
      name: name.trim(),
      slug,
      description: description?.trim() || null,
      categories: {
        create: (categories ?? []).map(
          (cat: { name: string; items: { name: string; description?: string; price: number }[] }, catIdx: number) => ({
            name: cat.name,
            order: catIdx,
            items: {
              create: (cat.items ?? []).map(
                (item: { name: string; description?: string; price: number }, itemIdx: number) => ({
                  name: item.name,
                  description: item.description || null,
                  price: item.price,
                  order: itemIdx,
                })
              ),
            },
          })
        ),
      },
    },
    include: {
      categories: {
        orderBy: { order: "asc" },
        include: { items: { orderBy: { order: "asc" } } },
      },
    },
  });

  return NextResponse.json(menu);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.menu.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
