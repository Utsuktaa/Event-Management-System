import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, ChevronRight } from "lucide-react";
import ClubInfo from "../Components/ClubInfo";
import Toast from "../Components/Toast";
import { getTokenFromCookies } from "../Utils/auth";

const STATUS_CONFIG = {
  ACTIVE: { label: "Member", color: "bg-green-500/20 text-green-300 border-green-500/30" },
  PENDING: { label: "Pending approval", color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" },
  REJECTED: { label: "Request rejected", color: "bg-red-500/20 text-red-300 border-red-500/30" },
  NONE: { label: "Not a member", color: "bg-white/10 text-gray-400 border-white/10" },
};

const ROLE_LABELS = {
  president: "President",
  vice_president: "Vice President",
  club_admin: "Club Admin",
  member: "Member",
};

const POLICY_BADGE = {
  OPEN: { label: "Open to join", color: "text-green-400" },
  APPROVAL_REQUIRED: { label: "Approval required", color: "text-yellow-400" },
  CLOSED: { label: "Closed", color: "text-red-400" },
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
    fetch("http://localhost:5000/api/clubs", {
      headers: { Authorization: "Bearer " + token },
    })
      .then((res) => res.json())
      .then((data) => setClubs(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleClubClick = (club) => {
    if (club.membershipStatus === "ACTIVE") {
      navigate(`/clubs/${club._id}`);
    } else if (club.membershipStatus === "PENDING") {
      showToast("Your join request is pending approval.", "error");
    } else if (club.membershipStatus === "REJECTED") {
      showToast("Your previous request was rejected.", "error");
    } else if (club.joinPolicy === "CLOSED") {
      showToast("This club is not accepting new members.", "error");
    } else {
      setSelectedClub(club);
    }
  };

  const getStatusDisplay = (club) => {
    if (club.membershipStatus === "ACTIVE" && club.clubRole) {
      return {
        label: ROLE_LABELS[club.clubRole] || club.clubRole,
        color: "bg-purple-500/20 text-purple-300 border-purple-500/30",
      };
    }
    return STATUS_CONFIG[club.membershipStatus] || STATUS_CONFIG.NONE;
  };

  const isClickable = (club) =>
    club.membershipStatus !== "REJECTED" &&
    club.joinPolicy !== "CLOSED";

  return (
    <div className="min-h-screen bg-purple-950 font-poppins text-white flex flex-col items-center py-12 px-4">
      <div className="flex items-center gap-4 mb-10 w-full max-w-4xl">
        <div className="h-px flex-1 bg-blue-400/50" />
        <h2 className="font-pixel text-4xl uppercase tracking-wider">Clubs</h2>
        <div className="h-px flex-1 bg-blue-400/50" />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl w-full">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-28 rounded-xl border border-blue-400/20 bg-purple-900/40 animate-pulse" />
          ))}
        </div>
      ) : clubs.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg">No clubs available yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-4xl w-full">
          {clubs.map((club) => {
            const { label, color } = getStatusDisplay(club);
            const clickable = isClickable(club);
            const policy = POLICY_BADGE[club.joinPolicy];

            return (
              <div
                key={club._id}
                onClick={() => handleClubClick(club)}
                className={`group relative p-6 rounded-xl border border-blue-400/30 bg-purple-900/50 flex flex-col gap-3 transition-all duration-200 ${
                  clickable
                    ? "cursor-pointer hover:border-blue-400 hover:bg-purple-900 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-900/30"
                    : "opacity-50 cursor-not-allowed"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-400/10 border border-blue-400/20 flex items-center justify-center flex-shrink-0">
                      <Users className="w-5 h-5 text-blue-400" />
                    </div>
                    <h3 className="font-pixel text-xl leading-tight">{club.name}</h3>
                  </div>
                  {clickable && (
                    <ChevronRight className="w-4 h-4 text-blue-400/40 group-hover:text-blue-400 transition-colors flex-shrink-0 mt-1" />
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${color}`}>
                    {label}
                  </span>
                  {club.membershipStatus === "NONE" && policy && (
                    <span className={`text-xs ${policy.color}`}>
                      {policy.label}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedClub && (
        <ClubInfo club={selectedClub} onClose={() => setSelectedClub(null)} />
      )}

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
