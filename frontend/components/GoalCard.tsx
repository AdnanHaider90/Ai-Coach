import { CoachBadge } from "./CoachBadge";

type Props = {
  title: string;
  description?: string | null;
  dueDate?: string | null;
  progress?: number | null;
  coach?: string;
};

export function GoalCard({ title, description, dueDate, progress, coach }: Props) {
  return (
    <div className="card p-4 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-slate-900">{title}</p>
          {description ? (
            <p className="text-sm text-slate-600">{description}</p>
          ) : null}
        </div>
        {coach ? <CoachBadge coach={coach} /> : null}
      </div>
      <div className="flex items-center gap-2 text-sm text-slate-600">
        {dueDate ? <span>Due: {dueDate}</span> : <span>No due date</span>}
        <span>•</span>
        <span>Progress: {progress ?? 0}%</span>
      </div>
      <div className="w-full h-2 bg-slate-100 rounded-full">
        <div
          className="h-2 bg-primary rounded-full transition-all"
          style={{ width: `${progress ?? 0}%` }}
        />
      </div>
    </div>
  );
}
