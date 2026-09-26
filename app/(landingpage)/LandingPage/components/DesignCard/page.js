'use client';
import { useState, useEffect } from 'react';
import React from 'react';
import { useRouter } from 'next/navigation'; // For programmatic navigation
import { postApi } from 'services/api';
import { config } from 'services/config';

const DesignCard = () => {
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
      <div className="DesignCard">
        {/* <div className="container"> */}
          <div className="row align-items-center">
            <section class="yoga-actions">
              <div class="container">
                <div class="row g-0">
                  <div class="col-md-3">
                    <a class="action-card action-green" style={{textDecoration:"none", backgroundImage: `url(/images/landingpage/book-online.jpg)`}}>
                      <h5>Book<br />Online</h5>
                    </a>
                  </div>

                  <div class="col-md-3">
                    <a href="yoga-classes/yoga-class.html" class="action-card action-blue" style={{textDecoration:"none", backgroundImage: `url(/images/landingpage/view-classes.jpg)`}}>
                      <h5>View<br />Classes</h5>
                    </a>
                  </div>

                  <div class="col-md-3">
                    <a href="teacher-training.html" class="action-card action-pink" style={{textDecoration:"none", backgroundImage: `url(/images/landingpage/teacher-training-img.jpg)`}}>
                      <h5>Teacher <br /> Training</h5>
                    </a>
                  </div>

                  <div class="col-md-3">
                    <a href="cms-page/blog.html" class="action-card action-teal" style={{textDecoration:"none", backgroundImage: `url(/images/landingpage/yoga-block-img.jpg)`}}>
                      <h5>Yoga<br />Blog</h5>
                    </a>
                  </div>

                </div>
              </div>
            </section>
          </div>
        {/* </div> */}
      </div>
    </>
  );
};

export default DesignCard;
