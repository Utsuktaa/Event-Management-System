import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Users,
  FileText,
  BarChart2,
  MapPin,
  Clock,
} from "lucide-react";

export default function DashboardDesign() {
  const navigate = useNavigate();

  const cards = [
    {
      icon: Calendar,
      title: "Attendance",
      desc: "View your attendance",
      color: "primary",
    },
    {
      icon: Users,
      title: "Leaderboard",
      desc: "View badges and points",
      color: "secondary",
    },
    {
      icon: FileText,
      title: "Explore Events",
      desc: "Join and participate in events",
      color: "accent",
    },
    {
      icon: BarChart2,
      title: "Join Clubs",
      desc: "Join a club to view club-only events",
      color: "primary",
    },
  ];

  const dummyEvents = [
    { title: "Poetry Night", date: "2025-12-28", location: "Auditorium" },
    { title: "Chess Tournament", date: "2025-12-30", location: "Library Hall" },
    { title: "Art Exhibition", date: "2026-01-02", location: "Gallery Room" },
  ];

  const handleCardClick = (title) => {
    if (title === "Join Clubs") navigate("/join-clubs");
  };

  return (
    <div className="min-h-screen bg-purple-950 relative overflow-hidden font-poppins text-white">
      <div className="fixed inset-0 scanlines pointer-events-none z-10" />

      <div className="relative z-20 max-w-6xl mx-auto px-6 py-12">
        <section className="mb-16">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-1 flex-1 bg-blue-400" />
            <h2 className="font-pixel text-4xl uppercase tracking-wider">
              Upcoming Events
            </h2>
            <div className="h-1 flex-1 bg-blue-400" />
          </div>
          <div className="space-y-6">
            {dummyEvents.map((event, i) => (
              <div
                key={i}
                className="p-6 border border-blue-400 bg-purple-950 cursor-pointer group transition-transform hover:translate-x-1 hover:-translate-y-1"
                style={{ animationDelay: `${i * 150}ms` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-pixel text-3xl mb-3">{event.title}</h3>
                    <div className="flex flex-wrap gap-6 font-pixel text-xl">
                      <span className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-blue-400" />
                        {event.date}
                      </span>
                      <span className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-blue-400" />
                        {event.location}
                      </span>
                    </div>
                  </div>
                  <div className="text-blue-400">
                    <span className="font-pixel text-3xl">&gt;&gt;</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center gap-4 mb-8">
            <div className="h-1 flex-1 bg-blue-400" />
            <h2 className="font-pixel text-4xl uppercase tracking-wider">
              ★ Quick Actions ★
            </h2>
            <div className="h-1 flex-1 bg-blue-400" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {cards.map(({ icon: Icon, title, desc, color }, i) => (
              <div
                key={title}
                onClick={() => handleCardClick(title)}
                className="p-8 cursor-pointer border border-blue-400 bg-purple-950 transition-all duration-200 hover:translate-x-2 hover:-translate-y-2"
                style={{ animationDelay: `${(i + 3) * 150}ms` }}
              >
                <div className="inline-flex p-4 border-4 border-blue-400 mb-6">
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-pixel text-3xl mb-2">{title}</h3>
                <p className="text-lg">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <footer className="mt-20 text-center"></footer>
      </div>
    </div>
  );
}
