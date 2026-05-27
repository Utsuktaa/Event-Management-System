import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { ChevronDown, ChevronUp, Trophy, Users, Calendar, MessageSquare, Star, Zap, HelpCircle, X } from "lucide-react";
import { getTokenFromCookies } from "../Utils/auth";
import { API_BASE } from "../config";
import Sidebar from "../Components/Sidebar";

function getLevelColor(level) {
  const colors = ["#A78BFA","#818CF8","#60A5FA","#34D399","#FBBF24","#F87171","#C084FC"];
  return colors[(level - 1) % colors.length];
}

function ProgressBar({ value, max, color }) {
  const pct = max ? Math.min(100, Math.round((value / max) * 100)) : 100;
  return (
    <div className="w-full rounded-full overflow-hidden" style={{ height: 8, background: "rgba(124,58,237,0.10)" }}>
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${pct}%`, background: color || "linear-gradient(90deg,#7C3AED,#A78BFA)" }}
      />
    </div>
  );
}

function BadgeCard({ badge, onClick }) {
  return (
    <button
      onClick={() => onClick(badge)}
      className="flex flex-col items-center gap-2 p-4 rounded-2xl border text-center transition-all duration-200 cursor-pointer"
      style={
        badge.unlocked
          ? { background: "linear-gradient(135deg,#faf5ff,#f5f3ff)", border: "1.5px solid rgba(124,58,237,0.25)", boxShadow: "0 2px 12px rgba(124,58,237,0.10)" }
          : { background: "#f9fafb", border: "1.5px solid #E5E7EB", opacity: 0.55 }
      }
      onMouseEnter={(e) => { if (badge.unlocked) e.currentTarget.style.transform = "scale(1.04)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
    >
      <span className="text-3xl" style={{ filter: badge.unlocked ? "none" : "grayscale(1)" }}>{badge.icon}</span>
      <p className="text-xs font-bold" style={{ color: badge.unlocked ? "#7C3AED" : "#9CA3AF" }}>{badge.name}</p>
      <p className="text-xs" style={{ color: badge.unlocked ? "#6B7280" : "#D1D5DB" }}>{badge.description}</p>
      {!badge.unlocked && (
        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#F3F4F6", color: "#9CA3AF" }}>Locked</span>
      )}
    </button>
  );
}

function BadgeModal({ badge, onClose }) {
  if (!badge) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.35)" }} onClick={onClose}>
      <div
        className="relative rounded-2xl p-6 max-w-sm w-full"
        style={{ background: "#fff", boxShadow: "0 20px 60px rgba(124,58,237,0.18)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X className="w-4 h-4" />
        </button>
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="text-5xl" style={{ filter: badge.unlocked ? "none" : "grayscale(1)" }}>{badge.icon}</span>
          <h3 className="text-lg font-bold" style={{ color: "#1E3A8A" }}>{badge.name}</h3>
          <p className="text-sm text-gray-600">{badge.description}</p>
          <div className="w-full rounded-xl p-3 mt-1" style={{ background: "rgba(124,58,237,0.06)" }}>
            <p className="text-xs font-semibold text-purple-600 mb-1">Requirement</p>
            <p className="text-xs text-gray-500">
              {badge.conditionType === "xp" && `Reach ${badge.conditionValue} XP`}
              {badge.conditionType === "events_attended" && `Attend ${badge.conditionValue} event${badge.conditionValue > 1 ? "s" : ""}`}
              {badge.conditionType === "clubs_joined" && `Join ${badge.conditionValue} club${badge.conditionValue > 1 ? "s" : ""}`}
              {badge.conditionType === "streak" && `Maintain a ${badge.conditionValue}-day streak`}
              {badge.conditionType === "first_club" && "Join your first club"}
              {badge.conditionType === "early_bird" && "Register for an event within 1 hour of it being posted"}
            </p>
          </div>
          {badge.unlocked ? (
            <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: "rgba(124,58,237,0.10)", color: "#7C3AED" }}>
              ✓ Unlocked
            </span>
          ) : (
            <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: "#F3F4F6", color: "#9CA3AF" }}>
              🔒 Locked
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function ConfirmModal({ title, message, confirmLabel, confirmStyle, onConfirm, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.35)" }} onClick={onClose}>
      <div
        className="relative rounded-2xl p-6 max-w-sm w-full"
        style={{ background: "#fff", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-base font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-500 mb-5">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all duration-150 hover:opacity-90 active:scale-95"
            style={confirmStyle}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

const XP_ACTIONS = [
  { icon: "🏛️", action: "Join a club",         xp: "+15 XP" },
  { icon: "📅", action: "Register for event",  xp: "+5 XP"  },
  { icon: "✅", action: "Attend an event",      xp: "+20 XP" },
  { icon: "💬", action: "Post a discussion",    xp: "+10 XP" },
  { icon: "↩️", action: "Comment / reply",      xp: "+5 XP"  },
  { icon: "⚡", action: "Daily activity bonus", xp: "+5 XP"  },
];

export default function StatsPage() {
  const [stats, setStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lbLoading, setLbLoading] = useState(true);
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [lbPeriod, setLbPeriod] = useState("all");
  const [modal, setModal] = useState(null);

  const token = getTokenFromCookies();

  const fetchStats = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API_BASE}/api/stats/me`, { headers: { Authorization: `Bearer ${token}` } });
      setStats(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchLeaderboard = useCallback(async () => {
    if (!token) return;
    setLbLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/stats/leaderboard?period=${lbPeriod}`, { headers: { Authorization: `Bearer ${token}` } });
      setLeaderboard(res.data.leaderboard || []);
      setCurrentUserId(res.data.currentUserId || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLbLoading(false);
    }
  }, [token, lbPeriod]);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { fetchLeaderboard(); }, [fetchLeaderboard]);

  const handleJoinLeaderboard = async () => {
    try {
      await axios.post(`${API_BASE}/api/stats/leaderboard/join`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setStats((s) => ({ ...s, isInLeaderboard: true }));
      fetchLeaderboard();
    } catch (err) { console.error(err); }
    setModal(null);
  };

  const handleLeaveLeaderboard = async () => {
    try {
      await axios.post(`${API_BASE}/api/stats/leaderboard/leave`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setStats((s) => ({ ...s, isInLeaderboard: false }));
      fetchLeaderboard();
    } catch (err) { console.error(err); }
    setModal(null);
  };

  const levelColor = stats ? getLevelColor(stats.level) : "#7C3AED";
  const xpIntoLevel = stats ? (stats.nextLevelXP ? stats.xp - getPrevLevelXP(stats.level) : stats.xp) : 0;
  const xpNeeded = stats ? (stats.nextLevelXP ? stats.nextLevelXP - getPrevLevelXP(stats.level) : 1) : 1;

  const unlockedBadges = stats?.badges?.filter((b) => b.unlocked) || [];
  const nextBadge = stats?.badges?.find((b) => !b.unlocked);

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  return (
    <div className="min-h-screen font-sans flex" style={{ background: "linear-gradient(160deg,#f5f3ff 0%,#faf5ff 50%,#f0f9ff 100%)" }}>
      <Sidebar role="user" />
      <div className="flex-1 flex flex-col ml-56">
        <header className="px-8 py-4 border-b" style={{ background: "rgba(255,255,255,0.92)", borderColor: "rgba(124,58,237,0.08)" }}>
          <h1 className="text-lg font-semibold" style={{ color: "#1E3A8A" }}>Stats & Achievements</h1>
        </header>

        <main className="flex-1 px-6 py-8">
          <div className="max-w-[960px] mx-auto space-y-8">

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 rounded-full border-2 border-purple-200 border-t-purple-500 animate-spin" />
              </div>
            ) : stats ? (
              <>
                <section
                  className="rounded-2xl p-6"
                  style={{ background: "linear-gradient(135deg,#7C3AED 0%,#A78BFA 60%,#C4B5FD 100%)", boxShadow: "0 8px 32px rgba(124,58,237,0.22)" }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black flex-shrink-0"
                      style={{ background: "rgba(255,255,255,0.22)", color: "#fff", boxShadow: "0 2px 12px rgba(0,0,0,0.12)" }}
                    >
                      {stats.level}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-white text-xl font-black">Level {stats.level}</span>
                        <span className="text-purple-200 text-sm font-semibold">· {stats.levelTitle}</span>
                      </div>
                      <div className="flex items-center gap-4 mb-3">
                        <span className="text-white text-sm font-bold">🔥 {stats.xp} XP</span>
                        <span className="text-purple-100 text-sm font-semibold">⚡ {stats.streak}-day streak</span>
                      </div>
                      {stats.nextLevelXP ? (
                        <>
                          <ProgressBar value={xpIntoLevel} max={xpNeeded} color="rgba(255,255,255,0.85)" />
                          <p className="text-purple-100 text-xs mt-1.5">{stats.nextLevelXP - stats.xp} XP to Level {stats.level + 1}</p>
                        </>
                      ) : (
                        <p className="text-purple-100 text-xs mt-1">Max level reached 🎉</p>
                      )}
                    </div>
                    <div className="flex gap-3 sm:flex-col">
                      {[
                        { label: "Events Attended", value: stats.stats.eventsAttended },
                        { label: "Clubs Joined",    value: stats.stats.clubsJoined    },
                        { label: "Registered",      value: stats.stats.eventsRegistered },
                      ].map(({ label, value }) => (
                        <div key={label} className="text-center px-3 py-2 rounded-xl" style={{ background: "rgba(255,255,255,0.15)" }}>
                          <p className="text-white text-lg font-black">{value}</p>
                          <p className="text-purple-100 text-xs">{label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                {nextBadge && (
                  <div
                    className="rounded-2xl px-5 py-4 flex items-center gap-4"
                    style={{ background: "linear-gradient(135deg,rgba(167,139,250,0.12),rgba(196,181,253,0.18))", border: "1.5px solid rgba(124,58,237,0.18)" }}
                  >
                    <span className="text-2xl" style={{ filter: "grayscale(1)", opacity: 0.6 }}>{nextBadge.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold" style={{ color: "#7C3AED" }}>Next badge: {nextBadge.name}</p>
                      <p className="text-xs text-gray-500">{nextBadge.description}</p>
                    </div>
                    <span className="text-xs font-semibold px-3 py-1 rounded-full flex-shrink-0" style={{ background: "rgba(124,58,237,0.10)", color: "#7C3AED" }}>
                      Keep going!
                    </span>
                  </div>
                )}

                <section>
                  <h2 className="text-base font-bold mb-4" style={{ color: "#1E3A8A" }}>Achievements</h2>
                  {stats.badges.length === 0 ? (
                    <div className="text-center py-10 rounded-2xl border border-purple-100 bg-white">
                      <p className="text-gray-400 text-sm">No achievements yet. Start exploring!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                      {stats.badges.map((badge) => (
                        <BadgeCard key={badge._id} badge={badge} onClick={setSelectedBadge} />
                      ))}
                    </div>
                  )}
                </section>

                <section className="bg-white rounded-2xl border border-purple-100 overflow-hidden" style={{ boxShadow: "0 2px 16px rgba(124,58,237,0.07)" }}>
                  <div className="px-6 py-5 border-b border-purple-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(124,58,237,0.08)" }}>
                        <Trophy className="w-5 h-5 text-purple-500" strokeWidth={2.5} />
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-gray-900">Leaderboard</h2>
                        <p className="text-xs text-gray-400">Ranked by XP</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex rounded-xl overflow-hidden border border-purple-100">
                        {["all", "monthly"].map((p) => (
                          <button
                            key={p}
                            onClick={() => setLbPeriod(p)}
                            className="px-3 py-1.5 text-xs font-semibold transition-colors capitalize"
                            style={lbPeriod === p ? { background: "#7C3AED", color: "#fff" } : { background: "#fff", color: "#6B7280" }}
                          >
                            {p === "all" ? "All-time" : "Monthly"}
                          </button>
                        ))}
                      </div>
                      {stats.isInLeaderboard ? (
                        <button
                          onClick={() => setModal("leave")}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors"
                          style={{ border: "1px solid #FCA5A5", color: "#DC2626", background: "#FFF5F5" }}
                        >
                          Leave
                        </button>
                      ) : (
                        <button
                          onClick={() => setModal("join")}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold text-white transition-all hover:opacity-90"
                          style={{ background: "linear-gradient(135deg,#7C3AED,#A78BFA)" }}
                        >
                          Join
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="px-6 py-5">
                    {!stats.isInLeaderboard && leaderboard.length === 0 ? (
                      <div className="text-center py-8">
                        <Trophy className="w-10 h-10 text-purple-200 mx-auto mb-3" strokeWidth={1.5} />
                        <p className="text-sm font-semibold text-gray-700 mb-1">Join the leaderboard to compete</p>
                        <p className="text-xs text-gray-400 mb-4">Your XP will be visible to others</p>
                        <button
                          onClick={() => setModal("join")}
                          className="px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
                          style={{ background: "linear-gradient(135deg,#7C3AED,#A78BFA)" }}
                        >
                          Join Leaderboard
                        </button>
                      </div>
                    ) : lbLoading ? (
                      <p className="text-sm text-gray-400 py-4 text-center">Loading…</p>
                    ) : leaderboard.length === 0 ? (
                      <p className="text-sm text-gray-400 py-4 text-center">No participants yet.</p>
                    ) : (
                      <>
                        {top3.length > 0 && (
                          <div className="flex items-end justify-center gap-3 mb-6">
                            {[top3[1], top3[0], top3[2]].filter(Boolean).map((user, idx) => {
                              const podiumOrder = [top3[1], top3[0], top3[2]];
                              const rank = podiumOrder.indexOf(user) === 1 ? 1 : podiumOrder.indexOf(user) === 0 ? 2 : 3;
                              const heights = { 1: "h-24", 2: "h-16", 3: "h-12" };
                              const emojis = { 1: "🥇", 2: "🥈", 3: "🥉" };
                              const bgColors = {
                                1: "linear-gradient(135deg,#FBBF24,#F59E0B)",
                                2: "linear-gradient(135deg,#9CA3AF,#6B7280)",
                                3: "linear-gradient(135deg,#D97706,#B45309)",
                              };
                              return (
                                <div key={user.userId} className="flex flex-col items-center gap-1.5 flex-1 max-w-[120px]">
                                  <span className="text-lg">{emojis[rank]}</span>
                                  <div
                                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black text-white"
                                    style={{ background: bgColors[rank] }}
                                  >
                                    {user.name?.[0]?.toUpperCase()}
                                  </div>
                                  <p className="text-xs font-bold text-gray-800 truncate max-w-full text-center">{user.name}{user.isYou && " (You)"}</p>
                                  <p className="text-xs font-semibold text-purple-600">{user.xp} XP</p>
                                  <div
                                    className={`w-full rounded-t-xl ${heights[rank]}`}
                                    style={{ background: rank === 1 ? "linear-gradient(180deg,rgba(251,191,36,0.25),rgba(251,191,36,0.08))" : "rgba(124,58,237,0.06)", border: "1.5px solid", borderColor: rank === 1 ? "rgba(251,191,36,0.4)" : "rgba(124,58,237,0.12)" }}
                                  />
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {rest.length > 0 && (
                          <div className="space-y-2">
                            {rest.map((user) => (
                              <div
                                key={user.userId}
                                className="flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all duration-150"
                                style={user.isYou
                                  ? { background: "#7C3AED", border: "1.5px solid #7C3AED" }
                                  : { background: "#fff", border: "1.5px solid rgba(124,58,237,0.10)" }
                                }
                              >
                                <span className="text-xs font-bold w-6 text-center flex-shrink-0" style={{ color: user.isYou ? "rgba(255,255,255,0.7)" : "#9CA3AF" }}>
                                  #{user.rank}
                                </span>
                                <div
                                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                                  style={{ background: user.isYou ? "rgba(255,255,255,0.2)" : "rgba(124,58,237,0.10)", color: user.isYou ? "#fff" : "#7C3AED" }}
                                >
                                  {user.name?.[0]?.toUpperCase()}
                                </div>
                                <p className="flex-1 text-sm font-semibold truncate" style={{ color: user.isYou ? "#fff" : "#111827" }}>
                                  {user.name}{user.isYou && <span style={{ color: "rgba(255,255,255,0.6)", fontWeight: 400 }}> (You)</span>}
                                </p>
                                <span className="text-sm font-bold flex-shrink-0" style={{ color: user.isYou ? "#fff" : "#7C3AED" }}>
                                  {user.xp} XP
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </section>

                <section className="bg-white rounded-2xl border border-purple-100 overflow-hidden" style={{ boxShadow: "0 2px 16px rgba(124,58,237,0.07)" }}>
                  <button
                    onClick={() => setHelpOpen((v) => !v)}
                    className="w-full flex items-center justify-between px-6 py-4 transition-colors hover:bg-purple-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(124,58,237,0.08)" }}>
                        <HelpCircle className="w-4 h-4 text-purple-500" strokeWidth={2.5} />
                      </div>
                      <span className="text-sm font-bold text-gray-900">How XP Works</span>
                    </div>
                    {helpOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </button>
                  {helpOpen && (
                    <div className="px-6 pb-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {XP_ACTIONS.map(({ icon, action, xp }) => (
                        <div
                          key={action}
                          className="flex items-center gap-3 px-4 py-3 rounded-xl"
                          style={{ background: "linear-gradient(135deg,rgba(124,58,237,0.05),rgba(167,139,250,0.08))", border: "1px solid rgba(124,58,237,0.10)" }}
                        >
                          <span className="text-xl flex-shrink-0">{icon}</span>
                          <p className="flex-1 text-sm text-gray-700">{action}</p>
                          <span className="text-sm font-black flex-shrink-0" style={{ color: "#7C3AED" }}>{xp}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </>
            ) : (
              <p className="text-sm text-gray-500 text-center py-20">Failed to load stats.</p>
            )}
          </div>
        </main>
      </div>

      {selectedBadge && <BadgeModal badge={selectedBadge} onClose={() => setSelectedBadge(null)} />}

      {modal === "join" && (
        <ConfirmModal
          title="Join Leaderboard?"
          message="Your XP and name will be visible to other users on the leaderboard."
          confirmLabel="Join"
          confirmStyle={{ background: "linear-gradient(135deg,#7C3AED,#A78BFA)" }}
          onConfirm={handleJoinLeaderboard}
          onClose={() => setModal(null)}
        />
      )}
      {modal === "leave" && (
        <ConfirmModal
          title="Leave Leaderboard?"
          message="You will be removed from the rankings. You can rejoin anytime."
          confirmLabel="Leave"
          confirmStyle={{ background: "#DC2626" }}
          onConfirm={handleLeaveLeaderboard}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}

function getPrevLevelXP(level) {
  const thresholds = [0, 0, 50, 150, 300, 500, 750, 1000];
  return thresholds[level] ?? 0;
}
