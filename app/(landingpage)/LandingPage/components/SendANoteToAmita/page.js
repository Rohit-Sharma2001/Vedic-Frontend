'use client';
import React, { useState, useEffect } from 'react';
import { postApi } from 'services/api';
import { config } from 'services/config';

const SendANoteToAmita = () => {
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    mobile_number:'',
    note: ''
  });
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = config.AddNotes;
      const data = { ...formData };
      const response = await postApi(endpoint, data);
      if (response.statusCode === 201) {
        setSuccessMessage('Your note has been sent successfully! ✅');
        ResetForm();
      } else {
        alert("Failed to send the note!");
      }
    } catch (error) {
      console.error("Error sending the note:", error);
    }
  };

  const ResetForm = () => {
    setFormData({
      email: "",
      note: "",
      firstName: "",
      lastName: "",
    });
  };

  return (
    <section className="generalInquiries formsendNote">
      <div className="container">
        <div className="section-heading text-start mw-100 pb-3">
          <img src="/images/landingpage/watermark.png" width="50" className="d-block" alt="Watermark" />
          <h2>Send a note to Amita</h2>
        </div>

        {/* ✅ Success message */}
        {successMessage && <div className="alert alert-success">{successMessage}</div>}

        <div className="row align-items-center">
          <div className="col-md-6 pe-md-5 mb-4 mb-md-0">
            <form onSubmit={handleSubmit} className="contactForm">
              <div className="row">
                 <div className="col-md-6">
                  <div className="form-group">
                    <input
                      type="text"
                      className="form-control"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="First Name"
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <input
                      type="text"
                      className="form-control"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Last Name"
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Email Address*"
                      required
                    />
                  </div>
                </div>

                 <div className="col-md-6">
                  <div className="form-group">
                    <input
                      type="number"
                      className="form-control"
                      name="mobile_number"
                      value={formData.mobile_number}
                      onChange={handleChange}
                      placeholder="Enter Mobile Number *"
                      required
                    />
                  </div>
                </div>
               
                <div className="col-md-12">
                  <div className="form-group">
                    <textarea
                      className="form-control"
                      name="note"
                      value={formData.note}
                      onChange={handleChange}
                      placeholder="Your Note"
                    ></textarea>
                  </div>
                </div>
                <div className="col-md-12">
                  <div className="form-group">
                    <button type="submit" className="btn btn-primary px-4">
                      Submit
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>

          <div className="col-md-6 ps-md-3 pe-md-4">
            <div className="sendrightImg">
              <figure className="position-relative">
                <img src="/images/landingpage/online-yoga.jpg" alt="Online Yoga" />
                <a href="#" className="">
                  <img src="/images/landingpage/video-icon.svg" alt="Play Video" width="40" />
                </a>
              </figure>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SendANoteToAmita;
