'use client';
import React from 'react';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const teaProducts = [
  {
    image: "/images/landingpage/medicinal-image1.jpg",
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

const MedicinalTeas = () => {
  return (
    <div className="ayurvedicProducts">
      <div className="container">
        <div className="productsInner">
          <div className="row align-items-center mb-4">
            <div className="col-md-5 col-lg-7">
              <div className="section-heading text-start pb-0">
                <img src="/images/landingpage/watermark.png" width="40" className="d-block" alt="Watermark" />
                <h2>Medicinal Teas</h2>
                <p className="mb-3">
                  Our teas are formulated with organic, raw, unprocessed, uncrushed herbs to heal a variety of conditions.
                  Mild, yet very effective and safe for most everyone, these rare teas will not be found elsewhere.
                  We hand craft them just for our clients.
                </p>
                <a href="#" className="btn btn-primary mb-3">Shop Now</a>
              </div>
            </div>
            <div className="col-md-7 col-lg-5">
              <figure className="mb-0">
                <img src="/images/landingpage/medicinal-teas.jpg" alt="Medicinal Teas" />
              </figure>
            </div>
          </div>

          {/* Product Slider */}
          <Slider {...sliderSettings} className="productSlide">
            {teaProducts.map((product, index) => (
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

export default MedicinalTeas;
