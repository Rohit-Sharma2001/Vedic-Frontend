"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "../Header/page";
// import SubHeader from "../SubHeader/page";
import "../../public/css/style.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { config } from "services/config";
import { postApi, updateApiWithFile } from "services/api";
import { checkIsOwner } from "services/config";
import FooterSection from "../Footer/page";
import DynamicModal3 from "services/Pop-ups/popup3/page";
import { usePathname } from 'next/navigation';
const ContactAmita = () => {
  const [isOwner, setIsOwner] = useState(false);
  const [responseMessage, setResponseMessage] = useState({})
      const [responseHeading, setResponseHeading] = useState({})
      const [responseTitle, setResponseTitle] = useState({})
   const [showsuccessModal, setShowSuccessModal] = useState(false);
  const [contactForm, setContactForm] = useState({
    firstName: "",
    lastName: "",
    mobile: "",
    email: "",
    message: "",
  });

  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setContactForm((prev) => ({ ...prev, [name]: value }));
  };

 const pathname = usePathname();

useEffect(() => {
  const isIframe = typeof window !== "undefined" && window.self !== window.top;
  const isAdminPath = pathname?.includes('/admin');
  const isAdminUser = checkIsOwner();

  if (isAdminUser && (isIframe || isAdminPath)) {
    setIsOwner(true);
  }
}, [pathname]);

  const [imagePreview, setImagePreview] = useState("");
  const fileInputRef = useRef(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    banner_text: "",
    banner_description: "",
    image: null,
    number: "",
    email: "",
    address: "",
    fb_link: "",
    insta_link: "",
    twitter_link: "",
    youtube_link: "",
    linkedIn_link: "",
  });

  useEffect(() => {
    fetchContactData();
  }, []);

  const fetchContactData = async () => {
    try {
      const res = await postApi(config.GetContactAmita, {
        id: "682b1b0ea8813dd4ea462565",
      });
      const data = res?.result;
      if (data) {
        setFormData({
          banner_text: data.banner_text || "",
          banner_description: data.banner_description || "",
          number: data.number || "",
          email: data.email || "",
          address: data.address || "",
          fb_link: data.fb_link || "",
          insta_link: data.insta_link || "",
          twitter_link: data.twitter_link || "",
          youtube_link: data.youtube_link || "",
          linkedIn_link: data.linkedIn_link || "",
        });
        setImagePreview(
          `${process.env.NEXT_PUBLIC_API_URL}/${data.image}`.replace(/\\/g, "/")
        );
      }
    } catch (err) {
      console.error("Fetch failed", err);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };
  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    try {
      const files = formData.image ? { image: formData.image } : {};
      const payload = { ...formData, image: undefined };
      await updateApiWithFile(
        config.UpdateContactAmita,
        "682b1b0ea8813dd4ea462565",
        payload,
        files
      );
      setShowModal(false);
      fetchContactData();
    } catch (err) {
      console.error("Update failed", err);
    }
  };

   const arrayheader = [
    { name: "Schedule", route: "/LandingPage/components/AmitaHome" },
    { name: "Free Clinic", route: "/LandingPage/components/FreeClinic" },
    { name: "Classes", route: "/YogaClasses/components/JoinYogaClasses" },
    { name: "Book & Articles", route: "/LandingPage/components/BookArticles" },
    { name: "Talks", route: "/LandingPage/components/TalksByAmita" },
    { name: "Case Studies", route: "/LandingPage/components/CaseStories" },
    { name: "About", route: "/LandingPage/components/AmitajainLandingPage" },
  ];

const submitContactForm = async () => {
  const { firstName, lastName, mobile, email, message } = contactForm;

  if (!firstName || !lastName || !mobile || !email || !message) {
    setResponseTitle("Validation Error");
    setResponseHeading("Missing Fields");
    setResponseMessage("All fields are required. Please fill them out.");
    setShowSuccessModal(true);
    return;
  }

  try {
    const res = await postApi(config.AddNotes, contactForm);
    if (res?.statusCode === 201) {
      setResponseTitle("Success");
      setResponseHeading("Message Submitted");
      setResponseMessage("Congratulations! Your Message has been sent successfully.");
      setContactForm({
        firstName: "",
        lastName: "",
        mobile: "",
        email: "",
        message: "",
      });
      setShowSuccessModal(true);
    } else {
      setResponseTitle("Failed!");
      setResponseHeading("Oops !!");
      setResponseMessage("Message Submission Failed !");
      setShowSuccessModal(true);
    }
  } catch (err) {
    console.error("Contact form error", err);
  }
};


  return (
    <>
    {/* {!isOwner ?
      <Header arrayheader={arrayheader} />
      :<h3 className="mt-3" style={{marginLeft:'15px'}}>Contac Amita page </h3>}
        {!isOwner && <SubHeader />} */}
      <div
        className="innerBanner"
        // style={{ backgroundImage: "url(/images/landingpage/contact-banner.jpg)" }}
        style={{ backgroundImage: `url('${imagePreview}')` }}
      >
        <div className="container">
          <div className="innerBannertxt contactbner">
            <h1>{formData?.banner_text}</h1>
            <p>{formData?.banner_description}</p>
            {isOwner && (
              <button
                className="btn btn-primary my-3"
                onClick={() => setShowModal(true)}
              >
                ✏️ Edit Details
              </button>
            )}
          </div>
        </div>
      </div>

      <section className="contactMain">
        <div className="container">
          <div className="generalInquiries">
            <div className="row">
              <div className="col-lg-5">
                <div className="getTouch h-100">
                  <div className="section-heading text-start pb-4">
                    <h2>Get in touch</h2>
                  </div>
                  <ul>
                    <li>
                      <figure>
                        <img
                          src="/images/landingpage/location-contact-icon.svg"
                          alt=""
                          width="35"
                        />
                        <span>
                          Head office{" "}
                          <b>
                            15235 Shady Grove Rd Suite 100 Rockville, MD 20850
                          </b>
                        </span>
                      </figure>
                    </li>
                    <li>
                      <figure>
                        <img
                          src="/images/landingpage/call-contact-icon.svg"
                          alt=""
                          width="35"
                        />
                        <span>
                          Call <b>{formData?.number}</b>
                        </span>
                      </figure>
                    </li>
                    <li>
                      <figure>
                        <img
                          src="/images/landingpage/mail-contact-icon.svg"
                          alt=""
                          width="35"
                        />
                        <span>
                          Mail <b>{formData?.email}</b>
                        </span>
                      </figure>
                    </li>
                  </ul>
                  <hr />
                  <strong className="fw-semibold d-block mb-3">
                    Follow her on social media
                  </strong>
                  <div className="d-flex gap-2">
                    <Link href={formData?.fb_link}>
                      <img
                        src="/images/landingpage/facebook-contct.svg"
                        alt=""
                        width="24"
                      />
                    </Link>
                    <Link href={formData?.insta_link}>
                      <img
                        src="/images/landingpage/insta-contct.svg"
                        alt=""
                        width="24"
                      />
                    </Link>
                    <Link href={formData?.twitter_link}>
                      <img
                        src="/images/landingpage/twitt-contct.svg"
                        alt=""
                        width="24"
                      />
                    </Link>
                    <Link href={formData?.linkedIn_link}>
                      <img
                        src="/images/landingpage/linkdin-contct.svg"
                        alt=""
                        width="24"
                      />
                    </Link>
                  </div>
                </div>
              </div>
              <div className="col-lg-7">
                <div className="section-heading pb-4 text-start m-0">
                  <img
                    src="/images/landingpage/watermark.png"
                    width="50"
                    alt=""
                  />
                  <h2>Contact Amita Jain</h2>
                </div>
                <div className="contactForm">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <input
  type="text"
  className="form-control"
  placeholder="First Name *"
  name="firstName"
  value={contactForm.firstName}
  onChange={handleContactChange}
  required
/>

                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Last Name *"
                          name="lastName"
                          value={contactForm.lastName}
                          onChange={handleContactChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Contact Number *"
                          name="mobile"
                          value={contactForm.mobile}
                          onChange={handleContactChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <input
                          type="email"
                          className="form-control"
                          placeholder="Enter Email *"
                          name="email"
                          value={contactForm.email}
                          onChange={handleContactChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-12">
                      <div className="form-group">
                        <textarea
                          type="email"
                          className="form-control"
                          placeholder="Enter Message *"
                          name="message"
                          value={contactForm.message}
                          onChange={handleContactChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-12 text-start">
                      <div className="form-group m-0">
                        <button type="button" className="btn btn-primary px-5" onClick={submitContactForm}>
  Send
</button>

                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {showModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content" style={{minWidth:'600px'}}>
              <div className="modal-header">
                <h5 className="modal-title">Edit Contact Details</h5>
                <button
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  {[
                    "banner_text",
                    "banner_description",
                    "number",
                    "email",
                    "address",
                    "fb_link",
                    "insta_link",
                    "twitter_link",
                    "youtube_link",
                    "linkedIn_link",
                  ].map((field, idx) => (
                    <div className="col-md-6 mb-3" key={field}>
                      <label className="form-label text-capitalize">
                        {field.replace(/_/g, " ")}
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData[field]}
                        onChange={(e) => handleChange(field, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
                <div className="mb-3">
                  <label className="form-label">Banner Image</label>
                  <input
                    type="file"
                    className="form-control"
                    onChange={handleImageUpload}
                  />
                  {imagePreview && (
                    <img src={imagePreview} className="mt-2" width="100" />
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-primary" onClick={handleSubmit}>
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
       <DynamicModal3
                                show={showsuccessModal}
                                onClose={() => setShowSuccessModal(false)}
                                title={responseTitle}
                                heading={ responseHeading}
                                description={ responseMessage }
                                buttonText="Continue"
                                onButtonClick={() => setShowSuccessModal(false)}
                              />

    {/* {!isOwner &&  <FooterSection />} */}
    </>
  );
};
export default ContactAmita;
