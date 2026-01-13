import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Toast from "../components/Toast";
import { getTokenFromCookies } from "../Utils/auth";

export default function ClubAdminRequests() {
  const { clubId } = useParams();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchRequests = async () => {
    try {
      const token = getTokenFromCookies();
      const res = await axios.get(
        `http://localhost:5000/api/clubs/${clubId}/requests`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setRequests(res.data);
    } catch (err) {
      showToast("Failed to load join requests", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [clubId]);

  const approveRequest = async (memberId) => {
    try {
      const token = getTokenFromCookies();
      await axios.patch(
        `http://localhost:5000/api/clubs/${clubId}/requests/${memberId}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showToast("Member approved");
      setRequests((prev) => prev.filter((r) => r._id !== memberId));
    } catch (err) {
      showToast("Approval failed", "error");
    }
  };

  return (
    <div className="min-h-screen bg-purple-950 text-white px-6 py-16">
      <h1 className="font-pixel text-3xl mb-6">Pending Join Requests</h1>

      {loading ? (
        <p>Loading...</p>
      ) : requests.length === 0 ? (
        <p>No pending requests</p>
      ) : (
        <ul className="space-y-4 max-w-xl">
          {requests.map((req) => (
            <li
              key={req._id}
              className="p-4 border border-blue-400 bg-purple-900 rounded flex justify-between items-center"
            >
              <div>
                <p className="font-pixel">{req.userId.name}</p>
                <p className="text-sm text-gray-300">{req.userId.email}</p>
              </div>

              <button
                onClick={() => approveRequest(req._id)}
                className="px-4 py-2 border border-blue-400 font-pixel hover:bg-blue-400 hover:text-purple-950"
              >
                Approve
              </button>
            </li>
          ))}
        </ul>
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
