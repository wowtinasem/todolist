"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Todo, FilterStatus } from "@/types/todo";
import { readTodos, writeTodos } from "@/lib/storage";
import SearchBar from "@/components/SearchBar";
import FilterBar from "@/components/FilterBar";
import TodoList from "@/components/TodoList";
import TodoForm from "@/components/TodoForm";
import { Plus } from "lucide-react";

const PRIORITY_ORDER: Record<string, number> = { high: 0, medium: 1, low: 2 };

function sortTodos(todos: Todo[]): Todo[] {
  return [...todos].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    const pa = PRIORITY_ORDER[a.priority] ?? 1;
    const pb = PRIORITY_ORDER[b.priority] ?? 1;
    if (pa !== pb) return pa - pb;
    if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    return b.createdAt.localeCompare(a.createdAt);
  });
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(() => {
    const data = readTodos();
    setTodos(data.todos);
    setCategories(data.categories);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredTodos = useMemo(() => {
    let result = todos;

    if (statusFilter === "active") {
      result = result.filter((t) => !t.completed);
    } else if (statusFilter === "completed") {
      result = result.filter((t) => t.completed);
    }

    if (categoryFilter) {
      result = result.filter((t) => t.category === categoryFilter);
    }

    if (priorityFilter) {
      result = result.filter((t) => t.priority === priorityFilter);
    }

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q)
      );
    }

    return sortTodos(result);
  }, [todos, statusFilter, categoryFilter, priorityFilter, search]);

  const saveData = useCallback(
    (newTodos: Todo[], newCategories?: string[]) => {
      const cats = newCategories ?? categories;
      writeTodos({ todos: newTodos, categories: cats });
      setTodos(newTodos);
      if (newCategories) setCategories(newCategories);
    },
    [categories]
  );

  const handleAdd = (data: Partial<Todo>) => {
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      title: data.title || "",
      description: data.description || "",
      category: data.category || "기타",
      priority: data.priority || "medium",
      dueDate: data.dueDate || null,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    const newTodos = [...todos, newTodo];

    // Add new category if it doesn't exist
    let newCategories: string[] | undefined;
    if (newTodo.category && !categories.includes(newTodo.category)) {
      newCategories = [...categories, newTodo.category];
    }

    saveData(newTodos, newCategories);
    setIsFormOpen(false);
  };

  const handleUpdate = (data: Partial<Todo>) => {
    if (!editingTodo) return;
    const newTodos = todos.map((t) =>
      t.id === editingTodo.id ? { ...t, ...data } : t
    );

    let newCategories: string[] | undefined;
    if (data.category && !categories.includes(data.category)) {
      newCategories = [...categories, data.category];
    }

    saveData(newTodos, newCategories);
    setEditingTodo(null);
    setIsFormOpen(false);
  };

  const handleDelete = (id: string) => {
    const newTodos = todos.filter((t) => t.id !== id);
    saveData(newTodos);
  };

  const handleToggle = (id: string) => {
    const newTodos = todos.map((t) =>
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    saveData(newTodos);
  };

  const openEditForm = (todo: Todo) => {
    setEditingTodo(todo);
    setIsFormOpen(true);
  };

  const openAddForm = () => {
    setEditingTodo(null);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingTodo(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <h1 className="text-xl font-bold text-slate-900">할 일 관리</h1>
          <button
            onClick={openAddForm}
            className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
          >
            <Plus className="h-4 w-4" />
            추가
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-3xl px-4 py-6">
        <div className="space-y-5">
          <SearchBar value={search} onChange={setSearch} />

          <FilterBar
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            categoryFilter={categoryFilter}
            onCategoryChange={setCategoryFilter}
            priorityFilter={priorityFilter}
            onPriorityChange={setPriorityFilter}
            categories={categories}
          />

          <TodoList
            todos={filteredTodos}
            loading={loading}
            onToggle={handleToggle}
            onEdit={openEditForm}
            onDelete={handleDelete}
          />
        </div>
      </main>

      {/* Modal */}
      {isFormOpen && (
        <TodoForm
          todo={editingTodo}
          categories={categories}
          onSubmit={editingTodo ? handleUpdate : handleAdd}
          onClose={closeForm}
        />
      )}
    </div>
  );
}
