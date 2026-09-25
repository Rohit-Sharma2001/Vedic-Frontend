// components/Sidebar.js
'use client'
import Image from 'next/image';

const Sidebar = ({ sidebarOpen, setSidebarOpen, activeTab, setActiveTab }) => {
  const links = [
    ['profile', 'my-profile-icon.svg', 'My Profile'],
    ['orders', 'myorders-orders-icon.svg', 'My Orders'],
    // ['invoices', 'invoices-icon.svg', 'Invoices'],
    ['appointments', 'appointments-icon.svg', 'Appointments'],
    ['waitlist', 'appointments-icon.svg', 'My Waitlist'],
    ['YogaClasses', 'invoices-icon.svg', 'Yoga Classes'],
    ['Events', 'invoices-icon.svg', 'Events'],
    ['memberships', 'memberships-icon.svg', 'Memberships'],
    ['invoices', 'invoices-icon.svg', 'Invoices'],
    ['reviews', 'review-icon.svg', 'Reviews'],
    ['password', 'password-change-icon.svg', 'Change Password'],
    ['logout', 'logout-icon.svg', 'Log out'],
  ];

  return (
    <div className="col-md-4 col-lg-3">
      <div className={`sidebarBx ${sidebarOpen ? 'show' : ''}`}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fs-7 fw-semibold m-0">My Account</h2>
          <button
            type="button"
            className="closeSide d-lg-none"
            onClick={() => setSidebarOpen(false)}
          >
            <Image src="/images/landingpage/close-icon.svg" alt="close" width={24} height={24} />
          </button>
        </div>
        <ul className="sidebar">
          {links.map(([key, img, label], idx) => (

            <li key={idx}>
              <a
                className={`w-100 text-start ${activeTab === key ? 'active' : ''}`}
                onClick={() => setActiveTab(key)}
                style={{ cursor: "pointer" }}
              >
                <figure>
                  <Image src={`/images/landingpage/${img}`} alt={label} width={20} height={20} />
                </figure>
                {label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
