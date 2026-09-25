"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const SubHeader = ({ 
  items = [], 
  className = "", 
  backgroundColor = "#F8F5F0", 
  textColor = "#662A09",
  activeColor = "#71318B",
  hoverColor = "#865940",
  topPosition = 70
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  // const [hideOnScroll, setHideOnScroll] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const dropdownRefs = useRef({});

  // useEffect(() => {
  //   let lastScrollY = window.scrollY;

  //   const handleScroll = () => {
  //     if (window.scrollY < lastScrollY) {
  //       // scrolling up → hide
  //       setHideOnScroll(true);
  //     } else {
  //       // scrolling down → show
  //       setHideOnScroll(false);
  //     }
  //     lastScrollY = window.scrollY;
  //   };

  //   window.addEventListener("scroll", handleScroll);
  //   return () => window.removeEventListener("scroll", handleScroll);
  // }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
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

  const defaultItems = [
    { name: "Home", route: "/" },
    { name: "Ayurveda", route: "/LandingPage/components/AyurvedaHealing",},
    { name: "Yoga ", route: "/YogaClasses/components/JoinYogaClasses",},
    { name: "Programs", route: "/Events",
      children: [
        { name: "Events", route: "/Events" },
        { name: "Courses", route: "/YogaClasses/Yoga-Courses" },
        // { name: "Weight Management", route: "/programs/weight-management" }
      ]
    },
    { 
      name: "Shop", 
      route: "/Shop",
      // children: [
      //   { name: "Herbal Products", route: "/shop/herbal" },
      //   { name: "Supplements", route: "/shop/supplements" },
      //   { name: "Books", route: "/shop/books" }
      // ]
    },
    { 
      name: "Education", 
      route: "/LandingPage/components/Blogs",
      children: [
        { name: "Blogs", route: "/LandingPage/components/Blogs" },
        // { name: "Workshops", route: "/education/workshops" },
        // { name: "Certification", route: "/education/certification" }
      ]
    },
    
    
  ];

  const subHeaderItems = items.length > 0 ? items : defaultItems;

  const isActive = (route) => {
    if (route.includes("#")) {
      return pathname === route.split("#")[0];
    }
    return pathname === route;
  };
  return (
    <div 
      // className={`sub-header ${className} ${hideOnScroll ? "hide" : ""}`}
      className={`sub-header ${className}`}
      style={{
        background: "rgba(255, 255, 255, 0.75)",     // frosted white
 backdropFilter: "blur(12px)",
 WebkitBackdropFilter: "blur(12px)",          // Safari support
 borderBottom: "1px solid rgba(255,255,255,0.3)",
 boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
      }}
    >
      <div className="container-fluid">
        <div className="sub-header-content">
          {/* Desktop Menu */}
          <nav className="sub-nav d-none d-md-flex">
            <ul className="sub-nav-list">
              {subHeaderItems.map((item, index) => (
                <li key={index} className="">
                  {item.children ? (
                    <div
                      className="dropdown sub-dropdown"
                      ref={(el) => (dropdownRefs.current[item.name] = el)}
                      onMouseEnter={() => setOpenDropdown(item.name)}
                      onMouseLeave={() => setOpenDropdown(null)}
                    >
                      <a
                        className={`sub-nav-link ${isActive(item.route) ? 'active' : ''}`}
                        onClick={() => {
                          if (item.route) {
                            router.push(item.route);
                          }
                        }}
                        style={{ 
                          cursor: item.route ? "pointer" : "default",
                          color: textColor,
                          textDecoration: 'none',
                          '--hover-color': hoverColor,
                        }}
                        href={item.route ? undefined : "javascript:void(0);"}
                      >
                        <span className="sub-nav-text">{item.name}</span>
                      </a>
                      <ul
                        className={`dropdown-menu ${
                          openDropdown === item.name ? "show" : ""
                        }`}
                      >
                        {item.children.map((child, idx) => (
                          <li key={idx}>
                            <a
                              className="dropdown-item"
                              style={{ cursor: "pointer" }}
                              onClick={() => {
                                console.log("Hello from SubHeader");
                                router.push(child.route || "/");
                                setOpenDropdown(null);
                              }}
                            >
                              {child.name}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <Link
                      href={item.route}
                      className={`sub-nav-link ${isActive(item.route) ? 'active' : ''}`}
                      style={{
                        color: textColor,
                        textDecoration: 'none',
                        '--hover-color': hoverColor,
                      }}
                    >
                      <span className="sub-nav-text">{item.name}</span>
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* Mobile Menu */}
          <div className="sub-nav-mobile d-md-none">
            <button 
              className="sub-nav-toggle"
              onClick={toggleMobileMenu}
              style={{ color: textColor }}
            >
              <span className="sub-nav-toggle-text">Quick Navigation</span>
              <span className={`sub-nav-toggle-icon ${isMobileMenuOpen ? 'open' : ''}`}>
                <span></span>
                <span></span>
                <span></span>
              </span>
            </button>
            
            {isMobileMenuOpen && (
              <div className="sub-nav-mobile-menu">
                <ul className="sub-nav-mobile-list">
                  {subHeaderItems.map((item, index) => (
                    <li key={index} className="sub-nav-mobile-item">
                      <Link 
                        href={item.route} 
                        className={`sub-nav-mobile-link ${isActive(item.route) ? 'active' : ''}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                        style={{
                          color: textColor,
                          marginTop:'20px',
                           textDecoration: 'none',
                        }}
                      >
                        <span className="sub-nav-text" style={{marginLeft:'10px'}}>{item.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
    .sub-header {
  position: sticky;   /* stays in view */
  top: ${topPosition}px;          /* dynamic top position based on header type */
  z-index: 500;
  background: #F8F5F0; /* ensure visible background */
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}


/* .sub-header.hide {
  transform: translateY(-100%);
  height: 0;
  opacity: 0;
  overflow: hidden;
  padding: 0 !important; 
} */


        .sub-header ul {
          margin: 0 !important;
          padding: 0 !important;
          list-style: none !important;
        }

        .sub-header a {
          text-decoration: none !important;
          border-bottom: none !important;
        }

        .sub-header-content {
          padding: 8px 0;
        }

        /* Desktop Styles */
        .sub-nav-list {
          display: flex !important;
          justify-content: center !important;
          align-items: center !important;
          gap: 24px !important;
          margin: 0 auto !important;
          padding: 0 !important;
          list-style: none !important;
          width: 100% !important;
        }

        .sub-nav-item {
          margin: 0;
        }
.sub-nav-link {
  font-size: 15px !important;
  letter-spacing: 0.3px;
  padding: 12px 0 !important;
}




.sub-nav-link:hover {
background-color: rgba(102, 42, 9, 0.05);
  border-radius: 4px;
  padding: 12px 8px;

}

.sub-nav-link::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -4px;
  width: 0;
  height: 2px;
  background-color: ${hoverColor};
  transition: width 0.3s ease;
}

.sub-nav-link:hover::after {
  width: 100%;
}

        .sub-nav-text {
          font-family: 'Poppins', sans-serif;
        }

        /* Mobile Styles */
        .sub-nav-mobile {
          position: relative;
        }

        .sub-nav-toggle {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: 10px 14px;
          background: #F8F5F0;
          border: 1px solid rgba(102, 42, 9, 0.15);
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
        }

        .sub-nav-toggle-text {
          font-family: 'Poppins', sans-serif;
        }

        .sub-nav-toggle-icon {
          display: flex;
          flex-direction: column;
          gap: 3px;
          width: 20px;
          height: 15px;
          transition: all 0.3s ease;
        }

        .sub-nav-toggle-icon span {
          width: 100%;
          height: 2px;
          background-color: currentColor;
          border-radius: 1px;
          transition: all 0.3s ease;
        }

        .sub-nav-toggle-icon.open span:nth-child(1) {
          transform: rotate(45deg) translate(5px, 5px);
        }

        .sub-nav-toggle-icon.open span:nth-child(2) {
          opacity: 0;
        }

        .sub-nav-toggle-icon.open span:nth-child(3) {
          transform: rotate(-45deg) translate(7px, -6px);
        }

        .sub-nav-mobile-menu {
          position: absolute;
          top: calc(100% + 6px);
          left: 0;
          right: 0;
          background: #FFFFFF;
          border: 1px solid rgba(102, 42, 9, 0.15);
          box-shadow: 0 8px 20px rgba(0,0,0,0.12);
          border-radius: 10px;
          z-index: 1000;
          animation: slideDown 0.25s ease;
          padding: 6px 0;
          max-height: 60vh;
          overflow-y: auto;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .sub-nav-mobile-list {
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .sub-nav-mobile-item {
          margin: 0;
        }

        .sub-nav-mobile-item + .sub-nav-mobile-item {
          border-top: 1px solid rgba(102, 42, 9, 0.08);
        }

        .sub-nav-mobile-link {
          display: block;
          width: 100%;
          padding: 14px 16px;
          text-decoration: none;
          font-size: 15px;
          line-height: 1.25;
          font-weight: 500;
          transition: background-color 0.2s ease, color 0.2s ease;
        }

        .sub-nav-mobile-link:hover {
          background-color: rgba(102, 42, 9, 0.06);
          text-decoration: none !important;
         
          color: inherit !important;
        }

        .sub-nav-mobile-link.active {
          background-color: transparent !important;
          font-weight: 600;
          color: inherit !important;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .sub-header {
            top: ${topPosition - 10}px; /* Adjust for mobile header height */
          }
        }

        @media (max-width: 576px) {
          .sub-nav-list {
            gap: 20px;
          }
          
          .sub-nav-link {
            padding: 8px 0;
            font-size: 13px;
            color: #3c2a1d !important;  /* darker brown */
  font-weight: 500;
          }
        }
/* Stronger override to kill Bootstrap underline */
.sub-header .sub-nav-link,
.sub-header .sub-nav-link span,
.sub-header .sub-nav-link:hover,
.sub-header .sub-nav-link:hover span {
  text-decoration: none !important;
  border-bottom: none !important;
}

/* Dropdown Styles */
.sub-dropdown {
  position: relative;
}

.sub-dropdown .dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 1000;
  display: none;
  min-width: 200px;
  padding: 8px 0;
  margin: 0;
  font-size: 14px;
  color: #212529;
  text-align: left;
  list-style: none;
  background-color: #fff;
  background-clip: padding-box;
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
  animation: fadeInDown 0.2s ease;
}

.sub-dropdown .dropdown-menu.show {
  display: block;
}

.sub-dropdown .dropdown-item {
  display: block;
  width: 100%;
  padding: 8px 16px;
  clear: both;
  font-weight: 400;
  color: #212529;
  text-align: inherit;
  text-decoration: none;
  white-space: nowrap;
  background-color: transparent;
  border: 0;
  transition: background-color 0.15s ease-in-out, color 0.15s ease-in-out;
}

.sub-dropdown .dropdown-item:hover,
.sub-dropdown .dropdown-item:focus {
  color: #1e2125;
  background-color: rgba(102, 42, 9, 0.08);
  text-decoration: none;
}

.sub-dropdown .dropdown-item:active {
  color: #fff;
  background-color: #865940;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

      `}</style>
    </div>
  );
};

export default SubHeader;
