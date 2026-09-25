"use client";
import React, { useEffect } from "react";
import YogaPageBanner from "../yogapagebanner/page";
import YogaVideoSection from "../YogaVideoSection/page";
import YogaTrainersSection from "../YogaTrainers/page";
import VedicYogaFestival from "../VedicYogaFestival/page";
import VedicYogaInstitute from "../VedicYogaInstitute/page";
import YogaTestimonialSection from "../YogaTestimonials/page";
import VedicYogaOnline from "../VedicYogaOnline/page";
import FooterSection from "../Footer/page";
import Header from "../Header/page";
import '../../public/css/style.css'
// import SubHeader from "../SubHeader/page";

const YogaLandingPage = () => {
    const arrayheader = [
      { name: "Join Classes", route: "/YogaClasses/components/JoinYogaClasses" },
      { name: "Techniques", route: "/YogaClasses/components/JoinYogaClasses" },
      { name: "Events", route: "/YogaClasses/components/Events" },
      { name: "Gallery", route: "/Shop" },
      { name: "Blogs", route: "/LandingPage/components/Blogs" },
      { name: "About", route: "/LandingPage/components/AmitajainLandingPage" },
    ];

  
    return (
      <>
        <Header  arrayheader={arrayheader} />
          {/* <SubHeader /> */}
       <YogaPageBanner/>
       <YogaVideoSection/>
       <YogaTrainersSection/>
       <VedicYogaFestival/>
       <VedicYogaInstitute/>
       <YogaTestimonialSection/>
       <VedicYogaOnline/>
       <FooterSection/>
      </>
    );
  };
  
  export default YogaLandingPage;