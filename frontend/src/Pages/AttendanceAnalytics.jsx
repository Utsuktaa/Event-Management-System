import AdminMetrics from "../Components/Charts/AdminMetrics";
import EventAttendanceChart from "../Components/Charts/EventAttendanceChart";
import EventDistributionChart from "../Components/Charts/EventDistributionChart";
import EventRankingPanel from "../Components/Charts/EventRankingPanel";
import AttendanceRangePanel from "../Components/Charts/AttendanceRangePanel";

export default function AttendanceAnalytics() {
  const eventData = [
    { name: "Chess Competition", attendees: 82, category: "Academic" },
    { name: "Workshop", attendees: 54, category: "Club" },
    { name: "Orientation", attendees: 120, category: "Academic" },
    { name: "Seminar", attendees: 38, category: "Cultural" },
    { name: "AI Talk", attendees: 67, category: "Club" },
  ];

  const categoryDistribution = [
    { name: "Academic", value: 2 },
    { name: "Club", value: 2 },
    { name: "Cultural", value: 1 },
  ];

  return (
    <div className="min-h-screen bg-purple-950 text-white font-poppins px-6 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-12">
          <div className="h-1 flex-1 bg-blue-400" />
          <h1 className="font-pixel text-4xl uppercase">
            Attendance Analytics
          </h1>
          <div className="h-1 flex-1 bg-blue-400" />
        </div>

        <AdminMetrics data={eventData} />

        <EventAttendanceChart data={eventData} />

        <div className="grid lg:grid-cols-3 gap-8 mt-8">
          <EventDistributionChart data={categoryDistribution} />
          <EventRankingPanel data={eventData} />
        </div>

        <AttendanceRangePanel data={eventData} />
      </div>
    </div>
  );
}
