const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";

// ✅ GET sessions
export const fetchSessions = async (token: string) => {
  const res = await fetch(`${API_BASE}/sessions`, {
    headers: {
      Authorization: token,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to load sessions");
  }

  return res.json();
};

// ✅ CREATE session
export const createSession = async (
  token: string,
  coachType: string
) => {
  const res = await fetch(`${API_BASE}/sessions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: JSON.stringify({ coachType }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to create session");
  }

  return res.json();
};

// ✅ POST chat message
export const postChat = async (
  token: string,
  payload: {
    sessionId: string;
    message: string;
  }
) => {
  const res = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to send chat message");
  }

  return res.json();
};
// ✅ GET messages
export const fetchMessages = async (token: string, sessionId: string) => {
  const res = await fetch(`${API_BASE}/messages?sessionId=${sessionId}`, {
    headers: {
      Authorization: token,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to load messages");
  }

  return res.json();
};
