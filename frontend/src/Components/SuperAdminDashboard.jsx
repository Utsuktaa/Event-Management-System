import { useState, useEffect, useRef } from "react";
import { getTokenFromCookies } from "../Utils/auth";
import { Search, X, ChevronDown, Trash2, Plus, Users, Shield } from "lucide-react";
import { API_BASE } from "../config";

const API = `${API_BASE}/api/admin`;

const ROLE_OPTIONS = [
  { value: "president", label: "President" },
  { value: "vice_president", label: "Vice President" },
  { value: "club_admin", label: "Club Admin" },
  { value: "member", label: "Member" },
];

const POLICY_OPTIONS = [
  { value: "OPEN", label: "Open" },
  { value: "APPROVAL_REQUIRED", label: "Approval Required" },
  { value: "CLOSED", label: "Closed" },
];

const ROLE_COLORS = {
  president: "bg-purple-100 text-purple-700",
  vice_president: "bg-blue-100 text-blue-700",
  club_admin: "bg-indigo-100 text-indigo-700",
  member: "bg-gray-100 text-gray-600",
};

const STATUS_COLORS = {
  ACTIVE: "text-green-600",
  PENDING: "text-amber-500",
  REJECTED: "text-red-500",
};

function Searchable({ placeholder, items, value, onChange, renderItem, renderSelected, disabled }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = items.filter((item) =>
    JSON.stringify(item).toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div ref={ref} className="relative flex-1 min-w-0">
      <button
        type="button"
        disabled={disabled}
        onClick={() => { setOpen((v) => !v); setQuery(""); }}
        className="w-full flex items-center justify-between gap-2 px-4 py-2.5 bg-white border border-purple-200 rounded-xl text-sm text-left disabled:opacity-50 hover:border-purple-400 transition"
      >
        <span className={value ? "text-gray-800" : "text-gray-400"}>
          {value ? renderSelected(value) : placeholder}
        </span>
        {value ? (
          <X
            className="w-4 h-4 text-gray-400 hover:text-gray-600 flex-shrink-0"
            onClick={(e) => { e.stopPropagation(); onChange(null); }}
          />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
        )}
      </button>

      {open && (
        <div className="absolute z-[100] top-full mt-1 w-full bg-white border border-purple-200 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-2 border-b border-purple-100">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 rounded-xl">
              <Search className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search..."
                className="bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none w-full"
              />
            </div>
          </div>
          <ul className="max-h-52 overflow-y-auto">
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-sm text-gray-400">No results</li>
            ) : (
              filtered.map((item) => (
                <li
                  key={item._id}
                  onClick={() => { onChange(item); setOpen(false); }}
                  className="px-4 py-2.5 text-sm cursor-pointer hover:bg-purple-50 transition-colors"
                >
                  {renderItem(item)}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function AdminPanel() {
  const token = getTokenFromCookies();
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const [clubs, setClubs] = useState([]);
  const [users, setUsers] = useState([]);
  const [members, setMembers] = useState([]);
  const [selectedClub, setSelectedClub] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [role, setRole] = useState("club_admin");
  const [clubName, setClubName] = useState("");
  const [joinPolicy, setJoinPolicy] = useState("APPROVAL_REQUIRED");
  const [toast, setToast] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    fetch(`${API}/clubs`, { headers }).then((r) => r.json()).then(setClubs).catch(() => {});
    fetch(`${API}/users`, { headers }).then((r) => r.json()).then(setUsers).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedClub) { setMembers([]); return; }
    fetch(`${API}/clubs/${selectedClub._id}/members`, { headers })
      .then((r) => r.json()).then(setMembers).catch(() => {});
  }, [selectedClub]);

  const createClub = async (e) => {
    e.preventDefault();
    if (!clubName.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/clubs`, {
        method: "POST", headers, body: JSON.stringify({ name: clubName, joinPolicy }),
      });
      const data = await res.json();
      if (res.ok) {
        setClubs((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
        setClubName("");
        showToast(`Club "${data.name}" created`);
      } else {
        showToast(data.message || "Failed to create club", "error");
      }
    } catch { showToast("Network error", "error"); }
    finally { setSubmitting(false); }
  };

  const assignMember = async (e) => {
    e.preventDefault();
    if (!selectedClub || !selectedUser) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/clubs/${selectedClub._id}/members`, {
        method: "POST", headers, body: JSON.stringify({ userId: selectedUser._id, role }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`${selectedUser.name} assigned as ${role.replace("_", " ")} in ${selectedClub.name}`);
        setSelectedUser(null);
        const refreshed = await fetch(`${API}/clubs/${selectedClub._id}/members`, { headers }).then((r) => r.json());
        setMembers(refreshed);
      } else {
        showToast(data.message || "Failed to assign", "error");
      }
    } catch { showToast("Network error", "error"); }
    finally { setSubmitting(false); }
  };

  const removeMember = async (memberId) => {
    try {
      await fetch(`${API}/clubs/${selectedClub._id}/members/${memberId}`, { method: "DELETE", headers });
      setMembers((prev) => prev.filter((m) => m._id !== memberId));
      showToast("Member removed");
    } catch { showToast("Failed to remove member", "error"); }
  };

  const inputCls = "px-4 py-2.5 bg-white border border-purple-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-purple-500 transition";

  return (
    <div className="space-y-6">

      <div className="bg-white/80 rounded-3xl p-8 border border-purple-200 shadow-sm relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-200 rounded-full opacity-30 pointer-events-none" />
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center shadow-md">
            <Plus className="w-4 h-4 text-white" />
          </div>
          <h2 className="font-semibold text-base text-blue-900">Create Club</h2>
        </div>
        <form onSubmit={createClub} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Club name"
            value={clubName}
            onChange={(e) => setClubName(e.target.value)}
            className={`flex-1 ${inputCls}`}
          />
          <select value={joinPolicy} onChange={(e) => setJoinPolicy(e.target.value)} className={inputCls}>
            {POLICY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <button
            type="submit"
            disabled={submitting || !clubName.trim()}
            className="flex items-center gap-2 px-5 py-2.5 bg-purple-700 text-white text-sm font-semibold rounded-xl hover:bg-purple-800 transition disabled:opacity-50 shadow-md"
          >
            <Plus className="w-4 h-4" />
            Create
          </button>
        </form>
      </div>

      <div className="bg-white/80 rounded-3xl p-8 border border-purple-200 shadow-sm relative">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-200 rounded-full opacity-30 pointer-events-none" />
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center shadow-md">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <h2 className="font-semibold text-base text-blue-900">Assign Role</h2>
        </div>
        <form onSubmit={assignMember} className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <Searchable
              placeholder="Select a club..."
              items={clubs}
              value={selectedClub}
              onChange={setSelectedClub}
              renderItem={(c) => (
                <div>
                  <p className="text-gray-900 font-medium">{c.name}</p>
                  <p className="text-xs text-gray-400">{c.joinPolicy}</p>
                </div>
              )}
              renderSelected={(c) => c.name}
            />
            <Searchable
              placeholder="Select a user..."
              items={users}
              value={selectedUser}
              onChange={setSelectedUser}
              disabled={!selectedClub}
              renderItem={(u) => (
                <div>
                  <p className="text-gray-900 font-medium">{u.name}</p>
                  <p className="text-xs text-gray-400">{u.email}</p>
                </div>
              )}
              renderSelected={(u) => `${u.name} — ${u.email}`}
            />
            <select value={role} onChange={(e) => setRole(e.target.value)} className={`${inputCls} sm:w-44`}>
              {ROLE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <button
            type="submit"
            disabled={submitting || !selectedClub || !selectedUser}
            className="self-start px-6 py-2.5 bg-purple-700 text-white text-sm font-semibold rounded-xl hover:bg-purple-800 transition disabled:opacity-40 shadow-md"
          >
            {submitting ? "Assigning..." : "Assign Role"}
          </button>
        </form>
      </div>

      {selectedClub && (
        <div className="bg-white/80 rounded-3xl p-8 border border-purple-200 shadow-sm relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-200 rounded-full opacity-30 pointer-events-none" />
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center shadow-md">
              <Users className="w-4 h-4 text-white" />
            </div>
            <h2 className="font-semibold text-base text-blue-900">{selectedClub.name} — Members</h2>
          </div>
          {members.length === 0 ? (
            <p className="text-sm text-gray-400">No members assigned yet.</p>
          ) : (
            <ul className="space-y-2">
              {members.map((m) => (
                <li key={m._id} className="flex items-center justify-between p-4 rounded-2xl bg-purple-50 border border-purple-100">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-purple-600 flex items-center justify-center text-sm font-bold text-white">
                      {m.userId?.name?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{m.userId?.name}</p>
                      <p className="text-xs text-gray-400">{m.userId?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${ROLE_COLORS[m.role] || "bg-gray-100 text-gray-600"}`}>
                      {m.role?.replace("_", " ")}
                    </span>
                    <span className={`text-xs font-medium ${STATUS_COLORS[m.status] || "text-gray-400"}`}>
                      {m.status}
                    </span>
                    <button onClick={() => removeMember(m._id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {toast && (
        <div className={`fixed bottom-6 right-6 px-5 py-3 rounded-2xl shadow-lg text-sm font-semibold text-white ${toast.type === "error" ? "bg-red-500" : "bg-purple-600"}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
