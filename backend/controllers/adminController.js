const Loan = require("../models/Loan");
const Repayment = require("../models/Repayment");
const KYC = require("../models/KYC");

// =====================================================
// GET ALL LOANS - ADMIN
// =====================================================

const getAllLoans = async (req, res) => {
  try {
    const loans = await Loan.find()
      .populate("user", "name email phone")
      .sort({ createdAt: -1 });

    const loansWithRepayments = await Promise.all(
      loans.map(async (loan) => {
        const repayment = await Repayment.findOne({
          loan: loan._id,
        });

        return {
          ...loan.toObject(),
          repayment,
        };
      })
    );

    res.status(200).json({
      message: "All loans fetched successfully",
      loans: loansWithRepayments,
    });
  } catch (error) {
    console.error(
      "Admin loans error:",
      error.message
    );

    res.status(500).json({
      message: "Server error",
    });
  }
};


// =====================================================
// APPROVE LOAN - ADMIN
// =====================================================

const approveLoan = async (req, res) => {
  try {
    const loanId = req.params.id;

    const loan = await Loan.findById(loanId);

    if (!loan) {
      return res.status(404).json({
        message: "Loan not found",
      });
    }

    // =================================================
    // ONLY KYC VERIFIED LOANS CAN BE APPROVED
    // =================================================

    if (loan.status !== "kyc_verified") {
      return res.status(400).json({
        message:
          "Loan can only be approved after KYC verification",
      });
    }

    // =================================================
    // APPROVE LOAN
    // =================================================

    loan.status = "approved";

    await loan.save();

    // =================================================
    // CREATE REPAYMENT
    // =================================================

    const existingRepayment =
      await Repayment.findOne({
        loan: loan._id,
      });

    if (!existingRepayment) {
      await Repayment.create({
        loan: loan._id,

        user: loan.user,

        amountDue:
          loan.totalRepayment,

        amountPaid: 0,

        remainingAmount:
          loan.totalRepayment,

        dueDate: loan.dueDate,

        paymentStatus: "pending",
      });
    }

    // =================================================
    // RESPONSE
    // =================================================

    res.status(200).json({
      message:
        "Loan approved successfully",

      loan: {
        id: loan._id,
        status: loan.status,
      },
    });
  } catch (error) {
    console.error(
      "Approve loan error:",
      error.message
    );

    res.status(500).json({
      message: "Server error",
    });
  }
};


// =====================================================
// REJECT LOAN - ADMIN
// =====================================================

const rejectLoan = async (req, res) => {
  try {
    const loanId = req.params.id;

    const loan = await Loan.findById(loanId);

    if (!loan) {
      return res.status(404).json({
        message: "Loan not found",
      });
    }

    // =================================================
    // ONLY ELIGIBLE / REVIEW LOANS CAN BE REJECTED
    // =================================================

    if (
      loan.status !== "kyc_verified" &&
      loan.status !== "pending"
    ) {
      return res.status(400).json({
        message:
          "This loan cannot be rejected at its current stage",
      });
    }

    loan.status = "rejected";

    await loan.save();

    res.status(200).json({
      message:
        "Loan rejected successfully",

      loan: {
        id: loan._id,
        status: loan.status,
      },
    });
  } catch (error) {
    console.error(
      "Reject loan error:",
      error.message
    );

    res.status(500).json({
      message: "Server error",
    });
  }
};


// =====================================================
// GET ALL KYC - ADMIN
// =====================================================

const getAllKYC = async (req, res) => {
  try {
    const kycs = await KYC.find()
      .populate(
        "user",
        "name email phone"
      )
      .populate(
        "loan",
        "amount loanDuration purpose status"
      )
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      message:
        "All KYC applications fetched successfully",

      kycs,
    });
  } catch (error) {
    console.error(
      "Admin KYC error:",
      error.message
    );

    res.status(500).json({
      message: "Server error",
    });
  }
};


// =====================================================
// VERIFY KYC - ADMIN
// =====================================================

const verifyKYC = async (req, res) => {
  try {
    const kycId = req.params.id;

    const kyc = await KYC.findById(
      kycId
    );

    if (!kyc) {
      return res.status(404).json({
        message:
          "KYC application not found",
      });
    }

    // =================================================
    // ONLY PENDING KYC CAN BE VERIFIED
    // =================================================

    if (
      kyc.verificationStatus !==
      "pending"
    ) {
      return res.status(400).json({
        message:
          "Only pending KYC applications can be verified",
      });
    }

    // =================================================
    // VERIFY KYC
    // =================================================

    kyc.verificationStatus =
      "verified";

    kyc.rejectionReason = "";

    kyc.verifiedAt = new Date();

    await kyc.save();

    // =================================================
    // FIND RELATED LOAN
    // =================================================

    let loan = null;

    // First try KYC's loan reference
    if (kyc.loan) {
      loan = await Loan.findById(
        kyc.loan
      );
    }

    // Fallback for older KYC records
    if (!loan) {
      loan = await Loan.findOne({
        user: kyc.user,

        status: {
          $in: [
            "pending_kyc",
            "kyc_pending_review",
          ],
        },
      }).sort({
        createdAt: -1,
      });
    }

    // =================================================
    // UPDATE LOAN
    // =================================================

    if (loan) {
      loan.status =
        "kyc_verified";

      await loan.save();
    }

    // =================================================
    // RESPONSE
    // =================================================

    res.status(200).json({
      message:
        "KYC verified successfully",

      kyc: {
        id: kyc._id,

        verificationStatus:
          kyc.verificationStatus,

        verifiedAt:
          kyc.verifiedAt,
      },

      loan: loan
        ? {
            id: loan._id,
            status: loan.status,
          }
        : null,
    });
  } catch (error) {
    console.error(
      "Verify KYC error:",
      error.message
    );

    res.status(500).json({
      message: "Server error",
    });
  }
};


// =====================================================
// REJECT KYC - ADMIN
// =====================================================

const rejectKYC = async (req, res) => {
  try {
    const kycId = req.params.id;

    const { reason } = req.body;

    // =================================================
    // CHECK REASON
    // =================================================

    if (
      !reason ||
      !reason.trim()
    ) {
      return res.status(400).json({
        message:
          "Rejection reason is required",
      });
    }

    // =================================================
    // FIND KYC
    // =================================================

    const kyc = await KYC.findById(
      kycId
    );

    if (!kyc) {
      return res.status(404).json({
        message:
          "KYC application not found",
      });
    }

    // =================================================
    // ONLY PENDING KYC CAN BE REJECTED
    // =================================================

    if (
      kyc.verificationStatus !==
      "pending"
    ) {
      return res.status(400).json({
        message:
          "Only pending KYC applications can be rejected",
      });
    }

    // =================================================
    // REJECT KYC
    // =================================================

    kyc.verificationStatus =
      "rejected";

    kyc.rejectionReason =
      reason.trim();

    kyc.verifiedAt = null;

    await kyc.save();

    // =================================================
    // FIND RELATED LOAN
    // =================================================

    let loan = null;

    if (kyc.loan) {
      loan = await Loan.findById(
        kyc.loan
      );
    }

    // Fallback for older KYC records
    if (!loan) {
      loan = await Loan.findOne({
        user: kyc.user,

        status: {
          $in: [
            "pending_kyc",
            "kyc_pending_review",
          ],
        },
      }).sort({
        createdAt: -1,
      });
    }

    // =================================================
    // REJECT RELATED LOAN
    // =================================================

    if (loan) {
      loan.status =
        "rejected";

      await loan.save();
    }

    // =================================================
    // RESPONSE
    // =================================================

    res.status(200).json({
      message:
        "KYC rejected successfully",

      kyc: {
        id: kyc._id,

        verificationStatus:
          kyc.verificationStatus,

        rejectionReason:
          kyc.rejectionReason,
      },

      loan: loan
        ? {
            id: loan._id,
            status: loan.status,
          }
        : null,
    });
  } catch (error) {
    console.error(
      "Reject KYC error:",
      error.message
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
  getAllLoans,
  approveLoan,
  rejectLoan,

  getAllKYC,
  verifyKYC,
  rejectKYC,
};