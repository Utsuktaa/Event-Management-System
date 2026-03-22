const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const connectDB = require("./db/connectDB");

const authRoutes = require("./routes/auth.route");
const adminRoutes = require("./routes/admin.route");
const eventRoutes = require("./routes/event.route");
const clubRoutes = require("./routes/club.route");
const documentRoutes = require("./routes/document.route");
const attendanceRoutes = require("./routes/attendance.route");
const scanRoutes = require("./routes/scan");
const path = require("path");
const dns = require("dns");

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);
const PORT = process.env.PORT || 5000;
const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://c6fb-2400-1a00-3b2c-305a-4403-489e-12f8.ngrok-free.app",
    ],
  }),
);
app.use(express.json());

connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/clubs", clubRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/", scanRoutes);
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
app.use(express.static(path.join(__dirname, "../frontend/dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});
