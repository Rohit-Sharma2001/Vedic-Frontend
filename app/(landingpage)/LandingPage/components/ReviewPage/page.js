"use client";
import React, { useEffect, useState } from "react";
import Header from "../Header/page";
import InnerBanner from "../AmitajainInnerBanner/page";
import AboutAmitaJain from "../AboutAmitaJain/page";
import BackgroundOfHer from "../BackgroundOfHer/page";
import SendANoteToAmita from "../SendANoteToAmita/page";
import BhagavadGitaQuote from "../BhagavadGitaQuote/page";
import FooterSection from "../Footer/page";
import { updateApiWithFile, postApi } from "services/api";
import { useRef } from "react";
import '../../public/css/style.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { config } from "services/config";
import { checkIsOwner } from "services/config";
import { StarFill } from 'react-bootstrap-icons';
import DynamicModal3 from "services/Pop-ups/popup3/page";
import { usePathname } from 'next/navigation';
// import SubHeader from "../SubHeader/page";
const ReviewPage = () => {
  const [reviewForm, setReviewForm] = useState({
  firstName: "",
  lastName: "",
  email: "",
  mobile: "",
  practionerName: "",
  rating: 5,
  review: "",
  note: "",
  isAnonymous: false
});

const handleReviewChange = (e) => {
  const { name, value, type, checked } = e.target;
  setReviewForm((prev) => ({
    ...prev,
    [name]: type === "checkbox" ? checked : value
  }));
};
const handleInputChange = (e) => {
  const { name, value, type, checked } = e.target;
  setFormData({
    ...formData,
    [name]: type === 'checkbox' ? checked : value
  });
};


  const id = "682854739de7068047f3962f"; // Replace with your actual ID
const [imagePreview, setImagePreview] = useState(null);
const fileInputRef = useRef(null);
const [showModal, setShowModal] = useState(false);
 const [responseMessage, setResponseMessage] = useState({})
    const [responseHeading, setResponseHeading] = useState({})
    const [responseTitle, setResponseTitle] = useState({})
 const [showsuccessModal, setShowSuccessModal] = useState(false);
const [formData, setFormData] = useState({
  banner_title: '',
  banner_text: '',
  button_route: '',
  button_label: '',
  your_stories_heading: '',
  your_stories_text: '',
  // your_stories_button_route: '',
  // your_stories_button_label: '',
});
 const [isOwner, setIsOwner] = useState(false);

const pathname = usePathname();

useEffect(() => {
  const isIframe = typeof window !== "undefined" && window.self !== window.top;
  const isAdminPath = pathname?.includes('/admin');
  const isAdminUser = checkIsOwner();

  if (isAdminUser && (isIframe || isAdminPath)) {
    setIsOwner(true);
  }
}, [pathname]);

const fetchBannerImage = async () => {
  try {
    const res = await postApi(config.GetReviewPageContent, { id });
    const file = res?.data?.file;
    if (file) {
      const imageUrl = `${process.env.NEXT_PUBLIC_API_URL}/${file}`.replace(/\\/g, "/");
      setImagePreview(imageUrl);
    }

    // Pre-fill modal form data
    setFormData({
      banner_title: res?.data?.banner_title || '',
      banner_text: res?.data?.banner_text || '',
      button_route: res?.data?.button_route || '',
      button_label: res?.data?.button_label || '',
      your_stories_heading: res?.data?.your_stories_heading || '',
      your_stories_text: res?.data?.your_stories_text || '',
      // your_stories_button_route: res?.data?.your_stories_button_route || '',
      // your_stories_button_label: res?.data?.your_stories_button_label || '',
    });
  } catch (err) {
    console.error("Error fetching banner image", err);
  }
};

   

useEffect(() => {
  fetchBannerImage();
  window.scrollTo(0, 0);
}, []);



const handleImageUpload = (e) => {
  const file = e.target.files?.[0];
  if (file) {
    setImagePreview(URL.createObjectURL(file));
    updateBannerImage(file);
  }
};

const updateBannerImage = async (file) => {
  try {
    const files = { file };
    const res = await updateApiWithFile(config.UpdateReviewPageContent, id, {}, files);
    // console.logRes
    if (res?.statusCode === 200) {
      fetchBannerImage()
    }
  } catch (err) {
    console.error("Error updating image", err);
  }
};

const submitCustomerReview = async () => {
   if (
    !reviewForm.firstName.trim() ||
    !reviewForm.lastName.trim() ||
    !reviewForm.email.trim() ||
    // !reviewForm.mobile.trim() ||
    !reviewForm.practionerName.trim() ||
    !reviewForm.review.trim()
  ) {
    setResponseTitle("Validation Error");
    setResponseHeading("Missing Fields");
    setResponseMessage("All fields marked * are mandatory.");
    setShowSuccessModal(true);
    return;
  }
  try {
    
      const data = { ...reviewForm };
    const res = await postApi(config.Addtestimonial, data);
console.log(res)
    if (res?.statusCode === 201) {
     
       setResponseTitle("Success");
       setResponseHeading("Review Submitted");
       setResponseMessage("Congratulations! Your review has been sent successfully.");
       setReviewForm({
        firstName: "", lastName: "", email: "", mobile: "", practionerName: "",
        rating: 5, review: "", note: "", isAnonymous: false
      });
      setShowSuccessModal(true)
      
    } else {
                setResponseTitle("Failed!");
                setResponseHeading("Oop's !!");
                setResponseMessage("Review Submission Failed !");
                setShowSuccessModal(true);
    }
  } catch (err) {
    console.error("Review submit error:", err);
  }
};

const handleRatingClick = (value) => {
  setReviewForm((prev) => ({ ...prev, rating: value }));
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

    const handleSubmitForm = async () => {
      
  try {
const files={}
    const res = await updateApiWithFile(config.UpdateReviewPageContent, id, formData ,files);
    console.log(res)
    if (res?.statusCode === 200) {
      setShowModal(false);
      fetchBannerImage(); // Refresh UI with updated data
    }
  } catch (err) {
    console.error("Error updating form data", err);
  }
};

    return (
        <>
            {/* <Header arrayheader={arrayheader} /> */}
            {!isOwner ?
      <Header arrayheader={arrayheader} />
      :<h3 className="mt-3 ml-3" style={{marginLeft:"15px"}}>Review Page</h3>
    }
     {/* {!isOwner && <SubHeader />} */}

            <>
            
  <div className="mainBanner reviewBanner">
    <div
  className="bannerImage"
  style={{ backgroundImage: `url('${imagePreview || "/images/landingpage/review-banner-img.jpg"}')` }}
>


      <div className="bannerTxt">
        <h1>{formData?.banner_title}</h1>
        <p className="fs-9 text-white">
         {formData?.banner_text}
        </p>
        <a href={formData?.button_route} className="btn btn-primary">
          {formData?.button_label}
        </a>
        {isOwner && 
        <button
        className="btn btn-primary"
  onClick={() => fileInputRef.current?.click()}
  style={{marginLeft:'5px'}}
>
  ✏️ Edit Banner Image
</button>
}
      </div>
      
<input
  type="file"
  accept="image/*"
  ref={fileInputRef}
  style={{ display: "none" }}
  onChange={handleImageUpload}
/>

    </div>
  </div>
  <div className="text-center mt-5">
    {isOwner && 
  <button className="btn  btn-primary" onClick={() => setShowModal(true)}>
    ✏️ Edit Details
  </button>
  }
</div>

  <div className="reviewsLeave">
    <div className="container">
      <div className="section-heading">
        <img
          src="/images/landingpage/watermark.png"
          width={50}
          className="d-block mx-auto"
        />
        <h2>{formData?.your_stories_heading}</h2>
        <p>
         {formData?.your_stories_text}
        </p>
        {/* <a href={formData?.your_stories_button_route} className="btn btn-primary mt-3">
          {formData?.your_stories_button_label}
        </a> */}
      </div>
    </div>
    <div
      className="reviewForm"
      style={{ backgroundImage: "url(/images/landingpage/circle-bg.svg)" }}
    >
      <div className="container">
        <div className="section-heading pb-3">
          <img
            src="/images/landingpage/watermark.png"
            width={50}
            className="d-block mx-auto"
          />
          <h2>Leave a Review</h2>
        </div>
        <div className="row justify-content-center">
          <div className="col-md-10 col-xl-8 mb-4 mb-md-0">
            <div className="contactForm">
              <div className="row">
                <div className="col-md-6">
                  <div className="form-group">
                    <label>First Name *</label>
                    {/* <input type="text" className="form-control" name="" id="" /> */}
                    <input name="firstName" className="form-control" value={reviewForm.firstName} onChange={handleReviewChange} required  />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <label>Last Name *</label>
                    <input name="lastName" className="form-control" value={reviewForm.lastName} onChange={handleReviewChange} required />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <label>Email Address *</label>
                    <input name="email" className="form-control" value={reviewForm.email} onChange={handleReviewChange}  required/>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <label>Phone No.</label>
                    <input name="mobile" className="form-control" value={reviewForm.mobile} onChange={handleReviewChange} required />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <label>Practitioner/Instructor Name *</label>
                    <input name="practionerName" className="form-control" value={reviewForm.practionerName} onChange={handleReviewChange} required />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
  <label>Rate Us *</label>
  <div>
        {Array.from({ length: 5 }, (_, index) => (
  <StarFill
    key={index}
    size={24}
    color={index < reviewForm.rating ? 'gold' : 'lightgray'}
    onClick={() => handleRatingClick(index + 1)}
    style={{ cursor: 'pointer', marginRight: '5px' }}
  />
))}

      </div>
</div>

                </div>
                <div className="col-md-12">
                  <div className="form-group">
                    <label>My Review *</label>
                   
                    <textarea name="review" className="form-control" value={reviewForm.review} onChange={handleReviewChange} required />
                  </div>
                </div>
                <div className="col-md-12">
                  <div className="col-md-12">
  <div className="form-group">
    <label>Note (will not be published):</label>

    <textarea
      name="note"
      className="form-control"
      value={reviewForm.note}
      onChange={handleReviewChange}
      rows={4}
    />

    {/* Helper Text */}
    <div className="mt-2 text-muted" style={{ fontSize: "13px" }}>
      <p className="mb-1">
        <strong>Example :</strong> Feel free to contact me for more details about my experience.
      </p>
      <p className="mb-0">
        <strong>Note :</strong> Your email will remain confidential and will not be shared publicly.
      </p>
    </div>
  </div>
</div>
                </div>
                <div className="col-md-12">
                  <div className="cstmCheckbox mb-3">
                   
                <input
  id="isAnonymous"
  name="isAnonymous"
  type="checkbox"
  checked={reviewForm.isAnonymous}
  onChange={handleReviewChange}
/>
<label htmlFor="isAnonymous" className="fw-normal fs-9">
  Make my review anonymous
</label>

                  </div>
                </div>
                {/* <div className="col-md-12">
                  <div className="cstmCheckbox">
                    <input type="checkbox" id="review2" />
                    <label htmlFor="review2" className="fw-normal fs-9">
                      I am happy to post this on Google{" "}
                      <a href="#" className="googlleReview">
                        Post Google Review
                      </a>
                    </label>
                  </div>
                </div> */}
                <div className="col-md-12 text-center">
                <button className="btn btn-primary mt-5" onClick={submitCustomerReview}>Submit Review</button>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</>

{showModal && (
  <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
    <div className="modal-dialog modal-lg">
      <div className="modal-content p-4" style={{minWidth:'600px'}}>
        <h5 className="modal-title mb-3">Edit Review Page Details</h5>
        <div className="row">
          {Object.entries(formData).map(([key, value]) => (
            <div className="col-md-6 mb-3" key={key}>
              <label className="form-label text-capitalize">{key.replace(/_/g, ' ')}</label>
              <input
                className="form-control"
                value={value}
                onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
              />
            </div>
          ))}
        </div>
        <div className="text-end mt-3">
          <button className="btn btn-secondary me-2" onClick={() => setShowModal(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmitForm}>Save Changes</button>
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

         {!isOwner &&    <FooterSection />}
        </>
    );
};

export default ReviewPage;
