import { useState } from "react";
import { useNavigate } from "react-router-dom";
import wepayLogo from "../assets/wepay_logo.jpeg";

function ApplyLoan() {
  const navigate = useNavigate();

  const [amount, setAmount] = useState("");
  const [loanDuration, setLoanDuration] = useState("");
  const [purpose, setPurpose] = useState("");

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // =====================================================
  // CALCULATE LOAN SUMMARY
  // =====================================================

  const calculateSummary = () => {
    const loanAmount = Number(amount);
    const duration = Number(loanDuration);

    if (!loanAmount || !duration || !purpose.trim()) {
      setError("Please fill all loan details");
      return;
    }

    if (loanAmount < 1000 || loanAmount > 100000) {
      setError(
        "Loan amount must be between ₹1,000 and ₹1,00,000"
      );
      return;
    }

    if (duration < 1 || duration > 50) {
      setError(
        "Loan duration must be between 1 and 50 days"
      );
      return;
    }

    setError("");

    // Processing fee = 2%
    const processingFee = loanAmount * 0.02;

    // Amount actually received
    const disbursedAmount =
      loanAmount - processingFee;

    // Daily interest = 0.5%
    const totalInterest =
      loanAmount * 0.005 * duration;

    // Total repayment
    const totalRepayment =
      loanAmount + totalInterest;

    setSummary({
      amount: loanAmount,
      processingFee,
      disbursedAmount,
      totalInterest,
      totalRepayment,
      duration,
    });
  };

  // =====================================================
  // SUBMIT LOAN
  // =====================================================

  const submitLoan = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(
  `${import.meta.env.VITE_API_URL}/api/loans/apply`,
  {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            amount: Number(amount),
            loanDuration: Number(loanDuration),
            purpose: purpose.trim(),
          }),
        }
      );

      const data = await response.json();

      // ================= ERROR =================

      if (!response.ok) {
        setError(
          data.message ||
            "Unable to apply for loan"
        );
        return;
      }

      // ================= SUCCESS =================

      setSummary({
        amount: data.loan.amount,
        processingFee: data.loan.processingFee,
        disbursedAmount: data.loan.disbursedAmount,
        totalInterest: data.loan.totalInterest,
        totalRepayment: data.loan.totalRepayment,
        duration: data.loan.loanDuration,
      });

      alert(
        "Loan application submitted successfully!"
      );

      // =================================================
      // GO TO KYC
      // Pass the newly created loan ID
      // =================================================

      navigate("/kyc", {
        state: {
          loanId: data.loan.id || data.loan._id,
        },
      });

    } catch (error) {
      console.error(
        "Loan application error:",
        error
      );

      setError(
        "Unable to connect to server"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="loan-page">

      <div className="loan-card">

        {/* Background Logo */}
        <img
          src={wepayLogo}
          alt=""
          className="page-watermark"
        />

        {/* Heading */}

        <h1>
          Apply for a Loan
        </h1>

        <p className="loan-subtitle">
          See your fees, amount received and
          repayment before you apply.
        </p>

        {/* =====================================================
            FORM
        ===================================================== */}

        <div className="loan-form">

          {/* Loan Amount */}

          <div className="form-group">

            <label>
              Loan Amount
            </label>

            <input
              type="number"
              min="1000"
              max="100000"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setSummary(null);
                setError("");
              }}
            />

          </div>

          {/* Loan Duration */}

          <div className="form-group">

            <label>
              Loan Duration
            </label>

            <input
              type="number"
              min="1"
              max="50"
              placeholder="Enter duration in days"
              value={loanDuration}
              onChange={(e) => {
                setLoanDuration(
                  e.target.value
                );

                setSummary(null);
                setError("");
              }}
            />

          </div>

          {/* Purpose */}

          <div className="form-group">

            <label>
              Purpose
            </label>

            <textarea
              placeholder="e.g. Education, medical expenses, personal needs..."
              value={purpose}
              onChange={(e) => {
                setPurpose(e.target.value);

                setSummary(null);
                setError("");
              }}
            />

          </div>

          {/* Error */}

          {error && (
            <p className="loan-error">
              {error}
            </p>
          )}

          {/* Continue */}

          {!summary && (

            <button
              type="button"
              className="primary-btn loan-button"
              onClick={calculateSummary}
            >
              Continue
            </button>

          )}

        </div>

        {/* =====================================================
            LOAN SUMMARY
        ===================================================== */}

        {summary && (

          <div className="loan-summary">

            <h2>
              Loan Summary
            </h2>

            {/* Requested Amount */}

            <div className="summary-row">

              <span>
                Requested Amount
              </span>

              <strong>
                ₹
                {summary.amount.toLocaleString(
                  "en-IN"
                )}
              </strong>

            </div>

            {/* Processing Fee */}

            <div className="summary-row">

              <span>
                Processing Fee (2%)
              </span>

              <strong>
                - ₹
                {summary.processingFee.toLocaleString(
                  "en-IN"
                )}
              </strong>

            </div>

            <div className="summary-divider"></div>

            {/* Amount Received */}

            <div className="summary-row received">

              <span>
                You'll Receive
              </span>

              <strong>
                ₹
                {summary.disbursedAmount.toLocaleString(
                  "en-IN"
                )}
              </strong>

            </div>

            {/* Duration */}

            <div className="summary-row">

              <span>
                Loan Duration
              </span>

              <strong>
                {summary.duration} days
              </strong>

            </div>

            {/* Interest */}

            <div className="summary-row">

              <span>
                Total Interest
              </span>

              <strong>
                ₹
                {summary.totalInterest.toLocaleString(
                  "en-IN"
                )}
              </strong>

            </div>

            {/* Total Repayment */}

            <div className="summary-row repayment">

              <span>
                Total Repayment
              </span>

              <strong>
                ₹
                {summary.totalRepayment.toLocaleString(
                  "en-IN"
                )}
              </strong>

            </div>

            {/* Confirm */}

            <button
              type="button"
              className="primary-btn loan-button"
              onClick={submitLoan}
              disabled={loading}
            >

              {loading
                ? "Submitting..."
                : "Confirm & Apply"}

            </button>

          </div>

        )}

      </div>

    </div>
  );
}

export default ApplyLoan;