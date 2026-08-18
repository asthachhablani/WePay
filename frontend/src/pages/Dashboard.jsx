import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const [loan, setLoan] = useState(null);
  const [repayment, setRepayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  // =====================================================
  // FETCH DASHBOARD DATA
  // =====================================================

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchDashboardData = async () => {
      try {
        setError("");

        // =================================================
        // GET LOANS
        // =================================================

        const loanResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/api/loans/my-loans`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const loanData = await loanResponse.json();

        if (loanResponse.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
          return;
        }

        if (!loanResponse.ok) {
          throw new Error(loanData.message || "Unable to fetch loan details");
        }

        if (loanData.loans?.length > 0) {
          setLoan(loanData.loans[0]);
        } else {
          setLoan(null);
        }

        // =================================================
        // GET REPAYMENTS
        // =================================================

        const repaymentResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/api/repayments/my-repayments`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const repaymentData = await repaymentResponse.json();

        if (repaymentResponse.ok) {
          if (repaymentData.repayments?.length > 0) {
            setRepayment(repaymentData.repayments[0]);
          } else {
            setRepayment(null);
          }
        }
      } catch (error) {
        console.error("Dashboard error:", error);

        setError(error.message || "Unable to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token, navigate]);

  // =====================================================
  // FORMAT MONEY
  // =====================================================

  const formatMoney = (amount) => {
    return `₹${Math.round(Number(amount || 0)).toLocaleString("en-IN")}`;
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/");
  };

  // =====================================================
  // LOAN STATUS
  // =====================================================

  const loanStatus = String(loan?.status || "").toLowerCase();

  // =====================================================
  // FINANCIALLY APPROVED LOAN
  // =====================================================

  const isLoanApproved =
    loanStatus === "approved" ||
    loanStatus === "active" ||
    loanStatus === "overdue" ||
    loanStatus === "completed";

  // =====================================================
  // ACTIVE APPLICATION
  // =====================================================

  const activeLoanStatuses = [
    "pending_kyc",
    "kyc_pending_review",
    "kyc_verified",
    "pending",
    "approved",
    "active",
    "overdue",
  ];

  const hasActiveLoan = loan && activeLoanStatuses.includes(loanStatus);

  // =====================================================
  // READABLE STATUS
  // =====================================================

  const getReadableStatus = () => {
    switch (loanStatus) {
      case "pending_kyc":
        return "Pending KYC";

      case "kyc_pending_review":
        return "KYC Under Review";

      case "kyc_verified":
        return "KYC Verified";

      case "pending":
        return "Loan Under Review";

      case "approved":
        return "Approved";

      case "active":
        return "Active";

      case "overdue":
        return "Overdue";

      case "rejected":
        return "Rejected";

      case "completed":
        return "Completed";

      default:
        return "Pending";
    }
  };

  // =====================================================
  // STATUS MESSAGE
  // =====================================================

  const getStatusMessage = () => {
    switch (loanStatus) {
      // =================================================
      // LOAN SUBMITTED - KYC REQUIRED
      // =================================================

      case "pending_kyc":
        return {
          type: "pending",
          title: "Your loan request has been submitted.",
          message:
            "Please complete your KYC to continue. Our verification team will review your documents once submitted.",
          icon: "✓",
          button: "Complete KYC →",
        };

      // =================================================
      // KYC SUBMITTED
      // =================================================

      case "kyc_pending_review":
        return {
          type: "review",
          title: "Your KYC has been submitted successfully.",
          message:
            "Our verification team is reviewing your identity and financial documents. Please wait while we verify your KYC.",
          icon: "◷",
          button: null,
        };

      // =================================================
      // KYC VERIFIED
      // =================================================

      case "kyc_verified":
        return {
          type: "verified",
          title: "Your KYC has been verified.",
          message:
            "Your identity and documents have been successfully verified. Our team is now reviewing your loan eligibility.",
          icon: "✓",
          button: null,
        };

      // =================================================
      // LOAN ELIGIBILITY REVIEW
      // =================================================

      case "pending":
        return {
          type: "review",
          title: "Your loan application is under review.",
          message:
            "Your KYC has been completed. Our team is reviewing your income and loan eligibility. You will be notified once a decision is made.",
          icon: "◷",
          button: null,
        };

      // =================================================
      // APPROVED
      // =================================================

      case "approved":
        return {
          type: "approved",
          title: "Your loan has been approved.",
          message:
            "Congratulations! Your loan has been approved and is ready for disbursement.",
          icon: "✓",
          button: null,
        };

      // =================================================
      // ACTIVE
      // =================================================

      case "active":
        return {
          type: "approved",
          title: "Your loan is active.",
          message:
            "Your loan has been disbursed and is currently active. You can track your repayment details below.",
          icon: "✓",
          button: null,
        };

      // =================================================
      // OVERDUE
      // =================================================

      case "overdue":
        return {
          type: "rejected",
          title: "Your repayment is overdue.",
          message: "Please make the pending repayment as soon as possible.",
          icon: "!",
          button: "Make Payment →",
        };

      // =================================================
      // REJECTED
      // =================================================

      case "rejected":
        return {
          type: "rejected",
          title: "Your loan application was not approved.",
          message:
            "Your application has been declined. You may review the decision and apply again when eligible.",
          icon: "!",
          button: "Apply Again →",
        };

      // =================================================
      // COMPLETED
      // =================================================

      case "completed":
        return {
          type: "approved",
          title: "Your loan has been completed.",
          message:
            "This loan has been fully repaid. You can apply for another loan if you need financial assistance.",
          icon: "✓",
          button: "New Loan →",
        };

      default:
        return null;
    }
  };

  const statusMessage = getStatusMessage();

  // =====================================================
  // STATUS ACTION
  // =====================================================

  const handleStatusAction = () => {
    // Complete KYC
    if (loanStatus === "pending_kyc") {
      navigate("/kyc", {
        state: {
          loanId: loan?._id,
        },
      });

      return;
    }

    // Payment
    if (loanStatus === "overdue") {
      navigate("/payment");
      return;
    }

    // Apply again only after rejection
    // or completed loan
    if (loanStatus === "rejected" || loanStatus === "completed") {
      navigate("/apply-loan");
      return;
    }
  };

  // =====================================================
  // REPAYMENT DATA
  // =====================================================

  const totalRepayment = isLoanApproved ? Number(loan?.totalRepayment || 0) : 0;

  const amountPaid = Number(repayment?.amountPaid || 0);

  const remainingAmount = Math.max(totalRepayment - amountPaid, 0);

  const repaymentProgress =
    totalRepayment > 0
      ? Math.min(Math.round((amountPaid / totalRepayment) * 100), 100)
      : 0;

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>

        <p>Loading your dashboard...</p>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="dashboard-page">
      {/* =================================================
          NAVBAR
      ================================================= */}

      <nav className="dashboard-navbar">
        <div className="dashboard-logo" onClick={() => navigate("/")}>
          <div className="dashboard-logo-mark">₹</div>

          <div>
            <strong>WEPAY</strong>

            <small>YOUR FINANCIAL HELPER</small>
          </div>
        </div>

        <div className="dashboard-nav-right">
          <button className="dashboard-home-btn" onClick={() => navigate("/")}>
            Home
          </button>

          <button className="dashboard-logout-btn" onClick={logout}>
            Logout
          </button>
        </div>
      </nav>

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="dashboard-container">
        {/* =================================================
            ERROR
        ================================================= */}

        {error && <div className="dashboard-error">{error}</div>}

        {/* =================================================
            WELCOME
        ================================================= */}

        <section className="dashboard-welcome">
          <div>
            <span className="dashboard-tag">YOUR FINANCIAL OVERVIEW</span>

            <h1>Welcome, {user?.name || "User"} 👋</h1>

            <p>Everything about your WePay loan, in one place.</p>
          </div>

          {/* =================================================
              APPLY BUTTON
              Only when there is NO active application
          ================================================= */}

          {!hasActiveLoan &&
            (!loan ||
              loanStatus === "rejected" ||
              loanStatus === "completed") && (
              <button
                className="dashboard-primary-btn"
                onClick={() => navigate("/apply-loan")}
              >
                {loanStatus === "rejected" || loanStatus === "completed"
                  ? "Apply for a New Loan"
                  : "Apply for a Loan"}

                <span>↗</span>
              </button>
            )}
        </section>

        {/* =================================================
            NO LOAN
        ================================================= */}

        {!loan && (
          <section className="no-loan-card">
            <div className="no-loan-icon">₹</div>

            <div>
              <h2>You don't have an active loan</h2>

              <p>
                Need financial support? Check your options and apply when you're
                ready.
              </p>
            </div>

            <button onClick={() => navigate("/apply-loan")}>
              Explore Loan
              <span>→</span>
            </button>
          </section>
        )}

        {/* =================================================
            LOAN
        ================================================= */}

        {loan && (
          <>
            {/* =================================================
                SECTION HEADING
            ================================================= */}

            <section className="dashboard-section-heading">
              <div>
                <span>LOAN OVERVIEW</span>

                <h2>Your current loan</h2>
              </div>

              <div className={`loan-status-large ${loanStatus}`}>
                {getReadableStatus()}
              </div>
            </section>

            {/* =================================================
                STATUS MESSAGE
            ================================================= */}

            {statusMessage && (
              <section className={`loan-status-message ${statusMessage.type}`}>
                <div className="status-message-icon">{statusMessage.icon}</div>

                <div className="status-message-content">
                  <h3>{statusMessage.title}</h3>

                  <p>{statusMessage.message}</p>
                </div>

                {statusMessage.button && (
                  <button
                    className="status-action-btn"
                    onClick={handleStatusAction}
                  >
                    {statusMessage.button}
                  </button>
                )}
              </section>
            )}

            {/* =================================================
                LOAN CARDS
            ================================================= */}

            <section className="dashboard-cards">
              {/* =================================================
                  LOAN AMOUNT
              ================================================= */}

              <div className="dashboard-card highlight">
                <span className="card-label">Loan Amount</span>

                <h2>{formatMoney(loan.amount)}</h2>

                <p>Original amount requested</p>
              </div>

              {/* =================================================
                  AMOUNT RECEIVED
              ================================================= */}

              <div className="dashboard-card">
                <span className="card-label">Amount Received</span>

                <h2>
                  {isLoanApproved ? formatMoney(loan.disbursedAmount) : "—"}
                </h2>

                <p>
                  {isLoanApproved
                    ? "Amount disbursed to you"
                    : "Will be shown after loan approval"}
                </p>
              </div>

              {/* =================================================
                  TOTAL INTEREST
              ================================================= */}

              <div className="dashboard-card">
                <span className="card-label">Total Interest</span>

                <h2>
                  {isLoanApproved ? formatMoney(loan.totalInterest) : "—"}
                </h2>

                <p>
                  {isLoanApproved
                    ? "Interest for your loan"
                    : "Calculated after approval"}
                </p>
              </div>

              {/* =================================================
                  TOTAL REPAYMENT
              ================================================= */}

              <div className="dashboard-card">
                <span className="card-label">Total Repayment</span>

                <h2>
                  {isLoanApproved ? formatMoney(loan.totalRepayment) : "—"}
                </h2>

                <p>
                  {isLoanApproved
                    ? "Total amount to repay"
                    : "Available after approval"}
                </p>
              </div>

              {/* =================================================
                  LOAN DURATION
              ================================================= */}

              <div className="dashboard-card">
                <span className="card-label">Loan Duration</span>

                <h2>
                  {loan.loanDuration || 0}

                  <small> days</small>
                </h2>

                <p>Selected repayment period</p>
              </div>

              {/* =================================================
                  DUE DATE
              ================================================= */}

              <div className="dashboard-card">
                <span className="card-label">Due Date</span>

                <h2 className="date-value">
                  {isLoanApproved && loan.dueDate
                    ? new Date(loan.dueDate).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "—"}
                </h2>

                <p>
                  {isLoanApproved
                    ? "Your repayment deadline"
                    : "Set after loan approval"}
                </p>
              </div>
            </section>

            {/* =================================================
                REPAYMENT
            ================================================= */}

            {isLoanApproved && repayment && (
              <section className="repayment-panel">
                <div className="repayment-left">
                  <span className="dashboard-tag">REPAYMENT</span>

                  <h2>Repayment overview</h2>

                  <p>Keep track of how much you've paid and what remains.</p>

                  {repayment.paymentStatus !== "paid" &&
                    repayment.remainingAmount > 0 && (
                      <button
                        className="dashboard-payment-btn"
                        onClick={() => navigate("/payment")}
                      >
                        Make Payment
                        <span>→</span>
                      </button>
                    )}

                  <div className="repayment-progress">
                    <div className="progress-top">
                      <span>Repayment progress</span>

                      <strong>{repaymentProgress}%</strong>
                    </div>

                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${repaymentProgress}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="repayment-stats">
                  <div className="repayment-stat">
                    <span>Total Repayment</span>

                    <strong>{formatMoney(totalRepayment)}</strong>
                  </div>

                  <div className="repayment-stat">
                    <span>Amount Paid</span>

                    <strong className="paid">{formatMoney(amountPaid)}</strong>
                  </div>

                  <div className="repayment-stat">
                    <span>Remaining</span>

                    <strong>{formatMoney(remainingAmount)}</strong>
                  </div>
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default Dashboard;
