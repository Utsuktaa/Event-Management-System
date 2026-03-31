import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Search,
  EyeOff,
  Trash2,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import { API_BASE } from "../config";
import { getTokenFromCookies } from "../Utils/auth";
import Logo from "../Components/Logo";
import { useNavigate } from "react-router-dom";

const FLAG_COLORS = {
  spam: { bg: "rgba(234,179,8,0.12)", color: "#854d0e" },
  harassment: { bg: "rgba(239,68,68,0.12)", color: "#991b1b" },
  scam: { bg: "rgba(249,115,22,0.12)", color: "#9a3412" },
  other: { bg: "rgba(107,114,128,0.12)", color: "#374151" },
};

const STATUS_STYLES = {
  visible: { bg: "rgba(22,163,74,0.1)", color: "#15803d" },
  hidden: { bg: "rgba(234,179,8,0.1)", color: "#854d0e" },
  deleted: { bg: "rgba(239,68,68,0.1)", color: "#991b1b" },
};

function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div
        className="rounded-2xl p-6 max-w-sm w-full mx-4"
        style={{
          background: "rgba(255,255,255,0.95)",
          border: "1px solid rgba(124,58,237,0.15)",
          boxShadow: "0 20px 60px rgba(124,58,237,0.15)",
        }}
      >
        <p className="text-sm mb-5" style={{ color: "#374151" }}>
          {message}
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2 rounded-xl text-sm font-medium transition hover:bg-gray-50"
            style={{
              border: "1px solid rgba(124,58,237,0.15)",
              color: "#6B7280",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2 rounded-xl text-sm font-semibold text-white transition hover:opacity-90"
            style={{
              background: "linear-gradient(135deg,#dc2626,#ef4444)",
              boxShadow: "0 4px 12px rgba(220,38,38,0.3)",
            }}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ModerationDashboard() {
  const token = getTokenFromCookies();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState(null);
  const LIMIT = 10;

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/reports/admin/posts`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page, limit: LIMIT, search },
      });
      setPosts(res.data.posts || []);
      setTotal(res.data.total || 0);
      setTotalPages(res.data.totalPages || 1);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [token, page, search]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const ask = (message, onConfirm) => setConfirm({ message, onConfirm });

  const hidePost = (id) =>
    ask("Hide this post?", async () => {
      await axios.patch(
        `${API_BASE}/api/reports/admin/posts/${id}/hide`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setConfirm(null);
      fetchPosts();
    });

  const deletePost = (id) =>
    ask("Delete this post?", async () => {
      await axios.delete(`${API_BASE}/api/reports/admin/posts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setConfirm(null);
      fetchPosts();
    });

  const restorePost = async (id) => {
    await axios.patch(
      `${API_BASE}/api/reports/admin/posts/${id}/restore`,
      {},
      { headers: { Authorization: `Bearer ${token}` } },
    );
    fetchPosts();
  };

  const cardStyle = {
    background: "rgba(255,255,255,0.75)",
    border: "1px solid rgba(124,58,237,0.12)",
    boxShadow: "0 2px 16px rgba(124,58,237,0.07)",
  };

  return (
    <div
      className="min-h-screen font-sans relative overflow-x-hidden"
      style={{
        background:
          "linear-gradient(135deg,#ede9fe 0%,#f5f3ff 40%,#e0e7ff 100%)",
      }}
    >
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full opacity-25 blur-3xl"
          style={{
            background: "radial-gradient(circle,#c4b5fd,transparent 70%)",
          }}
        />
        <div
          className="absolute -bottom-20 -right-20 w-[400px] h-[400px] rounded-full opacity-20 blur-3xl"
          style={{
            background: "radial-gradient(circle,#a5b4fc,transparent 70%)",
          }}
        />
      </div>

      <nav
        className="sticky top-0 z-40 px-6 py-4 flex items-center justify-between"
        style={{
          background: "rgba(255,255,255,0.75)",
          backdropFilter: "blur(16px)",
          boxShadow: "0 1px 24px rgba(124,58,237,0.10)",
          borderBottom: "1px solid rgba(124,58,237,0.12)",
        }}
      >
        <Logo />
        <button
          onClick={() => navigate("/admin-dashboard")}
          className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition hover:bg-purple-50"
          style={{ color: "#6B7280" }}
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back</span>
        </button>
      </nav>

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-center gap-3 mb-8">
          <div
            className="w-1 h-8 rounded-full"
            style={{ background: "linear-gradient(180deg,#7C3AED,#4f46e5)" }}
          />
          <h1 className="text-3xl font-bold" style={{ color: "#1E3A8A" }}>
            Content Moderation
          </h1>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setPage(1);
              setSearch(searchInput);
            }}
            className="flex gap-2 w-full sm:w-auto"
          >
            <div className="relative flex-1 sm:w-72">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                style={{ color: "#9CA3AF" }}
              />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search content, author, club..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-gray-800 bg-white placeholder-gray-400 outline-none transition"
                style={{
                  border: "1px solid rgba(124,58,237,0.2)",
                  boxShadow: "0 1px 4px rgba(124,58,237,0.06)",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#7C3AED")}
                onBlur={(e) =>
                  (e.target.style.borderColor = "rgba(124,58,237,0.2)")
                }
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition hover:opacity-90"
              style={{
                background: "linear-gradient(135deg,#1E3A8A,#7C3AED)",
                boxShadow: "0 4px 12px rgba(124,58,237,0.3)",
              }}
            >
              Search
            </button>
          </form>
          <p className="text-sm" style={{ color: "#9CA3AF" }}>
            {total} item{total !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="rounded-2xl overflow-hidden" style={cardStyle}>
          {loading ? (
            <div
              className="py-20 text-center text-sm"
              style={{ color: "#9CA3AF" }}
            >
              Loading...
            </div>
          ) : posts.length === 0 ? (
            <div
              className="py-20 text-center text-sm"
              style={{ color: "#9CA3AF" }}
            >
              No reported content found.
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead style={{ background: "rgba(124,58,237,0.06)" }}>
                <tr>
                  {[
                    "Content",
                    "Author",
                    "Club",
                    "Flags",
                    "Status",
                    "Reports",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-xs font-semibold uppercase tracking-wide"
                      style={{ color: "#7C3AED" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr
                    key={post._id}
                    className="border-t transition"
                    style={{ borderColor: "rgba(124,58,237,0.08)" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background =
                        "rgba(124,58,237,0.03)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "")
                    }
                  >
                    <td className="px-5 py-4 w-2/5">
                      {post.title && (
                        <p
                          className="font-medium truncate max-w-xs mb-0.5"
                          style={{ color: "#1E3A8A" }}
                        >
                          {post.title}
                        </p>
                      )}
                      <p
                        className="text-xs line-clamp-2 max-w-xs"
                        style={{ color: "#6B7280" }}
                      >
                        {post.description}
                      </p>
                      <p className="text-xs mt-1" style={{ color: "#D1D5DB" }}>
                        {new Date(post.createdAt).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-5 py-4" style={{ color: "#374151" }}>
                      {post.authorId?.name || "—"}
                    </td>
                    <td className="px-5 py-4" style={{ color: "#6B7280" }}>
                      {post.clubId?.name || "—"}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1">
                        {(post.flags || []).map((f) => {
                          const s = FLAG_COLORS[f] || FLAG_COLORS.other;
                          return (
                            <span
                              key={f}
                              className="px-2 py-0.5 rounded-full text-xs font-medium capitalize"
                              style={{ background: s.bg, color: s.color }}
                            >
                              {f}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {(() => {
                        const s = STATUS_STYLES[post.status] || {};
                        return (
                          <span
                            className="px-2 py-0.5 rounded-full text-xs font-medium capitalize"
                            style={{ background: s.bg, color: s.color }}
                          >
                            {post.status}
                          </span>
                        );
                      })()}
                    </td>
                    <td
                      className="px-5 py-4 font-semibold"
                      style={{ color: "#1E3A8A" }}
                    >
                      {post.reportCount}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        {post.status === "visible" && (
                          <button
                            onClick={() => hidePost(post._id)}
                            title="Hide"
                            className="p-1.5 rounded-lg transition hover:scale-110"
                            style={{
                              background: "rgba(234,179,8,0.1)",
                              color: "#854d0e",
                            }}
                          >
                            <EyeOff className="w-4 h-4" />
                          </button>
                        )}
                        {post.status === "hidden" && (
                          <button
                            onClick={() => restorePost(post._id)}
                            title="Restore"
                            className="p-1.5 rounded-lg transition hover:scale-110"
                            style={{
                              background: "rgba(22,163,74,0.1)",
                              color: "#15803d",
                            }}
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => deletePost(post._id)}
                          title="Delete"
                          className="p-1.5 rounded-lg transition hover:scale-110"
                          style={{
                            background: "rgba(239,68,68,0.1)",
                            color: "#991b1b",
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-full transition disabled:opacity-40"
              style={{
                background: "rgba(255,255,255,0.75)",
                border: "1px solid rgba(124,58,237,0.15)",
                color: "#6B7280",
              }}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm" style={{ color: "#6B7280" }}>
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-full transition disabled:opacity-40"
              style={{
                background: "rgba(255,255,255,0.75)",
                border: "1px solid rgba(124,58,237,0.15)",
                color: "#6B7280",
              }}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </main>

      <footer
        className="relative z-10 py-8 text-center text-xs border-t"
        style={{
          color: "rgba(107,114,128,0.6)",
          borderColor: "rgba(124,58,237,0.10)",
        }}
      >
        © 2025 EventSync
      </footer>

      {confirm && (
        <ConfirmDialog
          message={confirm.message}
          onConfirm={confirm.onConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}
