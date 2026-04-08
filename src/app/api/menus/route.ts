import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export async function GET() {
  const menus = await prisma.menu.findMany({
    orderBy: { createdAt: "desc" },
    include: { categories: { include: { items: true } } },
  });
  return NextResponse.json(menus);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { name, description } = body;

  if (!name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  let slug = slugify(name);
  const existing = await prisma.menu.findUnique({ where: { slug } });
  if (existing) {
    slug = `${slug}-${Date.now()}`;
  }

  const menu = await prisma.menu.create({
    data: { name: name.trim(), slug, description: description?.trim() || null },
  });

  return NextResponse.json(menu, { status: 201 });
}
