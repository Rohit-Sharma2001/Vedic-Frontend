'use client';
import { useState, useEffect } from 'react';
import React from 'react';
import { useRouter } from 'next/navigation'; // For programmatic navigation
import { postApi } from 'services/api';
import { config } from 'services/config';

const FeatureProgram = () => {
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    bannerImage: null,
    title: '',
    descriptions: '',
    button_label: '',
    button_route: '',
  });

  const router = useRouter(); // Initialize useRouter for navigation

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    const data = { id: "676cf9be3f55d1765f106e81" };
    try {
      const endpoint = config.GetSecondBannerData;
      const response = await postApi(endpoint, data);
      // console.log(response);
      if (response.statusCode === 201) {
        setFormData({
          bannerImage: null,
          title: response.Banner?.title || '',
          descriptions: response.Banner?.descriptions || '',
          button_label: response.Banner?.button_label || '',
          button_route: response.Banner?.button_route || '',
        });
        setImagePreview(response.Banner?.file ? `${process.env.NEXT_PUBLIC_API_URL}/${response.Banner.file}` : null);
      }
    } catch (error) {
      console.error('Error fetching initial data:', error);
    }
  };

  const handleNavigation = (route) => {
    if (route) {
      router.push(route);
    }
  };

  return (
    <>
      <div className="featureProgram">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-7 col-lg-8">
              <figure className="mb-0">
                <img src={imagePreview} alt="Banner" />
              </figure>
            </div>
            <div className="col-md-5 col-lg-4">
              <div className="section-heading text-start pb-0">
                <img src="/images/landingpage/watermark.png" width={40} className="d-block" alt="Watermark" />
                <h2>{formData?.title}</h2>
                {/* <p></p> */}
                <p>{formData?.descriptions}</p>
                <button
                   onClick={() => handleNavigation(formData?.button_route)}
                  className="btn btn-primary"
                  type="button"
                >
                  {formData?.button_label}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FeatureProgram;
