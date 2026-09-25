'use client';
import React from 'react';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useState, useEffect } from "react";
import { postApi } from "services/api";
import { config } from "services/config";


const galleryImages = [
  "/images/landingpage/gallery-img1.jpg",
  "/images/landingpage/slider-img-2.jpg",
  "/images/landingpage/gallery-img1.jpg",
  "/images/landingpage/slider-img-2.jpg",
  "/images/landingpage/gallery-img1.jpg",
  "/images/landingpage/slider-img-2.jpg",
];

const sliderSettings = {
  dots: false,
  arrows: false,
  infinite: true,
  speed: 500,
  slidesToShow: 4,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 2000,
  responsive: [
    {
      breakpoint: 1024,
      settings: {
        slidesToShow: 2,
        slidesToScroll: 1,
      },
    },
    {
      breakpoint: 768,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1,
      },
    },
  ],
};

const GallerySlider = () => {
  const [galleryImages, setGalleryImages] = useState([]);

useEffect(() => {
  fetchGalleryImages();
}, []);

const fetchGalleryImages = async () => {
  try {
    const data = { dropdown_type: "gallery_images", page: 1, pageSize: 50 };
    const response = await postApi(config.category, data);
    setGalleryImages(response.result || []);
  } catch (error) {
    console.error("Error fetching gallery images:", error);
  }
};

  return (
    <div className="brandInner brandsTrust pt-1">
      <div className="section-heading pb-2">
        <img src="/images/landingpage/watermark.png" width="50" className="d-block mx-auto" alt="Watermark" />
        <h2>The Best in Quality, <br></br>Purity and Authenticity</h2>
      </div>
      <div className="container">
        <Slider {...sliderSettings} className="brandSlide">
         {galleryImages.map((img, index) => (
  <div key={img._id || index}>
    <div className="brandBox">
      <figure className="m-0">
        <img
          src={`${process.env.NEXT_PUBLIC_API_URL}/${img.file}`}
          alt={`Gallery Image ${index + 1}`}
        />
      </figure>
      <span className='healingTxt'>
      <p >{img?.name}</p>
      </span>
    </div>
  </div>
))}

        </Slider>
      </div>
    </div>
  );
};

export default GallerySlider;
