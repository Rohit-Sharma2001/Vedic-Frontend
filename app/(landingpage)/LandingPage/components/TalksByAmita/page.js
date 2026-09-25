"use client";
import { useState, useEffect, useRef ,useMemo  } from "react";
import Image from "next/image";
import Link from "next/link";
// import SubHeader from "../SubHeader/page";
import Header from "../Header/page";
import FooterSection from "../Footer/page";
import "../../public/css/style.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { config } from "services/config";
import { postApi, postApiWithFile, updateApiWithFile } from "services/api";
import dynamic from "next/dynamic";
import { Modal, Button, Form } from 'react-bootstrap';
import {Trash,} from "react-bootstrap-icons";
import { checkIsOwner } from "services/config";
import { usePathname } from 'next/navigation';
const TalksByAmita = () => {
const [showModal, setShowModal] = useState(false);
const [dataItems, setDataItems] = useState([]);
const [formData, setFormData] = useState({
  lecture: '',
  title: '',
  video_link: '',
  video_file: null,
  image: null,
  description: ''
});
const [imagePreview, setImagePreview] = useState(null);
 const [isOwner, setIsOwner] = useState(false);

const pathname = usePathname();

// --- inside component ---
const toEpoch = (d) => {
  // WHY: guard against bad/missing date; pushes invalid dates to the end
  const t = d ? Date.parse(d) : NaN;
  return Number.isNaN(t) ? -Infinity : t;
};

const sortedByNewest = useMemo(() => {
  // WHY: stable, memoized sort by most recent (desc)
  return [...dataItems].sort((a, b) => toEpoch(b?.date) - toEpoch(a?.date));
}, [dataItems]);
useEffect(() => {
  const isIframe = typeof window !== "undefined" && window.self !== window.top;
  const isAdminPath = pathname?.includes('/admin');
  const isAdminUser = checkIsOwner();

  if (isAdminUser && (isIframe || isAdminPath)) {
    setIsOwner(true);
  }
}, [pathname]);

const [videoPreview, setVideoPreview] = useState(null);

const handleImageUpload = (e) => {
  const file = e.target.files[0];
  if (file) {
    setFormData((prev) => ({ ...prev, image: file }));
    setImagePreview(URL.createObjectURL(file));
  }
};

const handleInputChange = (e) => {
  const { name, value } = e.target;
  setFormData((prev) => ({ ...prev, [name]: value }));
};

const handleVideoUpload = (e) => {
  const file = e.target.files[0];
  if (file) {
    setFormData((prev) => ({ ...prev, video_file: file }));
    setVideoPreview(URL.createObjectURL(file));
  }
};

const handleSubmit = async () => {
  const data = {
    lecture: formData.lecture,
    title: formData.title,
    video_link: formData.video_link,
    description: formData.description
  };

  const files = {
  video_file: formData.video_file,
  image: formData.image 
   };

  try {
    await postApiWithFile(config.AddTalks, data, files);
    setShowModal(false);
    fetchData()
    // Refresh data call if needed
  } catch (error) {
    console.error('Failed to submit talk:', error);
  }
};

  const fetchData = async () => {
    try {
      const endpoint = config.GetTalks;
      const data = { };
      const response = await postApi(endpoint, data);
      console.log("Talks ",response);
      setDataItems(response.resultWithUrls || []);
    //   setTotalPages(response.totalPages || 1);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

useEffect(() => {
 
  fetchData()

}, []);

  const deleteArticle = async (id) => {
    try {
      const endpoint = config.DeleteTalks;
      const data = { id };
      await postApi(endpoint, data);
      fetchArticles(currentPage);
    } catch (error) {
      console.error("Error deleting article:", error);
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
   
  return (
    <>
      {/* <Header arrayheader={arrayheader} /> */}
       {!isOwner ?
      <Header arrayheader={arrayheader} />
      :<h3 className="mt-3 ml-3" style={{marginLeft:"15px"}}>Talks By Amita Page</h3>
    }
      {/* {!isOwner && <SubHeader />} */}
    <section className="lecturesMain">
        <div className="container-fluid">
            <div className="d-md-flex justify-content-between align-items-center">
                <div className="section-heading text-start ms-0 mw-100 pb-4">
                    <img src="/images/landingpage/watermark.png" width="50"/>
                    <h2>Lectures and Seminars by Amita Jain</h2>
                    <p>Lorem Ipsum Simply Dummy Text for typesetting industry</p>
                </div>
                {isOwner && 
                // <Button className="btn btn-primary mb-4" onClick={() => setShowModal(true)}><b>+</b> Add New Talk</Button>
                 <Link href={'/admin/Talks'} target="_parent"   className="btn btn-primary">Manage Talks </Link>
                }
            </div>

          <span className="d-block text-brown fw-semibold mb-3">Recently Added</span>
       
<div className="row">
  {sortedByNewest.slice(0, 3).map((item, index) => {  // CHANGED: use sortedByNewest
    const colClass =
      index === 0
        ? "col-lg-6 col-md-6 mb-3 px-2"
        : "col-lg-3 col-md-6 mb-3 px-2";

    return (
      <div className={colClass} key={item._id || index}>
        <div className="addedBx">
          <figure className="position-relative m-0">
            <img
              src={`${process.env.NEXT_PUBLIC_API_URL}/${item.image}`.replace(/\\/g, "/")}
              alt={item.title}
            />
            <div className="imgInnercont">
              <h3>Posted on: {item?.date ? item.date.split("T")[0] : "N/A"}</h3>
              <span className="d-flex align-items-center justify-content-between">
                <b>{item.title}</b>
                <a href={item.video_link || "#"} target="_blank" rel="noopener noreferrer">
                  <img src="/images/landingpage/youtube-icon.svg" alt="YouTube" width="40" />
                </a>
              </span>
            </div>
          </figure>
        </div>
      </div>
    );
  })}
</div>

            <span className="d-block text-brown fw-semibold my-3 mb-4">All Lectures and seminars</span>
           <div className="row">
  {dataItems.map((item, index) => (
    <div className={`col-md-4 mb-3 ${index % 3 === 0 ? "pe-2" : index % 3 === 1 ? "px-2" : "ps-2"}`} key={index}>
      <div className="addedBx">
        <figure className="position-relative m-0">
          <img
            src={`${process.env.NEXT_PUBLIC_API_URL}/${item.image}`.replace(/\\/g, "/")}
            alt={item.title}
          />
          <div className="imgInnercont">
            <div className="d-flex align-items-center justify-content-between">
              <h3 className="m-0">{item.title}</h3> 
              <a href={item.video_link || "#"} target="_blank" rel="noopener noreferrer">
                <img src="/images/landingpage/youtube-icon.svg" alt="YouTube" width="40" />
                
              </a>
             
            </div>
          </div>
        </figure>
        {/* <h4>{item.description}</h4> */}
         <h4
                                        dangerouslySetInnerHTML={{ __html: item.description }}
                                    />
        <p>Posted on: {item.date?.split("T")[0] || "N/A"}</p>
      </div>
    </div>
  ))}
</div>

        </div>
        
    </section>

     <Modal show={showModal} onHide={() => setShowModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Add Lecture</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* <Form.Group className="mb-3">
          <Form.Label>Lecture Name</Form.Label>
          <Form.Control name="lecture" type="text" value={formData.lecture} onChange={handleInputChange} />
        </Form.Group> */}
        <Form.Group className="mb-3">
          <Form.Label>Title</Form.Label>
          <Form.Control name="title" type="text" value={formData.title} onChange={handleInputChange} />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Video Link</Form.Label>
          <Form.Control name="video_link" type="text" value={formData.video_link} onChange={handleInputChange} />
        </Form.Group>
        <Form.Group className="mb-3">
  <Form.Label>Image</Form.Label>
  <Form.Control name="image" type="file" accept="image/*" onChange={handleImageUpload} />
  {imagePreview && <img src={imagePreview} alt="Preview" className="mt-2" width="100%" />}
</Form.Group>

        {/* <Form.Group className="mb-3">
          <Form.Label>Video File</Form.Label>
          <Form.Control name="video_file" type="file" accept="video/*" onChange={handleVideoUpload} />
          {videoPreview && <video controls width="100%" className="mt-2" src={videoPreview} />}
        </Form.Group> */}
        <Form.Group className="mb-3">
          <Form.Label>Description</Form.Label>
          <Form.Control as="textarea" rows={3} name="description" value={formData.description} onChange={handleInputChange} />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
        <Button variant="primary" onClick={handleSubmit}>Save</Button>
      </Modal.Footer>
    </Modal>
      {!isOwner && <FooterSection />}
    </>
  );
};
export default TalksByAmita;
