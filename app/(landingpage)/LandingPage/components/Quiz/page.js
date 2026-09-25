"use client";
import React, { useEffect, useState } from "react";
import Header from "../Header/page";
import InnerBanner from "../AmitajainInnerBanner/page";
import AboutAmitaJain from "../AboutAmitaJain/page";
import BackgroundOfHer from "../BackgroundOfHer/page";
import SendANoteToAmita from "../SendANoteToAmita/page";
import BhagavadGitaQuote from "../BhagavadGitaQuote/page";
import FooterSection from "../Footer/page";
import Link from "node_modules/next/link";
import { postApi ,updateApiWithFile } from "services/api";
import { config } from "services/config";
import '../../public/css/style.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { checkIsOwner } from "services/config";
import { usePathname } from 'next/navigation';
// import SubHeader from "../SubHeader/page";
const Quiz = () => {
const [quizData, setQuizData] = useState({});
const [showModal, setShowModal] = useState(false);
const [imagePreview, setImagePreview] = useState(null);
const [file, setFile] = useState(null);
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
 
 
  useEffect(() => {
  window.scrollTo(0, 0);
  fetchQuizData();
}, []);

const fetchQuizData = async () => {
  try {
    const res = await postApi(config.GetQuizPageContent, { id: "682ad0f71a18d5935fafa434" });
    const data = res?.data;
  
    if (data) {
      setQuizData(data);
      setImagePreview(`${process.env.NEXT_PUBLIC_API_URL}/${data?.file}`.replace(/\\/g, "/"));
    }
  } catch (err) {
    console.error("Error loading quiz data", err);
  }
};


const handleSaveQuiz = async () => {
  try {
    const res = await updateApiWithFile(
      config.UpdateQuizPageContent,
      "682ad0f71a18d5935fafa434",
      quizData,
      file ? { file } : {}
    );
    
    if (res?.statusCode === 200) {
      setShowModal(false);
      fetchQuizData(); // Refresh
    }
  } catch (err) {
    console.error("Failed to update quiz", err);
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
            {!isOwner ?
      <Header arrayheader={arrayheader} />
      : <h3 className="mt-3 ml-3" style={{marginLeft:"15px"}}>Quiz Page</h3>
    } 
     {/* {!isOwner && <SubHeader />} */}
         <div
  className="innerBanner bannerQuiz mb-5"
  style={{ backgroundImage: `url('${imagePreview || "/images/landingpage/quiz-banner.jpg"}')` }}
>
  <div className="container">
    <div className="bannerTxt">
      <h1>{quizData?.heading || "Dosha Quiz"}</h1>
      <span style={{fontWeight:'600',marginBottom:'0.5rem',display: 'inline-block'}}>{quizData?.subheading || "DETERMINE YOUR UNIQUE CONSTITUTION"}</span>
      <p>{quizData?.description}</p>
      <a href={quizData?.button_route || "#"} target="blank" className="btn btn-primary mr-5" >
        {quizData?.button_label || "Take the Quiz"}
      </a>
      {isOwner && 
      <button className="btn btn-primary" style={{marginLeft:'5px'}} onClick={() => setShowModal(true)}>
        ✏️ Edit Quiz Banner
      </button>
      }
    </div>
  </div>
</div>


{showModal && (
  <div className="modal show d-block" tabIndex="-1">
    <div className="modal-dialog modal-lg">
      <div className="modal-content" style={{minWidth:'600px'}}>
        <div className="modal-header">
          <h5 className="modal-title">Edit Quiz Banner</h5>
          <button className="btn-close" onClick={() => setShowModal(false)}></button>
        </div>
        <div className="modal-body">
          <div className="mb-3">
            <label>Title</label>
            <input className="form-control" value={quizData.heading || ""} onChange={(e) => setQuizData({ ...quizData, heading: e.target.value })} />
          </div> 

          <div className="mb-3">
            <label>Subtitle</label>
            <input className="form-control" value={quizData.subheading || ""} onChange={(e) => setQuizData({ ...quizData, subheading: e.target.value })} />
          </div>

          <div className="mb-3">
            <label>Description</label>
            <textarea className="form-control" value={quizData.description || ""} onChange={(e) => setQuizData({ ...quizData, description: e.target.value })}></textarea>
          </div>

          <div className="mb-3">
            <label>Button Label</label>
            <input className="form-control" value={quizData.button_label || ""} onChange={(e) => setQuizData({ ...quizData, button_label: e.target.value })} />
          </div>

            <div className="mb-3">
            <label>Button Route</label>
            <input className="form-control" value={quizData.button_route || ""} onChange={(e) => setQuizData({ ...quizData, button_route: e.target.value })} />
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
          <button className="btn btn-primary" onClick={handleSaveQuiz}>Save</button>
          <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
        </div>
      </div>
    </div>
  </div>
)}

          {!isOwner &&   <FooterSection />}
        </>
    );
};

export default Quiz;
