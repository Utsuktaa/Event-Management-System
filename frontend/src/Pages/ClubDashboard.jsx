import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { getTokenFromCookies } from "../Utils/auth";
import Discussions from "../Components/Discussions";
import Events from "../Components/Events";
import Polls from "../Components/Polls";
import Documents from "../Components/Documents";
import ClubManagement from "../Components/ClubManagement";
import Sidebar from "../Components/Sidebar";
import NavbarXP from "../Components/NavbarXP";
import { ArrowLeft, LogOut } from "lucide-react";
import { API_BASE } from "../config";

export default function ClubDashboard() {
  const { clubId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const token = getTokenFromCookies();

  const [club, setClub] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [clubRole, setClubRole] = useState(null);
  const [activeTab, setActiveTab] = useState("Discussions");
  const [loading, setLoading] = useState(true);
  const [leaveConfirm, setLeaveConfirm] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    axios
      .get(`${API_BASE}/api/clubs/${clubId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setClub(res.data);
        setPermissions(res.data.permissions || []);
        setClubRole(res.data.clubRole);
      })
      .catch((err) => {
        if (err.response?.status === 403) navigate("/join-clubs");
      })
      .finally(() => setLoading(false));
  }, [clubId, token, navigate]);

  // Support ?tab=Manage deep-link (e.g. from notifications)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab) setActiveTab(tab);
    // Support navigation state (e.g. from poll convert-to-event)
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.search, location.state]);

  const can = (p) => permissions.includes(p);
  const tabs = can("view_analytics")
    ? ["Discussions", "Events", "Members", "Polls", "Documents", "Manage"]
    : ["Discussions", "Events", "Members", "Polls", "Documents"];

  const handleLeave = async () => {
    setLeaving(true);
    try {
      await axios.delete(`${API_BASE}/api/clubs/${clubId}/leave`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate("/join-clubs");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to leave club");
    } finally {
      setLeaving(false);
      setLeaveConfirm(false);
    }
  };

  const renderTab = () => {
    switch (activeTab) {
      case "Discussions":
        return <Discussions clubId={clubId} token={token} />;
      case "Events":
        return <Events clubId={clubId} token={token} canCreate={can("create_event")} canEdit={can("edit_event")} />;
      case "Members":
        return <MembersList clubId={clubId} token={token} canAssignRoles={can("assign_roles")} />;
      case "Polls":
        return <Polls clubId={clubId} token={token} permissions={permissions} />;
      case "Documents":
        return <Documents clubId={clubId} token={token} canDelete={can("delete_post")} />;
      case "Manage":
        return <ClubManagement clubId={clubId} token={token} permissions={permissions} initialJoinPolicy={club?.joinPolicy} defaultSection={new URLSearchParams(location.search).get("section") || undefined} prefillEvent={location.state?.prefillEvent} />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f5f3ff" }}>
        <div className="w-8 h-8 rounded-full border-2 border-purple-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans flex" style={{ background: "linear-gradient(160deg, #f5f3ff 0%, #faf5ff 50%, #f0f9ff 100%)" }}>
      <Sidebar role="user" />

      <div className="flex-1 flex flex-col ml-56">
        <nav
          className="sticky top-0 z-40 px-6 py-3 flex items-center justify-between"
          style={{
            background: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid rgba(124,58,237,0.10)",
          }}
        >
          <div className="flex items-center gap-3">
            <span className="font-semibold text-sm" style={{ color: "#1E3A8A" }}>{club?.name}</span>
            {clubRole && (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium capitalize bg-purple-100 text-purple-700">
                {clubRole.replace("_", " ")}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <NavbarXP />
            {/* Leave club button — only for actual members (not platform admins) */}
            {clubRole && (
              <button
                onClick={() => setLeaveConfirm(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition"
                title="Leave club"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Leave</span>
              </button>
            )}
            <button
              onClick={() => navigate("/join-clubs")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-500 transition hover:bg-purple-50"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">All Clubs</span>
            </button>
          </div>
        </nav>

        <div
          className="sticky z-30 px-6 border-b"
          style={{
            top: "53px",
            background: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(12px)",
            borderColor: "rgba(124,58,237,0.10)",
          }}
        >
          <div className="flex gap-0 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2"
                style={
                  activeTab === tab
                    ? { color: "#7C3AED", borderColor: "#7C3AED" }
                    : { color: "#6B7280", borderColor: "transparent" }
                }
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 max-w-5xl w-full mx-auto px-6 py-8 pb-16">
          {renderTab()}
        </div>

        <footer className="py-6 text-center text-xs border-t" style={{ color: "rgba(107,114,128,0.6)", borderColor: "rgba(124,58,237,0.08)" }}>
          © 2025 EventSync
        </footer>
      </div>

      {/* Leave club confirmation modal */}
      {leaveConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30"
          onClick={() => setLeaveConfirm(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl border border-red-100"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-gray-900 mb-2">Leave {club?.name}?</h3>
            <p className="text-sm text-gray-500 mb-5">
              You'll lose access to this club's content and will need to rejoin to get back in.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setLeaveConfirm(false)}
                className="flex-1 py-2 rounded-xl text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleLeave}
                disabled={leaving}
                className="flex-1 py-2 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition disabled:opacity-50"
              >
                {leaving ? "Leaving…" : "Leave Club"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MembersList({ clubId, token, canAssignRoles }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPosition, setEditingPosition] = useState(null); // memberId being edited
  const [positionInput, setPositionInput] = useState("");
  const [savingPosition, setSavingPosition] = useState(false);

  const fetchMembers = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/clubs/${clubId}/members`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMembers(res.data);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [clubId]);

  const assignTag = async (memberId, role) => {
    try {
      await axios.patch(
        `${API_BASE}/api/clubs/${clubId}/members/${memberId}/role`,
        { role },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchMembers();
    } catch {}
  };

  const startEditPosition = (m) => {
    setEditingPosition(m._id);
    setPositionInput(m.position || "");
  };

  const savePosition = async (memberId) => {
    setSavingPosition(true);
    try {
      await axios.patch(
        `${API_BASE}/api/clubs/${clubId}/members/${memberId}/position`,
        { position: positionInput },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingPosition(null);
      fetchMembers();
    } catch {
    } finally {
      setSavingPosition(false);
    }
  };

  if (loading)
    return <div className="py-10 text-center text-sm text-gray-400">Loading members...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-2 mt-2">
      {members.length === 0 ? (
        <p className="text-center py-10 text-sm text-gray-400">No active members.</p>
      ) : (
        members.map((m) => (
          <div
            key={m._id}
            className="flex items-center justify-between p-4 rounded-xl bg-white border border-purple-100 gap-3"
          >
            {/* Avatar + name */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold text-white bg-gradient-to-br from-purple-600 to-indigo-500">
                {m.userId?.name?.[0]?.toUpperCase() || "?"}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-blue-900 truncate">{m.userId?.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                  <p className="text-xs text-gray-400 truncate">{m.userId?.email}</p>
                  {/* Position label */}
                  {m.position && (
                    <span className="text-xs text-purple-500 font-medium">· {m.position}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Right side controls */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Tag badge */}
              <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                m.role === "club_admin"
                  ? "bg-purple-100 text-purple-700"
                  : "bg-gray-100 text-gray-500"
              }`}>
                {m.role === "club_admin" ? "Admin" : "Member"}
              </span>

              {canAssignRoles && (
                <div className="flex items-center gap-1.5">
                  {/* Tag toggle */}
                  <select
                    value={m.role}
                    onChange={(e) => assignTag(m._id, e.target.value)}
                    className="text-xs rounded-lg px-2 py-1 outline-none bg-purple-50 border border-purple-200 text-gray-700"
                  >
                    <option value="member">Member tag</option>
                    <option value="club_admin">Admin tag</option>
                  </select>

                  {/* Position edit */}
                  {editingPosition === m._id ? (
                    <div className="flex items-center gap-1">
                      <input
                        value={positionInput}
                        onChange={(e) => setPositionInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && savePosition(m._id)}
                        placeholder="Position title"
                        className="text-xs border border-purple-200 rounded-lg px-2 py-1 w-28 outline-none focus:border-purple-400 bg-white"
                        autoFocus
                      />
                      <button
                        onClick={() => savePosition(m._id)}
                        disabled={savingPosition}
                        className="text-xs px-2 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingPosition(null)}
                        className="text-xs px-2 py-1 text-gray-400 hover:text-gray-600"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => startEditPosition(m)}
                      className="text-xs px-2 py-1 rounded-lg border border-purple-200 text-purple-600 hover:bg-purple-50 transition"
                      title="Set position title"
                    >
                      {m.position ? "Edit title" : "Set title"}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
