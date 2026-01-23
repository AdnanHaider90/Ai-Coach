"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { GoalCard } from "@/components/GoalCard";
import { useRouter } from "next/navigation";

type GoalInput = {
  title: string;
  description?: string;
  dueDate?: string;
};

export default function GoalsPage() {
  const router = useRouter();
  const [goals, setGoals] = useState<any[]>([]);
  const [form, setForm] = useState<GoalInput>({
    title: "",
    description: "",
    dueDate: ""
  });
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        router.push("/login");
      } else {
        setUserId(data.user.id);
        const { data: goalRows } = await supabase
          .from("Goal")
          .select("*")
          .eq("userId", data.user.id)
          .order("dueDate", { ascending: true });
        setGoals(goalRows ?? []);
      }
    });
  }, []);

  const submitGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    await supabase.from("Goal").insert({
      userId,
      title: form.title,
      description: form.description,
      dueDate: form.dueDate
    });
    setForm({ title: "", description: "", dueDate: "" });
    const { data: updated } = await supabase
      .from("Goal")
      .select("*")
      .eq("userId", userId)
      .order("dueDate", { ascending: true });
    setGoals(updated ?? []);
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-600">Goals</p>
          <h1 className="text-2xl font-semibold text-slate-900">Track progress</h1>
        </div>
        <button className="btn-ghost" onClick={() => router.push("/dashboard")}>
          Back to dashboard
        </button>
      </header>

      <form onSubmit={submitGoal} className="card p-4 grid md:grid-cols-3 gap-3">
        <div className="space-y-1 md:col-span-1">
          <label className="text-sm text-slate-600">Goal title</label>
          <input
            required
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>
        <div className="space-y-1 md:col-span-1">
          <label className="text-sm text-slate-600">Description</label>
          <input
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm text-slate-600">Due date</label>
          <input
            type="date"
            value={form.dueDate}
            onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>
        <div className="md:col-span-3 flex justify-end">
          <button className="btn-primary" type="submit">
            Add goal
          </button>
        </div>
      </form>

      <div className="grid md:grid-cols-2 gap-4">
        {goals.map((goal) => (
          <GoalCard
            key={goal.id}
            title={goal.title}
            description={goal.description}
            dueDate={goal.dueDate}
            progress={goal.progress}
          />
        ))}
        {goals.length === 0 ? (
          <p className="text-sm text-slate-500">No goals yet. Add your first one.</p>
        ) : null}
      </div>
    </div>
  );
}
