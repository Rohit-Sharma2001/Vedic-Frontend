"use client";
import React, { useEffect, useState ,useRef} from "react";
import Header from "../Header/page";
import InnerBanner from "../AmitajainInnerBanner/page";
import AboutAmitaJain from "../AboutAmitaJain/page";
import BackgroundOfHer from "../BackgroundOfHer/page";
import SendANoteToAmita from "../SendANoteToAmita/page";
import BhagavadGitaQuote from "../BhagavadGitaQuote/page";
import FooterSection from "../Footer/page";
import '../../public/css/style.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { postApi ,updateApiWithFile} from "services/api";
import { config } from "services/config";
import dynamic from "next/dynamic";
import Loader from "services/Loader/page";
import Link from "node_modules/next/link";
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";
import { checkIsOwner } from "services/config";
import { usePathname } from 'next/navigation';
// import SubHeader from "../SubHeader/page";
const YourDoshas = () => {
  const [isOwner, setIsOwner] = useState(false);
const [loader,setLoader]=useState(false)
const pathname = usePathname();

useEffect(() => {
  const isIframe = typeof window !== "undefined" && window.self !== window.top;
  const isAdminPath = pathname?.includes('/admin');
  const isAdminUser = checkIsOwner();

  if (isAdminUser && (isIframe || isAdminPath)) {
    setIsOwner(true);
  }
}, [pathname]);
    const [formData, setFormData] = useState({});
const [bannerInput, setBannerInput] = useState("");
const [editingText, setEditingText] = useState(false);
const [imagePreview, setImagePreview] = useState(null);
const fileInputRef = useRef(null);
const [showCardModal, setShowCardModal] = useState(false);
const [selectedCardDosha, setSelectedCardDosha] = useState("vata");
const [showQuoteModal, setShowQuoteModal] = useState(false);
const [quoteImageFile, setQuoteImageFile] = useState(null);

// Prevent background scroll when any modal is open
useEffect(() => {
  const open = showCardModal || showQuoteModal;
  if (open) {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }
}, [showCardModal, showQuoteModal]);

// NEW: when Quote modal opens, scroll both iframe and parent to top
useEffect(() => {
  if (!showQuoteModal) return;
  // Scroll the iframe page itself
  window.scrollTo({ top: 0, behavior: 'smooth' });
  // Ask parent admin page to scroll
  try {
    if (window.parent && window.parent !== window) {
      // Replace '*' with your exact admin origin for stricter security, e.g. 'https://admin.example.com'
      window.parent.postMessage({ type: 'SCROLL_TO_TOP', from: 'YourDoshas' }, '*');
    }
  } catch (_) {}
}, [showQuoteModal]);
 useEffect(() => {
  window.scrollTo(0, 0);
  fetchBanner();
}, []);

const fetchBanner = async () => {
  try {
    setLoader(true)
    const res = await postApi(config.GetYourDoshas, { id: "68245e185bfa33304ec107c9" });
    setLoader(false)
    const data = res?.data;
    if (data) {
      setFormData(data); 
      setBannerInput(data?.banner_title || "The Three Ayurvedic Doshas");

      const imgUrl = data?.banner_image
        ? `${process.env.NEXT_PUBLIC_API_URL}/${data.banner_image}`.replace(/\\/g, "/")
        : "/images/landingpage/doshas-banner.jpg";
      setImagePreview(imgUrl);
    }
  } catch (err) {
    console.error("Error fetching banner", err);
  }
};


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
    setLoader(true)
    const res = await updateApiWithFile(config.UpdateYourDoshas, "68245e185bfa33304ec107c9", {}, files);
    setLoader(false)
    if (res?.statusCode === 200) {
      fetchBanner();
    }
  } catch (err) {
    console.error("Error updating banner image", err);
  }
};


const handleBannerTextUpdate = async () => {
  try {
    const payload = { banner_title: bannerInput };
    setLoader(true)
    const res = await updateApiWithFile(config.UpdateYourDoshas, "68245e185bfa33304ec107c9", payload, {});
    setLoader(false)
    if (res?.statusCode === 200) {
      setEditingText(false);
    }
  } catch (err) {
    console.error("Error updating banner text", err);
  }
};
const getCardField = (key) => {
  const prefix = `${selectedCardDosha}_card_`;
  return formData?.[prefix + key] || "";
};

const setCardField = (key, value) => {
  const prefix = `${selectedCardDosha}_card_`;
  setFormData((prev) => ({
    ...prev,
    [prefix + key]: value,
  }));
};
const getSectionField = (key) => {
  const prefix = `${selectedCardDosha}_section_`;
  return formData?.[prefix + key] || "";
};

const setSectionField = (key, value) => {
  const prefix = `${selectedCardDosha}_section_`;
  setFormData((prev) => ({
    ...prev,
    [prefix + key]: value,
  }));
};


const handleCardSubmit = async () => {
  try {
    setLoader(true)
    await updateApiWithFile(config.UpdateYourDoshas, "68245e185bfa33304ec107c9", formData, {});
    setLoader(false)
    setShowCardModal(false);
  } catch (err) {
    console.error("Error updating card data", err);
  }
};

const getQuoteField = (key) => formData?.[`bottom_quote_${key}`] || "";

const setQuoteField = (key, value) => {
  setFormData((prev) => ({
    ...prev,
    [`bottom_quote_${key}`]: value,
  }));
};
const handleQuoteImageUpload = (e) => {
  const file = e.target.files?.[0];
  if (file) {
    setQuoteImageFile(file);
    setQuoteField("image", file.name); // Just store filename
  }
};

const handleQuoteSubmit = async () => {
  try {
    const files = quoteImageFile ? { image: quoteImageFile } : {};
    setLoader(true)
    await updateApiWithFile(config.UpdateYourDoshas, "68245e185bfa33304ec107c9", formData, files);
    setLoader(false)
    setShowQuoteModal(false);
  } catch (err) {
    console.error("Error updating quote data", err);
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
        {loader&&<Loader/>}
            {/* <Header arrayheader={arrayheader} /> */}
             {!isOwner ?
      <Header arrayheader={arrayheader} />
      :<h3 className="mt-3 ml-3" style={{marginLeft:"15px"}}>Your Doshas Page</h3>
    }
     {/* {!isOwner && <SubHeader />} */}
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
        <h1>
  {bannerInput
    .split(' ')
    .reduce((acc, word, i) => {
      const chunkIndex = Math.floor(i / 4);
      if (!acc[chunkIndex]) acc[chunkIndex] = [];
      acc[chunkIndex].push(word);
      return acc;
    }, [])
    .map((chunk, idx) => (
      <span key={idx}>
        {chunk.join(' ')}<br />
      </span>
    ))}
</h1>


          {isOwner && 
          <button
          className="btn btn-primary"
            onClick={() => setEditingText(true)}
            style={{ marginTop: "10px", marginRight: "6px" }}
          >
            ✏️ Edit Banner Text
          </button>
          }
              {(showCardModal || showQuoteModal) && (
  <div className="modal-backdrop fade show" />
)}
        </>
        
      )}
  

      {isOwner && 
      <button
      className="btn btn-primary"
        onClick={() => fileInputRef.current?.click()}
        style={{ marginTop: "10px" }}
      >
        ✏️ Edit Banner Image
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

            <div className="threeDoshas">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-4 mb-3">
                            <div className="balanceBx h-100">
                                <img src="/images/landingpage/watermark.png" width={50} className="d-block" />
                                <h2>{formData?.vata_card_title}</h2>
                                <p className="fs-9 fw-medium">
                                    {formData?.vata_card_description}
                                </p>
                                <Link href={formData?.vata_card_button_route ? formData?.vata_card_button_route :'/'} className="btn-primary d-inline-block" style={{ textDecoration: "none" }}>
                                    {formData?.vata_card_button_label}
                                </Link>
                            </div>
                        </div>
                        <div className="col-md-4 mb-3">
                            <div className="balanceBx h-100">
                                <img src="/images/landingpage/watermark.png" width={50} className="d-block" />
                                <h2>{formData?.pitta_card_title}</h2>
                                <p className="fs-9 fw-medium">
                                   {formData?.pitta_card_description}
                                </p>
                                {/* <a
                                    href="#"
                                    className="btn-primary d-inline-block"
                                >
                                    How to Balance Pitta Dosha
                                </a> */}
                                <Link href={formData?.pitta_card_button_route ? formData?.pitta_card_button_route :'/'} className="btn-primary d-inline-block" style={{ textDecoration: "none" }}>
                                   {formData?.pitta_card_button_label}
                                </Link>
                            </div>
                        </div>
                        <div className="col-md-4 mb-3">
                            <div className="balanceBx h-100">
                                <img src="/images/landingpage/watermark.png" width={50} className="d-block" />
                                <h2>{formData?.kapha_card_title}</h2>
                                <p className="fs-9 fw-medium">
                                    {formData?.kapha_card_description}
                                </p>
                                {/* <a
                                    href="#"
                                    className="btn-primary d-inline-block"
                                >
                                    How to Balance Kapha Dosha
                                </a> */}
                                <Link href={formData?.kapha_card_button_route ? formData?.kapha_card_button_route :'/'} className="btn-primary d-inline-block" style={{ textDecoration: "none" }}>
                                    {formData?.kapha_card_button_label}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {isOwner &&
            <div className="d-flex justify-content-center"><button
  className="btn btn-primary mb-3"
  onClick={() => setShowCardModal(true)}
>
  ✏️ Edit Details
</button></div>
}

            <div
                className="productDetails"
                style={{ backgroundImage: "url(/images/landingpage/circle-bg.svg)" }}
            >
                <div className="container-fluid">
                    <div className="pdHeading">
                        <img src="/images/landingpage/watermark.png" width={40} className="d-block" />
                        <h2 className="text-black fs-6 d-flex align-items-center fw-semibold">
                          {formData?.vata_section_title}
                            <lottie-player
                                src="/images/landingpage/air.json"
                                loop=""
                                autoPlay=""
                                style={{ width: 30, height: 30, marginLeft: 20 }}
                            />
                        </h2>
                    </div>
                  
                     <p dangerouslySetInnerHTML={{ __html: formData?.vata_section_description }} />
                   
                   
                </div>
            </div>
            <div className="productDetails bg-white my-0 py-0">
                <div className="container-fluid">
                    <div className="pdHeading">
                        <img src="/images/landingpage/watermark.png" width={40} className="d-block" />
                        <h2 className="text-black fs-6 d-flex align-items-center fw-semibold">
                            {formData?.pitta_section_title}
                            <lottie-player
                                src="/images/landingpage/fire.json"
                                loop=""
                                autoPlay=""
                                style={{ width: 30, height: 30, marginLeft: 20 }}
                            />
                        </h2>
                    </div>
                   <p dangerouslySetInnerHTML={{ __html: formData?.pitta_section_description }} />
                </div>
            </div>
            <div
                className="productDetails"
                style={{ backgroundImage: "url(/images/landingpage/circle-bg.svg)" }}
            >
                <div className="container-fluid">
                    <div className="pdHeading">
                        <img src="/images/landingpage/watermark.png" width={40} className="d-block" />
                        <h2 className="text-black fs-6 d-flex align-items-center fw-semibold">
                        {formData?.kapha_section_title}
                            <lottie-player
                                src="/images/landingpage/earth.json"
                                loop=""
                                autoPlay=""
                                style={{ width: 30, height: 30, marginLeft: 20 }}
                            />
                        </h2>
                    </div>
                   <p dangerouslySetInnerHTML={{ __html: formData?.kapha_section_description }} />
                </div>
            </div>
{isOwner &&    <div className="d-flex justify-content-center">
            <button
  className="btn btn-primary mb-3"
  onClick={() => setShowQuoteModal(true)}
>
  ✏️ Edit Quote Details
</button></div>}

            <div>
             <div className="container-fluid">
  <div
    className="imbalanceBg"
    style={{
      backgroundImage: `url(${
        formData?.bottom_quote_image
          ? `${process.env.NEXT_PUBLIC_API_URL}/${formData.bottom_quote_image}`.replace(/\\/g, "/")
          : "/images/landingpage/imbalance-bannerbg.png"
      })`,
    }}
  >
   
    <div className="row align-items-center">
      <div className="col-md-9 col-lg-10">
        <h5 className="pb-2">{formData?.bottom_quote_title}</h5>
        <p className="m-0 fw-normal fs-9">
          {formData?.bottom_quote_description}
        </p>
      </div>
      <div className="col-md-3 col-lg-2 text-md-end">
        <Link href={formData?.bottom_quote_button_route ? formData?.bottom_quote_button_route :'/'} className="btn-primary px-4 mt-2">
          {formData?.bottom_quote_button_label}
        </Link>
      </div>
    </div>
  </div>
</div>

            </div>

{showCardModal && (
  <div className="modal show d-block" tabIndex="-1">
    <div className="modal-dialog modal-lg">
      <div className="modal-content" style={{minWidth:'600px'}}>
        <div className="modal-header">
          <h5 className="modal-title">Edit Dosha Card Details</h5>
          <button className="btn-close" onClick={() => setShowCardModal(false)}></button>
        </div>
      <div className="modal-body">
  <div className="mb-3">
    <label className="form-label">Select Dosha</label>
    <select
      className="form-select"
      value={selectedCardDosha}
      onChange={(e) => setSelectedCardDosha(e.target.value)}
    >
      <option value="vata">Vata</option>
      <option value="pitta">Pitta</option>
      <option value="kapha">Kapha</option>
    </select>
  </div>

  <h6 className="fw-semibold mt-4 mb-2">Card Fields</h6>
  <div className="mb-3">
    <label className="form-label">Card Title</label>
    <input
      className="form-control"
      value={getCardField("title")}
      onChange={(e) => setCardField("title", e.target.value)}
    />
  </div>

  <div className="mb-3">
    <label className="form-label">Card Description</label>
    <textarea
      className="form-control"
      value={getCardField("description")}
      onChange={(e) => setCardField("description", e.target.value)}
    />
  </div>

  <div className="mb-3">
    <label className="form-label">Button Label</label>
    <input
      className="form-control"
      value={getCardField("button_label")}
      onChange={(e) => setCardField("button_label", e.target.value)}
    />
  </div>

  <div className="mb-3">
    <label className="form-label">Button Route</label>
    <input
      className="form-control"
      value={getCardField("button_route")}
      onChange={(e) => setCardField("button_route", e.target.value)}
    />
  </div>

  <h6 className="fw-semibold mt-4 mb-2">Section Fields</h6>
  <div className="mb-3">
    <label className="form-label">Section Title</label>
    <input
      className="form-control"
      value={getSectionField("title")}
      onChange={(e) => setSectionField("title", e.target.value)}
    />
  </div>

  <div className="mb-3">
    <label className="form-label">Section Description</label>
    <ReactQuill
      theme="snow"
      value={getSectionField("description")}
      onChange={(val) => setSectionField("description", val)}
    />
  </div>
</div>


        <div className="modal-footer">
          <button className="btn btn-primary" onClick={handleCardSubmit}>
            Save
          </button>
          <button className="btn btn-secondary" onClick={() => setShowCardModal(false)}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
)}

{showQuoteModal && (
  <div className="modal show d-block" tabIndex="-1">
    <div className="modal-dialog modal-lg">
      <div className="modal-content" style={{minWidth:'600px'}}>
        <div className="modal-header">
          <h5 className="modal-title">Edit Quote Section</h5>
          <button className="btn-close" onClick={() => setShowQuoteModal(false)}></button>
        </div>
        <div className="modal-body">
          <div className="mb-3">
            <label className="form-label">Quote Title</label>
            <input
              className="form-control"
              value={getQuoteField("title")}
              onChange={(e) => setQuoteField("title", e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Quote Description</label>
            <input
              className="form-control"
              value={getQuoteField("description")}
              onChange={(e) => setQuoteField("description", e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Quote Button Label</label>
            <input
              className="form-control"
              value={getQuoteField("button_label")}
              onChange={(e) => setQuoteField("button_label", e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Quote Button Route</label>
            <input
              className="form-control"
              value={getQuoteField("button_route")}
              onChange={(e) => setQuoteField("button_route", e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Quote Image</label>
            <input className="form-control" type="file" onChange={handleQuoteImageUpload} />
            <small className="text-muted mt-1 d-block">{getQuoteField("image")}</small>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-primary" onClick={handleQuoteSubmit}>Save</button>
          <button className="btn btn-secondary" onClick={() => setShowQuoteModal(false)}>Cancel</button>
        </div>
      </div>
    </div>
  </div>
)}


       {!isOwner &&    <FooterSection />}
        </>
    );
};

export default YourDoshas;
