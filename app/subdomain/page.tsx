"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Globe, Loader, Save } from "lucide-react";

export default function SubdomainPage() {
  const [subdomain, setSubdomain] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subdomain || subdomain.length < 3) {
      return toast.error("Subdomain must be at least 3 characters.");
    }

    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");

    setLoading(true);
    const res = await fetch("/api/create-subdomain", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({ subdomain }),
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      toast.success("Subdomain registered!");
      router.push("/dashboard");
    } else {
      toast.error(data.error || "Failed to register subdomain.");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto mt-24 bg-white shadow-xl rounded-xl p-8">
      <h2 className="text-2xl font-bold text-center mb-6 flex items-center justify-center gap-2 text-blue-600">
        <Globe className="h-6 w-6" />
        Create Subdomain
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold mb-1">Subdomain</label>
          <div className="flex">
            <input
              type="text"
              placeholder="yourname"
              className="input rounded-l-md w-full"
              value={subdomain}
              onChange={(e) =>
                setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9\-]/g, ""))
              }
              required
            />
            <span className="bg-gray-100 text-gray-700 px-3 py-2 rounded-r-md border border-l-0 border-gray-300 text-sm">
              .is-from.in
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Only lowercase letters, numbers, and hyphens are allowed.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary w-full flex items-center justify-center gap-2"
        >
          {loading ? <Loader className="animate-spin h-5 w-5" /> : <Save className="h-5 w-5" />}
          {loading ? "Registering..." : "Register Subdomain"}
        </button>
      </form>
    </div>
  );
}