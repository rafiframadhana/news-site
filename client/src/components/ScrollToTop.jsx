import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' // Use instant for immediate scroll
    });
  }, [pathname]);

  // Scroll to top on page load/reload
  useEffect(() => {
    // Ensure scroll to top on initial load
    window.scrollTo(0, 0);
    
    // Handle page refresh/reload
    const handleBeforeUnload = () => {
      window.scrollTo(0, 0);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return null;
};

export default ScrollToTop;
