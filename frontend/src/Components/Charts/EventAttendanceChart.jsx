import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function EventAttendanceChart({ data }) {
  return (
    <div className="p-8 border border-blue-400 bg-purple-950">
      <h2 className="font-pixel text-xl mb-6">Event Attendance</h2>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart layout="vertical" data={data} margin={{ left: 80 }}>
          <XAxis type="number" stroke="#ffffff" />
          <YAxis type="category" dataKey="name" stroke="#ffffff" width={160} />
          <Tooltip />
          <Bar dataKey="attendees" fill="#60a5fa" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
