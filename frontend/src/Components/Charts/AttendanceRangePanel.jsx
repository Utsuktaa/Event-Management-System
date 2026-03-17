export default function AttendanceRangePanel({ data }) {
  const max = data.reduce((a, b) => (b.attendees > a.attendees ? b : a));
  const min = data.reduce((a, b) => (b.attendees < a.attendees ? b : a));
  const diff = max.attendees - min.attendees;

  return (
    <div className="p-6 border border-blue-400 bg-purple-950 mt-6">
      <h2 className="font-pixel text-xl mb-4">Attendance Range</h2>
      <p className="font-pixel text-lg">
        Highest Attendance: {max.attendees} ({max.name})
      </p>
      <p className="font-pixel text-lg">
        Lowest Attendance: {min.attendees} ({min.name})
      </p>
      <p className="font-pixel text-lg">Difference: {diff}</p>
    </div>
  );
}
