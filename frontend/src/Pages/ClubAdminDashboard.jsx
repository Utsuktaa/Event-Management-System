import { useParams } from "react-router-dom";
import { useState } from "react";

export default function ClubAdminDashboard() {
  const { clubId } = useParams();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [visibility, setVisibility] = useState("club");

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(
      `Event Created!\nTitle: ${title}\nDescription: ${description}\nDate: ${date}\nVisibility: ${visibility}`
    );
    setTitle("");
    setDescription("");
    setDate("");
    setVisibility("club");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-white flex font-inter">
      <div className="w-full max-w-md m-12">
        <h2 className="text-3xl sm:text-4xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-blue-100">
          Create a Event
        </h2>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl p-6 shadow-md space-y-5 border border-blue-100"
        >
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Event Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 rounded-lg border border-blue-200 focus:border-blue-300 focus:ring-2 focus:ring-blue-100 outline-none transition"
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 rounded-lg border border-blue-200 focus:border-blue-300 focus:ring-2 focus:ring-blue-100 outline-none transition resize-none"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-3 rounded-lg border border-blue-200 focus:border-blue-300 focus:ring-2 focus:ring-blue-100 outline-none transition"
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Visibility
            </label>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
              className="w-full p-3 rounded-lg border border-blue-200 focus:border-blue-300 focus:ring-2 focus:ring-blue-100 outline-none transition"
            >
              <option value="club">Club-only</option>
              <option value="school">Public</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-green-200 text-green-800 font-semibold rounded-lg shadow hover:bg-green-300 transition transform"
          >
            Create Event
          </button>
        </form>
      </div>
    </div>
  );
}
