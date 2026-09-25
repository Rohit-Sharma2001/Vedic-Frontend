"use client";

import { useState, useEffect } from "react";
import React from "react";
import { postApi } from "services/api";
import { config } from "services/config";
import Link from "next/link";
import { checkIsOwner } from "services/config";
import { useRouter } from "next/navigation";

const FAQBanner = () => {
   const router = useRouter();
   const [isOwner, setIsOwner] = useState(false);
  const [bannerdata, setBannerData] = useState({});
  const [imagePreview, setImagePreview] = useState(null);

   const handleEditClick = () => {
    // router.push("/admin/Faqs/FaqsBanner");
    window.location.href = "/admin/Faqs/FaqsBanner";
  };
useEffect(() => {
  setIsOwner(checkIsOwner());
}, []);
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const data = { id: "67bede8693dc50687749a3df" };
      const endpoint = config.GetFaqContent;
      const response = await postApi(endpoint, data);
      console.log(response);

      if (response.statusCode === 201) {
        let imageUrl = response.faqManagementData.file
          ? `${process.env.NEXT_PUBLIC_API_URL}/${response.faqManagementData.file}`
          : null;

        // Normalize backslashes
        if (imageUrl) {
          imageUrl = imageUrl.replace(/\\/g, "/");
        }

        setBannerData(response.faqManagementData);
        setImagePreview(imageUrl);
      }
    } catch (error) {
      console.error("Error fetching initial data:", error);
    }
  };

  return (
    <div
      className="innerBanner"
      style={{
        backgroundImage: `url(${imagePreview})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="container">
        <div className="innerBannertxt">
          <h1>{bannerdata.heading}</h1>
          <p>{bannerdata.subheading}</p>

        {bannerdata?.buttonRoute && (
  <Link href={bannerdata.buttonRoute}>
    <button className="btn btn-primary">{bannerdata.buttonsLabel}</button>
  </Link>
)}

{/* {isOwner && (
  <button
              className="btn btn-primary"
              style={{ marginLeft: "3px" }}
              onClick={handleEditClick}
            >
              <b>+</b> Edit Details
            </button>
)} */}

        </div>
      </div>
    </div>
  );
};

export default FAQBanner;
