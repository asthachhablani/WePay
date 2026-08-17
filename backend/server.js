const dns = require("dns");
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

// Middleware
app.use(
  cors({
    origin: "https://wepay-1.onrender.com",
  })
);

app.use(express.json());

// Routes
// Routes
// Routes
// Routes
// Routes
const authRoutes = require("./routes/authRoutes");
const kycRoutes = require("./routes/kycRoutes");
const documentRoutes = require("./routes/documentRoutes");
const loanRoutes = require("./routes/loanRoutes");
const adminRoutes = require("./routes/adminRoutes");
const repaymentRoutes = require("./routes/repaymentRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/kyc", kycRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/loans", loanRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/repayments", repaymentRoutes);

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected successfully ✅");
  })
  .catch((error) => {
    console.error("MongoDB connection failed ❌");
    console.error(error.message);
  });

// Test Route
app.get("/", (req, res) => {
  res.json({
    message: "WePay Backend is running 🚀",
  });
});

// Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`WePay server running on http://localhost:${PORT}`);
});