import { useState, useEffect } from "react";
import axios from "axios";
import { User, Mail, Pencil, Check, X, Loader2 } from "lucide-react";
import { getTokenFromCookies } from "../Utils/auth";
import { API_BASE } from "../config";
import PageLayout from "../Components/PageLayout";

export default function ProfilePage() {
  const [profile, setProfile]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [editing, setEditing]   = useState(false);
  const [nameInput, setName]    = useState("");
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState("");

  useEffect(() => {
    const token = getTokenFromCookies();
    if (!token) return;
    axios
      .get(`${API_BASE}/api/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setProfile(res.data);
        setName(res.data.name);
      })
      .catch(() => setError("Failed to load profile."))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!nameInput.trim()) { setError("Name cannot be empty."); return; }
    setError("");
    setSaving(true);
    try {
      const token = getTokenFromCookies();
      const res = await axios.patch(
        `${API_BASE}/api/user/profile`,
        { name: nameInput.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProfile(res.data);
      setName(res.data.name);
      setEditing(false);
      setSuccess("Name updated successfully.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update name.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setName(profile?.name || "");
    setEditing(false);
    setError("");
  };

  return (
    <PageLayout title="Profile" role="user">
      <div className="px-6 py-10">
        <div className="max-w-[520px] mx-auto space-y-6">

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
            </div>
          ) : (
            <>
              {/* Avatar */}
              <div className="flex flex-col items-center gap-3 py-6">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-black text-white bg-gradient-to-br from-purple-500 to-indigo-500 shadow-lg shadow-purple-200">
                  {profile?.name?.[0]?.toUpperCase() || "?"}
                </div>
                <p className="text-base font-bold text-blue-900">{profile?.name}</p>
                <p className="text-sm text-gray-400">{profile?.email}</p>
              </div>

              {/* Name field */}
              <div className="bg-white rounded-2xl border border-purple-100 p-5 space-y-4">
                <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Account Info</h2>

                {/* Name */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    <User className="w-3.5 h-3.5" />
                    Display Name
                  </label>
                  {editing ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={nameInput}
                        onChange={(e) => { setName(e.target.value); setError(""); }}
                        onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") handleCancel(); }}
                        autoFocus
                        className="flex-1 px-3 py-2 rounded-xl border border-purple-300 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-purple-300 transition"
                        placeholder="Your name"
                      />
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-8 h-8 flex items-center justify-center rounded-xl bg-purple-600 text-white hover:bg-purple-700 transition disabled:opacity-60"
                        title="Save"
                      >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={handleCancel}
                        className="w-8 h-8 flex items-center justify-center rounded-xl border border-gray-200 text-gray-400 hover:bg-gray-50 transition"
                        title="Cancel"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-100">
                      <span className="text-sm font-medium text-gray-800">{profile?.name}</span>
                      <button
                        onClick={() => setEditing(true)}
                        className="flex items-center gap-1 text-xs font-semibold text-purple-600 hover:text-purple-800 transition"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Edit
                      </button>
                    </div>
                  )}
                </div>

                {/* Email — read-only */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    <Mail className="w-3.5 h-3.5" />
                    Email Address
                  </label>
                  <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-100">
                    <span className="text-sm text-gray-600">{profile?.email}</span>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Read-only</span>
                  </div>
                </div>

                {/* Feedback */}
                {error && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <X className="w-3.5 h-3.5" /> {error}
                  </p>
                )}
                {success && (
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> {success}
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
