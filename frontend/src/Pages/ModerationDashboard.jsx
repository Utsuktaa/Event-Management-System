import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Search,
  EyeOff,
  Trash2,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { API_BASE } from "../config";
import { getTokenFromCookies } from "../Utils/auth";

const FLAG_COLORS = {
  spam: "bg-yellow-100 text-yellow-700",
  harassment: "bg-red-100 text-red-700",
  scam: "bg-orange-100 text-orange-700",
  other: "bg-gray-100 text-gray-600",
};

const STATUS_COLORS = {
  visible: "bg-green-100 text-green-700",
  hidden: "bg-yellow-100 text-yellow-700",
  deleted: "bg-red-100 text-red-600",
};

function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4">
        <p className="text-gray-700 text-sm mb-5">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2 border border-gray-200 rounded-full text-sm text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2 bg-red-500 text-white rounded-full text-sm hover:bg-red-600"
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
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token, page, search]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const ask = (message, onConfirm) => setConfirm({ message, onConfirm });

  const hidePost = (postId) =>
    ask("Hide this post? It will be removed from user feeds.", async () => {
      await axios.patch(
        `${API_BASE}/api/reports/admin/posts/${postId}/hide`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setConfirm(null);
      fetchPosts();
    });

  const deletePost = (postId) =>
    ask("Permanently delete this post? This cannot be undone.", async () => {
      await axios.delete(`${API_BASE}/api/reports/admin/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setConfirm(null);
      fetchPosts();
    });

  const restorePost = async (postId) => {
    await axios.patch(
      `${API_BASE}/api/reports/admin/posts/${postId}/restore`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchPosts();
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <nav className="px-6 py-4 flex justify-between items-center bg-white/60 backdrop-blur-md shadow-sm rounded-b-3xl">
        <h1 className="text-lg font-semibold text-purple-700">Content Moderation</h1>
        <p className="text-sm text-gray-400">Admin View</p>
      </nav>

      <header className="py-10 text-center px-6 bg-linear-to-b from-purple-50 to-pink-50">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Reported Content</h2>
      </header>

      <main className="max-w-6xl mx-auto px-6 pb-16">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
          <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search content, author, club.."
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-full text-sm text-gray-800 bg-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded-full text-sm hover:bg-purple-700"
            >
              Search
            </button>
          </form>
          <p className="text-sm text-gray-500">
            {total} reported item{total !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="py-20 text-center text-gray-400 text-sm">Loading...</div>
          ) : posts.length === 0 ? (
            <div className="py-20 text-center text-gray-400 text-sm">
              No reported content found.
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-purple-50 text-purple-700 text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-5 py-3 w-2/5">Content</th>
                  <th className="px-5 py-3">Author</th>
                  <th className="px-5 py-3">Club</th>
                  <th className="px-5 py-3">Flags</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Reports</th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {posts.map((post) => (
                  <tr key={post._id} className="hover:bg-gray-50 transition align-top">
                    <td className="px-5 py-4">
                      {post.title && (
                        <p className="font-medium text-gray-800 mb-0.5 truncate max-w-xs">
                          {post.title}
                        </p>
                      )}
                      <p className="text-gray-500 text-xs line-clamp-2 max-w-xs">
                        {post.description}
                      </p>
                      <p className="text-gray-300 text-xs mt-1">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-gray-700">
                      {post.authorId?.name || "—"}
                    </td>

                    <td className="px-5 py-4 text-gray-500">
                      {post.clubId?.name || "—"}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1">
                        {(post.flags || []).map((f) => (
                          <span
                            key={f}
                            className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                              FLAG_COLORS[f] || "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                          STATUS_COLORS[post.status] || ""
                        }`}
                      >
                        {post.status}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-gray-600 font-medium">
                      {post.reportCount}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        {post.status === "visible" && (
                          <button
                            onClick={() => hidePost(post._id)}
                            title="Hide post"
                            className="p-1.5 rounded-lg border border-yellow-200 text-yellow-600 hover:bg-yellow-50"
                          >
                            <EyeOff className="w-4 h-4" />
                          </button>
                        )}
                        {post.status === "hidden" && (
                          <button
                            onClick={() => restorePost(post._id)}
                            title="Restore post"
                            className="p-1.5 rounded-lg border border-green-200 text-green-600 hover:bg-green-50"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => deletePost(post._id)}
                          title="Delete post"
                          className="p-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50"
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
              className="p-2 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </main>

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
