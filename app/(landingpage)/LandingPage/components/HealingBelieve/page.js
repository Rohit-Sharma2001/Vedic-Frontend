'use client';
import { useState, useEffect } from 'react';
import React from 'react';
import Link from 'node_modules/next/link';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { config } from 'services/config'; // Adjust the import path as needed
import { postApi } from 'services/api'; // Adjust the import path as needed
import { useRouter } from 'next/navigation';

const HealingIsBelieving = () => {
    const router = useRouter();
    const [dataItems, setDataItems] = useState([]);
            const [currentPage, setCurrentPage] = useState(1);
            const [pageSize, setPageSize] = useState(20);
            const [totalPages, setTotalPages] = useState(1);
            // const [videoUrl, setVideoUrl] = useState(null);

            const [journeyTitle, setJourneyTitle] = useState("Resources");
             const [journeySubtitle, setJourneySubtitle] = useState("Lorem Ipsum is simply dummy text");

    const sliderRef = React.useRef(null); // Ref for controlling the slider programmatically

    const settings = {
        dots: false,
        infinite: true,
        speed: 500,
        slidesToShow: 3,
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
                },
            },
        ],
    };
            const fetchJourneyHeader = async () => {
          
          try {
            // You said "submit also call the api to get the two fields"
            // Using the same GET pattern you already have; adjust if needed.
            const endpoint = config.GetBalancingDiet;
            const payload = { type: "kapha" };
            const response = await postApi(endpoint, payload);
      
            // ✅ Adjust these lines to your real response shape:
            // Option A (common): fields at top-level
            const title = response?.data.data[0].testimonial_title;
            const subtitle = response?.data.data[0].testimonial_subtitle;
      
            // Option B (if backend returns under "data" or similar):
            // const title = response?.data?.begin_journey_title;
            // const subtitle = response?.data?.begin_journey_subtitle;
      
            setJourneyTitle(title || "Begin Your Journey");
            setJourneySubtitle(subtitle || "Begin Your Journey");
          } catch (error) {
            console.error("Error fetching begin journey header:", error);
          } finally {
            
          }
        };
    const goToNext = () => {
        sliderRef.current.slickNext();
    };

    const goToPrev = () => {
        sliderRef.current.slickPrev();
    };
     useEffect(() => {
        fetchJourneyHeader()
                fetchData(currentPage);
            }, [currentPage]);
        
            const fetchData = async (page) => {
                try {
                    const endpoint = config.GetLandingPageCaraousalData; 
                    const data = { page, pageSize, type: "healing_is_believing" };
                    const response = await postApi(endpoint, data);
                    console.log("healing is beliving",response);
                    setDataItems(response.resultWithUrls || []);
                    setTotalPages(response.totalPages || 1);
                } catch (error) {
                    console.error('Error fetching data:', error);
                }
            };
    
            const handleNavigation = (route) => {
                if (route) {
                  router.push(route);
                }
              };
    return (
        <>
            <div className="healingBelieve">
                <div className="container position-relative">
                    <div className="section-heading">
                        <img
                            src="/images/landingpage/watermark.png"
                            width={50}
                            className="d-block mx-auto"
                            alt="Watermark"
                        />
                        {/* <h2>Healing is Believing</h2>
                        <p>Our inspiring Rogis share their stories.</p> */}
                         <h2>{journeyTitle ? journeyTitle : "Healing is Believing"}</h2>
                        <p>{journeySubtitle ? journeySubtitle : "Our inspiring Rogis share their stories."}</p>
                        <Link href='/LandingPage/components/YogaClassesPage' className="btn btn-primary px-4 mt-3">
                            View All
                        </Link>
                    </div>

                    {/* Custom Navigation Buttons */}
                    <div className="custom-nav-buttons">
                        <button className="prev-button" onClick={goToPrev}>
                            <img src="/images/landingpage/prev-btn.svg" alt="Previous" />
                        </button>
                        <button className="next-button" onClick={goToNext}>
                            <img src="/images/landingpage/next-btn.svg" alt="Next" />
                        </button>
                    </div>

                    <Slider {...settings} ref={sliderRef} className="healingSlide">
                    {dataItems.map((item, index) => (
                        <div key={index}>
                            {/* onClick={() => handleNavigation(item.button_route)} style={{cursor:"pointer"}} */}
                            <div   className="healingBx" >
                            
  {item.file?.endsWith(".mp4") ? (
    <>
    <figure className="position-relative">
      <video
        src={`${process.env.NEXT_PUBLIC_API_URL}/${item.file}`}
        muted
        loop
        playsInline
        onError={(e) => console.error("Video failed to load:", e)}
      />
      <button
        className="video-play-btn"
        onClick={() => {
          const url = `${process.env.NEXT_PUBLIC_API_URL}/${item.file}`;
          window.open(url, "_blank"); // ✅ open video in new tab
        }}
      >
        <img src="/images/landingpage/video-icon.svg" alt="Play Video"  />
      </button>
      </figure>
    </>
  ) : (
    <figure className="position-relative" style={{ cursor: "pointer"}} onClick={() =>
    window.open(`${process.env.NEXT_PUBLIC_API_URL}/${item.file}`, "_blank")
  }>
    <img
  src={`${process.env.NEXT_PUBLIC_API_URL}/${item.file}`}
  alt={item.title}
  
  
/>
</figure>

  )}



                                <div className="healingTxt">
                                    <h3>{item.title}</h3>
                                    <p>{item.descriptions}
                                    </p>
                                </div>
                            </div>
                        </div>))}
                        
                    </Slider>
                </div>
            </div>

{/* {videoUrl && (
  <div className="video-modal" onClick={() => setVideoUrl(null)}>
    <div className="video-container" onClick={(e) => e.stopPropagation()}>
      <video
        src={videoUrl}
        controls
        autoPlay
        style={{ width: "100%", maxHeight: "80vh", borderRadius: "8px" }}
      />
    </div>
  </div>
)} */}


            {/* Styles */}
            <style jsx>{`
                .custom-nav-buttons {
                    position: absolute;
                    top: 20%; /* Position buttons vertically aligned with heading and subheading */
                    right: 20px; /* Keep the buttons on the right side of the screen */
                    display: flex;
                    flex-direction: row;
                    gap: 10px; /* Add space between the buttons */
                }

                .prev-button,
                .next-button {
                    background-color: transparent; /* No background for custom image buttons */
                    border: none;
                    cursor: pointer;
                    padding: 0;
                    width: 40px; /* Ensure buttons match image size */
                    height: 40px; /* Ensure buttons match image size */
                }

                .prev-button img,
                .next-button img {
                    width: 89%; /* Ensure the image fits inside the button */
                    height: 89%;
                }

                .prev-button img:hover,
                .next-button img:hover {
                    opacity: 0.8; /* Slight hover effect */
                }

                .section-heading {
                    position: relative;
                }
               
  .video-play-btn {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: transparent;
    border: none;
    cursor: pointer;
    z-index: 2; 
  }
   figure video {
   display: block;
   width: 100%;
   height: 200px;
   object-fit: cover;
   pointer-events: none; /* ✅ allow clicks to pass through to button */
 }
  .video-modal {
    position: fixed;
    top: 0; left: 0;
    width: 100%; height: 100%;
    background: rgba(0,0,0,0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
  }
  .video-container {
    position: relative;
    width: 80%;
    max-width: 800px;
  }



                /* Media query to hide buttons on smaller screens */
                @media (max-width: 767px) {
                    .custom-nav-buttons {
                        display: none; /* Hide navigation buttons on mobile screens */
                    }
                }
            `}</style>
        </>
    );
};

export default HealingIsBelieving;
