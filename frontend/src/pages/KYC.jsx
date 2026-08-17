import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import wepayLogo from "../assets/wepay_logo.jpeg";

function KYC() {
  const navigate = useNavigate();
  const location = useLocation();

  const loanId = location.state?.loanId;

  const [formData, setFormData] = useState({
    fullName: "",
    dateOfBirth: "",
    address: "",
    panNumber: "",
    aadhaarLast4: "",
    employmentType: "",
    monthlyIncome: "",
    incomeSource: "",
  });

  const [panFile, setPanFile] = useState(null);
  const [aadhaarFile, setAadhaarFile] = useState(null);
  const [bankStatementFile, setBankStatementFile] = useState(null);

  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // =====================================================
  // HANDLE INPUT
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  // =====================================================
  // FILE VALIDATION
  // =====================================================

  const validateFile = (file) => {
    if (!file) {
      return false;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "application/pdf",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Only JPG, PNG and PDF files are allowed");
      return false;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5 MB");
      return false;
    }

    setError("");
    return true;
  };

  // =====================================================
  // PAN FILE
  // =====================================================

  const handlePanFile = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (validateFile(file)) {
      setPanFile(file);
    }
  };

  // =====================================================
  // AADHAAR FILE
  // =====================================================

  const handleAadhaarFile = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (validateFile(file)) {
      setAadhaarFile(file);
    }
  };

  // =====================================================
  // BANK STATEMENT
  // =====================================================

  const handleBankStatementFile = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (validateFile(file)) {
      setBankStatementFile(file);
    }
  };

  // =====================================================
  // DEMO OTP
  // =====================================================

  const sendOTP = () => {
    if (formData.aadhaarLast4.length !== 4) {
      setError("Enter last 4 digits of Aadhaar first");
      return;
    }

    setError("");
    setOtpSent(true);

    alert("Demo OTP sent: 1234");
  };

  // =====================================================
  // VERIFY OTP
  // =====================================================

  const verifyOTP = () => {
    if (otp === "1234") {
      setOtpVerified(true);
      setError("");

      alert("Aadhaar OTP verified successfully");
    } else {
      setError("Invalid OTP. Use 1234 for demo verification.");
    }
  };

  // =====================================================
  // SUBMIT KYC
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!loanId) {
      setError("Loan application not found. Please apply for a loan again.");
      return;
    }

    if (!otpVerified) {
      setError("Please complete Aadhaar OTP verification");
      return;
    }

    if (!panFile) {
      setError("Please upload your PAN Card");
      return;
    }

    if (!aadhaarFile) {
      setError("Please upload your Aadhaar Card");
      return;
    }

    if (!bankStatementFile) {
      setError("Please upload your bank statement");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const formDataToSend = new FormData();

      formDataToSend.append("loanId", loanId);

      formDataToSend.append("fullName", formData.fullName);

      formDataToSend.append("dateOfBirth", formData.dateOfBirth);

      formDataToSend.append("address", formData.address);

      formDataToSend.append("panNumber", formData.panNumber);

      formDataToSend.append("aadhaarLast4", formData.aadhaarLast4);

      formDataToSend.append("employmentType", formData.employmentType);

      formDataToSend.append("monthlyIncome", formData.monthlyIncome);

      formDataToSend.append("incomeSource", formData.incomeSource);

      formDataToSend.append("otpVerified", "true");

      // Documents

      formDataToSend.append("panDocument", panFile);

      formDataToSend.append("aadhaarDocument", aadhaarFile);

      formDataToSend.append("bankStatement", bankStatementFile);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/kyc/submit`,
        {
          method: "POST",

          headers: {
            Authorization: `Bearer ${token}`,
          },

          body: formDataToSend,
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Unable to submit KYC");
        return;
      }

      alert("KYC submitted successfully!");

      navigate("/dashboard");
    } catch (error) {
      console.error("KYC submission error:", error);

      setError("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="kyc-page">
      <div className="kyc-card">
        {/* WePay Watermark */}

        <img src={wepayLogo} alt="WePay" className="kyc-watermark" />

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="kyc-header">
          <span className="kyc-label">WEPAY • VERIFICATION</span>

          <h1>Complete your KYC</h1>

          <p>
            Verify your identity and financial information to continue with your
            loan application.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* =================================================
              PERSONAL DETAILS
          ================================================= */}

          <section className="kyc-section">
            <div className="kyc-section-title">
              <span>01</span>

              <div>
                <h2>Personal Details</h2>

                <p>Your basic identity information</p>
              </div>
            </div>

            <div className="kyc-grid">
              <div className="kyc-field">
                <label>Full Name</label>

                <input
                  type="text"
                  name="fullName"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="kyc-field">
                <label>Date of Birth</label>

                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="kyc-field">
              <label>Address</label>

              <textarea
                name="address"
                placeholder="Enter your complete address"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>
          </section>

          {/* =================================================
              PAN
          ================================================= */}

          <section className="kyc-section">
            <div className="kyc-section-title">
              <span>02</span>

              <div>
                <h2>PAN Verification</h2>

                <p>Verify your identity using your PAN card</p>
              </div>
            </div>

            <div className="kyc-grid">
              <div className="kyc-field">
                <label>PAN Number</label>

                <input
                  type="text"
                  name="panNumber"
                  placeholder="ABCDE1234F"
                  maxLength="10"
                  value={formData.panNumber}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      panNumber: e.target.value.toUpperCase(),
                    }))
                  }
                  required
                />
              </div>

              <div className="kyc-field">
                <label>PAN Card</label>

                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={handlePanFile}
                  required
                />

                {panFile && (
                  <small className="file-selected">✓ {panFile.name}</small>
                )}
              </div>
            </div>
          </section>

          {/* =================================================
              AADHAAR
          ================================================= */}

          <section className="kyc-section">
            <div className="kyc-section-title">
              <span>03</span>

              <div>
                <h2>Aadhaar Verification</h2>

                <p>Verify your identity through Aadhaar</p>
              </div>
            </div>

            <div className="kyc-grid">
              <div className="kyc-field">
                <label>Aadhaar Last 4 Digits</label>

                <input
                  type="text"
                  name="aadhaarLast4"
                  placeholder="XXXX"
                  maxLength="4"
                  inputMode="numeric"
                  value={formData.aadhaarLast4}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      aadhaarLast4: e.target.value.replace(/\D/g, ""),
                    }))
                  }
                  required
                />
              </div>

              <div className="kyc-field">
                <label>Aadhaar Card</label>

                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={handleAadhaarFile}
                  required
                />

                {aadhaarFile && (
                  <small className="file-selected">✓ {aadhaarFile.name}</small>
                )}
              </div>
            </div>

            {/* OTP */}

            <div className="otp-box">
              <div>
                <strong>Aadhaar OTP Verification</strong>

                <small>Demo verification for project testing</small>
              </div>

              {!otpSent && !otpVerified && (
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={sendOTP}
                >
                  Send OTP
                </button>
              )}

              {otpSent && !otpVerified && (
                <div className="otp-actions">
                  <input
                    type="text"
                    placeholder="Enter OTP"
                    maxLength="4"
                    inputMode="numeric"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  />

                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={verifyOTP}
                  >
                    Verify OTP
                  </button>
                </div>
              )}

              {otpVerified && <span className="otp-success">✓ Verified</span>}
            </div>
          </section>

          {/* =================================================
              INCOME
          ================================================= */}

          <section className="kyc-section">
            <div className="kyc-section-title">
              <span>04</span>

              <div>
                <h2>Income Details</h2>

                <p>Helps us assess your repayment capacity</p>
              </div>
            </div>

            <div className="kyc-grid">
              <div className="kyc-field">
                <label>Employment Type</label>

                <select
                  name="employmentType"
                  value={formData.employmentType}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select employment type</option>

                  <option value="salaried">Salaried</option>

                  <option value="self-employed">Self-employed</option>

                  <option value="business">Business</option>

                  <option value="other">Other</option>
                </select>
              </div>

              <div className="kyc-field">
                <label>Monthly Income</label>

                <input
                  type="number"
                  name="monthlyIncome"
                  placeholder="₹ Enter monthly income"
                  min="1"
                  value={formData.monthlyIncome}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="kyc-grid">
              <div className="kyc-field">
                <label>Income Source</label>

                <input
                  type="text"
                  name="incomeSource"
                  placeholder="e.g. Salary, Business income"
                  value={formData.incomeSource}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="kyc-field">
                <label>Bank Statement</label>

                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={handleBankStatementFile}
                  required
                />

                {bankStatementFile && (
                  <small className="file-selected">
                    ✓ {bankStatementFile.name}
                  </small>
                )}
              </div>
            </div>
          </section>

          {/* ERROR */}

          {error && <div className="kyc-error">{error}</div>}

          {/* SUBMIT */}

          <div className="kyc-submit-area">
            <p>
              Your documents and information will be reviewed by the WePay
              verification team.
            </p>

            <button
              type="submit"
              className="primary-btn kyc-submit"
              disabled={loading}
            >
              {loading ? "Submitting KYC..." : "Submit KYC →"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default KYC;
