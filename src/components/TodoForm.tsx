"use client";

import { useState, useEffect } from "react";
import { Todo, Priority, DEFAULT_CATEGORIES } from "@/types/todo";
import { X } from "lucide-react";

interface Props {
  todo?: Todo | null;
  categories: string[];
  onSubmit: (data: Partial<Todo>) => void;
  onClose: () => void;
}

export default function TodoForm({ todo, categories, onSubmit, onClose }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(DEFAULT_CATEGORIES[0]);
  const [priority, setPriority] = useState<Priority>("medium");
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    if (todo) {
      setTitle(todo.title);
      setDescription(todo.description);
      setCategory(todo.category);
      setPriority(todo.priority);
      setDueDate(todo.dueDate || "");
    }
  }, [todo]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      category,
      priority,
      dueDate: dueDate || null,
    });
  };

  const priorityOptions: { value: Priority; label: string; color: string }[] = [
    { value: "high", label: "높음", color: "border-red-300 bg-red-50 text-red-700" },
    { value: "medium", label: "보통", color: "border-amber-300 bg-amber-50 text-amber-700" },
    { value: "low", label: "낮음", color: "border-green-300 bg-green-50 text-green-700" },
  ];

  const allCategories =
    categories.length > 0 ? categories : DEFAULT_CATEGORIES;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            {todo ? "할 일 수정" : "새 할 일"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              제목 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="할 일을 입력하세요"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition-colors focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              설명
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="상세 설명 (선택)"
              rows={3}
              className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition-colors focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
            />
          </div>

          {/* Category */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              카테고리
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition-colors focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
            >
              {allCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              우선순위
            </label>
            <div className="flex gap-2">
              {priorityOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setPriority(opt.value)}
                  className={`flex-1 rounded-lg border py-1.5 text-sm font-medium transition-colors ${
                    priority === opt.value
                      ? opt.color
                      : "border-slate-200 text-slate-400 hover:border-slate-300"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              마감일
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition-colors focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-1 rounded-lg bg-slate-900 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800"
            >
              {todo ? "수정" : "추가"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
