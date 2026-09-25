'use client'
import { useEffect, useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Sidebar from './components/sidebar/page';
import Header from '../LandingPage/components/Header/page';
// import SubHeader from '../LandingPage/components/SubHeader/page';
import ProfileForm from './components/my-profile/page';
import MyOrders from './components/my-orders/page';
import MyAppointments from './components/appointment/page';
import Memberships from './components/memberships/page';
import { useRouter } from "next/navigation";
import MyReviews from './components/my-reviews/page';
import MyWaitlist from './components/Waitlist/page';
import MyInvoices from './components/invoices/page';
import '../LandingPage/public/css/style.css'
import { useLanguage } from 'context/languageContext';
import ChangePassword from './components/change-password/page';
import { useSearchParams } from 'next/navigation';
import YogaClasses from './components/yogaClasses/page';
import Events from './components/events/page';


export default function ProfileComponent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [userData, setUserData] = useState({})
  const [defaultAdd,setDefaultAdd]=useState({})
  const { isLoggedIn, login, logout } = useLanguage();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
const router = useRouter();


useEffect(() => {
  if (tabParam) {
    setActiveTab(tabParam);
  }
  else{
    setActiveTab('profile');
  }
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  setUserData(user);
}, [tabParam]);

  function logouts(){
    logout()
    router.push("/Log-in");
  }
  useEffect(() => {
    let user = JSON.parse(localStorage.getItem("user") || JSON.stringify({}))
    setUserData(user)
 
  }, [])
  const arrayheader = [
     { name: "Home ", route: "/" },
  { name: "Ayurveda", route: "/LandingPage/components/AyurvedaHealing" },
  { name: "Yoga ", route: "/YogaClasses/components/JoinYogaClasses" },

  {
    name: "Programs",
    route:"/Events",
    children: [
      { name: "Events", route: "/Events" },
      { name: "Courses", route: "/YogaClasses/Yoga-Courses" },

    ]
  },
   { name: "Shop", route: "/Shop" },
  {
    name: "Education",
    route:"/LandingPage/components/Blogs",
    children: [
      { name: "Blogs", route: "/LandingPage/components/Blogs" },

    ]
  },
  { name: "Amita Jain", route: "/LandingPage/components/AmitaHome" },
  
];
const setTab = (tab) => {
  setActiveTab(tab);
  router.push(`/profile?tab=${tab}`);
};

  return (
    <>
        <Header arrayheader={arrayheader} />
   
      <div className="profilesection deatilMain">
        <div className="container-fluid">
          <div className="row">
          <Sidebar
  sidebarOpen={sidebarOpen}
  setSidebarOpen={setSidebarOpen}
  activeTab={activeTab}
  setActiveTab={setTab}   // ✅ pushes URL too
/>


            <div className="col-md-12 col-lg-9 ps-md-2 mb-3">
              <div className="myaccoutToggle d-flex d-lg-none align-items-center gap-3 mb-3 w-100 justify-content-between">
                <h3 className="fs-7 fw-semibold m-0">My Account</h3>
                <button
                  type="button"
                  className="accToggle"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                  <img src="/images/landingpage/toggle-icon.svg" alt="toggle" width={24} height={24} />
                </button>
              </div>

              <div className="cardBox">
                <h2 className="fs-6 fw-semibold mb-4">{activeTab === 'profile' ? 'My Profile' : activeTab === 'orders' ? 'My Orders' :activeTab === "appointments" ? "My Appointments" :activeTab === "memberships" ? "Memberships" : activeTab == "YogaClasses" ? "Yoga Classes" : activeTab == "Events" ? "Booked Events" :activeTab === "waitlist" ? "My Waitlist" :activeTab === "invoices" ? "My Invoices" : activeTab === "password" ? "Change Password" : activeTab === "reviews" ? "My Reviews" : ""}</h2>
                {activeTab === 'profile' && <ProfileForm />}
                {activeTab === 'orders' && <MyOrders />}
                {activeTab === 'reviews' && <MyReviews />}
                {activeTab === 'appointments' && <MyAppointments />}
                {activeTab == 'memberships' && <Memberships/>}
                {activeTab == 'YogaClasses' && <YogaClasses/>}
                {activeTab == 'Events' && <Events/>}
                {activeTab === 'waitlist' && <MyWaitlist />}
                {activeTab === 'invoices' && <MyInvoices />}
                {activeTab === 'password' && <ChangePassword />}
                {activeTab === 'logout' && logouts()}
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
