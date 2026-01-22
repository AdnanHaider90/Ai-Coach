"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      router.push("/dashboard");
    }
  };

  const handleSignup = async () => {
    setError(null);
    setLoading(true);
  
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
  
    setLoading(false);
  
    if (error) {
      setError(error.message);
    } else {
      alert("Account created! Please check your email to verify.");
    }
  };
  

  return (
    <div className="max-w-md mx-auto card p-6 space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900">Welcome back</h1>
      <form className="space-y-3" onSubmit={handleLogin}>
        <div className="space-y-1">
          <label className="text-sm text-slate-600">Email</label>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm text-slate-600">Password</label>
          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? "Loading..." : "Sign in"}
        </button>
        <button
          type="button"
          className="btn-ghost w-full"
          onClick={handleSignup}
        >
          Create an account
        </button>

      </form>
      <p className="text-sm text-slate-600">
        New here?{" "}
      </p>
    </div>
  );
}
