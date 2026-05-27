import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, ChevronRight } from "lucide-react";
import ClubInfo from "../Components/ClubInfo";
import Toast from "../Components/Toast";
import PageLayout from "../Components/PageLayout";
import { getTokenFromCookies } from "../Utils/auth";
import { API_BASE } from "../config";

const STATUS_CONFIG = {
  ACTIVE: {
    label: "Member",
    color: "bg-green-500/15 text-green-700 border-green-500/25",
  },
  PENDING: {
    label: "Pending approval",
    color: "bg-yellow-500/15 text-yellow-700 border-yellow-500/25",
  },
  REJECTED: {
    label: "Request rejected — tap to re-apply",
    color: "bg-red-500/15 text-red-600 border-red-500/25",
  },
  NONE: {
    label: "Not a member",
    color: "bg-gray-100 text-gray-500 border-gray-200",
  },
};

const ROLE_LABELS = {
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
    if (!token) {
      setLoading(false);
      return;
    }
    fetch(`${API_BASE}/api/clubs`, {
      headers: { Authorization: "Bearer " + token },
    })
      .then((r) => r.json())
      .then((d) => setClubs(Array.isArray(d) ? d : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleClubClick = (club) => {
    if (club.membershipStatus === "ACTIVE") navigate(`/clubs/${club._id}`);
    else if (club.membershipStatus === "PENDING")
      showToast("Your join request is pending approval.", "error");
    else if (club.joinPolicy === "CLOSED")
      showToast("This club is not accepting new members.", "error");
    else setSelectedClub(club); // covers REJECTED (re-apply) and NONE
  };

  const isClickable = (club) =>
    club.membershipStatus !== "PENDING" && club.joinPolicy !== "CLOSED";

  const getStatusDisplay = (club) => {
    if (club.membershipStatus === "ACTIVE" && club.clubRole) {
      return {
        label: ROLE_LABELS[club.clubRole] || club.clubRole,
        color: "bg-purple-500/15 text-purple-700 border-purple-500/25",
      };
    }
    return STATUS_CONFIG[club.membershipStatus] || STATUS_CONFIG.NONE;
  };

  return (
    <PageLayout title="Clubs" role="user">
      <div className="flex-1 max-w-4xl w-full mx-auto px-8 py-8">
        <p className="text-sm text-gray-500 mb-6">Join a club or access existing one.</p>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="h-24 rounded-xl animate-pulse"
                  style={{
                    background: "rgba(196,181,253,0.2)",
                    border: "1px solid rgba(124,58,237,0.1)",
                  }}
                />
              ))}
            </div>
          ) : clubs.length === 0 ? (
            <div className="text-center py-20" style={{ color: "#9CA3AF" }}>
              <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>No clubs available yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {clubs.map((club) => {
                const { label, color } = getStatusDisplay(club);
                const clickable = isClickable(club);
                const policy = POLICY_BADGE[club.joinPolicy];

                return (
                  <div
                    key={club._id}
                    onClick={() => handleClubClick(club)}
                    className="flex items-start gap-4 rounded-xl p-5 transition-all duration-200 bg-white border hover:border-purple-300 hover:shadow-sm"
                    style={{
                      border: "1px solid rgba(124,58,237,0.12)",
                      cursor: clickable ? "pointer" : "not-allowed",
                      opacity: clickable ? 1 : 0.55,
                    }}
                  >
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: "rgba(124,58,237,0.10)" }}
                    >
                      <Users className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3
                          className="font-semibold text-sm truncate"
                          style={{ color: "#1E3A8A" }}
                        >
                          {club.name}
                        </h3>
                        {clickable && (
                          <ChevronRight className="w-4 h-4 flex-shrink-0 text-gray-300" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full border ${color}`}
                        >
                          {label}
                        </span>
                        {club.membershipStatus === "NONE" && policy && (
                          <span
                            className={`text-xs font-medium ${policy.color}`}
                          >
                            {policy.label}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
      </div>

      {selectedClub && (
        <ClubInfo club={selectedClub} onClose={() => setSelectedClub(null)} />
      )}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </PageLayout>
  );
}
