import { useState, useEffect } from "react";
import axios from "axios";
import { PenLine } from "lucide-react";
import CommentThread from "./CommentThread";

export default function Discussions({ clubId, token }) {
  const [posts, setPosts] = useState([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchPosts = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/clubs/${clubId}/posts`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setPosts(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [clubId, token]);

  const handleCreate = async () => {
    if (!title.trim() || !description.trim()) return;
    setSubmitting(true);
    try {
      await axios.post(
        `http://localhost:5000/api/clubs/${clubId}/posts`,
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

  const topPosts = posts.filter((p) => !p.parentId);

  return (
    <div className="mt-6 max-w-3xl mx-auto space-y-4">
      <button
        onClick={() => setCreateOpen((v) => !v)}
        className="flex items-center gap-2 px-5 py-2 bg-purple-600 text-white rounded-full text-sm hover:bg-purple-700 transition"
      >
        <PenLine className="w-4 h-4" />
        {createOpen ? "Cancel" : "New Post"}
      </button>

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
          No posts found.
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
          />
        ))
      )}
    </div>
  );
}
