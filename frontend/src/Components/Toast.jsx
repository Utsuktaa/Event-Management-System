import { X } from "lucide-react";

export default function Toast({ message, type, onClose }) {
  return (
    <div
      className={`fixed top-5 right-5 flex items-center justify-between gap-4 p-4 rounded shadow-lg min-w-[250px] text-white ${
        type === "success" ? "bg-blue-400" : "bg-red-400"
      }`}
    >
      <span>{message}</span>
      <button onClick={onClose} className="p-1">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
