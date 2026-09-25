"use client";
import React, { useEffect, useState ,useRef} from "react";
import Header from "../Header/page";
import InnerBanner from "../AmitajainInnerBanner/page";
import AboutAmitaJain from "../AboutAmitaJain/page";
import BackgroundOfHer from "../BackgroundOfHer/page";
import SendANoteToAmita from "../SendANoteToAmita/page";
import BhagavadGitaQuote from "../BhagavadGitaQuote/page";
import FooterSection from "../Footer/page";
import { postApi ,updateApiWithFile, postApiWithFile } from "services/api";
import { config } from "services/config";
import '../../public/css/style.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { checkIsOwner } from "services/config"; 
import Link from "node_modules/next/link";
import { usePathname } from 'next/navigation';
// import SubHeader from "../SubHeader/page";
const JobOpenings = () => {
  
const formRef = useRef(null); // section ref for smooth scroll
const formElementRef = useRef(null); // actual form element ref
const availableDateRef = useRef(null); // date input ref to trigger picker via icon
   const [isOwner, setIsOwner] = useState(false);
const [selectedJob, setSelectedJob] = useState(null);
const [showJobModal, setShowJobModal] = useState(false);

const pathname = usePathname();

useEffect(() => {
  const isIframe = typeof window !== "undefined" && window.self !== window.top;
  const isAdminPath = pathname?.includes('/admin');
  const isAdminUser = checkIsOwner();

  if (isAdminUser && (isIframe || isAdminPath)) {
    setIsOwner(true);
  }
}, [pathname]);

const [jobData, setJobData] = useState({});
const [imagePreview, setImagePreview] = useState(null);
const [file, setFile] = useState(null);
const [showModal, setShowModal] = useState(false);
 const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(50);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [jobs, setJobs] = useState([]);
const [formState, setFormState] = useState({
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  availableDate: "",
  jobId: "",
});
const [resumeFile, setResumeFile] = useState(null);
const [formError, setFormError] = useState("");
const [formSuccess, setFormSuccess] = useState("");
const [highlightForm, setHighlightForm] = useState(false);

const [isSubmitting, setIsSubmitting] = useState(false);
  useEffect(() => {
  window.scrollTo(0, 0);
  fetchJobBanner();
  fetchJobs(currentPage)
}, []);

const jumpToForm = (job) => {
  // preselect job in the form dropdown
  if (job?._id || job?.id) {
    setFormState((prev) => ({ ...prev, jobId: job._id || job.id }));
  }

  // close the job details modal
  setShowJobModal(false);

  // small delay so modal closes before scroll/paint
  setTimeout(() => {
    // smooth scroll to form section
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // highlight form briefly
    setHighlightForm(true);
    setTimeout(() => setHighlightForm(false), 1800);

    // focus the first input in the form
    const firstInput = formElementRef.current?.querySelector('input, select, textarea, button');
    firstInput?.focus();
  }, 50);
};

const fetchJobs = async (page) => {
  try {
    const endpoint = config.allJobs;
    const data = { page, pageSize };
    const response = await postApi(endpoint, data);

    const allJobs = response.JobManagement || [];
    // ✅ show only active jobs (status === 1); also guard against soft-deleted if present
    const onlyActive = allJobs.filter(
      (j) => Number(j?.status) === 1 && Number(j?.is_deleted || 0) !== 1
    );

    setJobs(onlyActive);
    setTotalPages(response.totalPages || 1);
    setTotalCount(response.totalCount || 0);
  } catch (error) {
    console.error('Error fetching jobs:', error);
  }
};

const fetchJobBanner = async () => {
  try {
    const res = await postApi(config.GetJobPageContent, { id: "682ad6efb177993070203034" });
    const data = res?.data;
    if (data) {
      setJobData(data);
      const image = data?.file
        ? `${process.env.NEXT_PUBLIC_API_URL}/${data.file}`.replace(/\\/g, "/")
        : "/images/landingpage/job-openings-banner.jpg";
      setImagePreview(image);
    }
  } catch (err) {
    console.error("Failed to load job data", err);
  }
};

const handleSaveJobBanner = async () => {
  try {
    const res = await updateApiWithFile(
      config.UpdateJobPageContent,
      "682ad6efb177993070203034",
      jobData,
      file ? { file } : {}
    );
    if (res?.statusCode === 200) {
      setShowModal(false);
      fetchJobBanner(); // refresh
    }
  } catch (err) {
    console.error("Failed to update banner", err);
  }
};

const handleInputChange = (e) => {
  const { name, value } = e.target;
  setFormState((prev) => ({ ...prev, [name]: value }));
};

const handleResumeChange = (e) => {
  const selected = e.target.files?.[0];
  setFormError("");

  if (!selected) {
    setResumeFile(null);
    return;
  }

  const isPdf = selected.type === "application/pdf" || selected.name.toLowerCase().endsWith(".pdf");
  const isUnder10Mb = selected.size <= 10 * 1024 * 1024;

  if (!isPdf) {
    setFormError("Please upload a PDF file only.");
    setResumeFile(null);
    return;
  }

  if (!isUnder10Mb) {
    setFormError("File size should be less than 10MB.");
    setResumeFile(null);
    return;
  }

  setResumeFile(selected);
};

// In JobOpenings component
const handleSubmit = async (e) => {
  e.preventDefault();
  setFormError("");
  setFormSuccess("");

  const { firstName, lastName, email, phone, availableDate, jobId } = formState;
  if (!firstName || !lastName || !email || !phone || !availableDate || !jobId) {
    setFormError("Please fill in all required fields.");
    return;
  }
  if (!resumeFile) {
    setFormError("Please attach your resume (PDF under 10MB).");
    return;
  }

  try {
    setIsSubmitting(true);
    const payload = {
      job_id: jobId,     // ✅ correct key
      firstName,
      lastName,
      email,
      phone,             // ✅ correct key (not phoneNumber)
      availableDate,
      // resumeLink left empty; backend will set it from uploaded file
    };

    const response = await postApiWithFile(config.applyJob, payload, { file: resumeFile });

    if (response?.statusCode === 201) {
      setFormSuccess("Application submitted successfully.");
      setFormState({ firstName: "", lastName: "", email: "", phone: "", availableDate: "", jobId: "" });
      setResumeFile(null);
      formElementRef.current?.reset();
    } else {
      setFormError(response?.message || "Failed to submit application. Please try again.");
    }
  } catch (error) {
    setFormError("Failed to submit application. Please try again.");
    console.error("Job application error", error);
  } finally {
    setIsSubmitting(false);
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
            {/* <Header arrayheader={arrayheader} /> */}
             {!isOwner ?
      <Header arrayheader={arrayheader} />
      :<h3 className="mt-3 ml-3" style={{marginLeft:"15px"}}>Job Opening Page</h3>
    }
 {/* {!isOwner && <SubHeader />} */}
<div className="innerBanner" style={{ backgroundImage: `url('${imagePreview}')` }}>
  <div className="container">
    <div className="innerBannertxt">
      <h1
  dangerouslySetInnerHTML={{
    __html: (jobData?.banner_text || "Job Openings At Vedic")
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

     
     {isOwner &&  <button className="btn btn-primary mt-3" onClick={() => setShowModal(true)}>
        ✏️ Edit Banner
      </button>
      }
    </div>
  </div>
</div>


            <section className="rockvilleCenter">
                <div className="container">
                    <div className="section-heading">
                        <img src="/images/landingpage/watermark.png" width={50} />
                        <h2>{jobData?.heading}</h2>
                        <p>
                           {jobData?.subheading}
                        </p>
                       {isOwner && <Link href={'/admin/cms/Jobs'} target="_parent"  className="btn btn-primary mt-2"><b>+</b> Add Job Openings </Link>}
                    </div>
                    <div className="row opningsMain">

                        {jobs?.length > 0 ? 
                        (jobs?.map((job,index) => (
                              <div className="col-md-6 col-lg-4 col-xl-4 mb-4" key={index}>
                            <div className="appointmentTxt h-100">
                                <div className="d-flex align-items-center gap-2 mb-2">
                                    <figure className="m-0">
                                        <img src="/images/landingpage/layer9.png" alt="" width={30} />
                                    </figure>
                                    <p className="fw-semibold fs-7 m-0 p-0">
                                        {job.jobTitle}
                                    </p>
                                </div>
                                <div>
                                    <span>
                                       <b className="fw-semibold"> ( {job.jobType})</b> {job.jobDescription}
                                    </span>
                                  <button
  className="btn btn-orange d-flex align-items-center justify-content-center gap-2"
  onClick={() => {
    setSelectedJob(job);
    setShowJobModal(true);
  }}
>
  Explore
  <lottie-player
    src="/images/landingpage/right-arrow.json"
    background="transparent"
    speed={1}
    style={{ width: 23, height: 26 }}
    loop
    autoPlay
  />
</button>

                                </div>
                            </div>
                        </div>
                        )) ): <h6 className="d-flex justify-content-center">Currently no jobs available</h6>}
                      
                    </div>
                </div>
            </section>
           <section
  ref={formRef}
  className={`generalInquiries formsendNote ${highlightForm ? 'form-highlight' : ''}`}
>

                <div className="container">
                    <div className="section-heading pb-4">
                        <img src="/images/landingpage/watermark.png" width={50} />
                        <h2>Ayurveda Jobs and Volunteering</h2>
                        <p>Write us any message</p>
                    </div>
             
  <div className="row align-items-center justify-content-center">
  <div className="col-md-8 col-lg-6">
              <form ref={formElementRef} onSubmit={handleSubmit} className="contactForm">
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <input
                        type="text"
                        className="form-control"
                        name="firstName"
                        value={formState.firstName}
                        onChange={handleInputChange}
                        placeholder="First Name"
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
                        value={formState.lastName}
                        onChange={handleInputChange}
                        placeholder="Last Name"
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="form-group">
                      <input
                        type="email"
                        className="form-control"
                        name="email"
                        value={formState.email}
                        onChange={handleInputChange}
                        placeholder="Email Address*"
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <input
                        type="tel"
                        className="form-control"
                        name="phone"
                        value={formState.phone}
                        onChange={handleInputChange}
                        placeholder="Phone"
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <select
                        className="form-select"
                        name="jobId"
                        value={formState.jobId}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="" disabled>
                          Select Position
                        </option>
                        {jobs.map((job) => (
                          <option key={job._id || job.id} value={job._id || job.id}>
                            {job.jobTitle}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group position-relative">
                      <input
                        ref={availableDateRef}
                        type="date"
                        className="form-control"
                        name="availableDate"
                        value={formState.availableDate}
                        onChange={handleInputChange}
                        placeholder="mm/dd/yyyy"
                        required
                      />
                      <button
                        type="button"
                        className="inputBtndate"
                        onClick={() => {
                          // show native date picker when clicking the icon
                          if (availableDateRef.current?.showPicker) {
                            availableDateRef.current.showPicker();
                          } else {
                            availableDateRef.current?.focus();
                            availableDateRef.current?.click();
                          }
                        }}
                        aria-label="Open date picker"
                      >
                        <img src="/images/landingpage/date-icon.svg" width={16} />
                      </button>
                     <small className="text-muted">Available Date</small>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <input
                        type="file"
                        className="form-control"
                        accept="application/pdf"
                        onChange={handleResumeChange}
                        required
                      />
                      <small className="text-muted">PDF only, max 10MB.</small>
                    </div>
                  </div>
                  {formError && (
                    <div className="col-md-12">
                      <div className="alert alert-danger py-2">{formError}</div>
                    </div>
                  )}
                  {formSuccess && (
                    <div className="col-md-12">
                      <div className="alert alert-success py-2">{formSuccess}</div>
                    </div>
                  )}
                  <div className="col-md-12 text-center mt-4">
                    <div className="form-group">
                      <button type="submit" className="btn btn-primary px-4" disabled={isSubmitting}>
                        {isSubmitting ? "Submitting..." : "Submit"}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
             
                </div>
            </section>

{showModal && (
  <div className="modal show d-block" tabIndex="-1">
    <div className="modal-dialog modal-lg">
      <div className="modal-content"style={{minWidth:'600px'}}>
        <div className="modal-header">
          <h5 className="modal-title">Edit Job Banner</h5>
          <button className="btn-close" onClick={() => setShowModal(false)}></button>
        </div>
        <div className="modal-body">
             <div className="mb-3">
            <label className="form-label">Banner Text</label>
            <input
              className="form-control"
              value={jobData.banner_text || ""}
              onChange={(e) => setJobData({ ...jobData, banner_text: e.target.value })}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Page Heading</label>
            <input
              className="form-control"
              value={jobData.heading || ""}
              onChange={(e) => setJobData({ ...jobData, heading: e.target.value })}
            />
          </div>

          <div className="mb-3">
            <label className="form-label"> Page Subheading</label>
            <input
              className="form-control"
              value={jobData.subheading || ""}
              onChange={(e) => setJobData({ ...jobData, subheading: e.target.value })}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Banner Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setFile(file);
                  setImagePreview(URL.createObjectURL(file));
                }
              }}
            />
            {imagePreview && (
              <img
                src={imagePreview}
                alt="preview"
                className="mt-2"
                style={{ width: "100%", maxHeight: 200, objectFit: "cover" }}
              />
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-primary" onClick={handleSaveJobBanner}>Save</button>
          <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
        </div>
      </div>
    </div>
  </div>
)}

{!isOwner &&  <FooterSection />}

{showJobModal && selectedJob && (
  <div
    className={`job-modal-overlay ${showJobModal ? "open" : ""}`}
    onClick={() => setShowJobModal(false)}
  >
    <div
      className={`job-modal-card ${showJobModal ? "open" : ""}`}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="job-modal-header">
        <h2>{selectedJob.jobTitle}</h2>
        <button
          className="job-modal-close"
          onClick={() => setShowJobModal(false)}
        >
          ×
        </button>
      </div>

      <div className="job-modal-content">
        <div className="job-section">
          <span className="label">Description</span>
          <p>{selectedJob.jobDescription}</p>
        </div>

        <div className="job-info-grid">
          <div>
            <span className="label">Location</span>
            <p>{selectedJob.jobLocation || "N/A"}</p>
          </div>
          <div>
            <span className="label">Type</span>
            <p>{selectedJob.jobType}</p>
          </div>
          {selectedJob.salary && (
            <div>
              <span className="label">Salary</span>
              <p>{selectedJob.salary} {selectedJob.paymentType}</p>
            </div>
          )}
        </div>
      </div>

      <div className="job-modal-actions">
        <button
          className="btn btn-light"
          onClick={() => setShowJobModal(false)}
        >
          Close
        </button>
        <button
          className="btn btn-primary"
          onClick={() => jumpToForm(selectedJob)}
        >
          Apply Now
        </button>
      </div>
    </div>
  </div>
)}


<style jsx global>{`
.job-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.25s ease;
}

.job-modal-overlay.open {
  opacity: 1;
  pointer-events: auto;
}

.job-modal-card {
  background: #ffffff;
  width: 92%;
  max-width: 760px;
  border-radius: 14px;
  padding: 0;
  transform: translateY(30px);
  opacity: 0;
  transition: all 0.3s ease;
}

.job-modal-card.open {
  transform: translateY(0);
  opacity: 1;
}

/* Header */
.job-modal-header {
  padding: 24px 28px 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.job-modal-header h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
  color: #222;
}

.job-modal-close {
  border: none;
  background: transparent;
  font-size: 26px;
  color: #666;
  cursor: pointer;
}

/* Content */
.job-modal-content {
  padding: 0 28px 24px;
}

.job-section {
  margin-bottom: 20px;
}

.job-info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 18px;
}

.label {
  font-size: 12px;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  display: block;
  margin-bottom: 4px;
}

.job-modal-content p {
  margin: 0;
  color: #333;
  line-height: 1.6;
}

/* Footer */
.job-modal-actions {
  padding: 16px 28px 24px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  border-top: 1px solid #eee;
}

  .form-highlight .contactForm {
    position: relative;
    outline: 3px solid rgba(102, 42, 9, 0.95);             /* #662A09 */
    box-shadow:
      0 0 0 4px rgba(102, 42, 9, 0.15),
      0 6px 24px rgba(0, 0, 0, 0.12);
    border-radius: 12px;
    animation: formPulse 1.1s ease-in-out 2;
    scroll-margin-top: 80px;
  }

  /* Hide native date input icon so only custom calendar shows */
  input[type='date']::-webkit-calendar-picker-indicator {
    opacity: 0;
    display: none;
  }
  input[type='date'] {
    -webkit-appearance: none;
       -moz-appearance: none;
            appearance: none;
  }

  @keyframes formPulse {
    0% {
      outline-color: rgba(102, 42, 9, 0.95);               /* #662A09 */
      box-shadow:
        0 0 0 6px rgba(102, 42, 9, 0.18),
        0 6px 24px rgba(0, 0, 0, 0.12);
    }
    50% {
      outline-color: rgba(102, 42, 9, 0.35);
      box-shadow:
        0 0 0 2px rgba(102, 42, 9, 0.12),
        0 4px 18px rgba(0, 0, 0, 0.10);
    }
    100% {
      outline-color: rgba(102, 42, 9, 0.95);
      box-shadow:
        0 0 0 6px rgba(102, 42, 9, 0.18),
        0 6px 24px rgba(0, 0, 0, 0.12);
    }
  }
`}</style>



        </>
    );
};

export default JobOpenings;
