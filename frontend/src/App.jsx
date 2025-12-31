import { Routes, Route } from "react-router-dom";
import Login from "./Pages/Login.jsx";
import SignUp from "./Pages/SignUp.jsx";
import Hero from "./Pages/Hero.jsx";
import UserDashboard from "./Pages/UserDashboard";
import AdminDashboard from "./Pages/AdminDashboard";
import ClubAdminDashboard from "./Pages/ClubAdminDashboard.jsx";
import JoinClubs from "./Pages/JoinClubs.jsx";

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
    </Routes>
  );
}

export default App;
