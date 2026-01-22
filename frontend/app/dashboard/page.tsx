"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { createSession, fetchSessions } from "@/lib/api";

type Session = {
  id: string;
  coachType: string;
  createdAt: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, []);

  async function loadSessions() {
    try {
      const { data } = await supabase.auth.getSession();
      let token = data.session?.access_token;

      if (!token) {
        console.warn("No Supabase session found. Falling back to debug_token for testing.");
        token = "debug_token";
      }

      const sessions = await fetchSessions(`Bearer ${token}`);
      setSessions(sessions);
    } catch (err) {
      console.error("Failed to load sessions:", err);
      // Optional: set an error state to show UI feedback
    } finally {
      setInitialLoading(false);
    }
  }


  async function handleNewSession() {
    setLoading(true);
    try {
      const { data } = await supabase.auth.getSession();
      let token = data.session?.access_token;
      if (!token) {
        console.warn("No Supabase session found. Using debug_token.");
        token = "debug_token";
      }

      const session = await createSession(
        `Bearer ${token}`,
        "LIFE" // or CAREER / FITNESS etc
      );

      setSessions((prev) => [session, ...prev]);
    } catch (err) {
      console.error(err);
      alert("Failed to create session. Check backend.");
    } finally {
      setLoading(false);
    }
  }


  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Your Coaching Sessions</h1>
        <button
          onClick={handleNewSession}
          className="btn-primary"
          disabled={loading}
        >
          {loading ? "Creating..." : "New Session"}
        </button>
      </div>

      {initialLoading ? (
        <p className="text-slate-500">Loading sessions...</p>
      ) : sessions.length === 0 ? (
        <p className="text-slate-500">No sessions yet.</p>
      ) : (
        <ul className="space-y-3">
          {sessions.map((s) => (
            <li
              key={s.id}
              className="border rounded-lg p-4 hover:bg-slate-50 cursor-pointer"
              onClick={() => router.push(`/chat/${s.id}?coach=${s.coachType}`)}
            >
              <div className="font-medium">{s.coachType} Coach</div>
              <div className="text-sm text-slate-500">
                {new Date(s.createdAt).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
