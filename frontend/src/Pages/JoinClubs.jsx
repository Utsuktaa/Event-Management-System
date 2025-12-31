import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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
      // student view placeholder for now
      alert(`You clicked ${club.name} (student view)`);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Clubs</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {clubs.map((club) => (
          <div
            key={club._id}
            onClick={() => handleClubClick(club)}
            className="p-4 border rounded-lg cursor-pointer hover:bg-gray-100"
          >
            <h3 className="font-semibold">{club.name}</h3>
            {club.isAdmin && (
              <p className="text-sm text-green-600">You are admin</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
