"use client";

import { Todo } from "@/types/todo";
import CategoryBadge from "./CategoryBadge";
import { Check, Pencil, Trash2, Calendar } from "lucide-react";

interface Props {
  todo: Todo;
  onToggle: (id: string) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
}

const PRIORITY_STYLES: Record<string, { label: string; color: string }> = {
  high: { label: "높음", color: "text-red-500" },
  medium: { label: "보통", color: "text-amber-500" },
  low: { label: "낮음", color: "text-green-500" },
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
  }).format(date);
}

function isOverdue(dateStr: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dateStr);
  return due < today;
}

export default function TodoItem({ todo, onToggle, onEdit, onDelete }: Props) {
  const priority = PRIORITY_STYLES[todo.priority];
  const overdue = todo.dueDate && !todo.completed && isOverdue(todo.dueDate);

  return (
    <div
      className={`group rounded-xl border bg-white p-4 transition-all hover:shadow-md ${
        todo.completed
          ? "border-slate-100 opacity-60"
          : "border-slate-200"
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={() => onToggle(todo.id)}
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
            todo.completed
              ? "border-emerald-500 bg-emerald-500 text-white"
              : "border-slate-300 hover:border-slate-400"
          }`}
        >
          {todo.completed && <Check className="h-3 w-3" />}
        </button>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3
              className={`font-medium ${
                todo.completed
                  ? "text-slate-400 line-through"
                  : "text-slate-900"
              }`}
            >
              {todo.title}
            </h3>
            <CategoryBadge category={todo.category} />
            <span className={`text-xs font-medium ${priority.color}`}>
              {priority.label}
            </span>
          </div>

          {todo.description && (
            <p className="mt-1 truncate text-sm text-slate-500">
              {todo.description}
            </p>
          )}

          {todo.dueDate && (
            <div
              className={`mt-1.5 flex items-center gap-1 text-xs ${
                overdue ? "text-red-500" : "text-slate-400"
              }`}
            >
              <Calendar className="h-3 w-3" />
              <span>
                {formatDate(todo.dueDate)}
                {overdue && " (기한 초과)"}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={() => onEdit(todo)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(todo.id)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
