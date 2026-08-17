const Repayment = require("../models/Repayment");
const Loan = require("../models/Loan");

// Create Repayment
const createRepayment = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { loanId } = req.body;

    // Check loan ID
    if (!loanId) {
      return res.status(400).json({
        message: "Loan ID is required",
      });
    }

    // Find loan belonging to logged-in user
    const loan = await Loan.findOne({
      _id: loanId,
      user: userId,
    });

    if (!loan) {
      return res.status(404).json({
        message: "Loan not found",
      });
    }

    // Only approved loans can have repayment
    if (loan.status !== "approved") {
      return res.status(400).json({
        message: "Repayment can only be created for approved loans",
      });
    }

    // Check if repayment already exists
    const existingRepayment = await Repayment.findOne({
      loan: loanId,
    });

    if (existingRepayment) {
      return res.status(400).json({
        message: "Repayment already exists for this loan",
      });
    }

    // Create repayment
    const repayment = await Repayment.create({
      loan: loan._id,
      user: userId,
      amountDue: loan.totalRepayment,
      amountPaid: 0,
      remainingAmount: loan.totalRepayment,
      dueDate: loan.dueDate,
      paymentStatus: "pending",
    });

    res.status(201).json({
      message: "Repayment created successfully",
      repayment: {
        id: repayment._id,
        loan: repayment.loan,
        amountDue: repayment.amountDue,
        amountPaid: repayment.amountPaid,
        remainingAmount: repayment.remainingAmount,
        dueDate: repayment.dueDate,
        paymentStatus: repayment.paymentStatus,
      },
    });
  } catch (error) {
    console.error("Create repayment error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// Make Payment
const makePayment = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { repaymentId, amount } = req.body;

    // Check fields
    if (!repaymentId || !amount) {
      return res.status(400).json({
        message: "Repayment ID and amount are required",
      });
    }

    // Validate payment amount
    if (amount <= 0) {
      return res.status(400).json({
        message: "Payment amount must be greater than 0",
      });
    }

    // Find repayment belonging to logged-in user
    const repayment = await Repayment.findOne({
      _id: repaymentId,
      user: userId,
    });

    if (!repayment) {
      return res.status(404).json({
        message: "Repayment not found",
      });
    }

    // Check if already paid
    if (repayment.paymentStatus === "paid") {
      return res.status(400).json({
        message: "Repayment is already fully paid",
      });
    }

    // Payment cannot exceed remaining amount
    if (amount > repayment.remainingAmount) {
      return res.status(400).json({
        message: "Payment amount cannot exceed remaining amount",
      });
    }

    // Update payment
    repayment.amountPaid += amount;
    repayment.remainingAmount -= amount;

    // Update status
    if (repayment.remainingAmount === 0) {
      repayment.paymentStatus = "paid";
      repayment.paidAt = new Date();
    } else {
      repayment.paymentStatus = "partial";
    }

    await repayment.save();

    // If fully paid, mark loan as completed
    if (repayment.paymentStatus === "paid") {
      await Loan.findByIdAndUpdate(repayment.loan, {
        status: "completed",
        repaymentStatus: "paid",
      });
    }

    res.status(200).json({
      message: "Payment successful",
      repayment: {
        id: repayment._id,
        amountDue: repayment.amountDue,
        amountPaid: repayment.amountPaid,
        remainingAmount: repayment.remainingAmount,
        paymentStatus: repayment.paymentStatus,
        paidAt: repayment.paidAt,
      },
    });
  } catch (error) {
    console.error("Payment error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};
// Get My Repayments
const getMyRepayments = async (req, res) => {
  try {
    const userId = req.user.userId;

    const repayments = await Repayment.find({
      user: userId,
    })
      .populate("loan", "amount loanDuration purpose status")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Repayments fetched successfully",
      repayments,
    });
  } catch (error) {
    console.error("Get repayments error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  createRepayment,
  makePayment,
  getMyRepayments,
};