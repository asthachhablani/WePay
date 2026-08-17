const Loan = require("../models/Loan");


// =====================================================
// APPLY FOR LOAN
// =====================================================

const applyForLoan = async (req, res) => {
  try {

    const {
      amount,
      loanDuration,
      purpose,
    } = req.body;

    const userId = req.user.userId;


    // =================================================
    // CHECK REQUIRED FIELDS
    // =================================================

    if (
      !amount ||
      !loanDuration ||
      !purpose
    ) {
      return res.status(400).json({
        message:
          "Please fill all loan details",
      });
    }


    // =================================================
    // VALIDATE AMOUNT
    // =================================================

    if (
      amount < 1000 ||
      amount > 100000
    ) {
      return res.status(400).json({
        message:
          "Loan amount must be between ₹1,000 and ₹1,00,000",
      });
    }


    // =================================================
    // VALIDATE DURATION
    // =================================================

    if (
      loanDuration < 1 ||
      loanDuration > 50
    ) {
      return res.status(400).json({
        message:
          "Loan duration must be between 1 and 50 days",
      });
    }


    // =================================================
    // CHECK EXISTING LOAN
    // =================================================

    const existingLoan = await Loan.findOne({
      user: userId,

      status: {
        $in: [
          "pending_kyc",
          "kyc_pending_review",
          "kyc_verified",
          "approved",
          "active",
          "overdue",
        ],
      },
    }).sort({
      createdAt: -1,
    });


    // =================================================
    // EXISTING APPLICATION
    // =================================================

    if (existingLoan) {

      // If KYC is not completed,
      // send user back to the same KYC application.

      if (
        existingLoan.status ===
        "pending_kyc"
      ) {
        return res.status(200).json({
          message:
            "You already have a loan application pending KYC",
          existingApplication: true,
          redirectToKYC: true,

          loan: {
            id: existingLoan._id,
            amount: existingLoan.amount,
            loanDuration:
              existingLoan.loanDuration,
            purpose: existingLoan.purpose,
            status: existingLoan.status,
          },
        });
      }


      // KYC submitted and waiting for admin

      if (
        existingLoan.status ===
        "kyc_pending_review"
      ) {
        return res.status(400).json({
          message:
            "Your KYC is already submitted and is under verification.",
        });
      }


      // KYC verified

      if (
        existingLoan.status ===
        "kyc_verified"
      ) {
        return res.status(400).json({
          message:
            "Your loan application is waiting for admin approval.",
        });
      }


      // Approved / active / overdue

      return res.status(400).json({
        message:
          "You already have an active loan. Please complete it before applying for another loan.",
      });
    }


    // =================================================
    // INTEREST
    // =================================================

    const dailyInterestRate = 0.5;

    const totalInterest =
      amount *
      (dailyInterestRate / 100) *
      loanDuration;


    // =================================================
    // TOTAL REPAYMENT
    // =================================================

    const totalRepayment =
      amount + totalInterest;


    // =================================================
    // PROCESSING FEE
    // =================================================

    const processingFeeRate = 2;

    const processingFee =
      amount *
      (processingFeeRate / 100);


    // =================================================
    // DISBURSED AMOUNT
    // =================================================

    const disbursedAmount =
      amount - processingFee;


    // =================================================
    // DUE DATE
    // =================================================

    const applicationDate =
      new Date();

    const dueDate =
      new Date(applicationDate);

    dueDate.setDate(
      dueDate.getDate() +
        Number(loanDuration)
    );


    // =================================================
    // CREATE LOAN
    // =================================================

    const loan = await Loan.create({

      user: userId,

      amount,

      processingFeeRate,

      processingFee,

      disbursedAmount,

      loanDuration,

      dailyInterestRate,

      totalInterest,

      totalRepayment,

      applicationDate,

      dueDate,

      purpose,

      // IMPORTANT
      // Loan is waiting for KYC

      status: "pending_kyc",

    });


    // =================================================
    // RESPONSE
    // =================================================

    res.status(201).json({

      message:
        "Loan application created. Please complete KYC.",

      loan: {

        id: loan._id,

        amount:
          loan.amount,

        processingFeeRate:
          loan.processingFeeRate,

        processingFee:
          loan.processingFee,

        disbursedAmount:
          loan.disbursedAmount,

        loanDuration:
          loan.loanDuration,

        dailyInterestRate:
          loan.dailyInterestRate,

        totalInterest:
          loan.totalInterest,

        totalRepayment:
          loan.totalRepayment,

        dueDate:
          loan.dueDate,

        status:
          loan.status,

      },

    });

  } catch (error) {

    console.error(
      "Loan application error:",
      error
    );

    res.status(500).json({
      message: "Server error",
    });
  }
};


// =====================================================
// GET MY LOANS
// =====================================================

const getMyLoans = async (req, res) => {
  try {

    const userId =
      req.user.userId;

    const loans =
      await Loan.find({
        user: userId,
      }).sort({
        createdAt: -1,
      });


    res.status(200).json({
      message:
        "Loans fetched successfully",
      loans,
    });

  } catch (error) {

    console.error(
      "Get loans error:",
      error.message
    );

    res.status(500).json({
      message: "Server error",
    });
  }
};


// =====================================================
// GET SINGLE LOAN
// =====================================================

const getLoanById = async (req, res) => {
  try {

    const userId =
      req.user.userId;

    const loanId =
      req.params.id;


    const loan =
      await Loan.findOne({
        _id: loanId,
        user: userId,
      });


    if (!loan) {
      return res.status(404).json({
        message:
          "Loan not found",
      });
    }


    res.status(200).json({
      message:
        "Loan fetched successfully",
      loan,
    });

  } catch (error) {

    console.error(
      "Get loan error:",
      error.message
    );

    res.status(500).json({
      message: "Server error",
    });
  }
};


module.exports = {
  applyForLoan,
  getMyLoans,
  getLoanById,
};