"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "app/(landingpage)/LandingPage/components/Header/page";
import FooterSection from "app/(landingpage)/LandingPage/components/Footer/page";
import "app/(landingpage)/LandingPage/public/css/style.css";
import "bootstrap/dist/css/bootstrap.min.css";
import flatpickr from "flatpickr";
import { checkIsOwner } from "services/config";
import "flatpickr/dist/flatpickr.min.css";
import '../../../../../app/(landingpage)/LandingPage/public/css/style.css'
import { config } from "services/config";
import { postApi, postApiWithFile, updateApiWithFile } from "services/api";
import { usePathname } from 'next/navigation';
// import SubHeader from "app/(landingpage)/LandingPage/components/SubHeader/page";
const BookAnAppointment = () => {
const [centers, setCenters] = useState([]);
const [selectedCenter, setSelectedCenter] = useState(null);
const servicesRef = useRef(null);
// put near other top-level constants/state
const LAST_CENTER_KEY = "appt:lastSelectedCenterId";


// ▼ add these near the top with your other state
const [noteForm, setNoteForm] = useState({
  firstName: '',
  lastName: '',
  email: '',
  mobile: '',
  message: '',
});
const [noteSubmitting, setNoteSubmitting] = useState(false);
const [noteSuccess, setNoteSuccess] = useState('');

// ▼ tiny validators (same style as your other page)
const isNonEmpty = (s) => String(s || '').trim().length > 0;
const isEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(e || '').trim());
const isPhone = (n) => /^\d{10,}$/.test(String(n || '').replace(/\D/g, ''));

const isNoteValid =
  isNonEmpty(noteForm.firstName) &&
  isNonEmpty(noteForm.lastName) &&
  isEmail(noteForm.email) &&
  isPhone(noteForm.mobile) &&
  isNonEmpty(noteForm.message);

const onNoteChange = (e) => {
  const { name, value } = e.target;
  setNoteForm((p) => ({ ...p, [name]: value }));
};
const truncate = (str = "", max = 20) =>
   typeof str === "string" && str.length > max ? `${str.slice(0, max)}...` : str;
const submitNote = async (e) => {
  e.preventDefault();
  if (!isNoteValid || noteSubmitting) return;
  setNoteSubmitting(true);
  try {
    // normalize phone -> digits only
    const payload = { ...noteForm, mobile: noteForm.mobile.replace(/\D/g, '') };
    const res = await postApi(config.AddNotes, payload);
    if (res?.statusCode === 200 || res?.statusCode === 201) {
      setNoteSuccess('Your message has been sent successfully! ✅');
      setNoteForm({ firstName: '', lastName: '', email: '', mobile: '', message: '' });
    } else {
      alert(res?.message || 'Failed to send the message.');
    }
  } catch (err) {
    console.error(err);
    alert('Something went wrong.');
  } finally {
    setNoteSubmitting(false);
  }
};

useEffect(() => {
const fetchCenters = async () => {
  try {
    const response = await postApi(config.centers, { page: 1, pageSize: 100 });
    const centersList = response?.centers || [];
    setCenters(centersList);

    // 🔽 try to restore user's last choice
    const savedId = typeof window !== "undefined" ? localStorage.getItem(LAST_CENTER_KEY) : null;
    const restored = savedId ? centersList.find(c => c._id === savedId) : null;

    if (restored) {
      setSelectedCenter(restored);
      fetchServiceTypes(1, restored._id);
    } else if (centersList.length > 0) {
      setSelectedCenter(centersList[0]);
      fetchServiceTypes(1, centersList[0]._id);
    }
  } catch (err) {
    console.error("Error fetching centers:", err);
  }
};


  fetchCenters();
}, []);


useEffect(() => {
  if (typeof window !== 'undefined' && flatpickr) {
    flatpickr("#datePicker2", {
      dateFormat: "Y-m-d",
      inline: true,
      mode: "range",
      onChange: function () {
        const selected = document.getElementById("selectedDate");
        const selectDate = document.getElementById("selectDate");
        if (selected) selected.style.display = "block";
        if (selectDate) selectDate.style.display = "none";
      },
    });
  }
}, []);
useEffect(() => {
    window.scrollTo(0, 0); 
  }, []);
   
const [bannerData, setBannerData] = useState({});
const [imagePreview, setImagePreview] = useState(null);
const [file, setFile] = useState(null);
const [showModal, setShowModal] = useState(false);
const [isOwner, setIsOwner] = useState(false); 
const [serviceTypes, setServiceTypes] = useState([]);
const pathname = usePathname();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(30);
  const [totalPages, setTotalPages] = useState(1);
useEffect(() => {
  fetchBannerData();
}, []);
useEffect(() => {
  const isIframe = typeof window !== "undefined" && window.self !== window.top;
  const isAdminPath = pathname?.includes('/admin');
  const isAdminUser = checkIsOwner();

  if (isAdminUser && (isIframe || isAdminPath)) {
    setIsOwner(true);
  }
}, [pathname]);

const fetchBannerData = async () => {
  try {
    const res = await postApi(config.GetAppointmentBanner, { id: "685a782fc05bb2d292fdb425" });
    const data = res?.data;

    if (data) {
      setBannerData(data);
      setImagePreview(`${process.env.NEXT_PUBLIC_API_URL}/${data?.file}`.replace(/\\/g, "/"));
    }
  } catch (err) {
    console.error("Error fetching banner", err);
  }
};

 useEffect(() => {
    fetchServiceTypes(currentPage);
  }, [currentPage]);

 const fetchServiceTypes = async (page, centerId = null) => {
  try {
    const response = await postApi(config.AllServiceTypes, {
      page,
      pageSize,
      ...(centerId ? { centerId } : {}), // send only if center selected
    });
    setServiceTypes(response.data || []);
    setTotalPages(response.totalPages || 1);
  } catch (error) {
    console.error("Error fetching service types:", error);
  }
};



const handleSaveBanner = async () => {
  try {
    const res = await updateApiWithFile(
      config.UpdateAppointmentBanner,
      "685a782fc05bb2d292fdb425",
      bannerData,
      file ? { file } : {}
    );
    if (res?.statusCode === 200) {
      setShowModal(false);
      fetchBannerData();
    }
  } catch (err) {
    console.error("Error saving banner", err);
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
    route:"/LandingPage/components/Quiz",
    children: [
      { name: "Dosha Quiz", route: "/LandingPage/components/Quiz" },
      { name: "Health Articles", route: "/LandingPage/components/BookArticles" },
      { name: "Gallery", route: "/LandingPage/components/Gallery" },

    ]
  },
   ];
  return (
    <>
    {!pathname.includes("view-Business") &&  <Header arrayheader={arrayheader} />}
      {/* {!pathname.includes("view-Business") &&  <SubHeader />} */}
      {!pathname.includes("view-Business") &&
   <div className="innerBanner"
  style={{ backgroundImage: `url('${imagePreview || "/images/landingpage/appointment-banner.jpg"}')` }}>
  <div className="container">
    <div className="innerBannertxt">
     <h1
  dangerouslySetInnerHTML={{
    __html: (bannerData?.heading || "Book An Appointment At")
      .split(" ")
      .reduce((acc, word, i) => {
        const groupIndex = Math.floor(i / 4);
        acc[groupIndex] = acc[groupIndex] || [];
        acc[groupIndex].push(word);
        return acc;
      }, [])
      .map(words => words.join(" "))
      .join("<br />")
  }}
/>

      
     <button
  className="btn btn-primary mt-3"
  onClick={() => {
    servicesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }}
>
  {bannerData?.button_label || "Book Classes"}
</button>

      {isOwner && (
        <button className="btn btn-primary ms-2 mt-3" onClick={() => setShowModal(true)}>
          ✏️ Edit Banner
        </button>
      )}
    </div>
  </div> 
</div>}

    {/* -----------------------------Rock Ville Center ---------------------------------- */}
    {isOwner &&<>
                 <div className="d-flex justify-content-center mt-4 gap-3">
                 {/* <Link href={'/admin/Services-Management'} className="btn btn-primary mr-3"><b>+</b> Manage Services</Link> */}
                 <Link href={'/admin/Services-Management'} target="_parent"   className="btn btn-primary mr-3"><b>+</b> Manage Services </Link>
                 
                 </div>
                 </>}
   <section className="rockvilleCenter" ref={servicesRef}>

        <div className="container">
          
            <div className="section-heading mw-100 text-start">
                <img src="/images/landingpage/watermark.png" width="50"/>
            <div className="d-flex" style={{maxWidth:'500px', float:'right'}}>
  <label htmlFor="centerSelect" className="form-label fw-bold">Select Center</label>
  <select
    id="centerSelect"
    className="form-select form-control  fs-8"
    value={selectedCenter?._id || ""}
   onChange={(e) => {
  const center = centers.find(c => c._id === e.target.value);
  setSelectedCenter(center);
  // 🔽 persist selection
  try { localStorage.setItem(LAST_CENTER_KEY, center?._id || ""); } catch {}
  fetchServiceTypes(1, center._id); // reset to page 1 for new center
}}

  >
    {centers.map((center) => (
      <option key={center._id} value={center._id}>
        {center.centerName}
      </option>
    ))}
  </select>
</div>


              <h2>{selectedCenter?.centerName || "Select a Center"}</h2>

                <p>Virtual appointments are available.</p>
            </div>
            <div className="row px-md-1">
               
              {serviceTypes
  ?.filter((service) => service.status === 1)   // ✅ Only Active
  .map((service, index) => (
    <div key={index} className="col-md-6 col-lg-4 col-xl-3 mb-3 px-md-2">
      <div className="appointmentTxt h-100">
        <div className="d-flex align-items-center gap-2">
          <figure><img src="/images/landingpage/layer9.png" alt="" width="30" /></figure>
          <h3>{truncate(service.name, 40)}</h3>
        </div>
        <p>{service.description}</p>

        <Link
          href={{
            pathname: `/Appointment/components/AyurvedicInitialConsult/${service?._id}`,
            query: { centerId: selectedCenter?._id },
          }}
          className="btn btn-orange d-flex align-items-center justify-content-center gap-2"
        >
          Explore
          <lottie-player
            src="/images/landingpage/right-arrow.json"
            background="transparent"
            speed="1"
            style={{ width: "23px", height: "26px" }}
            loop
            autoplay
          ></lottie-player>
        </Link>
      </div>
    </div>
))}


            </div>
        </div>
    </section>



    {/* ------------------------------------------------------- Send A Note Section ---------------------------------- */}
   {!pathname.includes("view-Business") &&(<>
    <section className="generalInquiries formsendNote">
        <div className="container">
            <div className="section-heading pb-4">
                <img src="/images/landingpage/watermark.png" width="50"/>
                <h2>Send a Message</h2>
                <p>Need assistance? Call us or send a message here</p>
            </div>
            <div className="row align-items-center justify-content-center">
                <div className="col-md-6">
                    <div className="contactForm">
  <form onSubmit={submitNote}>
    <div className="row">
      <div className="col-md-12">
        <div className="form-group">
          <input
            type="email"
            className="form-control"
            name="email"
            value={noteForm.email}
            onChange={onNoteChange}
            placeholder="Email Address *"
            required
          />
        </div>
      </div>

      <div className="col-md-6">
        <div className="form-group">
          <input
            type="text"
            className="form-control"
            name="firstName"
            value={noteForm.firstName}
            onChange={onNoteChange}
            placeholder="First Name *"
            required
          />
        </div>
      </div>

      <div className="col-md-6">
        <div className="form-group">
          <input
            type="text"
            className="form-control"
            name="lastName"
            value={noteForm.lastName}
            onChange={onNoteChange}
            placeholder="Last Name *"
            required
          />
        </div>
      </div>

      <div className="col-md-12">
        <div className="form-group">
          <input
            type="tel"
            className="form-control"
            name="mobile"
            value={noteForm.mobile}
            onChange={onNoteChange}
            placeholder="Phone *"
            required
            pattern="\d{10,}"
            inputMode="numeric"
          />
        </div>
      </div>

      <div className="col-md-12">
        <div className="form-group">
          <textarea
            className="form-control"
            name="message"
            value={noteForm.message}
            onChange={onNoteChange}
            placeholder="Your Note *"
            required
          />
        </div>
      </div>

      <div className="col-md-12 text-center">
        <div className="form-group">
          <button
            type="submit"
            className="btn btn-primary px-4"
            disabled={!isNoteValid || noteSubmitting}
            aria-disabled={!isNoteValid || noteSubmitting}
          >
            {noteSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </div>

      {noteSuccess && (
        <div className="col-md-12">
          <div className="alert alert-success mt-2" role="alert">
            {noteSuccess}
          </div>
        </div>
      )}
    </div>
  </form>
</div>

                </div>
            </div>
        </div>
    </section>
      <FooterSection /></>)}
<div
  className="modal fade booknowModal"
  id="booknowModal"
  tabIndex="-1"
  aria-hidden="true"
>
  <div className="modal-dialog modal-dialog-centered">
    <div className="modal-content border-0 rounded-1">
      <div className="modal-header border-0">
        <h1 className="modal-title fs-6">Book Classes</h1>
        <button
          type="button"
          className="btn-close"
          data-bs-dismiss="modal"
          aria-label="Close"
        ></button>
      </div>
      <div className="modal-body">
        <div className="border d-flex flex-wrap">
          <div className="detailsDiv border-end">
            <h3 className="fs-7 mb-3 fw-semibold text-brown">Details</h3>

            <div className="form-group mb-3">
              <select className="form-select">
                <option>Select Class</option>
              </select>
            </div>
            <div className="form-group mb-3">
              <select className="form-select">
                <option>Select Instructor</option>
              </select>
            </div>
            <div className="form-group mb-3">
              <select className="form-select">
                <option>Live Stream and In-house classes</option>
              </select>
            </div>

            <div className="searchBtn">
              <a href="classes.html" className="btn btn-primary fs-7 w-100">
                Search
              </a>
            </div>
          </div>

          <div className="selectDatDiv selectClass">
            <div
              className="mb-3 bookclsMdl"
              id="selectedDate"
              style={{ display: "none" }}
            >
              <div className="bookedNote mb-3">
                <lottie-player
                  src="/images/landingpage/no-schedule-mdl.json"
                  background="transparent"
                  speed="1"
                  style={{ width: "60px", height: "60px", minWidth: "65px" }}
                  loop
                  autoPlay
                ></lottie-player>
                <div className="ps-2">
                  <strong>Class Not Scheduled</strong>
                  <p>
                    There are no dates scheduled for the selected class and
                    instructor.
                  </p>
                </div>
              </div>
            </div>
            <div id="datePicker2"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
      {/* ----------------------------------------------update banner model --------------------------------------------- */}

{showModal && (
  <div className="modal show d-block" tabIndex="-1">
    <div className="modal-dialog modal-lg">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">Edit Banner</h5>
          <button className="btn-close" onClick={() => setShowModal(false)}></button>
        </div>
        <div className="modal-body">
          <div className="mb-3">
            <label>Heading</label>
            <input className="form-control" value={bannerData.heading || ""} onChange={(e) => setBannerData({ ...bannerData, heading: e.target.value })} />
          </div>
          <div className="mb-3">
            <label>Button Label</label>
            <input className="form-control" value={bannerData.button_label || ""} onChange={(e) => setBannerData({ ...bannerData, button_label: e.target.value })} />
          </div>
          <div className="mb-3">
            <label>Banner Image</label><br />
            <input type="file" accept="image/*" onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setFile(file);
                setImagePreview(URL.createObjectURL(file));
              }
            }} />
            {imagePreview && <img src={imagePreview} alt="preview" className="mt-2" style={{ width: "100%", maxHeight: 200, objectFit: "cover" }} />}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-primary" onClick={handleSaveBanner}>Save</button>
          <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
        </div>
      </div>
    </div>
  </div>
)}

    </>
  );
};
export default BookAnAppointment;
