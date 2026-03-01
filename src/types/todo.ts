export type Priority = "high" | "medium" | "low";

export interface Todo {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: Priority;
  dueDate: string | null;
  completed: boolean;
  createdAt: string;
}

export interface TodosData {
  todos: Todo[];
  categories: string[];
}

export const DEFAULT_CATEGORIES = ["업무", "개인", "공부", "건강", "기타"];

export type FilterStatus = "all" | "active" | "completed";
