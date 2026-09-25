'use client'
import { useEffect, useState } from 'react';
import Link from "next/link";
import { config } from 'services/config';
import { postApi } from 'services/api';
import 'app/(landingpage)/LandingPage/public/css/style.css'
import "flatpickr/dist/flatpickr.min.css";
import { useLanguage } from "context/languageContext";
import { usePathname } from 'next/navigation';

export default function PractitionerHeader({onSearch}) {

  const [employee, setEmployee] = useState(null);
  const { cartCount } = useLanguage();
  const [search, setSearch] = useState("");


  useEffect(() => {
    fetchEmployeeDetails();
  }, []);

  const filterData = ()=>{
   if (onSearch) {
      onSearch(search);
    }
  }

  const fetchEmployeeDetails = async () => {
    try {

      const employeeId = JSON.parse(localStorage.getItem("user") || JSON.stringify({}));;
      const endpoint = config.viewEmployeeByUserId;
      const data = {
        userId: employeeId?._id
      }

      const response = await postApi(endpoint, data);

      console.log('employee', response.data?.employee)
      if (response.statusCode === 201 || response.statusCode === 200) {
        //   console.log("Employee Response:",response.data?.employee)
        setEmployee(response.data?.employee);


      }
    } catch (error) {
      console.error("Error fetching employee:", error);
    }
  };
   const pathname = usePathname();

  const showFilter = pathname === '/Employee-Portal/components/Product';

  return (
    <>
      <div className="mainHeaderchat d-flex flex-wrap justify-content-between align-items-center">
        <Link
          href={"/Employee-Portal/components/Dashboard"}
          className="navbar-brand p-0 d-flex flex-column align-items-start brandWrap"
        >
          <img
            src={"/images/landingpage/vedic-health.png"}
            width={160}
            height={"30px"}
            alt="Vedic Logo"
          />
        </Link>

        <div className="profileMain">
          <div className="d-flex align-items-center gap-3">
           {showFilter&& <div className="d-flex headerSearch">
              <div className="searchInput">
                <input type="text" className="form-control" value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Enter Your Product Name" />
                <button type="submit" className="headSearchBtn" onClick={filterData}><img src="/images/landingpage/search-icon.svg" width="16" alt="Search" /></button>
              </div>
            </div>}
            <div style={{ display: "flex", position: "relative" }}>
              <Link
                href="/Employee-Portal/components/Employee-cart"
                className="d-flex gap-md-2 loginBtn text-orange"
                aria-label="Cart"
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

            <a href="javascript:void(0)" className="profile-image">
              <img src={employee?.user?.file ? `${process.env.NEXT_PUBLIC_API_URL}/${employee?.user?.file}` : "/images/landingpage/profile-image.png"} alt="" />
            </a>
          </div>

        </div>

      </div>
      {/* <HeaderWithDropdown /> */}


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

    </>
  );
}
