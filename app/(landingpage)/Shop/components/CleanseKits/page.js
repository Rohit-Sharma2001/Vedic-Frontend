'use client';
import React from 'react';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const cleanseKits = [
  {
    image: "/images/landingpage/cleansekits-image1.jpg",
    title: "3-Day Cleanse",
    cartLabel: "Add To Cart",
    detailsLabel: "More Details",
  },
  {
    image: "/images/landingpage/cleansekits-image2.jpg",
    title: "Candida Cleanse",
    cartLabel: "Book Consult",
    detailsLabel: "More Details",
  },
  {
    image: "/images/landingpage/cleansekits-image1.jpg",
    title: "30-Day Seasonal Group Cleanse",
    cartLabel: "Add To Cart",
    detailsLabel: "More Details",
  },
  {
    image: "/images/landingpage/cleansekits-image2.jpg",
    title: "Candida Cleanse",
    cartLabel: "Book Consult",
    detailsLabel: "More Details",
  },
];

const sliderSettings = {
  dots: false,
  infinite: true,
  speed: 500,
  slidesToShow: 4,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 3000,
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

const CleanseKits = () => {
  return (
    <div className="ayurvedicProducts">
      <div className="container">
        <div className="productsInner">
          <div className="row align-items-center mb-5">
            <div className="col-md-5 col-lg-7">
              <div className="section-heading text-start pb-0">
                <img src="/images/landingpage/watermark.png" width="40" className="d-block" alt="Watermark" />
                <h2>Cleanse Kits</h2>
                <p className="mb-md-2 mb-lg-5 mb-3">
                  Purchase your Ayurvedic cleanse kit here. Includes guidebook, herbs, oils, recipes, and video links 
                  to support your at-home experience.
                </p>
                <a href="#" className="btn btn-primary">Shop Now</a>
              </div>
            </div>
            <div className="col-md-7 col-lg-5">
              <figure className="mb-0">
                <img src="/images/landingpage/medicinal-teas.jpg" alt="Cleanse Kits" />
              </figure>
            </div>
          </div>

          {/* Product Slider */}
          <Slider {...sliderSettings} className="cleansekitSlide">
            {cleanseKits.map((kit, index) => (
              <div key={index}>
                <div className="journeyBox">
                  <figure className="mb-1">
                    <img src={kit.image} alt={kit.title} />
                  </figure>
                  <div className="contentproduct">
                    <div className="d-flex justify-content-between align-items-baseline">
                      <h3>{kit.title}</h3>
                    </div>
                    <hr />
                    <div className="d-flex align-items-center gap-2">
                      <a href="#" className="btn btn-primary fs-9">{kit.cartLabel}</a>
                      <a href="#" className="btn btn-details fs-9">{kit.detailsLabel}</a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </div>
      </div>
    </div>
  );
};

export default CleanseKits;
