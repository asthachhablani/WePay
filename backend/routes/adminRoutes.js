const express = require("express");

const {
  getAllLoans,
  approveLoan,
  rejectLoan,
  getAllKYC,
  verifyKYC,
  rejectKYC,
} = require("../controllers/adminController");

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const router = express.Router();

// =====================================================
// LOAN ROUTES
// =====================================================

// Get all loans
router.get(
  "/loans",
  protect,
  adminOnly,
  getAllLoans
);

// Approve loan
router.patch(
  "/loans/:id/approve",
  protect,
  adminOnly,
  approveLoan
);

// Reject loan
router.patch(
  "/loans/:id/reject",
  protect,
  adminOnly,
  rejectLoan
);


// =====================================================
// KYC ROUTES
// =====================================================

// Get all KYC applications
router.get(
  "/kyc",
  protect,
  adminOnly,
  getAllKYC
);

// Verify KYC
router.patch(
  "/kyc/:id/verify",
  protect,
  adminOnly,
  verifyKYC
);

// Reject KYC
router.patch(
  "/kyc/:id/reject",
  protect,
  adminOnly,
  rejectKYC
);


module.exports = router;