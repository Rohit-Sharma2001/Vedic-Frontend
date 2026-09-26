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

const Events = () => {
   
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
 <div className="yantraBanner">
        <div className="container-fluid">
            <div className="innerBannertxt text-start" 
            
             style={{ backgroundImage: `url('/images/landingpage/yantra-banner.jpg')` }}
          >
                <span>Event of the month</span>
                <div className="bottomTxt">
                    <b><img src="/images/landingpage/mantra-icon.svg" alt="" width="13" className="me-1"/> Tue, May 27, 2025 - 6:45 PM -
                        7:45 PM</b>
                    <h1>Create your own Yantra: Journey into Sacred Geomtery</h1>
                    <p className="fs-9"><img src="/images/landingpage/mantra-icon1.svg" alt="" width="14" className="me-1"/> Vedic Yours
                        Center</p>
                    <button type="button" className="btn btn btn-primary appointment px-5 fw-semibold">RSVP</button>
                </div>
            </div>
        </div>
    </div>
    <div className="programSection mt-4">
        <div className="container-fluid">
             <div className="breadcrumbGroup my-4 mb-md-4">
                <ol className="breadcrumb mb-0">
                    <li className="breadcrumb-item"><a href="memberships.html">Booking Page </a></li>
                    <li className="breadcrumb-item active" aria-current="page">Events</li>
                </ol>
            </div>
            <ul className="nav nav-tabs ordersTabs mb-4" role="tablist">
                <li className="nav-item" role="presentation">
                    <button className="nav-link active" data-bs-toggle="tab" data-bs-target="#allEvent" type="button">All
                        Events</button>
                </li>
                <li className="nav-item" role="presentation">
                    <button className="nav-link" data-bs-toggle="tab" data-bs-target="#recentEvent" type="button">Recent
                        Events</button>
                </li>
            </ul>
            <div className="tab-content">
                <div className="tab-pane fade show active" id="allEvent">
                    <div className="eventcontent mb-3">
                        <figure className="mx-auto"><img src="/images/landingpage/event-images1.jpg" alt=""/></figure>
                        <div className="eventtxt">
                            <h3>Ayurvedic Spring 25 Group Detox</h3>
                            <p>Renew, reset and recharge. Feel light and vibrant after our group guided cleanse. Held
                                only twice
                                a year, this is our largest and most popular event!</p>
                            <span>Fri, Mar 14 | Full details will be emailed to registrations</span>
                            <a href="rsvp-page.html" className="btn btn-primary">RSVP</a>
                        </div>
                    </div>
                    <div className="eventcontent mb-3">
                        <figure className="mx-auto"><img src="/images/landingpage/event-images2.jpg" alt=""/></figure>
                        <div className="eventtxt">
                            <h3>OPEN HOUSE: Meet & Mingle</h3>
                            <p>Visit our Ayurveda & Natural Healing Center. Meet with our team of experts and ask your
                                questions
                                in a loving atmosphere. Designed to bring together a community of individuals passionate
                                about
                                holistic and alternative health. Food and beverages will be served. Registration
                                required. Drop
                                in anytime.</p>
                            <span>Fri, Mar 14 | Full details will be emailed to registrations</span>
                            <a href="" className="btn btn-primary">RSVP</a>
                        </div>
                    </div>
                    <div className="eventcontent mb-3">
                        <figure className="mx-auto"><img src="/images/landingpage/event-images3.jpg" alt=""/></figure>
                        <div className="eventtxt">
                            <h3>Yantras : Key to Cosmic Consciousness</h3>
                            <p>Know everything about Yantras, their mystical powers, types of yantras and the correct
                                way to use
                                them to fulfil your desires. Spaces are limited—reserve your spot today! Free for
                                Members.</p>
                            <span>Thu, Apr 10 | Vedic Yours Center</span>
                            <a href="" className="btn btn-primary">RSVP</a>
                        </div>
                    </div>
                    <div className="eventcontent mb-3">
                        <figure className="mx-auto"><img src="/images/landingpage/event-images4.jpg" alt=""/></figure>
                        <div className="eventtxt">
                            <h3>Create your own Yantra: Journey into Sacred Geomtery</h3>
                            <p>Creating your own yantra can be a deeply personal and transformative experience, allowing
                                you to
                                infuse your intentions, energy, and creativity into a powerful symbolic representation.
                                Spots
                                limited, registration required. Free for Members.</p>
                            <span>Thu, Apr 17 | Vedic Yours Center</span>
                            <a href="" className="btn btn-primary">RSVP</a>
                        </div>
                    </div>
                    <div className="eventcontent mb-3">
                        <figure className="mx-auto"><img src="/images/landingpage/event-images5.jpg" alt=""/></figure>
                        <div className="eventtxt">
                            <h3>SSL Day for Students</h3>
                            <p>Our next SSL Day for students is coming up and open to middle and high school students
                                (registration in advance is required).</p>
                            <span>Thu, Apr 21 | Vedic Yours Center</span>
                            <a href="" className="btn btn-primary">RSVP</a>
                        </div>
                    </div>
                    <div className="eventcontent mb-3">
                        <figure className="mx-auto"><img src="/images/landingpage/event-images6.jpg" alt=""/></figure>
                        <div className="eventtxt">
                            <h3>Seminar: Dosha Series - Explore Pitta Dosha</h3>
                            <p>Our next SSL Day for students is coming up and open to middle and high school students
                                (registration in advance is required).</p>
                            <span>Thu, Apr 21 | Vedic Yours Center</span>
                            <a href="" className="btn btn-primary">RSVP</a>
                        </div>
                    </div>
                </div>
                <div className="tab-pane fade" id="recentEvent"></div>
            </div>

        </div>
    </div>
      <FooterSection />

      
    </>
  );
};
export default Events;
