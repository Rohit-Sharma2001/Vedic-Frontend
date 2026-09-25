'use client'
import { useState, useEffect ,useRef } from "react";
import { Modal, Button } from "react-bootstrap";
import { updateApiWithFile ,postApi } from "services/api";
import { config, checkIsOwner } from "services/config";
import { usePathname } from 'next/navigation';
import Link from "node_modules/next/link";
import dynamic from 'next/dynamic';
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

const AmitaJainQuote = () => {
     const pathname = usePathname();
const fileInputRef = useRef(null);
  const [showModal, setShowModal] = useState(false);
   const [imagePreview, setImagePreview] = useState(null);
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
  title: "",
  quote: "",
  button_label: "",
  button_route: ""
});
const id = "6836efe45e4867b8b3298158"; // Use consistent ID

const openEditModal = () => {
  setShowModal(true);
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
    const payload = {};
    const res = await updateApiWithFile(config.UpdateAmitaJainQuoteDetails, id, payload, files);
    if (res?.statusCode === 200) {
      const updatedUrl = `${process.env.NEXT_PUBLIC_API_URL}/${res.data.file}`.replace(/\\/g, '/');
      setImagePreview(updatedUrl);
    }
  } catch (err) {
    console.error("Error updating banner image", err);
  }
};

const fetchBackgroundData = async () => {
  try {
    const response = await postApi(config.ViewAmitaJainQuoteDetails, { id });
    if (response?.statusCode === 200) {
      const data = response.data;
      setFormFields({
        title: data.title || "",
        quote: data.quote || "",
        button_label: data.button_label || "",
        button_route: data.button_route || "",
      });
        const imageUrl = `${process.env.NEXT_PUBLIC_API_URL}/${data.file}`.replace(/\\/g, '/');
        setImagePreview(imageUrl);
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
    const id = "6836efe45e4867b8b3298158"; // or dynamic
    const res = await updateApiWithFile(config.UpdateAmitaJainQuoteDetails, id, payload, {});
    if (res?.statusCode === 200) {
      console.log("Saved successfully");
      setShowModal(false);
    }
  } catch (err) {
    console.error("Error saving background data", err);
  }
};

  return (<>
   
   {isOwner && (<>
   
  <div className="text-end my-3">
    <button className="btn btn-primary" onClick={openEditModal}>
      ✏️ Edit Contact Section
    </button>
  </div>
  <div className="text-end my-3">
    <button
      className="btn btn-primary mt-2"
      onClick={() => fileInputRef.current?.click()}
      style={{ marginRight: '5px' }}
    >
      ✏️ Edit Image
    </button>
    <input
      type="file"
      accept="image/*"
      ref={fileInputRef}
      style={{ display: 'none' }}
      onChange={handleImageUpload}
    />
  </div>
  </>
)}


<Modal show={showModal} onHide={() => setShowModal(false)}>
  <Modal.Header closeButton>
    <Modal.Title>Edit Contact Section</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <input
      name="title"
      value={formFields.title}
      onChange={handleChange}
      placeholder="Heading"
      className="form-control mb-3"
    />
    <input
      name="quote"
      value={formFields.quote}
      onChange={handleChange}
      placeholder="Text"
      className="form-control mb-3"
    />
    <input
      name="button_label"
      value={formFields.button_label}
      onChange={handleChange}
      placeholder="Text"
      className="form-control mb-3"
    />
    <input
      name="button_route"
      value={formFields.button_route}
      onChange={handleChange}
      placeholder="Text"
      className="form-control mb-3"
    />
   

  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
    <Button variant="primary" onClick={handleSave}>Save</Button>
  </Modal.Footer>
</Modal>


{/* ***************************************************Contact Her Sections ************************************************* */}
    <section>
        <div className="container-fluid">
            <div className="geetaMain herchange" style={{
        backgroundImage: `url(${imagePreview})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}>
                <div className="w-100">
                    <h6>{formFields?.title}</h6>
                <p>{formFields?.quote}</p>
                </div>
                <Link href={formFields?.button_route} className="btn btn-primary d-inline text-nowrap">{formFields?.button_label}</Link>
            </div>

        </div>
    </section>
    </>
  );
};

export default AmitaJainQuote;
