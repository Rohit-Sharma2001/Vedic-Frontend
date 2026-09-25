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

const CleansePrograms = () => {
   
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
    <section className="cleansPrograme">
        <div className="container-fluid">
            <div className="breadcrumbGroup my-4 mb-md-4">
                <ol className="breadcrumb mb-0">
                    <li className="breadcrumb-item"><a href="book-appointment.html">Booking Page </a></li>
                    <li className="breadcrumb-item"><a href="our-cleanse-programs.html">cleanse programs </a></li>
                    <li className="breadcrumb-item active" aria-current="page">Cleanse Programs Details</li>
                </ol>
            </div>
            <div className="row">
                <div className="col-lg-4 pe-md-3 mb-3">
                    <div className="studioMembership ">
                        <figure className="studioImg">
                            <img src="/images/landingpage/full-cleans.png" alt=""/>
                        </figure>
                        <span className="mb-1 d-block">15-Day Ayurvedic Full Cleanse </span>
                        <p className="fs-9">5 Days Preparation, 5 Days Cleanse, And 5 Days Post-Cleanse Phase</p>
                        <span
                            className="d-flex align-items-center gap-2 fw-medium fs-9 text-secondary">Price:<b>$15.00</b></span>
                        <div className="qtyGroup mb-3 d-flex align-items-center gap-3 mb-2 mb-md-4">
                            <strong className="m-0 fw-medium fs-9 text-secondary">Quantity:</strong>
                            <div className="quantity">
                                <button className="minus" aria-label="Decrease">−</button>
                                <input type="number" className="input-box" value="1" min="1" max="10"/>
                                <button className="plus" aria-label="Increase">+</button>
                            </div>
                        </div>
                        <div className="priceOptn">
                            <div className="mb-4">
                                <button type="button" className="btn btn-primary w-100 mb-2">Add To Cart</button>
                                <button type="button" className="btn btn-orange w-100">Checkout</button>
                            </div>
                            <ul className="d-flex flex-wrap gap-3 justify-content-center">
                                <li><a href=""><img src="/images/landingpage/facebook-round-icon.svg" width="32"/></a></li>
                                <li><a href=""><img src="/images/landingpage/wattsapp-round-icon.svg" width="32"/></a></li>
                                <li><a href=""><img src="/images/landingpage/twitter-round-icon.svg" width="32"/></a></li>
                                <li><a href=""><img src="/images/landingpage/male-round-icon.svg" width="32"/></a></li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="col-lg-8 ps-md-3 mb-3">
                    <div className="rightsPart">
                        <div className="">
                            <strong className="mb-2 d-block">Signs that you need this cleanse</strong>
                            <ul className="overviewUl mb-4">
                                <li>
                                    <img src="/images/landingpage/accordian-icon.svg" alt="" width="12"/>
                                    <p className="m-0">Allergies</p>
                                </li>
                                <li>
                                    <img src="/images/landingpage/accordian-icon.svg" alt="" width="12"/>
                                    <p className="m-0">Menstruation issues</p>
                                </li>
                                <li>
                                    <img src="/images/landingpage/accordian-icon.svg" alt="" width="12"/>
                                    <p className="m-0">General doshic and seasonal imbalance</p>
                                </li>
                                <li>
                                    <img src="/images/landingpage/accordian-icon.svg" alt="" width="12"/>
                                    <p className="m-0">Digestive issues</p>
                                </li>
                                <li>
                                    <img src="/images/landingpage/accordian-icon.svg" alt="" width="12"/>
                                    <p className="m-0">Disturbed sleep</p>
                                </li>
                                <li>
                                    <img src="/images/landingpage/accordian-icon.svg" alt="" width="12"/>
                                    <p className="m-0">Low energy level</p>
                                </li>
                                <li>
                                    <img src="/images/landingpage/accordian-icon.svg" alt="" width="12"/>
                                    <p className="m-0">Low bala (strength)</p>
                                </li>

                            </ul>
                            <strong className="mb-2 d-block">Your Program includes:</strong>
                            <ul className="overviewUl mb-4">
                                <li>
                                    <img src="/images/landingpage/accordian-icon.svg" alt="" width="12"/>
                                    <p className="m-0">Access to online portal for all materials, videos, links and
                                        questions</p>
                                </li>
                                <li>
                                    <img src="/images/landingpage/accordian-icon.svg" alt="" width="12"/>
                                    <p className="m-0">Expert Ayurvedic Guide provided to you during the cleanse phase</p>
                                </li>
                                <li>
                                    <img src="/images/landingpage/accordian-icon.svg" alt="" width="12"/>
                                    <p className="m-0">Instruction booklet</p>
                                </li>
                                <li>
                                    <img src="/images/landingpage/accordian-icon.svg" alt="" width="12"/>
                                    <p className="m-0">Cleanse Kit (see below)</p>
                                </li>
                                <li>
                                    <img src="/images/landingpage/accordian-icon.svg" alt="" width="12"/>
                                    <p className="m-0">Meal menu for each day and meal recipes</p>
                                </li>
                                <li>
                                    <img src="/images/landingpage/accordian-icon.svg" alt="" width="12"/>
                                    <p className="m-0">Yoga videos - asanas for cleansing</p>
                                </li>
                                <li>
                                    <img src="/images/landingpage/accordian-icon.svg" alt="" width="12"/>
                                    <p className="m-0">Pranayama videos - breathing techniques for cleansing</p>
                                </li>
                                <li>
                                    <img src="/images/landingpage/accordian-icon.svg" alt="" width="12"/>
                                    <p className="m-0">Yoga Nidra audio for deep relaxation and sleep</p>
                                </li>
                                <li>
                                    <img src="/images/landingpage/accordian-icon.svg" alt="" width="12"/>
                                    <p className="m-0">Abhyanga at home - instructional video</p>
                                </li>
                                <li>
                                    <img src="/images/landingpage/accordian-icon.svg" alt="" width="12"/>
                                    <p className="m-0">Kitchari and ghee preparation - online instructional videos</p>
                                </li>
                                <li>
                                    <img src="/images/landingpage/accordian-icon.svg" alt="" width="12"/>
                                    <p className="m-0">Nasyam at home - instructional video</p>
                                </li>
                                <li>
                                    <img src="/images/landingpage/accordian-icon.svg" alt="" width="12"/>
                                    <p className="m-0">10% discount on all panchakarma therapies at our center during the
                                        15-day period</p>
                                </li>
                            </ul>
                            <strong className="mb-2 d-block">Your Program includes:</strong>
                            <ul className="overviewUl mb-4">
                                <li>
                                    <img src="/images/landingpage/accordian-icon.svg" alt="" width="12"/>
                                    <p className="m-0">Cleanse Herbs</p>
                                </li>
                                <li>
                                    <img src="/images/landingpage/accordian-icon.svg" alt="" width="12"/>
                                    <p className="m-0">Abhyanga oil</p>
                                </li>
                                <li>
                                    <img src="/images/landingpage/accordian-icon.svg" alt="" width="12"/>
                                    <p className="m-0">Nasya oil</p>
                                </li>
                                <li>
                                    <img src="/images/landingpage/accordian-icon.svg" alt="" width="12"/>
                                    <p className="m-0">Detox Teas</p>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    </section>
      <FooterSection />

      
    </>
  );
};
export default CleansePrograms;
