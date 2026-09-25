'use client';
import React  from 'react';
import { useEffect } from 'react';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const YogaPageBanner = () => {
    
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
   

  const banners = [
    {
      imageUrl: '/images/landingpage/banner-image4.jpg',
      title: 'HATH YOGA',
      description: 'Explore your Weekly Schedule of Diverse Yoga Classes for All Levels',
    },
    {
      imageUrl: '/images/landingpage/banner-image4.jpg',
      title: 'HATH YOGA',
      description: 'Explore your Weekly Schedule of Diverse Yoga Classes for All Levels',
    },
  ];

  return (
    <div className="mainBanner mainBanner2">
      <Slider {...settings} className="bannerSlide">
        {banners.map((item, index) => (
          <div key={index}>
            <div
              className="bannerImage"
              style={{ backgroundImage: `url(${item.imageUrl})` }}
            >
              <div className="bannerTxt text-start">
                <span>Train with the very best</span>
                <h1>{item.title}</h1>
                <p className="text-white">{item.description}</p>
                <div className="d-flex gap-3">
                  <a href="" className="btn btn-orange hoverNone">View Classes</a>
                  <a href="" className="btn btn-orange hoverNone">See Schedule</a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default YogaPageBanner;
