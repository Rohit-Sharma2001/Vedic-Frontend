"use client";
import React, { useState, useRef, useEffect } from "react";
import DynamicModal3 from "services/Pop-ups/popup3/page";
import Link from "next/link";
import HeaderWithDropdown from "app/(landingpage)/LandingPage/components/HeaderWithDropdown/page";
import FooterSection from "app/(landingpage)/LandingPage/components/Footer/page";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { config } from "services/config";
import { postApi } from "services/api";
import axios from "axios";
import Loader from "services/Loader/page";
import "app/(landingpage)/LandingPage/public/css/developer.css";
import "app/(landingpage)/LandingPage/public/css/style.css";
// import SubHeader from "app/(landingpage)/LandingPage/components/SubHeader/page";
import moment from "moment";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function CartMethodPage() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [acceptPolicy, setAcceptPolicy] = useState(false);
  const [userData, setUserData] = useState({});
  const [activeTab, setActiveTab] = useState("self");
  const [modalOpen, setModalOpen] = useState(false);
  const [showCardPayment, setShowCardPayment] = useState(false);
  const [cardDetails, setCardDetails] = useState({ nameOnCard: "" });
  const [billingAddress, setBillingAddress] = useState({
    addressLine1: "",
    addressLine2: "",
  });
  const [formError, setFormError] = useState("");
  const [appointmentData, setAppointment] = useState(null);
  const [aboutAppoiment, setAboutAppoiment] = useState("");
  const [selectedFamily, setSelectedFamily] = useState();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    let user = JSON.parse(localStorage.getItem("user") || "{}");
    setUserData(user);
    findAppointment();
  }, []);

  async function findAppointment() {
    try {
      const response = await postApi(config.findAppointment, { _id: id });
      if (response.statusCode === 200 || response.statusCode === 201) {
        setAppointment(response.data[0]);
        setShowCardPayment(response?.isAcceptCard || false);
      }
    } catch (error) {
      console.error("Error fetching appointment:", error);
    }
  }

  const createPayment = async () => {
    if (!billingAddress.addressLine1) {
      setFormError("Billing address 1 is required.");
      return;
    }

    const data = {
      id,
      price: appointmentData?.price || 0,
      familyMemberId: selectedFamily,
      aboutAppoiment,
    };

    if (showCardPayment) {
      const paymentIntent = await handleCardSetup();
      if (!paymentIntent) return;
      data.paymentIntent = paymentIntent;
    } else if (!acceptPolicy) {
      setFormError("Please accept cancellation Policy.");
      return;
    }

    setFormError("");
    const endpoint = config.appointmentPayment;
    const response = await postApi(endpoint, data);

    if (response.statusCode === 200 || response.statusCode === 201) {
      if (!showCardPayment) router.push(response.paymentUrl);
      else window.open(response.paymentUrl);
    }
  };

  const handleCardSetup = async () => {
    setFormError("");
    const stripe = await stripePromise;

    if (!stripe) {
      setFormError("Stripe not ready yet");
      return;
    }

    try {
      const response = await postApi(config.sendKey, {
        _id: appointmentData.userId,
      });
      const data = response.data;

      if (!data.client_secret) {
        setFormError(data.message || "Payment setup failed");
        return;
      }

      // Using Elements hook for card details
      const elements = stripe.elements();
      const cardElement = elements.getElement(CardElement);

      const result = await stripe.confirmCardSetup(data.client_secret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: cardDetails.nameOnCard,
            address: {
              line1: billingAddress.addressLine1,
              line2: billingAddress.addressLine2,
            },
          },
        },
      });

      if (result.error) {
        setFormError(result.error.message);
      } else {
        console.log("✅ Card setup successful:", result.setupIntent.payment_method);
        return result.setupIntent.payment_method;
      }
    } catch (err) {
      console.error(err);
      setFormError("Something went wrong with card setup.");
    }
  };

  return (
    <>
      {loading && <Loader />}
      <HeaderWithDropdown />
      {/* <SubHeader topPosition={80} /> */}

      <div className="cartMain">
        <div className="container-fluid">
          <div className="breadcrumbGroup">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <Link href="/">Services</Link>
              </li>
              <li className="breadcrumb-item">
                <Link href="/Shop">Book Appointment</Link>
              </li>
              <li className="breadcrumb-item active">Payment</li>
            </ol>
          </div>

          <div className="row">
            <div className="col-lg-12 col-xl-7 mb-3">
              <div className="informationLeft">
                <h6 className="fw-semibold mb-3">Vedic Yours Ayurveda</h6>
                <hr className="mb-3" />

                <div className="mb-3">
                  <label className="mb-3 fw-medium fs-7">Who Are You Booking For?</label>
                  <ul className="nav cstmTbs mb-4">
                    <li className="nav-item">
                      <button
                        className={`nav-link ${activeTab === "self" ? "active" : ""}`}
                        onClick={() => setActiveTab("self")}
                      >
                        {userData.name} (ME)
                      </button>
                    </li>
                    <li className="nav-item">
                      <button
                        className={`nav-link ${
                          activeTab === "other" || activeTab === "otherSelected"
                            ? "active"
                            : ""
                        }`}
                        onClick={() => setActiveTab("other")}
                      >
                        Other Person
                        {selectedFamily ? ` (${selectedFamily.firstName})` : ""}
                      </button>
                    </li>
                  </ul>
                </div>

                <div className="inputMain mt-md-3 mt-xl-0 mb-3">
                  <h6 className="fw-semibold mb-3">About Your Appointment</h6>
                  <textarea
                    type="text"
                    className="form-control fs-8"
                    rows="4"
                    onChange={(e) => setAboutAppoiment(e.target.value)}
                    placeholder="Do you have any special request or ideas to share with service provider? (Optional)"
                  />
                </div>

                {showCardPayment && (
                  <>
                    <div className="inputMain mt-md-3 mt-xl-0 mb-3">
                      <h6 className="fw-semibold mb-2">Payment Information</h6>
                      <p className="fs-8 text-orange fst-italic">
                        A card is required to hold your appointment slot. You will not be charged.
                      </p>
                    </div>

                    <Elements stripe={stripePromise}>
                      <StripePaymentForm
                        cardDetails={cardDetails}
                        setCardDetails={setCardDetails}
                        billingAddress={billingAddress}
                        setBillingAddress={setBillingAddress}
                        formError={formError}
                        setFormError={setFormError}
                        appointmentData={appointmentData}
                        acceptPolicy={acceptPolicy}
                        setAcceptPolicy={setAcceptPolicy}
                        handleCardSetup={handleCardSetup}
                      />
                    </Elements>
                  </>
                )}

                {formError && <p className="text-danger mt-3">{formError}</p>}

                <button
                  className="btn btn-primary mt-4"
                  onClick={createPayment}
                >
                  Proceed to Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <FooterSection />
    </>
  );
}

/* ✅ Inline Stripe Card Form */
function StripePaymentForm({
  cardDetails,
  setCardDetails,
  billingAddress,
  setBillingAddress,
  formError,
  setFormError,
  appointmentData,
  acceptPolicy,
  setAcceptPolicy,
  handleCardSetup,
}) {
  const stripe = useStripe();
  const elements = useElements();

  return (
    <div className="card-details-wrapper">
      <div className="mb-3">
        <label>Name on Card</label>
        <input
          type="text"
          className="form-control"
          value={cardDetails.nameOnCard}
          onChange={(e) =>
            setCardDetails((prev) => ({ ...prev, nameOnCard: e.target.value }))
          }
        />
      </div>

      <div className="mb-3">
        <label>Card Details</label>
        <div className="form-control p-2">
          <CardElement options={{ style: { base: { fontSize: "16px" } } }} />
        </div>
      </div>

      <div className="mb-3">
        <label>Billing Address Line 1</label>
        <input
          type="text"
          className="form-control"
          value={billingAddress.addressLine1}
          onChange={(e) =>
            setBillingAddress((prev) => ({
              ...prev,
              addressLine1: e.target.value,
            }))
          }
        />
      </div>

      <div className="mb-3">
        <label>Billing Address Line 2</label>
        <input
          type="text"
          className="form-control"
          value={billingAddress.addressLine2}
          onChange={(e) =>
            setBillingAddress((prev) => ({
              ...prev,
              addressLine2: e.target.value,
            }))
          }
        />
      </div>

      <div className="form-check mb-3">
        <input
          type="checkbox"
          className="form-check-input"
          id="policyCheck"
          checked={acceptPolicy}
          onChange={(e) => setAcceptPolicy(e.target.checked)}
        />
        <label className="form-check-label" htmlFor="policyCheck">
          I accept the cancellation policy.
        </label>
      </div>

      <button
        type="button"
        className="btn btn-secondary"
        onClick={handleCardSetup}
        disabled={!stripe || !elements}
      >
        Save Card
      </button>
    </div>
  );
}
