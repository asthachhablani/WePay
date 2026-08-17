const mongoose = require("mongoose");

const loanSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // =====================================================
    // LOAN AMOUNT
    // =====================================================

    amount: {
      type: Number,
      required: true,
      min: 1000,
      max: 100000,
    },

    processingFeeRate: {
      type: Number,
      default: 2,
    },

    processingFee: {
      type: Number,
      default: 0,
    },

    // Amount actually received after approval
    disbursedAmount: {
      type: Number,
      default: 0,
    },

    // =====================================================
    // LOAN DURATION
    // =====================================================

    loanDuration: {
      type: Number,
      required: true,
      min: 1,
      max: 50,
    },

    // =====================================================
    // INTEREST
    // =====================================================

    dailyInterestRate: {
      type: Number,
      default: 0.5,
    },

    totalInterest: {
      type: Number,
      required: true,
    },

    totalRepayment: {
      type: Number,
      required: true,
    },

    // =====================================================
    // DATES
    // =====================================================

    applicationDate: {
      type: Date,
      default: Date.now,
    },

    dueDate: {
      type: Date,
      required: true,
    },

    // =====================================================
    // PURPOSE
    // =====================================================

    purpose: {
      type: String,
      required: true,
      trim: true,
    },

    // =====================================================
    // LOAN STATUS
    // =====================================================

    status: {
      type: String,

      enum: [
        "pending_kyc",
        "kyc_pending_review",
        "kyc_verified",
        "pending",
        "approved",
        "rejected",
        "active",
        "completed",
        "overdue",
      ],

      default: "pending_kyc",
    },

    // =====================================================
    // REPAYMENT STATUS
    // =====================================================

    repaymentStatus: {
      type: String,

      enum: [
        "pending",
        "paid",
        "overdue",
      ],

      default: "pending",
    },
  },

  {
    timestamps: true,
  }
);

const Loan = mongoose.model(
  "Loan",
  loanSchema
);

module.exports = Loan;