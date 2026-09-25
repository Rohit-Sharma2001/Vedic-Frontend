"use client";
import Header from "app/(landingpage)/LandingPage/components/Header/page";
import FooterSection from "app/(landingpage)/LandingPage/components/Footer/page";
import "app/(landingpage)/LandingPage/public/css/style.css";
import { useEffect, useState } from "react";
import { postApi } from "services/api";
import { config } from "services/config";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
// import SubHeader from "app/(landingpage)/LandingPage/components/SubHeader/page";


const YogaClassDetail = ({ params }) => {
  // 🔗 For copying URL
  const [currentUrl, setCurrentUrl] = useState("");
  const [finalPrice, setFinalPrice] = useState(0);

  const [isMemberPrice, setIsMemberPrice] = useState(false);



  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentUrl(window.location.href);
    }
  }, []);

  const handleCopyUrl = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(currentUrl);
        Swal.fire({
          icon: "success",
          title: "Class link copied!",
          timer: 1200,
          showConfirmButton: true,
        });
      } else {
        // fallback for non-HTTPS or older browsers
        const textArea = document.createElement("textarea");
        textArea.value = currentUrl;
        textArea.style.position = "fixed";
        textArea.style.opacity = 0;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        Swal.fire({
          icon: "success",
          title: "Class link copied!",
          timer: 1200,
          showConfirmButton: false,
        });
      }
    } catch (err) {
      console.error("Failed to copy URL:", err);
      Swal.fire({ icon: "error", title: "Failed to copy link" });
    }
  };


  const router = useRouter();

  const [event, setEvent] = useState(null);
  const isExpired = event?.date ? new Date(event.date) < new Date() : false;

  const [loading, setLoading] = useState(true);
  const [imagePreview, setImagePreview] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [userData, setUserData] = useState({});
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [errors, setErrors] = useState({});
  const [user, setUser] = useState({
    name: "",
    lastName: "",
    mobileNo: "",
    email: "",
  });

  const id = params.id;

  useEffect(() => {
    if (id) fetchEventDetails();
  }, [id]);

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || JSON.stringify({}));
      setUserData(user || {});
    } catch (_) { }
  }, []);

  const handleSignUpClick = () => {
    if (!event) return;

    if (isExpired) {
      Swal.fire({
        icon: "error",
        title: "Class Expired",
        text: "This Class has already ended.",
      });
      return;
    }

    if (event.isFullyBooked) {
      Swal.fire({
        icon: "error",
        title: "Class Fully Booked",
        text: "No more slots are available.",
      });
      return;
    }

    if (!userData?._id) {
      const modal = new bootstrap.Modal(document.getElementById("guestuserModal"));
      modal.show();
      return;
    }


    // 🟢 Show modal
    const modal = new bootstrap.Modal(document.getElementById("registerModal"));
    modal.show();
  };

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      setUserData(user);
    } catch {
      setUserData({});
    }
  }, []);



  const fetchEventDetails = async () => {
    try {
      const response = await postApi(config.ViewYogaClass, { id });
      if (response.statusCode === 200 || response.statusCode === 201) {
        const eventData = response.class;
        setEvent(eventData);

        const imageUrl = `${process.env.NEXT_PUBLIC_API_URL}/${eventData.coverImage}`.replace(/\\/g, "/");
        setImagePreview(imageUrl);

        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        if (eventData.is_exclusive && storedUser?.membershipId) {
          const memberPrice = eventData.membership_pricing?.find(
            (p) => p.membership_id === storedUser.membershipId
          );
          if (memberPrice) {
            setFinalPrice(memberPrice.price);
            setIsMemberPrice(true); // 🟢 mark as membership price
          } else {
            setFinalPrice(eventData.Price);
            setIsMemberPrice(false);
          }
        } else {
          setFinalPrice(eventData.Price);
          setIsMemberPrice(false);
        }
      }
    } catch (error) {
      console.error("Error fetching Class details:", error);
    } finally {
      setLoading(false);
    }
  };



  // ---------- Modal Helpers ----------
  const getSubtotal = () => {
    const price = Number(finalPrice || 0);

    return Math.max(1, Number(quantity || 1)) * price;
  };

  const getTotal = () => {
    const subtotal = getSubtotal();
    return Math.max(0, subtotal - Number(discount || 0));
  };

  const decreaseQty = () => {
    setQuantity((q) => Math.max(1, Number(q || 1) - 1));
  };

  const increaseQty = () => {
    setQuantity((q) => Math.min(event.maxTicketsPerUser, Number(q || 1) + 1));
  };

  const onQtyInput = (e) => {
    const val = parseInt(e.target.value, 10);
    if (isNaN(val)) {
      setQuantity(1);
    } else {
      setQuantity(Math.min(event?.maxTicketsPerUser, Math.max(1, val)));
    }
  };
  useEffect(() => {
    if (!appliedCoupon) {
      setDiscount(0);
      return;
    }

    const subtotal = getSubtotal();
    let computedDiscount = 0;

    if (appliedCoupon.discountType === "percentage") {
      computedDiscount = (Number(appliedCoupon.discountValue || 0) / 100) * subtotal;
    } else {
      computedDiscount = Number(appliedCoupon.discountValue || 0);
    }

    if (
      appliedCoupon.maxDiscount &&
      computedDiscount > Number(appliedCoupon.maxDiscount)
    ) {
      computedDiscount = Number(appliedCoupon.maxDiscount);
    }

    setDiscount(computedDiscount);
  }, [quantity, appliedCoupon, event]);

const resetModal = () => {
  setQuantity(1);
  setPromoCode("");
  setDiscount(0);
  setAppliedCoupon(null);
};

  useEffect(() => {
  const modalEl = document.getElementById("registerModal");
  if (!modalEl) return;

  modalEl.addEventListener("hidden.bs.modal", resetModal);
  return () => modalEl.removeEventListener("hidden.bs.modal", resetModal);
}, []);


  async function applyCoupon() {
    if (!promoCode?.trim()) return;
    try {
      setApplyingCoupon(true);
      const endpoint = config.applyCoupon;
      const data = { couponCode: promoCode.trim(), userId: userData?._id };
      const response = await postApi(endpoint, data);

      if (response.statusCode === 200 || response.statusCode === 201) {
        setAppliedCoupon(response.coupon); // ✅ store coupon data
        Swal.fire({
          icon: "success",
          title: "Coupon applied",
          timer: 1200,
          showConfirmButton: false,
        });
      } else {
        setAppliedCoupon(null);
        setDiscount(0);
        Swal.fire({ icon: "error", title: response?.message || "Invalid coupon" });
      }
    } catch (error) {
      setAppliedCoupon(null);
      setDiscount(0);
      console.error("Error applying coupon:", error);
      Swal.fire({ icon: "error", title: "Failed to apply coupon" });
    } finally {
      setApplyingCoupon(false);
    }
  }

  async function handleCheckout() {
    if (isExpired) {
      Swal.fire({
        icon: "error",
        title: "Class Expired",
        text: "This Class has already ended.",
      });
      return;
    }

    if (!userData?._id) {
      Swal.fire({
        icon: "info",
        title: "Login required",
        text: "Please login before proceeding to checkout.",
        showCancelButton: true,
        confirmButtonText: "Login",
        cancelButtonText: "Cancel",
      }).then((res) => {
        if (res.isConfirmed) router.push("/Log-in");
      });
      return;
    }
    try {
      if (!userData?._id) {
        Swal.fire({
          icon: "info",
          title: "Login required",
          text: "Please login to continue to checkout.",
          showCancelButton: true,
          confirmButtonText: "Login",
        }).then((res) => {
          if (res.isConfirmed) router.push("/Log-in");
        });
        return;
      }

      setCheckingOut(true);
      const payload = {
        type: "class",
        classId: id,
        quantity: Number(quantity || 1),
        userId: userData._id,
        coupanId: promoCode || "",
        amount: getTotal(),
      };
      const response = await postApi(config.createYogaClassPayment, payload);
      if (response.statusCode === 200 || response.statusCode === 201) {
        if (response.paymentUrl) {
          window.open(response.paymentUrl);
        } else {
          Swal.fire({ icon: "success", title: "Order created" });
        }
      } else {
        if (response?.ticketInfo) {
          const info = response.ticketInfo;

          Swal.fire({
            icon: "error",
            title: response?.message || "Tickets not available",
            html: `
        <div style="text-align: left;">
          <p><strong>Tickets Available:</strong> ${info.availableTickets}</p>
          <p><strong>Requested:</strong> ${info.requestedQuantity}</p>
        </div>
      `,
            confirmButtonText: "Okay",
            confirmButtonColor: "#d33",
          });
        } else {
          Swal.fire({
            icon: "error",
            title: response?.message || "Checkout failed",
            text: response?.error || "Please try again.",
          });
        }
      }

    } catch (err) {
      console.error("Error during checkout:", err);
      Swal.fire({ icon: "error", title: "Something went wrong. Please try again." });
    } finally {
      setCheckingOut(false);
    }
  }

  async function handleRSVP() {
    if (isExpired) {
      Swal.fire({
        icon: "error",
        title: "Class Expired",
        text: "This Class has already ended.",
      });
      return;
    }

    if (!userData?._id) {
      Swal.fire({
        icon: "info",
        title: "Login required",
        text: "Please login before RSVP.",
        showCancelButton: true,
        confirmButtonText: "Login",
        cancelButtonText: "Cancel",
      }).then((res) => {
        if (res.isConfirmed) router.push("/Log-in");
      });
      return;
    }

    try {
      setCheckingOut(true);
      const payload = {
        type: "RSVP",
        classId: id,
        quantity: Number(quantity || 1),
        userId: userData._id,
      };

      const response = await postApi(config.createYogaClassRSVP, payload);
      if (response.statusCode === 200) {
        Swal.fire({
          icon: "success",
          title: "RSVP Successful!",
          text: "You have been registered for the Class. Ticket details have been emailed to you.",
          confirmButtonText: "Okay",
        });
        fetchEventDetails()
        const modal = bootstrap.Modal.getInstance(document.getElementById("registerModal"));
        modal.hide();
      } else {
        Swal.fire({
          icon: "error",
          title: "RSVP Failed",
          text: response?.message || "Please try again later.",
        });
      }
    } catch (err) {
      console.error("Error during RSVP:", err);
      Swal.fire({ icon: "error", title: "Something went wrong. Please try again." });
    } finally {
      setCheckingOut(false);
    }
  }


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

  const validate = () => {
    let tempErrors = {};

    // Name validation (required + only letters)
    if (!user.name.trim()) {
      tempErrors.name = "Name is required and should contain only letters.";
    } else if (!/^[A-Za-z\s]+$/.test(user.name)) {
      tempErrors.name = "Name is required and should contain only letters.";
    }

    // Last Name validation (required + only letters)
    if (!user.lastName?.trim()) {
      tempErrors.lastName = "Last name is required and should contain only letters.";
    } else if (!/^[A-Za-z\s]+$/.test(user.lastName)) {
      tempErrors.lastName = "Last name is required and should contain only letters.";
    }


    if (!user.mobileNo) {
      tempErrors.mobileNo = "Mobile number is required";
    } else if (!/^\d+$/.test(user.mobileNo)) {
      tempErrors.mobileNo = "Mobile number can contain digits only (no spaces or special characters).";
    } else if (user.mobileNo.length < 8) {
      tempErrors.mobileNo = "Mobile number is too short. It must have at least 8 digits.";
    } else if (user.mobileNo.length > 15) {
      tempErrors.mobileNo = "Mobile number cannot exceed 15 digits in international format.";
    }


    // Email validation
    if (!user.email) {
      tempErrors.email = "Email is required";
    } else if (!/^[^\s@]{3,}@[^\s@]{2,}\.[A-Za-z]{2,4}$/.test(user.email)) {
      tempErrors.email = "Enter a valid email (e.g., abc@xy.com, user@mail.in)";
    }



    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };
  const handleSubmit = async (e) => {
    setLoading(true)
    e.preventDefault();
    if (!validate()) {
      setLoading(false);
      return;
    }
    try {
      const data = {
        name: user.name,
        lastName: user.lastName,
        email: user.email,
        mobileNo: user.mobileNo,
      }
      const endpoint = config.loginAsGuest;
      const response = await postApi(endpoint, data);
      if (response?.statusCode == 200 || response?.statusCode == 201) {
        // setVerifyEmailScreen(true);
        // setTimer(30);
       setLoading(false);

// close guest modal
const guestModalEl = document.getElementById("guestuserModal");
const guestuserModal = bootstrap.Modal.getInstance(guestModalEl);
guestuserModal?.hide();

// open register modal
setUserData(response.user);
// localStorage.setItem("user", JSON.stringify(response.user));

const registerModalEl = document.getElementById("registerModal");
const registerModal = bootstrap.Modal.getOrCreateInstance(registerModalEl);
registerModal.show();
      }
      else {
        setLoading(false);
        alert(response.message)
      }
    } catch (error) {
      console.log(error)
      setLoading(false);
    }
  };
  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  return (
    <>
      <Header arrayheader={arrayheader} />
      <div
        className="innerBanner"
        style={{
          backgroundImage: `url(${imagePreview})`,
        }}
      />
      <section className="seminarIntro">
        <div className="container">
          <div className="ayurvedaSemi">
            <div className="row">
              <div className="col-lg-8 mb-lg-0 mb-3">
                <div className="seminarleft border-right mb-md-0 mb-3 border-lg-none border-end">
                  <h6 className="fw-semibold fs-6">{event?.eventname}</h6>
                  <ul className="timingUl mb-3">
                    <li>
                      <span>
                        <img
                          src="/images/landingpage/date-icon-event.svg"
                          alt=""
                          className="me-2"
                          width="15"
                        />
                        Date & Time
                      </span>
                      <p>
                        {event?.date ? new Date(`${new Date(event.date).toISOString().split("T")[0]}T${event?.time}`).toLocaleDateString("en-US") : "N/A"} , {new Date(`1970-01-01T${event?.time}`).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </p>
                    </li>
                    <li>
                      <span>
                        <img
                          src="/images/landingpage/location-icon-event.svg"
                          alt=""
                          className="me-2"
                          width="15"
                        />
                        Location
                      </span>
                      <p>{event?.format == "Online" ? "Online" : event?.address}</p>
                    </li>
                  </ul>
                  {isExpired ? (
                    <>
                      <button
                        type="button"
                        className="btn btn-secondary px-4"
                        disabled
                        style={{ cursor: "not-allowed" }}
                      >
                        Class Expired
                      </button>

                      <p style={{ color: "red", marginTop: "10px", fontWeight: "bold" }}>
                        This Class has already ended
                      </p>
                    </>
                  ) : (
                    <>
                      {event?.isFullyBooked ? (
                        <>
                          <button
                            type="button"
                            className="btn btn-secondary px-4"
                            disabled
                            style={{ cursor: "not-allowed" }}
                          >
                            Fully Booked
                          </button>

                          <p style={{ color: "red", marginTop: "10px", fontWeight: "bold" }}>
                            No tickets available
                          </p>
                        </>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-primary px-4"
                          onClick={handleSignUpClick}
                        >
                          {event?.is_rsvp ? "RSVP" : "Join Class"}
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="col-lg-4">
                <div className="seminarRight ps-lg-4">
                  <h6 className="fw-semibold fs-6">About The Class</h6>
                  <ul className="timingUl">
                    <li className="mb-lg-2 mb-2 w-50">
                      <span>Host:</span>
                      <p>{event?.host_name}</p>
                    </li>
                    <li className="mb-lg-2 mb-2 w-50">
                      <span>Format:</span>
                      <p>{event?.format}</p>
                    </li>
                    <li>
                      <span>Cost:</span>
                      <div className="d-flex align-items-center gap-2">
                        <p className="text-success fs-5 fw-bold mb-0">${finalPrice}</p>
                        {isMemberPrice && (
                          <span className="membership-badge">Membership Price</span>
                        )}
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Description */}
      <section>
        <div className="container-fluid mb-3">
          <strong className="mb-2 d-block">Description</strong>
          <div
            className="fs-8"
            dangerouslySetInnerHTML={{ __html: event?.description }}
          />

          <strong className="mb-2 d-block mb-3">Teacher Detail</strong>
          <div className="spkerDetail mb-3">
            <figure className="m-0">
              <img
                src={`${process.env.NEXT_PUBLIC_API_URL}/${event?.file}`.replace(/\\/g, "/")}
                alt={event?.speakername}
              />
            </figure>
            <span>
              {event?.speakername}{" "}
              <b>{event?.speakerdesignation}</b>
            </span>
          </div>

          <div
            className="fs-8"
            dangerouslySetInnerHTML={{ __html: event?.speakerdescription }}
          />

          <ul className="d-flex align-items-center gap-2 mt-3">
            <li>
              <span className="fw-semibold fs-7">Share this Class:</span>
            </li>
            <li>
              <img
                src="/images/landingpage/copy-link.svg"
                alt="Copy Link"
                width="25"
                style={{ cursor: "pointer" }}
                onClick={handleCopyUrl}
              />
            </li>
          </ul>
        </div>
      </section>
      {event?.format === "In Person Seminar" &&
        <section className="my-md-4 my-4">
          <div className="container-fluid">
            <iframe
              src={`https://www.google.com/maps?q=${event?.latitude},${event?.longitude}&hl=es;z=14&output=embed`}
              width="600"
              height="350"
              style={{ border: 0, width: "100%", display: "block" }}
              allowFullScreen
              loading="lazy"
            />
          </div>
        </section>
      }


      <FooterSection />


      {/* ------------------------------------------Modal ---------------------------------------------- */}

      <div className="modal fade registerModal" id="registerModal">
        <div className="modal-dialog modal-dialog-centered ">
          <div className="modal-content border-0 rounded-1">
            <div className="modal-header border-0">
              <h1 className="modal-title fs-6">Class Registration Form</h1>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <div className="register mt-0 p-0 border-0 bg-transparent">
                <div className="d-lg-flex justify-content-between gap-md-5 mb-3 mb-md-3">
                  <div className="w-100 mb-3">
                    <label className="d-block fw-semibold mb-2 fs-8">Ticket Type:</label>
                    <select
                      className="form-select form-select-sm"
                      value={event?.is_rsvp ? "RSVP" : "Paid"}
                      disabled
                    >
                      <option value="RSVP">RSVP</option>
                      <option value="Paid">Paid</option>
                    </select>
                  </div>
                  <div className="qtyGroup">
                    <strong>Quantity:</strong>
                    <div className="quantity">
                      <button className="minus" aria-label="Decrease" onClick={decreaseQty}>−</button>
                      <input
                        type="number"
                        className="input-box bg-white border-top border-bottom"
                        value={quantity}
                        min="1"
                        max={event?.maxTicketsPerUser || "10"}
                        onChange={onQtyInput}
                      />
                      <button className="plus" aria-label="Increase" onClick={increaseQty}>+</button>
                    </div>
                  </div>
                </div>
                {!event?.is_rsvp && (
                  <div className="row">
                    <div className="col-lg-8">
                      <label className="d-block fw-semibold mb-3 mb-md-2 fs-8">Promo Code</label>
                      <div className="subscribeInpt mt-md-0 mt-3 w-100 mx-auto">
                        <input
                          type="text"
                          placeholder="Enter Promo Code"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                        />
                        <button
                          type="button"
                          className="btn btn-orange"
                          onClick={applyCoupon}
                          disabled={!promoCode?.trim() || applyingCoupon}
                        >
                          {applyingCoupon ? "Applying..." : "Apply"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="checkOut mt-3 mt-lg-4">
                  <span>
                    Total:
                    <b className="ms-1 d-block">${getTotal().toFixed(2)} {isMemberPrice && (
                      <span className="membership-badge">Membership Price</span>
                    )}</b>
                  </span>

                </div>
              </div>
            </div>
            <div className="modal-footer justify-content-center border-0">
              {/* <button type="button" className="btn btn-secondary px-5" data-bs-dismiss="modal">Back</button> */}
              <button type="button" className="btn btn-secondary px-5" data-bs-dismiss="modal" onClick={resetModal}> Back </button>
              <button
                type="button"
                className="btn btn-success px-2"
                onClick={event?.is_rsvp ? handleRSVP : handleCheckout}
                disabled={checkingOut}
              >
                {checkingOut ? (event?.is_rsvp ? "Registering..." : "Redirecting...") : event?.is_rsvp ? "RSVP" : "Checkout"}
              </button>

            </div>
          </div>
        </div>
      </div>

      {/* ------------------- guest user Model--------------------------- */}
      <div className="modal fade guestuserModal" id="guestuserModal">
        <div className="modal-dialog modal-dialog-centered " style={{ maxWidth: "600px" }}>
          <div className="modal-content border-0 rounded-1">
            <div className="modal-header border-0">
              <h1 className="modal-title fs-6">Class Registration Form</h1>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <div className="loginFormBox">
                <form onSubmit={handleSubmit}>
                  <div className="form-group mb-4">
                    <label className="form-label">Name*</label>
                    <input
                      className="form-control w-100"
                      type="text"
                      name="name"
                      placeholder="Please enter your first name"
                      value={user.name}
                      onChange={handleChange}
                    />
                    {errors.name && (
                      <small className="text-danger">
                        {errors.name}
                      </small>
                    )}
                  </div>
                  <div className="form-group mb-4">
                    <label className="form-label">Last Name*</label>
                    <input
                      className="form-control w-100"
                      type="text"
                      name="lastName"
                      placeholder="Please enter your last name"
                      value={user.lastName}
                      onChange={handleChange}
                    />
                    {errors.lastName && (
                      <small className="text-danger">
                        {errors.lastName}
                      </small>
                    )}
                  </div>
                  <div className="form-group mb-3">
                    <label className="form-label">
                      Mobile Number*
                    </label>
                    <input
                      className="form-control w-100"
                      type="number"
                      name="mobileNo"
                      placeholder="Please enter your mobile number"
                      value={user.mobileNo}
                      onChange={handleChange}
                    />
                    {errors.mobileNo && (
                      <small className="text-danger">
                        {errors.mobileNo}
                      </small>
                    )}
                  </div>
                  <div className="form-group mb-3">
                    <label className="form-label">Email*</label>
                    <input
                      className="form-control w-100"
                      placeholder="Please enter your email"
                      type="email"
                      name="email"
                      value={user.email}
                      onChange={handleChange}
                    />
                    {errors.email && (
                      <small className="text-danger">
                        {errors.email}
                      </small>
                    )}
                  </div>

                  <div className="text-center my-2 mt-4">
                    <button
                      type="submit"
                      className="btn btn-primary w-50"
                      disabled={loading}
                    >
                      {loading ? "Continueing..." : "Continue"}
                    </button>
                  </div>
                  <strong className="signupTxt pb-0 pt-1" > Already have an account?  <a onClick={'navigate'} >LOGIN</a></strong>

                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
  .membership-badge {
    background-color: #7c3f00; /* matches your Sign up button color */
    color: #fff;
    font-size: 0.75rem;
    padding: 4px 10px;
    border-radius: 6px;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    box-shadow: 0 0 6px rgba(124, 63, 0, 0.4);
  }

  .membership-badge:hover {
    background-color: #5e2f00; /* darker shade on hover */
  }
`}</style>


    </>
  );
};

export default YogaClassDetail;
