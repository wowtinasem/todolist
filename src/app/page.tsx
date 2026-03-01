"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Todo, FilterStatus } from "@/types/todo";
import { useAuth } from "@/contexts/AuthContext";
import {
  fetchTodos,
  createTodo,
  updateTodo,
  deleteTodo,
  toggleTodo,
} from "@/lib/api";
import LoginPage from "@/components/LoginPage";
import UserMenu from "@/components/UserMenu";
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
  const { user, loading: authLoading } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await fetchTodos(user.email);
      setTodos(data.todos);
      setCategories(data.categories);
    } catch (err) {
      console.error("Failed to load todos:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, loadData]);

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

  const handleAdd = async (data: Partial<Todo>) => {
    if (!user) return;
    try {
      const newTodo = await createTodo(user.email, {
        title: data.title || "",
        description: data.description || "",
        category: data.category || "기타",
        priority: data.priority || "medium",
        dueDate: data.dueDate || null,
      });
      setTodos((prev) => [...prev, newTodo]);
      if (newTodo.category && !categories.includes(newTodo.category)) {
        setCategories((prev) => [...prev, newTodo.category]);
      }
      setIsFormOpen(false);
    } catch (err) {
      console.error("Failed to create todo:", err);
    }
  };

  const handleUpdate = async (data: Partial<Todo>) => {
    if (!user || !editingTodo) return;
    try {
      const updated = await updateTodo(user.email, editingTodo.id, data);
      setTodos((prev) =>
        prev.map((t) => (t.id === editingTodo.id ? updated : t))
      );
      if (updated.category && !categories.includes(updated.category)) {
        setCategories((prev) => [...prev, updated.category]);
      }
      setEditingTodo(null);
      setIsFormOpen(false);
    } catch (err) {
      console.error("Failed to update todo:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    const prev = todos;
    setTodos((t) => t.filter((item) => item.id !== id));
    try {
      await deleteTodo(user.email, id);
    } catch (err) {
      console.error("Failed to delete todo:", err);
      setTodos(prev);
    }
  };

  const handleToggle = async (id: string) => {
    if (!user) return;
    const prev = todos;
    setTodos((t) =>
      t.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
    try {
      await toggleTodo(user.email, id);
    } catch (err) {
      console.error("Failed to toggle todo:", err);
      setTodos(prev);
    }
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

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <h1 className="text-xl font-bold text-slate-900">할 일 관리</h1>
          <div className="flex items-center gap-3">
            <UserMenu />
            <button
              onClick={openAddForm}
              className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" />
              추가
            </button>
          </div>
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
