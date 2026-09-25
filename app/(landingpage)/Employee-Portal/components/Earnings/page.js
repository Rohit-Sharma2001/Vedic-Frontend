'use client';
import { useEffect, useState } from 'react';
import { useRouter } from "next/navigation";
import { useLanguage } from "context/languageContext";

import Highcharts from 'highcharts';
import HeaderWithDropdown from 'app/(landingpage)/LandingPage/components/HeaderWithDropdown/page';
import FooterSection from 'app/(landingpage)/LandingPage/components/Footer/page';
import 'app/(landingpage)/LandingPage/public/css/style.css';
import Link from 'next/link';
import { postApi } from 'services/api';
import { config } from 'services/config';
import Swal from "sweetalert2";
import PractitionerHeader from '../PractionerHeader/page';

export default function EmployeeEarnings() {
  const { logout } = useLanguage();

  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [topServices, setTopServices] = useState([]);
  const [employee, setEmployee] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("loggedIn") === "true";
    const role = localStorage.getItem("userRole");
    if (!isLoggedIn || role !== "practitioner") router.push("/Log-in");
  }, []);

  const handleLogout = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out of your account.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, logout",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
    }).then((result) => {
      if (result.isConfirmed) {
        logout();               // clear user data
        Swal.fire({
          title: "Logged Out",
          text: "You have been successfully logged out.",
          icon: "success",
          timer: 500,
          showConfirmButton: false,
        });
        setTimeout(() => {
          router.push("/Log-in"); // redirect to login page
        }, 500);
      }
    });
  };



  const fetchRevenueData = async (employee) => {

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const data = { employeeId: employee?._id };
      const response = await postApi(config.analytics, data);


      if (response.statusCode === 200 || response.statusCode === 201) {

        const analytics = response.data;
        setMonthlyRevenue(analytics.monthlyRevenue || []);
        setTopServices(analytics.topServices || []);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    }
  };

  useEffect(() => {
    if (typeof window === "undefined" || monthlyRevenue.length === 0) return;

    const categories = monthlyRevenue.map(item => item.month);
    const revenues = monthlyRevenue.map(item => item.revenue);

    Highcharts.chart('revenueChart', {
      chart: { type: 'column', backgroundColor: 'transparent' },
      title: { text: null },
      xAxis: { categories, crosshair: true },
      yAxis: {
        min: 0,
        title: { text: null },
        labels: {
          formatter() {
            return '$' + (this.value / 1000) + 'K';
          },
        },
      },
      legend: { enabled: false },
      credits: { enabled: false },
      tooltip: {
        shared: true,
        useHTML: true,
        formatter() {
          return `
      <b>${this.point.category}</b><br/>
      Revenue: <b>$${this.y.toLocaleString()}</b>
    `;
        },
      },

      plotOptions: {
        column: {
          borderRadius: 5,
          borderWidth: 0,
          color: {
            linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
            stops: [[0, '#71318B'], [1, '#F8AC6D']],
          },
        },
      },
      series: [{ name: 'Revenue', data: revenues }],
    });
  }, [monthlyRevenue]);

  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      try {
        const employeeId = JSON.parse(localStorage.getItem("user") || "{}");
        const data = { userId: employeeId?._id };
        const response = await postApi(config.viewEmployeeByUserId, data);

        if (response.statusCode === 200 || response.statusCode === 201) {

          setEmployee(response.data?.employee);
          fetchRevenueData(response.data?.employee);
        }
      } catch (error) {
        console.error("Error fetching employee:", error);
      }
    };

    fetchEmployeeDetails();

  }, []);

  return (
    <>
      <PractitionerHeader />
      <div className="profilesection " style={{ paddingTop: '40px' }}>
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-4 col-lg-3">
              {/* Sidebar */}
              <div className="sidebarBx">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h2 className="fs-7 fw-semibold m-0">My Account</h2>
                  <button type="button" className="closeSide d-lg-none">
                    <img src="/images/landingpage/close-icon.svg" alt="" width="24px" />
                  </button>
                </div>
                <ul className="sidebar">
                  <li><Link href={`/Employee-Portal/components/Dashboard`}><figure><img src="/images/landingpage/my-profile-icon.svg" alt="" width="20" /></figure>Dashboard</Link></li>
                  <li><Link href={`/Employee-Portal/components/Calender`}><figure><img src="/images/landingpage/calender-icon.svg" alt="" width="20" /></figure>Calender</Link></li>
                  <li><Link href={`/Employee-Portal/components/Earnings`} className="active"><figure><img src="/images/landingpage/earnings-icon.svg" alt="" width="16" /></figure>Earnings</Link></li>
                  <li><Link href={`/Employee-Portal/components/Product`}><figure> <img src="/images/landingpage/product-icon.svg" alt="" width="21" /></figure>Product</Link></li>
                  <li>
                    <Link
                      href={`/`}
                      className="d-flex align-items-center gap-2"
                    >
                      <figure>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <line x1="2" y1="12" x2="22" y2="12" />
                          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                        </svg>
                      </figure>
                      Move To Website
                    </Link>
                  </li>
                  <li>
                    <a
                      className="text-danger bg-transparent border-0 d-flex align-items-center gap-2"
                      onClick={handleLogout}
                      style={{ cursor: "pointer" }}
                    >
                      <figure>
                        <img src="/images/landingpage/logout-icon.svg" alt="" width="16" />
                      </figure>
                      Log out
                    </a>
                  </li>

                </ul>
              </div>
            </div>


            <div className="col-md-12 col-lg-9 ps-md-2 mb-3">
              <div className="row g-4">

                <div className="col-lg-8 mb-lg-0 mb-3">
                  <h3 className="fs-7 fw-semibold mb-3">Monthly Revenue</h3>
                  <div className="grayCard">
                    <small className="text-muted mb-2 d-block">Last 12 Month</small>
                    <div id="revenueChart" style={{ height: '260px' }}></div>
                  </div>
                </div>

                <div className="col-lg-4">
                  <h3 className="fs-7 fw-semibold mb-3">Top Services</h3>
                  <div className="grayCard">
                    {topServices && topServices.length > 0 ? (
                      topServices.map((s, index) => (
                        <div key={index} className="service-item d-flex justify-content-between align-items-center mb-3 p-2 rounded bg-light">
                          <div>
                            <h4 className="mb-1">{s.name}</h4>
                            <small className="text-muted">${s.revenue.toLocaleString()} • {s.sessions} Sessions</small>
                          </div>
                          <span className="percent-badge px-2 py-1 rounded" style={{ backgroundColor: '#e7f0ff', color: '#5170ff' }}>
                            {s.percentage}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted text-center">No data available</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <FooterSection />
    </>
  );
}
