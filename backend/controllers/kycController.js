const KYC = require("../models/KYC");
const Loan = require("../models/Loan");

// =====================================================
// SUBMIT KYC
// =====================================================

const submitKYC = async (req, res) => {
  try {
    const {
      loanId,
      fullName,
      dateOfBirth,
      address,
      panNumber,
      aadhaarLast4,
      employmentType,
      monthlyIncome,
      incomeSource,
      otpVerified,
    } = req.body;

    const userId = req.user.userId;

    // =================================================
    // CHECK REQUIRED FIELDS
    // =================================================

    if (
      !fullName ||
      !dateOfBirth ||
      !address ||
      !panNumber ||
      !aadhaarLast4 ||
      !employmentType ||
      !monthlyIncome ||
      !incomeSource
    ) {
      return res.status(400).json({
        message: "Please fill all KYC fields",
      });
    }

    // =================================================
    // OTP CHECK
    // =================================================

    if (otpVerified !== "true") {
      return res.status(400).json({
        message:
          "Please complete Aadhaar OTP verification",
      });
    }

    // =================================================
    // CHECK FILES
    // =================================================

    if (
      !req.files ||
      !req.files.panDocument ||
      !req.files.aadhaarDocument ||
      !req.files.bankStatement
    ) {
      return res.status(400).json({
        message:
          "Please upload PAN, Aadhaar and Bank Statement",
      });
    }

    const panDocument =
      req.files.panDocument[0];

    const aadhaarDocument =
      req.files.aadhaarDocument[0];

    const bankStatement =
      req.files.bankStatement[0];

    // =================================================
    // CHECK EXISTING KYC
    // =================================================

    const existingKYC = await KYC.findOne({
      user: userId,
    });

    if (existingKYC) {
      return res.status(400).json({
        message: "KYC already submitted",
      });
    }

    // =================================================
    // FIND LOAN
    // =================================================

    const loan = await Loan.findOne({
      _id: loanId,
      user: userId,
    });

    if (!loan) {
      return res.status(404).json({
        message:
          "Loan application not found",
      });
    }

    // =================================================
    // LOAN MUST BE WAITING FOR KYC
    // =================================================

    if (loan.status !== "pending_kyc") {
      return res.status(400).json({
        message:
          "KYC cannot be submitted for this loan",
      });
    }

    // =================================================
    // CREATE KYC
    // =================================================

    const kyc = await KYC.create({
      user: userId,

      loan: loan._id,

      fullName,

      dateOfBirth,

      address,

      panNumber,

      aadhaarLast4,

      employmentType,

      monthlyIncome: Number(monthlyIncome),

      incomeSource,

      panDocument:
        panDocument.path,

      aadhaarDocument:
        aadhaarDocument.path,

      bankStatement:
        bankStatement.path,

      verificationStatus: "pending",

      rejectionReason: "",

      verifiedAt: null,
    });

    // =================================================
    // UPDATE LOAN STATUS
    // =================================================
    // KYC has been submitted.
    // Admin now needs to review it.

    loan.status =
      "kyc_pending_review";

    await loan.save();

    // =================================================
    // RESPONSE
    // =================================================

    res.status(201).json({
      message:
        "KYC submitted successfully",

      kyc: {
        id: kyc._id,

        verificationStatus:
          kyc.verificationStatus,
      },

      loan: {
        id: loan._id,

        status: loan.status,
      },
    });
  } catch (error) {
    console.error(
      "KYC submission error:",
      error
    );

    res.status(500).json({
      message: "Server error",
    });
  }
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  submitKYC,
};