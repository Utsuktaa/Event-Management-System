import { useState } from "react";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";
import { ChevronDown, ChevronRight, Flag } from "lucide-react";
import ReportModal from "./ReportModal";

const MAX_DEPTH = 4;

export default function CommentThread({
  post,
  allPosts,
  clubId,
  token,
  depth = 0,
  onRefresh,
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  const directReplies = allPosts.filter(
    (p) => p.parentId && p.parentId.toString() === post._id.toString()
  );

  const handleReply = async () => {
    if (!replyText.trim()) return;
    setSubmitting(true);
    try {
      await axios.post(
        `http://localhost:5000/api/clubs/${clubId}/posts`,
        { description: replyText, parentId: post._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReplyText("");
      setReplyOpen(false);
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const indentClass = depth === 0 ? "" : "ml-4 border-l-2 border-purple-100 pl-4";

  return (
    <div className={`${indentClass} mt-3`}>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-full bg-purple-200 flex items-center justify-center text-purple-700 text-xs font-bold">
            {post.authorId?.name?.[0]?.toUpperCase() || "?"}
          </div>
          <span className="text-sm font-medium text-gray-700">
            {post.authorId?.name || "Unknown"}
          </span>
          <span className="text-xs text-gray-400 ml-auto">
            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
          </span>
        </div>

        {post.title && (
          <p className="font-semibold text-gray-800 mb-1">{post.title}</p>
        )}
        <p className="text-sm text-gray-600 leading-relaxed">{post.description}</p>

        <div className="flex items-center gap-4 mt-3">
          {directReplies.length > 0 && (
            <button
              onClick={() => setIsExpanded((v) => !v)}
              className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800"
            >
              {isExpanded ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
              {directReplies.length} {directReplies.length === 1 ? "reply" : "replies"}
            </button>
          )}

          {depth < MAX_DEPTH && (
            <button
              onClick={() => setReplyOpen((v) => !v)}
              className="text-xs text-gray-500 hover:text-purple-600"
            >
              {replyOpen ? "Cancel" : "Reply"}
            </button>
          )}

          <button
            onClick={() => setReportOpen(true)}
            className="ml-auto flex items-center gap-1 text-xs text-gray-400 hover:text-red-500"
          >
            <Flag className="w-3 h-3" />
            Report
          </button>
        </div>

        {replyOpen && (
          <div className="mt-3 space-y-2">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write a reply..."
              rows={2}
              className="w-full border border-gray-200 rounded-lg p-2 text-sm text-gray-800 bg-white placeholder-gray-400 resize-none focus:outline-none focus:border-purple-400"
            />
            <button
              onClick={handleReply}
              disabled={submitting}
              className="px-4 py-1.5 bg-purple-600 text-white text-xs rounded-full hover:bg-purple-700 disabled:opacity-50"
            >
              {submitting ? "Posting..." : "Post Reply"}
            </button>
          </div>
        )}
      </div>

      {isExpanded &&
        directReplies.map((reply) => (
          <CommentThread
            key={reply._id}
            post={reply}
            allPosts={allPosts}
            clubId={clubId}
            token={token}
            depth={depth + 1}
            onRefresh={onRefresh}
          />
        ))}

      {reportOpen && (
        <ReportModal
          targetId={post._id}
          targetType={post.parentId ? "comment" : "post"}
          token={token}
          onClose={() => setReportOpen(false)}
        />
      )}
    </div>
  );
}
