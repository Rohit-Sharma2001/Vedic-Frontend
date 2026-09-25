'use client';
import { useState, useEffect } from 'react';
import React from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { config } from 'services/config'; // Adjust the import path as needed
import { postApi } from 'services/api'; // Adjust the import path as needed
import { useRouter } from 'next/navigation';
const Resources = () => {
  const router = useRouter();
  const [journeyTitle, setJourneyTitle] = useState("Resources");
  const [journeySubtitle, setJourneySubtitle] = useState("Lorem Ipsum is simply dummy text");
  const [dataItems, setDataItems] = useState([]);
              const [currentPage, setCurrentPage] = useState(1);
              const [pageSize, setPageSize] = useState(20);
              const [totalPages, setTotalPages] = useState(1);
      
    const settings = {
        dots: false,
        infinite: true,
        speed: 500,
        slidesToShow: 4,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 2000,
        responsive: [
          {
            breakpoint: 991,
            settings: {
              slidesToShow: 3,
            },
          },
          {
            breakpoint: 767,
            settings: {
              slidesToShow: 3,
              dots: true,
              arrows: false,
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
            const title = response?.data.data[0].resource_title;
            const subtitle = response?.data.data[0].resource_subtitle;
      
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

        useEffect(() => {
          fetchJourneyHeader()
                      fetchData(currentPage);
                  }, [currentPage]);
              
                  const fetchData = async (page) => {
                      try {
                          const endpoint = config.GetLandingPageCaraousalData; 
                          const data = { page, pageSize, type: "resources" };
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
      
      return(<>
 
 <div className="resourcesSec">
    <div className="container">
      <div className="section-heading">
        <img
          src="/images/landingpage/watermark.png"
          width={50}
          className="d-block mx-auto"
        />
       <h2>{journeyTitle ? journeyTitle : "Resources"}</h2>
                        <p>{journeySubtitle ? journeySubtitle : "Lorem Ipsum is simply dummy text"}</p>
      </div>
      <div className="row">
      {dataItems.map((item, index) => (
        <div className="col-md-4 mb-3" key={index}>
          <div   className="resourcesBox">
            <figure className="m-0">
             {/* <img src="/images/landingpage/dosha-quiz.jpg" alt="" /> */}
            
             <img src={`${process.env.NEXT_PUBLIC_API_URL}/${item.file}`}
                                            alt={item.title} />
            </figure>
           
            <h3 onClick={() => handleNavigation(item.button_route)} style={{cursor:'pointer'}}>{item.title}</h3>
           
          </div>
        </div>))}
       
      </div>
    </div>
  </div>
  </>)
};

export default Resources;
