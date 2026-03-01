import { Todo, TodosData, DEFAULT_CATEGORIES } from "@/types/todo";

const APPS_SCRIPT_URL = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL!;

async function postToAppsScript(
  payload: Record<string, unknown>
): Promise<unknown> {
  const res = await fetch(APPS_SCRIPT_URL, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function fetchTodos(userEmail: string): Promise<TodosData> {
  try {
    const url = `${APPS_SCRIPT_URL}?action=getTodos&email=${encodeURIComponent(userEmail)}`;
    const res = await fetch(url);
    const data = await res.json();
    return {
      todos: data.todos || [],
      categories: data.categories?.length
        ? data.categories
        : [...DEFAULT_CATEGORIES],
    };
  } catch {
    return { todos: [], categories: [...DEFAULT_CATEGORIES] };
  }
}

export async function createTodo(
  userEmail: string,
  todo: Omit<Todo, "id" | "createdAt" | "completed">
): Promise<Todo> {
  const result = await postToAppsScript({
    action: "create",
    email: userEmail,
    todo: {
      ...todo,
      id: crypto.randomUUID(),
      completed: false,
      createdAt: new Date().toISOString(),
    },
  });
  return result as Todo;
}

export async function updateTodo(
  userEmail: string,
  id: string,
  updates: Partial<Todo>
): Promise<Todo> {
  const result = await postToAppsScript({
    action: "update",
    email: userEmail,
    id,
    updates,
  });
  return result as Todo;
}

export async function deleteTodo(
  userEmail: string,
  id: string
): Promise<void> {
  await postToAppsScript({
    action: "delete",
    email: userEmail,
    id,
  });
}

export async function toggleTodo(
  userEmail: string,
  id: string
): Promise<Todo> {
  const result = await postToAppsScript({
    action: "toggle",
    email: userEmail,
    id,
  });
  return result as Todo;
}
