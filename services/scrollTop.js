'use client';  // Ensures that this is only used on the client side
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const ScrollToTop = () => {
  const pathname = usePathname(); // Get the current path

  useEffect(() => {
    // Scroll to top whenever the pathname changes
    window.scrollTo(0, 0);
  }, [pathname]); // The effect will trigger whenever the pathname changes

  return null;
};

export default ScrollToTop;
