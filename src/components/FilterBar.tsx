"use client";

import { FilterStatus } from "@/types/todo";

interface Props {
  statusFilter: FilterStatus;
  onStatusChange: (v: FilterStatus) => void;
  categoryFilter: string;
  onCategoryChange: (v: string) => void;
  priorityFilter: string;
  onPriorityChange: (v: string) => void;
  categories: string[];
}

const STATUS_OPTIONS: { value: FilterStatus; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "active", label: "진행중" },
  { value: "completed", label: "완료" },
];

const PRIORITY_OPTIONS: { value: string; label: string; color: string }[] = [
  { value: "all", label: "전체", color: "" },
  { value: "high", label: "높음", color: "text-red-500" },
  { value: "medium", label: "보통", color: "text-amber-500" },
  { value: "low", label: "낮음", color: "text-green-500" },
];

export default function FilterBar({
  statusFilter,
  onStatusChange,
  categoryFilter,
  onCategoryChange,
  priorityFilter,
  onPriorityChange,
  categories,
}: Props) {
  return (
    <div className="space-y-3">
      {/* Status filter */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-slate-500 w-14 shrink-0">
          상태
        </span>
        <div className="flex gap-1">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onStatusChange(opt.value)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                statusFilter === opt.value
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Category filter */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-slate-500 w-14 shrink-0">
          카테고리
        </span>
        <div className="flex gap-1 overflow-x-auto">
          <button
            onClick={() => onCategoryChange("")}
            className={`rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap transition-colors ${
              categoryFilter === ""
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            전체
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={`rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap transition-colors ${
                categoryFilter === cat
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Priority filter */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-slate-500 w-14 shrink-0">
          우선순위
        </span>
        <div className="flex gap-1">
          {PRIORITY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onPriorityChange(opt.value === "all" ? "" : opt.value)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                (opt.value === "all" && priorityFilter === "") ||
                priorityFilter === opt.value
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
