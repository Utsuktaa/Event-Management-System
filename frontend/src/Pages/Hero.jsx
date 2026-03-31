import { Link } from "react-router-dom";
import Logo from "../Components/Logo";
import { useEffect, useRef, useState } from "react";
import {
  Calendar,
  CalendarPlus,
  QrCode,
  MessageSquare,
  Shield,
  Trophy,
  Bell,
  ArrowRight,
  Users,
  ChevronRight,
  Menu,
  X,
  Clock,
  MapPin,
  User,
  BarChart3,
} from "lucide-react";

const Counter = ({ target, suffix = "" }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let start = 0;
          const step = Math.ceil(target / 60);
          const timer = setInterval(() => {
            start += step;
            if (start >= target) {
              setCount(target);
              clearInterval(timer);
            } else setCount(start);
          }, 20);
          observer.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);
  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
};

const FadeIn = ({ children, delay = 0, className = "" }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(32px)",
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
};

const features = [
  {
    icon: Calendar,
    title: "Event Management",
    desc: "Create, schedule, and manage campus events. View locations, participants, and registrations.",
    color: "from-blue-500 to-blue-700",
  },
  {
    icon: QrCode,
    title: "QR Attendance",
    desc: "Instant check-in via QR codes. Track attendance generate detailed attendance reports.",
    color: "from-purple-500 to-purple-700",
  },
  {
    icon: MessageSquare,
    title: "Discussions & Collaboration",
    desc: "Club-specific discussion rooms to keep members engaged, share updates, and collaborate on various ideas.",
    color: "from-violet-500 to-violet-700",
  },
  {
    icon: BarChart3,
    title: "Analytics & Reports",
    desc: "Visual dashboards with participation trends, event performance, and engagement metrics.",
    color: "from-indigo-500 to-indigo-700",
  },
  {
    icon: Trophy,
    title: "Leaderboards",
    desc: "Earn points and badges for attending events and contributing. Climb the leaderboard and showcase your achievements.",
    color: "from-amber-500 to-orange-600",
  },
  {
    icon: Bell,
    title: "Notifications",
    desc: "Get notified and stay on-track with upcoming events. ",
    color: "from-purple-600 to-blue-600",
  },
];

const snapshotEvents = [
  {
    _id: "1",
    title: "Annual Tech Fest",
    date: "2026-04-10T09:00:00Z",
    location: "Auditorium",
  },
  {
    _id: "2",
    title: "Photography Workshop",
    date: "2026-04-14T14:00:00Z",
    location: "Arts Block",
  },
  {
    _id: "3",
    title: "Inter-Club Debate",
    date: "2026-04-18T11:00:00Z",
    location: "Lecture Hall",
  },
];

const DashboardSnapshot = () => (
  <section className="bg-white/80 rounded-3xl p-8 border border-purple-200 shadow-sm space-y-6 relative overflow-hidden">
    <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-200 rounded-full opacity-30 pointer-events-none" />
    <h1 className="text-3xl font-bold text-gray-900">Upcoming Events</h1>
    <div className="space-y-6">
      {snapshotEvents.map((event) => (
        <div
          key={event._id}
          className="relative bg-white rounded-3xl border border-purple-200 shadow-sm p-6 overflow-hidden"
        >
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-purple-200 rounded-full opacity-40 pointer-events-none" />
          <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
          <div className="flex gap-6 text-sm text-gray-500 mt-2">
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-400 stroke-[2.5]" />
              {new Date(event.date).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-purple-400 stroke-[2.5]" />
              {event.location}
            </span>
          </div>
        </div>
      ))}
    </div>
  </section>
);

// main component
const Hero = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  return (
    <div className="font-sans bg-white text-gray-900 overflow-x-hidden">
      {/*NAVBAR*/}
      <nav
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          background: "rgba(255,255,255,0.97)",
          backdropFilter: "blur(12px)",
          boxShadow: "0 1px 16px rgba(124,58,237,0.08)",
          borderBottom: "1px solid rgba(124,58,237,0.08)",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/*Logo*/}
          <Logo />

          <div className="hidden md:flex items-center gap-8">
            {["preview", "features", "event-flow"].map((s) => (
              <button
                key={s}
                onClick={() => scrollTo(s)}
                className="text-sm font-medium capitalize transition-colors"
                style={{ color: "#6B7280" }}
                onMouseEnter={(e) => (e.target.style.color = "#7C3AED")}
                onMouseLeave={(e) => (e.target.style.color = "#6B7280")}
              >
                {s.replace(/-/g, " ")}
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-semibold px-4 py-2 rounded-full transition-all"
              style={{ color: "#7C3AED" }}
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="text-sm font-semibold text-white px-5 py-2 rounded-full transition-all hover:opacity-90 hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #1E3A8A, #7C3AED)",
              }}
            >
              Sign Up
            </Link>
          </div>

          <button
            className="md:hidden"
            style={{ color: "#7C3AED" }}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {menuOpen && (
          <div
            className="md:hidden bg-white border-t px-6 py-4 flex flex-col gap-4"
            style={{ borderColor: "rgba(124,58,237,0.1)" }}
          >
            {["preview", "features", "event-flow"].map((s) => (
              <button
                key={s}
                onClick={() => scrollTo(s)}
                className="text-left text-sm font-medium capitalize"
                style={{ color: "#374151" }}
              >
                {s.replace(/-/g, " ")}
              </button>
            ))}
            <div className="flex gap-3 pt-2">
              <Link
                to="/login"
                className="flex-1 text-center border rounded-full py-2 text-sm font-semibold"
                style={{ borderColor: "#7C3AED", color: "#7C3AED" }}
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="flex-1 text-center rounded-full py-2 text-sm font-semibold text-white"
                style={{
                  background: "linear-gradient(135deg,#1E3A8A,#7C3AED)",
                }}
              >
                Sign Up
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/*HERO SECTION*/}
      <section
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #f5f3ff 0%, #ede9fe 50%, #ddd6fe 100%)",
        }}
      >
        <div
          className="absolute top-20 left-10 w-72 h-72 rounded-full opacity-30 blur-3xl"
          style={{ background: "#c4b5fd" }}
        />
        <div
          className="absolute bottom-20 right-10 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ background: "#a5b4fc" }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-32 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <Logo size="lg" />
            <p
              className="text-2xl md:text-3xl font-semibold mb-4"
              style={{ color: "#4C1D95" }}
            >
              All Your Events in One place
            </p>
            <p
              className="text-base md:text-lg mb-10 leading-relaxed"
              style={{ color: "#6B7280" }}
            >
              The all-in-one student event platform: explore events, track
              attendance, join clubs, and participate in leaderboards.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-bold text-white text-sm transition-all hover:scale-105 hover:shadow-lg"
                style={{
                  background: "#1E3A8A",
                }}
              >
                Get Started <ArrowRight size={16} />
              </Link>
              <button
                onClick={() => scrollTo("features")}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-bold text-sm transition-all hover:scale-105"
                style={{
                  background: "white",
                  border: "1.5px solid #7C3AED",
                  color: "#7C3AED",
                  boxShadow: "0 2px 12px rgba(124,58,237,0.1)",
                }}
              >
                Explore Features <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="hidden md:flex justify-center items-center">
            <div className="relative w-80 h-80">
              <div
                className="absolute inset-0 rounded-full border-2 border-dashed opacity-40 animate-spin"
                style={{ borderColor: "#7C3AED", animationDuration: "20s" }}
              />
              <div
                className="absolute inset-8 rounded-full border-2 border-dashed opacity-25 animate-spin"
                style={{
                  borderColor: "#1E3A8A",
                  animationDuration: "15s",
                  animationDirection: "reverse",
                }}
              />
              <div
                className="absolute inset-16 rounded-2xl flex flex-col items-center justify-center gap-2"
                style={{
                  background: "white",
                  boxShadow: "0 8px 32px rgba(124,58,237,0.15)",
                  border: "1px solid rgba(124,58,237,0.15)",
                }}
              >
                <Calendar size={32} color="#7C3AED" />
                <span
                  className="text-xs font-semibold"
                  style={{ color: "#1E3A8A" }}
                >
                  Events
                </span>
              </div>
              {[
                { icon: QrCode, angle: 0, color: "#7C3AED" },
                { icon: Trophy, angle: 90, color: "#F59E0B" },
                { icon: BarChart3, angle: 180, color: "#1E3A8A" },
                { icon: Users, angle: 270, color: "#7C3AED" },
              ].map(({ icon: Icon, angle, color }) => {
                const rad = (angle * Math.PI) / 180;
                const x = 50 + 42 * Math.cos(rad);
                const y = 50 + 42 * Math.sin(rad);
                return (
                  <div
                    key={angle}
                    className="absolute w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{
                      left: `${x}%`,
                      top: `${y}%`,
                      transform: "translate(-50%,-50%)",
                      background: "white",
                      boxShadow: "0 4px 16px rgba(124,58,237,0.15)",
                      border: "1px solid rgba(124,58,237,0.12)",
                    }}
                  >
                    <Icon size={18} color={color} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-40">
          <div
            className="w-px h-8 animate-bounce"
            style={{ background: "#7C3AED" }}
          />
          <span className="text-xs" style={{ color: "#7C3AED" }}>
            Scroll
          </span>
        </div>
      </section>

      {/*DASHBOARD PREVIEW*/}
      <section id="preview" className="py-16 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <FadeIn className="text-center mb-10">
            <span
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: "#7C3AED" }}
            >
              Dashboard Preview
            </span>
          </FadeIn>
          <FadeIn delay={100}>
            <DashboardSnapshot />
          </FadeIn>
        </div>
      </section>

      {/*FEATURES SECTION*/}
      <section id="features" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <FadeIn className="text-center mb-16">
            <span
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: "#7C3AED" }}
            >
              Features
            </span>
          </FadeIn>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <FadeIn key={f.title} delay={i * 80}>
                <div
                  className="group bg-white rounded-2xl p-6 h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                  style={{
                    boxShadow: "0 2px 16px rgba(124,58,237,0.07)",
                    border: "1px solid rgba(124,58,237,0.1)",
                  }}
                >
                  <div
                    className={`w-12 h-12 rounded-xl bg-linear-to-br ${f.color} flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110`}
                  >
                    <f.icon size={22} color="white" />
                  </div>
                  <h3
                    className="text-lg font-bold mb-2"
                    style={{ color: "#1E3A8A" }}
                  >
                    {f.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ROLES*/}
      <section
        id="event-flow"
        className="py-24 px-6"
        style={{ background: "#f5f3ff" }}
      >
        <div className="max-w-6xl mx-auto">
          <FadeIn className="text-center mb-16">
            <h2
              className="text-4xl font-extrabold mt-2"
              style={{ color: "#1E3A8A" }}
            >
              How the Platform Works
            </h2>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-6">
            {/* ADMIN */}
            <FadeIn>
              <div
                className="rounded-2xl p-6 h-full"
                style={{
                  background: "white",
                  boxShadow: "0 2px 16px rgba(124,58,237,0.07)",
                  border: "1px solid rgba(124,58,237,0.1)",
                }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={{
                    background: "linear-gradient(135deg,#1E3A8A,#7C3AED)",
                  }}
                >
                  <Shield size={20} color="white" />
                </div>

                <h3
                  className="text-lg font-bold mb-3"
                  style={{ color: "#1E3A8A" }}
                >
                  Admin
                </h3>

                <ul className="flex flex-col gap-2 text-sm text-gray-500">
                  <li>Manages all clubs</li>
                  <li>Monitors platform access</li>
                  <li>Views system-wide reports</li>
                </ul>
              </div>
            </FadeIn>

            {/* CLUB ADMIN */}
            <FadeIn>
              <div
                className="rounded-2xl p-6 h-full"
                style={{
                  background: "white",
                  boxShadow: "0 2px 16px rgba(124,58,237,0.07)",
                  border: "1px solid rgba(124,58,237,0.1)",
                }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={{
                    background: "linear-gradient(135deg,#1E3A8A,#7C3AED)",
                  }}
                >
                  <CalendarPlus size={20} color="white" />
                </div>

                <h3
                  className="text-lg font-bold mb-3"
                  style={{ color: "#1E3A8A" }}
                >
                  Club Admin
                </h3>

                <ul className="flex flex-col gap-2 text-sm text-gray-500">
                  <li>Creates and manages events</li>
                  <li>Participates in discussions</li>
                  <li>Tracks club participation</li>
                </ul>
              </div>
            </FadeIn>

            {/* STUDENT */}
            <FadeIn>
              <div
                className="rounded-2xl p-6 h-full"
                style={{
                  background: "white",
                  boxShadow: "0 2px 16px rgba(124,58,237,0.07)",
                  border: "1px solid rgba(124,58,237,0.1)",
                }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={{
                    background: "linear-gradient(135deg,#1E3A8A,#7C3AED)",
                  }}
                >
                  <User size={20} color="white" />
                </div>

                <h3
                  className="text-lg font-bold mb-3"
                  style={{ color: "#1E3A8A" }}
                >
                  Student
                </h3>

                <ul className="flex flex-col gap-2 text-sm text-gray-500">
                  <li>Joins and registers for events</li>
                  <li>Earns badges and awards</li>
                  <li>Tracks participation history</li>
                </ul>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/*FOOTER*/}
      <footer className="py-12 px-6" style={{ background: "#1E1B4B" }}>
        <div className="max-w-7xl mx-auto">
          {/* TOP ROW */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-10">
            <div>
              <Logo />

              <p
                className="text-sm mt-3 leading-relaxed"
                style={{ color: "rgba(255,255,255,0.45)" }}
              >
                The all-in-one platform for students, events, and clubs.
              </p>
            </div>

            <div className="md:text-right">
              <h4
                className="text-sm font-bold mb-4"
                style={{ color: "rgba(255,255,255,0.8)" }}
              >
                Account
              </h4>

              <ul className="flex flex-col gap-2 md:items-end">
                <li>
                  <a
                    href="/login"
                    className="text-sm"
                    style={{ color: "rgba(255,255,255,0.45)" }}
                  >
                    Login
                  </a>
                </li>

                <li>
                  <a
                    href="/signup"
                    className="text-sm"
                    style={{ color: "rgba(255,255,255,0.45)" }}
                  >
                    Sign Up
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div
            className="my-8"
            style={{ borderTop: "1px solid rgba(255,255,255,0.15)" }}
          />

          <div className="flex justify-between items-center">
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
              © 2025 EventSync. All rights reserved.
            </p>

            <a
              href="https://github.com/Utsuktaa/Event-Management-System"
              target="_blank"
              rel="noreferrer"
              className="text-xs"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Hero;
