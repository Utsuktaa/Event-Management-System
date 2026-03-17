export default function AdminMetrics({ data }) {
  const totalEvents = data.length;
  const topEvent = data.reduce((max, e) =>
    e.attendees > max.attendees ? e : max,
  );
  const lowestEvent = data.reduce((min, e) =>
    e.attendees < min.attendees ? e : min,
  );
  const categories = [...new Set(data.map((e) => e.category))].length;

  const metrics = [
    { label: "Total Events", value: totalEvents },
    { label: "Top Event", value: topEvent.name },
    { label: "Lowest Event", value: lowestEvent.name },
    { label: "Categories", value: categories },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
      {metrics.map((m) => (
        <div
          key={m.label}
          className="p-6 border border-blue-400 bg-purple-950 hover:scale-[1.02] transition"
        >
          <h3 className="font-pixel text-lg mb-2">{m.label}</h3>
          <p className="text-3xl font-pixel text-blue-400">{m.value}</p>
        </div>
      ))}
    </div>
  );
}
