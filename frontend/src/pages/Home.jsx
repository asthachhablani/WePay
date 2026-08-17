import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
function LoanCalculator({
  token,
  hasActiveLoan,
  navigate,
}) {

  const [amount, setAmount] = useState(10000);
  const [duration, setDuration] = useState(10);

  // WePay fixed daily interest
  const dailyInterestRate = 0.5;

  const totalInterest =
    amount *
    (dailyInterestRate / 100) *
    duration;

  const totalRepayment =
    amount + totalInterest;

  const formatMoney = (value) => {
    return value.toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    });
  };

  const handleAction = () => {

    if (!token) {
      navigate("/login");
      return;
    }

    if (hasActiveLoan) {
      navigate("/dashboard");
      return;
    }

    navigate("/apply-loan");
  };

  return (

    <div className="calculator-box">

      {/* LEFT SIDE */}

      <div className="calculator-controls">

        <div className="calculator-intro">

          <span>
            ESTIMATE YOUR REPAYMENT
          </span>

          <h3>
            How much do you need?
          </h3>

        </div>


        {/* Amount */}

        <div className="calculator-field">

          <div className="field-top">

            <label>
              Loan Amount
            </label>

            <div className="amount-display">
              ₹{formatMoney(amount)}
            </div>

          </div>


          <input
            type="range"
            min="1000"
            max="100000"
            step="500"
            value={amount}
            onChange={(e) =>
              setAmount(Number(e.target.value))
            }
            className="loan-slider"
          />


          <div className="slider-labels">
            <span>₹1,000</span>
            <span>₹1,00,000</span>
          </div>

        </div>


        {/* Duration */}

        <div className="calculator-field">

          <div className="field-top">

            <label>
              Loan Duration
            </label>

            <div className="duration-display">
              {duration} {duration === 1 ? "day" : "days"}
            </div>

          </div>


          <input
            type="range"
            min="1"
            max="50"
            step="1"
            value={duration}
            onChange={(e) =>
              setDuration(Number(e.target.value))
            }
            className="loan-slider"
          />


          <div className="slider-labels">
            <span>1 day</span>
            <span>50 days</span>
          </div>

        </div>


        {/* Fixed Interest */}

        <div className="fixed-rate">

          <div className="rate-icon">
            %
          </div>

          <div>
            <strong>
              Fixed interest rate
            </strong>

            <span>
              {dailyInterestRate}% per day
            </span>
          </div>

          <div className="fixed-badge">
            FIXED
          </div>

        </div>

      </div>


      {/* RIGHT SIDE */}

      <div className="calculator-result">

        <div className="result-label">
          YOUR ESTIMATE
        </div>

        <h3>
          ₹{formatMoney(amount)}
        </h3>

        <p className="result-subtitle">
          You could borrow
        </p>


        <div className="result-details">

          <div>
            <span>
              Loan amount
            </span>

            <strong>
              ₹{formatMoney(amount)}
            </strong>
          </div>


          <div>
            <span>
              Interest rate
            </span>

            <strong>
              {dailyInterestRate}% / day
            </strong>
          </div>


          <div>
            <span>
              Loan duration
            </span>

            <strong>
              {duration} {duration === 1 ? "day" : "days"}
            </strong>
          </div>


          <div>
            <span>
              Total interest
            </span>

            <strong>
              ₹{formatMoney(totalInterest)}
            </strong>
          </div>

        </div>


        <div className="repayment-result">

          <span>
            Total repayment
          </span>

          <strong>
            ₹{formatMoney(totalRepayment)}
          </strong>

        </div>


        <button
          className="calculator-action"
          onClick={handleAction}
        >

          {!token
            ? "Get Started"
            : hasActiveLoan
              ? "View Dashboard"
              : "Apply for a Loan"
          }

          <span>↗</span>

        </button>


        <small className="calculator-note">
          Estimate based on the selected amount,
          duration and fixed interest rate.
        </small>

      </div>

    </div>
  );
}
function Home() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const [hasActiveLoan, setHasActiveLoan] = useState(false);
  const [checkingLoan, setCheckingLoan] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [customerCount, setCustomerCount] = useState(9842);
  const [counterStarted, setCounterStarted] = useState(false);

  const trustRef = useRef(null);

  // Check user's existing loan
  useEffect(() => {
    const checkLoan = async () => {
      if (!token) {
        setCheckingLoan(false);
        return;
      }

      try {
        const response = await fetch(
  `${import.meta.env.VITE_API_URL}/api/loans/my-loans`,
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);

        const data = await response.json();

        if (response.ok && data.loans?.length > 0) {
          const activeLoan = data.loans.some((loan) =>
            ["pending", "approved", "active", "overdue"].includes(
              loan.status
            )
          );

          setHasActiveLoan(activeLoan);
        }
      } catch (error) {
        console.error("Loan check error:", error);
      } finally {
        setCheckingLoan(false);
      }
    };

    checkLoan();
  }, [token]);

  // Start counter when section enters viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !counterStarted) {
          setCounterStarted(true);
        }
      },
      {
        threshold: 0.4,
      }
    );

    if (trustRef.current) {
      observer.observe(trustRef.current);
    }

    return () => observer.disconnect();
  }, [counterStarted]);

  // Counter: 9842 -> 10000
  useEffect(() => {
    if (!counterStarted) return;

    const start = 9842;
    const target = 10000;
    const duration = 2200;

    let startTime = null;

    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;

      const progress = Math.min(
        (currentTime - startTime) / duration,
        1
      );

      const eased =
        1 - Math.pow(1 - progress, 3);

      const value =
        start + (target - start) * eased;

      setCustomerCount(Math.floor(value));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [counterStarted]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const renderMainButton = () => {
    if (!token) {
      return (
        <button
          className="new-primary-btn"
          onClick={() => navigate("/login")}
        >
          Get Started
          <span>↗</span>
        </button>
      );
    }

    if (checkingLoan) {
      return (
        <button className="new-primary-btn" disabled>
          Checking...
        </button>
      );
    }

    if (hasActiveLoan) {
      return (
        <button
          className="new-primary-btn"
          onClick={() => navigate("/dashboard")}
        >
          View Dashboard
          <span>↗</span>
        </button>
      );
    }

    return (
      <button
        className="new-primary-btn"
        onClick={() => navigate("/apply-loan")}
      >
        Apply for a Loan
        <span>↗</span>
      </button>
    );
  };

  return (
    <div className="new-home">

      {/* ================= NAVBAR ================= */}

{/* ================= NAVBAR ================= */}

<nav className="new-navbar">

  {/* Brand */}

  <div
    className="new-logo"
    onClick={() => navigate("/")}
  >
    <div className="logo-mark">
      ₹
    </div>

    <div className="logo-text">
      <strong>WEPAY</strong>
      <small>YOUR FINANCIAL HELPER</small>
    </div>
  </div>


  {/* Navigation */}

  <div className="new-nav-links">

    <a href="#calculator">
      Calculator
    </a>

    <a href="#why">
      Why WePay
    </a>

    <a href="#how">
      How it works
    </a>

    <a href="#faq">
      FAQ
    </a>

  </div>


  {/* Actions */}

  <div className="new-nav-actions">

    {token ? (
      <>
        <button
          className="nav-dashboard"
          onClick={() => navigate("/dashboard")}
        >
          Dashboard
          <span>↗</span>
        </button>

        <button
          className="nav-logout"
          onClick={handleLogout}
        >
          Logout
        </button>
      </>
    ) : (
      <>
        <button
          className="nav-login"
          onClick={() => navigate("/login")}
        >
          Login
        </button>

        <button
          className="nav-get-started"
          onClick={() => navigate("/login")}
        >
          Get Started
          <span>↗</span>
        </button>
      </>
    )}

  </div>

  {/* Mobile Hamburger */}

  <button
    className="mobile-menu-btn"
    onClick={() => setMenuOpen(!menuOpen)}
    aria-label="Toggle navigation menu"
  >
    {menuOpen ? "✕" : "☰"}
  </button>


  {/* Mobile Menu */}

  {menuOpen && (
    <div className="mobile-menu">

      <a
        href="#calculator"
        onClick={() => setMenuOpen(false)}
      >
        Calculator
      </a>

      <a
        href="#why"
        onClick={() => setMenuOpen(false)}
      >
        Why WePay
      </a>

      <a
        href="#how"
        onClick={() => setMenuOpen(false)}
      >
        How it works
      </a>

      <a
        href="#faq"
        onClick={() => setMenuOpen(false)}
      >
        FAQ
      </a>

      <div className="mobile-menu-divider"></div>

      {token ? (
        <>
          <button
            onClick={() => {
              setMenuOpen(false);
              navigate("/dashboard");
            }}
          >
            Dashboard
          </button>

          <button
            onClick={() => {
              setMenuOpen(false);
              handleLogout();
            }}
          >
            Logout
          </button>
        </>
      ) : (
        <>
          <button
            onClick={() => {
              setMenuOpen(false);
              navigate("/login");
            }}
          >
            Login
          </button>

          <button
            onClick={() => {
              setMenuOpen(false);
              navigate("/login");
            }}
          >
            Get Started
          </button>
        </>
      )}

    </div>
  )}
</nav>


      {/* ================= HERO ================= */}

      <section className="new-hero">

        <div className="hero-glow glow-one"></div>
        <div className="hero-glow glow-two"></div>

        <div className="hero-grid">

          <div className="new-hero-copy">

            <div className="hero-pill">
              <span></span>
              SIMPLE • TRANSPARENT • HUMAN
            </div>

            <h1>
              Financial help,
              <br />
              <span>without the headache.</span>
            </h1>

            <p>
              WePay makes borrowing simple, transparent
              and easier to understand — so you know
              exactly where you stand before you apply.
            </p>

            <div className="hero-buttons">
              {renderMainButton()}

              <a
                href="#why"
                className="hero-text-link"
              >
                Discover WePay
                <span>↓</span>
              </a>
            </div>

          </div>


          {/* HERO VISUAL */}

          <div className="new-hero-visual">

            <div className="visual-ring ring-one"></div>
            <div className="visual-ring ring-two"></div>

            <div className="money-card">

              <div className="money-card-top">
                <span>WEPAY</span>
                <span>01</span>
              </div>

              <div className="money-symbol">
                ₹
              </div>

              <div className="money-card-content">
                <small>
                  FINANCIAL SUPPORT
                </small>

                <h3>
                  Simple
                  <br />
                  Borrowing.
                </h3>
              </div>

              <div className="money-card-bottom">
                <span>Clear terms</span>
                <span>•</span>
                <span>Simple process</span>
              </div>

            </div>


            <div className="floating-card floating-one">
              <span className="floating-icon">✓</span>

              <div>
                <strong>Clear terms</strong>
                <small>Know before you apply</small>
              </div>
            </div>


            <div className="floating-card floating-two">
              <span>₹</span>
              <strong>With love</strong>
            </div>

          </div>

        </div>

        <div className="hero-bottom-line">
          <span>SCROLL TO EXPLORE</span>
          <div></div>
        </div>

      </section>

{/* ================= TRUST STRIP ================= */}

<section className="trust-strip">

  <div className="trust-strip-item">

    <div className="trust-strip-icon">
      ✓
    </div>

    <div>
      <strong>
        Clear terms
      </strong>

      <span>
        Know before you apply
      </span>
    </div>

  </div>


  <div className="trust-strip-divider"></div>


  <div className="trust-strip-item">

    <div className="trust-strip-icon">
      %
    </div>

    <div>
      <strong>
        Fixed interest
      </strong>

      <span>
        0.5% per day
      </span>
    </div>

  </div>


  <div className="trust-strip-divider"></div>


  <div className="trust-strip-item">

    <div className="trust-strip-icon">
      ₹
    </div>

    <div>
      <strong>
        Know your repayment
      </strong>

      <span>
        No guessing later
      </span>
    </div>

  </div>


  <div className="trust-strip-divider"></div>


  <div className="trust-strip-item">

    <div className="trust-strip-icon">
      →
    </div>

    <div>
      <strong>
        Simple process
      </strong>

      <span>
        Apply in a few steps
      </span>
    </div>

  </div>

</section>


      {/* ================= WEPAY NUMBERS ================= */}

<section className="new-trust" id="trust">

  <div className="trust-glow"></div>

  <div className="trust-number">

    <small>
      BUILT FOR SIMPLE BORROWING
    </small>

    <div>
      0.5<sup>%</sup>
    </div>

    <span>
      fixed daily interest rate
    </span>

  </div>


  <div className="trust-text">

    <span className="section-tag">
      KNOW YOUR NUMBERS
    </span>

    <h2>
      What you see
      <br />
      is what you repay.
    </h2>

    <p>
      WePay keeps the important numbers clear —
      from the amount you borrow to the interest
      and total repayment.
    </p>

  </div>


  <div className="trust-stats">

    <div>
      <strong>₹1K</strong>
      <span>Minimum loan</span>
    </div>

    <div>
      <strong>₹1L</strong>
      <span>Maximum loan</span>
    </div>

    <div>
      <strong>1–50</strong>
      <span>Days available</span>
    </div>

  </div>

</section>

      {/* ================= LOAN CALCULATOR ================= */}

<section className="loan-preview" id="calculator">

  <div className="loan-preview-heading">

    <div>
      <span className="section-tag">
        PLAN BEFORE YOU BORROW
      </span>

      <h2>
        See what your loan
        <br />
        could look like.
      </h2>
    </div>

    <p>
      Choose an amount and duration to get a quick,
      clear estimate of your interest and repayment.
    </p>

  </div>


  <LoanCalculator
    token={token}
    hasActiveLoan={hasActiveLoan}
    navigate={navigate}
  />

</section>


      {/* ================= WHY WEPAY ================= */}

      <section
        className="new-why"
        id="why"
      >

        <div className="why-intro">

          <div>
            <span className="section-tag">
              WHY WEPAY
            </span>

            <h2>
              Borrowing should
              <br />
              feel <em>simple.</em>
            </h2>
          </div>

          <p>
            No complicated language.
            No unnecessary steps.
            Just a clearer way to get
            the support you need.
          </p>

        </div>


        <div className="why-cards">

          <article className="why-card">

            <div className="why-card-number">
              01
            </div>

            <div className="why-icon">
              ◇
            </div>

            <h3>
              Clear from
              <br />
              the start
            </h3>

            <p>
              See your important loan
              information before you
              make a decision.
            </p>

            <span className="card-arrow">
              ↗
            </span>

          </article>


          <article className="why-card featured">

            <div className="why-card-number">
              02
            </div>

            <div className="why-icon">
              ₹
            </div>

            <h3>
              Know what
              <br />
              you'll repay
            </h3>

            <p>
              Understand fees, interest
              and repayment without
              digging through fine print.
            </p>

            <span className="card-arrow">
              ↗
            </span>

          </article>


          <article className="why-card">

            <div className="why-card-number">
              03
            </div>

            <div className="why-icon">
              ✓
            </div>

            <h3>
              Built around
              <br />
              real people
            </h3>

            <p>
              A borrowing experience
              designed to feel helpful,
              not overwhelming.
            </p>

            <span className="card-arrow">
              ↗
            </span>

          </article>

        </div>

      </section>

      {/* ================= HOW IT WORKS ================= */}

      <section
        className="new-how"
        id="how"
      >

        <div className="how-heading">

          <span className="section-tag">
            HOW IT WORKS
          </span>

          <h2>
            Three steps.
            <br />
            <span>That's it.</span>
          </h2>

        </div>


        <div className="steps-wrapper">

          <div className="step-card">

            <div className="step-number">
              01
            </div>

            <div className="step-line"></div>

            <h3>
              Tell us what you need
            </h3>

            <p>
              Choose your amount, duration
              and purpose.
            </p>

          </div>


          <div className="step-card">

            <div className="step-number">
              02
            </div>

            <div className="step-line"></div>

            <h3>
              Review everything
            </h3>

            <p>
              See your fees, amount received
              and total repayment.
            </p>

          </div>


          <div className="step-card">

            <div className="step-number">
              03
            </div>

            <div className="step-line"></div>

            <h3>
              Keep moving forward
            </h3>

            <p>
              Apply and manage everything
              through your dashboard.
            </p>

          </div>

        </div>

      </section>

{/* ================= FAQ ================= */}

<section className="faq-section" id="faq">

  <div className="faq-heading">

    <span className="section-tag">
      FAQ
    </span>

    <h2>
      Questions?
      <br />
      <span>We've got you.</span>
    </h2>

    <p>
      A few things you might want to know
      before getting started.
    </p>

  </div>


  <div className="faq-list">

    <details className="faq-item">
      <summary>
        <span>
          How is the interest on my loan calculated?
        </span>

        <b>+</b>
      </summary>

      <div className="faq-answer">
        <p>
          WePay currently uses a fixed daily interest
          rate of 0.5%. Your total interest depends on
          the amount you borrow and the number of days
          you choose.
        </p>
      </div>
    </details>


    <details className="faq-item">
      <summary>
        <span>
          How much can I borrow?
        </span>

        <b>+</b>
      </summary>

      <div className="faq-answer">
        <p>
          Loan amounts currently range from
          ₹1,000 to ₹1,00,000, subject to the
          applicable loan terms.
        </p>
      </div>
    </details>


    <details className="faq-item">
      <summary>
        <span>
          How long can I take the loan for?
        </span>

        <b>+</b>
      </summary>

      <div className="faq-answer">
        <p>
          You can currently choose a loan duration
          between 1 and 50 days.
        </p>
      </div>
    </details>


    <details className="faq-item">
      <summary>
        <span>
          Can I apply for another loan if I already have one?
        </span>

        <b>+</b>
      </summary>

      <div className="faq-answer">
        <p>
          You can apply for another loan after your
          existing loan has been completed. An active,
          pending, approved or overdue loan prevents
          a new application.
        </p>
      </div>
    </details>


    <details className="faq-item">
      <summary>
        <span>
          Where can I track my loan?
        </span>

        <b>+</b>
      </summary>

      <div className="faq-answer">
        <p>
          Once you're logged in, you can use your
          dashboard to view your loan information
          and track its status.
        </p>
      </div>
    </details>

  </div>

</section>

      {/* ================= FINAL CTA ================= */}

      <section className="new-cta">

        <div className="cta-circle circle-one"></div>
        <div className="cta-circle circle-two"></div>

        <div className="cta-content">

          <span>
            READY WHEN YOU ARE
          </span>

          <h2>
            Need a little
            <br />
            financial help?
          </h2>

          <p>
            Let's make it simpler.
          </p>

          {renderMainButton()}

        </div>

      </section>


      {/* ================= FOOTER ================= */}

      <footer className="new-footer">

        <div className="footer-top">

          <div className="footer-brand">

            <div className="footer-logo">
              <div className="logo-mark">
                ₹
              </div>

              <div>
                <strong>WEPAY</strong>
                <small>YOUR FINANCIAL HELPER</small>
              </div>
            </div>

            <p>
              Financial help,
              <br />
              made simpler.
            </p>

          </div>


          <div className="footer-column">

            <span>EXPLORE</span>

            <a href="#why">
              Why WePay
            </a>

            <a href="#how">
              How it works
            </a>

            <a href="#trust">
              Our community
            </a>

          </div>


          <div className="footer-column">

            <span>ACCOUNT</span>

            {token ? (
              <>
                <button
                  onClick={() => navigate("/dashboard")}
                >
                  Dashboard
                </button>

                {!hasActiveLoan && (
                  <button
                    onClick={() => navigate("/apply-loan")}
                  >
                    Apply for a Loan
                  </button>
                )}
              </>
            ) : (
              <button
                onClick={() => navigate("/login")}
              >
                Login
              </button>
            )}

          </div>


          <div className="footer-column">

            <span>WE'RE HERE</span>

            <p>
              Simple financial support
              <br />
              when you need it.
            </p>

          </div>

        </div>


        <div className="footer-bottom">

          <span>
            © 2026 WePay. All rights reserved.
          </span>

          <span>
            Built with clarity.
          </span>

        </div>

      </footer>

    </div>
  );
}

export default Home;