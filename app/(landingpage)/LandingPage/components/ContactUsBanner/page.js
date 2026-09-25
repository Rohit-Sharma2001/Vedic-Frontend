'use client';
import React from 'react';
import { useEffect,useState } from 'react';
import { postApi } from 'services/api';
import { config } from 'services/config';


 
const ContactBanner = () => {
  const [bannerdata, setBannerData] = useState({});
  const [backgroundimage ,setBackgroundImage] = useState(null)
  useEffect(() => {
    fetchInitialData();
}, []);

const fetchInitialData = async () => {
  try {
      const data = { id: "67bdad5cf25817c9eb8d0600" };
      const endpoint = config.ViewContactPageContent;
      const response = await postApi(endpoint, data);

      if (response.statusCode === 201) {
          let imageUrl = response.contactManagementData.file
              ? `${process.env.NEXT_PUBLIC_API_URL}/${response.contactManagementData.file}`
              : null;

          // Replace backslashes with forward slashes
          if (imageUrl) {
              imageUrl = imageUrl.replace(/\\/g, "/");
          }

          setBannerData(response.contactManagementData);
          setBackgroundImage(imageUrl);
      }
  } catch (error) {
      console.error('Error fetching initial data:', error);
  }
};

console.log(backgroundimage)
  return (
    <div className="innerBanner"
    //  style={{ backgroundImage: 'url(/images/landingpage/contact-banner.jpg)' }}>
      style={{ 
    backgroundImage: `url(${backgroundimage})`, 
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  }}
>
      <div className="container">
        <div className="innerBannertxt">
          <h1>{bannerdata?.heading}</h1>
          <p>{bannerdata?.text}</p>
        </div>
      </div>
    </div>
  );
};

export default ContactBanner;
