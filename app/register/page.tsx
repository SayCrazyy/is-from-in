"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  UserPlus,
  ShieldCheck,
  Loader,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

export default function Register() {
  const [form, setForm] = useState({ email: "", password: "", telegram: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);
  const [code, setCode] = useState("");
  const router = useRouter();

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Registration failed");
      toast.error(data.error || "Registration failed", {
        icon: <AlertCircle className="text-red-500" />,
      });
    } else {
      setCode(data.code);
      setStep(2);
      toast.success("Registered! Check your Telegram to verify.", {
        icon: <CheckCircle className="text-green-500" />,
      });
    }
  }

  async function handleCheckVerification(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/verify-telegram", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.email, code }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Verification failed");
      toast.error(data.error || "Verification failed", {
        icon: <AlertCircle className="text-red-500" />,
      });
    } else {
      toast.success("Telegram verified! You can now login.", {
        icon: <ShieldCheck className="text-green-500" />,
      });
      router.push("/login?verified=1");
    }
  }

  return (
    <div className="w-full max-w-md mx-auto mt-16 bg-white shadow-lg rounded-xl p-8">
      <h2 className="text-3xl font-bold mb-6 text-center text-blue-600 flex items-center justify-center gap-2">
        <UserPlus size={28} />
        Register
      </h2>

      {step === 1 && (
        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <input
            required
            type="email"
            placeholder="Email"
            className="input"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          />
          <input
            required
            type="password"
            placeholder="Password"
            className="input"
            value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
          />
          <input
            required
            type="text"
            placeholder="Telegram Username (without @)"
            className="input"
            value={form.telegram}
            onChange={e => setForm(f => ({ ...f, telegram: e.target.value }))}
          />
          <button
            type="submit"
            className="btn btn-primary w-full flex justify-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader className="animate-spin" size={18} />
                Sending...
              </>
            ) : (
              "Register"
            )}
          </button>
          {error && (
            <div className="text-red-600 text-sm flex items-center gap-1">
              <AlertCircle size={16} /> {error}
            </div>
          )}
        </form>
      )}

      {step === 2 && (
        <form
          onSubmit={handleCheckVerification}
          className="flex flex-col gap-4 text-sm text-gray-700 text-center"
        >
          <p>
            <b>Your Telegram verification code:</b>
          </p>
          <p className="text-lg font-mono text-blue-600">{code}</p>
          <p>
            Message <b>@isfromin_bot</b> on Telegram and send:
            <br />
            <span className="font-mono bg-gray-100 p-1 rounded inline-block mt-2">
              /verify {code}
            </span>
          </p>
          <p>After verifying, click the button below.</p>
          <button
            type="submit"
            className="btn btn-primary w-full flex justify-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader className="animate-spin" size={18} />
                Checking...
              </>
            ) : (
              <>
                <ShieldCheck size={18} />
                Check Verification
              </>
            )}
          </button>
          {error && (
            <div className="text-red-600 text-sm flex items-center gap-1">
              <AlertCircle size={16} /> {error}
            </div>
          )}
        </form>
      )}
    </div>
  );
}