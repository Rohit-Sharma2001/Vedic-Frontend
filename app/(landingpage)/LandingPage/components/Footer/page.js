'use client'
import { React, useState ,useEffect } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Lottie from 'lottie-react';
import Link from "next/link";
import animationData from '/public/images/landingpage/let-stay.json'; // Ensure correct path
import { postApi } from 'services/api';
import { config } from 'services/config';
import DynamicModal3 from 'services/Pop-ups/popup3/page';
import Loader from 'services/Loader/page';
import { usePathname } from 'next/navigation';
const FooterSection = () => {
  const pathname = usePathname();
  const isEmployeePortal = pathname?.toLowerCase().includes('employee-portal');
  const [email, setEmail] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [responseMessage, setResponseMessage] = useState({})
  const [responseHeading, setResponseHeading] = useState({})
  const [responseTitle, setResponseTitle] = useState({})
  const [loading, setLoading] = useState(false)
 const [formData, setFormData] = useState({
  icon: null,
  name: '',
  description: '',
  dropdown_type: 'footer_data',
  address: '',   // ✅ new
  email: '',     // ✅ new
  number: ''     // ✅ new
});


    useEffect(() => {
          fetchInitialData();
      }, []);
  
      const fetchInitialData = async () => {
          try {
              const data = { id: "67f4da7497d93651914eb2f7" }; // Replace with actual ID
              const endpoint = config.Viewcategory;
              const response = await postApi(endpoint, data);
  
             if (response.statusCode === 201) {
  setFormData({
    icon: null,
    name: response.data.name || '',
    description: response.data.description || '',
    address: response.data.address || '',   // ✅
    email: response.data.email || '',       // ✅
    number: response.data.number || ''      // ✅
  });
}

          } catch (error) {
              console.error('Error fetching footer data:', error);
          }
      };

  async function clickToSubscribe() {
    setLoading(true)
    if (!email?.trim()) {
      setShowModal(true);
      setResponseTitle("Failed")
      setResponseHeading("Oop's !!")
      setResponseMessage("Email is required")
      setLoading(false)
      // console.error = "Email is required";
      // console.log("Email is required")
      return;
    }
    
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email)) {
      setShowModal(true);
      setResponseTitle("Failed")
      setResponseHeading("Oop's !!")
      setResponseMessage("Please Provide a valid Email")
      setLoading(false)
      // console.error = "Email is invalid";
      // console.log("Please Provide a valid Email")
      return;
    }
    try {
      const endpoint = config.addSuscribe;
      const data = { email: email };

      const response = await postApi(endpoint, data);
      if (response.statusCode == 201) {
        setEmail("")
        console.log(response, "response for products");
        setShowModal(true);
        setResponseTitle("Success")
        setResponseHeading("You're Subscribed!")
        setResponseMessage("Thank you for joining our community!")
      setLoading(false)
      }
    } catch (error) {
      setLoading(false)
      setResponseTitle("Failed")
      setResponseHeading("Oop's !!")
      setResponseMessage("Something went wrong")
      // console.error("Error fetching categorylist:", error);
    }
  }
  return (<>
    <footer className="footerMain">
      {loading && <Loader/>}
      <div className="container-fluid">
        <div className="stayTouch">
          <div className="d-md-flex gap-5 align-items-center">
              <div className="d-flex align-items-center gap-3 pe-md-5">
                <figure className="m-0">
                  <Lottie animationData={animationData} style={{ width: "60px", height: "60px" }} />
                </figure>
                <div>
                  <h3 className="mb-1">{formData?.name}</h3>
                  <p className="m-0">{formData?.description}</p>
                </div>
              </div>
              <div className="subscribeInpt d-flex mt-md-3 mt-xl-0" >
                <input type="text" placeholder="Enter your email address" value={email} className="form-control" onChange={(e) => { setEmail(e.target.value) }} />
                <button type="button" className="btn btn-primary" onClick={() => clickToSubscribe()}>Subscribe</button>
              </div>
          </div>
          <hr className="mb-0" />
        </div>
        <div className="row">
          <div className="col-md-12 col-lg-3 pe-md-5 mb-4 footerAddress">
            <figure>
             <img 
   src={pathname.includes("YogaClasses") 
     ? "/images/landingpage/vedic-yoga.png" 
     : "/images/landingpage/vedic-health.png"} 
   alt="Vedic Logo" 
   width={200} 
 />
            </figure>
          <ul style={{ padding: 0 }}>
  {formData.address && (
    <li className="d-flex align-items-center gap-2 mb-2">
      <img src="/images/landingpage/location-icon.svg" width={13} /> {formData.address}
    </li>
  )}
  {formData.number && (
    <li className="d-flex gap-2 mb-2">
      <img src="/images/landingpage/call-icon.svg" width={13} /> {formData.number}
    </li>
  )}
  {formData.email && (
    <li className="d-flex gap-2 mb-2 emailTxt">
      <img src="/images/landingpage/mail-icon.svg" width={13} /> {formData.email}
    </li>
  )}
</ul>

          </div>
          {!isEmployeePortal && (
          <div className="col-md-8 col-lg-6">
            <div className="row">
              <div className="col-md-4 mb-4">
                <div className="footLink">
                  <ul style={{ padding: 0 }}>
                    <li>
                      <Link href="/LandingPage/components/AmitajainLandingPage">
                        About us</Link>
                    </li>

                    <li>
                      <Link href="/LandingPage/components/FaqPage">
                        FAQ
                      </Link>
                    </li>
                    <li>
                      <Link href="/LandingPage/components/ReviewPage">
                        Review
                      </Link>
                    </li>
                    <li>
 <Link href="/LandingPage/components/AmitajainLandingPage">
                        Meet Amita Jain</Link>
                     
                    </li>
                    <li>
                      {/* <a href="">Our Team</a> */}
                      <Link href="/LandingPage/components/ContactUsPage">
                      Contact Us
                      </Link>
                    </li>
                    
                    {/* <li>
                      <a href="">Privacy Policy</a>
                    </li>
                    <li>
                      <a href="">Terms and Conditions</a>
                    </li> */}
                    
                  </ul>
                </div>
              </div>
              <div className="col-md-4 mb-4">
                <div className="footLink">
                  <ul style={{ padding: 0 }}>
                    <li>
                      {/* <a href="">What is Ayurveda</a> */}
                      <Link href={'/LandingPage/components/AyurvedaHealing'}>What is Ayurveda</Link>
                    </li>
                    <li>
                      {/* <a href="">Dosha Test</a> */}
                       <Link href="/LandingPage/components/Quiz">
                       Dosha Quiz
                      </Link>
                    </li>

                    <li>
                  
                       <Link href="/Appointment/components/BookAppointment">
                      Book Appointment
                      </Link>
                    </li>
                    <li>
                  
                       <Link href="/Shop">
                     Herb Shop
                      </Link>
                    </li>
                    {/* <li>
                      <Link href={' /LandingPage/components/YourDoshas'}>Your Doshas</Link>
                    </li> */}
                    
                    {/* <li>
                  
                       <Link href="/LandingPage/components/TreatingDoshasImbalance">
                       Dosha Imbalance
                      </Link>
                    </li> */}
                      {/* <li>
                  
                       <Link href="/LandingPage/components/TalksByAmita">
                      Talks By Amita
                      </Link>
                    </li> */}
                    
                  </ul>
                </div>
              </div>
              <div className="col-md-4">
                <div className="footLink">
                  <ul style={{ padding: 0 }}>
                    {/* <li>
                  
                       <Link href="/Shop">
                     Volunteer
                      </Link>
                    </li> */}
                    
                   
                    <li>
                      
                      <Link href="/LandingPage/components/DonateHealing">
                       Donate
                      </Link>
                    </li>
                    
                    <li>
                      {/* <a href="">Jobs</a> */}
                      <Link href="/LandingPage/components/JobOpenings">
                       Jobs
                      </Link>
                    </li>
                    <li>
                      {/* <a href="">Jobs</a> */}
                      <Link href="/LandingPage/components/MeetFamily">
                       Our Team
                      </Link>
                    </li>
                    {/* <li>
                      <a href="">Zoom Rooms</a>
                    </li> */}
                  </ul>
                </div>
              </div>
            </div>
          </div>)}
          <div className={`col-md-4 col-lg-3 ${isEmployeePortal ? 'ms-lg-auto' : ''}`}>
            <div className={`${isEmployeePortal ? '' : 'swamiChinmayananda'}`}>
              <figure>
                {isEmployeePortal?<img src="/images/landingpage/swami-chinmayananda.jpg" style={{"height":"112px"}}/>
                :<img src="/images/landingpage/swami-chinmayananda.jpg" />}
              </figure>
              <p style={{ color: "black" }} >
                <b >Give. Love. Serve.</b> --Swami Chinmayananda
              </p>
            </div>
          </div>
        </div>
      </div>
      <hr />
      <div className="container-fluid">
        <div className="row copyrightTxt">
          <div className="col-md-6 ">
            <p className="mb-0">
              Copyright @2023 Vedic Health Inc. All Rights Reserved.
            </p>
          </div>
          <div className="col-md-6 ">
            <ul className="d-flex flex-wrap gap-3 justify-content-end">
              <li>
                <a href="https://www.facebook.com/vedichealthinc?mibextid=JRoKGi"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Facebook">
                  <img src="/images/landingpage/facebook.svg" width={8} />
                </a>
              </li>
              <li>
               <a
    href="https://www.instagram.com/vedic_health?igsh=NGVhN2U2NjQ0Yg=="
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Instagram"
  >
    <img src="/images/landingpage/instagram.svg" width={17} alt="Instagram" />
  </a>
              </li>
              <li>
                <a href="https://www.instagram.com/vedic_health?igsh=NGVhN2U2NjQ0Yg=="
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Twitter">
                  <img src="/images/landingpage/twitter.svg" width={17} />
                </a>
              </li>
              <li>
                <a href="https://www.instagram.com/vedic_health?igsh=NGVhN2U2NjQ0Yg=="
    target="_blank"
    rel="noopener noreferrer"
    aria-label="LinkedIn">
                  <img src="/images/landingpage/linkedin.svg" width={17} />
                </a>
              </li>
              <li>
                <a href="http://www.youtube.com/@vedichealth2481"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Youtube">
                  <img src="/images/landingpage/youtube.svg" width={25} />
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <DynamicModal3
        show={showModal}
        onClose={() => setShowModal(false)}
        title={responseTitle || "Success!"}
        heading={responseHeading || "You're Subscribed!"}
        description={responseMessage || "Thank you for joining our community!"}
        buttonText="Close"
        onButtonClick={() => setShowModal(false)}
      />

    </footer>
  </>)
};

export default FooterSection;
