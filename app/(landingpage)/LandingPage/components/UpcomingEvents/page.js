'use client'
import React from 'react';
import Slider from 'react-slick';
import { useState, useEffect } from 'react';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { postApi } from 'services/api';
import { config } from 'services/config';
import Link from 'node_modules/next/link';
import { Pointer } from 'node_modules/highcharts/highcharts';
const UpcomingEvents = () => {
     const [events, setEvents] = useState([]);
      const [currentPage, setCurrentPage] = useState(1);
        const [pageSize] = useState(100);
        const [totalPages, setTotalPages] = useState(1);

            const [journeyTitle, setJourneyTitle] = useState("Resources");
             const [journeySubtitle, setJourneySubtitle] = useState("Lorem Ipsum is simply dummy text");

const formatEventDate = (value) => {
  if (!value) return "N/A";

  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "N/A";

  const parts = new Intl.DateTimeFormat("en-US", {
    month: "numeric",
    day: "numeric",
    year: "2-digit",
    weekday: "long",
  }).formatToParts(d);

  const pick = (type) => parts.find((p) => p.type === type)?.value ?? "";

  return ` ${pick("weekday")}, ${pick("month")}/${pick("day")}/${pick("year")}`.trim();
};

    const sliderRef = React.useRef(null); // Ref for controlling the slider programmatically
    

               const fetchJourneyHeader = async () => {
              
              try {
                // You said "submit also call the api to get the two fields"
                // Using the same GET pattern you already have; adjust if needed.
                const endpoint = config.GetBalancingDiet;
                const payload = { type: "kapha" };
                const response = await postApi(endpoint, payload);
          
                // ✅ Adjust these lines to your real response shape:
                // Option A (common): fields at top-level
                const title = response?.data.data[0].event_section_title;
                const subtitle = response?.data.data[0].event_section_subtitle;
          
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

       useEffect(() =>
         { 
            fetchJourneyHeader()
            
            fetchEvents(currentPage)
         }, [currentPage]);

    const fetchEvents = async (page) => {
  try {
    const endpoint = config.Allevents;
    const data = { page, pageSize };
    const response = await postApi(endpoint, data);

    console.log("events Details ", response.events);


   // Filter only active events
const activeEvents = (response.events || []).filter(
  (event) => event.status === 1
);

// NEW: Filter events happening in next 10 days
const today = new Date();
const next10Days = new Date();
next10Days.setDate(today.getDate() + 10);

const upcomingEvents = activeEvents.filter((event) => {
  const eventDate = new Date(event.date);
  return eventDate >= today && eventDate <= next10Days;
});

setEvents(upcomingEvents);
setTotalPages(response.totalPages || 1);

  } catch (error) {
    console.error("Error fetching events:", error);
  }
};
    const settings = {
        dots: false,
        infinite: false,
        speed: 500,
        arrows: false,
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

    return (
        <>
            <div className="BeginJourney">
                <div className="container position-relative">
                    {/* Section Heading */}
                    <div className="section-heading">
                        <img
                            src="/images/landingpage/watermark.png"
                            width={50}
                            className="d-block mx-auto"
                            alt="Watermark"
                        />
                        {/* <h2>Upcoming Events</h2>
                        <p>Lorem Ipsum is simply dummy text</p> */}
                         <h2>{journeyTitle ? journeyTitle : "Upcoming Events"}</h2>
                        <p>{journeySubtitle ? journeySubtitle : "Lorem Ipsum is simply dummy text"}</p>
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
                    {/* {console.log("all upcoming events ",events)} */}
                  <Slider {...settings} ref={sliderRef} className="eventsSlide">
  {events.length > 0 ? (
    events.map((event) => (
      <div key={event._id}  >
        <Link href={`/Events/Event-Details/${event._id}`} style={{cursor:'pointer' ,textDecoration:'none'}} >
         <div>
                            <div className="eventBox">
                               <p
  title={event?.eventname?.replace(/<[^>]+>/g, "") || ""}
>
  {event?.eventname
    ? event.eventname.replace(/<[^>]+>/g, "").slice(0, 25) +
      (event.eventname.replace(/<[^>]+>/g, "").length > 25 ? "..." : "")
    : ""}
</p>
                                <h3>
                                  {event?.event_type
    ? event.event_type.replace(/<[^>]+>/g, "").slice(0, 25) +
      (event.event_type.replace(/<[^>]+>/g, "").length > 25 ? "..." : " ")
    : ""}
                                </h3>
                                <span>
                                {formatEventDate(event?.date)}
 <br /> {event?.host_name}
                                </span>
                             


                            </div>
                        </div>
                        </Link>
      </div>
    ))
  ) : (
    <div>
      <p className="text-center">No upcoming events available.</p>
    </div>
  )}
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

export default UpcomingEvents;
