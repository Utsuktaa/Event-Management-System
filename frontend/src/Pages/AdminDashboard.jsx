import { clearAuthCookies } from "../Utils/auth";
import SuperAdminDashboard from "../Components/SuperAdminDashboard";

const AdminDashboard = () => {
  const handleLogout = () => {
    clearAuthCookies();
    window.location.href = "/";
  };

  return (
    <div>
      <h1>Admin Dashboard</h1>

      <SuperAdminDashboard />
    </div>
  );
};

export default AdminDashboard;
