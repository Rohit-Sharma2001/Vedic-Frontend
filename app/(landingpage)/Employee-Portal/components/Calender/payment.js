import React, { useState } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";

const PaymentForm = ({ paymentIntent }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!stripe || !elements) return;

    const cardElement = elements.getElement(CardElement);

    const { error, paymentIntent } =
      await stripe.confirmCardPayment(paymentIntent.client_secret, {
        payment_method: { card: cardElement },
      });

    if (error) {
      setError(error.message);
    } else if (updatedIntent.status === "succeeded") {
      setSuccess("Payment successful!");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement options={{ style: { base: { fontSize: "16px" } } }} />
      <button className="btn btn-primary w-50" disabled={!stripe || loading}>
        {loading ? "Processing..." : "Take Payment"}
      </button>

      {error && <div style={{ color: "red" }}>{error}</div>}
      {success && <div style={{ color: "green" }}>{success}</div>}
    </form>
  );
};

export default PaymentForm;
