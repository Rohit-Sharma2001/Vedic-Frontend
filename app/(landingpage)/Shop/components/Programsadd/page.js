'use client';
import React from 'react';
import Link from 'node_modules/next/link';
import '../../../LandingPage/public/css/style.css'

const ProgramsAdd = () => {
  
  return (
  <>
     <div className='row'>
      <div className='col-md-6'>
    <div className="ayurvedicProducts doctorTalks">
      <div className="container">
        <div className="productsInner">
          <div className="row align-items-center py-1">
            <div className="col-md-7 col-lg-5">
              <figure className="mb-0">
                <img src="/images/landingpage/program-banner.jpg" alt="Talk to our Ayurveda Doctors" />
              </figure>
            </div>
            <div className="col-md-5 col-lg-7">
              <div className="section-heading text-start pb-0 px-md-2 px-lg-5">
                <img src="/images/landingpage/watermark.png" width="40" className="d-block" alt="Watermark" />
                <h2 className="text-white">Discover Ayurvedic Wellness Programs</h2>
                <p className="mb-md-4 mb-3 text-white">
                   Experience holistic healing through customized Ayurvedic programs
              designed  
                </p>
                <Link href="/Appointment/components/BookAppointment" className="btn  appointment px-3" style={{borderRadius:'3px',fontSize:'14px'}}>Explore Programs</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
 
     <div className='col-md-6'>
    <div className="ayurvedicProducts doctorTalks">
      <div className="container">
        <div className="productsInner">
          <div className="row align-items-center py-1">
            <div className="col-md-7 col-lg-5">
              <figure className="mb-0">
                <img src="/images/landingpage/dosha-quiz.jpg" alt="Talk to our Ayurveda Doctors" />
              </figure>
            </div>
            <div className="col-md-5 col-lg-7">
              <div className="section-heading text-start pb-0 px-md-2 px-lg-5">
                <img src="/images/landingpage/watermark.png" width="40" className="d-block" alt="Watermark" />
                <h2 className="text-white">Find Your Unique Ayurvedic Dosha</h2>
                <p className="mb-md-4 mb-3 text-white">
                  Understand the root cause of your problem and get your personalized treatment today.
                </p>
                <Link href="/LandingPage/components/Quiz" className="btn  appointment px-3" style={{borderRadius:'3px',fontSize:'14px'}}>Take the Dosha Quiz</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
      </div>
  
  
</>);
};

export default ProgramsAdd;
