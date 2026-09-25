'use client';

import { useState, useEffect } from 'react';
import React from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { postApi, updateApiWithFile } from 'services/api';
import { config } from 'services/config';
import { useRouter } from 'next/navigation';

const AboutAmita = () => {
  const router = useRouter();
  const [errors, setErrors] = useState({});
  const [mediaPreview, setMediaPreview] = useState(null);
  const [isVideo, setIsVideo] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [formData, setFormData] = useState({
      bannerMedia: null,
      title: '',
      type: "meet_amita",
      descriptions: '',
      button_label: '',
      button_route: '',
  });
  const [talks, setTalks] = useState([]);

useEffect(() => {
  fetchInitialData();
  fetchTalks(); // <-- Add this
}, []);

const fetchTalks = async () => {
  try {
    const endpoint = config.GetTalks;
    const response = await postApi(endpoint, {});
    if (response?.resultWithUrls) {
      setTalks(response.resultWithUrls);
    }
  } catch (error) {
    console.error("Error fetching talks:", error);
  }
};


    const settings = {
        dots: false,
        infinite: true,
        arrows: false,
        speed: 500,
        slidesToShow: 4,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 2000,
        responsive: [
          {
            breakpoint: 991,
            settings: {
              slidesToShow: 2,
            },
          },
          {
            breakpoint: 767,
            settings: {
              slidesToShow: 1,
              dots: true,
              arrows: false,
            },
          },
        ],
      };

      useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        const data = { id: "6777673936409000f73b2335" };
        try {
            const endpoint = config.ViewLandingPageCaraousalDatabyid;
            const response = await postApi(endpoint, data);
            console.log(response);
            if (response.statusCode === 201) {
                console.log(response);
                setFormData({
                    bannerMedia: null,
                    title: response.result?.title || '',
                    descriptions: response.result?.descriptions || '',
                    button_label: response.result?.button_label || '',
                    button_route: response.result?.button_route || '',
                });
                setMediaPreview(
                    response.result?.file ? `${process.env.NEXT_PUBLIC_API_URL}/${response.result.file}` : null
                );
                setIsVideo(response.result?.file?.endsWith('.mp4')); // Assume video if file ends with '.mp4'
            }
        } catch (error) {
            console.error('Error fetching initial data:', error);
        }
    };
    const handleNavigation = (route) => {
      if (route) {
        router.push(route);
      }
    };
      return(<>
  <div className="amitajain">
  <div className="container">
    <div className="row mb-4">
      <div className="col-md-6">
        <div className="section-heading">
          <img
            src="/images/landingpage/watermark.png"
            width={50}
            className="d-block mx-auto"
            alt="Watermark"
          />
          
              
          <h2>Meet Amita Jain</h2>
          <p>Founder, Doctor of Ayurveda</p>
        </div>
        <div className="infoTxt">
          <p>
           {formData.title}
          </p>
          <p className="orangeTxt">
          {formData.descriptions}
            <br /> --Amita Jain
          </p>
          <a  onClick={() => handleNavigation(formData?.button_route)} className="btn btn-primary px-4">
          {formData.button_label}
          </a>
        </div>
      </div>
      <div className="col-md-6">
        <figure className="aboutPeople">
          {/* <img src="/images/landingpage/our-yoga.jpg" alt="About Amita Jain" /> */}
          {mediaPreview && (
                                                <div >
                                                    {isVideo ? (
                                                        <video
                                                            src={mediaPreview}
                                                            autoPlay
                                                            loop
                                                            muted
                                                            style={{
                                                                width: '100%',
                                                                objectFit: 'contain',
                                                            }}
                                                        />
                                                    ) : (
                                                        <img
                                                            src={mediaPreview}
                                                            alt="Banner Preview"
                                                            style={{
                                                                width: '100%',
                                                                maxHeight: '150px',
                                                                objectFit: 'contain',
                                                            }}
                                                        />
                                                    )}
                                                </div>
                                            )}
          {/* <a href="#" className="" tabIndex={0}>
            <img src="/images/landingpage/video-icon.svg" alt="Video Icon" width={40} />
          </a> */}
        </figure>
      </div>
    </div>
   <div className="videoSider">
  <Slider {...settings}>
   {talks.map((talk, index) => (
  <div key={talk._id || index}>
    <div className="videoBox">
      <figure>
        <a 
          href={talk.video_link} 
          target="_blank" 
          rel="noopener noreferrer"
        >
          <img
            src={`${process.env.NEXT_PUBLIC_API_URL}/${talk.image}`.replace(/\\/g, "/")}
            alt={talk.title}
            style={{ cursor: "pointer" }}
          />
        </a>
      </figure>
      <h3>{talk.title}</h3>
      <p dangerouslySetInnerHTML={{ __html: talk.description }} />
    </div>
  </div>
))}

  </Slider>
</div>

  </div>
</div>
  </>)
};

export default AboutAmita;
