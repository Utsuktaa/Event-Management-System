import { X, CheckCircle2, AlertCircle } from "lucide-react";

export default function Toast({ message, type, onClose }) {
  const isSuccess = type === "success";
  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium"
      style={{
        background: isSuccess ? "rgba(22,163,74,0.95)" : "rgba(220,38,38,0.95)",
        backdropFilter: "blur(12px)",
        boxShadow: isSuccess
          ? "0 8px 24px rgba(22,163,74,0.3)"
          : "0 8px 24px rgba(220,38,38,0.3)",
        color: "white",
        minWidth: "220px",
        border: isSuccess
          ? "1px solid rgba(255,255,255,0.2)"
          : "1px solid rgba(255,255,255,0.2)",
      }}
    >
      {isSuccess
        ? <CheckCircle2 className="w-4 h-4 shrink-0" />
        : <AlertCircle className="w-4 h-4 shrink-0" />
      }
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className="p-0.5 rounded-full opacity-70 hover:opacity-100 transition">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
