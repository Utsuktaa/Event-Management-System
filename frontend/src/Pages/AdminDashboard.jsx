import { clearAuthCookies } from "../Utils/auth";
import SuperAdminDashboard from "../Components/SuperAdminDashboard";

const AdminDashboard = () => {
  const handleLogout = () => {
    clearAuthCookies();
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-purple-950 font-poppins text-white flex flex-col items-center py-12 px-4">
      <div className="flex items-center gap-4 mb-8 w-full max-w-6xl">
        <div className="h-1 flex-1 bg-blue-400" />
        <h1 className="font-pixel text-4xl uppercase tracking-wider">
          Admin Dashboard
        </h1>
        <div className="h-1 flex-1 bg-blue-400" />
      </div>

      <div className="w-full max-w-6xl mb-8">
        <SuperAdminDashboard />
      </div>

      <button
        onClick={handleLogout}
        className="px-6 py-3 mb-8 border border-blue-400 font-pixel text-lg uppercase tracking-wider hover:bg-blue-400 hover:text-purple-950 transition"
      >
        Logout
      </button>
    </div>
  );
};

export default AdminDashboard;
