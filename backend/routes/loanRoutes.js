const express = require("express");

const {
  applyForLoan,
  getMyLoans,
  getLoanById,
} = require("../controllers/loanController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Apply for Loan - Protected
router.post("/apply", protect, applyForLoan);

// Get My Loans - Protected
router.get("/my-loans", protect, getMyLoans);

// Get Single Loan - Protected
router.get("/:id", protect, getLoanById);

module.exports = router;