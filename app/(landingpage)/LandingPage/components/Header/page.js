// app/components/Header.js
"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useLanguage } from "context/languageContext";
import { useRouter, usePathname } from "next/navigation";
import { checkIsOwner } from "services/config";
import Swal from "sweetalert2";

const Header = ({ arrayheader }) => {
  
  const [isOwner, setIsOwner] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [userData,setUserData]= useState()

  const dropdownRefs = useRef({});
  const { translations, isLoggedIn, logout } = useLanguage();
  const profileRef = useRef(null);
  const pathname = usePathname();
  const router = useRouter();

 const newarrayheader = [
  { name: "Home", route: "/" },
   {
    name: "Memberships",
    route:"/Memberships",
    children: [
      { name: "Memberships", route: "/Memberships" },

    ]
  },
  {
    name: "Ayurveda",
    route:"/Appointment/components/BookAppointment",
    children: [
      { name: "Book Online", route: "/Appointment/components/BookAppointment" },
       { name: "Services", route: "/Appointment/components/BookAppointment" },
      // { name: "Memberships", route: "/Memberships" },
      { name: "Testimonials", route: "/LandingPage/components/YogaClassesPage" },

    ]
  },
   { 
    name: "Shop",
    route:"/Shop",
    children: [
      { name: "Products", route: "/Shop/products" },
      //  { name: "Doshas", route: "/LandingPage/components/YourDoshas" },
    ]
  },
  {
    name: "Yoga ",
    route:"/YogaClasses/components/YogaClassSchedule",
    children: [
      { name: "Schedule", route: "/YogaClasses/components/YogaClassSchedule" },
       { name: "Watch", route: "/YogaClasses/components/JoinYogaClasses" },
      // { name: "Gallery", route: "/LandingPage/components/Gallery" },
    ]
  },
   {
    name: "Events",
    route:"/Events",
    children: [
      { name: "Events", route: "/Events" },
       { name: "Online Courses", route: "/YogaClasses/Yoga-Courses" },
    ]
  },
   { name: "Education", route: "/LandingPage/components/Blogs" },
   {
    name: "Amita Jain",
    route:"/LandingPage/components/AmitaHome",
    children: [
      { name: "Schedule", route: "/YogaClasses/components/YogaClassSchedule" },
      { name: "Free Clinic", route: "/LandingPage/components/FreeClinic" },
      { name: "Classes", route: "/YogaClasses/components/JoinYogaClasses" },
      { name: "Book & Articles", route: "/LandingPage/components/BookArticles" },
      { name: "Seminars", route: "/LandingPage/components/TalksByAmita" },
      { name: "Case Stories", route: "/LandingPage/components/CaseStories" },
      { name: "Yoga Gallery", route: "/LandingPage/components/Gallery" },
      { name: "Our Team", route: "/LandingPage/components/MeetFamily" },
      { name: "Doshas", route: "/LandingPage/components/YourDoshas" },
      { name: "About", route: "/LandingPage/components/AmitajainLandingPage" },
    ]
  },

  
];
  useEffect(() => {
    setIsOwner(checkIsOwner());
  }, []);

  useEffect(() => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  setUserData(user)
  const role = user?.role;
  const currentPath = pathname;

  // If user is practitioner but visiting NON Employee-Portal pages
  // if (role === "practitioner" && !currentPath.includes("Employee-Portal")) {
  //   Swal.fire({
  //     title: "Access Denied",
  //     text: "You are not allowed to visit this page.",
  //     icon: "error",
  //     confirmButtonText: "Go to Login",
  //   }).then(() => {
  //      logout();     
  //     router.push("/Log-in");
  //   });
  // }
}, [pathname]);

  const toggleNavbar = () => setIsNavOpen(!isNavOpen);
  const toggleSearch = () => setIsSearchOpen(!isSearchOpen);
  const toggleProfileDropdown = () =>
    setIsProfileDropdownOpen(!isProfileDropdownOpen);

 const logouta = () => {
  logout();               // clear session
  router.push("/Log-in"); // redirect user
};


  // close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      const isInsideSomeDropdown = Object.values(dropdownRefs.current).some(
        (node) => node && node.contains(event.target)
      );
      if (!isInsideSomeDropdown) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
  const handleOutside = (e) => {
    if (profileRef.current && !profileRef.current.contains(e.target)) {
      setIsProfileDropdownOpen(false);
    }
  };

  document.addEventListener("mousedown", handleOutside);
  document.addEventListener("touchstart", handleOutside);
  return () => {
    document.removeEventListener("mousedown", handleOutside);
    document.removeEventListener("touchstart", handleOutside);
  };
}, []);

  return (
    <header className="mainHeader">
      <nav className="navbar navbar-expand-lg">
        <div className="container-fluid">
          {/* Logo */}
       {/* Dynamic Logo Link */}
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
          pathname.includes("/LandingPage/components/Schedule") ||
           pathname.includes("/LandingPage/components/FreeClinic") ||
            pathname.includes("/LandingPage/components/BookArticles") ||
             pathname.includes("/LandingPage/components/TalksByAmita") ||
              pathname.includes("/LandingPage/components/CaseStories") ||
               pathname.includes("ContactAmita") ||
                pathname.includes("/LandingPage/components/ArticleDetails/") ||
          pathname.includes("AmitaHome")
        ? "/images/landingpage/Amita-Jain-logo.png"
        : "/images/landingpage/vedic-health.png"
    }
    width={70}
    height={"50px"}
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
            pathname.includes("/LandingPage/components/BookArticles") ||
             pathname.includes("/LandingPage/components/TalksByAmita") ||
              pathname.includes("/LandingPage/components/CaseStories") ||
               pathname.includes("ContactAmita") ||
          pathname.includes("AmitaHome")
      ? "Healing with Wisdom & Compassion"
      : ""}
  </span>
</Link>


          {/* Nav Links */}
          <div
            className={`navbar-collapse ${isNavOpen ? "show" : ""}`}
            id="navbarContent"
          >
            <ul className="navbar-nav mx-auto">
              {newarrayheader?.map((item, index) => (
                <li className="nav-item" key={index}>
                  {item.children ? (
                    <div
                      className="dropdown ShopDrop"
                      ref={(el) => (dropdownRefs.current[item.name] = el)}
                      onMouseEnter={() => setOpenDropdown(item.name)}
                      onMouseLeave={() => setOpenDropdown(null)}
                    >
                     <a
  className={`nav-link ${openDropdown === item.name ? "navLinkActive" : ""}`}
  onClick={() => {
    if (item.route) router.push(item.route);
  }}
  style={{ cursor: item.route ? "pointer" : "default" }}
  href={item.route ? undefined : "javascript:void(0);"}
>
  {translations[item.name] || item.name}
                        {/* <img
                          src="/images/landingpage/drop-down-icon.svg"
                          alt=""
                          className="ms-1"
                          width="12"
                          /> */}
                   
                          </a>
                      <ul
                        className={`dropdown-menu mt-0.5 ${
                          openDropdown === item.name ? "show" : ""
                        }`}
                      >
                        {item.children.map((child, idx) => (
                          <li key={idx}>
                            <a
                              className="dropdown-item mt-0.5"
                              style={{ cursor: "pointer" }}
                              onClick={() => {
                               
                                router.push(child.route || "/");
                                setOpenDropdown(null);
                              }}
                            >
                              {translations[child.name] || child.name}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <Link href={item.route || "/"} className="nav-link">
                      {translations[item.name] || item.name}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Right-side Icons */}
          <div className="d-flex gap-3 align-items-center justify-content-center">
            {isLoggedIn ? (
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
                  <ul className="dropdown-menu show position-absolute">
                    <li>
  <button
    type="button"
    className="dropdown-item"
    onClick={() => {
      setIsProfileDropdownOpen(false);
      router.push("/profile?tab=profile");
    }}
  >
    My Profile
  </button>
</li>

                    <li>
                      <Link className="dropdown-item" href="/profile?tab=orders">
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
                        href="/profile?tab=waitlist"
                      >
                        My Waitlist
                      </Link>
                    </li>
                      <li>
                      <Link
                        className="dropdown-item"
                        href="/profile?tab=YogaClasses"
                      >
                        Yoga Classes
                      </Link>
                    </li>
                      <li>
                      <Link
                        className="dropdown-item"
                        href="/profile?tab=Events"
                      >
                        Events
                      </Link>
                    </li>
                      <li>
                      <Link
                        className="dropdown-item"
                        href="/profile?tab=invoices"
                      >
                        Invoices
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
                      <Link
                        className="dropdown-item"
                        href="/profile?tab=password"
                      >
                        Change Password
                      </Link>
                    </li>
                    {userData.role=="practitioner"&&<li>
                      <a className="dropdown-item" href='/Employee-Portal/components/Dashboard'>
                        Move To Practitioner
                      </a>
                    </li>}
                    
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
            ) : (
              <Link
                href="/Log-in"
                className="d-flex gap-md-2 loginBtn text-orange1"
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
                {translations["login"] || "Login"}
              </Link>
            )}

            <button
              type="button"
              className="searchToggle bg-transparent border-0 p-0 d-md-none"
              onClick={toggleSearch}
            >
              <img
                src="/images/landingpage/search-icon.svg"
                width={18}
                alt="Toggle Search"
              />
            </button>

            <button
              className="navbar-toggler"
              type="button"
              onClick={toggleNavbar}
            >
              <span className="navbar-toggler-icon" />
            </button>
          </div>
        </div>
      </nav>
         {/* Inline styles for tagline */}
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

  

  /* ✅ underline hover animation for top nav items */
  /* ✅ underline hover animation for top nav items (left-aligned to text) */
:global(.navbar-nav .nav-link) {
  position: relative;
  display: inline-block;
  padding-bottom: 6px; /* room for underline */

  /* 🔥 key fix: remove bootstrap horizontal padding so underline matches text */
  padding-left: 0 !important;
  padding-right: 0 !important;

  /* keep spacing between items after removing padding */
  margin: 0 6px;

  text-align: left;
}

:global(.navbar-nav .nav-link::after) {
  content: "";
  position: absolute;
  left: 0;
  bottom: 2px;
  width: 100%;
  height: 2px;
  background: #181818;
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

export default Header;
