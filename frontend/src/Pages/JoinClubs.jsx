import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, ChevronRight, ArrowLeft } from "lucide-react";
import ClubInfo from "../Components/ClubInfo";
import Toast from "../Components/Toast";
import Logo from "../Components/Logo";
import { getTokenFromCookies } from "../Utils/auth";
import { API_BASE } from "../config";

const STATUS_CONFIG = {
  ACTIVE: { label: "Member", color: "bg-green-500/15 text-green-700 border-green-500/25" },
  PENDING: { label: "Pending approval", color: "bg-yellow-500/15 text-yellow-700 border-yellow-500/25" },
  REJECTED: { label: "Request rejected", color: "bg-red-500/15 text-red-600 border-red-500/25" },
  NONE: { label: "Not a member", color: "bg-gray-100 text-gray-500 border-gray-200" },
};

const ROLE_LABELS = {
  president: "President",
  vice_president: "Vice President",
  club_admin: "Club Admin",
  member: "Member",
};

const POLICY_BADGE = {
  OPEN: { label: "Open to join", color: "text-green-600" },
  APPROVAL_REQUIRED: { label: "Approval required", color: "text-amber-600" },
  CLOSED: { label: "Closed", color: "text-red-500" },
};

export default function JoinClubs() {
  const navigate = useNavigate();
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClub, setSelectedClub] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const token = getTokenFromCookies();
    if (!token) { setLoading(false); return; }
    fetch(`${API_BASE}/api/clubs`, { headers: { Authorization: "Bearer " + token } })
      .then((r) => r.json())
      .then((d) => setClubs(Array.isArray(d) ? d : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleClubClick = (club) => {
    if (club.membershipStatus === "ACTIVE") navigate(`/clubs/${club._id}`);
    else if (club.membershipStatus === "PENDING") showToast("Your join request is pending approval.", "error");
    else if (club.membershipStatus === "REJECTED") showToast("Your previous request was rejected.", "error");
    else if (club.joinPolicy === "CLOSED") showToast("This club is not accepting new members.", "error");
    else setSelectedClub(club);
  };

  const getStatusDisplay = (club) => {
    if (club.membershipStatus === "ACTIVE" && club.clubRole) {
      return { label: ROLE_LABELS[club.clubRole] || club.clubRole, color: "bg-purple-500/15 text-purple-700 border-purple-500/25" };
    }
    return STATUS_CONFIG[club.membershipStatus] || STATUS_CONFIG.NONE;
  };

  const isClickable = (club) => club.membershipStatus !== "REJECTED" && club.joinPolicy !== "CLOSED";

  return (
    <div
      className="min-h-screen font-sans relative overflow-x-hidden"
      style={{ background: "linear-gradient(135deg, #ede9fe 0%, #f5f3ff 40%, #e0e7ff 100%)" }}
    >
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full opacity-25 blur-3xl"
          style={{ background: "radial-gradient(circle, #c4b5fd, transparent 70%)" }} />
        <div className="absolute top-1/2 -right-40 w-[400px] h-[400px] rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, #a5b4fc, transparent 70%)" }} />
      </div>

      <nav
        className="sticky top-0 z-40 px-6 py-4 flex items-center justify-between"
        style={{
          background: "rgba(255,255,255,0.75)",
          backdropFilter: "blur(16px)",
          boxShadow: "0 1px 24px rgba(124,58,237,0.10)",
          borderBottom: "1px solid rgba(124,58,237,0.12)",
        }}
      >
        <Logo />
        <button
          onClick={() => navigate("/user-dashboard")}
          className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition hover:bg-purple-50"
          style={{ color: "#6B7280" }}
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Dashboard</span>
        </button>
      </nav>

      <main className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-1 h-8 rounded-full" style={{ background: "linear-gradient(180deg,#7C3AED,#4f46e5)" }} />
            <h1 className="text-3xl font-bold" style={{ color: "#1E3A8A" }}>Clubs</h1>
          </div>
          <p className="ml-4 text-sm" style={{ color: "#6B7280" }}>Join a club or access your existing memberships</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-28 rounded-2xl animate-pulse"
                style={{ background: "rgba(196,181,253,0.2)", border: "1px solid rgba(124,58,237,0.1)" }} />
            ))}
          </div>
        ) : clubs.length === 0 ? (
          <div className="text-center py-20" style={{ color: "#9CA3AF" }}>
            <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>No clubs available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {clubs.map((club) => {
              const { label, color } = getStatusDisplay(club);
              const clickable = isClickable(club);
              const policy = POLICY_BADGE[club.joinPolicy];

              return (
                <div
                  key={club._id}
                  onClick={() => handleClubClick(club)}
                  className="group relative rounded-2xl p-6 flex flex-col gap-3 transition-all duration-200 overflow-hidden"
                  style={{
                    background: "rgba(255,255,255,0.75)",
                    border: "1px solid rgba(124,58,237,0.12)",
                    boxShadow: "0 2px 16px rgba(124,58,237,0.07)",
                    cursor: clickable ? "pointer" : "not-allowed",
                    opacity: clickable ? 1 : 0.55,
                  }}
                  onMouseEnter={(e) => {
                    if (!clickable) return;
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 10px 28px rgba(124,58,237,0.15)";
                    e.currentTarget.style.borderColor = "rgba(124,58,237,0.25)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "";
                    e.currentTarget.style.boxShadow = "0 2px 16px rgba(124,58,237,0.07)";
                    e.currentTarget.style.borderColor = "rgba(124,58,237,0.12)";
                  }}
                >
                  <div className="absolute -bottom-4 -right-4 w-16 h-16 rounded-full blur-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: "rgba(196,181,253,0.5)" }} />

                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)", boxShadow: "0 4px 12px rgba(124,58,237,0.3)" }}>
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-semibold text-base" style={{ color: "#1E3A8A" }}>{club.name}</h3>
                    </div>
                    {clickable && <ChevronRight className="w-4 h-4 shrink-0 mt-0.5 opacity-30 group-hover:opacity-70 transition-opacity" style={{ color: "#7C3AED" }} />}
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${color}`}>{label}</span>
                    {club.membershipStatus === "NONE" && policy && (
                      <span className={`text-xs font-medium ${policy.color}`}>{policy.label}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {selectedClub && <ClubInfo club={selectedClub} onClose={() => setSelectedClub(null)} />}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <footer className="relative z-10 py-8 text-center text-xs border-t"
        style={{ color: "rgba(107,114,128,0.6)", borderColor: "rgba(124,58,237,0.10)" }}>
        © 2025 EventSync
      </footer>
    </div>
  );
}
