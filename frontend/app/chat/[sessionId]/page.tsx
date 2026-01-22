"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ChatBubble } from "@/components/ChatBubble";
import { LoadingDots } from "@/components/LoadingDots";
import { fetchMessages, postChat } from "@/lib/api";
import { supabase } from "@/lib/supabase";

type Message = { role: "user" | "assistant"; content: string };

export default function ChatPage() {
  const params = useParams();
  const search = useSearchParams();
  const sessionId = params.sessionId as string;
  const coach = (search.get("coach") ?? "LIFE").toUpperCase();
  const router = useRouter();

  const [userId, setUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm your AI coach. What would you like to focus on today? Give me a bit of context so I can give you a 3-step plan."
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        console.warn("No user found in chat page. Falling back to debug mode.");
        setUserId("00000000-0000-0000-0000-000000000001");
        loadMessages("debug_token");
      } else {
        setUserId(data.user.id);
        supabase.auth.getSession().then(({ data: sessionData }) => {
          loadMessages(sessionData.session?.access_token || "debug_token");
        });
      }
    });
  }, [sessionId]);

  const loadMessages = async (token: string) => {
    try {
      const history = await fetchMessages(`Bearer ${token}`, sessionId);
      if (history && history.length > 0) {
        setMessages(history.map((m: any) => ({ role: m.role, content: m.content })));
      }
    } catch (err) {
      console.error("Failed to load messages:", err);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMessage: Message = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token ?? "debug_token";

      const res = await postChat(`Bearer ${token}`, {
        sessionId,
        message: userMessage.content,
      });
      const aiMessage: Message = { role: "assistant", content: res.response };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Something went wrong. Please try again." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const coachLabel = useMemo(
    () => ({
      LIFE: "Life Coach",
      CAREER: "Career Coach",
      FINANCE: "Finance Coach"
    }[coach] ?? "Coach"),
    [coach]
  );

  return (
    <div className="h-[80vh] flex flex-col gap-4 card p-4">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">Session {sessionId.slice(0, 8)}</p>
          <p className="font-semibold text-slate-900">{coachLabel}</p>
          {coach === "FINANCE" ? (
            <p className="text-xs text-amber-600">
              I am not a licensed financial advisor.
            </p>
          ) : null}
        </div>
        <button className="btn-ghost" onClick={() => router.push("/dashboard")}>
          Back to dashboard
        </button>
      </header>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {messages.map((m, idx) => (
          <ChatBubble key={idx} role={m.role} content={m.content} />
        ))}
        {loading ? (
          <div className="flex justify-start pl-1">
            <LoadingDots />
          </div>
        ) : null}
      </div>

      <div className="border rounded-xl p-3 bg-slate-50 space-y-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tell your coach what you need help with..."
          rows={3}
          className="w-full rounded-lg border px-3 py-2"
        />
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Coach will ask clarifying questions before sharing a 3-step plan.
          </p>
          <button className="btn-primary" onClick={sendMessage} disabled={loading}>
            {loading ? "Thinking..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
