// File: app/(landingpage)/YogaCourses/[id]/page.js
"use client";
import VimeoPreview from "services/Reusable/Vimeoplayer";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "app/(landingpage)/LandingPage/components/Header/page";
import FooterSection from "app/(landingpage)/LandingPage/components/Footer/page";
import "app/(landingpage)/LandingPage/public/css/style.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { useParams } from "next/navigation";
import { postApi } from "services/api";
import { config } from "services/config";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

// import SubHeader from "app/(landingpage)/LandingPage/components/SubHeader/page";

const CourseDetails = () => {
  const { id } = useParams();
  const [modalVisible, setModalVisible] = useState(false);
  const router = useRouter();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      import("bootstrap/dist/js/bootstrap.bundle.min.js");
    }
  }, []);
  // 🧩 Stop video when modal closes by ANY means (X, backdrop, ESC, programmatic)


  const increaseCourseView = async () => {
    try {
      const payload = { _id: id };
      await postApi(config.increaseCourseView, payload);
    } catch (error) {
      console.error("Error increasing view count:", error);
    }
  };

  useEffect(() => {
    if (id) {
      fetchCourseDetails();
      increaseCourseView(); // 👈 NEW: Update view count on page load
    }
  }, [id]);

  // 🧩 Handle download securely based on purchase status
  const handleDownload = (fileUrl) => {
    if (!course?.isPurchased) {
      Swal.fire({
        icon: "warning",
        title: "Purchase Required",
        text: "Please buy this course to download its materials.",
        confirmButtonColor: "#624bff",
      });
      return;
    }

    // ✅ Open the document in a new tab only if purchased
    window.open(`${process.env.NEXT_PUBLIC_API_URL}/${fileUrl}`, "_blank");
  };

  const fetchCourseDetails = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user?._id) {
      // Swal.fire("Login Required", "Please log in to buy a course.", "warning");
      // return;
      Swal.fire({
        icon: "info",
        title: "Login Required",
        text: "Please log in to buy a course.",
        showCancelButton: true,
        confirmButtonText: "Login",
        cancelButtonText: "Cancel",
      }).then((result) => {
        if (result.isConfirmed) router.push("/Log-in");
      });
      return;
    }
    try {
      setLoading(true);
      const data = { _id: id, user_id: user?._id };
      const response = await postApi(config.getCourseById, data);
      console.log("course details ", response)
      if (response.statusCode === 200) setCourse(response.data);
    } catch (error) {
      console.error("Error fetching course details:", error);
    } finally {
      setLoading(false);
    }
  };
  const handlePreview = (videoUrl, isPreview = true) => {
    setSelectedVideo({ url: videoUrl, isPreview });

    // Delay ensures modal mounts, then animate
    setTimeout(() => setModalVisible(true), 20);
  };




  const handleCloseModal = () => {
    setModalVisible(false);

    setTimeout(() => {
      window.stopVideo?.();
      setSelectedVideo(null);
    }, 200); // matches animation duration

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

  if (loading)
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );

  if (!course)
    return (
      <div className="text-center py-5 text-muted">Loading...</div>
    );

  const handleBuyNow = async () => {
    try {
      if (!course?._id) {
        Swal.fire("Error", "Course ID missing!", "error");
        return;
      }

      const user = JSON.parse(localStorage.getItem("user"));
      if (!user?._id) {
        // Swal.fire("Login Required", "Please log in to buy a course.", "warning");
        // return;
         Swal.fire({
      icon: "info",
      title: "Login Required",
      text: "Please log in to buy a course.",
      showCancelButton: true,
      confirmButtonText: "Login",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) router.push("/Log-in");
    });
    return;
      }

      setLoading(true);

      const payload = {
        _id: course._id,   // course ID
        user_id: user._id, // logged-in user
      };

      const response = await postApi(config.createCoursePayment, payload);
      console.log("Payment link response:", response);

      if (response.statusCode === 201 && response.data.paymentUrl) {
        window.location.href = response.data.paymentUrl; // redirect to Stripe checkout
      } else {
        Swal.fire("Error", response.message || "Failed to create payment link", "error");
      }
    } catch (error) {
      console.error("Buy Now error:", error);
      Swal.fire("Error", "Something went wrong while creating payment link", "error");
    } finally {
      setLoading(false);
    }
  };




  return (
    <>
      <Header arrayheader={arrayheader} />
      {/* <SubHeader /> */}

      {/* ----------------------- Banner Section ----------------------- */}
      <section className="cleansPrograme mb-4 mb-5">
        <div className="container-fluid">
          <div className="breadcrumbGroup my-4 mb-md-4">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <Link href="/YogaClasses/Yoga-Courses">Yoga Courses</Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Course Details
              </li>
            </ol>
          </div>

          <div className="row">
            {/* LEFT SIDE: Course Summary */}
            <div className="col-lg-4 pe-md-3 mb-3">
              <div className="studioMembership pb-3">
                <figure className="studioImg position-relative">
                  <img
                    src={
                      course?.icon_file
                        ? `${process.env.NEXT_PUBLIC_API_URL}/${course?.icon_file}`
                        : "/images/landingpage/yog.jpg"
                    }
                    alt={course?.courseName}
                  />


                </figure>

                {/* Show ONLY if course is included in any membership */}
                {course?.availableInMemberships?.length > 0 && (
                  <span className="mb-1 d-flex gap-2 align-items-start">
                    <img
                      src="/images/landingpage/premium-course.svg"
                      alt=""
                      width="18"
                    />

                    {`This Premium course is included in membership (${course?.availableInMemberships
                        .map((m) => m.plan_name)
                        .join(" , ")
                      })`}
                  </span>
                )}

                <span className="d-flex align-items-center gap-2 fw-medium fs-9 text-secondary">
                  <b>${Number(course?.price || 0).toFixed(2)}</b>

                </span>
                <p className="fs-9">Lorem Ipsum is simply dummy text of the printing and typesetting industry.</p>

                {/* ------------------ PURCHASE / MEMBERSHIP LOGIC ------------------ */}

                {!course?.isPurchased && (
                  <div className="priceOptn">

                    {/* 1️⃣ If NOT accessible via membership → show Buy Now */}
                    {!course?.accessDetails?.accessibleViaMembership && (
                      <button
                        type="button"
                        className="btn btn-orange w-100 mb-2"
                        onClick={handleBuyNow}
                        disabled={loading}
                      >
                        {loading ? "Processing..." : "Buy Now"}
                      </button>
                    )}

                    {/* 2️⃣ Show OR only if both buttons exist */}
                    {!course?.accessDetails?.accessibleViaMembership &&
                      course?.availableInMemberships?.length > 0 && (
                        <div className="orSep mb-2">
                          <b>Or</b>
                        </div>
                      )}

                    {/* 3️⃣ If course is NOT accessible via membership
         but it IS included in a membership → show Join Membership */}
                    {!course?.accessDetails?.accessibleViaMembership &&
                      course?.availableInMemberships?.length > 0 && (
                        <>
                          <p className="fs-8 fw-semibold mb-1">
                            Unlock more transformative courses by subscribing to Vedic Health today.
                          </p>
                          <p className="fs-9">
                            Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                          </p>

                          <Link href="/Memberships" className="btn btn-orange w-100">
                            Join Membership
                          </Link>
                        </>
                      )}

                  </div>
                )}

              </div>

            </div>

            {/* RIGHT SIDE: Course Details */}
            <div className="col-lg-8 ps-md-3 mb-3">
              <div className="rightsPart">
                <h3 className="fs-5 fw-semibold">{course?.courseName}</h3>
                <p
                  className="fs-9"
                  dangerouslySetInnerHTML={{ __html: course?.description }}
                ></p>
                <div className="p-3 border rounded-1 mb-4">
                  <h4 className="mb-3 fs-6 fw-semibold">What you will learn</h4>
                  <ul className="overviewUl">
                    {course?.learnings?.length > 0 ? (
                      course?.learnings.map((item, i) => (
                        <li key={i}>
                          <img
                            src="/images/landingpage/Icon-check.svg"
                            alt=""
                            width="12"
                          />
                          <p className="m-0">{item.title}</p>
                        </li>
                      ))
                    ) : (
                      <li className="text-muted">No learnings available.</li>
                    )}
                  </ul>
                </div>

                {/* Accordion for Course Content */}
                <div>
                  <h4 className="fs-6 fw-semibold">Course content</h4>
                  <p>
                    {course?.courseContent?.length || 0} sections •{" "}
                    {course?.courseContent?.reduce(
                      (total, section) => total + (section.lectures?.length || 0),
                      0
                    )}{" "}
                    lectures • 21h 51m total length
                  </p>

                  <div className="accordion courseAccordion" id="courseAccordion">
                    {course?.courseContent?.length > 0 ? (
                      course?.courseContent.map((section, sIndex) => (
                        <div className="accordion-item" key={sIndex}>
                          <button
                            className="accordion-button collapsed"
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target={`#collapse${sIndex}`}
                          >
                            {section.sectionTitle}
                            <span>
                              {section.lectures.length} Lectures
                            </span>
                          </button>
                          <div
                            id={`collapse${sIndex}`}
                            className="accordion-collapse collapse"
                            data-bs-parent="#courseAccordion"
                          >
                            <div className="accordion-body">
                              <ul className="courseListUl">
                                {section.lectures.map((lecture, lIndex) => (
                                  <li key={lIndex}>
                                    <p>
                                      <img
                                        src={
                                          lecture.type === "video"
                                            ? "/images/landingpage/video-icon2.svg"
                                            : "/images/landingpage/file-icon.svg"
                                        }
                                        alt=""
                                      />
                                      {lecture.title}
                                    </p>

                                    {lecture.type === "video" &&
                                      lecture.videoId?.video ? (
                                      <a
                                        style={{ cursor: "pointer" }}
                                        className="video-thumbnail"
                                        onClick={() =>
                                          handlePreview(
                                            lecture.videoId.video,
                                            course?.isPurchased ? false : true // 🆕 pass isPreview flag
                                          )
                                        }

                                      >
                                        {course?.isPurchased ? "Watch" : "Preview"}
                                      </a>
                                    ) : lecture.documentId?.file ? (
                                      <a
                                        style={{
                                          cursor: "pointer",
                                          color: course?.isPurchased ? "#624bff" : "#999",
                                          textDecoration: course?.isPurchased ? "underline" : "none",
                                          display: "inline-flex",
                                          alignItems: "center",

                                        }}
                                        onClick={() => handleDownload(lecture.documentId.file)}
                                      >
                                        {!course?.isPurchased && (
                                          <img src="/images/landingpage/lock-icon.svg" alt="" width="13" />
                                        )}

                                        {!course?.isPurchased ? " " : "View"}

                                      </a>

                                    ) : (
                                      <span>
                                        <img
                                          src="/images/landingpage/lock-icon.svg"
                                          alt=""
                                          width="15"
                                        />
                                      </span>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted">No content available.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <FooterSection />


      {/* Video Modal */}
      {/* ================= CUSTOM VIDEO MODAL ================= */}
      {selectedVideo && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.65)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px",
            opacity: modalVisible ? 1 : 0,
            transition: "opacity 0.25s ease",
          }}
          onClick={() => {
            setModalVisible(false);
            setTimeout(() => {
              window.stopVideo?.();
              setSelectedVideo(null);
            }, 200);
          }}
        >

          {/* MODAL CONTENT */}
          <div
            style={{
              position: "relative",
              background: "transparent",
              borderRadius: "10px",
              maxWidth: "850px",
              width: "100%",
              transform: modalVisible ? "scale(1)" : "scale(0.92)",
              opacity: modalVisible ? 1 : 0,
              transition: "all 0.25s ease",
            }}
            onClick={(e) => e.stopPropagation()}
          >

            {/* CLOSE BUTTON */}
            <button
              onClick={() => {
                setModalVisible(false);
                setTimeout(() => {
                  window.stopVideo?.();
                  setSelectedVideo(null);
                }, 200);
              }}

              style={{
                position: "absolute",
                top: "-10px",
                right: "-10px",
                background: "white",
                borderRadius: "50%",
                width: "32px",
                height: "32px",
                border: "none",
                fontSize: "18px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 2,
              }}
            >
              ✕
            </button>

            {/* VIDEO PLAYER */}
            <VimeoPreview
              videoId={selectedVideo?.url}
              previewTime={selectedVideo?.isPreview ? 30 : 0}
              controls={!selectedVideo?.isPreview}
              width="800px"
              height="450px"
              onStop={(stopFn) => (window.stopVideo = stopFn)}
              onPreviewEnd={() => {
                setModalVisible(false);
                setTimeout(() => {
                  window.stopVideo?.();
                  setSelectedVideo(null);
                  Swal.fire({
                    icon: "info",
                    title: "Preview Ended",
                    text: "Buy this course to watch the full video.",
                    confirmButtonColor: "#624bff",
                  });
                }, 200);
              }}

            />
          </div>
        </div>
      )}






    </>
  );
};

export default CourseDetails;
