import { NextRequest, NextResponse } from "next/server";
import { readTodos, writeTodos } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const data = await readTodos();
  const todo = data.todos.find((t) => t.id === id);
  if (!todo)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(todo);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const data = await readTodos();
  const index = data.todos.findIndex((t) => t.id === id);
  if (index === -1)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  data.todos[index] = { ...data.todos[index], ...body };

  if (body.category && !data.categories.includes(body.category)) {
    data.categories.push(body.category);
  }

  await writeTodos(data);
  return NextResponse.json(data.todos[index]);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const data = await readTodos();
  const index = data.todos.findIndex((t) => t.id === id);
  if (index === -1)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  data.todos.splice(index, 1);
  await writeTodos(data);
  return NextResponse.json({ success: true });
}
