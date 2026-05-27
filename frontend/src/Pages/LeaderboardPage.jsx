import { useState, useEffect } from "react";
import axios from "axios";
import { Trophy, Medal, Award } from "lucide-react";
import { getTokenFromCookies } from "../Utils/auth";
import { API_BASE } from "../config";
import PageLayout from "../Components/PageLayout";

const rankIcon = (rank) => {
  if (rank === 1) return <Trophy className="w-4 h-4 text-yellow-500 stroke-[2.5]" />;
  if (rank === 2) return <Medal className="w-4 h-4 text-gray-400 stroke-[2.5]" />;
  if (rank === 3) return <Award className="w-4 h-4 text-amber-600 stroke-[2.5]" />;
  return <span className="text-xs font-bold text-gray-400">{rank}</span>;
};

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    const token = getTokenFromCookies();
    if (!token) return;
    axios
      .get(`${API_BASE}/api/leaderboard`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setLeaderboard(res.data.leaderboard || []);
        setCurrentUserId(res.data.currentUserId || null);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const currentUserIndex = leaderboard.findIndex((u) => u.userId === currentUserId);

  return (
    <PageLayout title="Leaderboard" role="user">
      <div className="px-6 py-10">
        <div className="max-w-[700px] mx-auto space-y-8">
            <section className="bg-white rounded-xl p-6 border border-purple-100">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "rgba(124,58,237,0.08)" }}>
                  <Trophy className="w-5 h-5 text-purple-500 stroke-[2.5]" />
                </div>
                <div>
                  <h1 className="text-base font-bold text-gray-900">Leaderboard</h1>
                  <p className="text-xs text-gray-400">Ranked by attendance rate</p>
                </div>
              </div>

              {currentUserIndex >= 0 && (
                <div className="mb-5 px-4 py-3 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-between">
                  <p className="text-sm font-semibold text-purple-700">Your rank</p>
                  <span className="text-lg font-bold text-purple-600">#{currentUserIndex + 1}</span>
                </div>
              )}

              {loading ? (
                <p className="text-sm text-gray-500">Loading leaderboard…</p>
              ) : leaderboard.length === 0 ? (
                <p className="text-sm text-gray-500">No attendance data yet.</p>
              ) : (
                <div className="space-y-2">
                  {leaderboard.map((user, i) => {
                    const isYou = user.userId === currentUserId;
                    const isExpanded = expanded === user.userId;
                    return (
                      <div
                        key={user.userId}
                        onClick={() => setExpanded(isExpanded ? null : user.userId)}
                        className={`rounded-2xl border px-4 py-3 cursor-pointer transition-all duration-150 ${
                          isYou
                            ? "bg-purple-600 border-purple-600 shadow-md"
                            : "bg-white border-purple-100 hover:border-purple-200 hover:shadow-sm"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-7 flex items-center justify-center shrink-0">
                            {rankIcon(i + 1)}
                          </div>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                            isYou ? "bg-white text-purple-600" : "bg-purple-100 text-purple-600"
                          }`}>
                            {user.name?.[0]?.toUpperCase() || "?"}
                          </div>
                          <p className={`flex-1 text-sm font-semibold truncate ${isYou ? "text-white" : "text-gray-900"}`}>
                            {user.name}
                            {isYou && <span className="text-purple-200 font-normal"> (You)</span>}
                          </p>
                          <span className={`text-sm font-bold shrink-0 ${isYou ? "text-white" : "text-purple-600"}`}>
                            {user.attendanceRate}%
                          </span>
                        </div>

                        {isExpanded && (
                          <div className={`mt-3 pt-3 border-t grid grid-cols-3 gap-2 text-center ${isYou ? "border-purple-400" : "border-purple-100"}`}>
                            <div>
                              <p className={`text-sm font-bold ${isYou ? "text-white" : "text-gray-900"}`}>{user.attended}</p>
                              <p className={`text-xs ${isYou ? "text-purple-200" : "text-gray-400"}`}>attended</p>
                            </div>
                            <div>
                              <p className={`text-sm font-bold ${isYou ? "text-white" : "text-gray-900"}`}>{user.registered}</p>
                              <p className={`text-xs ${isYou ? "text-purple-200" : "text-gray-400"}`}>registered</p>
                            </div>
                            <div>
                              <p className={`text-sm font-bold ${isYou ? "text-white" : "text-purple-600"}`}>{user.attendanceRate}%</p>
                              <p className={`text-xs ${isYou ? "text-purple-200" : "text-gray-400"}`}>rate</p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        </div>
    </PageLayout>
  );
}
