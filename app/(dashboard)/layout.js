'use client'
// import node module libraries
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// import theme style scss file
// import 'styles/theme.scss';
// import "bootstrap-icons/font/bootstrap-icons.css";
import Script from "next/script";

// import sub components
import NavbarVertical from '/layouts/navbars/NavbarVertical';
import NavbarTop from '/layouts/navbars/NavbarTop';

export default function DashboardLayout({ children }) {
  const [showMenu, setShowMenu] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.role === 'admin') {
          setIsAuthorized(true);
        } else {
          router.push('/'); 
        }
      } else {
        router.push('/'); // 🚫 redirect if not logged in
      }
    } catch (err) {
      console.error('Error checking role:', err);
      router.push('/');
    }
  }, [router]);

  const ToggleMenu = () => setShowMenu(!showMenu);

  if (!isAuthorized) {
    return null; // avoid flicker while checking
  }

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');
        
        * {
          font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        }
        body {
          font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        }
        #db-wrapper {
          font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        }
      `}</style>
      <div id="db-wrapper" className={`${showMenu ? '' : 'toggled'}`}>
        <div className="navbar-vertical navbar">
          <NavbarVertical
            showMenu={showMenu}
            onClick={(value) => setShowMenu(value)}
          />
        </div>
        <div id="page-content">
          <div className="header">
            <NavbarTop
              data={{
                showMenu: showMenu,
                SidebarToggleMenu: ToggleMenu,
              }}
            />
          </div>
          {children}
        </div>
      </div>
    </>
  );
}

