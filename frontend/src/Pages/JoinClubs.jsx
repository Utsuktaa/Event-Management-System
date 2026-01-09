import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users } from "lucide-react";

export default function JoinClubs() {
  const navigate = useNavigate();
  const [clubs, setClubs] = useState([]);

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
    } else {
      alert(`You clicked ${club.name} (student view)`);
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
            {club.isAdmin && (
              <span className="text-blue-400 font-pixel text-sm">
                You are admin
              </span>
            )}
            {!club.isAdmin && (
              <span className="text-gray-300 font-pixel text-sm">Student</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
