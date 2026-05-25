import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";
import {
  Plus,
  Pin,
  PinOff,
  CheckCircle2,
  Clock,
  MessageSquare,
  BarChart3,
  Calendar,
  X,
  Trash2,
  ThumbsUp,
  CalendarPlus,
} from "lucide-react";
import { API_BASE } from "../config";
import Toast from "./Toast";

const inputCls =
  "w-full px-4 py-2.5 rounded-xl text-sm placeholder-gray-400 outline-none transition bg-white/80 border border-purple-200 text-blue-900 focus:border-purple-500";

const POLL_TYPES = [
  { value: "standard", label: "Standard" },
  { value: "event", label: "Event" },
  { value: "feedback", label: "Feedback" },
  { value: "other", label: "Other" },
];

function PollOptionBar({ option, isWinner, showResults }) {
  const pct = showResults ? option.percentage || 0 : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className={`font-medium ${isWinner && showResults ? "text-purple-700" : "text-gray-700"}`}>
          {option.text}
          {isWinner && showResults && (
            <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-semibold">
              Winner
            </span>
          )}
        </span>
        {showResults && (
          <span className="text-xs text-gray-500 tabular-nums">
            {pct}% · {option.voteCount} vote{option.voteCount !== 1 ? "s" : ""}
          </span>
        )}
      </div>
      {showResults && (
        <div className="h-2.5 rounded-full bg-purple-50 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isWinner ? "bg-gradient-to-r from-purple-600 to-indigo-500" : "bg-purple-300"
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
      {!showResults && option.voteCount > 0 && (
        <span className="text-xs text-gray-400">{option.voteCount} vote{option.voteCount !== 1 ? "s" : ""}</span>
      )}
    </div>
  );
}

function PollCard({
  poll,
  clubId,
  token,
  canManage,
  canConvert,
  onRefresh,
  showToast,
}) {
  const [selected, setSelected] = useState(poll.userVotes || []);
  const [voting, setVoting] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commenting, setCommenting] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [convertOpen, setConvertOpen] = useState(false);
  const [eventForm, setEventForm] = useState(null);
  const [converting, setConverting] = useState(false);
  const [expiryOverride, setExpiryOverride] = useState("");

  useEffect(() => {
    setSelected(poll.userVotes || []);
  }, [poll.userVotes]);

  const headers = { Authorization: `Bearer ${token}` };
  const typeLabel =
    poll.type === "other" && poll.customType
      ? poll.customType
      : POLL_TYPES.find((t) => t.value === poll.type)?.label || poll.type;

  const handleVote = async () => {
    if (!poll.canVote || selected.length === 0) return;
    setVoting(true);
    try {
      await axios.post(
        `${API_BASE}/api/clubs/${clubId}/polls/${poll._id}/vote`,
        { optionIndices: selected },
        { headers },
      );
      showToast("Vote submitted!", "success");
      onRefresh();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to vote", "error");
    } finally {
      setVoting(false);
    }
  };

  const toggleOption = (idx) => {
    if (!poll.canVote) return;
    if (poll.allowMultipleVotes) {
      setSelected((prev) =>
        prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx],
      );
    } else {
      setSelected([idx]);
    }
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;
    setCommenting(true);
    try {
      await axios.post(
        `${API_BASE}/api/clubs/${clubId}/polls/${poll._id}/comment`,
        { text: commentText },
        { headers },
      );
      setCommentText("");
      showToast("Comment added", "success");
      onRefresh();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to comment", "error");
    } finally {
      setCommenting(false);
    }
  };

  const handlePin = async () => {
    try {
      await axios.patch(`${API_BASE}/api/clubs/${clubId}/polls/${poll._id}/pin`, {}, { headers });
      showToast(poll.pinned ? "Poll unpinned" : "Poll pinned", "success");
      onRefresh();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update pin", "error");
    }
  };

  const handleApprove = async () => {
    try {
      await axios.patch(`${API_BASE}/api/clubs/${clubId}/polls/${poll._id}/approve`, {}, { headers });
      showToast("Poll approved", "success");
      onRefresh();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to approve", "error");
    }
  };

  const handleReject = async () => {
    if (!window.confirm("Remove this poll?")) return;
    try {
      await axios.patch(`${API_BASE}/api/clubs/${clubId}/polls/${poll._id}/reject`, {}, { headers });
      showToast("Poll removed", "success");
      onRefresh();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to remove", "error");
    }
  };

  const handleCloseNow = async () => {
    try {
      await axios.patch(
        `${API_BASE}/api/clubs/${clubId}/polls/${poll._id}/override-expiry`,
        { closeNow: true },
        { headers },
      );
      showToast("Poll closed", "success");
      onRefresh();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to close poll", "error");
    }
  };

  const handleOverrideExpiry = async () => {
    if (!expiryOverride) return;
    try {
      await axios.patch(
        `${API_BASE}/api/clubs/${clubId}/polls/${poll._id}/override-expiry`,
        { expiryDate: expiryOverride },
        { headers },
      );
      showToast("Expiry updated", "success");
      setExpiryOverride("");
      onRefresh();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update expiry", "error");
    }
  };

  const openConvertModal = async () => {
    try {
      const res = await axios.patch(
        `${API_BASE}/api/clubs/${clubId}/polls/${poll._id}/convert-to-event`,
        {},
        { headers },
      );
      setEventForm({
        title: res.data.eventDraft.title,
        description: res.data.eventDraft.description,
        date: new Date(res.data.eventDraft.date).toISOString().slice(0, 16),
        location: "",
      });
      setConvertOpen(true);
    } catch (err) {
      showToast(err.response?.data?.message || "Cannot convert poll", "error");
    }
  };

  const handleConvertSubmit = async (e) => {
    e.preventDefault();
    setConverting(true);
    try {
      await axios.patch(
        `${API_BASE}/api/clubs/${clubId}/polls/${poll._id}/convert-to-event`,
        { createEvent: true, ...eventForm },
        { headers },
      );
      showToast("Event created from poll!", "success");
      setConvertOpen(false);
      onRefresh();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to create event", "error");
    } finally {
      setConverting(false);
    }
  };

  return (
    <>
      <div
        className={`relative bg-white rounded-3xl border shadow-sm hover:shadow-lg transition-all duration-150 p-6 overflow-hidden ${
          poll.pinned ? "border-purple-400 ring-1 ring-purple-200" : "border-purple-200"
        } ${poll.isClosed ? "opacity-80" : ""}`}
      >
        <div className="absolute -top-6 -right-6 w-24 h-24 bg-purple-200 rounded-full opacity-40 pointer-events-none" />

        <div className="flex flex-wrap items-start gap-2 mb-3">
          {poll.pinned && (
            <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-semibold">
              <Pin className="w-3 h-3" /> Pinned
            </span>
          )}
          {poll.status === "pending" && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-semibold">
              Pending Approval
            </span>
          )}
          {poll.isClosed && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-semibold">
              Closed
            </span>
          )}
          <span className="text-xs px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 font-medium capitalize">
            {typeLabel}
          </span>
          {poll.isAnonymous && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-50 text-gray-500">Anonymous</span>
          )}
        </div>

        <h3 className="text-lg font-semibold text-gray-900 pr-4">{poll.question}</h3>

        <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-full bg-purple-200 flex items-center justify-center text-purple-700 text-[10px] font-bold">
              {poll.createdBy?.name?.[0]?.toUpperCase() || "?"}
            </div>
            {poll.createdBy?.name || "Unknown"}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-purple-400" />
            {formatDistanceToNow(new Date(poll.createdAt), { addSuffix: true })}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-purple-400" />
            Expires {new Date(poll.expiryDate).toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <BarChart3 className="w-3.5 h-3.5 text-purple-400" />
            {poll.totalVotes} total vote{poll.totalVotes !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="mt-4 space-y-3">
          {poll.options.map((opt, idx) => {
            const isSelected = selected.includes(idx);
            const isWinner = poll.showResults && poll.winningOptionIndex === idx;

            const liveResults = poll.canVote && poll.showResults;

            if (poll.canVote) {
              return (
                <button
                  key={opt._id || idx}
                  type="button"
                  onClick={() => toggleOption(idx)}
                  className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                    isSelected
                      ? "border-purple-500 bg-purple-50 ring-1 ring-purple-200"
                      : "border-purple-100 hover:border-purple-300 hover:bg-purple-50/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        isSelected ? "border-purple-600 bg-purple-600" : "border-purple-300"
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="w-3 h-3 text-white" />}
                    </div>
                    <span className="text-sm font-medium text-gray-800 flex-1">{opt.text}</span>
                    {liveResults && (
                      <span className="text-xs text-gray-500 tabular-nums">
                        {opt.percentage || 0}% · {opt.voteCount}
                      </span>
                    )}
                  </div>
                  {liveResults && (
                    <div className="mt-2 h-2 rounded-full bg-purple-50 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isWinner ? "bg-gradient-to-r from-purple-600 to-indigo-500" : "bg-purple-300"
                        }`}
                        style={{ width: `${opt.percentage || 0}%` }}
                      />
                    </div>
                  )}
                </button>
              );
            }

            return (
              <PollOptionBar key={opt._id || idx} option={opt} isWinner={isWinner} showResults={poll.showResults} />
            );
          })}
        </div>

        {poll.canVote && (
          <button
            onClick={handleVote}
            disabled={voting || selected.length === 0}
            className="mt-4 px-5 py-2 bg-purple-600 text-white rounded-full text-sm font-semibold hover:bg-purple-700 disabled:opacity-50 transition"
          >
            {voting ? "Submitting..." : poll.userVotes?.length > 0 ? "Update Vote" : "Submit Vote"}
          </button>
        )}

        {!poll.showResults && !poll.canVote && poll.isClosed && (
          <p className="mt-3 text-sm text-gray-500 italic">Results hidden until poll closes.</p>
        )}

        {!poll.isAnonymous && poll.showResults && poll.options.some((o) => o.voters?.length > 0) && (
          <div className="mt-4 p-3 rounded-xl bg-purple-50/50 border border-purple-100">
            <p className="text-xs font-semibold text-purple-700 mb-2">Voters</p>
            {poll.options.map((opt, idx) =>
              opt.voters?.length > 0 ? (
                <div key={idx} className="text-xs text-gray-600 mb-1">
                  <span className="font-medium">{opt.text}:</span>{" "}
                  {opt.voters.map((v) => v.name).join(", ")}
                </div>
              ) : null,
            )}
          </div>
        )}

        {canManage && poll.isAnonymous && poll.showResults && (
          <div className="mt-4 p-3 rounded-xl bg-amber-50/50 border border-amber-100">
            <p className="text-xs font-semibold text-amber-700 mb-2">Admin: All Voters</p>
            {poll.options.map((opt, idx) =>
              opt.voters?.length > 0 ? (
                <div key={idx} className="text-xs text-gray-600 mb-1">
                  <span className="font-medium">{opt.text}:</span>{" "}
                  {opt.voters.map((v) => v.name).join(", ")}
                </div>
              ) : null,
            )}
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => setShowComments((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 hover:bg-purple-100 transition"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            {poll.comments?.length || 0} Discussion
          </button>

          {canManage && (
            <>
              <button
                onClick={handlePin}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 hover:bg-purple-100 transition"
              >
                {poll.pinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
                {poll.pinned ? "Unpin" : "Pin"}
              </button>
              {poll.status === "pending" && (
                <button
                  onClick={handleApprove}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-green-50 text-green-700 hover:bg-green-100 transition"
                >
                  <ThumbsUp className="w-3.5 h-3.5" /> Approve
                </button>
              )}
              {!poll.isClosed && (
                <button
                  onClick={handleCloseNow}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-gray-50 text-gray-600 hover:bg-gray-100 transition"
                >
                  Force Close
                </button>
              )}
              <button
                onClick={handleReject}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 transition"
              >
                <Trash2 className="w-3.5 h-3.5" /> Remove
              </button>
              {canConvert && poll.type === "event" && !poll.convertedEventId && poll.isClosed && (
                <button
                  onClick={openConvertModal}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition"
                >
                  <CalendarPlus className="w-3.5 h-3.5" /> Convert to Event
                </button>
              )}
            </>
          )}
        </div>

        {canManage && !poll.isClosed && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <input
              type="datetime-local"
              value={expiryOverride}
              onChange={(e) => setExpiryOverride(e.target.value)}
              className="text-xs px-3 py-1.5 rounded-lg border border-purple-200 outline-none focus:border-purple-400"
            />
            <button
              onClick={handleOverrideExpiry}
              disabled={!expiryOverride}
              className="text-xs px-3 py-1.5 rounded-full bg-purple-100 text-purple-700 font-medium disabled:opacity-50"
            >
              Override Expiry
            </button>
          </div>
        )}

        {showComments && (
          <div className="mt-4 pt-4 border-t border-purple-100 space-y-3">
            {(poll.comments || []).length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-2">No discussion yet. Start the conversation!</p>
            ) : (
              poll.comments.map((c) => (
                <div key={c._id} className="flex gap-2">
                  <div className="w-7 h-7 rounded-full bg-purple-200 flex items-center justify-center text-purple-700 text-xs font-bold shrink-0">
                    {c.authorId?.name?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-medium text-gray-700">{c.authorId?.name || "Unknown"}</span>
                      <span className="text-[10px] text-gray-400">
                        {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{c.text}</p>
                  </div>
                </div>
              ))
            )}
            <div className="flex gap-2">
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Join the discussion..."
                className="flex-1 text-sm px-3 py-2 rounded-xl border border-purple-200 outline-none focus:border-purple-400"
                onKeyDown={(e) => e.key === "Enter" && handleComment()}
              />
              <button
                onClick={handleComment}
                disabled={commenting || !commentText.trim()}
                className="px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
              >
                {commenting ? "..." : "Send"}
              </button>
            </div>
          </div>
        )}
      </div>

      {convertOpen && eventForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
            <button
              onClick={() => setConvertOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
            <h3 className="text-lg font-semibold text-blue-900 mb-1">Create Event from Poll</h3>
            <p className="text-xs text-gray-500 mb-4">Winning option pre-filled as event title</p>
            <form onSubmit={handleConvertSubmit} className="space-y-3">
              <input
                value={eventForm.title}
                onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                placeholder="Event Title"
                required
                className={inputCls}
              />
              <textarea
                value={eventForm.description}
                onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                rows={3}
                placeholder="Description"
                className={`${inputCls} resize-none`}
              />
              <input
                type="datetime-local"
                value={eventForm.date}
                onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                required
                className={inputCls}
              />
              <input
                value={eventForm.location}
                onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                placeholder="Location (optional)"
                className={inputCls}
              />
              <button
                type="submit"
                disabled={converting}
                className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-purple-700 hover:bg-purple-800 disabled:opacity-50"
              >
                {converting ? "Creating..." : "Create Event"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default function Polls({ clubId, token, permissions = [] }) {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [pollType, setPollType] = useState("standard");
  const [customType, setCustomType] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [allowMultipleVotes, setAllowMultipleVotes] = useState(false);
  const [allowVoteChange, setAllowVoteChange] = useState(true);
  const [showResultsAfterClose, setShowResultsAfterClose] = useState(false);

  const can = (p) => permissions.includes(p);
  const canCreate = can("create_poll") || permissions.length === 0;
  const canManage = can("manage_polls");
  const canConvert = can("convert_poll_to_event");

  const showToast = useCallback((message, type) => setToast({ message, type }), []);

  const fetchPolls = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/clubs/${clubId}/polls`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPolls(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [clubId, token]);

  useEffect(() => {
    fetchPolls();
    const interval = setInterval(fetchPolls, 60000);
    return () => clearInterval(interval);
  }, [fetchPolls]);

  const resetForm = () => {
    setQuestion("");
    setOptions(["", ""]);
    setPollType("standard");
    setCustomType("");
    setExpiryDate("");
    setIsAnonymous(false);
    setAllowMultipleVotes(false);
    setAllowVoteChange(true);
    setShowResultsAfterClose(false);
  };

  const updateOption = (idx, val) => {
    setOptions((prev) => prev.map((o, i) => (i === idx ? val : o)));
  };

  const addOption = () => {
    if (options.length < 6) setOptions((prev) => [...prev, ""]);
  };

  const removeOption = (idx) => {
    if (options.length > 2) setOptions((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleCreate = async () => {
    const trimmed = options.map((o) => o.trim()).filter(Boolean);
    if (!question.trim() || trimmed.length < 2 || !expiryDate) {
      showToast("Fill in question, at least 2 options, and expiry date", "error");
      return;
    }
    setSubmitting(true);
    try {
      await axios.post(
        `${API_BASE}/api/clubs/${clubId}/polls`,
        {
          question,
          options: trimmed,
          type: pollType,
          customType: pollType === "other" ? customType : undefined,
          expiryDate,
          isAnonymous,
          allowMultipleVotes,
          allowVoteChange,
          showResultsAfterClose,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      showToast("Poll created!", "success");
      resetForm();
      setCreateOpen(false);
      fetchPolls();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to create poll", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center">
        <div className="w-8 h-8 mx-auto rounded-full border-2 border-purple-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="mt-2 max-w-3xl mx-auto space-y-6">
      {canCreate && (
        <button
          onClick={() => setCreateOpen((v) => !v)}
          className="flex items-center gap-2 px-5 py-2 bg-purple-600 text-white rounded-full text-sm font-semibold hover:bg-purple-700 transition"
        >
          <Plus className="w-4 h-4" />
          {createOpen ? "Cancel" : "New Poll"}
        </button>
      )}

      {createOpen && (
        <div className="bg-white/80 rounded-3xl border border-purple-200 shadow-sm p-6 space-y-4">
          <h3 className="text-base font-semibold text-blue-900">Create Poll</h3>

          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Poll question"
            className={inputCls}
          />

          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Options (2–6)</label>
            {options.map((opt, idx) => (
              <div key={idx} className="flex gap-2">
                <input
                  value={opt}
                  onChange={(e) => updateOption(idx, e.target.value)}
                  placeholder={`Option ${idx + 1}`}
                  className={inputCls}
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(idx)}
                    className="px-3 rounded-xl text-red-500 hover:bg-red-50 border border-red-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            {options.length < 6 && (
              <button
                type="button"
                onClick={addOption}
                className="text-xs text-purple-600 font-medium hover:underline"
              >
                + Add option
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Poll Type</label>
              <select
                value={pollType}
                onChange={(e) => setPollType(e.target.value)}
                className={inputCls}
              >
                {POLL_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            {pollType === "other" && (
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Custom Type</label>
                <input
                  value={customType}
                  onChange={(e) => setCustomType(e.target.value)}
                  placeholder="Describe poll type"
                  className={inputCls}
                />
              </div>
            )}
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Expiry Date</label>
              <input
                type="datetime-local"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className={inputCls}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: "Anonymous voting", val: isAnonymous, set: setIsAnonymous },
              { label: "Allow multiple votes", val: allowMultipleVotes, set: setAllowMultipleVotes },
              { label: "Allow changing vote", val: allowVoteChange, set: setAllowVoteChange },
              { label: "Show results only after close", val: showResultsAfterClose, set: setShowResultsAfterClose },
            ].map(({ label, val, set }) => (
              <label key={label} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={val}
                  onChange={(e) => set(e.target.checked)}
                  className="w-4 h-4 rounded border-purple-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700">{label}</span>
              </label>
            ))}
          </div>

          <button
            onClick={handleCreate}
            disabled={submitting}
            className="px-6 py-2.5 bg-purple-700 text-white rounded-full text-sm font-semibold hover:bg-purple-800 disabled:opacity-50 transition"
          >
            {submitting ? "Creating..." : "Create Poll"}
          </button>
        </div>
      )}

      {polls.length === 0 ? (
        <div className="text-center py-16">
          <BarChart3 className="w-12 h-12 mx-auto text-purple-200 mb-3" />
          <p className="text-gray-400 text-sm">No polls yet. Create one to get started!</p>
        </div>
      ) : (
        <div className="space-y-5">
          {polls.map((poll) => (
            <PollCard
              key={poll._id}
              poll={poll}
              clubId={clubId}
              token={token}
              canManage={canManage}
              canConvert={canConvert}
              onRefresh={fetchPolls}
              showToast={showToast}
            />
          ))}
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
