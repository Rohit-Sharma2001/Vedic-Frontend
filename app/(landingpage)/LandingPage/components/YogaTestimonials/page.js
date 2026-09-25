'use client';
import { useState, useEffect } from 'react';
import React from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { config } from 'services/config'; // Adjust the import path as needed
import { postApi } from 'services/api'; // Adjust the import path as needed
import Loader from 'services/Loader/page';


const YogaTestimonialSection = () => {
    const [dataItems, setDataItems] = useState([]);
            const [currentPage, setCurrentPage] = useState(1);
            const [pageSize, setPageSize] = useState(20);
            const [totalPages, setTotalPages] = useState(1);
            const [loader,setLoader]= useState(false)
           
    const sliderRef = React.useRef(null); // Ref for controlling the slider programmatically

    const settings = {
        dots: false,
        infinite: true,
        speed: 500,
        slidesToShow: 2,
        slidesToScroll: 1,
        autoplay: false,
        autoplaySpeed: 3000,
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
                fetchData(currentPage);
            }, [currentPage]);
        
            const fetchData = async (page) => {
                try {
                    setLoader(true)
                    const endpoint = config.GetLandingPageCaraousalData; 
                    const data = { page, pageSize, type: "healing_is_believing" };
                    const response = await postApi(endpoint, data);
                    setLoader(false)
                    console.log(response);
                    setDataItems(response.resultWithUrls || []);
                    setTotalPages(response.totalPages || 1);
                } catch (error) {
                    console.error('Error fetching data:', error);
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
                        <h2>Healing is Believing</h2>
                        <p>Our inspiring Rogis share their stories.</p>
                        <a href="#" className="btn btn-primary px-4 mt-3">
                            View All
                        </a>
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
                            <div className="healingBx">
                                <figure>
                                    <img src={item.imageUrl}
                                            alt={item.title} />
                                    <a href="#" className="">
                                        <img src="/images/landingpage/video-icon.svg" alt="Video Icon" width={40} />
                                    </a>
                                    
                                </figure>
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

export default YogaTestimonialSection;
