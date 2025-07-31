import { useState, useEffect } from "react";

export default function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    isVisible && (
      <div className="fixed bottom-5 right-5 z-50">
        <button
          onClick={scrollToTop}
          className="group relative w-10 h-10 rounded-full bg-gray-800 border-none font-semibold flex items-center justify-center cursor-pointer transition-all duration-300 overflow-hidden opacity-80 hover:w-32 hover:rounded-full hover:opacity-100 shadow-lg hover:shadow-xl"
        >
          <svg
            className="w-3 h-3 transition-all duration-300 fill-white group-hover:-translate-y-8"
            viewBox="0 0 384 512"
          >
            <path d="M214.6 41.4c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 141.2V448c0 17.7 14.3 32 32 32s32-14.3 32-32V141.2L329.4 246.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-160-160z" />
          </svg>
          <span className="absolute text-white text-xs opacity-0 group-hover:opacity-100 transition-all duration-300">
            Back to Top
          </span>
        </button>
      </div>
    )
  );
}
