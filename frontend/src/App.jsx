import { Routes, Route } from "react-router-dom";
import Login from "./Pages/Login.jsx";
import SignUp from "./Pages/SignUp.jsx";
import Hero from "./Pages/Hero.jsx";
import UserDashboard from "./Pages/UserDashboard";
import AdminDashboard from "./Pages/AdminDashboard";
import ClubAdminDashboard from "./Pages/ClubAdminDashboard.jsx";
import JoinClubs from "./Pages/JoinClubs.jsx";
import JoinClubPage from "./Pages/JoinClubPage.jsx";
import ClubAdminRequests from "./Pages/ClubAdminRequests";
import RegisteredEvents from "./Pages/RegisteredEvents.jsx"; 

function App() {
  return (
    <Routes>
      <Route path="/" element={<Hero />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/user-dashboard" element={<UserDashboard />} />
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
      <Route path="/club-admin/:clubId" element={<ClubAdminDashboard />} />
      <Route path="/join-clubs" element={<JoinClubs />} />
      <Route path="/clubs/:clubId/join" element={<JoinClubPage />} />
      <Route
        path="/club-admin/:clubId/requests"
        element={<ClubAdminRequests />}
      />
      <Route path="/my-events" element={<RegisteredEvents />} />
    </Routes>
  );
}

export default App;
