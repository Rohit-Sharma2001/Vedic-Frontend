'use client'
import { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import { usePathname } from 'next/navigation';
import { updateApiWithFile ,postApi } from "services/api";
import { config, checkIsOwner } from "services/config";
import dynamic from 'next/dynamic';
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

const BackgroundOfHer = () => {
   const pathname = usePathname();
  const [showModal, setShowModal] = useState(false);
const [isOwner, setIsOwner] = useState(false);

useEffect(() => {
   fetchBackgroundData()
  const isIframe = typeof window !== "undefined" && window.self !== window.top;
  const isAdminPath = pathname?.includes('/admin');
  const isAdminUser = checkIsOwner();

  if (isAdminUser && (isIframe || isAdminPath)) {
    setIsOwner(true);
  }
}, [pathname]);

const [formFields, setFormFields] = useState({
  background_section_heading: "",
  background_section_text: "",
  background_sections_description: ""
});
const id = "6836d76c18178ff0e3f90540"; // Use consistent ID

const openEditModal = () => {
  setShowModal(true);
};

const fetchBackgroundData = async () => {
  try {
    const response = await postApi(config.ViewAmitaJainPageDetails, { id });
    if (response?.statusCode === 200) {
      const data = response.data;
      setFormFields({
        background_section_heading: data.background_section_heading || "",
        background_section_text: data.background_section_text || "",
        background_sections_description: data.background_sections_description || ""
      });
      // setShowModal(true);
    }
  } catch (err) {
    console.error("Error fetching background data", err);
  }
};




const handleChange = (e) => {
  const { name, value } = e.target;
  setFormFields((prev) => ({ ...prev, [name]: value }));
};

const handleSave = async () => {
  try {
    const payload = { ...formFields };
    const id = "6836d76c18178ff0e3f90540"; // or dynamic
    const res = await updateApiWithFile(config.UpdateAmitaJainPageDetails, id, payload, {});
    if (res?.statusCode === 200) {
      console.log("Saved successfully");
      setShowModal(false);
    }
  } catch (err) {
    console.error("Error saving background data", err);
  }
};

  return (<>
   
{isOwner && (
  <div className="text-end my-3">
    <button className="btn btn-primary" onClick={openEditModal}>
      ✏️ Edit Background Section
    </button>
  </div>
)}


<Modal show={showModal} size="lg" onHide={() => setShowModal(false)}>
  <Modal.Header closeButton>
    <Modal.Title>Edit Background Section</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <input
      name="background_section_heading"
      value={formFields.background_section_heading}
      onChange={handleChange}
      placeholder="Heading"
      className="form-control mb-3"
    />
    <input
      name="background_section_text"
      value={formFields.background_section_text}
      onChange={handleChange}
      placeholder="Text"
      className="form-control mb-3"
    />
   <ReactQuill
  theme="snow"
  value={formFields.background_sections_description}
  onChange={(value) =>
    setFormFields((prev) => ({ ...prev, background_sections_description: value }))
  }
/>

  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
    <Button variant="primary" onClick={handleSave}>Save</Button>
  </Modal.Footer>
</Modal>


 <section className="bgHer">
        <div className="container">
            <div className="section-heading pb-4 mx-0 text-start">
                <img src="/images/landingpage/watermark.png" width="50" className="d-block"/>
                <h2 className=" mb-2">{formFields?.background_section_heading}</h2>
                <p>{formFields?.background_section_text}</p>
            </div>
             <ul className="hercontentUl text-start">
          <li dangerouslySetInnerHTML={{ __html: formFields?.background_sections_description || '' }}></li>
        </ul>
        
        </div>
    </section>
    </>
  );
};

export default BackgroundOfHer;
