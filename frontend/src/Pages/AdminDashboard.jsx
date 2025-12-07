import { clearAuthCookies } from "../Utils/auth";

const AdminDashboard = () => {
  const handleLogout = () => {
    clearAuthCookies();
    window.location.href = "/";
  };

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>Welcome, admin!</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default AdminDashboard;
