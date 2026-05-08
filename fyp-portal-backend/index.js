const express = require("express");
const cors = require("cors");
require("dotenv").config();
const fs = require('fs');
const path = require('path');

const connectDB = require("./config/db");
const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: "Too many requests from this IP, try again later."
});

const app = express();

connectDB();

app.use(cors());
app.use(express.json());
app.use(limiter);

// API ROUTES
app.use("/api/auth", require("./routes/authRoutes.js"));
app.use("/api/public", require("./routes/publicRoutes.js"));
app.use("/api/admin", require("./routes/adminRoutes.js"));
app.use("/api/teacher", require("./routes/teacherRoutes.js"));
app.use("/api/proposals", require("./routes/proposalRoutes.js"));
app.use("/api/projects", require("./routes/projectRoutes.js"));
app.use("/api/deadlines", require("./routes/deadlineRoutes.js")); 

app.use('/uploads', express.static('uploads'));

app.get("/", (req, res) => {
  res.send("FYP Portal Backend Running");
});

// Optional: Memory monitoring for debugging (remove for production)
if (process.env.NODE_ENV === 'development') {
  setInterval(() => {
    const used = process.memoryUsage();
    console.log(`Memory: ${Math.round(used.heapUsed / 1024 / 1024)} MB`);
  }, 30000);
}

// Error handlers
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));