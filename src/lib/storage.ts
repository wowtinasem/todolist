import { promises as fs } from "fs";
import path from "path";
import { TodosData, DEFAULT_CATEGORIES } from "@/types/todo";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "todos.json");

const defaultData: TodosData = {
  todos: [],
  categories: [...DEFAULT_CATEGORIES],
};

export async function readTodos(): Promise<TodosData> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(raw) as TodosData;
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(defaultData, null, 2));
    return { ...defaultData, todos: [], categories: [...DEFAULT_CATEGORIES] };
  }
}

export async function writeTodos(data: TodosData): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}
