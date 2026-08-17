const mongoose = require("mongoose");


const kycSchema = new mongoose.Schema(
  {

    // =================================================
    // USER
    // =================================================

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },


    // =================================================
    // LOAN
    // =================================================

    loan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Loan",
      default: null,
    },


    // =================================================
    // PERSONAL DETAILS
    // =================================================

    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    dateOfBirth: {
      type: Date,
      required: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },


    // =================================================
    // PAN
    // =================================================

    panNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    panDocument: {
      type: String,
      required: true,
    },


    // =================================================
    // AADHAAR
    // =================================================

    aadhaarLast4: {
      type: String,
      required: true,
      match: /^[0-9]{4}$/,
    },

    aadhaarDocument: {
      type: String,
      required: true,
    },


    // =================================================
    // EMPLOYMENT
    // =================================================

    employmentType: {
      type: String,

      enum: [
        "salaried",
        "self-employed",
        "business",
        "other",
      ],

      required: true,
    },


    // =================================================
    // INCOME
    // =================================================

    monthlyIncome: {
      type: Number,
      required: true,
      min: 0,
    },

    incomeSource: {
      type: String,
      required: true,
      trim: true,
    },


    // =================================================
    // BANK STATEMENT
    // =================================================

    bankStatement: {
      type: String,
      required: true,
    },


    // =================================================
    // VERIFICATION
    // =================================================

    verificationStatus: {
      type: String,

      enum: [
        "pending",
        "verified",
        "rejected",
      ],

      default: "pending",
    },

    rejectionReason: {
      type: String,
      default: "",
    },

    verifiedAt: {
      type: Date,
      default: null,
    },

  },

  {
    timestamps: true,
  }
);


const KYC = mongoose.model(
  "KYC",
  kycSchema
);


module.exports = KYC;