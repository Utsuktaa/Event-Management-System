import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  ChevronDown, ChevronUp, Trophy, HelpCircle, X,
  Flame, Zap, Users, Calendar, MessageSquare, Award,
  Lock, CheckCircle, TrendingUp, BookOpen, Layers,
} from "lucide-react";
import { getTokenFromCookies } from "../Utils/auth";
import { API_BASE } from "../config";
import Sidebar from "../Components/Sidebar";
import NavbarXP from "../Components/NavbarXP";

const BADGE_ICONS = {
  first_club:      <Users className="w-6 h-6" />,
  clubs_joined:    <Layers className="w-6 h-6" />,
  events_attended: <Calendar className="w-6 h-6" />,
  xp:              <TrendingUp className="w-6 h-6" />,
  streak:          <Flame className="w-6 h-6" />,
  early_bird:      <Zap className="w-6 h-6" />,
};

const XP_ACTION_ICONS = [
  { Icon: Users,         action: "Join a club",          xp: "+15 XP" },
  { Icon: Calendar,      action: "Register for event",   xp: "+5 XP"  },
  { Icon: CheckCircle,   action: "Attend an event",      xp: "+20 XP" },
  { Icon: MessageSquare, action: "Post a discussion",    xp: "+10 XP" },
  { Icon: BookOpen,      action: "Comment / reply",      xp: "+5 XP"  },
  { Icon: Zap,           action: "Daily activity bonus", xp: "+5 XP"  },
];

const PODIUM_COLORS = {
  1: "linear-gradient(135deg,#FBBF24,#F59E0B)",
  2: "linear-gradient(135deg,#9CA3AF,#6B7280)",
  3: "linear-gradient(135deg,#D97706,#B45309)",
};

function getBadgeRequirement(badge) {
  const v = badge.conditionValue;
  switch (badge.conditionType) {
    case "xp":              return `Earn ${v} XP`;
    case "events_attended": return v === 1 ? "Attend 1 event" : `Attend ${v} events`;
    case "clubs_joined":    return v === 1 ? "Join 1 club" : `Join ${v} clubs`;
    case "streak":          return `Keep a ${v}-day activity streak`;
    case "first_club":      return "Join your first club";
    case "posts":           return v === 1 ? "Post 1 discussion" : `Post ${v} discussions`;
    case "replies":         return v === 1 ? "Reply to 1 post" : `Reply to ${v} posts`;
    case "early_bird":      return "Register for an event within 1 hour of it being posted";
    case "host_event":      return v === 1 ? "Host 1 event" : `Host ${v} events`;
    default:                return badge.description;
  }
}

function ProgressBar({ value, max, color }) {
  const pct = max ? Math.min(100, Math.round((value / max) * 100)) : 100;
  return (
    <div className="w-full h-2 rounded-full overflow-hidden bg-white/20">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${pct}%`, background: color || "linear-gradient(90deg,#7C3AED,#A78BFA)" }}
      />
    </div>
  );
}

function BadgeCard({ badge, onClick }) {
  const iconEl = BADGE_ICONS[badge.conditionType] || <Award className="w-6 h-6" />;
  const requirement = getBadgeRequirement(badge);
  return (
    <button
      onClick={() => onClick(badge)}
      className={`flex flex-col items-center gap-2 p-4 rounded-2xl border text-center transition-all duration-200 cursor-pointer hover:scale-[1.04] ${
        badge.unlocked
          ? "bg-purple-50 border-purple-200 shadow-sm"
          : "bg-gray-50 border-gray-200 opacity-50"
      }`}
    >
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
        badge.unlocked ? "bg-purple-100 text-purple-600" : "bg-gray-100 text-gray-300 grayscale"
      }`}>
        {iconEl}
      </div>
      <p className={`text-xs font-bold leading-tight ${badge.unlocked ? "text-purple-700" : "text-gray-400"}`}>{badge.name}</p>
      <p className={`text-xs leading-tight ${badge.unlocked ? "text-gray-500" : "text-gray-300"}`}>{requirement}</p>
      {!badge.unlocked && (
        <div className="flex items-center gap-1">
          <Lock className="w-2.5 h-2.5 text-gray-400" />
          <span className="text-xs text-gray-400">Locked</span>
        </div>
      )}
    </button>
  );
}

function BadgeModal({ badge, onClose }) {
  if (!badge) return null;
  const iconEl = BADGE_ICONS[badge.conditionType] || <Award className="w-8 h-8" />;
  const requirement = getBadgeRequirement(badge);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/35" onClick={onClose}>
      <div className="relative rounded-2xl p-6 max-w-sm w-full bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X className="w-4 h-4" />
        </button>
        <div className="flex flex-col items-center gap-3 text-center">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
            badge.unlocked ? "bg-purple-100 text-purple-600" : "bg-gray-100 text-gray-300 grayscale"
          }`}>
            {iconEl}
          </div>
          <h3 className="text-lg font-bold text-blue-900">{badge.name}</h3>
          <p className="text-sm text-gray-500">{badge.description}</p>
          <div className="w-full rounded-xl p-3 bg-purple-50 border border-purple-100">
            <p className="text-xs font-semibold text-purple-600 mb-1">How to earn</p>
            <p className="text-sm font-medium text-gray-700">{requirement}</p>
          </div>
          {badge.unlocked ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100">
              <CheckCircle className="w-3 h-3 text-purple-600" />
              <span className="text-xs font-semibold text-purple-700">Unlocked</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100">
              <Lock className="w-3 h-3 text-gray-400" />
              <span className="text-xs font-semibold text-gray-400">Locked</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ConfirmModal({ title, message, confirmLabel, confirmStyle, onConfirm, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/35" onClick={onClose}>
      <div className="relative rounded-2xl p-6 max-w-sm w-full bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
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

const XP_ACTIONS = XP_ACTION_ICONS;

export default function StatsPage() {
  const [stats, setStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
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

  const xpIntoLevel = stats ? (stats.nextLevelXP ? stats.xp - getPrevLevelXP(stats.level) : stats.xp) : 0;
  const xpNeeded = stats ? (stats.nextLevelXP ? stats.nextLevelXP - getPrevLevelXP(stats.level) : 1) : 1;
  const nextBadge = stats?.badges?.find((b) => !b.unlocked);
  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  return (
    <div className="min-h-screen font-sans flex bg-gradient-to-br from-purple-50 via-fuchsia-50 to-sky-50">
      <Sidebar role="user" />
      <div className="flex-1 flex flex-col ml-56">
        <header className="px-8 py-4 border-b border-purple-100 bg-white/90 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-blue-900">Stats & Achievements</h1>
          <NavbarXP />
        </header>

        <main className="flex-1 px-6 py-8">
          <div className="max-w-[960px] mx-auto space-y-8">

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 rounded-full border-2 border-purple-200 border-t-purple-500 animate-spin" />
              </div>
            ) : stats ? (
              <>
                <section className="rounded-2xl p-6 bg-gradient-to-br from-purple-600 via-purple-400 to-violet-300 shadow-xl shadow-purple-200">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black flex-shrink-0 bg-white/20 text-white shadow-md">
                      {stats.level}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-white text-xl font-black">Level {stats.level}</span>
                        <span className="text-purple-200 text-sm font-semibold">· {stats.levelTitle}</span>
                      </div>
                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center gap-1.5">
                          <Flame className="w-3.5 h-3.5 text-yellow-200" strokeWidth={2.5} />
                          <span className="text-white text-sm font-bold">{stats.xp} XP</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5 text-purple-200" strokeWidth={2.5} />
                          <span className="text-purple-100 text-sm font-semibold">{stats.streak}-day streak</span>
                        </div>
                      </div>
                      {stats.nextLevelXP ? (
                        <>
                          <ProgressBar value={xpIntoLevel} max={xpNeeded} color="rgba(255,255,255,0.85)" />
                          <p className="text-purple-100 text-xs mt-1.5">{stats.nextLevelXP - stats.xp} XP to Level {stats.level + 1}</p>
                        </>
                      ) : (
                        <p className="text-purple-100 text-xs mt-1">Max level reached — Elite!</p>
                      )}
                    </div>
                    <div className="flex gap-3 sm:flex-col">
                      {[
                        { label: "Events Attended", value: stats.stats.eventsAttended },
                        { label: "Clubs Joined",    value: stats.stats.clubsJoined    },
                        { label: "Registered",      value: stats.stats.eventsRegistered },
                      ].map(({ label, value }) => (
                        <div key={label} className="text-center px-3 py-2 rounded-xl bg-white/15">
                          <p className="text-white text-lg font-black">{value}</p>
                          <p className="text-purple-100 text-xs">{label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                {nextBadge && (
                  <div className="rounded-2xl px-5 py-4 flex items-center gap-4 bg-purple-50 border border-purple-200">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-gray-100 text-gray-300 grayscale">
                      {BADGE_ICONS[nextBadge.conditionType] || <Award className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-purple-700">Next: {nextBadge.name}</p>
                      <p className="text-xs text-gray-500">{getBadgeRequirement(nextBadge)}</p>
                    </div>
                    <span className="text-xs font-semibold px-3 py-1 rounded-full flex-shrink-0 bg-purple-100 text-purple-700">
                      Keep going!
                    </span>
                  </div>
                )}

                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-bold text-blue-900">Achievements</h2>
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-purple-100 text-purple-700">
                      {stats.badges.filter((b) => b.unlocked).length} / {stats.badges.length} unlocked
                    </span>
                  </div>
                  {stats.badges.length === 0 ? (
                    <div className="text-center py-10 rounded-2xl border border-purple-100 bg-white">
                      <Award className="w-10 h-10 text-purple-200 mx-auto mb-3" strokeWidth={1.5} />
                      <p className="text-sm text-gray-400 mb-1">No badges loaded yet.</p>
                      <p className="text-xs text-gray-400">Run <code className="bg-gray-100 px-1 rounded">POST /api/stats/seed-badges</code> once to populate.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                      {stats.badges.map((badge) => (
                        <BadgeCard key={badge._id} badge={badge} onClick={setSelectedBadge} />
                      ))}
                    </div>
                  )}
                </section>

                <section className="bg-white rounded-2xl border border-purple-100 overflow-hidden shadow-sm">
                  <div className="px-6 py-5 border-b border-purple-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-purple-100">
                        <Trophy className="w-5 h-5 text-purple-600" strokeWidth={2.5} />
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
                            className={`px-3 py-1.5 text-xs font-semibold transition-colors capitalize ${
                              lbPeriod === p ? "bg-purple-600 text-white" : "bg-white text-gray-500 hover:bg-purple-50"
                            }`}
                          >
                            {p === "all" ? "All-time" : "Monthly"}
                          </button>
                        ))}
                      </div>
                      {stats.isInLeaderboard ? (
                        <button
                          onClick={() => setModal("leave")}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                        >
                          Leave
                        </button>
                      ) : (
                        <button
                          onClick={() => setModal("join")}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 transition-colors"
                        >
                          Join
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="px-6 py-5">
                    {!stats.isInLeaderboard ? (
                      <div className="relative">
                        <div className="space-y-2 pointer-events-none select-none blur-sm opacity-40">
                          {[{ rank: 1, xp: 480 }, { rank: 2, xp: 360 }, { rank: 3, xp: 290 }].map((u) => (
                            <div key={u.rank} className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-purple-100 bg-white">
                              <span className="text-xs font-bold w-6 text-center text-gray-400">#{u.rank}</span>
                              <div className="w-8 h-8 rounded-full bg-purple-100" />
                              <div className="flex-1 h-3 rounded-full bg-gray-100" />
                              <span className="text-sm font-bold text-purple-600">{u.xp} XP</span>
                            </div>
                          ))}
                        </div>
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                          <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-purple-100">
                            <Lock className="w-6 h-6 text-purple-500" />
                          </div>
                          <p className="text-sm font-semibold text-gray-700">Join to see the leaderboard</p>
                          <p className="text-xs text-gray-400">Your XP will be visible to others</p>
                          <button
                            onClick={() => setModal("join")}
                            className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 transition-colors active:scale-95"
                          >
                            Join Leaderboard
                          </button>
                        </div>
                      </div>
                    ) : lbLoading ? (
                      <p className="text-sm text-gray-400 py-4 text-center">Loading…</p>
                    ) : leaderboard.length === 0 ? (
                      <p className="text-sm text-gray-400 py-4 text-center">No participants yet.</p>
                    ) : (
                      <>
                        {top3.length > 0 && (
                          <div className="flex items-end justify-center gap-3 mb-6">
                            {[top3[1], top3[0], top3[2]].filter(Boolean).map((user) => {
                              const podiumOrder = [top3[1], top3[0], top3[2]];
                              const rank = podiumOrder.indexOf(user) === 1 ? 1 : podiumOrder.indexOf(user) === 0 ? 2 : 3;
                              const heights = { 1: "h-24", 2: "h-16", 3: "h-12" };
                              const avatarColors = { 1: "bg-gradient-to-br from-yellow-400 to-amber-500", 2: "bg-gradient-to-br from-gray-400 to-gray-500", 3: "bg-gradient-to-br from-amber-600 to-amber-700" };
                              const rankIconEl = rank === 1
                                ? <Trophy className="w-4 h-4 text-yellow-400" />
                                : <Award className={`w-4 h-4 ${rank === 2 ? "text-gray-400" : "text-amber-600"}`} />;
                              return (
                                <div key={user.userId} className="flex flex-col items-center gap-1.5 flex-1 max-w-[120px]">
                                  {rankIconEl}
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black text-white ${avatarColors[rank]}`}>
                                    {user.name?.[0]?.toUpperCase()}
                                  </div>
                                  <p className="text-xs font-bold text-gray-800 truncate max-w-full text-center">{user.name}{user.isYou && " (You)"}</p>
                                  <p className="text-xs font-semibold text-purple-600">{user.xp} XP</p>
                                  <div className={`w-full rounded-t-xl ${heights[rank]} ${rank === 1 ? "bg-yellow-100 border border-yellow-300" : "bg-purple-50 border border-purple-100"}`} />
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
                                className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all duration-150 ${
                                  user.isYou ? "bg-purple-600 border-purple-600" : "bg-white border-purple-100"
                                }`}
                              >
                                <span className={`text-xs font-bold w-6 text-center flex-shrink-0 ${user.isYou ? "text-purple-200" : "text-gray-400"}`}>#{user.rank}</span>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${user.isYou ? "bg-white/20 text-white" : "bg-purple-100 text-purple-600"}`}>
                                  {user.name?.[0]?.toUpperCase()}
                                </div>
                                <p className={`flex-1 text-sm font-semibold truncate ${user.isYou ? "text-white" : "text-gray-900"}`}>
                                  {user.name}{user.isYou && <span className="text-purple-200 font-normal"> (You)</span>}
                                </p>
                                <span className={`text-sm font-bold flex-shrink-0 ${user.isYou ? "text-white" : "text-purple-600"}`}>{user.xp} XP</span>
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
                      {XP_ACTIONS.map(({ Icon, action, xp }) => (
                        <div
                          key={action}
                          className="flex items-center gap-3 px-4 py-3 rounded-xl"
                          style={{ background: "linear-gradient(135deg,rgba(124,58,237,0.05),rgba(167,139,250,0.08))", border: "1px solid rgba(124,58,237,0.10)" }}
                        >
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(124,58,237,0.10)", color: "#7C3AED" }}>
                            <Icon style={{ width: "1rem", height: "1rem", strokeWidth: 2 }} />
                          </div>
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
