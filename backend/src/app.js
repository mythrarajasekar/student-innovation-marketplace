const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));
app.use(express.json());

// Test Route
app.get("/", (req, res) => {
  res.json({
    message: "Student Innovation Marketplace API Running..."
  });
});

// Authentication Routes
app.use("/api/auth", authRoutes);

// Project Routes
app.use("/api/projects", projectRoutes);

// Admin Routes
app.use("/api/admin", adminRoutes);

module.exports = app;