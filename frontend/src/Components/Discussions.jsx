import { useState, useEffect } from "react";
import axios from "axios";
import { getTokenFromCookies } from "../Utils/auth";

//  function for time ago
function timeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return `${seconds} sec ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

export default function Discussions({ clubId }) {
  const token = getTokenFromCookies();

  const [posts, setPosts] = useState([]);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [expandedPosts, setExpandedPosts] = useState({}); // for toggling full post view

  const fetchPosts = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/clubs/${clubId}/posts`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setPosts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [clubId]);

  const handlePost = async () => {
    if (!title.trim() || !content.trim()) return;
    await axios.post(
      `http://localhost:5000/api/clubs/${clubId}/posts`,
      { title, description: content },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    setTitle("");
    setContent("");
    setShowCreatePost(false);
    fetchPosts();
  };

  const handleReply = async (parentId) => {
    if (!replyContent.trim()) return;
    await axios.post(
      `http://localhost:5000/api/clubs/${clubId}/posts`,
      { description: replyContent, parentId },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    setReplyTo(null);
    setReplyContent("");
    fetchPosts();
  };

  const toggleExpand = (postId) => {
    setExpandedPosts((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  const topPosts = posts.filter((p) => !p.parentId);
  const replies = posts.filter((p) => p.parentId);

  return (
    <div>
      {/* Create Post*/}
      <button
        onClick={() => setShowCreatePost((prev) => !prev)}
        className="px-4 py-2 mb-4 font-pixel border border-blue-400 rounded bg-purple-900 hover:bg-blue-400 hover:text-purple-950"
      >
        Create Post
      </button>

      {showCreatePost && (
        <div className="mb-6 border border-blue-400 p-4 rounded bg-purple-900">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Post Title"
            className="w-full mb-2 p-2 border border-blue-400 rounded bg-purple-950"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write something..."
            className="w-full p-2 border border-blue-400 rounded bg-purple-950"
          />
          <button
            onClick={handlePost}
            className="mt-2 px-4 py-2 border border-blue-400 font-pixel rounded hover:bg-blue-400 hover:text-purple-950"
          >
            Post
          </button>
        </div>
      )}

      {/* Posts */}
      <div className="space-y-6">
        {topPosts.map((post) => (
          <div key={post._id} className="border border-blue-400 p-4 rounded">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-gray-400" />{" "}
              <span className="font-semibold">{post.authorId?.name}</span>
              <span className="text-xs text-gray-400 ml-auto">
                {timeAgo(post.createdAt)}
              </span>
            </div>

            {/* Title */}
            {post.title && <h3 className="font-bold mb-1">{post.title}</h3>}

            {/* Description */}
            <p
              className="mb-2 cursor-pointer"
              onClick={() => toggleExpand(post._id)}
            >
              {expandedPosts[post._id]
                ? post.description
                : post.description.slice(0, 100) +
                  (post.description.length > 100 ? "..." : "")}
            </p>

            {/* Reply Button */}
            <button
              onClick={() => setReplyTo(replyTo === post._id ? null : post._id)}
              className="text-blue-400 text-sm mb-2"
            >
              Reply
            </button>

            {/* Reply Box */}
            {replyTo === post._id && (
              <div className="ml-4 mt-2">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write a reply..."
                  className="w-full p-2 border border-blue-400 rounded bg-purple-950"
                />
                <button
                  onClick={() => handleReply(post._id)}
                  className="mt-1 px-3 py-1 border border-blue-400 font-pixel rounded hover:bg-blue-400 hover:text-purple-950"
                >
                  Reply
                </button>
              </div>
            )}

            <div className="ml-4 mt-2 space-y-2">
              {replies
                .filter((r) => r.parentId === post._id)
                .map((reply) => (
                  <div
                    key={reply._id}
                    className="border-l-2 border-blue-400 pl-3"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gray-400" />
                      <span className="text-sm">{reply.authorId?.name}</span>
                      <span className="text-xs text-gray-400 ml-auto">
                        {timeAgo(reply.createdAt)}
                      </span>
                    </div>
                    <p>{reply.description}</p>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
