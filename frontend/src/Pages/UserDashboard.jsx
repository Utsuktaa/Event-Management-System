import DashboardDesign from "../Components/DashboardDesign";
import Sidebar from "../Components/Sidebar";

export default function UserDashboard() {
  return (
    <div className="min-h-screen font-sans flex" style={{ background: "linear-gradient(160deg, #f5f3ff 0%, #faf5ff 50%, #f0f9ff 100%)" }}>
      <Sidebar role="user" />

      <div className="flex-1 flex flex-col ml-56">
        <header
          className="px-8 py-4 border-b"
          style={{
            background: "rgba(255,255,255,0.92)",
            borderColor: "rgba(124,58,237,0.08)",
          }}
        >
          <h1 className="text-lg font-semibold" style={{ color: "#1E3A8A" }}>Dashboard</h1>
        </header>

        <main className="flex-1">
          <DashboardDesign />
        </main>

        <footer className="py-6 text-center text-xs border-t" style={{ color: "rgba(107,114,128,0.7)", borderColor: "rgba(124,58,237,0.08)" }}>
          © 2025 EventSync
        </footer>
      </div>
    </div>
  );
}
