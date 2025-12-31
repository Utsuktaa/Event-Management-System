const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth.route");
const connectDB = require("./db/connectDB");
const adminRoutes = require("./routes/admin.route");
const eventRoutes = require("./routes/event.route");
const clubRoutes = require("./routes/club.route");
dotenv.config();

const PORT = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());
connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/clubs", clubRoutes);
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
