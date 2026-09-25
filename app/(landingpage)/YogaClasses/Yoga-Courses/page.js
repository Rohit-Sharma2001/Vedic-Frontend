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
// import SubHeader from "app/(landingpage)/LandingPage/components/SubHeader/page";
import StarRating from "services/Reusable/StarRating";


const YogaCourses = () => {
    const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [itemTypeList, setItemTypeList] = useState([]);
  const [courses, setCourses] = useState([]);
  const [mostViewed, setMostViewed] = useState([]);
const [bestSeller, setBestSeller] = useState([]);

 const [practitioners, setPractitioners] = useState([]);
     const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    fetchPractitioners(currentPage);
  }, [currentPage]);
const fetchPractitioners = async (page) => {
  try {
    const res = await postApi(config.GetEmployee, {});

    const allData = res?.data?.employeeData || [];
// console.log(res?.data?.employeeData)
    setPractitioners(allData);
  } catch (err) {
    console.error('Failed to fetch practitioners:', err);
  }
};

  const getInitials = (name = "") => {
    const words = name.trim().split(" ");
    if (words.length === 1) return words[0][0]?.toUpperCase() || "";
    return (words[0][0] + words[1][0]).toUpperCase();
  };

useEffect(() => {
  // Only run this on the client
  if (typeof window !== "undefined") {
    import("bootstrap/dist/js/bootstrap.bundle.min.js")
      .then(() => {
        console.log("Bootstrap JS loaded successfully");
      })
      .catch((err) => console.error("Failed to load Bootstrap JS", err));
  }
}, []);


const fetchTrendingCourses = async () => {
  try {
    const res = await postApi(config.getTrendingCourses, {});
// console.log("trending Courses",res)
    if (res.statusCode === 200) {
      const viewed = res.data.mostViewed || [];
      const purchased = res.data.mostPurchased || [];

     
    setMostViewed(
  viewed
    .filter((course) => course.status === 1)   // 👈 ONLY ACTIVE COURSES
    .map((course) => ({
      id: course._id,
      name: course.courseName,
      price: course.price,
      viewCount: course.viewCount,
      category: course.categoryId?.name || "General Yoga",
      image: course.icon_file
        ? `${process.env.NEXT_PUBLIC_API_URL}/${course.icon_file}`.replace(/\\/g, "/")
        : "/images/default-course.png",
      tag: "Most Viewed",
    }))
);

setBestSeller(
  purchased
    .filter((course) => course.status === 1)   // 👈 ONLY ACTIVE COURSES
    .map((course) => ({
      id: course._id,
      name: course.courseName,
      price: course.price,
      status: course.status,
      category: course.categoryId?.name || "General Yoga",
      image: course.icon_file
        ? `${process.env.NEXT_PUBLIC_API_URL}/${course.icon_file}`.replace(/\\/g, "/")
        : "/images/default-course.png",
      tag: "Best Seller",
    }))
);

    }
  } catch (error) {
    console.error("Error fetching trending courses:", error);
  }
};

  const arrayheader = [
    { name: "Home", route: "/" },
    { name: "Book Online", route: "/Appointment/components/BookAppointment" },
    { name: "Order", route: "/profile?tab=orders" },
    { name: "Yoga ", route: "/YogaClasses/components/JoinYogaClasses" },
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
  fetchItemTypes(currentPage);
  fetchCourses();
  fetchTrendingCourses();  // 👈 NEW
}, [currentPage]);


const fetchCourses = async () => {
  try {
    const res = await postApi(config.getAllCourses, { page: 1, pageSize: 12 });
    if (res.statusCode === 200) {
//  console.log("all courses",res)
  // inside fetchCourses(), when mapping res.result → formatted:
const formatted = res.result
  ?.filter((course) => course.status === 1)
  .map((course) => ({
    id: course._id,
    name: course.courseName,
    price: course.price,
    description: course.description,
    category: course.categoryId?.name || "General Yoga",
    image: course.icon_file
      ? `${process.env.NEXT_PUBLIC_API_URL}/${course.icon_file}`.replace(/\\/g, "/")
      : "/images/default-course.png",
    tag: "Bestseller",

    // ⬇️ pull from backend (adjust if your service returns `ratingsSummary` or `ratings`)
    ratingAvg: course.rating?.averageRating ?? 0,
    ratingTotal: course.rating?.totalRatings ?? 0,
  }));


      setCourses(formatted);
    }
  } catch (error) {
    console.error("Error fetching yoga courses:", error);
  }
};

    const fetchItemTypes = async (page) => {
              try {
                  const endpoint = config.category;
                  const data = { dropdown_type: "courses_banner", page, pageSize };
                  const response = await postApi(endpoint, data);
                 console.log("hello",response)
                  setItemTypeList(response.result || []);
                   const imageUrl = `${process.env.NEXT_PUBLIC_API_URL}/${response.result[0]?.file}`.replace(/\\/g, '/');
        setImagePreview(imageUrl);
                  setTotalPages(response.totalPages || 1);
              } catch (error) { console.error('Error fetching product types:', error); }
          };

  return (
    <>
      <Header arrayheader={arrayheader} />
{/* <SubHeader /> */}

      {/* -----------------------------------------------------Banner------------------------------------- */}
   

     <div className="innerBanner" 
       style={{ backgroundImage: `url(${imagePreview})`, }}
     >
        <div className="container">
            <div className="innerBannertxt">
                {/* <h1>Yoga Courses</h1> */}
                  <h1>{itemTypeList[0]?.name || 'Yoga Courses'}</h1>
                 <p>{itemTypeList[0]?.description || 'Explore courses from experienced, real-world experts.'}</p>
                {/* <a href="" className="btn btn-primary">Sign up</a> */}
            </div>
        </div>
    </div>

    {/* -------------------------------------------------------------Content------------------------------------------ */}

     <section className="yogaclassSection ">
        <div className="container">
          <ul className="nav nav-tabs ordersTabs mb-4">
  

  <li className="nav-item">
    <button
      className="nav-link"
      data-bs-toggle="tab"
      data-bs-target="#bestSeller"
    >
      Best Seller
    </button>
  </li>
  <li className="nav-item">
    <button
      className="nav-link active"
      data-bs-toggle="tab"
      data-bs-target="#mostViewed"
    >
      Most Viewed
    </button>
  </li>
</ul>

            <div className="tab-content">
                <div className="tab-pane fade show active" id="mostViewed">
  <div className="row">
    {mostViewed.length > 0 ? (
      mostViewed.map((course, index) => (
        <div className="col-md-6 col-lg-3 mb-4" key={index}>
          <Link href={`/YogaClasses/Yoga-Courses/Course-Details/${course.id}`} className="d-block instituteTxt">
            <figure>
              <img src={course.image} alt={course.name} />
            </figure>
            <h3 className="fw-bold">{course.name}</h3>
            <p className="text-secondary">Category: {course.category}</p>

            <div className="d-flex gap-3 align-items-center mb-2 pt-1">
              <span className="fs-6 fw-bold text-black">${course.price}</span>
              <span className="fs-9 badge text-bg-warning">{course.tag}</span>
            </div>
          </Link>
        </div>
      ))
    ) : (
      <div className="text-center text-muted py-4">No data.</div>
    )}
  </div>
</div>

<div className="tab-pane fade" id="bestSeller">
  <div className="row">
    {bestSeller.length > 0 ? (
      bestSeller.map((course, index) => (
        <div className="col-md-6 col-lg-3 mb-4" key={index}>
          <Link href={`/YogaClasses/Yoga-Courses/Course-Details/${course.id}`} className="d-block instituteTxt">
            <figure><img src={course.image} alt={course.name} /></figure>
            <h3 className="fw-bold">{course.name}</h3>
            <p className="text-secondary">Category: {course.category}</p>

            <div className="d-flex gap-3 align-items-center mb-2 pt-1">
              <span className="fs-6 fw-bold text-black">${course.price}</span>
              <span className="fs-9 badge text-bg-warning">{course.tag}</span>
            </div>
          </Link>
        </div>
      ))
    ) : (
      <div className="text-center text-muted py-4">No data.</div>
    )}
  </div>
</div>

            </div>

        </div>
    </section>


    {/* ----------------------------------------------------------------Instructor----------------------------------------------------------- */}
   <section className="instructorSection">
        <div className="container">
            <div className="section-heading text-start mw-100 mx-0 pb-4">
                <img src="/images/landingpage/watermark.png" width="50"/>
                <h2> {itemTypeList[0]?.instructor_title || 'Our Instructor'}</h2>
                <p>{itemTypeList[0]?.instructor_subtitle || 'Lorem Ipsum simply dummy text here for typesetting industry '}</p>
            </div>
            <div className="row">
              {practitioners.length > 0 && practitioners?.map((emp,index)=>(
                <div className="col-md-6 col-lg-6 col-xl-3 px-md-2 mb-3" key={index}>
   <Link href={'/LandingPage/components/MeetFamily'} style={{textDecoration:'none'}}>
                    <div className="instructorBox" >
                        <figure>
                          <img src={`${process.env.NEXT_PUBLIC_API_URL}/${emp?.user?.file}` }alt={emp?.user?.name}/>
                        </figure>

                        {/* <figure className="m-0">
                                <div
                                  className="d-flex justify-content-center align-items-center rounded-circle"
                                  style={{
                                    width: "50px",
                                    height: "50px",
                                    backgroundColor: "#E0E0E0",
                                    fontSize: "22px",
                                    fontWeight: "bold",
                                    color: "#662A09",
                                  }}
                                >
                                  {getInitials(
                                    emp?.user?.name
                                  )}
                                </div>
                              </figure> */}
                        <div className="">
                            <strong>{emp?.user?.name || 'N/A'}</strong>
                            <p> {emp?.designation || 'N/A'}</p>
                            <span><b>{emp?.average_ratings?.overall_review || "N/A"}</b><img src="/images/landingpage/starfill.svg" alt=""/> Instructor Rating</span>
                        </div>
                    </div>
                </Link>
                </div> 
              ))}
               
              
            </div>
        </div>
    </section>


    {/* ----------------------------------------------------------------------ALL Courses---------------------------------- */}

       <section className="allCourseSection">
        <div className="container">
            <div className="section-heading text-start mw-100 mx-0 pb-4">
                <img src="/images/landingpage/watermark.png" width="50"/>
                <h2>{itemTypeList[0]?.all_courses_title || 'All Courses '}</h2>
                <p>{itemTypeList[0]?.all_courses_subtitle || 'Lorem Ipsum simply dummy text here for typesetting industry'}</p>
            </div>
            <div className="row px-lg-1">
              {/* {console.log("courses",courses)} */}
                {courses?.length > 0 &&  courses.map((course, index) => (
                <div className="col-md-12 col-lg-6 px-lg-2 mb-3" key={index}>
                    <Link
          href={`/YogaClasses/Yoga-Courses/Course-Details/${course.id}`}
       style={{textDecoration:'none'}}
        >
                    <div className="allCourseBx">
                        <figure>
                            <img src={course?.image} alt=""/>
                        </figure>
                        <div className="">
                            <div className="d-flex justify-content-between gap-2 mb-1">
                                <strong>{course?.name || 'N/A'} </strong>
                                <b>${course?.price || 'N/A'}</b>
                            </div>
                            {/* <p className="pe-md-4">Increase your flexibility and range of motion, energise your body and improve your yoga skills in 15 minutes a day.</p> */}
                                                       <p>
  {course?.name
    ? `${course.name.replace(/<[^>]+>/g, '').slice(0, 115)}${
        course.name.replace(/<[^>]+>/g, '').length > 115 ? '...' : ''
      }`
    : 'N/A'}
</p>

                         {/* replace your star block inside "All Courses" card */}
<div className="d-flex align-items-center reviewCount mb-3">
  {(() => {
    const avg = Number(course?.ratingAvg || 0);
    const full = Math.floor(avg);
    const frac = avg - full;

    return [1, 2, 3, 4, 5].map((star) => {
      const filled = star <= full;
      const half = !filled && star === full + 1 && frac >= 0.5;

      return (
        <span
          key={star}
          className={`star ${filled ? "filled" : half ? "half-filled" : ""} pt-0 me-1`}
          style={{
            display: "inline-block",
            fontSize: "20px",
            color: filled ? "#F4B400" : half ? "#F4B40080" : "#E0E0E0",
          }}
        >
          ★
        </span>
      );
    });
  })()}
  <span className="ms-2 fs-9 text-secondary">
    {Number(course?.ratingAvg || 0).toFixed(1)} ({course?.ratingTotal || 0})
  </span>
</div>

                        </div>
                    </div>
                    </Link>
                </div>
                ))}
             
            </div>
        </div>
    </section>
     

      <FooterSection />
    </>
  );
};
export default YogaCourses;
