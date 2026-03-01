"use client";

import { Todo } from "@/types/todo";
import TodoItem from "./TodoItem";
import { ListTodo } from "lucide-react";

interface Props {
  todos: Todo[];
  loading: boolean;
  onToggle: (id: string) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
}

export default function TodoList({
  todos,
  loading,
  onToggle,
  onEdit,
  onDelete,
}: Props) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
      </div>
    );
  }

  if (todos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <ListTodo className="mb-3 h-12 w-12" />
        <p className="text-lg font-medium">할 일이 없습니다</p>
        <p className="mt-1 text-sm">새로운 할 일을 추가해보세요</p>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-3 text-xs text-slate-400">총 {todos.length}개</p>
      <div className="space-y-2">
        {todos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggle={onToggle}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}
