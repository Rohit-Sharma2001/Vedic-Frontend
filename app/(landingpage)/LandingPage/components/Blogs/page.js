"use client";
import React, { useEffect } from "react";
import Header from "../Header/page";
import BlogBanner from "../BlogBanner/page";
import FooterSection from "../Footer/page";
import '../../public/css/style.css';
import 'bootstrap/dist/css/bootstrap.min.css';
// import SubHeader from "../SubHeader/page";
const Blogs = () => {
  
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

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
        <Header arrayheader={arrayheader} />
          {/* <SubHeader /> */}
        <BlogBanner />
        <FooterSection />
      </>
    );
};

export default Blogs;
