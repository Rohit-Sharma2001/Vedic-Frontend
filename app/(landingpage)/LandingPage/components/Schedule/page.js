"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "../Header/page";
// import SubHeader from "../SubHeader/page";
import FooterSection from "../Footer/page";
import "../../public/css/style.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { config } from "services/config";
import { postApi, postApiWithFile, updateApiWithFile } from "services/api";
import dynamic from "next/dynamic";
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";
import Swal from "sweetalert2";
import { checkIsOwner } from "services/config";
import { usePathname } from "next/navigation";

const Schedule = () => {
  const [isOwner, setIsOwner] = useState(false);
  const scheduleRef = useRef(null);

  const pathname = usePathname();
  const hideChrome = pathname?.includes("AmitaHome");

  useEffect(() => {
    const isIframe =
      typeof window !== "undefined" && window.self !== window.top;
    const isAdminPath = pathname?.includes("/admin");
    const isAdminUser = checkIsOwner();

    if (isAdminUser && (isIframe || isAdminPath)) {
      setIsOwner(true);
    }
  }, [pathname]);

  const [showModal, setShowModal] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [formData, setFormData] = useState({
    banner_text: "",
    button_label: "",
    button_route: "",
    image: null,
  });
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleContent, setScheduleContent] = useState({
    schedule_heading: "",
    schedule_description: "",
    schedule_button: "",
    schedule_button_route: "",
    schedule_details: [],
  });

  // FIX 1: Removed the stray `response` block that was here outside any function.
  // FIX 2: Single useEffect calling both fetchBannerData and fetchYogaClasses.
  const [yogaClasses, setYogaClasses] = useState([]);

  useEffect(() => {
    fetchBannerData();
    fetchYogaClasses();
  }, []);

  // FIX 3 (Optional): Filter to upcoming + active classes inside fetchYogaClasses.
  const fetchYogaClasses = async () => {
    try {
      const response = await postApi(config.AllYogaClasses, {
        page: 1,
        pageSize: 10,
      });

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const activeClasses = (response?.classes || [])
  .filter(
    (item) =>
      Number(item.status) === 1 &&
      new Date(item.date) >= today && 
      item.show_on_amita?.toLowerCase() == "yes"
  )
  .sort((a, b) => new Date(a.date) - new Date(b.date))
  .slice(0, 10);

setYogaClasses(activeClasses);
    } catch (error) {
      console.error("Error fetching yoga classes:", error);
    }
  };

  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return `${String(d.getDate()).padStart(2, "0")}/${String(
      d.getMonth() + 1
    ).padStart(2, "0")}/${d.getFullYear()}`;
  };

  const fetchBannerData = async () => {
    try {
      const res = await postApi(config.GetSchedulePageContent, {
        id: "682b2467f374e15e082fb834",
      });
      const data = res?.result;
      if (data) {
        setFormData({
          banner_text: data.banner_text || "",
          button_label: data.button_label || "",
          button_route: data.button_route || "",
          image: null,
        });
        setScheduleContent({
          schedule_heading: data.schedule_heading || "",
          schedule_description: data.schedule_description || "",
          schedule_button: data.schedule_button || "",
          schedule_button_route: data.schedule_button_route || "",
          schedule_details: data.schedule_details || [],
        });
        setImagePreview(
          `${process.env.NEXT_PUBLIC_API_URL}/${data.image}`.replace(
            /\\/g,
            "/"
          )
        );
      }
    } catch (err) {
      console.error("Error fetching schedule banner", err);
    }
  };

  const handleScheduleChange = (key, value) => {
    setScheduleContent((prev) => ({ ...prev, [key]: value }));
  };

  const handleDetailChange = (index, key, value) => {
    const updated = [...scheduleContent.schedule_details];
    updated[index][key] = value;
    setScheduleContent((prev) => ({
      ...prev,
      schedule_details: updated,
    }));
  };

  const addScheduleRow = () => {
    setScheduleContent((prev) => ({
      ...prev,
      schedule_details: [
        ...prev.schedule_details,
        {
          class_title: "",
          duration: "",
          date: "",
          time: "",
          location: "",
        },
      ],
    }));
  };

  const removeScheduleRow = (index) => {
    const updated = [...scheduleContent.schedule_details];
    updated.splice(index, 1);
    setScheduleContent((prev) => ({ ...prev, schedule_details: updated }));
  };

  const handleScheduleSubmit = async () => {
    try {
      const payload = { ...scheduleContent };
      await updateApiWithFile(
        config.UpdateSchedulePageContent,
        "682b2467f374e15e082fb834",
        payload,
        {}
      );
      setShowScheduleModal(false);
      fetchBannerData();
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  const convertTo24HourFormat = (timeStr) => {
    if (!timeStr) return "";
    const [time, modifier] = timeStr.split(" ");
    let [hours, minutes] = time.split(":");

    if (modifier === "PM" && hours !== "12") {
      hours = String(+hours + 12);
    }
    if (modifier === "AM" && hours === "12") {
      hours = "00";
    }

    return `${hours.padStart(2, "0")}:${minutes}`;
  };

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    try {
      const files = formData.image ? { image: formData.image } : {};
      const payload = { ...formData, image: undefined };
      await updateApiWithFile(
        config.UpdateSchedulePageContent,
        "682b2467f374e15e082fb834",
        payload,
        files
      );
      setShowModal(false);
      fetchBannerData();
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  const truncate = (s, n = 30) => {
    const str = String(s ?? "");
    return str.length > n ? `${str.slice(0, n)}…` : str;
  };

  const arrayheader = [
    { name: "Schedule", route: "/LandingPage/components/AmitaHome" },
    { name: "Free Clinic", route: "/LandingPage/components/FreeClinic" },
    {
      name: "Classes",
      route: "/YogaClasses/components/JoinYogaClasses",
    },
    {
      name: "Book & Articles",
      route: "/LandingPage/components/BookArticles",
    },
    { name: "Talks", route: "/LandingPage/components/TalksByAmita" },
    {
      name: "Case Studies",
      route: "/LandingPage/components/CaseStories",
    },
    {
      name: "About",
      route: "/LandingPage/components/AmitajainLandingPage",
    },
  ];

  return (
    <>
      {!hideChrome && (
        <>
          {!isOwner ? (
            <Header arrayheader={arrayheader} />
          ) : (
            <h3 className="mt-3 ml-3" style={{ marginLeft: "15px" }}>
              Schedule Page
            </h3>
          )}
        </>
      )}

      {!hideChrome && (
        <div
          className="innerBanner"
          style={{
            backgroundImage: imagePreview
              ? `url('${imagePreview}')`
              : "none",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="container">
            <div className="innerBannertxt">
              <h1
                dangerouslySetInnerHTML={{
                  __html: formData.banner_text
                    .split(" ")
                    .reduce((acc, word, i) => {
                      const groupIndex = Math.floor(i / 4);
                      acc[groupIndex] = acc[groupIndex] || [];
                      acc[groupIndex].push(word);
                      return acc;
                    }, [])
                    .map((words) => words.join(" "))
                    .join("<br />"),
                }}
              />

              <button
                className="btn btn-primary mt-3"
                onClick={() => {
                  scheduleRef.current?.scrollIntoView({
                    behavior: "smooth",
                  });
                }}
              >
                {formData.button_label}
              </button>

              {isOwner && (
                <button
                  className="btn btn-primary mt-3"
                  style={{ marginLeft: "5px" }}
                  onClick={() => setShowModal(true)}
                >
                  ✏️ Edit Details
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {isOwner && (
        <div className="d-flex justify-content-center">
          <button
            className="btn btn-primary mt-5"
            onClick={() => setShowScheduleModal(true)}
          >
            ✏️ Edit Schedule Section
          </button>
        </div>
      )}

      <section ref={scheduleRef} className="scheduleMain">
        <div className="container-fluid">
          <div className="d-md-flex justify-content-between align-items-center">
            <div className="section-heading text-start ms-0 mw-100 pb-4">
              <img
                src="/images/landingpage/watermark.png"
                width="50"
                alt="watermark"
              />
              <h2>{scheduleContent?.schedule_heading}</h2>
              <p>{scheduleContent?.schedule_description}</p>
            </div>

            <Link
              href={scheduleContent?.schedule_button_route || "#"}
              className="btn btn-primary"
            >
              {scheduleContent?.schedule_button}
            </Link>
          </div>

          <div className="table-responsive scheduleTbl">
            <table className="table table-bordered align-middle">
              <thead>
                <tr>
                  <th width="20%">Class</th>
                  {/* <th width="12%">Type</th> */}
                  <th width="18%">Date</th>
                  <th width="10%">Time</th>
                  <th width="25%">Speaker Name</th>
                  <th width="25%">Class Type</th>
                  <th width="15%">Action</th>
                </tr>
              </thead>

              <tbody>
                {yogaClasses?.length > 0 ? (
                yogaClasses.slice(0, 10).map((item) => (
                    <tr key={item?._id}>
                      <td title={item?.classname}>
                        {truncate(item?.classname, 30)}
                      </td>

                      {/* <td>{item?.class_type}</td> */}

                      <td>{formatDate(item?.date)}</td>

                      <td>{item?.time}</td>

                      <td>
                        {item?.speakername}
                      </td>
                     <td>
                        {item?.format?.toLowerCase() === "online"
                          ? "Online"
                          : "In Seminar"
                          }
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          {!item?.is_rsvp && (
                            <Link
                              href={`/YogaClasses/components/YogaClassDetail/${item?._id}`}
                              className="btn btn-success btn-sm"
                            >
                              Join class
                            </Link>
                          )}

                          {item?.is_rsvp && (
                            <Link
                              href={`/YogaClasses/components/YogaClassDetail/${item?._id}`}
                              className="btn btn-warning btn-sm"
                            >
                              RSVP
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-4">
                      No Yoga Classes Available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Edit Banner Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div
              className="modal-content"
              style={{ minWidth: "600px" }}
            >
              <div className="modal-header">
                <h5 className="modal-title">Edit Schedule Banner</h5>
                <button
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  {["banner_text", "button_label", "button_route"].map(
                    (field) => (
                      <div className="col-md-6 mb-3" key={field}>
                        <label className="form-label text-capitalize">
                          {field.replace(/_/g, " ")}
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData[field]}
                          onChange={(e) =>
                            handleChange(field, e.target.value)
                          }
                        />
                      </div>
                    )
                  )}
                </div>
                <div className="mb-3">
                  <label className="form-label">Banner Image</label>
                  <input
                    type="file"
                    className="form-control"
                    onChange={handleImageUpload}
                  />
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      className="mt-2"
                      width="100"
                      alt="preview"
                    />
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-primary"
                  onClick={handleSubmit}
                >
                  Save
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Schedule Section Modal */}
      {showScheduleModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div
              className="modal-content"
              style={{ minWidth: "600px" }}
            >
              <div className="modal-header">
                <h5 className="modal-title">Edit Schedule Section</h5>
                <button
                  className="btn-close"
                  onClick={() => setShowScheduleModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  {[
                    "schedule_heading",
                    "schedule_description",
                    "schedule_button",
                    "schedule_button_route",
                  ].map((field) => (
                    <div className="col-md-6 mb-3" key={field}>
                      <label className="form-label text-capitalize">
                        {field.replace(/_/g, " ")}
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={scheduleContent[field]}
                        onChange={(e) =>
                          handleScheduleChange(field, e.target.value)
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-primary"
                  onClick={handleScheduleSubmit}
                >
                  Save
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowScheduleModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Schedule;