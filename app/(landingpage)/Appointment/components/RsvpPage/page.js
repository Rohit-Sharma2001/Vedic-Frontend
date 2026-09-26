"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "app/(landingpage)/LandingPage/components/Header/page";
import FooterSection from "app/(landingpage)/LandingPage/components/Footer/page";
import "app/(landingpage)/LandingPage/public/css/style.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { config } from "services/config";
import { postApi, postApiWithFile, updateApiWithFile } from "services/api";
// import SubHeader from "app/(landingpage)/LandingPage/components/SubHeader/page";

const RsvpPage = () => {
   
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
      <Header arrayheader={arrayheader} />
      {/* <SubHeader /> */}
      <div className="seminarMain">
        <div className="container-fluid">
            <div className="breadcrumbGroup my-4 mb-md-3 mt-0">
                <ol className="breadcrumb mb-0">
                    <li className="breadcrumb-item"><a href="book-appointment.html">Booking Page </a></li>
                    <li className="breadcrumb-item"><a href="event.html">Events </a></li>
                    <li className="breadcrumb-item active" aria-current="page">Event Details</li>
                </ol>
            </div>
            <div className="row align-items-center">
                <div className="col-md-4 m-0">
                    <figure className="seminarImg m-0"><img src="/images/landingpage/event-images1.jpg" alt=""/></figure>
                </div>
                <div className="col-md-8">
                    <div className="contentRsvp">
                        <h2>Seminar: Intro to Ayurveda with Amita Jain</h2>
                        <p>Know everything about Yantras, their mystical powers, types of yantras and the
                            correct way to use them to fulfil your desires. Spaces are limited—reserve your spot
                            today! Free for Members.</p>
                    </div>
                    <div className="contentRsvp mt-4">
                        <h2 className="fs-7">Date & Location</h2>
                        <p className="m-0">May 10, 2025, 10:00 AM – 11:00 AM EDT </p>
                        <p>Vedic Yours Center, 15235 Shady Grove Road, Suite 100, Rockville MD 20850</p>
                    </div>
                    <div className="contentRsvp mt-4">
                        <h2 className="fs-7">About The Event</h2>
                        <p className="m-0 fw-medium mb-1"><b> Host:</b> Amita Jain, Founder Vedic Yours, Doctor of
                            Ayurveda </p>
                        <p className="m-0 fw-medium mb-1"><b>Format:</b> In Person Seminar</p>
                        <p className="m-0 fw-medium"><b> Place:</b> Vedic Yours Center, Rockville, MD</p>
                    </div>
                </div>
            </div>
            <div className="contentRsvp mt-4">
                <h2 className="fs-7">Description</h2>
                <p className="m-0 fw-medium">What is the Ayurvedic medical system? What are the doshas and how does
                    lifestyle and herbs help create balance? How can Ayurveda lead us back to a state of health
                    and harmony? Learn about the philosophy of Ayurveda and it healing benefits. Ayurveda is
                    an ancient system of medicine that originated in India over 3,000 years ago. It focuses on
                    balancing the body, mind, and spirit to promote overall health and well-being. Participants
                    will learn how simple lifestyle changes can enhance overall physical and emotional
                    well-being. Everyone will have a chance to make their own custom herbal formula and meal
                    plan. Registration is required. Free and open to the public. </p>
            </div>
            <ul className="d-flex align-items-center gap-2 mt-3">
                <li><span className="fw-semibold fs-7">Share this event:</span></li>
                <li><img src="/images/landingpage/facebook-circle-icon.svg" alt="" width="25" data-bs-toggle="tooltip"
                        data-bs-placement="bottom" data-bs-title="facebook"/></li>
                <li><img src="/images/landingpage/twitt-contct.svg" alt="" width="25"/></li>
                <li><img src="/images/landingpage/linkdin-bg.svg" alt="" width="25"/></li>
            </ul>
            <div className="row mt-4">
                <div className="col-md-7 mb-5">
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3095.9826380712543!2d-77.19088032564858!3d39.10686543432004!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89b7cd560c5f37bd%3A0xaccc7e2d22aa1aa6!2s15235%20Shady%20Grove%20Rd%20Ste%20100%2C%20Rockville%2C%20MD%2020850%2C%20USA!5e0!3m2!1sen!2sin!4v1738827537715!5m2!1sen!2sin"
                        width="600" height="350"
                        // style="border:0;width: 100%;display: block;border: none;border-radius: 6px;"
                        style={{border:'0',width:'100%',display:'block',border:'none',borderRadius:'6px'}}
                        allowfullscreen=""
                        loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
                </div>
                <div className="col-md-5 mb-5">
                    <div className="register mt-0">
                        <h6 className="mb-2 mb-md-4 fw-semibold">Register</h6>
                        <div className="d-lg-flex justify-content-between gap-md-5 mb-3 mb-md-4">
                            <div className="w-100 mb-3">
                                <label className="d-block fw-semibold mb-2 fs-8">Ticket Type:</label>
                                <select className="form-select form-select-sm" aria-label="Small select example">
                                    <option selected>RSVP</option>
                                </select>
                            </div>
                            <div className="qtyGroup">
                                <strong>Quantity*</strong>
                                <div className="quantity">
                                    <button className="minus" aria-label="Decrease">−</button>
                                    <input type="number" className="input-box bg-white" value="1" min="1" max="10"/>
                                    <button className="plus" aria-label="Increase">+</button>
                                </div>
                            </div>
                        </div>
                        <label className="d-block fw-semibold mb-3 mb-md-2 fs-8">Ticket Type:</label>
                        <div className="subscribeInpt mt-md-0 mt-3 mb-4 w-100 mx-auto">
                            <input type="text" placeholder="Enter Promo Code"/>
                            <button type="button" className="btn btn-orange">Apply</button>
                        </div>
                        <div className="checkOut mt-3 mt-lg-5">
                            <span>Total: <b className="ms-1">$0.00</b></span>
                            <button type="button" data-bs-target="#ticketForm" data-bs-toggle="modal"
                                className="btn btn-success px-4">Checkout</button>
                        </div>
                    </div>
                </div>
            </div>
  
        </div>
    </div>
      <FooterSection />
 
      
    </>
  );
};
export default RsvpPage;
