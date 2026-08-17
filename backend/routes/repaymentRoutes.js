const express = require("express");

const {
  createRepayment,
  makePayment,
  getMyRepayments,
} = require("../controllers/repaymentController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Create Repayment - Protected
router.post("/create", protect, createRepayment);

// Make Payment - Protected
router.post("/pay", protect, makePayment);

// Get My Repayments - Protected
router.get("/my-repayments", protect, getMyRepayments);

module.exports = router;