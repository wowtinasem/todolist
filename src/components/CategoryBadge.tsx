const CATEGORY_COLORS: Record<string, string> = {
  업무: "bg-blue-100 text-blue-700",
  개인: "bg-purple-100 text-purple-700",
  공부: "bg-emerald-100 text-emerald-700",
  건강: "bg-rose-100 text-rose-700",
  기타: "bg-slate-100 text-slate-700",
};

interface Props {
  category: string;
}

export default function CategoryBadge({ category }: Props) {
  const colors = CATEGORY_COLORS[category] || "bg-slate-100 text-slate-700";

  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${colors}`}
    >
      {category}
    </span>
  );
}
