import { Calendar, Users, FileText, BarChart2 } from "lucide-react";

export default function DashboardDesign() {
  const cards = [
    {
      icon: Calendar,
      title: "Attendance",
      color: "pink",
      desc: "View your attendance",
    },
    {
      icon: Users,
      title: "Leaderboard",
      color: "purple",
      desc: "View badges and points",
    },
    {
      icon: FileText,
      title: "Explore Events",
      color: "cyan",
      desc: "Join and participate in events",
    },
    {
      icon: BarChart2,
      title: "Join Clubs",
      color: "lime",
      desc: "Join a club to view club-only events ",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map(({ icon: Icon, title, color, desc }) => (
        <div
          key={title}
          className={`bg-gradient-to-br from-${color}-100 to-${color}-200 rounded-3xl p-6 flex flex-col items-start shadow-lg hover:shadow-xl transition transform hover:-translate-y-1`}
        >
          <div
            className={`bg-white/30 backdrop-blur-sm p-3 rounded-full mb-4 text-${color}-600`}
          >
            <Icon className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
          <p className="text-gray-600 text-sm">{desc}</p>
        </div>
      ))}
    </div>
  );
}
