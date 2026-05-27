import { useState, useEffect } from "react";
import axios from "axios";
import { Flame, Zap } from "lucide-react";
import { getTokenFromCookies } from "../Utils/auth";
import { API_BASE } from "../config";
import NotificationBell from "./NotificationBell";

export default function NavbarXP() {
  const [xp, setXp] = useState(null);
  const [streak, setStreak] = useState(null);

  useEffect(() => {
    const token = getTokenFromCookies();
    if (!token) return;
    axios
      .get(`${API_BASE}/api/stats/navbar`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setXp(res.data.xp ?? 0);
        setStreak(res.data.streak ?? 0);
      })
      .catch(() => {});
  }, []);

  if (xp === null) return null;

  return (
    <div className="flex items-center gap-2">
      <NotificationBell />
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200">
        <Flame className="w-3.5 h-3.5 text-orange-500" strokeWidth={2.5} />
        <span className="text-xs font-bold text-purple-700">{xp} XP</span>
      </div>
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200">
        <Zap className="w-3.5 h-3.5 text-violet-400" strokeWidth={2.5} />
        <span className="text-xs font-semibold text-violet-700">{streak} streak</span>
      </div>
    </div>
  );
}
