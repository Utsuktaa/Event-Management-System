import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users } from "lucide-react";
import ClubInfo from "../Components/ClubInfo";

export default function JoinClubs() {
  const navigate = useNavigate();
  const [clubs, setClubs] = useState([]);
  const [selectedClub, setSelectedClub] = useState(null);

  const [toast, setToast] = useState(null);
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];

    if (!token) return;

    fetch("http://localhost:5000/api/clubs", {
      headers: { Authorization: "Bearer " + token },
    })
      .then((res) => res.json())
      .then((data) => setClubs(data))
      .catch((err) => console.error(err));
  }, []);

  const handleClubClick = (club) => {
    if (club.isAdmin) {
      navigate(`/club-admin/${club._id}`);
      return;
    }

    if (club.membershipStatus === "approved") {
      navigate(`/clubs/${club._id}`);
    } else if (club.membershipStatus === "pending") {
      showToast("Your request to join is pending approval.", "error");
    } else {
      setSelectedClub(club);
    }
  };

  return (
    <div className="min-h-screen bg-purple-950 font-poppins text-white flex flex-col items-center py-12 px-4">
      <div className="flex items-center gap-4 mb-8">
        <div className="h-1 flex-1 bg-blue-400" />
        <h2 className="font-pixel text-4xl uppercase tracking-wider">Clubs</h2>
        <div className="h-1 flex-1 bg-blue-400" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl w-full">
        {clubs.map((club, i) => (
          <div
            key={club._id}
            onClick={() => handleClubClick(club)}
            className="p-6 border border-blue-400 bg-purple-950 cursor-pointer group transition-transform hover:translate-x-1 hover:-translate-y-1 flex flex-col gap-2"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="inline-flex items-center gap-3 mb-2">
              <Users className="w-6 h-6 text-blue-400" />
              <h3 className="font-pixel text-2xl">{club.name}</h3>
            </div>
            <span
              className={`${
                club.isAdmin
                  ? "text-blue-400"
                  : club.membershipStatus === "approved"
                  ? "text-green-400"
                  : club.membershipStatus === "pending"
                  ? "text-yellow-400"
                  : "text-gray-300"
              } font-pixel text-sm`}
            >
              {club.isAdmin
                ? "Admin"
                : club.membershipStatus === "approved"
                ? "Member"
                : club.membershipStatus === "pending"
                ? "Pending approval"
                : "Not a member"}
            </span>
          </div>
        ))}
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
    </div>
  );
}
