'use client';
import React from 'react';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const oilProducts = [
  {
    image: "/images/landingpage/product-image1.jpg",
    category: "Rasa",
    title: "Cinnamon Powder",
    price: "$15.00",
  },
  {
    image: "/images/landingpage/product-image2.jpg",
    category: "Rasa",
    title: "Brahmi (Gotu Kola) Powder",
    price: "$15.00",
  },
  {
    image: "/images/landingpage/product-image3.jpg",
    category: "Rasa",
    title: "Haritaki Powder",
    price: "$15.00",
  },
  {
    image: "/images/landingpage/product-image3.jpg",
    category: "Rasa",
    title: "Haritaki Powder",
    price: "$15.00",
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

const AyurvedicOils = () => {
  return (
    <div className="ayurvedicProducts">
      <div className="container">
        <div className="productsInner">
          <div className="row align-items-center mb-4">
            <div className="col-md-7 col-lg-5">
              <figure className="mb-0">
                <img src="/images/landingpage/ayurvedic-oils.jpg" alt="Ayurvedic Oils" />
              </figure>
            </div>
            <div className="col-md-5 col-lg-7">
              <div className="section-heading text-start pb-0">
                <img src="/images/landingpage/watermark.png" width="40" className="d-block" alt="Watermark" />
                <h2>Ayurvedic Oils</h2>
                <p className="mb-lg-5 mb-md-2 mb-3">
                  Purchase your Ayurvedic cleanse kit here. Includes guidebook, herbs,
                  oils, recipes, and video links to support your at-home experience.
                </p>
                <a href="#" className="btn btn-primary">Shop Now</a>
              </div>
            </div>
          </div>

          {/* Product Slider */}
          <Slider {...sliderSettings} className="productSlide">
            {oilProducts.map((product, index) => (
              <div key={index}>
                <div className="journeyBox">
                  <figure className="mb-1">
                    <img src={product.image} alt={product.title} />
                  </figure>
                  <div className="contentproduct">
                    <span>{product.category}</span>
                    <div className="d-flex justify-content-between align-items-baseline">
                      <h3>{product.title}</h3>
                      <b>{product.price}</b>
                    </div>
                    <hr />
                    <a href="#" className="btn btn-primary">Add To Cart</a>
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

export default AyurvedicOils;
