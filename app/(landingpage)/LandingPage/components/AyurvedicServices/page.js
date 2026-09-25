'use client';
import { useState, useEffect } from 'react';
import React from 'react';
import { useRouter } from 'next/navigation';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { config } from 'services/config'; // Adjust the import path as needed
import { postApi } from 'services/api'; // Adjust the import path as needed

const AyurvedicServices = () => {
    const router = useRouter();
    const [dataItems, setDataItems] = useState([]);
        const [currentPage, setCurrentPage] = useState(1);
        const [pageSize, setPageSize] = useState(20);
        const [totalPages, setTotalPages] = useState(1);
        const [journeyTitle, setJourneyTitle] = useState("Begin Your Journey");
         const [journeySubtitle, setJourneySubtitle] = useState("Begin Your Journey");
    const sliderRef = React.useRef(null); // Ref for controlling the slider programmatically

    const settings = {
        dots: false,
        infinite: true,
        speed: 500,
        slidesToShow: 4,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 2000,
        arrows: false, // Disable default arrows
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
                const data = { page, pageSize, type: "ayurvedic_services" };
                const response = await postApi(endpoint, data);
                console.log(response);
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

                const fetchJourneyHeader = async () => {
              
              try {
                // You said "submit also call the api to get the two fields"
                // Using the same GET pattern you already have; adjust if needed.
                const endpoint = config.GetBalancingDiet;
                const payload = { type: "kapha" };
                const response = await postApi(endpoint, payload);
          
              
                // ✅ Adjust these lines to your real response shape:
                // Option A (common): fields at top-level
                const title = response?.data.data[0].service_title;
                const subtitle = response?.data.data[0].service_subtitle;
          
                // Option B (if backend returns under "data" or similar):
                // const title = response?.data?.begin_journey_title;
                // const subtitle = response?.data?.begin_journey_subtitle;
          
                setJourneyTitle(title || "Ayurvedic Services");
                setJourneySubtitle(subtitle || "Lorem Ipsum is simply dummy text");
              } catch (error) {
                console.error("Error fetching begin journey header:", error);
              } finally {
                
              }
            };
          

    return (
        <>
            <div className="ayurvedicServices">
                <div className="container position-relative">
                    {/* Section Heading */}
                    <div className="section-heading">
                        <img
                            src="/images/landingpage/watermark.png"
                            width={50}
                            className="d-block mx-auto"
                            alt="Watermark"
                        />
                        <h2>{journeyTitle ? journeyTitle :"Ayurvedic Services"}</h2>
                        <p>{journeySubtitle ? journeySubtitle :"Lorem Ipsum is simply dummy text"}</p>
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

                    {/* Slider */}
                    <Slider {...settings} ref={sliderRef} className="servicesSlide">
                    {dataItems.map((item, index) => (
                        <div key={index}>
                            <div  className="servicesBox">
                                <figure>
                                <img
                                            src={`${process.env.NEXT_PUBLIC_API_URL}/${item.file}`}
                                            alt={item.title}
                                        />
                                </figure>
                                <h3  onClick={() => handleNavigation(item.button_route)} style={{cursor:"pointer"}}>{item.title} </h3>
                            </div>
                        </div> 
                      ))}
                    
                    </Slider>
                </div>
            </div>

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

export default AyurvedicServices;
