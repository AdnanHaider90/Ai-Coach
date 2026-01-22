type Props = { coach: string };

const colors: Record<string, string> = {
  LIFE: "bg-emerald-100 text-emerald-800",
  CAREER: "bg-blue-100 text-blue-800",
  FINANCE: "bg-amber-100 text-amber-800"
};

export function CoachBadge({ coach }: Props) {
  const color = colors[coach] ?? "bg-slate-100 text-slate-800";
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${color}`}>
      {coach}
    </span>
  );
}
