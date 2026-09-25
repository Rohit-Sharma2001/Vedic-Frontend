"use client";
import { useState, useEffect, useRef ,useMemo  } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "../Header/page";
// import SubHeader from "../SubHeader/page";
import "../../public/css/style.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { config } from "services/config";
import { postApi, postApiWithFile, updateApiWithFile } from "services/api";
import dynamic from "next/dynamic";
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";
import Swal from "sweetalert2";
import { checkIsOwner } from "services/config";
import { usePathname } from 'next/navigation';
import FooterSection from "../Footer/page";
const FreeClinic = () => {
   const [isOwner, setIsOwner] = useState(false);
const [errors, setErrors] = useState({});
const pathname = usePathname();
const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10MB
const tooBig = (file) => !!file && file.size > MAX_IMAGE_BYTES;
useEffect(() => {
  const isIframe = typeof window !== "undefined" && window.self !== window.top;
  const isAdminPath = pathname?.includes('/admin');
  const isAdminUser = checkIsOwner();

  if (isAdminUser && (isIframe || isAdminPath)) {
    setIsOwner(true);
  }
}, [pathname]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    banner_text: "",
    button_label: "",
    button_route: "",
    image: null,
  });
  const [clinicsections, setClinicSections] = useState([]);
  const [imagePreview, setImagePreview] = useState("");
  const fileInputRef = useRef(null);
const [editSection, setEditSection] = useState(null);
const [showEditModal, setShowEditModal] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newSection, setNewSection] = useState({
    heading: "",
    text: "",
    image: null,
    upper_details_section: "",
    lower_details_section: "",
  });
  const [imagePreviewNew, setImagePreviewNew] = useState("");

 const stripHtml = (html) =>
  (html || "").replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();

const hasContent = (html) => stripHtml(html).length > 0;

const validateNewSection = (s) => {
  const e = {};
  if (!s.heading || !s.heading.trim()) e.heading = "Heading is required";
  if (!s.text || !s.text.trim()) e.text = "Short text is required";
  if (!hasContent(s.upper_details_section)) e.upper_details_section = "Upper details are required";
  if (!hasContent(s.lower_details_section)) e.lower_details_section = "Lower details are required";
  if (!s.image) e.image = "Image is required";
  setErrors(e);
  return Object.keys(e).length === 0;
};

const canSaveNewSection = useMemo(
  () =>
    !!(newSection.heading && newSection.heading.trim()) &&
    !!(newSection.text && newSection.text.trim()) &&
    hasContent(newSection.upper_details_section) &&
    hasContent(newSection.lower_details_section) &&
    !!newSection.image,
  [newSection]
);

  const fetchFreeClinicSections = async () => {
    try {
      const res = await postApi(config.GetClinicSection, {});

      const data = res?.resultWithUrls;
      console.log("Clinic Sections", res);
      if (data) {
        setClinicSections(data);
      
      }
    } catch (err) {
      console.error("Failed to fetch clinic banner", err);
    }
  };

 const fetchFreeClinicData = async () => {
  try {
    const res = await postApi(config.GetClinicBanner, {
      id: "682b1e2e5bb07cb2991d3e48",
    });
    const data = res?.result;
    console.log("Clinic Banner Data:", data);

    if (data) {
      setFormData({
        banner_text: data.banner_text || "",
        button_label: data.button_label || "",
        button_route: data.button_route || "",
        image: null,
      });

      if (data.image) {
        const imageUrl = `${process.env.NEXT_PUBLIC_API_URL}/${data.image}`.replace(/\\/g, "/");
        console.log("Banner Image URL:", imageUrl);
        setImagePreview(imageUrl);
      } else {
        console.warn("❌ image field is missing in banner response");
      }
    } else {
      console.warn("❌ res.result is null or undefined");
    }
  } catch (err) {
    console.error("Failed to fetch clinic banner", err);
  }
};


  useEffect(() => {
    fetchFreeClinicData();
    fetchFreeClinicSections();
  }, []);

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

 const handleImageUpload = (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  if (tooBig(file)) {
    Swal.fire("Image too large", "Max allowed size is 10 MB.", "warning");
    e.target.value = "";                     // reset input
    setFormData((p) => ({ ...p, image: null }));
    setImagePreview("");
    return;
  }
  setFormData((prev) => ({ ...prev, image: file }));
  setImagePreview(URL.createObjectURL(file));
};

const handleSubmit = async () => {
  if (formData.image && tooBig(formData.image)) {
    Swal.fire("Image too large", "Max allowed size is 10 MB.", "warning");
    return;
  }
  try {
    const files = formData.image ? { image: formData.image } : {};
    const payload = { ...formData, image: undefined };
    await updateApiWithFile(config.UpdateClinicBanner, "682b1e2e5bb07cb2991d3e48", payload, files);
    setShowModal(false);
    fetchFreeClinicData();
  } catch (err) {
    console.error("Update failed", err);
  }
};
const handleAddNewSection = async () => {
  if (newSection.image && tooBig(newSection.image)) {
    Swal.fire("Image too large", "Max allowed size is 10 MB.", "warning");
    return;
  }
  if (!validateNewSection(newSection)) {
    await Swal.fire("Missing required fields", "Please fill all fields and add an image.", "warning");
    return;
  }
  try {
    const files = { image: newSection.image };
    const payload = { ...newSection, image: undefined };
    await postApiWithFile(config.AddClinicSection, payload, files);
    setShowAddModal(false);
    setNewSection({ heading: "", text: "", image: null, upper_details_section: "", lower_details_section: "" });
    setImagePreviewNew("");
    setErrors({});
    fetchFreeClinicSections();
  } catch (err) {
    console.error("Failed to add new section", err);
    await Swal.fire("Error", "Failed to add the section. Try again.", "error");
  }
};
const deleteCaseStory = async (id) => {
  try {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This action will permanently delete the section.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      await postApi(config.DeleteClinicSection, { id });
      fetchFreeClinicSections();

      Swal.fire("Deleted!", "The section has been deleted.", "success");
    }
  } catch (error) {
    console.error("Error deleting case story:", error);
    Swal.fire("Error", "Failed to delete the section. Try again.", "error");
  }
};

const handleEditSection = async () => {
  if (editSection?.image && editSection.image instanceof File && tooBig(editSection.image)) {
    Swal.fire("Image too large", "Max allowed size is 10 MB.", "warning");
    return;
  }
  try {
    const files = editSection?.image instanceof File ? { image: editSection.image } : {};
    const payload = { ...editSection, image: undefined };
    await updateApiWithFile(config.UpdateClinicSection, editSection._id, payload, files);
    setShowEditModal(false);
    setEditSection(null);
    fetchFreeClinicSections();
  } catch (err) {
    console.error("Failed to update section", err);
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
      {!isOwner ?
      <Header arrayheader={arrayheader} />
      :<h3 className="mt-3 ml-3" style={{marginLeft:"15px"}}>Free Clinic Page</h3>
    }
      {/* {!isOwner && <SubHeader />} */}

      <div

        className="innerBanner"
        // style={{ backgroundImage: "url(/images/landingpage/contact-banner.jpg)" }}
        style={{ backgroundImage: `url('${imagePreview}')` }}
      >
        <div className="container">
          <div className="innerBannertxt">
            <h1>{formData?.banner_text}</h1>
            
            <Link
              href={formData?.button_route}
              className="btn btn-primary mt-3 px-4 mr-3"
            >
              {formData?.button_label}
            </Link>
            {isOwner && 
            <button
              className="btn btn-primary mt-3 px-4 ml-3 "
              onClick={() => setShowModal(true)}
              style={{marginLeft:'5px'}}
            >
              ✏️ Edit Details
            </button>
            }
          </div>
        </div>
      </div>
{isOwner && 
      <div className="d-flex justify-content-center">
      <button
        className="btn btn-primary my-3 ml-5"
        onClick={() => setShowAddModal(true)}
      >
        <b>+</b> Add New Free Clinic Section
      </button>
</div>
}
      {clinicsections.map((section, index) => (
        <section
          key={index}
          className={`productMain py-2 ${index % 2 === 0 ? "bg-white" : ""}`}
        >
          <div className="container-fluid">
            <div className="section-heading">
            
              <img src="/images/landingpage/watermark.png" width="50" />
              <h2>{section?.heading}</h2>
              <p>{section?.text}</p>
              
            </div>
            <div className="row px-md-1">
              <div className="col-md-3 mb-2 px-md-2 me-md-4">
                <figure className="productAppoint p-0">
                  <img
                    src={`${process.env.NEXT_PUBLIC_API_URL}/${section?.image}`.replace(
                      /\\/g,
                      "/"
                    )}
                    alt=""
                  />
                </figure>
              </div>
              <div className="col-md-8 mb-3 px-md-2">
                <div className="prdctCont">
                  <p
                    className="fs-8"
                    dangerouslySetInnerHTML={{
                      __html: section?.upper_details_section,
                    }}
                  />
                </div>
              </div> 
            </div>

            <p
              className="fs-8"
              dangerouslySetInnerHTML={{
                __html: section?.lower_details_section,
              }}
            />
           {isOwner && (
  <>
    <button
      className="btn btn-primary my-3 me-2"
      onClick={() => {
        setEditSection(section);
        setImagePreviewNew(`${process.env.NEXT_PUBLIC_API_URL}/${section?.image}`.replace(/\\/g, "/"));
        setShowEditModal(true);
      }}
    >
      ✏️ Edit this section
    </button>
    <button
      className="btn btn-danger my-3"
      onClick={() => deleteCaseStory(section._id)}
    >
      🗑️ Delete this section
    </button>
  </>
)}

          </div>
        </section>
      ))}

      {showModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content" style={{minWidth:'600px'}}>
              <div className="modal-header">
                <h5 className="modal-title">Edit Free Clinic Banner</h5>
                <button
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  {["banner_text", "button_label", "button_route"].map(
                    (field) => (
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
                    )
                  )}
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

      {showAddModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content" style={{minWidth:'600px'}}>
              <div className="modal-header">
                <h5 className="modal-title">Add New Clinic Section</h5>
                <button
                  className="btn-close"
                  onClick={() => setShowAddModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Heading</label>
                   <input
  type="text"
  className="form-control"
  value={newSection.heading}
  onChange={(e) => {
    const value = e.target.value;
    setNewSection((prev) => ({ ...prev, heading: value }));
    if (errors.heading) setErrors((prev) => ({ ...prev, heading: "" }));
  }}
/>
{errors.heading && <small className="text-danger">{errors.heading}</small>}
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Short Text</label>
                   <input
  type="text"
  className="form-control"
  value={newSection.text}
  onChange={(e) => {
    const value = e.target.value;
    setNewSection((prev) => ({ ...prev, text: value }));
    if (errors.text) setErrors((prev) => ({ ...prev, text: "" }));
  }}
/>
{errors.text && <small className="text-danger">{errors.text}</small>}
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    Upper Details (Rich Text)
                  </label>
                 <ReactQuill
  value={newSection.upper_details_section}
  onChange={(val) => {
    setNewSection((prev) => ({ ...prev, upper_details_section: val }));
    if (errors.upper_details_section) setErrors((prev) => ({ ...prev, upper_details_section: "" }));
  }}
/>
{errors.upper_details_section && (
  <small className="text-danger d-block">{errors.upper_details_section}</small>
)}
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    Lower Details (Rich Text)
                  </label>
                <ReactQuill
  value={newSection.lower_details_section}
  onChange={(val) => {
    setNewSection((prev) => ({ ...prev, lower_details_section: val }));
    if (errors.lower_details_section) setErrors((prev) => ({ ...prev, lower_details_section: "" }));
  }}
/>
{errors.lower_details_section && (
  <small className="text-danger d-block">{errors.lower_details_section}</small>
)}
                </div>

                <div className="mb-3">
                  <label className="form-label">Image <small className="text-muted d-block">
          (Preffered Image 550×550px and less than 10MB of  Jpeg,Png type )
        </small></label>
                <input
  type="file"
  className="form-control"
  accept="image/*"
  onChange={(e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (tooBig(file)) {
      Swal.fire("Image too large", "Max allowed size is 10 MB.", "warning");
      e.target.value = "";
      setNewSection((prev) => ({ ...prev, image: null }));
      setImagePreviewNew("");
      setErrors((prev) => ({ ...prev, image: "Image must be ≤ 10 MB" }));
      return;
    }
    setNewSection((prev) => ({ ...prev, image: file }));
    setImagePreviewNew(URL.createObjectURL(file));
    if (errors.image) setErrors((prev) => ({ ...prev, image: "" }));
  }}
/>
{errors.image && <small className="text-danger d-block">{errors.image}</small>}
                  {imagePreviewNew && (
                    <img src={imagePreviewNew} className="mt-2" width={100} />
                  )}
                </div>
              </div>

              <div className="modal-footer">
              <button
  className="btn btn-primary"
  onClick={handleAddNewSection}
  disabled={!canSaveNewSection}
>
  Save
</button>
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
       {!isOwner && <FooterSection/>}

       {showEditModal && (
  <div className="modal show d-block" tabIndex="-1">
    <div className="modal-dialog modal-lg">
      <div className="modal-content" style={{minWidth:'600px'}}>
        <div className="modal-header">
          <h5 className="modal-title">Edit Clinic Section</h5>
          <button className="btn-close" onClick={() => setShowEditModal(false)}></button>
        </div>
        <div className="modal-body">
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Heading</label>
              <input
                type="text"
                className="form-control"
                value={editSection?.heading || ""}
                onChange={(e) => setEditSection((prev) => ({ ...prev, heading: e.target.value }))}
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Short Text</label>
              <input
                type="text"
                className="form-control"
                value={editSection?.text || ""}
                onChange={(e) => setEditSection((prev) => ({ ...prev, text: e.target.value }))}
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Upper Details (Rich Text)</label>
            <ReactQuill
              value={editSection?.upper_details_section || ""}
              onChange={(val) =>
                setEditSection((prev) => ({ ...prev, upper_details_section: val }))
              }
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Lower Details (Rich Text)</label>
            <ReactQuill
              value={editSection?.lower_details_section || ""}
              onChange={(val) =>
                setEditSection((prev) => ({ ...prev, lower_details_section: val }))
              }
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Image <small className="text-muted d-block">
          (Preffered Image 550×550px and less than 10MB of  Jpeg,Png type )
        </small></label>
           <input
  type="file"
  className="form-control"
  accept="image/*"
  onChange={(e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (tooBig(file)) {
      Swal.fire("Image too large", "Max allowed size is 10 MB.", "warning");
      e.target.value = "";
      setEditSection((prev) => ({ ...prev, image: null }));
      setImagePreviewNew("");
      return;
    }
    setEditSection((prev) => ({ ...prev, image: file }));
    setImagePreviewNew(URL.createObjectURL(file));
  }}
/>
            {imagePreviewNew && (
              <img src={imagePreviewNew} className="mt-2" width={100} />
            )}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-primary" onClick={handleEditSection}>
            Save Changes
          </button>
          <button className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
)}

    </>
  );
};
export default FreeClinic;
