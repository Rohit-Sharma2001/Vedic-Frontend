'use client';
import React from 'react';

const VedicYogaFestival = () => {
  return (
    <div className="amitajain py-0">
      <div className="row mb-4 mx-0 align-items-center">
        {/* Left Section */}
        <div className="col-md-6 p-md-5 p-3">
          <div className="section-heading pb-4 text-start mw-100">
            <img src="/images/landingpage/watermark.png" width="50" className="d-block" alt="Watermark" />
            <h2>Vedic Yoga Festival</h2>
            <p>Lorem Ipsum Simply Dummy text</p>
          </div>
          <div className="infoTxt bg-image">
            <p className="orangeTxt mb-2">March 1st - March 9th, 2025</p>
            <p>
              Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been
              the industry standard dummy text ever since the 1500s.
            </p>
            <a href="#" className="btn btn-primary px-4 mt-3">
              Book now | Save up to $100
            </a>
          </div>
        </div>

        {/* Right Section */}
        <div className="col-md-6 px-0">
          <figure className="mb-0">
            <img src="/images/landingpage/vedic-yoga-festival.jpg" alt="Vedic Yoga Festival" />
          </figure>
        </div>
      </div>
    </div>
  );
};

export default VedicYogaFestival;
