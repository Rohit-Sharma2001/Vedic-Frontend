'use client';
import { useState, useEffect } from 'react';
import React from 'react';
import { useRouter } from 'next/navigation';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { config } from 'services/config'; 
import { postApi } from 'services/api'; 

const MainBanner = () => {
  const [dataItems, setDataItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    fade: true,
    autoplay: true,
    autoplaySpeed: 2000,
    arrows: false,
    cssEase: 'linear',
  };

  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage]);

  const fetchData = async (page) => {
    try {
      const endpoint = config.GetMainBannerData; 
      const data = { type : "main_banner" };
      const response = await postApi(endpoint, data);
      console.log(response);
      setDataItems(response.resultWithUrls || []);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleNavigation = (route) => {
    if (route) {
      router.push(route);
    }
  };

  return (
    <div className="mainBanner">
      <Slider {...settings} className="bannerSlide">
        {dataItems.map((item, index) => (
          <div key={item._id}>
            <div
              className="bannerImage"
              style={{ backgroundImage: `url(/images/landingpage/main-banner.JPG)` }}
            >
              <div className="bannerTxt">
                <span>{item.org_title}</span>
                <h1>{item.title}</h1>
                <p>{item.descriptions}</p>
                <button
                  onClick={() => handleNavigation(item.button_route)}
                  className="btn btn-primary"
                >
                  {item.button_label}
                </button>
              </div>
            </div>
          </div>
        ))}
      </Slider>
      <style jsx>{`

  /* remove unwanted dots  */
  :global(.bannerSlide .slick-dots li button:before) {
    content: '' !important;
  }
 
`}</style>
    </div>
  );
};

export default MainBanner;