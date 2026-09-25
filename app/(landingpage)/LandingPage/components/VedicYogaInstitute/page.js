'use client';
import React from 'react';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { getApi } from 'services/api';

const VedicYogaInstitute = () => {
  const sliderSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 2,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    responsive: [
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
    <div className="container">
      <div className="section-heading yogaInstitue pb-0">
        <img src="/images/landingpage/watermark.png" width="50" className="d-block mx-auto" alt="Watermark" />
        <h2 className="mb-3">What is the Vedic Yoga Institute?</h2>
        <p className="mb-4">The Vedic Yoga Institute is a globally recognized organization dedicated to authentic Yoga
                and Wellbeing education. We are highly regarded for offering one of the best Yoga Teacher Training
                programs in India, USA, Canada, Europe and worldwide. Our programs are deeply rooted in the origins of
                Yoga, ensuring an authentic and enriching experience. </p>
            <p className="mb-4">Led by Founder Amita Jain, she is been teaching and lecturing on Yoga and Ayurveda for 20+
                years. </p>
            <p className="mb-4">Vedic Yoga Institute is a unique east-meets-west global community and teaching faculty,
                dedicated to sharing authentic Yoga wellbeing. </p>
            <p className="mb-4">The first registered Yoga Alliance School of Rishikesh, and the training source of many
                known and respected Yoga Teachers globally. We are proud to have trained over 7000+ teachers and many
                more dedicated Yoga practitioners over 25 years, with the nurturing support of Amita Jain </p>
      </div>

      <div className="ourMission">
        <div className="row mx-0 align-items-center">
          <div className="col-md-6 px-0 text-center mb-3 mb-md-0">
            <figure className="mb-0 p-3">
              <img src="/images/landingpage/amita-jain.jpg" alt="Amita Jain" />
            </figure>
          </div>
          <div className="col-md-6 px-md-5">
            <div className="section-heading">
              <img src="/images/landingpage/watermark.png" width="50" className="d-block mx-auto" alt="Watermark" />
              <h2 className="text-white mb-3">Amita Jain Says...</h2>
              <p className="text-white mb-4">Much of the ancient knowledge and practice of Yoga has been lost in our
                        world today. </p>
                    <p className="text-white">My mission with Vedic Yoga is to spread the authentic teachings of Hatha Yoga
                        helping people find optimal health, a calm mind, and a way to get centered in a hectic world.
                    </p>
            </div>
          </div>
        </div>
      </div>

      <div className="slidergallery">
        <div className="container">
          <Slider {...sliderSettings} className="galleryinerSlide">
            <div className="healingBx" style={{ padding: '10px' }}>
              <figure className="m-0">
                <img src="/images/landingpage/gallery.jpg" alt="Gallery" />
              </figure>
            </div>
            <div className="healingBx" style={{ padding: '10px' }}>
              <figure className="m-0">
                <img src="/images/landingpage/group-photo.jpg" alt="Group Photo" />
              </figure>
            </div>
            <div className="healingBx" style={{ padding: '10px' }}>
              <figure className="m-0">
                <img src="/images/landingpage/gallery.jpg" alt="Gallery" />
              </figure>
            </div>
            <div className="healingBx" style={{ padding: '10px' }}>
              <figure className="m-0">
                <img src="/images/landingpage/group-photo.jpg" alt="Group Photo" />
              </figure>
            </div>
          </Slider>
        </div>
      </div>

      <div className="ourMission">
        <div className="row mx-0 align-items-center flex-row-reverse">
          <div className="col-md-6 p-3 mb-md-0 mb-3 text-center">
            <figure className="mb-0">
              <img src="/images/landingpage/our-mission.jpg" alt="Our Mission" />
            </figure>
          </div>
          <div className="col-md-6 px-md-5">
            <div className="section-heading">
              <img src="/images/landingpage/watermark.png" width="50" className="d-block mx-auto" alt="Watermark" />
              <h2 className="text-white mb-3">OUR MISSION</h2>
              <p className="text-white mb-4">Our mission is to help people experience Oneness and wellbeing by sharing
                        carefully reserved ancient Yoga wisdom and techniques.</p>
                    <p className="text-white"> We want as many people as possible to experience their true nature and
                        highest potential, and know that wellbeing is their birthright.”</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VedicYogaInstitute;
