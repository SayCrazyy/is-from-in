"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  Mail,
  User,
  Globe,
  CheckCircle,
  Plus,
  Trash2,
  Server,
} from "lucide-react";

type Record = {
  id?: string;
  type: string;
  name: string;
  content: string;
};

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");

    fetch("/api/profile", {
      headers: { Authorization: "Bearer " + token },
    })
      .then((r) => r.json())
      .then((data) => {
        if (!data.user) return router.push("/login");
        setUser(data.user);

        if (data.user.subdomain) {
          const defaultRecords = data.user.records?.length
            ? data.user.records.map((r: Record) => ({
                ...r,
                name: data.user.subdomain,
              }))
            : [{ type: "A", name: data.user.subdomain, content: "" }];
          setRecords(defaultRecords);
        }
      });
  }, []);

  const handleRecordChange = (idx: number, field: string, value: string) => {
    setRecords((rs) =>
      rs.map((r, i) => (i === idx ? { ...r, [field]: value } : r))
    );
  };

  const addRecord = () =>
    setRecords((rs) => [
      ...rs,
      { type: "A", name: user.subdomain, content: "" },
    ]);

  const removeRecord = (idx: number) => {
    setRecords((rs) =>
      rs.length > 1 ? rs.filter((_, i) => i !== idx) : rs
    );
  };

  async function handleSaveRecords(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem("token");

    const sanitized = records.map((r) => ({
      ...r,
      name: user.subdomain, // force name
    }));

    const res = await fetch("/api/save-records", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({ records: sanitized }),
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      toast.success("DNS records saved!");
    } else {
      toast.error(data.error || "Failed to save records.");
    }
  }

  if (!user) return <div>Loading...</div>;

  if (!user.telegramVerified) {
    return (
      <div className="max-w-md mx-auto mt-16 bg-white shadow-lg rounded-xl p-8 text-center">
        <h2 className="text-xl font-bold text-red-600 mb-4">Telegram Not Verified</h2>
        <p className="mb-2">Please complete registration & verify Telegram.</p>
        <a className="text-blue-600 underline" href="/register">Register Again</a>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto mt-16 bg-white shadow-lg rounded-xl p-8">
      <h2 className="text-3xl font-bold mb-6 text-center text-blue-600 flex items-center justify-center gap-2">
        <Server className="h-6 w-6" /> Dashboard
      </h2>

      <div className="mb-6 text-sm text-gray-700 space-y-1">
        <p className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-gray-500" />
          Email: <b>{user.email}</b>
        </p>
        <p className="flex items-center gap-2">
          <User className="h-4 w-4 text-gray-500" />
          Telegram: <b>@{user.telegramUsername}</b>
        </p>
        <p className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-600" />
          Verified: <b className="text-green-600">Yes</b>
        </p>
        <p className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-600" />
          Channel Member:{" "}
          <b className="text-green-600">
            {user.isChannelMember ? "Yes" : "No"}
          </b>
        </p>
        <p className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-gray-500" />
          Subdomain:{" "}
          <b>
            {user.subdomain ? `${user.subdomain}.is-from.in` : "(not set)"}
          </b>
        </p>
      </div>

      {!user.subdomain ? (
        <div className="text-center mt-6">
          <p className="text-gray-600 mb-2">You haven't created any subdomain yet.</p>
          <button
            onClick={() => router.push("/subdomain")}
            className="btn btn-primary"
          >
            Create Subdomain
          </button>
        </div>
      ) : (
        <form onSubmit={handleSaveRecords} className="flex flex-col gap-4">
          <div>
            <h3 className="font-semibold mb-3">
              DNS Records for <b>{user.subdomain}.is-from.in</b>
            </h3>
            <div className="space-y-2">
              {records.map((rec, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-center"
                >
                  <select
                    value={rec.type}
                    onChange={(e) =>
                      handleRecordChange(idx, "type", e.target.value)
                    }
                    className="input"
                  >
                    <option>A</option>
                    <option>AAAA</option>
                    <option>CNAME</option>
                    <option>TXT</option>
                    <option>MX</option>
                    <option>SRV</option>
                    <option>NS</option>
                  </select>

                  <input
                    type="text"
                    value={user.subdomain}
                    disabled
                    className="input bg-gray-100 cursor-not-allowed"
                  />

                  <input
                    type="text"
                    placeholder="Value"
                    className="input"
                    value={rec.content}
                    onChange={(e) =>
                      handleRecordChange(idx, "content", e.target.value)
                    }
                  />

                  <button
                    type="button"
                    onClick={() => removeRecord(idx)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addRecord}
              className="text-blue-600 underline text-sm mt-2 flex items-center gap-1"
            >
              <Plus className="h-4 w-4" /> Add Record
            </button>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save DNS Records"}
          </button>
        </form>
      )}
    </div>
  );
}