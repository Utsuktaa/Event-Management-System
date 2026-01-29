import { useState, useEffect } from "react";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";

export default function Discussions({ clubId, token }) {
  const [posts, setPosts] = useState([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [replyContent, setReplyContent] = useState("");

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
    }
  };

  const handleReply = async (parentId) => {
    if (!replyContent.trim()) return;
    try {
      await axios.post(
        `http://localhost:5000/api/clubs/${clubId}/posts`,
        { description: replyContent, parentId },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setReplyContent("");
      setReplyTo(null);
      fetchPosts();
    } catch (err) {
      console.error(err);
    }
  };

  const topPosts = posts.filter((p) => !p.parentId);
  const replies = posts.filter((p) => p.parentId);

  return (
    <div className="mt-6 max-w-4xl mx-auto space-y-6">
      <button
        onClick={() => setCreateOpen(!createOpen)}
        className="px-6 py-2 border border-blue-400 font-pixel rounded-full bg-purple-900 hover:bg-blue-400 hover:text-purple-950"
      >
        Create Post
      </button>

      {createOpen && (
        <div className="mt-4 p-4 border border-blue-400 rounded-lg bg-purple-950 space-y-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Post title"
            className="w-full p-2 border border-blue-400 rounded bg-purple-900"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Write your post..."
            className="w-full p-2 border border-blue-400 rounded bg-purple-900"
          />
          <button
            onClick={handleCreate}
            className="px-4 py-2 border border-blue-400 font-pixel rounded hover:bg-blue-400 hover:text-purple-950"
          >
            Post
          </button>
        </div>
      )}

      {/* Posts */}
      <div className="space-y-4">
        {topPosts.map((post) => (
          <div
            key={post._id}
            className="border border-blue-400 rounded-lg p-4 bg-purple-950"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-gray-400" />
              <span className="font-pixel text-sm">{post.authorId?.name}</span>
            </div>
            {post.title && <h3 className="font-bold mb-1">{post.title}</h3>}
            <p className="mb-2">
              {post.description.length > 150 && !post.expanded
                ? post.description.slice(0, 150) + "..."
                : post.description}
            </p>
            <span className="text-xs text-gray-400">
              {formatDistanceToNow(new Date(post.createdAt), {
                addSuffix: true,
              })}
            </span>

            {/* Reply  */}
            <button
              onClick={() => setReplyTo(replyTo === post._id ? null : post._id)}
              className="mt-2 text-blue-400 text-sm"
            >
              Reply
            </button>

            {/* Reply box */}
            {replyTo === post._id && (
              <div className="mt-2 ml-6 space-y-2">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  className="w-full p-2 border border-blue-400 rounded bg-purple-900"
                  placeholder="Write a reply..."
                />
                <button
                  onClick={() => handleReply(post._id)}
                  className="px-3 py-1 border border-blue-400 font-pixel rounded hover:bg-blue-400 hover:text-purple-950"
                >
                  Reply
                </button>

                {replies
                  .filter((r) => r.parentId === post._id)
                  .map((reply) => (
                    <div
                      key={reply._id}
                      className="ml-4 mt-2 border-l-2 border-blue-400 pl-3"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gray-400" />
                        <span className="text-sm">{reply.authorId?.name}</span>
                      </div>
                      <p className="text-sm mt-1">{reply.description}</p>
                      <span className="text-xs text-gray-400">
                        {formatDistanceToNow(new Date(reply.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
