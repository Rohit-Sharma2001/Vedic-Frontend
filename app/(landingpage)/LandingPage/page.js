"use client";
import React, { useEffect } from "react";
import "./public/css/style.css";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Header from "./components/Header/page";
import MainBanner from "./components/mainbanner/page";
import FeatureProgram from "./components/featureprogram/page";
import BeginYourJourney from "./components/YourJourney/page";
import AyurvedicServices from "./components/AyurvedicServices/page";
import UpcomingEvents from "./components/UpcomingEvents/page";
import ProductAndServices from "./components/ProductsAndServices/page";
import YogaClasses from "./components/YogaClasses/page";
import AboutAmita from "./components/MeetAmita/page";
import Resources from "./components/Resources/page";
import HealingIsBelieving from "./components/HealingBelieve/page";
import FooterSection from "./components/Footer/page";
import DesignCard from "./components/DesignCard/page";
const LandingPage = () => {
 const arrayheader = [
  { name: "Ayurveda", route: "/LandingPage/components/AyurvedaHealing" },
  { name: "Yoga ", route: "/YogaClasses/components/JoinYogaClasses" },

  {
    name: "Programs",
    route:"/Events",
    children: [
      { name: "Events", route: "/Events" },
      { name: "Courses", route: "/YogaClasses/Yoga-Courses" },

    ]
  },
   { name: "Shop", route: "/Shop" },
  {
    name: "Education",
    route:"/LandingPage/components/Blogs",
    children: [
      { name: "Blogs", route: "/LandingPage/components/Blogs" },

    ]
  },
  { name: "Amita Jain", route: "/LandingPage/components/AmitaHome" },
  
];


  return (
    <>
      <Header  arrayheader={arrayheader}/>
      <MainBanner />
      <DesignCard/>
      <FeatureProgram />
      <BeginYourJourney />
      <AyurvedicServices />
      <UpcomingEvents />
      <ProductAndServices />
      <YogaClasses />
      <AboutAmita />
      <Resources />
      <HealingIsBelieving />
      <FooterSection />
    </>
  );
};

export default LandingPage;
