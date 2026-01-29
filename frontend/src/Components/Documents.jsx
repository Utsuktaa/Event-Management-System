import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { getTokenFromCookies } from "../Utils/auth";
import { Plus } from "lucide-react";

function DocumentCard({ doc }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      onClick={() => setExpanded((v) => !v)}
      className="bg-purple-900 rounded-xl border border-blue-400 overflow-hidden cursor-pointer transition-transform hover:scale-[1.02]"
    >
      <div className="p-4">
        <h3 className="font-pixel text-xl mb-2">{doc.name}</h3>

        {expanded && (
          <div className="text-sm text-gray-300 space-y-2 mt-2">
            <p>Type: {doc.type}</p>
            <p>Size: {(doc.size / 1024).toFixed(2)} KB</p>
            <a
              href={doc.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 underline"
            >
              Open
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Documents({ clubId }) {
  const token = getTokenFromCookies();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState(null);
  const fileInputRef = useRef();

  const fetchDocuments = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/documents/club/${clubId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
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

    const formData = new FormData();
    formData.append("file", file);
    formData.append("clubId", clubId);

    try {
      await axios.post("http://localhost:5000/api/documents/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      setFile(null);
      fetchDocuments(); // refresh list after upload
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }
  };

  return (
    <div>
      {/* Upload Form */}
      <div className="mb-6 flex items-center gap-4">
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => setFile(e.target.files[0])}
          className="hidden"
        />

        <button
          onClick={() => fileInputRef.current.click()}
          className="px-6 py-2 border border-blue-400 font-pixel rounded-full bg-purple-900 hover:bg-blue-400 hover:text-purple-950 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> {file ? file.name : "Choose File"}
        </button>

        <button
          onClick={handleUpload}
          className="px-6 py-2 border border-blue-400 font-pixel rounded-full bg-purple-900 hover:bg-blue-400 hover:text-purple-950"
        >
          Upload
        </button>
      </div>

      {loading ? (
        <p>Loading documents...</p>
      ) : !documents.length ? (
        <p>No documents yet.</p>
      ) : (
        <div className="flex flex-wrap gap-6">
          {documents.map((doc) => (
            <div className="w-full sm:w-[48%] lg:w-[32%]" key={doc._id}>
              <DocumentCard doc={doc} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
