'use client';

import React, { useState, useEffect, useRef } from 'react';
import { postApi, updateApiWithFile } from 'services/api';
import { checkIsOwner, config } from 'services/config';
import { usePathname } from 'next/navigation';
import Link from 'node_modules/next/link';
const AboutAmitaJain = () => {
   const pathname = usePathname();
  const [openSection, setOpenSection] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [careerData, setCareerData] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  const [formData, setFormData] = useState({
    name:'',
    line_one_text: '',
    line_two_text: '',
    line_three_text: '',
    educations_and_training: [],
    professional_organisation: [],
    section_button_label: '',
    section_button_route: '',
  });
  const [showModal, setShowModal] = useState(false);
  const fileInputRef = useRef(null);
  const id = "6836d76c18178ff0e3f90540"; // Replace with actual ID

  const toggleSection = (index) => {
    setOpenSection(openSection === index ? null : index);
  };

 useEffect(() => {
   fetchCareerData()
  const isIframe = typeof window !== "undefined" && window.self !== window.top;
  const isAdminPath = pathname?.includes('/admin');
  const isAdminUser = checkIsOwner();

  if (isAdminUser && (isIframe || isAdminPath)) {
    setIsOwner(true);
  }
}, [pathname]);

  const fetchCareerData = async () => {
    try {
      const res = await postApi(config.ViewAmitaJainPageDetails, {});
      if (res?.statusCode === 200) {
        const data = res.data;
        setCareerData(data);
        setFormData({
          name:data.name || '',
          line_one_text: data.line_one_text || '',
          line_two_text: data.line_two_text || '',
          line_three_text: data.line_three_text || '',
          educations_and_training: data.educations_and_training || [],
          professional_organisation: data.professional_organisation || [],
          section_button_label: data.section_button_label || '',
          section_button_route: data.section_button_route || '',
        });
        const imgUrl = `${process.env.NEXT_PUBLIC_API_URL}/${data.image}`.replace(/\\/g, '/');
        setImagePreview(imgUrl);
      }
    } catch (err) {
      console.error('Failed to fetch career data', err);
    }
  };

  const handleInputChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };


const updateBannerImage = async (file) => {
  try {
    const res = await updateApiWithFile(config.UpdateAmitaJainPageDetails, id, {}, { image: file });
    if (res?.statusCode === 200) {
      const imgUrl = `${process.env.NEXT_PUBLIC_API_URL}/${res.data.file}`.replace(/\\/g, '/');
      setImagePreview(imgUrl);
    }
  } catch (err) {
    console.error('Error updating image', err);
  }
};

  const handleSubmit = async () => {
    try {
      await updateApiWithFile(config.UpdateAmitaJainPageDetails, id, formData,  selectedImage ? { image: selectedImage } : {});
      setShowModal(false);
      fetchCareerData();
    } catch (err) {
      console.error('Error saving details', err);
    }
  };

  return (
    <section className="aboutAmita">
      <div className="container-fluid">
        <div className="row">
          {/* Left Section */}
          <div className="col-md-6 pe-md-5 mb-4 mb-md-0">
            <div className="section-heading text-start mw-100 pb-3">
              <img src="/images/landingpage/watermark.png" width="50" className="d-block" alt="Watermark" />
              <h2>{formData.name}</h2>
              
              <p  className="mt-3 aboutTxt">{formData.line_one_text}</p>
              <p  className="aboutTxt">{formData.line_two_text}</p>
              <p  className="aboutTxt">{formData.line_three_text}</p>
              {isOwner && (
  <button
    className="btn btn-primary my-2"
    onClick={() => setShowModal(true)}
  >
    📝 Edit Details
  </button>
)}

              <div className="accordion" id="accordionFaq">
                <div className="accordion-item" style={{ border: "none", backgroundColor: "transparent" }}>
                  <hr />
                  <button
                    className={`accordion-button ${openSection === 1 ? '' : 'collapsed'}`}
                    type="button"
                    onClick={() => toggleSection(1)}
                    style={{ backgroundColor: "transparent", boxShadow: "none", padding: "0", fontWeight: "600", fontSize: "15px", color: "#662A09" }}
                  >
                    Education and Training Overview
                  </button>
                  <div className={`accordion-collapse collapse ${openSection === 1 ? 'show' : ''}`}>
                    <div className="accordion-body">
                      <ul className="overviewUl" style={{ padding: "0" }}>
                        {formData.educations_and_training.map((edu, index) => (
                          <li key={index}>
                            <img src="/images/landingpage/accordian-icon.svg" alt="" width="12" />
                            <p><span>{edu.title}</span> - {edu.text}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
{console.log("formmadata",formData)}
                <div className="accordion-item" style={{ border: "none", backgroundColor: "transparent" }}>
                  <hr />
                  <button
                    className={`accordion-button ${openSection === 2 ? '' : 'collapsed'}`}
                    type="button"
                    onClick={() => toggleSection(2)}
                    style={{ backgroundColor: "transparent", boxShadow: "none", padding: "0", fontWeight: "600", fontSize: "15px", color: "#662A09" }}
                  >
                    Professional Organizations
                  </button>
                  <div className={`accordion-collapse collapse ${openSection === 2 ? 'show' : ''}`}>
                    <div className="accordion-body">
                      <ul className="overviewUl" style={{ padding: "0" }}>
                        {formData.professional_organisation.map((org, index) => (
                          <li key={index}>
                            <img src="/images/landingpage/accordian-icon.svg" alt="" width="12" />
                            <p>{org}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <hr />
                </div>
              </div>
              <div className="my-2">
                {/* <button type="submit" className="btn btn-primary">{formData?.section_button_label}</button> */}
                 <Link href={formData?.section_button_route} className="btn btn-primary">{formData?.section_button_label}</Link>
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="col-md-6 ps-md-5">
            <figure className="m-0">
              <img src={imagePreview} alt="Amita Jain" style={{ width: '100%', height: 'auto' }} />
              {isOwner && (
                <>
                  
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                   onChange={(e) => {
  const file = e.target.files?.[0];
  if (file) {
    setSelectedImage(file); // NEW
    setImagePreview(URL.createObjectURL(file));
  }
}}

                  />
                </>
              )}
            </figure>
          </div>
        </div>

{showModal && (
  <div className="modal show d-block" tabIndex="-1">
    <div className="modal-dialog modal-lg">
      <div className="modal-content" style={{minWidth:'600px'}}>
        <div className="modal-header">
          <h5 className="modal-title">Edit Career Section</h5>
          <button className="btn-close" onClick={() => setShowModal(false)}></button>
        </div>
        <div className="modal-body">
          <div className="row">
            <div className="col-md-6">
              <label className="form-label">Line One Text</label>
              <input className="form-control mb-3" value={formData.line_one_text} onChange={(e) => handleInputChange('line_one_text', e.target.value)} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Line Two Text</label>
              <input className="form-control mb-3" value={formData.line_two_text} onChange={(e) => handleInputChange('line_two_text', e.target.value)} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Line Three Text</label>
              <input className="form-control mb-3" value={formData.line_three_text} onChange={(e) => handleInputChange('line_three_text', e.target.value)} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Button Label</label>
              <input className="form-control mb-3" value={formData.section_button_label} onChange={(e) => handleInputChange('section_button_label', e.target.value)} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Button Route</label>
              <input className="form-control mb-3" value={formData.section_button_route} onChange={(e) => handleInputChange('section_button_route', e.target.value)} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Career Image</label>
              <input
                type="file"
                accept="image/*"
                className="form-control mb-3"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setImagePreview(URL.createObjectURL(file));
                    updateBannerImage(file);
                  }
                }}
              />
              {imagePreview && (
                <img src={imagePreview} alt="Preview" style={{ width: '100%', height: 'auto' }} className="mb-3" />
              )}
            </div>
          </div>

          <hr />

          <label className="form-label">Educations and Training</label>
          {formData.educations_and_training.map((edu, index) => (
            <div className="row g-2 mb-2" key={index}>
              <div className="col-md-5">
                <input
                  className="form-control"
                  placeholder="Title"
                  value={edu.title}
                  onChange={(e) => {
                    const updated = [...formData.educations_and_training];
                    updated[index].title = e.target.value;
                    handleInputChange('educations_and_training', updated);
                  }}
                />
              </div>
              <div className="col-md-5">
                <input
                  className="form-control"
                  placeholder="Text"
                  value={edu.text}
                  onChange={(e) => {
                    const updated = [...formData.educations_and_training];
                    updated[index].text = e.target.value;
                    handleInputChange('educations_and_training', updated);
                  }}
                />
              </div>
              <div className="col-md-2">
                <button className="btn btn-danger w-100" onClick={() => {
                  const updated = [...formData.educations_and_training];
                  updated.splice(index, 1);
                  handleInputChange('educations_and_training', updated);
                }}>❌</button>
              </div>
            </div>
          ))}
          <button className="btn btn-secondary mb-3" onClick={() => handleInputChange('educations_and_training', [...formData.educations_and_training, { title: '', text: '' }])}>
            + Add Education
          </button>

          <label className="form-label">Professional Organizations</label>
          {formData.professional_organisation.map((org, index) => (
            <div className="row g-2 mb-2" key={index}>
              <div className="col-md-10">
                <input
                  className="form-control"
                  value={org}
                  onChange={(e) => {
                    const updated = [...formData.professional_organisation];
                    updated[index] = e.target.value;
                    handleInputChange('professional_organisation', updated);
                  }}
                />
              </div>
              <div className="col-md-2">
                <button className="btn btn-danger w-100" onClick={() => {
                  const updated = [...formData.professional_organisation];
                  updated.splice(index, 1);
                  handleInputChange('professional_organisation', updated);
                }}>❌</button>
              </div>
            </div>
          ))}
          <button className="btn btn-secondary mb-3" onClick={() => handleInputChange('professional_organisation', [...formData.professional_organisation, ''])}>
            + Add Organization
          </button>
        </div>
        <div className="modal-footer">
          <button className="btn btn-primary" onClick={handleSubmit}>Save</button>
          <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
        </div>
      </div>
    </div>
  </div>
)}

      </div>
    </section>
  );
};

export default AboutAmitaJain;