import { useState, useEffect } from "react";
import axios from "axios";
import { PenLine, Calendar } from "lucide-react";
import CommentThread from "./CommentThread";
const API = import.meta.env.VITE_API_URL;

const PRESET_OPTIONS = [
  { label: "7d", days: 7 },
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
  { label: "6mo", days: 180 },
  { label: "All", days: null },
];

export default function Discussions({ clubId, token }) {
  const [posts, setPosts] = useState([]);
  const [members, setMembers] = useState([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  // rangeDays: number of days back, or null for all time
  const [rangeDays, setRangeDays] = useState(30);
  // custom input state
  const [customInput, setCustomInput] = useState("");
  const [showCustom, setShowCustom] = useState(false);

  const fetchPosts = async () => {
    try {
      const res = await axios.get(`${API}/api/clubs/${clubId}/posts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMembers = async () => {
    try {
      const res = await axios.get(`${API}/api/clubs/${clubId}/members`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMembers(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchMembers();
  }, [clubId, token]);

  const handleCreate = async () => {
    if (!title.trim() || !description.trim()) return;
    setSubmitting(true);
    try {
      await axios.post(
        `${API}/api/clubs/${clubId}/posts`,
        { title, description },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setTitle("");
      setDescription("");
      setCreateOpen(false);
      fetchPosts();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const applyCustomRange = () => {
    const val = parseInt(customInput, 10);
    if (!isNaN(val) && val > 0) {
      setRangeDays(val);
      setShowCustom(false);
      setCustomInput("");
    }
  };

  const selectPreset = (days) => {
    setRangeDays(days);
    setShowCustom(false);
    setCustomInput("");
  };

  // Filter top-level posts by date range
  const cutoff = rangeDays !== null
    ? new Date(Date.now() - rangeDays * 24 * 60 * 60 * 1000)
    : null;

  const topPosts = posts.filter((p) => {
    if (p.parentId) return false;
    if (cutoff && new Date(p.createdAt) < cutoff) return false;
    return true;
  });

  const isPreset = PRESET_OPTIONS.some((o) => o.days === rangeDays);
  const rangeLabel = rangeDays === null ? "All time" : `Last ${rangeDays} day${rangeDays === 1 ? "" : "s"}`;

  return (
    <div className="mt-6 max-w-3xl mx-auto space-y-4">
      {/* Controls row */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <button
          onClick={() => setCreateOpen((v) => !v)}
          className="flex items-center gap-2 px-5 py-2 bg-purple-600 text-white rounded-full text-sm hover:bg-purple-700 transition"
        >
          <PenLine className="w-4 h-4" />
          {createOpen ? "Cancel" : "New Post"}
        </button>

        {/* Date range selector */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <Calendar className="w-4 h-4 text-purple-400 flex-shrink-0" />
          <div className="flex items-center gap-1 bg-purple-50 border border-purple-200 rounded-lg p-1">
            {PRESET_OPTIONS.map((opt) => (
              <button
                key={opt.label}
                onClick={() => selectPreset(opt.days)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  rangeDays === opt.days && !showCustom
                    ? "bg-purple-600 text-white"
                    : "text-gray-500 hover:text-purple-600"
                }`}
              >
                {opt.label}
              </button>
            ))}
            {/* Custom button */}
            <button
              onClick={() => setShowCustom((v) => !v)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                showCustom || (!isPreset && rangeDays !== null)
                  ? "bg-purple-600 text-white"
                  : "text-gray-500 hover:text-purple-600"
              }`}
            >
              {!isPreset && rangeDays !== null && !showCustom ? `${rangeDays}d` : "Custom"}
            </button>
          </div>

          {showCustom && (
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min={1}
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && applyCustomRange()}
                placeholder="days"
                className="w-16 text-xs border border-purple-200 rounded-lg px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:border-purple-400"
                autoFocus
              />
              <button
                onClick={applyCustomRange}
                className="px-2.5 py-1.5 text-xs font-semibold bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              >
                Go
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Active range label */}
      <p className="text-xs text-gray-400 -mt-1">{rangeLabel}</p>

      {createOpen && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="w-full border border-gray-200 rounded-lg p-3 text-sm text-gray-800 bg-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            rows={3}
            className="w-full border border-gray-200 rounded-lg p-3 text-sm text-gray-800 bg-white placeholder-gray-400 resize-none focus:outline-none focus:border-purple-400"
          />
          <button
            onClick={handleCreate}
            disabled={submitting}
            className="px-5 py-2 bg-purple-600 text-white rounded-full text-sm hover:bg-purple-700 disabled:opacity-50"
          >
            {submitting ? "Posting..." : "Post"}
          </button>
        </div>
      )}

      {topPosts.length === 0 ? (
        <p className="text-center text-gray-400 text-sm py-10">
          No posts found for {rangeLabel.toLowerCase()}.
        </p>
      ) : (
        topPosts.map((post) => (
          <CommentThread
            key={post._id}
            post={post}
            allPosts={posts}
            clubId={clubId}
            token={token}
            depth={0}
            onRefresh={fetchPosts}
            members={members}
          />
        ))
      )}
    </div>
  );
}
