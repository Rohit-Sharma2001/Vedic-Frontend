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

const OurCleansePrograms = () => {
   
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
     <div className="innerBanner" style={{ backgroundImage: `url('/images/landingpage/program-banner.jpg')` }}>
        <div className="container">
            <div className="innerBannertxt">
                <h1>Our Cleanse Programs</h1>
                <p>Lorem Ipsum Simply dummy text here</p>
            </div>
        </div>
    </div>
    <div className="container">
        <div className="breadcrumbGroup mt-4 mb-0">
            <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item"><a href="book-appointment.html">Booking</a></li>
                <li className="breadcrumb-item active" aria-current="page">Cleanse Programs </li>
            </ol>
        </div>
    </div>
    <div className="programSection mt-4 mt-md-4">
        <div className="container">
            <div className="row px-md-1">
                <div className="col-md-6 col-lg-4 mb-3 px-md-2">
                    <div className="appointmentTxt h-100">
                        <div className="bg-light text-center p-3 mb-2">
                            <figure className="mx-auto"><img src="/images/landingpage/layer9.png" alt="" width="30"/></figure>
                            <h3 className="fs-8 mb-0">3-Day Cleanse</h3>
                        </div>

                        <ul className="progrmListing">
                            <li>Mild digestive issues</li>
                            <li>Struggling with regular elimination</li>
                            <li>Occasional sleep disruptions</li>
                            <li>Occasional afternoon slump in energy</li>
                        </ul>
                        <a href="cleanse-programs.html" className="btn btn-orange rounded-1 py-2">READ MORE</a>
                    </div>
                </div>
                <div className="col-md-6 col-lg-4 mb-3 px-md-2">
                    <div className="appointmentTxt h-100">
                        <div className="bg-light text-center p-3 mb-2">
                            <figure className="mx-auto"><img src="/images/landingpage/layer9.png" alt="" width="30"/></figure>
                            <h3 className="fs-8 mb-0">5-Day Cleanse</h3>
                        </div>

                        <ul className="progrmListing">
                            <li>Food cravings</li>
                            <li>Frequent colds and flu</li>
                            <li>Joint pains</li>
                            <li>Headaches</li>
                            <li>Brain fog, forgetfulness</li>
                        </ul>
                        <a href="" className="btn btn-orange rounded-1 py-2">READ MORE</a>
                    </div>
                </div>
                <div className="col-md-6 col-lg-4 mb-3 px-md-2">
                    <div className="appointmentTxt h-100">
                        <div className="bg-light text-center p-3 mb-2">
                            <figure className="mx-auto"><img src="/images/landingpage/layer9.png" alt="" width="30"/></figure>
                            <h3 className="fs-8 mb-0">15-Day Cleanse</h3>
                        </div>
                        <ul className="progrmListing">
                            <li>Allergies</li>
                            <li>Menstruation issues</li>
                            <li>Digestive issues</li>
                            <li>Disturbed sleep</li>
                            <li>Low energy</li>
                            <li>Low strength</li>
                        </ul>
                        <a href="" className="btn btn-orange rounded-1 py-2">READ MORE</a>
                    </div>
                </div>
                <div className="col-md-6 col-lg-4 mb-3 px-md-2">
                    <div className="appointmentTxt h-100">
                        <div className="bg-light text-center p-3 mb-2">
                            <figure className="mx-auto"><img src="/images/landingpage/layer9.png" alt="" width="30"/></figure>
                            <h3 className="fs-8 mb-0">30-Day Cleanse</h3>
                        </div>
                        <ul className="progrmListing">
                            <li>Weight loss</li>
                            <li>Chronic fatigue</li>
                            <li>Fogginess in the mind</li>
                            <li>Hormonal imbalances</li>
                            <li>Chronic inflammation</li>
                            <li>Anxiety, depression</li>
                            <li>Autoimmune disorders</li>
                            <li>Pre-pregnancy preparation</li>
                        </ul>
                        <a href="" className="btn btn-orange rounded-1 py-2">READ MORE</a>
                    </div>
                </div>
                <div className="col-md-6 col-lg-4 mb-3 px-md-2">
                    <div className="appointmentTxt h-100">
                        <div className="bg-light text-center p-3 mb-2">
                            <figure className="mx-auto"><img src="/images/landingpage/layer9.png" alt="" width="30"/></figure>
                            <h3 className="fs-8 mb-0">30-Day Seasonal Group Cleanse</h3>
                        </div>
                        <p>Follow ups are an important part of your healing protocol. Your practitioner will make
                            adjustments to your protocol and may take a second exam to observe progress. Be sure to
                            select your Practitioner name during booking. 25 min</p>
                        <a href="" className="btn btn-orange rounded-1 py-2">READ MORE</a>
                    </div>
                </div>
                <div className="col-md-6 col-lg-4 mb-3 px-md-2">
                    <div className="appointmentTxt h-100">
                        <div className="bg-light text-center p-3 mb-2">
                            <figure className="mx-auto"><img src="/images/landingpage/layer9.png" alt="" width="30"/></figure>
                            <h3 className="fs-8 mb-0">Candida Cleanse</h3>
                        </div>
                        <p>Follow ups are an important part of your healing protocol. Your practitioner will make
                            adjustments to your protocol and may take a second exam to observe progress. Be sure to
                            select your Practitioner name during booking. 25 min</p>
                        <a href="" className="btn btn-orange rounded-1 py-2">BOOK CONSULT</a>
                    </div>
                </div>
                <div className="col-md-6 col-lg-4 mb-3 px-md-2">
                    <div className="appointmentTxt h-100">
                        <div className="bg-light text-center p-3 mb-2">
                            <figure className="mx-auto"><img src="/images/landingpage/layer9.png" alt="" width="30"/></figure>
                            <h3 className="fs-8 mb-0">Parasite Cleanse</h3>
                        </div>
                        <p>Our highly experienced Ayurvedic Vaidya, Mr. Om Sanduja, helps people with all kinds of
                            conditions by bringing the doshas back to their balanced state. Visit includes complete
                            Ayurvedic dosha assessment and protocol for diet, herbals, lifestyle, daily routine and
                            more. Online only. 60 min</p>
                        <a href="" className="btn btn-orange rounded-1 py-2">BOOK CONSULT</a>
                    </div>
                </div>
                <div className="col-md-6 col-lg-4 mb-3 px-md-2">
                    <div className="appointmentTxt h-100">
                        <div className="bg-light text-center p-3 mb-2">
                            <figure className="mx-auto"><img src="/images/landingpage/layer9.png" alt="" width="30"/></figure>
                            <h3 className="fs-8 mb-0">Weight Loss Cleanse</h3>
                        </div>
                        <p>Follow ups are an important part of your healing protocol. Your practitioner will make
                            adjustments to your protocol and may take a second exam to observe progress. Be sure to
                            select your Practitioner name during booking. 25 min</p>
                        <a href="" className="btn btn-orange rounded-1 py-2">BOOK CONSULT</a>
                    </div>
                </div>
                <div className="col-md-6 col-lg-4 mb-3 px-md-2">
                    <div className="appointmentTxt h-100">
                        <div className="bg-light text-center p-3 mb-2">
                            <figure className="mx-auto"><img src="/images/landingpage/layer9.png" alt="" width="30"/></figure>
                            <h3 className="fs-8 mb-0">Emotional Cleanse</h3>
                        </div>
                        <p>A custom made program to help you cleanse mind by purifying your internal body. Your
                            practitioner will provide tools such as yoga, pranayama, meditation, & pranic healing as
                            part of the cleansing process, in addition to diet, herbs and purgation. Usually 14 days.
                        </p>
                        <a href="" className="btn btn-orange rounded-1 py-2">BOOK CONSULT</a>
                    </div>
                </div>

            </div>
        </div>
    </div>
      <FooterSection />

      
    </>
  );
};
export default OurCleansePrograms;
