"use client";
import React, { useEffect, useState ,useRef ,useMemo,useCallback} from "react";
import Header from "../Header/page";
import InnerBanner from "../AmitajainInnerBanner/page";
import AboutAmitaJain from "../AboutAmitaJain/page";
import BackgroundOfHer from "../BackgroundOfHer/page";
// import SubHeader from "../SubHeader/page";
import SendANoteToAmita from "../SendANoteToAmita/page";
import BhagavadGitaQuote from "../BhagavadGitaQuote/page";
import FooterSection from "../Footer/page";
import { postApi, updateApiWithFile } from "services/api";
import {  config } from "services/config";
import '../../public/css/style.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Link from "next/link";
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css'; // Import styles
import { checkIsOwner } from "services/config";
import { usePathname } from 'next/navigation';

function AyurvedaHealing() {
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
    const ReactQuill = useMemo(
  () => dynamic(() => import("react-quill"), { ssr: false }),
  []
);

 const id = "68242d87e0b3b9f3b7a85286"; // actual ObjectId
  const [formData, setFormData] = useState({ bannerImage: null, bannerText: "" });
  const [imagePreview, setImagePreview] = useState(null);
  const [editingText, setEditingText] = useState(false);
  const [bannerInput, setBannerInput] = useState("");
  const fileInputRef = useRef(null);
  const [diseaseCards, setDiseaseCards] = useState([]);

const [newDiseases, setNewDiseases] = useState([]);
const [showContentModal, setShowContentModal] = useState(false);
const [pageContent, setPageContent] = useState("");


const handleSavePageContent = async () => {
  const payload = {
    pagecontent: pageContent,
  };

  try {
    const response = await updateApiWithFile(
      config.UpdateAyurvedicHealing,
      id,
      payload,
      {}
    );

    if (response?.statusCode === 200) {
      console.log("Page content updated.");
      setShowContentModal(false);
      fetchInitialData();
    }
  } catch (err) {
    console.error("Error saving page content", err);
  }
};

useEffect(() => {
  if (showContentModal) {
    document.body.style.overflow = "hidden";   // disable background scroll
  } else {
    document.body.style.overflow = "auto";     // restore scroll
  }

  return () => {
    document.body.style.overflow = "auto";     // cleanup
  };
}, [showContentModal]);


const handleAddDiseaseToCard = (cardIndex) => {
  const inputValue = newDiseases[cardIndex]?.trim();
  if (!inputValue) return;

  const updatedCards = [...diseaseCards];
  const totalDiseases = updatedCards.reduce((sum, card) => sum + card.length, 0);
  if (totalDiseases >= 45) return alert("You can only add up to 45 diseases.");

  const updatedNewDiseases = [...newDiseases];
  updatedNewDiseases[cardIndex] = "";

  if (updatedCards[cardIndex].length >= 9) {
    if (updatedCards.length >= 4) return alert("You can only have up to 4 cards.");
    updatedCards.push([inputValue]);
    updatedNewDiseases.push("");
  } else {
    updatedCards[cardIndex].push(inputValue);
  }

  setDiseaseCards(updatedCards);
  setNewDiseases(updatedNewDiseases);
};



const handleRemoveDiseaseFromCard = (cardIndex, diseaseIndex) => {
  const updatedCards = [...diseaseCards];
  updatedCards[cardIndex].splice(diseaseIndex, 1);
  setDiseaseCards(updatedCards);
};


  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const encoded = { id: id };
      const res = await postApi(config.GetAyurvedicHealing, encoded);
      if (res?.statusCode === 200) {
        let imageUrl = res.data.file
          ? `${process.env.NEXT_PUBLIC_API_URL}/${res.data.file}`
          : null;

        if (imageUrl) imageUrl = imageUrl.replace(/\\/g, "/");

        setFormData({
          bannerImage: null,
          bannerText: res.data.banner_title || "Ayurveda\nNatural Healing",
        });
        setPageContent(res.data.pagecontent)
        setBannerInput(res.data.banner_title || "");
        setImagePreview(imageUrl);
         if (Array.isArray(res.data.diseases)) {
       const chunked = [];
for (let i = 0; i < res.data.diseases.length; i += 9) {
  chunked.push(res.data.diseases.slice(i, i + 9));
}
setDiseaseCards(chunked);
setNewDiseases(Array(chunked.length).fill(""));

      }
    }
    } catch (err) {
      console.error("Error fetching data", err);
    }
  };


// ✅ Replace your existing `handleSubmitDiseases` with this:

const handleSubmitDiseases = async () => {
  const diseasesArray = diseaseCards.flat();

  const payload = {
    diseases: diseasesArray
  };

  try {
    const response = await updateApiWithFile(
      config.UpdateAyurvedicHealing,
      id,
      payload,
      {} // No files being uploaded here
    );

    if (response?.statusCode === 200) {
      console.log("Diseases updated successfully.");
      fetchInitialData();
    } else {
      console.error("Failed to update diseases", response);
    }
  } catch (err) {
    console.error("Error submitting diseases", err);
  }
};

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, bannerImage: file }));
      setImagePreview(URL.createObjectURL(file));
      updateBannerImage(file);
    }
  };

  const updateBannerImage = async (file) => {
    try {
      const files = { file };
      const payload = {};
      const response = await updateApiWithFile(
        config.UpdateAyurvedicHealing,
        id,
        payload,
        files
      );
      if (response?.statusCode === 200) {
        const updatedUrl = `${process.env.NEXT_PUBLIC_API_URL}/${response.data.file}`;
        setImagePreview(updatedUrl);
        fetchInitialData();
      }
    } catch (error) {
      console.error("Update failed", error);
    }
  };

  const handleBannerTextUpdate = async () => {
    try {
      const data = { banner_title: bannerInput };
      const payload = data
      const response = await updateApiWithFile(
        config.UpdateAyurvedicHealing,
        id,
        payload ,
        {}
      );
      if (response?.statusCode === 200) {
        setFormData((prev) => ({ ...prev, bannerText: bannerInput }));
        setEditingText(false);
      }
    } catch (err) {
      console.error("Error updating text", err);
    }
  };
  const handleContentChange = useCallback((val) => {
  setPageContent(val);
}, []);

  const handleEditClick = () => fileInputRef.current?.click();

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
      :<h3 className="mt-3 ml-3" style={{marginLeft:"15px"}}>Ayurvedic Healing Page</h3>
    }
      {/* {!isOwner && <SubHeader />} */}
            <div>
      <div
        className="innerBanner"
        style={{ backgroundImage: `url('${imagePreview}')` }}
      >
        <div className="container-fluid">
          <div className="innerBannertxt">
            {editingText ? (
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <input
                  type="text"
                  value={bannerInput}
                  onChange={(e) => setBannerInput(e.target.value)}
                  style={{ padding: "6px", width: "300px" }}
                />
                <button onClick={handleBannerTextUpdate}>Save</button>
                <button onClick={() => setEditingText(false)}>Cancel</button>
              </div>
            ) : (
              <>
                <h1>{formData.bannerText}</h1>
                {isOwner && 
                <button
                  onClick={() => setEditingText(true)}
                  className="btn btn-primary"
                >
                  ✏️ Edit Banner Text
                </button>
                }
              </>
            )}
            {isOwner && 
            <button
              onClick={handleEditClick}
             className="btn btn-primary "
             style={{marginLeft:'5px'}}
            >
              ✏️ Edit Banner
            </button>
            }
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleImageUpload}
            />
          </div>
        </div>
      </div>
    </div>


            <>
                <div className="dietPlan">
                    <div className="container-fluid">
                      <div className="listBox">
  <div className="row">
  {diseaseCards.map((card, cardIndex) => (
  <div key={cardIndex} className="col-md-6 col-lg-4 col-xl-3 mb-3 px-md-2">
    <ul className="listUl">
      {card.map((disease, diseaseIndex) => (
        <li key={diseaseIndex}>
          {disease}
          {isOwner && 
          <button
            onClick={() => handleRemoveDiseaseFromCard(cardIndex, diseaseIndex)}
            style={{ marginLeft: "10px", color: "red" }}
          >
             <b>✕</b>
          </button>
          }
        </li>
      ))}
    </ul>
    {isOwner && 
    <div>
      <input
        type="text"
        value={newDiseases[cardIndex] || ""}
        onChange={(e) => {
          const updated = [...newDiseases];
          updated[cardIndex] = e.target.value;
          setNewDiseases(updated);
        }}
        placeholder="Add disease"
        style={{ marginRight: "10px", width: "70%" }}
      />
      <button onClick={() => handleAddDiseaseToCard(cardIndex)}>Add</button>
    </div>
    }
  </div>
))}
  </div>
</div>
{isOwner && <>
<div className="d-flex gap-3">
<button className="btn btn-primary" onClick={handleSubmitDiseases}>Submit Card Details </button>

<button className="btn btn-primary" onClick={() => setShowContentModal(true)}><b>+</b> Add Page Content</button>
</div></>}

{showContentModal && (
  <div className="customModalOverlay">
    <div className="customModal">
      <h3 className="modalTitle">Add Page Content</h3>

      <div className="modalBody">
        <ReactQuill value={pageContent} onChange={handleContentChange} />
      </div>

      <div className="modalActions">
        <button className="btnCancel" onClick={() => setShowContentModal(false)}>
          Cancel
        </button>
        <button className="btnSave" onClick={handleSavePageContent}>
          Save
        </button>
      </div>
    </div>

    <style jsx>{`
      .customModalOverlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.55);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
  }

  .customModal {
    background: #fff;
    width: 90%;
    max-width: 700px;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    max-height: 80vh;      /* important */
    overflow: hidden;      /* mandatory */
  }

  .modalBody {
    max-height: 60vh;      /* modal content scroll area */
    overflow-y: auto;
    padding-bottom: 15px;
  }

      .modalTitle {
        margin: 0 0 15px;
        font-size: 20px;
        font-weight: 600;
      }

      

      .modalActions {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        margin-top: 15px;
      }

      .btnCancel {
        background: #ccc;
        border: none;
        padding: 8px 16px;
        border-radius: 6px;
        cursor: pointer;
      }

      .btnSave {
        background: #007bff;
        color: #fff;
        border: none;
        padding: 8px 16px;
        border-radius: 6px;
        cursor: pointer;
      }

      .btnCancel:hover,
      .btnSave:hover {
        opacity: 0.9;
      }

      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      @keyframes slideDown {
        from { transform: translateY(-15px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
    `}</style>
  </div>
)}

  <div className="section-heading text-start w-100 p-0">
    <img src="/images/landingpage/watermark.png" width={50} />
    <div className="blogContent mt-3" dangerouslySetInnerHTML={{ __html: pageContent }} />
  </div>
                   
                    </div>
                </div>
                
            </>


          {!isOwner &&   <FooterSection />}


        </>
    )
}

export default AyurvedaHealing;
