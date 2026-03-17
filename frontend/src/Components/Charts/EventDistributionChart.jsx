import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

export default function EventDistributionChart({ data }) {
  const colors = ["#60a5fa", "#34d399", "#fbbf24", "#f87171", "#a78bfa"];

  return (
    <div className="p-6 border border-blue-400 bg-purple-950">
      <h2 className="font-pixel text-xl mb-6">Event Distribution</h2>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" outerRadius={110}>
            {data.map((entry, index) => (
              <Cell key={index} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
