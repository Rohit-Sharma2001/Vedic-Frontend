'use client';
import React , {useEffect,useState}from 'react';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { config } from 'services/config';
import { postApi } from 'services/api';
import Loader from 'services/Loader/page';
import "../../../LandingPage/public/css/style.css";


const bannerData = [
  {
    title: "Ayurvedic Supplements",
    subtitle: "Vedic Yours Shop",
    description: "Want it today? Visit the Shop at our center, or call us at 240-753-0151 (24/7 answering).",
    imageUrl: "/images/landingpage/banner-image3.jpg",
  },
  {
    title: "Ayurvedic Supplements",
    subtitle: "Vedic Yours Shop",
    description: "Want it today? Visit the Shop at our center, or call us at 240-753-0151 (24/7 answering).",
    imageUrl: "/images/landingpage/banner-image3.jpg",
  },
];



const AyurvedicSupplementsBanner = () => {
 const [dataItems, setDataItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
const [loading, setLoading] = useState(false)

  const sliderSettings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: false,
    cssEase: 'linear',
  };
   useEffect(() => {
    setLoading(true)
      fetchData(currentPage);
    }, [currentPage]);
  
   const fetchData = async (page) => {
    // setLoading(true)
      try {
        const endpoint = config.GetMainBannerData;
        const data = { type: "shop_banner" };
        const response = await postApi(endpoint, data);
        console.log(response);
        setDataItems(response.resultWithUrls || []);
        setTotalPages(response.totalPages || 1);
        setLoading(false)
      } catch (error) {
        setLoading(false)
        console.error("Error fetching data:", error);
      }
    };
  return (
    <div className="mainBanner mainBanner3">
      {loading && <Loader/>}
      <Slider {...sliderSettings} className="bannerSlide">
        {dataItems.map((item, index) => (
          <div key={index}>
            <div className="bannerImage" style={{ backgroundImage: `url(${process.env.NEXT_PUBLIC_API_URL}/${item.file.replace(/\\/g, "/")})` }}>
              <div className="bannerTxt" style={{maxWidth:"450PX"}}>
                <h1>{item.title}</h1>
                <span>{item.sub_title}</span>
                <p className='fs-6'>{item.descriptions}</p>
              </div>
            </div>
          </div>
        ))}
      </Slider>
      <style jsx>{`

  /* remove unwanted dots  */
  :global(.bannerSlide .slick-dots li button:before) {
    content: '' !important;
  }
 
`}</style>
    </div>
  );
};

export default AyurvedicSupplementsBanner;
