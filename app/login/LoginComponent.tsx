"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { Mail, Lock } from "lucide-react";

export default function LoginComponent() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const search = useSearchParams();
  const verified = search?.get("verified");

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      toast.error(data.error || "Login failed.");
    } else {
      toast.success("Login successful!");
      localStorage.setItem("token", data.token);
      router.push("/dashboard");
    }
  }

  return (
    <div className="w-full max-w-md mx-auto mt-16 bg-white shadow-lg rounded-xl p-8">
      <h2 className="text-3xl font-bold mb-6 text-center text-blue-600">Login</h2>

      {verified && (
        <p className="text-green-600 text-center mb-2">
          Telegram verified! Please login.
        </p>
      )}

      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            required
            type="email"
            placeholder="Email"
            className="input pl-10"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            required
            type="password"
            placeholder="Password"
            className="input pl-10"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          />
        </div>

        <button
          type="submit"
          className={`btn btn-primary w-full ${loading ? "opacity-50" : ""}`}
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}