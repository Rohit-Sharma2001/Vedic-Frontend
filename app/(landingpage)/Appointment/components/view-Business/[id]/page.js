"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "app/(landingpage)/LandingPage/components/Header/page";
import FooterSection from "app/(landingpage)/LandingPage/components/Footer/page";
import "app/(landingpage)/LandingPage/public/css/style.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { useParams } from "next/navigation"; 
import { config } from "services/config";
import { postApi, postApiWithFile, updateApiWithFile } from "services/api";
import { ConeStriped } from "node_modules/react-bootstrap-icons/dist";
import { Modal } from "bootstrap";
import StarRating from "services/Reusable/StarRating";
// import SubHeader from "app/(landingpage)/LandingPage/components/SubHeader/page";
import ProductListing from "app/(landingpage)/Shop/products/page";
import BookAnAppointment from "../../BookAppointment/page";
import JoinYogaClasses from "app/(landingpage)/YogaClasses/components/JoinYogaClasses/page";
const ViewBuisnessPage = () => {
  const { id } = useParams();
  const modalRef = useRef(null);
  const [employeesList, setEmployeesList] = useState([]);
  const [faqs, setFaqs] = useState([]);
    const [newFaq, setNewFaq] = useState({ heading: "", description: "" });
  const [userData, setUserData] = useState();
  const [report, setReport] = useState();
  const [allreviews, setAllReviews] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
   const [itemTypeList, setItemTypeList] = useState([]);
  const [ratings, setRatings] = useState({
    overall_review: 0,
    punctuality: 0,
    value: 0,
    service: 0,
  });
   const [practitioners, setPractitioners] = useState([]);
  const [reviewText, setReviewText] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const arrayheader = [
    { name: "Home", route: "/" },
    { name: "Book Online", route: "/Appointment/components/BookAppointment" },
    { name: "Order", route: "/profile?tab=orders" },
    { name: "Yoga", route: "/YogaClasses/components/JoinYogaClasses" },
    { name: "Event", route: "/Events" },
    {
    name: "Resources",
    route:"/LandingPage/components/Quiz",
    children: [
      { name: "Dosha Quiz", route: "/LandingPage/components/Quiz" },
      { name: "Health Articles", route: "/LandingPage/components/BookArticles" },
      { name: "Gallery", route: "/LandingPage/components/Gallery" },

    ]
  },   
  ];

      useEffect(() => {
        fetchInitialData();
    }, [currentPage]);

    const fetchInitialData = async () => {
        try {
            const endpoint = config.getAllBusinessDetails;
            const response = await postApi(endpoint, {});

            if (response.statusCode === 201 || response.statusCode === 200) {
                setFaqs(response.data || []);
                setTotalPages(response.totalPages || 1);
                setTotalCount(response.totalCount || 0);
            }
        } catch (error) {
            console.error("Error fetching FAQs:", error);
        }
    };

  useEffect(() => { fetchItemTypes(currentPage); }, [currentPage]);
  
      const fetchItemTypes = async (page) => {
          try {
              const endpoint = config.category;
              const data = { dropdown_type: "gallery_images", page, pageSize };
              const response = await postApi(endpoint, data);
              setItemTypeList(response.result || []);
              setTotalPages(response.totalPages || 1);
          } catch (error) { console.error('Error fetching product types:', error); }
      };

  const handleBrowserBookmark = () => {
  if (window.sidebar && window.sidebar.addPanel) {
    // Firefox < 23
    window.sidebar.addPanel(document.title, window.location.href, "");
  } else if (window.external && "AddFavorite" in window.external) {
    // IE Favorite
    window.external.AddFavorite(window.location.href, document.title);
  } else {
    // For modern browsers (Chrome, Edge, Safari, Firefox 23+)
    alert(
      "Press " +
        (navigator.userAgent.toLowerCase().indexOf("mac") !== -1
          ? "Cmd + D"
          : "Ctrl + D") +
        " to bookmark this page."
    );
  }
};


    const getInitials = (name = "") => {
    const words = name.trim().split(" ");
    if (words.length === 1) return words[0][0]?.toUpperCase() || "";
    return (words[0][0] + words[1][0]).toUpperCase();
  };
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    setUserData(user);
    fetchEmployees(id);
    fetchReviesReport();
    fetchAllReviews()
  }, [id]);

  const fetchEmployees = async (serviceId) => {
    try {
      const response = await postApi(config.ViewService, {
        id: serviceId,
      });  

      setEmployeesList(response.data[0]?.employees || []);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const fetchReviesReport = async () => {
    try {
      const response = await postApi(config.ReviewsReport, {});

   
      setReport(response);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

   const fetchAllReviews = async () => {
    try {
      const response = await postApi(config.AllEmployeeReviews, {});

      setAllReviews(response?.data);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };
useEffect(() => {
  // Needed for data-bs-toggle="collapse" to work in React
  import('bootstrap/dist/js/bootstrap.bundle.min.js').catch(() => {});
}, []);

const handleSubmitReview = async () => {
  if (!selectedEmployee || !userData?._id) return alert("Missing fields");

  const payload = {
    employee_id: selectedEmployee,
    user_id: userData._id,
    comment: reviewText,
    ...ratings,
  };

  try {
    const res = await postApi(config.AddEmployeeReview, payload);
    if (res.statusCode === 201) {
    alert("Review submitted!");

  // Reset form
  setReviewText("");
  setRatings({ overall_review: 0, punctuality: 0, value: 0, service: 0 });
  setSelectedEmployee("");

  // Close Bootstrap modal
  const modalInstance = Modal.getInstance(modalRef.current) || new Modal(modalRef.current);
  modalInstance.hide();

  // Force-remove the backdrop manually
  const backdrops = document.querySelectorAll('.modal-backdrop');
  backdrops.forEach((backdrop) => backdrop.remove());

  // Also remove `modal-open` class from body to restore scroll
  document.body.classList.remove('modal-open');
  document.body.style = ''; // reset any scroll-lock styling
}
 else {
      alert("Error: " + res.message);
    }
  } catch (err) {
    console.error(err);
    alert("Submission failed");
  }
};


 useEffect(() => {
    fetchPractitioners(currentPage);
  }, [currentPage]);
const fetchPractitioners = async (page) => {
  try {
    const res = await postApi(config.GetEmployee, {});

    const allData = res?.data?.employeeData || [];
console.log("all staff members",res?.data?.employeeData)
    setPractitioners(allData);
    
  } catch (err) {
    console.error('Failed to fetch practitioners:', err);
  }
};
  return (
    <>
      <Header arrayheader={arrayheader} />
       {/* <SubHeader /> */}
      <div className="deatilMain mb-4 mb-md-5">
        <div className="container-fluid">
          <div className="abouttabs d-flex justify-content-between align-items-center mb-3">
            <ul className="nav nav-tabs border-0">
              <li className="nav-item">
                <button
                  className="nav-link active"
                  data-bs-toggle="tab"
                  data-bs-target="#aboutTabPane"
                  type="button"
                >
                  About
                </button>
              </li>
               <li className="nav-item">
                        <button className="nav-link" data-bs-toggle="tab" data-bs-target="#staffTabPane"
                            type="button">Staff</button>
                    </li>
                     <li className="nav-item">
                        <button className="nav-link" data-bs-toggle="tab" data-bs-target="#ServicesTabPane"
                            type="button">Services</button>
                    </li>
                    <li className="nav-item">
                        <button className="nav-link" data-bs-toggle="tab" data-bs-target="#ClassesTabPane"
                            type="button">Classes</button>
                    </li>
                     <li className="nav-item">
                        <button className="nav-link" data-bs-toggle="tab" data-bs-target="#productsTabPane"
                            type="button">Products</button>
                    </li>
            </ul>
            {/* <button type="button" className="bg-transparent border-0 lh-1 p-0">
              <img
                src="/images/landingpage/delete-white.svg"
                alt=""
                width="17"
              />
            </button> */}
          </div>
          <div className="tab-content">
            <div className="tab-pane fade show active" id="aboutTabPane">
              <div className="d-flex flex-wrap mt-4">
                <div className="reviewLeft">
                  <div className="reviewBar bg-white d-flex align-items-center gap-4 h-100">
                    <div className=" text-center mb-2 px-md-4">
                      <span className="d-block text-center fs-1 fw-bold mb-0">
                        {report?.average?.overall_review?.toFixed(1)}{" "}
                      </span>
                      {/* <span className="d-flex align-items-center gap-1 justify-content-center">
                        <img
                          src="/images/landingpage/starfill.svg"
                          width="14"
                        />
                        <img
                          src="/images/landingpage/starfill.svg"
                          width="14"
                        />
                        <img
                          src="/images/landingpage/starfill.svg"
                          width="14"
                        />
                        <img
                          src="/images/landingpage/starfill.svg"
                          width="14"
                        />
                        <img
                          src="/images/landingpage/starfill.svg"
                          width="14"
                        />
                      </span> */}
                      <div className="my-1">
                        <StarRating value={report?.average?.overall_review} size={16} />
                      </div>
                      <span className="d-block fs-8 text-info mt-1 text-center">
                        {report?.totalReviews} Reviews
                      </span>
                    </div>
                    <div className="ratingBar w-75 pe-md-3">
                      {[5, 4, 3, 2, 1].map((star) => {
                        const count = report?.distribution?.[star] || 0;
                        const percent = report?.totalReviews
                          ? (count / report.totalReviews) * 100
                          : 0;

                        return (
                          <div
                            className="d-flex align-items-center gap-2 justify-content-between mb-1"
                            key={star}
                          >
                            <img
                              src="/images/landingpage/starfill.svg"
                              width="14"
                            />
                            <span>{star}</span>
                            <div
                              className="progress flex-grow-1"
                              role="progressbar"
                              aria-valuenow={percent.toFixed(0)}
                              aria-valuemin="0"
                              aria-valuemax="100"
                            >
                              <div
                                className="progress-bar"
                                style={{ width: `${percent.toFixed(0)}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <div className="reviewRight">
                  <div className="reviewBar h-100">
                    <div className="row">
                      <div className="col-lg-8 d-md-flex align-items-center gap-5">
                        <div className="row">
                          <div className="text-center col-6 col-md-3 mb-2">
                            <span className="d-block fs-4 lh-normal fw-bold mb-0">
                              {report?.average?.overall_review?.toFixed(1)}{" "}

                            </span>
                            <div className="my-1">
                            <StarRating value={report?.average?.overall_review} size={16} />
                            
                            </div>
                            <span className="d-block fs-8 text-black mt-1">
                              Overall
                            </span>
                          </div>
                          <div className="text-center  col-6 col-md-3 mb-2">
                            <span className="d-block fs-4 lh-normal fw-bold mb-0">
                            {report?.average?.punctuality?.toFixed(1)}{" "}

                            </span>
                            <div className="my-1">
                            <StarRating value={report?.average?.punctuality} size={16} />
                            </div>
                            <span className="d-block fs-8 text-black mt-1">
                              punctuality
                            </span>
                          </div>
                          <div className="text-center  col-6 col-md-3 mb-2">
                            <span className="d-block fs-4 lh-normal fw-bold mb-0">
                            {report?.average?.service?.toFixed(1)}{" "}

                            </span>
                            <div className="my-1">
                               <StarRating value={report?.average?.service} size={16} />
                            </div>
                            <span className="d-block fs-8 text-black mt-1">
                              Service
                            </span>
                          </div>
                          <div className="text-center  col-6 col-md-3 mb-2">
                            <span className="d-block fs-4 lh-normal fw-bold mb-0">
                             {report?.average?.value?.toFixed(1)}{" "}

                            </span>
                            <div className="my-1">
                           <StarRating value={report?.average?.value} size={16} />

                            </div>
                            <span className="d-block fs-8 text-black mt-1">
                              Value
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="col-lg-4">
                        <div className="text-center text-lg-end">
                          <button
  type="button"
  className="btn btn-primary my-2"
  onClick={handleBrowserBookmark}
>
  <img src="/images/landingpage/bookmark.svg" width="13" alt="" /> Bookmark
</button>

                          <a
                            href="#writeReview"
                            data-bs-toggle="modal"
                            className="btn btn-orange my-2"
                          >
                            Write a review
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 descriptionSection">
                <h3 className="mb-1 fs-5 fw-semibold">Description</h3>
                <p className="fs-8">
                  Vedic Health is a natural healing center that offers Ayurvedic
                  and holistic health services to help those suffering from
                  chronic conditions. We offer health consultations, herbal
                  supplements, panchakarma, yoga and meditation classes, energy
                  healing, mental health counseling, community events and more.
                  Vedic Health is a 501(c)3 nonprofit founded by Amita Jain.
                </p>
             <div className="accordion" id="accordionExample">
  {Array.isArray(faqs) && faqs.length > 0 && faqs.map((item, index) => {
    const collapseId = `faq-collapse-${item?._id ?? index}`;
    const headingId  = `faq-heading-${item?._id ?? index}`;
    const isFirst = index === 0; // open first by default

    return (
      <div className="accordion-item" key={item?._id ?? index}>
        <h2 className="accordion-header" id={headingId}>
          <button
            className={`accordion-button ${!isFirst ? 'collapsed' : ''}`}
            type="button"
            data-bs-toggle="collapse"
            data-bs-target={`#${collapseId}`}
            aria-expanded={isFirst}
            aria-controls={collapseId}
           
          >
            {index + 1}. {item?.heading}
          </button>
        </h2>

        <div
          id={collapseId}
          className={`accordion-collapse mt-3 collapse ${isFirst ? 'show' : ''}`}
          aria-labelledby={headingId}
          data-bs-parent="#accordionExample"
        >
          <div className="accordion-body">
            {/* Ensure server sanitizes this HTML. */}
            <div dangerouslySetInnerHTML={{ __html: item?.description || '' }} />
          </div>
        </div>
      </div>
    );
  })}
</div>
                <div className="row my-4">
                  <div className="col-md-6 pe-md-4 mb-4 mb-md-0">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3095.9826380712543!2d-77.19088032564858!3d39.10686543432004!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89b7cd560c5f37bd%3A0xaccc7e2d22aa1aa6!2s15235%20Shady%20Grove%20Rd%20Ste%20100%2C%20Rockville%2C%20MD%2020850%2C%20USA!5e0!3m2!1sen!2sin!4v1738827537715!5m2!1sen!2sin"
                      width="600"
                      height="300"
                      style={{
                        border: "0",
                        width: "100%",
                        display: "block",
                        border: "none",
                      }}
                      
                      allowFullScreen={''}
                      loading="lazy"
                      referrerPolicy={'no-referrer-when-downgrade'}
                    ></iframe>
                    <p className="text-info fs-8 mt-3 d-flex gap-3">
                      <img
                        src="/images/landingpage/map-pin.svg"
                        alt=""
                        width="15"
                      />{" "}
                      15235 Shady Grove Road, Suite 100, Rockville, MD 20850
                    </p>
                  </div>
                  <div className="col-md-6 ps-md-4 businessHours">
                    <h3 className="fs-6 fw-bold">Business Hours</h3>
                    <ul className="nots">
                      <li>
                        <div className="row">
                          <div className="col-6">Sunday</div>
                          <div className="col-6">12:00 PM - 4:00 PM</div>
                        </div>
                      </li>
                      <li>
                        <div className="row">
                          <div className="col-6">Monday</div>
                          <div className="col-6">10:00 AM - 8:00 PM</div>
                        </div>
                      </li>
                      <li>
                        <div className="row">
                          <div className="col-6">Tuesday</div>
                          <div className="col-6">10:00 AM - 8:00 PM</div>
                        </div>
                      </li>
                      <li>
                        <div className="row">
                          <div className="col-6">Wednesday</div>
                          <div className="col-6">7:00 AM - 7:00 PM</div>
                        </div>
                      </li>
                      <li>
                        <div className="row">
                          <div className="col-6">Thursday</div>
                          <div className="col-6">12:00 AM - 8:00 PM</div>
                        </div>
                      </li>
                      <li>
                        <div className="row">
                          <div className="col-6">Friday</div>
                          <div className="col-6">10:00 AM - 8:00 PM</div>
                        </div>
                      </li>
                      <li>
                        <div className="row">
                          <div className="col-6">Saturday</div>
                          <div className="col-6">8:00 AM - 6:00 PM</div>
                        </div>
                      </li>
                    </ul>
                    <div className="d-flex gap-2 align-items-center">
                      <a href="" className="btn btn-primary">
                        <img
                          src="/images/landingpage/mail-white-icon.svg"
                          alt=""
                          width="15"
                        />{" "}
                        Message
                      </a>
                      <a href="" className="btn btn-orange mt-0">
                        <img
                          src="/images/landingpage/call-white-icon.svg"
                          alt=""
                          width="15"
                        />{" "}
                        Call
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 gallerySection">
                <h3 className="mb-4 fs-5 fw-semibold">Photos</h3>
                 <div className="row px-1">
            <div className="col-6 col-md-4 px-2 mb-3">
              <figure className="mb-0">
                <img src={`${process.env.NEXT_PUBLIC_API_URL}/${itemTypeList[0]?.file}`} alt="" />
              </figure>
            </div>
            <div className="col-6 col-md-3 px-2 mb-3">
              <figure className="mb-0">
                <img src={`${process.env.NEXT_PUBLIC_API_URL}/${itemTypeList[1]?.file}`} alt="" />
              </figure>
            </div>
            <div className="col-6 col-md-5 px-2 mb-3">
              <figure className="mb-0">
                <img src={`${process.env.NEXT_PUBLIC_API_URL}/${itemTypeList[2]?.file}`} alt="" />
              </figure>
            </div>
            <div className="col-6 col-md-5 px-2 mb-3">
              <figure className="mb-0">
                <img src={`${process.env.NEXT_PUBLIC_API_URL}/${itemTypeList[3]?.file}`} alt="" />
              </figure>
            </div>
            <div className="col-6 col-md-4 px-2 mb-3">
              <figure className="mb-0">
                <img src={`${process.env.NEXT_PUBLIC_API_URL}/${itemTypeList[4]?.file}`} alt="" />
              </figure>
            </div>
            <div className="col-6 col-md-3 px-2 mb-3">
              <figure className="mb-0 moreImg position-relative">
                <img src={`${process.env.NEXT_PUBLIC_API_URL}/${itemTypeList[5]?.file}`} alt="" />
                <Link href={'/LandingPage/components/Gallery'} style={{textDecoration:'none'}} className="moreImgTag">
                  5+ more
                </Link>
              </figure>
            </div>
          </div>
              </div>
              <div className="mt-4">
                <div className="d-flex justify-content-between mb-4 align-items-center">
                  <h3 className="mb-0 fs-5 fw-semibold">Reviews</h3>
                  <a
                    href="#writeReview"
                    data-bs-toggle="modal"
                    className="btn btn-orange px-3 py-2"
                  >
                    Write a review
                  </a>
                </div>
                {allreviews.map((review, index) => (
  <div key={index}>
    <div className="userReview">
      <div className="reviewProfile">
        <figure className="mb-0">
          
            <div
                          className="d-flex justify-content-center align-items-center rounded-circle"
                          style={{
                            width: "60px",  
                            height: "60px",
                            backgroundColor: "#E0E0E0",
                            fontSize: "26px",
                            fontWeight: "bold",
                            color: "#662A09",
                          }}
                        >
                          {getInitials(
                            review.user_id?.name
                          )}
                        </div>
        </figure>
        <div className="reviewUserName">
          <strong>{review.user_id?.name || 'Anonymous'}</strong>
          <span>
            Reviewed on{' '}
            {new Date(review.created_at).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })}
          </span>
        </div>
      </div>

  
 <StarRating value={review?.overall_review} size={12} />
      <p>
        {review.comment || 'No comment provided.'}{' '}
        
      </p>
    </div>
    <hr />
  </div>
))}

              </div>
            </div>
                <div className="tab-pane fade" id="staffTabPane">
                    <ul className="staffListing" style={{paddingLeft:'0px'}}>
                      {console.log("809",practitioners)}
                      {practitioners?.length > 0 && practitioners?.map((employee,index)=>(

   <li className="mb-3" key={index}>
                            <div className="staffcontent">
                                <div className="row align-items-center">
                                    <div className="col-md-9">
                                        <a href="#ratingModal" style={{textDecoration:'none'}}  data-bs-toggle="modal" className="staffInfo mb-3">
                                            <div className="d-flex align-items-center gap-3">
                                                
                                                 <figure >
          
            <div
                          className="d-flex justify-content-center align-items-center rounded-circle"
                          style={{
                            width: "60px",  
                            height: "60px",
                            backgroundColor: "#E0E0E0",
                            fontSize: "26px",
                            fontWeight: "bold",
                            color: "#662A09",
                          }}
                        >
                          {getInitials(
                            employee?.user?.name
                          )}
                        </div>
        </figure>
                                                <div className="d-md-flex gap-4">
                                                    <span>{employee?.user?.name || "N/A"} <b>{employee?.user?.mobileNo || "N/A"}</b></span>
                                                    <div className="staffrating">
                                                        <StarRating value={employee?.average_ratings?.overall_review} size={16} /><span
                                                            className="fs-8 d-inline-block ms-1">({employee?.average_ratings?.count || "N/A"})</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </a>

                                        {/* <p className="fs-8 mb-0"></p> */}
                                           <p className="fs-8 mb-0" dangerouslySetInnerHTML={{ __html: employee?.description}}></p>
                                    </div>
                                    <div className="col-md-3 mt-3 mt-md-0">
                                        <div className="appointmentButton text-md-end">
                                            <a href="" className="btn btn-primary my-2 ">Message</a>
                                            <div className="dropdown my-2">
                                                <a href="" className="btn btn-orange " data-bs-toggle="dropdown">Book <i
                                                        className="bi bi-chevron-down"></i></a>
                                                <div className="dropdown-menu">
                                                    <ul className="">
                                                        <li>
                                                            <a href="">Book Services</a>
                                                        </li>
                                                        <li>
                                                            <a href="">Book Classes</a>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </li>
                      ))}
                     
                       

                    </ul>
                </div>

                 <div class="tab-pane fade" id="productsTabPane">
                    <div class="d-flex flex-wrap">
                      <ProductListing></ProductListing>
                    </div>
                </div>
                   <div class="tab-pane fade" id="ServicesTabPane">
                    <div class="d-flex flex-wrap">
                      <BookAnAppointment></BookAnAppointment>
                    </div>
                </div>
                  <div class="tab-pane fade" id="ClassesTabPane">
                    <div class="d-flex flex-wrap">
                      <JoinYogaClasses></JoinYogaClasses>
                    </div>
                </div>
          </div>
        </div>
      </div>

     <div className="modal fade writeAComment" id="writeReview" ref={modalRef}>

        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0">
            <div className="modal-header border-0">
              <h1 className="modal-title fs-6">Write Comment</h1>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <form className="commentForm">
                <div className="row">
                  <div className="col-md-6 mb-4">
                    <div className="form-group">
                      <label>Your Overall Review</label>
                      <div className="d-flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            className="star"
                            style={{
                              fontSize: 30,
                              cursor: "pointer",
                              marginRight: 4,
                              color:
                                star <= ratings.overall_review
                                  ? "#FFD700"
                                  : "#ccc",
                            }}
                            onClick={() =>
                              setRatings({ ...ratings, overall_review: star })
                            }
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 mb-4">
                    <div className="form-group">
                      <label>Punctuality</label>
                      <div className="d-flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            className="star"
                            style={{
                              fontSize: 30,
                              cursor: "pointer",
                              marginRight: 4,
                              color:
                                star <= ratings.punctuality
                                  ? "#FFD700"
                                  : "#ccc",
                            }}
                            onClick={() =>
                              setRatings({ ...ratings, punctuality: star })
                            }
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 mb-4">
                    <div className="form-group">
                      <label>Value</label>
                      <div className="d-flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            className="star"
                            style={{
                              fontSize: 30,
                              cursor: "pointer",
                              marginRight: 4,
                              color: star <= ratings.value ? "#FFD700" : "#ccc",
                            }}
                            onClick={() =>
                              setRatings({ ...ratings, value: star })
                            }
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 mb-4">
                    <div className="form-group">
                      <label>Service</label>
                      <div className="d-flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            className="star"
                            style={{
                              fontSize: 30,
                              cursor: "pointer",
                              marginRight: 4,
                              color:
                                star <= ratings.service ? "#FFD700" : "#ccc",
                            }}
                            onClick={() =>
                              setRatings({ ...ratings, service: star })
                            }
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="col-md-12 mb-4">
                    <div className="form-group">
                      <label>Select your service provider</label>
                      <select
                        className="form-select"
                        value={selectedEmployee}
                        onChange={(e) => setSelectedEmployee(e.target.value)}
                      >
                        <option value="">Select</option>
                        {employeesList.map((emp) => (
                          <option key={emp._id} value={emp._id}>
                            {emp.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="col-md-12 mb-4">
                    <label>Leave a review for the business (optional)</label>
                    <textarea
                      className="form-control"
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                    />
                  </div>
                </div>

                <div className="text-center my-2 mt-4">
                  <button
                    type="button"
                    className="btn btn-primary w-75"
                    onClick={handleSubmitReview}
                  >
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <FooterSection />
    </>
  );
};
export default ViewBuisnessPage;
