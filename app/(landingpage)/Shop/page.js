"use client";
import AyurvedicProductsShopPage from "./components/AyurvedicProductsShopPage/page";
import HeaderWithDropdown from "../LandingPage/components/HeaderWithDropdown/page";
// import SubHeader from "../LandingPage/components/SubHeader/page";
import AyurvedicSupplementsBanner from "./components/AyurvedicSupplementsBanner/page";
import DoctorTalks from "./components/DoctorTalks/page";
import ProgramsAdd from "./components/Programsadd/page";
import GallerySlider from "./components/GallerySlider/page";
import CleanseKits from "./components/CleanseKits/page";
import FooterSection from "../LandingPage/components/Footer/page";
import Head from 'next/head';
import "app/(landingpage)/LandingPage/public/css/style.css"
import { useEffect } from "react";
// import "../LandingPage/public/css/style.css";


const ShopLandingPage = () => {

  useEffect(()=>{
    window.scrollTo(0, 0);
  },[])
  return (
      <>
        <HeaderWithDropdown />
        {/* <SubHeader topPosition={80} /> */}
        <AyurvedicSupplementsBanner/>
        <AyurvedicProductsShopPage/>
        {/* <CleanseKits/> */}
        <DoctorTalks/>
        <GallerySlider/>
        <ProgramsAdd/>
       <FooterSection/>
      

       
      </>
    );
  };
  
  export default ShopLandingPage;