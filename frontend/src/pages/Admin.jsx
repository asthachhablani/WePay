import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Admin() {
  const navigate = useNavigate();

  const [loans, setLoans] = useState([]);
  const [kycs, setKycs] = useState([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  // =====================================================
  // API BASE URL
  // =====================================================

  const API_URL = import.meta.env.VITE_API_URL;

  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {
    user = null;
  }

  // =====================================================
  // CHECK ADMIN
  // =====================================================

  useEffect(() => {
    if (!token || user?.role !== "admin") {
      navigate("/");
      return;
    }

    fetchData();
  }, []);

  // =====================================================
  // FETCH EVERYTHING
  // =====================================================

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      await Promise.all([fetchLoans(), fetchKYC()]);
    } catch (error) {
      console.error("Admin fetch error:", error);
      setError("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // FETCH LOANS
  // =====================================================

  const fetchLoans = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/loans`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to fetch loans");
      }

      setLoans(data.loans || []);
    } catch (error) {
      console.error("Fetch loans error:", error);
      throw error;
    }
  };

  // =====================================================
  // FETCH KYC
  // =====================================================

  const fetchKYC = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/kyc`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to fetch KYC");
      }

      setKycs(data.kycs || []);
    } catch (error) {
      console.error("Fetch KYC error:", error);
      throw error;
    }
  };

  // =====================================================
  // VERIFY KYC
  // =====================================================

  const handleVerifyKYC = async (kycId) => {
    try {
      setActionLoading(`kyc-${kycId}`);

      const response = await fetch(`${API_URL}/api/admin/kyc/${kycId}/verify`, {
        method: "PATCH",

        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Unable to verify KYC");
        return;
      }

      alert("KYC verified successfully!");

      // Refresh both KYC and loans
      await fetchKYC();
      await fetchLoans();
    } catch (error) {
      console.error("Verify KYC error:", error);

      alert("Unable to connect to server");
    } finally {
      setActionLoading("");
    }
  };

  // =====================================================
  // REJECT KYC
  // =====================================================

  const handleRejectKYC = async (kycId) => {
    const reason = window.prompt("Enter reason for rejecting KYC:");

    if (!reason || !reason.trim()) {
      return;
    }

    try {
      setActionLoading(`kyc-${kycId}`);

      const response = await fetch(`${API_URL}/api/admin/kyc/${kycId}/reject`, {
        method: "PATCH",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          reason: reason.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Unable to reject KYC");
        return;
      }

      alert("KYC rejected successfully!");

      await fetchKYC();
      await fetchLoans();
    } catch (error) {
      console.error("Reject KYC error:", error);

      alert("Unable to connect to server");
    } finally {
      setActionLoading("");
    }
  };

  // =====================================================
  // APPROVE / REJECT LOAN
  // =====================================================

  const handleLoanAction = async (loanId, action) => {
    try {
      setActionLoading(`loan-${loanId}`);

      const response = await fetch(
        `${API_URL}/api/admin/loans/${loanId}/${action}`,
        {
          method: "PATCH",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Action failed");
        return;
      }

      alert(
        action === "approve"
          ? "Loan approved successfully!"
          : "Loan rejected successfully!",
      );

      await fetchLoans();
    } catch (error) {
      console.error("Loan action error:", error);

      alert("Unable to connect to server");
    } finally {
      setActionLoading("");
    }
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
  // FORMAT MONEY
  // =====================================================

  const formatMoney = (amount) => {
    return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
  };

  // =====================================================
  // LOAN STATUS
  // =====================================================

  const getLoanStatusLabel = (status) => {
    switch (status) {
      case "pending_kyc":
        return "KYC Pending";

      case "kyc_pending_review":
        return "KYC Under Review";

      case "kyc_verified":
        return "KYC Verified";

      case "approved":
        return "Approved";

      case "rejected":
        return "Rejected";

      case "active":
        return "Active";

      case "completed":
        return "Completed";

      case "overdue":
        return "Overdue";

      default:
        return status || "Unknown";
    }
  };

  // =====================================================
  // KYC STATUS
  // =====================================================

  const getKYCStatusLabel = (status) => {
    switch (status) {
      case "pending":
        return "Pending Review";

      case "verified":
        return "Verified";

      case "rejected":
        return "Rejected";

      default:
        return status || "Unknown";
    }
  };

  // =====================================================
  // STATS
  // =====================================================

  const totalLoans = loans.length;

  const pendingLoans = loans.filter(
    (loan) =>
      loan.status === "pending_kyc" ||
      loan.status === "kyc_pending_review" ||
      loan.status === "kyc_verified",
  ).length;

  const approvedLoans = loans.filter(
    (loan) => loan.status === "approved" || loan.status === "active",
  ).length;

  const rejectedLoans = loans.filter(
    (loan) => loan.status === "rejected",
  ).length;

  const totalAmount = loans.reduce(
    (sum, loan) => sum + Number(loan.amount || 0),
    0,
  );

  const pendingKYC = kycs.filter(
    (kyc) => kyc.verificationStatus === "pending",
  ).length;

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-spinner"></div>

        <p>Loading admin dashboard...</p>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="admin-page">
      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <nav className="admin-navbar">
        <div className="admin-brand" onClick={() => navigate("/")}>
          <div className="admin-brand-mark">₹</div>

          <div>
            <strong>WEPAY</strong>

            <small>ADMIN PANEL</small>
          </div>
        </div>

        <div className="admin-nav-right">
          <span className="admin-role">Administrator</span>

          <button className="admin-logout" onClick={logout}>
            Logout
          </button>
        </div>
      </nav>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="admin-container">
        {/* =====================================================
            HEADER
        ===================================================== */}

        <section className="admin-heading">
          <div>
            <span>ADMIN CONTROL CENTER</span>

            <h1>Loan management</h1>

            <p>
              Review applications, verify KYC and manage WePay loan requests.
            </p>
          </div>

          <button className="admin-refresh" onClick={fetchData}>
            ↻ Refresh
          </button>
        </section>

        {/* =====================================================
            ERROR
        ===================================================== */}

        {error && <div className="admin-error">{error}</div>}

        {/* =====================================================
            STATS
        ===================================================== */}

        <section className="admin-stats">
          <div className="admin-stat-card">
            <span>Total Loans</span>

            <strong>{totalLoans}</strong>

            <small>All applications</small>
          </div>

          <div className="admin-stat-card pending">
            <span>Pending Review</span>

            <strong>{pendingLoans}</strong>

            <small>Loan stages</small>
          </div>

          <div className="admin-stat-card pending">
            <span>KYC Pending</span>

            <strong>{pendingKYC}</strong>

            <small>Need verification</small>
          </div>

          <div className="admin-stat-card approved">
            <span>Approved</span>

            <strong>{approvedLoans}</strong>

            <small>Approved loans</small>
          </div>

          <div className="admin-stat-card amount">
            <span>Total Loan Value</span>

            <strong>{formatMoney(totalAmount)}</strong>

            <small>Across all applications</small>
          </div>
        </section>

        {/* =====================================================
            KYC SECTION
        ===================================================== */}

        <section className="admin-kyc-section">
          <div className="admin-section-title">
            <div>
              <span>VERIFICATION</span>

              <h2>KYC applications</h2>
            </div>

            <span className="loan-count">{kycs.length} KYC applications</span>
          </div>

          {kycs.length === 0 ? (
            <div className="admin-empty">
              <div>✓</div>

              <h3>No KYC applications</h3>

              <p>Submitted KYC applications will appear here.</p>
            </div>
          ) : (
            <div className="admin-kyc-list">
              {kycs.map((kyc) => (
                <div className="admin-kyc-card" key={kyc._id}>
                  {/* USER */}

                  <div className="kyc-user">
                    <div className="loan-avatar">
                      {(kyc.fullName || kyc.user?.name || "U")
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div>
                      <strong>
                        {kyc.fullName || kyc.user?.name || "Unknown User"}
                      </strong>

                      <span>{kyc.user?.email || "No email"}</span>

                      <small>{kyc.user?.phone || "No phone"}</small>
                    </div>
                  </div>

                  {/* PERSONAL DETAILS */}

                  <div className="admin-kyc-detail">
                    <span>DATE OF BIRTH</span>

                    <strong>
                      {kyc.dateOfBirth
                        ? new Date(kyc.dateOfBirth).toLocaleDateString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            },
                          )
                        : "—"}
                    </strong>
                  </div>

                  <div className="admin-kyc-detail">
                    <span>PAN</span>

                    <strong>{kyc.panNumber || "—"}</strong>
                  </div>

                  <div className="admin-kyc-detail">
                    <span>AADHAAR</span>

                    <strong>
                      XXXX
                      {kyc.aadhaarLast4 || "XXXX"}
                    </strong>
                  </div>

                  <div className="admin-kyc-detail">
                    <span>EMPLOYMENT</span>

                    <strong>{kyc.employmentType || "—"}</strong>
                  </div>

                  <div className="admin-kyc-detail">
                    <span>MONTHLY INCOME</span>

                    <strong>{formatMoney(kyc.monthlyIncome)}</strong>
                  </div>

                  {/* DOCUMENTS */}

                  <div className="kyc-documents">
                    <span>DOCUMENTS</span>

                    <div>
                      {kyc.panDocument && (
                        <a
                          href={`${API_URL}/${kyc.panDocument}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          PAN
                        </a>
                      )}

                      {kyc.aadhaarDocument && (
                        <a
                          href={`${API_URL}/${kyc.aadhaarDocument}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Aadhaar
                        </a>
                      )}

                      {kyc.bankStatement && (
                        <a
                          href={`${API_URL}/${kyc.bankStatement}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Bank Statement
                        </a>
                      )}
                    </div>
                  </div>

                  {/* STATUS */}

                  <div className="admin-kyc-status">
                    <span className={`admin-status ${kyc.verificationStatus}`}>
                      {getKYCStatusLabel(kyc.verificationStatus)}
                    </span>
                  </div>

                  {/* ACTIONS */}

                  {kyc.verificationStatus === "pending" && (
                    <div className="admin-actions">
                      <button
                        className="approve-btn"
                        disabled={actionLoading === `kyc-${kyc._id}`}
                        onClick={() => handleVerifyKYC(kyc._id)}
                      >
                        {actionLoading === `kyc-${kyc._id}`
                          ? "Verifying..."
                          : "Verify KYC"}
                      </button>

                      <button
                        className="reject-btn"
                        disabled={actionLoading === `kyc-${kyc._id}`}
                        onClick={() => handleRejectKYC(kyc._id)}
                      >
                        Reject KYC
                      </button>
                    </div>
                  )}

                  {kyc.verificationStatus === "verified" && (
                    <div className="admin-stage-message success">
                      {kyc.loan?.status === "approved" ? (
                        <small>✓ Loan approved • Repayment created</small>
                      ) : (
                        <small>✓ KYC verified • Loan can now be approved</small>
                      )}
                    </div>
                  )}

                  {kyc.verificationStatus === "rejected" && (
                    <div className="admin-stage-message rejected-message">
                      <small>
                        KYC rejected
                        {kyc.rejectionReason ? ` • ${kyc.rejectionReason}` : ""}
                      </small>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* =====================================================
            LOAN APPLICATIONS
        ===================================================== */}

        <section className="admin-loans-section">
          <div className="admin-section-title">
            <div>
              <span>APPLICATIONS</span>

              <h2>Loan requests</h2>
            </div>

            <span className="loan-count">{loans.length} applications</span>
          </div>

          {loans.length === 0 ? (
            <div className="admin-empty">
              <div>₹</div>

              <h3>No loan applications yet</h3>

              <p>New loan applications will appear here.</p>
            </div>
          ) : (
            <div className="admin-loan-list">
              {loans.map((loan) => (
                <div className="admin-loan-card" key={loan._id}>
                  {/* USER */}

                  <div className="loan-user">
                    <div className="loan-avatar">
                      {(loan.user?.name || "U").charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <strong>{loan.user?.name || "Unknown User"}</strong>

                      <span>{loan.user?.email || "No email"}</span>

                      <small>{loan.user?.phone || "No phone"}</small>
                    </div>
                  </div>

                  {/* AMOUNT */}

                  <div className="admin-loan-detail">
                    <span>AMOUNT</span>

                    <strong>{formatMoney(loan.amount)}</strong>
                  </div>

                  {/* DURATION */}

                  <div className="admin-loan-detail">
                    <span>DURATION</span>

                    <strong>{loan.loanDuration} days</strong>
                  </div>

                  {/* PURPOSE */}

                  <div className="admin-loan-detail purpose">
                    <span>PURPOSE</span>

                    <strong>{loan.purpose || "—"}</strong>
                  </div>

                  {/* PAYMENT */}

                  <div className="admin-loan-detail payment-info">
                    <span>PAYMENT</span>

                    {loan.repayment ? (
                      <>
                        <strong>
                          Paid: {formatMoney(loan.repayment.amountPaid)}
                        </strong>

                        <small>
                          Remaining:{" "}
                          {formatMoney(loan.repayment.remainingAmount)}
                        </small>

                        <small
                          className={`admin-payment-status ${
                            loan.repayment.paymentStatus
                          }`}
                        >
                          {loan.repayment.paymentStatus}
                        </small>
                      </>
                    ) : (
                      <small>No repayment yet</small>
                    )}
                  </div>

                  {/* STATUS */}

                  <div className="admin-loan-status">
                    <span className={`admin-status ${loan.status}`}>
                      {getLoanStatusLabel(loan.status)}
                    </span>
                  </div>

                  {/* PENDING KYC */}

                  {loan.status === "pending_kyc" && (
                    <div className="admin-stage-message">
                      <small>Waiting for user to complete KYC</small>
                    </div>
                  )}

                  {/* KYC REVIEW */}

                  {loan.status === "kyc_pending_review" && (
                    <div className="admin-stage-message">
                      <small>
                        KYC submitted • Waiting for admin verification
                      </small>
                    </div>
                  )}

                  {/* KYC VERIFIED */}

                  {loan.status === "kyc_verified" && (
                    <div className="admin-actions">
                      <button
                        className="approve-btn"
                        disabled={actionLoading === `loan-${loan._id}`}
                        onClick={() => handleLoanAction(loan._id, "approve")}
                      >
                        {actionLoading === `loan-${loan._id}`
                          ? "..."
                          : "Approve Loan"}
                      </button>

                      <button
                        className="reject-btn"
                        disabled={actionLoading === `loan-${loan._id}`}
                        onClick={() => handleLoanAction(loan._id, "reject")}
                      >
                        Reject
                      </button>
                    </div>
                  )}

                  {/* APPROVED */}

                  {loan.status === "approved" && (
                    <div className="admin-stage-message success">
                      <small>✓ Loan approved • Repayment created</small>
                    </div>
                  )}

                  {/* REJECTED */}

                  {loan.status === "rejected" && (
                    <div className="admin-stage-message rejected-message">
                      <small>Application rejected</small>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Admin;
