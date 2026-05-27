import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Bell, X, Trash2, CheckCheck, Trophy, MessageSquare, BarChart2, CheckCircle, Calendar, UserPlus, Clock } from "lucide-react";
import { getTokenFromCookies } from "../Utils/auth";
import { API_BASE } from "../config";

const TYPE_META = {
  new_badge:            { icon: Trophy,        color: "text-yellow-500",  bg: "bg-yellow-50"  },
  reply_to_post:        { icon: MessageSquare, color: "text-blue-500",    bg: "bg-blue-50"    },
  new_poll:             { icon: BarChart2,     color: "text-purple-500",  bg: "bg-purple-50"  },
  join_request_approved:{ icon: CheckCircle,   color: "text-green-500",   bg: "bg-green-50"   },
  new_club_event:       { icon: Calendar,      color: "text-indigo-500",  bg: "bg-indigo-50"  },
  pending_join_request: { icon: Clock,         color: "text-orange-500",  bg: "bg-orange-50"  },
  new_member_joined:    { icon: UserPlus,      color: "text-teal-500",    bg: "bg-teal-50"    },
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

const POLL_INTERVAL = 30_000; // 30 s

export default function NotificationBell() {
  const [open, setOpen]               = useState(false);
  const [notifications, setNotifs]    = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading]         = useState(false);
  const panelRef                      = useRef(null);
  const navigate                      = useNavigate();

  const authHeader = useCallback(() => {
    const token = getTokenFromCookies();
    return token ? { Authorization: `Bearer ${token}` } : null;
  }, []);

  // Lightweight unread-count poll
  useEffect(() => {
    const fetchCount = async () => {
      const headers = authHeader();
      if (!headers) return;
      try {
        const res = await axios.get(`${API_BASE}/api/notifications/unread-count`, { headers });
        setUnreadCount(res.data.count ?? 0);
      } catch {}
    };
    fetchCount();
    const id = setInterval(fetchCount, POLL_INTERVAL);
    return () => clearInterval(id);
  }, [authHeader]);

  // Load full list when panel opens
  useEffect(() => {
    if (!open) return;
    const headers = authHeader();
    if (!headers) return;
    setLoading(true);
    axios
      .get(`${API_BASE}/api/notifications`, { headers })
      .then((res) => {
        setNotifs(res.data.notifications ?? []);
        setUnreadCount(res.data.unreadCount ?? 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open, authHeader]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const markRead = async (id) => {
    const headers = authHeader();
    if (!headers) return;
    setNotifs((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
    setUnreadCount((c) => Math.max(0, c - 1));
    await axios.patch(`${API_BASE}/api/notifications/${id}/read`, {}, { headers }).catch(() => {});
  };

  const deleteOne = async (e, id) => {
    e.stopPropagation();
    const headers = authHeader();
    if (!headers) return;
    setNotifs((prev) => {
      const removed = prev.find((n) => n._id === id);
      if (removed && !removed.read) setUnreadCount((c) => Math.max(0, c - 1));
      return prev.filter((n) => n._id !== id);
    });
    await axios.delete(`${API_BASE}/api/notifications/${id}`, { headers }).catch(() => {});
  };

  const markAllRead = async () => {
    const headers = authHeader();
    if (!headers) return;
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    await axios.patch(`${API_BASE}/api/notifications/read-all`, {}, { headers }).catch(() => {});
  };

  const clearAll = async () => {
    const headers = authHeader();
    if (!headers) return;
    setNotifs([]);
    setUnreadCount(0);
    await axios.delete(`${API_BASE}/api/notifications`, { headers }).catch(() => {});
  };

  const handleClick = async (notif) => {
    if (!notif.read) await markRead(notif._id);
    if (notif.link) {
      setOpen(false);
      navigate(notif.link);
    }
  };

  const hasUnread = unreadCount > 0;

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`relative flex items-center justify-center w-8 h-8 rounded-xl border transition-all duration-150 ${
          hasUnread
            ? "bg-purple-600 border-purple-600 text-white shadow-md shadow-purple-200"
            : "bg-purple-50 border-purple-200 text-purple-400 hover:border-purple-300"
        }`}
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" strokeWidth={2.5} />
        {hasUnread && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold leading-none">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 top-10 w-80 bg-white rounded-2xl shadow-xl border border-purple-100 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-purple-50">
            <span className="text-sm font-semibold text-gray-800">Notifications</span>
            <div className="flex items-center gap-2">
              {notifications.some((n) => !n.read) && (
                <button
                  onClick={markAllRead}
                  title="Mark all as read"
                  className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800 transition-colors"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  All read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  title="Clear all"
                  className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear
                </button>
              )}
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-[420px] overflow-y-auto">
            {loading ? (
              <div className="py-10 text-center text-sm text-gray-400">Loading…</div>
            ) : notifications.length === 0 ? (
              <div className="py-10 text-center">
                <Bell className="w-8 h-8 text-purple-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notif) => {
                const meta = TYPE_META[notif.type] || TYPE_META.new_badge;
                const Icon = meta.icon;
                return (
                  <div
                    key={notif._id}
                    onClick={() => handleClick(notif)}
                    className={`group flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-purple-50/60 border-b border-gray-50 last:border-0 ${
                      !notif.read ? "bg-purple-50/40" : ""
                    }`}
                  >
                    {/* Icon */}
                    <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${meta.bg}`}>
                      <Icon className={`w-4 h-4 ${meta.color}`} strokeWidth={2} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-semibold text-gray-800 leading-snug ${!notif.read ? "font-bold" : ""}`}>
                        {notif.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5 leading-snug line-clamp-2">
                        {notif.message}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1">{timeAgo(notif.createdAt)}</p>
                    </div>

                    {/* Unread dot + delete */}
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-purple-500 mt-1" />
                      )}
                      <button
                        onClick={(e) => deleteOne(e, notif._id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-300 hover:text-red-400"
                        title="Remove"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
