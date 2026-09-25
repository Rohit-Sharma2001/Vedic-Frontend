
"use client";
import { useEffect, useRef, useState } from "react";
import flatpickr from "flatpickr";
import Loader from "services/Loader/page";
import "flatpickr/dist/flatpickr.min.css";
import '../../../../../app/(landingpage)/LandingPage/public/css/style.css'
import { postApi } from "services/api";
import { config } from "services/config";
import Link from "node_modules/next/link";
import StarRating from "services/Reusable/StarRating";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import InvoicePage from "../invoicePage/page";
export default function YogaClasses() {
  const router = useRouter();
  const [rateOpen, setRateOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [ratingValue, setRatingValue] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [loadingUnavailable, setLoadingUnavailable] = useState(false);
  const [courses, setCourses] = useState([]);
  const [videos, setVideos] = useState([]);
  const [membershipdetails, setMembershipdetails] = useState()
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [invoiceData, setInvoiceData] = useState(null);
  const invoiceRef = useRef(null);
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);
  const [events, setEvents] = useState([]);
  const [yogaClasses, setYogaClasses] = useState([]);
  const [classDateSortOrder, setClassDateSortOrder] = useState("asc");
  const [footerData, setFooterData] = useState({
    address: "",
    email: "",
    number: ""
  });
  // NEW: track if user has an active membership (via localStorage user.membershipId)
  const [hasActiveMembership, setHasActiveMembership] = useState(false);
  console.log(invoiceData, "invoiceData")
  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      setHasActiveMembership(Boolean(user?.membershipId));
    } catch {
      setHasActiveMembership(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
    fetchYogaVideos()
    fetchMemberships()
    fetchEvents()
    fetchYogaClasses()
  }, []);

  const sortedYogaClasses = [...yogaClasses].sort((a, b) => {
    const dateA = new Date(a?.class?.date || 0);
    const dateB = new Date(b?.class?.date || 0);

    return classDateSortOrder === "asc"
      ? dateA - dateB
      : dateB - dateA;
  });

  useEffect(() => {
    const fetchFooterData = async () => {
      try {
        const endpoint = config.Viewcategory;
        const data = { id: "67f4da7497d93651914eb2f7" };
        const response = await postApi(endpoint, data);

        if (response.statusCode === 201) {
          setFooterData({
            address: response.data.address || "",
            email: response.data.email || "",
            number: response.data.number || ""
          });
        }
      } catch (error) {
        console.error("Error fetching footer data:", error);
      }
    };

    fetchFooterData();
  }, []);

  const fetchEvents = async () => {
    const user = JSON.parse(localStorage.getItem("user"));

    try {
      const res = await postApi(config.getUserEventBookings, { user_id: user?._id });
      if (res.statusCode === 200) {

        setEvents(res.data)
      }
    } catch (err) {
      console.error("Error loading Events:", err);
    }
  };

  const fetchYogaClasses = async () => {
    const user = JSON.parse(localStorage.getItem("user"));

    try {
      const res = await postApi(config.getUserYogaClassBookings, { user_id: user?._id });
      if (res.statusCode === 200) {

        setYogaClasses(res.data)
      }
    } catch (err) {
      console.error("Error loading Events:", err);
    }
  };

  const fetchCourses = async () => {
    const user = JSON.parse(localStorage.getItem("user"));

    try {
      const res = await postApi(config.getCourseAndMembership, { user_id: user?._id });
      if (res.statusCode === 200) {

        const boughtcourses = res?.data?.courses || [];
        const membershipcourses = res?.data?.membership?.memberships?.[0]?.coursesDetails || [];

        // ✅ Add flags to distinguish the source
        const boughtCoursesWithFlag = boughtcourses.map(course => ({
          ...course,
          sourceType: "bought", // flag for purchased courses
        }));

        const membershipCoursesWithFlag = membershipcourses.map(course => ({
          ...course,
          sourceType: "membership", // flag for membership courses
        }));

        // ✅ Merge both
        const allcourses = [...boughtCoursesWithFlag, ...membershipCoursesWithFlag];



        console.log("allcourses", allcourses)
        setCourses(allcourses);
      }
    } catch (err) {
      console.error("Error loading courses:", err);
    }
  };
  const openRateModal = (course) => {
    setSelectedCourse(course);
    setRatingValue(0);
    setHoverRating(0);
    setRateOpen(true);
  };

  const closeRateModal = () => {
    setRateOpen(false);
    setSelectedCourse(null);
    setRatingValue(0);
    setHoverRating(0);
  };
  const submitCourseRating = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user?._id) return Swal.fire({ icon: "warning", title: "Login required" });
    if (!selectedCourse?._id || ratingValue < 1)
      return Swal.fire({ icon: "info", title: "Please select a rating" });

    setSubmitting(true);
    console.log(user._id, selectedCourse._id, ratingValue)
    try {
      const res = await postApi(config.rateCourse, {
        user_id: user._id,
        course_id: selectedCourse._id,
        rating: ratingValue,
      });
      if (res?.statusCode === 200 || res?.statusCode === 201) {
        Swal.fire({ icon: "success", title: "Thanks for rating!" });
        closeRateModal();
      } else {
        Swal.fire({ icon: "error", title: res?.message || "Failed to submit rating" });
      }
    } catch {
      Swal.fire({ icon: "error", title: "Something went wrong" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelSubscription = () => {
    // Swal.fire({
    //   icon: "info",
    //   title: "Cancel Subscription",
    //   html: `
    //     To cancel your subscription, please contact us at:<br>
    //     <b>info@vedichealth.org</b>
    //   `,
    //   confirmButtonText: "OK",
    //   confirmButtonColor: "#7d5a50",
    // });
    Swal.fire({
      icon: "info",
      title: "Cancel Subscription",
      html: `
      Are you sure to cancel subscription!`,
      confirmButtonText: "Yes, Cancel",
      showCancelButton: true,
      cancelButtonText: "Close",
      confirmButtonColor: "#7d5a50",
    }).then(async (r) => {
      // if (r.isConfirmed) router.push("/Memberships");
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user?._id) return Swal.fire({ icon: "warning", title: "Login required" });
        const res = await postApi(config.cancelMembership, {
          user_id: user?._id, plan_id: membershipdetails?.currentPlan?.membershipBuyId
        });
        if (res?.statusCode === 200 || res?.statusCode === 201) {
          Swal.fire({ icon: "success", title: "Subscription canceled" });
          closeRateModal();
        } else {
          Swal.fire({ icon: "error", title: res?.message || "Failed to cancel subscription" });
        }
      } catch {
        Swal.fire({ icon: "error", title: "Something went wrong" });
      }
    });
  };

  const fetchMemberships = async () => {
    const user = JSON.parse(localStorage.getItem("user"));

    try {
      const res = await postApi(config.getUserSubscriptionDetails, { user_id: user?._id });
      console.log("Membership Details ", res.data)
      if (res.statusCode === 200 || res.statusCode === 201) {

        setMembershipdetails(res.data)

      }
    } catch (err) {
      console.error("Error loading courses:", err);
    }
  };

  const fetchYogaVideos = async () => {
    const user = JSON.parse(localStorage.getItem("user"));

    try {
      const res = await postApi(config.findVideosByUserid, { user_id: user?._id });
      console.log("Yoga Videos Response", res);

      if (res.statusCode === 200 || res.statusCode === 201) {
        // ✅ Safely extract videos
        const accessibleVideos = res?.membership?.accessibleVideos || [];

        setVideos(accessibleVideos);
      } else {
        setVideos([]);
      }
    } catch (err) {
      console.error("Error loading videos:", err);
      setVideos([]);
    }
  };
  const prepareInvoicePayload = (invoice) => {
    if (!invoice) return null;
    console.log(invoice, "invoiceinvoice")
    const lineItem = {
      productName: invoice?.membership?.name || invoice?.plan_name || invoice?.name || "Membership",
      productPrice: invoice?.membership?.unitPrice ?? invoice?.invoiceAmount ?? invoice?.amount ?? 0,
      quantity: invoice?.membership?.quantity ?? 1,
    };

    const subtotal = invoice?.totals?.subtotal ?? invoice?.membership?.subtotal ?? invoice?.invoiceAmount ?? invoice?.amount ?? 0;
    const discount = invoice?.totals?.discount ?? invoice?.membership?.discount ?? 0;
    const deliveryCharge = 0;
    const grandTotal =
      invoice?.totals?.total ??
      invoice?.membership?.total ??
      invoice?.invoiceAmount ??
      invoice?.amount ??
      subtotal - discount;

    return {
      ...invoice,
      invoiceNo: invoice?.invoiceNumber || invoice?.invoiceNo,
      created_at: invoice?.invoiceDate || invoice?.date || invoice?.membership?.purchaseDate,
      grandTotal,
      totalAmount: subtotal,
      discountAmount: discount,
      deliveryCharge,
      orderItems: [lineItem],
      address: {
        name: `${invoice?.customer?.name} ${invoice?.customer?.lastName}`,
        mobile: invoice?.customer?.mobile,
      },
      billingAddress1: [
        invoice?.customer?.address1,
        invoice?.customer?.address2,
        invoice?.customer?.city,
        invoice?.customer?.state,
        invoice?.customer?.country,
        invoice?.customer?.zipcode
      ]
        .filter(v => v && v.trim() !== "") // removes empty strings also
        .join(", "),
      // billingAddress2: invoice?.customer?.email || "",
    };
  };

  const downloadInvoice = async (invoice) => {
    const payload = prepareInvoicePayload(invoice);
    const d = [
      invoice?.customer?.address1,
      invoice?.customer?.address2,
      invoice?.customer?.city,
      invoice?.customer?.state,
      invoice?.customer?.country,
      invoice?.customer?.zipcode
    ]
      .filter(v => v && v.trim() !== "") // removes empty strings also
      .join(", ")

    if (!payload) return;

    setInvoiceData(payload);
    setDownloadingInvoice(true);

    setTimeout(async () => {
      const element = invoiceRef.current;
      if (!element) {
        setDownloadingInvoice(false);
        return;
      }

      try {
        const canvas = await html2canvas(element, {
          backgroundColor: "#ffffff",
          scale: 2,
        });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "pt", "a4");
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${payload?.invoiceNo || "invoice"}.pdf`);
      } catch (error) {
        console.error("Error generating invoice PDF:", error);
      } finally {
        setDownloadingInvoice(false);
      }
    }, 150);
  };

   const convertTo12HourFormat = (timeString) => {
    if (!timeString) return "N/A";
    
    if (timeString.match(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes} ${ampm}`;
    }
    
    if (timeString.includes('AM') || timeString.includes('PM')) {
      return timeString;
    }
    
    return timeString;
  };

  const handleRenew = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user?._id) {
      Swal.fire({ icon: "warning", title: "Login required" });
      return;
    }

    const planId =
      membershipdetails?.currentPlan?.plan_id ||
      membershipdetails?.currentPlan?._id ||
      membershipdetails?.currentPlan?.planId;

    if (!planId) {
      Swal.fire({
        icon: "info",
        title: "Plan not found",
        text: "We could not identify your current plan to renew.",
      });
      return;
    }

    setLoadingUnavailable(true);
    try {
      const res = await postApi(config.renewMembership, {
        _id: planId,
        user_id: user._id,
      });

      const status = res?.statusCode ?? res?.data?.statusCode;
      const paymentUrl = res?.paymentUrl ?? res?.data?.paymentUrl;
      const message = res?.message ?? res?.data?.message;

      if ((status === 200 || status === 201) && paymentUrl) {
        window.location.href = paymentUrl;
      } else if (status === 200 || status === 201) {
        Swal.fire({
          icon: "success",
          title: "Renewal initiated",
          text: message || "Your renewal request has been submitted.",
        });
        fetchMemberships();
      } else {
        Swal.fire({
          icon: "warning",
          title: "Unable to renew",
          text: message || "Please try again later.",
        });
      }
    } catch (error) {
      console.error("Renewal error:", error);
      Swal.fire({
        icon: "error",
        title: "Something went wrong",
        text: "Unable to renew your membership. Please try again.",
      });
    } finally {
      setLoadingUnavailable(false);
    }
  };

  const handleUpgrade = async (newPlanId) => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user?._id) return alert("User not logged in");

    setLoadingUnavailable(true);
    try {
      const res = await postApi(config.upgradeMembershipPlan, {
        user_id: user._id,
        new_plan_id: newPlanId
      });

      if (res?.data?.statusCode === 200 && res?.data?.paymentUrl) {
        window.location.href = res.data.paymentUrl; // 🔥 Redirect to Stripe
      } else {
        // alert(res.data?.message || "Unable to upgrade plan");
        Swal.fire({
          title: res?.data?.title || "Unable to upgrade plan",
          text: res?.data?.message || "Please try again later.",
          icon: "warning",
          confirmButtonText: "Go to Memberships",
          showCancelButton: true,
          cancelButtonText: "Close",
          confirmButtonColor: "#7d5a50",
        }).then((r) => {
          if (r.isConfirmed) router.push("/Memberships");
        });
      }

    } catch (error) {
      console.error("Upgrade error:", error);
      alert("Something went wrong");
    } finally {
      setLoadingUnavailable(false);
    }
  };




  return (
    <>
      {(loadingUnavailable || downloadingInvoice) && <Loader />}
      <div className="cardBox h-100">
        {/* <h2 className="fs-6 fw-semibold mb-4">Membership</h2>    */}
        <ul className="nav nav-tabs ordersTabs">
          <li className="nav-item" role="presentation">
            <button className="nav-link active" data-bs-toggle="tab" data-bs-target="#BookedClasses"
              type="button" aria-selected="false" tabIndex={"-1"}>Scheduled Classes</button>
          </li>
          <li className="nav-item" role="presentation">
            <button className="nav-link " data-bs-toggle="tab" data-bs-target="#yourVideos"
              type="button" aria-selected="false" tabIndex={"-1"} >Your Videos</button>
          </li>
          <li className="nav-item" role="presentation">
            <button className="nav-link" data-bs-toggle="tab" data-bs-target="#yourCourses"
              type="button" aria-selected="false" tabIndex={"-1"}>Your Courses</button>
          </li>


        </ul>
        <div className="tab-content">
          <div id="yourVideos" className="tab-pane fade">
            <div className="row">


              {videos.length > 0 ? (
                videos.map((video, index) => (
                  <div className="col-md-4 mb-4" key={index}>
                    <div className="instituteTxt">
                      <Link href={`/YogaClasses/components/videoDetails/${video?._id}`}>
                        <figure className="position-relative studioImg">
                          <img
                            src={
                              video.coverImage
                                ? `${process.env.NEXT_PUBLIC_API_URL}/${video.coverImage}`.replace(/\\/g, "/")
                                : "/images/default-video.jpg"
                            }
                            alt={video.name}
                          />
                          <button className="plyButton">
                            <img src="/images/landingpage/video-icon3.svg" alt="Play" width="35" />
                          </button>
                        </figure>
                      </Link>
                      <h3>{video.name}</h3>
                      <p
                        className="mb-2"
                        dangerouslySetInnerHTML={{ __html: video.description }}
                      />

                      <div className="d-flex gap-1 align-items-center mb-2">
                        <span className="fs-9 d-flex gap-1 align-items-center pe-1">
                          <img src="/images/landingpage/clock-img.svg" alt="" width="13" />{" "}
                          {video.duration} min
                        </span>
                        |
                        <span className="fs-9 d-flex gap-1 align-items-center ps-1">
                          <img src="/images/landingpage/user-img.svg" alt="" width="13" /> Amita Jain
                        </span>
                      </div>

                      {/* 🟡 Optional: Membership tag */}
                      {video.is_exclusive && (
                        <span className="badge bg-warning text-dark">Exclusive</span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted py-4">
                  No videos available for your membership.
                </div>
              )}

            </div>
          </div>

          <div id="yourCourses" className="tab-pane fade">
            <div className="row">
              {courses.length > 0 ? (
                courses.map((item, index) => {
                  const course = item.sourceType === "bought" ? item.course?.[0] : item;
                  if (!course) return null;

                  return (
                    <div className="col-md-4 mb-4" key={index}>
                      <div className="instituteTxt position-relative">
                        {/* Small star button in top-right corner */}


                        <Link href={`/YogaClasses/Yoga-Courses/Course-Details/${course._id}`}>
                          <figure className="position-relative studioImg" style={{ cursor: "pointer" }}>
                            <img
                              src={
                                course.icon_file
                                  ? `${process.env.NEXT_PUBLIC_API_URL}/${course.icon_file}`.replace(/\\/g, "/")
                                  : "/images/default-course.png"
                              }
                              alt={course.courseName || "Course"}
                            />
                          </figure>
                        </Link>

                        <h3>{course.courseName || "Unnamed Course"}</h3>
                        <div className="d-flex gap-3 align-items-center mb-2">
                          <span className="fs-6 fw-bold text-black">${course.price || 0}</span>
                          <span className={`fs-9 badge ${item.sourceType === "membership" ? "text-bg-warning" : "text-bg-warning"}`}>
                            {item.sourceType === "membership" ? "Membership" : "Bought"}
                          </span>
                        </div>
                        <button
                          type="button"
                          className="btn btn-light p-2 position-absolute"
                          style={{ top: 10, right: 10, borderRadius: "100%" }}
                          title="Rate this course"
                          onClick={() => openRateModal(course)}
                        >
                          <span style={{ color: "#F4B400", fontSize: 16 }}>★</span>
                        </button>

                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-muted py-4">No courses available.</div>
              )}

            </div>
          </div>

          <div id="BookedClasses" className="tab-pane fade show active">
            <div className="table-responsive">
              {yogaClasses.length > 0 ? (
                <table className="table table-bordered table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>#</th>
                      <th>Class Name</th>
                      <th
                        style={{ cursor: "pointer", userSelect: "none" }}
                        onClick={() =>
                          setClassDateSortOrder((prev) =>
                            prev === "asc" ? "desc" : "asc"
                          )
                        }
                      >
                        Date {classDateSortOrder === "asc" ? "▲" : "▼"}
                      </th>
                      <th>Time</th>
                      <th>Quantity</th>
                      <th>Total</th>
                      <th>Ticket No.</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedYogaClasses.map((item, index) => (
                      <tr key={item._id || index}>
                        <td>{index + 1}</td>
                        <td className="fw-semibold">{item?.class?.classname || "N/A"}</td>
                        <td>
                          {item?.class?.date
                            ? new Date(item.class.date).toLocaleDateString('en-US')
                            : "N/A"}
                        </td>
                        <td>{item?.class?.time?convertTo12HourFormat(item?.class?.time) : "N/A"}</td>
                        <td>{item?.quantity ?? "N/A"}</td>
                        <td className="fw-bold">${item?.grandTotal ?? "N/A"}</td>
                        <td>{item?.ticketNumber || "—"}</td>
                        <td style={{ textAlign: "center", verticalAlign: "middle" }}>
                          {item?.class?.meeting_link ? (
                            <a
                              href={item.class.meeting_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display: "inline-block",
                                width: "140px",
                                padding: "5px 0",
                                backgroundColor: "#7d5a50",
                                color: "#fff",
                                borderRadius: "6px",
                                fontSize: "13px",
                                fontWeight: "600",
                                textDecoration: "none",
                                textAlign: "center",
                              }}
                            >
                              🔗 Join
                            </a>
                          ) : (
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                item?.class?.address || ""
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display: "inline-block",
                                width: "140px",
                                padding: "5px 0",
                                backgroundColor: "#7d5a50",
                                color: "#fff",
                                borderRadius: "6px",
                                fontSize: "13px",
                                fontWeight: "600",
                                textDecoration: "none",
                                textAlign: "center",
                              }}
                            >
                              📍 View Location
                            </a>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center text-muted py-4">No Yoga Classes booked.</div>
              )}
            </div>
          </div>

        </div>
      </div >





      <div className="modal fade cancelModal" id="premiumModal">
        <div className="modal-dialog modal-dialog-centered modal-sm">
          <div className="modal-content border-0 rounded-1">
            <div className="modal-header border-0">
              <h1 className="modal-title fs-6">Premium Membership - All Included</h1>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              {selectedPlan ? (
                <>
                  <div className="premiumPerson mb-3">
                    <span>{selectedPlan.plan_name || 'N/A'}</span>
                    <h5>
                      ${selectedPlan.price || 'N/A'} <span>/Every month</span>
                    </h5>
                  </div>

                  <h6 className="fw-semibold fs-8">Details</h6>

                  {/* Render plan_description */}
                  <div
                    className="mt-2 mb-3"
                    dangerouslySetInnerHTML={{
                      __html: selectedPlan.plan_description,
                    }}
                  />

                  {/* Render plan_details array */}
                  {selectedPlan.plan_details?.length > 0 && (
                    <ul className="PlanlistUl pt-2">
                      {selectedPlan.plan_details.map((detail, index) => (
                        <li key={index}>
                          <img
                            src="/images/landingpage/Icon-check.svg"
                            alt=""
                            width="14"
                          />{" "}
                          {detail.title}
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <p className="text-muted text-center">Loading...</p>
              )}
            </div>


          </div>
        </div>
      </div>

      <div className={`modal fade ${rateOpen ? "show d-block" : ""}`} tabIndex="-1" role="dialog" aria-hidden={!rateOpen}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 rounded-1">
            <div className="modal-header border-0">
              <h1 className="modal-title fs-6">
                {selectedCourse?.courseName ? `Rate: ${selectedCourse.courseName}` : "Rate this course"}
              </h1>
              <button type="button" className="btn-close" aria-label="Close" onClick={closeRateModal}></button>
            </div>

            <div className="modal-body">
              <label className="form-label d-block mb-2">Your Rating</label>
              <div className="d-flex align-items-center mb-3">
                {[1, 2, 3, 4, 5].map((star) => {
                  const active = (hoverRating || ratingValue) >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      aria-label={`${star} star`}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onFocus={() => setHoverRating(star)}
                      onBlur={() => setHoverRating(0)}
                      onClick={() => setRatingValue(star)}
                      className="border-0 bg-transparent p-0 mx-1"
                      style={{ cursor: "pointer", outline: "none", lineHeight: 1 }}
                    >
                      <span style={{ fontSize: 28, color: active ? "#F4B400" : "#E0E0E0" }}>★</span>
                    </button>
                  );
                })}
                <span className="ms-2">{ratingValue || 0}/5</span>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  className="btn btn-primary px-4"
                  disabled={submitting || ratingValue < 1}
                  onClick={submitCourseRating}
                >
                  {submitting ? "Submitting..." : "Submit Rating"}
                </button>
                <button type="button" className="btn btn-outline-secondary ms-2" onClick={closeRateModal}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
  .modal.show.d-block { background: rgba(0,0,0,0.5); }
`}</style>

      <div ref={invoiceRef} style={{ position: "absolute", left: "-9999px" }}>
        {invoiceData && <InvoicePage data={invoiceData} footerData={footerData} />}
      </div>

    </>
  );
}