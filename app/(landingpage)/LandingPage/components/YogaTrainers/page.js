'use client';
import React from 'react';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const trainersData = [
  {
    name: "Dummy Text",
    role: "Founder, Doctor of Ayurveda",
    image: "/images/landingpage/trainers-img1.png",
    background: "#FFFFFF",
  },
  {
    name: "Dummy Text",
    role: "AWP",
    image: "/images/landingpage/trainers-img2.png",
    background: "#D7DCEF",
  },
  {
    name: "Dummy Text",
    role: "AWP",
    image: "/images/landingpage/trainers-img3.png",
    background: "#F8F9FD",
  },
  {
    name: "Dummy Text",
    role: "CPH",
    image: "/images/landingpage/trainers-img4.png",
    background: "#D6ECE0",
  },
];

const YogaTrainersSection = () => {
  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 4,  // Adjust this based on your design
    slidesToScroll: 1,
    autoplay: false,
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

  return (
    <div className="ayurvedictrainers">
      <div className="container">
        <div className="section-heading">
          <img src="/images/landingpage/watermark.png" width="50" className="d-block mx-auto" alt="Watermark" />
          <h2>Meet Our Trainers</h2>
          <p>
            Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the
            industry standard dummy text ever since the 1500s.
          </p>
        </div>
        <Slider {...settings} className="trainersSlide">
          {trainersData.map((trainer, index) => (
            <div key={index}>
              <div className="trainersBox" style={{ background: trainer.background }}>
                <h3>{trainer.name}</h3>
                <p>{trainer.role}</p>
                <a href="#" className="btn btn-primary">Book a Session</a>
                <figure>
                  <img src={trainer.image} alt={trainer.name} />
                </figure>
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
};

export default YogaTrainersSection;
