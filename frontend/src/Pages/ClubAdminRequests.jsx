import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Check, X } from "lucide-react";
import Toast from "../Components/Toast";
import PageLayout from "../Components/PageLayout";
import { getTokenFromCookies } from "../Utils/auth";
const API = import.meta.env.VITE_API_URL;

export default function ClubAdminRequests() {
  const { clubId } = useParams();
  const navigate = useNavigate();
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
      const res = await axios.get(`${API}/api/clubs/${clubId}/requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(res.data);
    } catch {
      showToast("Failed to load join requests", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, [clubId]);

  const approveRequest = async (memberId) => {
    try {
      const token = getTokenFromCookies();
      await axios.patch(
        `${API}/api/clubs/${clubId}/requests/${memberId}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      showToast("Member approved");
      setRequests((prev) => prev.filter((r) => r._id !== memberId));
    } catch {
      showToast("Approval failed", "error");
    }
  };

  const rejectRequest = async (memberId) => {
    try {
      const token = getTokenFromCookies();
      await axios.patch(
        `${API}/api/clubs/${clubId}/requests/${memberId}/reject`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      showToast("Request rejected");
      setRequests((prev) => prev.filter((r) => r._id !== memberId));
    } catch {
      showToast("Rejection failed", "error");
    }
  };

  return (
    <PageLayout title="Join Requests" role="user">
      <div className="px-8 py-8">
        <div className="max-w-2xl mx-auto space-y-4">
          <button
            onClick={() => navigate(`/clubs/${clubId}`)}
            className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-purple-600 transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to club
          </button>

          {loading ? (
            <div className="py-10 text-center text-sm text-gray-400">Loading…</div>
          ) : requests.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm text-gray-400">No pending join requests.</p>
            </div>
          ) : (
            requests.map((req) => (
              <div
                key={req._id}
                className="flex items-center justify-between p-4 bg-white rounded-xl border border-purple-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white bg-gradient-to-br from-purple-500 to-indigo-500 flex-shrink-0">
                    {req.userId?.name?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{req.userId?.name}</p>
                    <p className="text-xs text-gray-400">{req.userId?.email}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => approveRequest(req._id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold bg-purple-600 text-white hover:bg-purple-700 transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Approve
                  </button>
                  <button
                    onClick={() => rejectRequest(req._id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </PageLayout>
  );
}
