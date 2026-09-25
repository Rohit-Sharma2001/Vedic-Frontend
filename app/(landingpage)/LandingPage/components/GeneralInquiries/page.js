'use client';

import React, { useState, useEffect } from 'react';
import { postApi } from 'services/api';
import { config } from 'services/config';

const GeneralInquiries = () => {
    const [bannerdata, setBannerData] = useState({});
    const [successMessage, setSuccessMessage] = useState(''); // ✅ Success message state
    const [formData, setFormData] = useState({
        email: '',
        firstName: '',
        phone: '',
        subject: '',
        message: ''
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => setSuccessMessage(''), 5000); // ✅ Hide after 5 seconds
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    const fetchInitialData = async () => {
        try {
            const data = { id: "67bdad5cf25817c9eb8d0600" };
            const endpoint = config.ViewContactPageContent;
            const response = await postApi(endpoint, data);
            if (response.statusCode === 201) {
                setBannerData(response.contactManagementData);
            }
        } catch (error) {
            console.error('Error fetching initial data:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const endpoint = config.AddEnquiry;
            const response = await postApi(endpoint, formData);
            
            if (response.statusCode === 201) {
                setSuccessMessage('Your inquiry has been submitted successfully! ✅'); // ✅ Show success message
                ResetForm();
            } else {
                alert("Failed to submit inquiry.");
            }
        } catch (error) {
            console.error("Error submitting inquiry:", error);
        }
    };

    const ResetForm = () => {
        setFormData({
            email: "",
            phone: "",
            firstName: "",
            subject: "",
            message: "",
        });
    };

    return (
        <section className="generalInquiries">
            <div className="container">
                <div className="section-heading text-start mw-100 pb-2">
                    <img src="/images/landingpage/watermark.png" width="50" alt="Watermark" className="d-block" />
                    <h2>General Inquiries:</h2>
                </div>

                {/* ✅ Success message */}
                {successMessage && <div className="alert alert-success">{successMessage}</div>}

                <div className="row">
                    <div className="col-md-6 pe-md-5 border-end mb-4 mb-md-0">
                        <div className="contactForm">
                            <form onSubmit={handleSubmit}>
                                <div className="row">
                                    <div className="col-md-12">
                                        <div className="form-group mb-3">
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
                                        <div className="form-group mb-3">
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="firstName"
                                                value={formData.firstName}
                                                onChange={handleChange}
                                                placeholder="First Name"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="form-group mb-3">
                                            <input
                                                type="number"
                                                className="form-control"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                placeholder="Phone Number"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-12">
                                        <div className="form-group mb-3">
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="subject"
                                                value={formData.subject}
                                                onChange={handleChange}
                                                placeholder="Subject"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-12">
                                        <div className="form-group mb-3">
                                            <textarea
                                                className="form-control"
                                                name="message"
                                                value={formData.message}
                                                onChange={handleChange}
                                                placeholder="Message"
                                                rows="4"
                                                required
                                            ></textarea>
                                        </div>
                                    </div>
                                    <div className="col-md-12">
                                        <div className="form-group">
                                            <button type="submit" className="btn btn-primary">
                                                Submit
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>

                    <div className="col-md-6 ps-md-5">
                        <div className="addressDetail">
                            <h3>Our Opening Hours</h3>
                            <div
                                dangerouslySetInnerHTML={{ __html: bannerdata?.opening_closing_details || '' }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default GeneralInquiries;
