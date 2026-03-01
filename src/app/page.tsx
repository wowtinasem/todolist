"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Todo, FilterStatus } from "@/types/todo";
import SearchBar from "@/components/SearchBar";
import FilterBar from "@/components/FilterBar";
import TodoList from "@/components/TodoList";
import TodoForm from "@/components/TodoForm";
import { Plus } from "lucide-react";

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
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const fetchTodos = useCallback(async () => {
    const params = new URLSearchParams();
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (categoryFilter) params.set("category", categoryFilter);
    if (priorityFilter) params.set("priority", priorityFilter);
    if (search) params.set("search", search);

    const res = await fetch(`/api/todos?${params.toString()}`);
    const data = await res.json();
    setTodos(data.todos);
    setCategories(data.categories);
    setLoading(false);
  }, [statusFilter, categoryFilter, priorityFilter, search]);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearch(value);
    }, 300);
  };

  const handleAdd = async (data: Partial<Todo>) => {
    await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setIsFormOpen(false);
    fetchTodos();
  };

  const handleUpdate = async (data: Partial<Todo>) => {
    if (!editingTodo) return;
    await fetch(`/api/todos/${editingTodo.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setEditingTodo(null);
    setIsFormOpen(false);
    fetchTodos();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/todos/${id}`, { method: "DELETE" });
    fetchTodos();
  };

  const handleToggle = async (id: string) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;
    await fetch(`/api/todos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !todo.completed }),
    });
    fetchTodos();
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
          <SearchBar value={search} onChange={handleSearchChange} />

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
            todos={todos}
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
