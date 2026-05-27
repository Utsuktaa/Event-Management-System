/**
 * Shared layout wrapper for all user-facing pages.
 * Renders the sidebar, a consistent header with NavbarXP (which includes
 * the notification bell), and an optional footer.
 *
 * Usage:
 *   <PageLayout title="Dashboard" role="user">
 *     <YourContent />
 *   </PageLayout>
 */
import Sidebar from "./Sidebar";
import NavbarXP from "./NavbarXP";

export default function PageLayout({
  title,
  role = "user",
  children,
  footer = true,
  headerRight = null,
}) {
  return (
    <div
      className="min-h-screen font-sans flex"
      style={{ background: "linear-gradient(160deg, #f5f3ff 0%, #faf5ff 50%, #f0f9ff 100%)" }}
    >
      <Sidebar role={role} />

      <div className="flex-1 flex flex-col ml-56">
        <header className="px-8 py-4 border-b border-purple-100 bg-white/90 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-blue-900">{title}</h1>
          <div className="flex items-center gap-3">
            {headerRight}
            <NavbarXP />
          </div>
        </header>

        <main className="flex-1">{children}</main>

        {footer && (
          <footer
            className="py-6 text-center text-xs border-t"
            style={{ color: "rgba(107,114,128,0.7)", borderColor: "rgba(124,58,237,0.08)" }}
          >
            © 2025 EventSync
          </footer>
        )}
      </div>
    </div>
  );
}
