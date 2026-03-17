export default function EventRankingPanel({ data }) {
  const sorted = [...data].sort((a, b) => b.attendees - a.attendees);

  return (
    <div className="p-6 border border-blue-400 bg-purple-950">
      <h2 className="font-pixel text-xl mb-4">Event Ranking</h2>
      <ol className="list-decimal pl-6 space-y-1">
        {sorted.map((e, i) => (
          <li key={i} className="font-pixel text-lg">
            {e.name} — {e.attendees}
          </li>
        ))}
      </ol>
    </div>
  );
}
