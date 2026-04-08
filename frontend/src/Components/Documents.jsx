import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { getTokenFromCookies } from "../Utils/auth";
import { Plus, FileText, ExternalLink } from "lucide-react";
import { API_BASE } from "../config";

function DocumentCard({ doc }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      onClick={() => setExpanded((v) => !v)}
      className="relative bg-white rounded-3xl border border-purple-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-150 p-5 cursor-pointer overflow-hidden"
    >
      <div className="absolute -top-6 -right-6 w-20 h-20 bg-purple-200 rounded-full opacity-40 pointer-events-none" />
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
          <FileText className="w-5 h-5 text-purple-400 stroke-[2.5]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{doc.name}</p>
          <p className="text-xs text-gray-400 mt-0.5">{(doc.size / 1024).toFixed(1)} KB</p>
        </div>
      </div>

      {expanded && (
        <div className="mt-4 space-y-1 border-t border-purple-100 pt-3">
          <p className="text-xs text-gray-500">Type: {doc.type}</p>
          <a
            href={doc.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 text-xs font-semibold text-purple-500 hover:text-purple-700 transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            Open document
          </a>
        </div>
      )}
    </div>
  );
}

export default function Documents({ clubId }) {
  const token = getTokenFromCookies();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef();

  const fetchDocuments = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/documents/club/${clubId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDocuments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [clubId]);

  const handleUpload = async () => {
    if (!file) return alert("Select a file first");
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("clubId", clubId);
    try {
      await axios.post(`${API_BASE}/api/documents/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      setFile(null);
      fetchDocuments();
    } catch (err) {
      console.error(err);
      alert("Upload failed: " + (err.response?.data?.details || err.response?.data?.error || err.message));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6 mt-4">
      <div className="bg-white/80 rounded-3xl p-6 border border-purple-200 shadow-sm relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-200 rounded-full opacity-30 pointer-events-none" />
        <h2 className="text-lg font-bold text-gray-900 mb-4">Upload Document</h2>
        <div className="flex items-center gap-3 flex-wrap">
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => setFile(e.target.files[0])}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current.click()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors"
          >
            <Plus className="w-4 h-4" />
            {file ? file.name : "Choose File"}
          </button>
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 transition-colors"
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>

      <div className="bg-white/80 rounded-3xl p-6 border border-purple-200 shadow-sm relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-200 rounded-full opacity-30 pointer-events-none" />
        <h2 className="text-lg font-bold text-gray-900 mb-4">Documents</h2>
        {loading ? (
          <p className="text-sm text-gray-500">Loading documents…</p>
        ) : documents.length === 0 ? (
          <p className="text-sm text-gray-500">No documents yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc) => (
              <DocumentCard key={doc._id} doc={doc} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
