'use client';
import React from 'react';
import '../../../LandingPage/public/css/style.css'

const DoctorTalks = () => {
  return (
    <div className="ayurvedicProducts doctorTalks">
      <div className="container">
        <div className="productsInner">
          <div className="row align-items-center py-1">
            <div className="col-md-7 col-lg-5">
              <figure className="mb-0">
                <img src="/images/landingpage/doctors-talk-img.jpg" alt="Talk to our Ayurveda Doctors" />
              </figure>
            </div>
            <div className="col-md-5 col-lg-7">
              <div className="section-heading text-start pb-0 px-md-2 px-lg-5">
                <img src="/images/landingpage/watermark.png" width="40" className="d-block" alt="Watermark" />
                <h2 className="text-white">Talk to our Ayurveda Doctors</h2>
                <p className="mb-md-4 mb-3 text-white">
                  Understand the root cause of your problem and get your personalized treatment today.
                </p>
                <a href="/Appointment/components/BookAppointment" className="btn  appointment px-3" style={{borderRadius:'3px',fontSize:'14px'}}>Book Appointment</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorTalks;
