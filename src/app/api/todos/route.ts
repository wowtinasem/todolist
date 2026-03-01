import { NextRequest, NextResponse } from "next/server";
import { readTodos, writeTodos } from "@/lib/storage";
import { Todo } from "@/types/todo";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const data = await readTodos();
  const searchParams = request.nextUrl.searchParams;

  let filtered = data.todos;

  const status = searchParams.get("status");
  if (status === "active") filtered = filtered.filter((t) => !t.completed);
  if (status === "completed") filtered = filtered.filter((t) => t.completed);

  const category = searchParams.get("category");
  if (category) filtered = filtered.filter((t) => t.category === category);

  const priority = searchParams.get("priority");
  if (priority) filtered = filtered.filter((t) => t.priority === priority);

  const search = searchParams.get("search");
  if (search) {
    const lower = search.toLowerCase();
    filtered = filtered.filter(
      (t) =>
        t.title.toLowerCase().includes(lower) ||
        t.description.toLowerCase().includes(lower)
    );
  }

  const priorityOrder: Record<string, number> = {
    high: 0,
    medium: 1,
    low: 2,
  };
  filtered.sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    if (a.priority !== b.priority)
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    return b.createdAt.localeCompare(a.createdAt);
  });

  return NextResponse.json({ todos: filtered, categories: data.categories });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const data = await readTodos();

  const newTodo: Todo = {
    id: crypto.randomUUID(),
    title: body.title,
    description: body.description || "",
    category: body.category || "기타",
    priority: body.priority || "medium",
    dueDate: body.dueDate || null,
    completed: false,
    createdAt: new Date().toISOString(),
  };

  data.todos.push(newTodo);

  if (body.category && !data.categories.includes(body.category)) {
    data.categories.push(body.category);
  }

  await writeTodos(data);
  return NextResponse.json(newTodo, { status: 201 });
}
