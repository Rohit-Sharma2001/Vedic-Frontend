"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { config } from "services/config";
import { postApi } from "services/api";
import Loader from "services/Loader/page";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { useLanguage } from "context/languageContext";
import Swal from "sweetalert2";

const HeaderWithDropdown = () => {
  const pathname = usePathname();
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [userloggedin, setUserloggedin] = useState(false);
  const profileRef = useRef(null);
 const [isNavOpen, setNavOpen] = useState(false);
const [isSearchOpen, setSearchOpen] = useState(false);
  const shopDropdownRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [isProfileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const { cartCount,toggleShopCategory,shopCategory } = useLanguage();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [categorylist, setCategoryList] = useState([]);
  const { isLoggedIn, login, logout } = useLanguage();
  const router = useRouter();
const [isShopDropdownOpen, setShopDropdownOpen] = useState(false);
const [isProgramsDropdownOpen, setProgramsDropdownOpen] = useState(false);
const [isAyurvedaDropdownOpen, setAyurvedaDropdownOpen] = useState(false);
const [isMembershipDropdownOpen, setMembershipDropdownOpen] = useState(false)
const [isYogaDropdownOpen, setYogaDropdownOpen] = useState(false);
const [isAmitaDropdownOpen, setAmitaDropdownOpen] = useState(false);
const [userData,setUserData]=useState()

// close the mobile menu on route change
useEffect(() => {
  setNavOpen(false);
}, [pathname]);
const programsDropdownRef = useRef(null);
const ayurvedaDropdownRef = useRef(null);
const yogaDropdownRef = useRef(null);

const amitaDropdownRef = useRef(null);

useEffect(() => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user?.role;
  setUserData(user)
  const currentPath = pathname;

  // If user is practitioner but visiting NON Employee-Portal pages
  if (role === "practitioner" && !currentPath.includes("Employee-Portal")) {
    Swal.fire({
      title: "Access Denied",
      text: "You are not allowed to visit this page.",
      icon: "error",
      confirmButtonText: "Go to Login",
    }).then(() => {
       logout();     
      router.push("/Log-in");
    });
  }
}, [pathname]);


  const toggleDropdown = () => setDropdownOpen(!isDropdownOpen);
  const toggleProfileDropdown = () =>
    setProfileDropdownOpen(!isProfileDropdownOpen);

  const logouta = () => {
    logout();

    router.push("/Log-in");
  };

  useEffect(() => {
    fetchCategories(currentPage);
  }, [currentPage]);

  const fetchCategories = async (page) => {
    try {
      const endpoint = config.category;
      const data = {
        dropdown_type: "category",
        page: page,
        pageSize: pageSize,
      };
      const response = await postApi(endpoint, data);
      setCategoryList(response.result || []);
      setTotalPages(response.totalPages || 1);
      setTotalCount(response.totalCount || 0);
    } catch (error) {
      console.error("Error fetching categorylist:", error);
    }
  };

  const goToNextPage = (cat) => {
    setLoading(true);
    toggleShopCategory(cat._id)
    setTimeout(() => {
      setLoading(false);
    }, 500);
    router.push(`/Shop/products?category=${cat._id}`);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };
    // document.addEventListener("mousedown", handleClickOutside);
    // return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleClickOutsideShop = (event) => {
      if (
        shopDropdownRef.current &&
        !shopDropdownRef.current.contains(event.target)
      ) {
        setDropdownOpen(false);
      }
    };

    // document.addEventListener("mousedown", handleClickOutsideShop);
    // return () => {
    //   document.removeEventListener("mousedown", handleClickOutsideShop);
    // };
  }, []);

  return (
    <header className="mainHeader">
      {loading && <Loader />}
      <nav className="navbar navbar-expand-lg">
        <div className="container-fluid">
        <Link
  href={
    pathname.includes("Shop")
      ? "/Shop"
      : pathname.includes("YogaClasses")
      ? "/YogaClasses/components/JoinYogaClasses"
      : pathname.includes("AmitajainLandingPage") ||
        pathname.includes("ContactAmita") ||
        pathname.includes("AmitaHome")
      ? "/LandingPage/components/AmitaHome"
      : "/"
  }
  className="navbar-brand p-0 d-flex flex-column align-items-start brandWrap"
>
  <img
    src={
      pathname.includes("Shop")
        ? "/images/landingpage/Herb-Shop-logo.png"
        : pathname.includes("YogaClasses")
        ? "/images/landingpage/vedic-yoga.png"
        : pathname.includes("AmitajainLandingPage") ||
          pathname.includes("/LandingPage/components/AmitaHome") ||
           pathname.includes("/LandingPage/components/FreeClinic") ||
            pathname.includes("/LandingPage/components/BookArticles") ||
             pathname.includes("/LandingPage/components/TalksByAmita") ||
              pathname.includes("/LandingPage/components/CaseStories") ||
               pathname.includes("ContactAmita") ||
          pathname.includes("AmitaHome")
        ? "/images/landingpage/Amita-Jain-logo.png"
        : "/images/landingpage/vedic-health.png"
    }
    width={160}
    height={"30px"}
    alt="Vedic Logo"
  />
  <span className="logoTagline">
    {pathname.includes("Shop")
      ? "Pure Ayurvedic Products for Healthy Living"
      : pathname.includes("YogaClasses")
      ? "Move Freely, Breathe Deeply"
     : pathname.includes("AmitajainLandingPage") ||
          pathname.includes("/LandingPage/components/AmitaHome") ||
           pathname.includes("/LandingPage/components/FreeClinic") ||
           pathname.includes("/LandingPage/components/Schedule") ||
            pathname.includes("/LandingPage/components/BookArticles") ||
             pathname.includes("/LandingPage/components/TalksByAmita") ||
              pathname.includes("/LandingPage/components/CaseStories") ||
               pathname.includes("ContactAmita") ||
          pathname.includes("AmitaHome")
      ? "Healing with Wisdom & Compassion"
      : ""}
  </span>
</Link>



         <div
  id="navbarContent"
  className={`navbar-collapse collapse ${isNavOpen ? "show" : ""}`}
>

            <ul className="navbar-nav mx-auto">

 {/* -----------------------------------------------Home-------------------------------------------              */}
             
               {[{text:"Home" , route:"/"},].map((item, index) => (
                <li className="nav-item" key={index}>
                  <Link className="nav-link" href={item.route}>
                    {item.text}
                  </Link>
                </li>
              ))}

              
{/* ------------------------------------------------------Membership --------------------------------------               */}
                  <li className="nav-item">
  <div
    className="dropdown ShopDrop"
    ref={ayurvedaDropdownRef}
    onMouseEnter={() => setMembershipDropdownOpen(true)}
    onMouseLeave={() => setMembershipDropdownOpen(false)}
  >
    
    <a
  className={`nav-link ${isMembershipDropdownOpen ? "navLinkActive" : ""}`}
  style={{ cursor: "pointer" }}
  onClick={() => router.push("/Memberships")}
>
  Memberships
    {/* <img
        src="/images/landingpage/drop-down-icon.svg"
        alt=""
        className="ms-1"
        width="12"
      /> */}
</a>


    <ul className={`dropdown-menu mt-0.5 ${isMembershipDropdownOpen ? "show" : ""}`}>
      {[
        { text: "Memberships", route: "/Memberships" },
        // { text: "Retreats", route: "/Retreats" },
      ].map((item, index) => (
        <li key={index}>
          <Link
            href={item.route}
            className="dropdown-item mt-0.5"
            style={{ cursor: "pointer" }}
          >
            {item.text}
          </Link>
        </li>
      ))}
    </ul>
  </div>
</li>

{/* ------------------------------------------------------Ayurveda--------------------------------------               */}
                  <li className="nav-item">
  <div
    className="dropdown ShopDrop"
    ref={ayurvedaDropdownRef}
    onMouseEnter={() => setAyurvedaDropdownOpen(true)}
    onMouseLeave={() => setAyurvedaDropdownOpen(false)}
  >
    
    <a
  className={`nav-link ${isAyurvedaDropdownOpen ? "navLinkActive" : ""}`}
  style={{ cursor: "pointer" }}
  onClick={() => router.push("/Appointment/components/BookAppointment")}
>
  Ayurveda
    {/* <img
        src="/images/landingpage/drop-down-icon.svg"
        alt=""
        className="ms-1"
        width="12"
      /> */}
</a>


    <ul className={`dropdown-menu mt-0.5 ${isAyurvedaDropdownOpen ? "show" : ""}`}>
      {[
        { text: "Book Online", route: "/Appointment/components/BookAppointment" },
        { text: "Services", route: "/Appointment/components/BookAppointment" },
        // { text: "Memberships", route: "/Memberships" },
        { text: "Testimonials", route: "/LandingPage/components/YogaClassesPage" },
        // { text: "Retreats", route: "/Retreats" },
      ].map((item, index) => (
        <li key={index}>
          <Link
            href={item.route}
            className="dropdown-item mt-0.5"
            style={{ cursor: "pointer" }}
          >
            {item.text}
          </Link>
        </li>
      ))}
    </ul>
  </div>
</li>
{/* -----------------------------------------------------Shop------------------------- */}
            
             <li className="nav-item">
  <div
    className="dropdown ShopDrop"
    ref={shopDropdownRef}
    onMouseEnter={() => setShopDropdownOpen(true)}
    onMouseLeave={() => setShopDropdownOpen(false)}
  >
   <a
  className={`nav-link ${isShopDropdownOpen ? "navLinkActive" : ""}`}
  style={{ cursor: "pointer" }}
  onClick={() => router.push("/Shop")}
>
  Shop
</a>


    <ul className={`dropdown-menu mt-0.5 ${isShopDropdownOpen ? "show" : ""}`}>
      {/* {categorylist?.map((item, index) => (<>
        <li key={index}>
          <a
            className="dropdown-item mt-0.5"
            style={{ cursor: "pointer" }}
            onClick={() => goToNextPage(item)}
            title={item?.name}
          >
           {item?.name.length > 25
    ? item?.name.slice(0, 25) + "..."
    : item?.name}
          </a>
        </li>
       </>
      ))} */}

      <li>
          <a
            className="dropdown-item mt-0.5"
            style={{ cursor: "pointer" }}
            onClick={() => router.push("/Shop/products")}
            title={"Products"}
          >
           Products
          </a>
        </li>

        {/* <li>
          <a
            className="dropdown-item mt-0.5"
            style={{ cursor: "pointer" }}
            onClick={() => router.push("/LandingPage/components/YourDoshas")}
            title={"Doshas"}
          >
           Doshas
          </a>
        </li> */}
    </ul>
  </div>
</li>
{/* --------------------------------------------------Yoga------------------------------------------- */}
      <li className="nav-item">
  <div
    className="dropdown ShopDrop"
    ref={yogaDropdownRef}
    onMouseEnter={() => setYogaDropdownOpen(true)}
    onMouseLeave={() => setYogaDropdownOpen(false)}
  >
    <a
  className={`nav-link ${isYogaDropdownOpen ? "navLinkActive" : ""}`}
  style={{ cursor: "pointer" }}
  onClick={() => router.push("/YogaClasses/components/JoinYogaClasses")}
>
  Yoga
</a>


    <ul className={`dropdown-menu mt-0.5  ${isYogaDropdownOpen ? "show" : ""}`}>
      {[
        { text: "Schedule", route: "/LandingPage/components/AmitaHome" },
        { text: "Watch", route: "/YogaClasses/components/JoinYogaClasses" },
        //  { text: "Gallery", route: "/LandingPage/components/Gallery" },
        // { text: "Retreats", route: "/Retreats" },
      ].map((item, index) => (
        <li key={index}>
          <Link
            href={item.route}
            className="dropdown-item mt-0.5"
            style={{ cursor: "pointer" }}
          >
            {item.text}
          </Link>
        </li>
      ))}
    </ul>
  </div>
</li>

{/* ---------------------------------------------------------------Program-------------------------- */}
          <li className="nav-item">
  <div
    className="dropdown ShopDrop"
    ref={programsDropdownRef}
    onMouseEnter={() => setProgramsDropdownOpen(true)}
    onMouseLeave={() => setProgramsDropdownOpen(false)}
  >
    <a
  className={`nav-link ${isProgramsDropdownOpen ? "navLinkActive" : ""}`}
  style={{ cursor: "pointer" }}
  onClick={() => router.push("/Programs")}
>
  Events
</a>


    <ul className={`dropdown-menu mt-0.5 ${isProgramsDropdownOpen ? "show" : ""}`}>
      {[
        { text: "Events", route: "/Events" },
        { text: "Online Courses", route: "/YogaClasses/Yoga-Courses" },
        // { text: "Retreats", route: "/Retreats" },
      ].map((item, index) => (
        <li key={index}>
          <Link
            href={item.route}
            className="dropdown-item mt-0.5"
            style={{ cursor: "pointer" }}
          >
            {item.text}
          </Link>
        </li>
      ))}
    </ul>
  </div>
</li>

{/* --------------------------------------------Education------------------------------------------ */}


              {[{text:"Education" , route:"/LandingPage/components/Blogs"},].map((item, index) => (
                <li className="nav-item" key={index}>
                  <Link className="nav-link" href={item.route}>
                    {item.text}
                  </Link>
                </li>
              ))}


{/* --------------------------------------------------------------Amita Jain----------------------------- */}

          <li className="nav-item">
  <div
    className="dropdown ShopDrop"
    ref={amitaDropdownRef}
    onMouseEnter={() => setAmitaDropdownOpen(true)}
    onMouseLeave={() => setAmitaDropdownOpen(false)}
  >
   <a
  className={`nav-link ${isAmitaDropdownOpen ? "navLinkActive" : ""}`}
  style={{ cursor: "pointer" }}
  onClick={() => router.push("/LandingPage/components/AmitaHome")}
>
  Amita Jain
</a>


    <ul className={`dropdown-menu mt-0.5 ${isAmitaDropdownOpen ? "show" : ""}`}>
      {[
        { text: "Schedule", route: "/LandingPage/components/Schedule" },
        { text: "Free Clinic", route: "/LandingPage/components/FreeClinic" },
        { text: "Classes", route: "/YogaClasses/components/JoinYogaClasses" },
        { text: "Book & Articles", route: "/LandingPage/components/BookArticles" },
        { text: "Seminars", route: "/LandingPage/components/TalksByAmita" },
        { text: "Case Stories", route: "/LandingPage/components/CaseStories" },
        { text: "Yoga Gallery", route: "/LandingPage/components/Gallery" },
        { text: "Our Team", route: "/LandingPage/components/MeetFamily" },
        { text: "Doshas", route: "/LandingPage/components/YourDoshas" },
        { text: "About", route: "/LandingPage/components/AmitajainLandingPage" },

        // { text: "Retreats", route: "/Retreats" },
      ].map((item, index) => (
        <li key={index}>
          <Link
            href={item.route}
            className="dropdown-item mt-0.5"
            style={{ cursor: "pointer" }}
          >
            {item.text}
          </Link>
        </li>
      ))}
    </ul>
  </div>
</li>

             
            </ul>
          </div>

          <div className="d-flex gap-3 align-items-center justify-content-center">
            {/* <div className="headerSearch">
              <div className="searchInput">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter Your Keywords"
                />
                <button type="submit" className="headSearchBtn">
                  <img
                    src="/images/landingpage/search-icon.svg"
                    width="16"
                    alt="Search"
                  />
                </button>
              </div>
            </div> */}
{/* 
            <button
              type="button"
              className="searchToggle bg-transparent border-0 p-0 d-md-none"
            >
              <img
                src="/images/landingpage/search-icon.svg"
                width="18"
                alt="Search"
              />
            </button> */}

            
                {/* <Link href="/Shop/cart" className="d-flex gap-md-2 loginBtn text-orange">
                  <img className="d-md-none" src="/images/landingpage/carticon.svg" alt="Cart" width="20" />
                  <img className="d-none d-md-block" src="/images/landingpage/carticon.svg" alt="Cart" width="20" />
                </Link> */}
                <div style={{ display: "flex", position: "relative" }}>
                  <Link
                    href="/Shop/cart"
                    className="d-flex gap-md-2 loginBtn text-orange"
                  >
                    <img
                      className="mx-md-2"
                      src="/images/landingpage/cart-header-icon.svg"
                      alt="Cart"
                      width="20"
                    />
                    <span
                      className="position-absolute rounded-circle d-flex justify-content-center align-items-center"
                      style={{
                        backgroundColor: "#662A09",
                        color: "white",
                        width: "18px",
                        height: "18px",
                        fontSize: "12px",
                        top: "0",
                        right: "0",
                        transform: "translate(50%, -50%)",
                      }}
                    >
                      {cartCount}
                    </span>
                  </Link>
                </div>
                {isLoggedIn ? (
              <>
                <div className="dropdown profiledrop" ref={profileRef}>
                  <button
                    className="bg-transparent border-0 p-0"
                    type="button"
                    onClick={toggleProfileDropdown}
                  >
                    <img
                      src="/images/landingpage/profile-icon.svg"
                      alt="Profile"
                      width="20"
                    />
                  </button>
                  {isProfileDropdownOpen && (
                    <ul className="dropdown-menu  show position-absolute">
                      <li>
                        <Link className="dropdown-item" href="/profile" onClick={() => setProfileDropdownOpen(false)}>
                          My Profile
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item" href="/profile?tab=orders" onClick={() => setProfileDropdownOpen(false)}>
                          My Orders
                        </Link>
                      </li>
                      <li>
                      <Link
                        className="dropdown-item"
                        href="/profile?tab=appointments"
                      >
                        My Appointments
                      </Link>
                    </li>
                    <li>
                      <Link
                        className="dropdown-item"
                        href="/profile?tab=memberships"
                      >
                        Memberships
                      </Link>
                    </li>
                      <li>
                        <Link className="dropdown-item" href="/profile?tab=password" onClick={() => setProfileDropdownOpen(false)}>
                          Change Password
                        </Link>
                      </li>
                      {userData.role=="admin"&&<li>
                      <a className="dropdown-item" href='/admin'>
                        Move To Admin
                      </a>
                    </li>}
                      <li>
                        <button className="dropdown-item" onClick={logouta}>
                          Logout
                        </button>
                      </li>
                    </ul>
                  )}
                </div>
              </>
            ) : (
              <Link
                href="/Log-in"
                className="d-flex gap-md-2 loginBtn text-orange"
              >
                <img
                  className="d-md-none"
                  src="/images/landingpage/login-icon.svg"
                  alt="Login"
                  width="20"
                />
                <img
                  className="d-none d-md-block"
                  src="/images/landingpage/login-icon2.svg"
                  alt="Login"
                  width="20"
                />
                Login
              </Link>
            )}

            <button
  className="navbar-toggler"
  type="button"
  aria-controls="navbarContent"
  aria-expanded={isNavOpen}
  aria-label="Toggle navigation"
  onClick={() => setNavOpen(v => !v)}
>
  <span className="navbar-toggler-icon" />
</button>

          </div>
        </div>
      </nav>
      <style jsx>{`
  .brandWrap {
    line-height: 1;
  }
  .logoTagline {
    margin-top: 2px;
    font-size: 12px;
    font-weight: 500;
    color: #865940;
    opacity: 0.9;
    letter-spacing: 0.2px;
    white-space: nowrap;
  }

  :global(.navbar-nav .nav-link) {
    position: relative;
    display: inline-block;
    padding-left: 0 !important;
    padding-right: 0 !important;
    margin: 0 6px; /* keeps spacing between items after removing padding */
    text-align: left;
  }

  /* ✅ underline hover animation for top nav items */
  :global(.navbar-nav .nav-link) {
    position: relative;
    display: inline-block;
    padding-bottom: 6px; /* room for underline */
  }

  :global(.navbar-nav .nav-link::after) {
    content: "";
    position: absolute;
    left: 0;
    bottom: 2px;
    width: 100%;
    height: 2px;
    background: #71318B;
    transform: scaleX(0);
    transform-origin: left;
    opacity: 0;
    transition: transform 220ms ease, opacity 220ms ease;
  }

  :global(.navbar-nav .nav-link:hover::after),
  :global(.navbar-nav .nav-link.navLinkActive::after) {
    transform: scaleX(1);
    opacity: 1;
  }

  @media (max-width: 991px) {
    .logoTagline {
      font-size: 11px;
    }
  }
  @media (max-width: 575px) {
    .logoTagline {
      display: none;
    }
  }
`}</style>

    </header>
  );
};

export default HeaderWithDropdown;
