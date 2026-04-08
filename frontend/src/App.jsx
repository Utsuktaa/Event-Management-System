import { Routes, Route } from "react-router-dom";
import Login from "./Pages/Login.jsx";
import SignUp from "./Pages/SignUp.jsx";
import Hero from "./Pages/Hero.jsx";
import UserDashboard from "./Pages/UserDashboard";
import AdminDashboard from "./Pages/AdminDashboard";
import JoinClubs from "./Pages/JoinClubs.jsx";
import JoinClubPage from "./Pages/JoinClubPage.jsx";
import ClubAdminRequests from "./Pages/ClubAdminRequests";
import RegisteredEvents from "./Pages/RegisteredEvents.jsx";
import ClubDashboard from "./Pages/ClubDashboard.jsx";
import ScanAttendance from "./Pages/ScanAttendance";
import AssignAdmins from "./Pages/AssignAdmins";
import AttendanceAnalytics from "./Pages/AttendanceAnalytics";
import ModerationDashboard from "./Pages/ModerationDashboard";
import ActivityPage from "./Pages/ActivityPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Hero />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/user-dashboard" element={<UserDashboard />} />
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
      <Route path="/join-clubs" element={<JoinClubs />} />
      <Route path="/clubs/:clubId/join" element={<JoinClubPage />} />
      <Route path="/clubs/:clubId" element={<ClubDashboard />} />
      <Route path="/clubs/:clubId/requests" element={<ClubAdminRequests />} />
      <Route path="/scan" element={<ScanAttendance />} />
      <Route path="/assign-admins" element={<AssignAdmins />} />
      <Route path="/attendance-analytics" element={<AttendanceAnalytics />} />
      <Route path="/moderation" element={<ModerationDashboard />} />
      <Route path="/my-events" element={<RegisteredEvents />} />
      <Route path="/activity" element={<ActivityPage />} />
    </Routes>
  );
}

export default App;
