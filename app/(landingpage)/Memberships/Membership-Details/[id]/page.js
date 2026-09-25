"use client";

import { useState, useEffect } from "react";
import Header from "app/(landingpage)/LandingPage/components/Header/page";
import FooterSection from "app/(landingpage)/LandingPage/components/Footer/page";
// import SubHeader from "app/(landingpage)/LandingPage/components/SubHeader/page";
import "app/(landingpage)/LandingPage/public/css/style.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { config } from "services/config";
import { postApi } from "services/api";
import Link from "node_modules/next/link";
import Swal from "sweetalert2";

const MembershipDetails = ({ params }) => {
  const { id } = params;
  const [plan, setPlan] = useState(null);
  const [userMembershipDetails, setUserMembershipDetails] = useState()

  // Generate dynamic share URLs
  const currentUrl = typeof window !== "undefined"
    ? window.location.href
    : "";

  const shareText = encodeURIComponent(plan?.plan_name || "Membership Plan");
  const shareUrl = encodeURIComponent(currentUrl);

  const facebookShare = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`;
  const whatsappShare = `https://wa.me/?text=${shareText}%20-%20${shareUrl}`;
  const twitterShare = `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`;
  const emailShare = `mailto:?subject=${shareText}&body=Check this plan: ${currentUrl}`;

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // Fetch membership plan details
  useEffect(() => {
    if (id) fetchPlanDetails();
  }, [id]);

  const fetchPlanDetails = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));

      const response = await postApi(config.ViewMembershipPlan, { id, userMembershipId: user?.membershipId });
      console.log("Plan details:", response.result);
      if (response.statusCode === 200 || response.statusCode === 201) {
        setPlan(response.result);
        setUserMembershipDetails(response.userMembershipDetails)
      }
    } catch (error) {
      console.error("Error fetching plan:", error);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (typeof window !== "undefined") {
      import("bootstrap/dist/js/bootstrap.bundle.min.js")
        .then(() => console.log("Bootstrap JS loaded successfully"))
        .catch((err) => console.error("Failed to load Bootstrap JS", err));
    }
  }, []);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy:", error);
      alert("Failed to copy the link.");
    }
  };

  const copyAndShare = async (url) => {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch (err) {
      console.error("Copy failed:", err);
    }
    window.open(url, "_blank");
  };


  const handleSubscribe = async () => {
    try {
      setProcessing(true);

      const user = JSON.parse(localStorage.getItem("user"));
      if (!user?._id) {
        alert("Please log in first to purchase a membership.");
        setProcessing(false);
        return;
      }

      if (userMembershipDetails?.tier ? plan?.tier >= userMembershipDetails?.tier : false) {
        alert("You are already on a higher plan. If you would like to downgrade your plan, please contact info@vedichealth.org for assistance.")
        setProcessing(false);
        return
      }
      else if (userMembershipDetails?.tier) {
       const result = await Swal.fire({
          title: `Are you sure you want to want upgrade membership`,
          // text: `This will ${action} the course immediately.`,
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: `Yes`,
        })//.then(async (result) => {
          if (!result.isConfirmed) {
            setProcessing(false);
            return
          }
       // });
      }
      const payload = {
        _id: plan?._id,
        user_id: user._id,
      };

      const response = await postApi(
        config.createMembershipPayment,
        payload
      );

      console.log("Payment Link Response:", response);

      if (response.statusCode === 201 && response.data.paymentUrl) {

        window.location.href = response.data.paymentUrl;
      } else {
        alert("Failed to start payment. Please try again.");
      }
    } catch (error) {
      console.error("Error creating payment link:", error);
      alert("Something went wrong while starting the payment.");
    } finally {
      setProcessing(false);
    }
  };

  const arrayheader = [
    { name: "Home", route: "/" },
    { name: "Book Online", route: "/Appointment/components/BookAppointment" },
    { name: "Order", route: "/profile?tab=orders" },
    { name: "Yoga ", route: "/YogaClasses/components/JoinYogaClasses" },
    { name: "Event", route: "/Events" },
    {
      name: "Resources",
      route: "/LandingPage/components/Quiz",
      children: [
        { name: "Dosha Quiz", route: "/LandingPage/components/Quiz" },
        { name: "Health Articles", route: "/LandingPage/components/BookArticles" },
        { name: "Gallery", route: "/LandingPage/components/Gallery" },

      ]
    },
  ];

  return (
    <>
      <Header arrayheader={arrayheader} />
      {/* <SubHeader /> */}

      {/* --------------------------- CONTENT ---------------------------- */}
      <section className="cleansPrograme">
        <div className="container-fluid">
          <div className="breadcrumbGroup my-4 mb-md-5">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <Link href={'/Appointment/components/BookAppointment'}>Booking Page</Link>
              </li>
              <li className="breadcrumb-item">
                <Link href={'/Memberships'}>Membership</Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Detail Page
              </li>
            </ol>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <div className="row">
              <div className="col-lg-4 pe-md-3 mb-3">
                <div className="studioMembership">
                  <figure className="studioImg">
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL}/${plan?.image}`}
                      alt={plan?.plan_name}
                      className="img-fluid"
                    />
                  </figure>
                  <span>{plan?.plan_name}</span>
                  <div className="priceTxt">
                    <b> </b><b>${plan?.price || "N/A"}</b>
                  </div>

                  <div className="priceOptn">
                    <div className="mb-4">
                      <button
                        type="button"
                        className="btn btn-primary w-100"
                        onClick={handleSubscribe}
                        disabled={processing}
                      >
                        {processing ? "Processing..." : "Subscribe Now"}
                      </button>
                    </div>

                    <ul className="d-flex flex-wrap gap-3 justify-content-center">

                      {/* Facebook */}
                      <li>
                        <button
                          onClick={() => copyAndShare(facebookShare)}
                          className="btn p-0 border-0 bg-transparent"
                        >
                          <img
                            src="/images/landingpage/facebook-round-icon.svg"
                            width="32"
                            alt="Facebook"
                          />
                        </button>
                      </li>


                      {/* WhatsApp */}
                      <li>
                        <button
                          onClick={() => copyAndShare(whatsappShare)}
                          className="btn p-0 border-0 bg-transparent"
                        >
                          <img
                            src="/images/landingpage/wattsapp-round-icon.svg"
                            width="32"
                            alt="WhatsApp"
                          />
                        </button>
                      </li>


                      {/* Twitter */}
                      <li>
                        <button
                          onClick={() => copyAndShare(twitterShare)}
                          className="btn p-0 border-0 bg-transparent"
                        >
                          <img
                            src="/images/landingpage/twitter-round-icon.svg"
                            width="32"
                            alt="Twitter"
                          />
                        </button>
                      </li>


                      {/* Email */}
                      <li>
                        <button
                          onClick={() => copyAndShare(emailShare)}
                          className="btn p-0 border-0 bg-transparent"
                        >
                          <img
                            src="/images/landingpage/male-round-icon.svg"
                            width="32"
                            alt="Email"
                          />
                        </button>
                      </li>




                    </ul>


                  </div>
                </div>
              </div>

              <div className="col-lg-8 ps-md-3 mb-3">
                <div
                  className="rightsPart"
                  dangerouslySetInnerHTML={{
                    __html:
                      plan?.plan_description ||
                      "<i>No description provided</i>",
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </section>

      <FooterSection />
    </>
  );
};

export default MembershipDetails;
