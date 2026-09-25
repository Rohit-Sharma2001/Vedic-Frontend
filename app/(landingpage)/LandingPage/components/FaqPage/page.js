"use client";
import React, { useEffect } from "react";
import Header from "../Header/page";
// import SubHeader from "../SubHeader/page";
import FAQBanner from "../FaqPageBanner/page";
import FAQSection from "../FaqPageSection/page";
import FooterSection from "../Footer/page";
import '../../public/css/style.css'
import 'bootstrap/dist/css/bootstrap.min.css';

const FaqPage = () => {
   
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

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
        <Header arrayheader={arrayheader} />
           {/* <SubHeader /> */}
        <FAQBanner />
        <FAQSection />
        <FooterSection />
      </>
    );
};

export default FaqPage;
