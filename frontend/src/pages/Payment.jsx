import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Payment() {
  const navigate = useNavigate();

  const [repayment, setRepayment] = useState(null);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchRepayment = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/repayments/my-repayments`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Unable to fetch repayment");
          return;
        }

        const activeRepayment = data.repayments?.find(
          (item) => item.paymentStatus !== "paid" && item.remainingAmount > 0,
        );

        if (!activeRepayment) {
          setError("No pending repayment found");
          return;
        }

        setRepayment(activeRepayment);
      } catch (err) {
        console.error(err);
        setError("Unable to connect to server");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchRepayment();
    } else {
      navigate("/login");
    }
  }, [token, navigate]);

  const handlePayment = async (e) => {
    e.preventDefault();

    const paymentAmount = Number(amount);

    if (!paymentAmount || paymentAmount <= 0) {
      setError("Enter a valid payment amount");
      return;
    }

    if (paymentAmount > repayment.remainingAmount) {
      setError(
        `Payment cannot exceed ₹${repayment.remainingAmount.toLocaleString(
          "en-IN",
        )}`,
      );
      return;
    }

    try {
      setPaying(true);
      setError("");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/repayments/pay`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            repaymentId: repayment._id,
            amount: paymentAmount,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Payment failed");
        return;
      }

      alert("Payment successful! 🎉");

      navigate("/dashboard");
    } catch (err) {
      console.error("Payment error:", err);
      setError("Unable to connect to server");
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="payment-loading">
        <p>Loading payment details...</p>
      </div>
    );
  }

  return (
    <div className="payment-page">
      <div className="payment-card">
        <button className="payment-back" onClick={() => navigate("/dashboard")}>
          ← Dashboard
        </button>

        <span className="payment-eyebrow">WEPAY REPAYMENT</span>

        <h1>Make a payment</h1>

        <p className="payment-subtitle">
          Make a secure payment towards your outstanding loan balance.
        </p>

        {error && <div className="payment-error">{error}</div>}

        {repayment && (
          <>
            <div className="payment-overview">
              <div>
                <span>Total Due</span>

                <strong>₹{repayment.amountDue.toLocaleString("en-IN")}</strong>
              </div>

              <div>
                <span>Already Paid</span>

                <strong>₹{repayment.amountPaid.toLocaleString("en-IN")}</strong>
              </div>

              <div className="payment-remaining">
                <span>Remaining</span>

                <strong>
                  ₹{repayment.remainingAmount.toLocaleString("en-IN")}
                </strong>
              </div>
            </div>

            <form className="payment-form" onSubmit={handlePayment}>
              <label>Payment Amount</label>

              <div className="payment-input-wrap">
                <span>₹</span>

                <input
                  type="number"
                  min="1"
                  max={repayment.remainingAmount}
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              <p className="payment-hint">
                You can make a partial payment or pay the full remaining amount.
              </p>

              <button
                type="submit"
                className="payment-submit"
                disabled={paying}
              >
                {paying ? "Processing..." : "Pay Now →"}
              </button>
            </form>

            <div className="payment-note">
              <span>✓</span>
              Demo payment — no real money is charged.
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Payment;
