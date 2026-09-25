"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "../Header/page";
// import SubHeader from "../SubHeader/page";
import FooterSection from "../Footer/page";
import Pagination from "services/pagination";
import "../../public/css/style.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { checkIsOwner, config } from "services/config";
import { postApi, postApiWithFile, updateApiWithFile } from "services/api";
import dynamic from "next/dynamic";
import Loader from "services/Loader/page";
import { usePathname } from 'next/navigation';

const Allhealingbelieving = () => {
const [showModal, setShowModal] = useState(false);
const [totalCount, setTotalCount] = useState(0);

const [formData, setFormData] = useState({
  title: "",
  text: "",
  image: null,
  button_label: "",
  button_route: ""
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
const [imagePreview, setImagePreview] = useState("");

  const [dataItems, setDataItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

const fetchData = async (page) => {
  try {
    const endpoint = config.GetLandingPageCaraousalData;
    const body = { page, pageSize, type: "healing_is_believing" };
    const response = await postApi(endpoint, body);

    setDataItems(response.resultWithUrls || []);
    setTotalPages(response.totalPages || 1);

    const count =
      response.total ||
      response.totalCount ||
      response.count ||
      ((response.totalPages || 1) * pageSize);

    setTotalCount(count);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

useEffect(() => {
  fetchData(currentPage);
}, [currentPage]);

useEffect(() => {
  fetchYogaSection();
  // fetchData(currentPage)
}, []);

const fetchYogaSection = async () => {
  try {
    const res = await postApi(config.GetYogaClassesPageContent, { id: "682c10f3c9058eff3c2d4b5a" });
    const data = res?.result;
    console.log(res)
    if (data) {
      setFormData({
        title: data.title || "",
        text: data.text || "",
        image: null,
        button_label: data.button_label || "",
        button_route: data.button_route || ""
      });
      setImagePreview(`${process.env.NEXT_PUBLIC_API_URL}/${data.image}`.replace(/\\/g, "/"));
    }
  } catch (err) {
    console.error("Failed to fetch yoga class content", err);
  }
};


const handleChange = (key, value) => {
  setFormData(prev => ({ ...prev, [key]: value }));
};

const handleImageUpload = (e) => {
  const file = e.target.files?.[0];
  if (file) {
    setFormData(prev => ({ ...prev, image: file }));
    setImagePreview(URL.createObjectURL(file));
  }
};

const handleSubmit = async () => {
  try {
    const files = formData.image ? { image: formData.image } : {};
    const payload = { ...formData, image: undefined };
    await updateApiWithFile(config.UpdateYogaClassesPageContent, "682c10f3c9058eff3c2d4b5a", payload, files);
    setShowModal(false);
    fetchYogaSection();
  } catch (err) {
    console.error("Update failed", err);
  }
};



    const arrayheader = [
  { name: "Ayurveda", route: "/LandingPage/components/AyurvedaHealing" },
  { name: "Yoga ", route: "/YogaClasses/components/JoinYogaClasses" },

  {
    name: "Programs",
    route:"/Events",
    children: [
      { name: "Events", route: "/Events" },
      { name: "Courses", route: "/YogaClasses/Yoga-Courses" },

    ]
  },
   { name: "Shop", route: "/Shop" },
  {
    name: "Education",
    route:"/LandingPage/components/Blogs",
    children: [
      { name: "Blogs", route: "/LandingPage/components/Blogs" },

    ]
  },
  { name: "Amita Jain", route: "/LandingPage/components/AmitaHome" },
  
];

  return (
    <>
      {/* <Header arrayheader={arrayheader} /> */}
       {!isOwner ?
      <Header arrayheader={arrayheader} />
      :<h3 className="mt-3 ml-3" style={{marginLeft:"15px"}}>Testimonials Page</h3>
    }
    



    <section className="yogaclassSection" style={{paddingTop:'60px'}}>
        <div className="container">
           {isOwner && <div className="d-flex gap-3">
                 <Link href={'/admin/cms-landingpage/healing-believing'} target="_parent" className="btn btn-primary"><b>+</b> Manage Data </Link>
                 </div>}
            <div className="section-heading text-start mw-100 mx-0 pb-2 pb-md-4">
                <img src="/images/landingpage/watermark.png" width="50"/>
               
                <h2>Healing is Believing</h2>
                <p className="text-orange">Our inspiring Rogis share their stories.</p>
            </div>
           <div className="row">
  {dataItems?.map((data, index) => (
    <div className="col-md-4 mb-4" key={index}>
      <div className="instituteTxt">
        <figure className="position-relative">
          {data.file?.endsWith(".mp4") ? (
            <>
              <video
                src={`${process.env.NEXT_PUBLIC_API_URL}/${data.file}`}
                muted
                loop
                playsInline
                style={{ width: "100%", height: "200px", objectFit: "cover", pointerEvents: "none" }}
              />
              <button
                className="video-play-btn"
                onClick={() => {
                  const url = `${process.env.NEXT_PUBLIC_API_URL}/${data.file}`;
                  window.open(url, "_blank");
                }}
              >
                <img src="/images/landingpage/video-icon.svg" alt="Play Video" />
              </button>
            </>
          ) : (
            <Link href={`${process.env.NEXT_PUBLIC_API_URL}/${data.file}`} target="blank" style={{ cursor: "pointer" }}>
              <img
                src={`${process.env.NEXT_PUBLIC_API_URL}/${data.file}`}
                alt={data.title}
                style={{ width: "100%", height: "200px", objectFit: "cover" }}
              />
            </Link>
          )}
        </figure>
        <h3>{data?.title}</h3>
        <p>{data?.descriptions}</p>
      </div>
    </div>
  ))}
</div>
{dataItems?.length > 0 && (
  <div style={{ display: "flex", justifyContent: "center" }}>
    <Pagination
      totalProducts={totalCount}
      currentPage={currentPage}
      pageSize={pageSize}
      onPageChange={(page) => setCurrentPage(page)}
    />
  </div>
)}


        </div>
    </section>
    {showModal && (
  <div className="modal show d-block" tabIndex="-1">
    <div className="modal-dialog modal-lg">
      <div className="modal-content" style={{minWidth:'600px'}}>
        <div className="modal-header">
          <h5 className="modal-title">Edit Banner</h5>
          <button className="btn-close" onClick={() => setShowModal(false)}></button>
        </div>
        <div className="modal-body">
          <div className="row">
            {["title", "text", ].map((field) => (
              <div className="col-md-6 mb-3" key={field}>
                <label className="form-label text-capitalize">{field.replace(/_/g, " ")}</label>
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
            <input type="file" className="form-control" onChange={handleImageUpload} />
            {imagePreview && <img src={imagePreview} className="mt-2" width="100" />}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-primary" onClick={handleSubmit}>Save</button>
          <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
        </div>
      </div>
    </div>
  </div>
)}


{!isOwner && <FooterSection/>}

  <style jsx>{`
                .custom-nav-buttons {
                    position: absolute;
                    top: 20%; /* Position buttons vertically aligned with heading and subheading */
                    right: 20px; /* Keep the buttons on the right side of the screen */
                    display: flex;
                    flex-direction: row;
                    gap: 10px; /* Add space between the buttons */
                }

                .prev-button,
                .next-button {
                    background-color: transparent; /* No background for custom image buttons */
                    border: none;
                    cursor: pointer;
                    padding: 0;
                    width: 40px; /* Ensure buttons match image size */
                    height: 40px; /* Ensure buttons match image size */
                }

                .prev-button img,
                .next-button img {
                    width: 89%; /* Ensure the image fits inside the button */
                    height: 89%;
                }

                .prev-button img:hover,
                .next-button img:hover {
                    opacity: 0.8; /* Slight hover effect */
                }

                .section-heading {
                    position: relative;
                }
               
  .video-play-btn {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: transparent;
    border: none;
    cursor: pointer;
    z-index: 2; 
  }
   figure video {
   display: block;
   width: 100%;
   height: 200px;
   object-fit: cover;
   pointer-events: none; /* ✅ allow clicks to pass through to button */
 }
  .video-modal {
    position: fixed;
    top: 0; left: 0;
    width: 100%; height: 100%;
    background: rgba(0,0,0,0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
  }
  .video-container {
    position: relative;
    width: 80%;
    max-width: 800px;
  }



                /* Media query to hide buttons on smaller screens */
                @media (max-width: 767px) {
                    .custom-nav-buttons {
                        display: none; /* Hide navigation buttons on mobile screens */
                    }
                }
            `}</style>
    </>
    
  );
};
export default Allhealingbelieving;
