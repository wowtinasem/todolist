import { TodosData, DEFAULT_CATEGORIES } from "@/types/todo";

const STORAGE_KEY = "todolist-data";

const defaultData: TodosData = {
  todos: [],
  categories: [...DEFAULT_CATEGORIES],
};

export function readTodos(): TodosData {
  if (typeof window === "undefined") return { ...defaultData };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultData, todos: [], categories: [...DEFAULT_CATEGORIES] };
    return JSON.parse(raw) as TodosData;
  } catch {
    return { ...defaultData, todos: [], categories: [...DEFAULT_CATEGORIES] };
  }
}

export function writeTodos(data: TodosData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
