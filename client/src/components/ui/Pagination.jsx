import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  className = "" 
}) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is less than or equal to max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      // Determine start and end of middle section
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      
      // Add ellipsis if there's a gap after first page
      if (start > 2) {
        pages.push('...');
      }
      
      // Add middle pages
      for (let i = start; i <= end; i++) {
        if (i !== 1 && i !== totalPages) {
          pages.push(i);
        }
      }
      
      // Add ellipsis if there's a gap before last page
      if (end < totalPages - 1) {
        pages.push('...');
      }
      
      // Always show last page if it's not already included
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      {/* Previous Button */}
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`
          flex items-center justify-center w-8 h-8 rounded-md border transition-colors
          ${currentPage === 1 
            ? 'border-gray-200 text-gray-400 cursor-not-allowed' 
            : 'border-gray-300 text-gray-700 hover:bg-black hover:text-white hover:border-black'
          }
        `}
      >
        <FiChevronLeft className="w-4 h-4" />
      </button>

      {/* Page Numbers */}
      {getPageNumbers().map((page, index) => (
        <React.Fragment key={index}>
          {page === '...' ? (
            <span className="px-2 text-gray-500">...</span>
          ) : (
            <button
              onClick={() => handlePageChange(page)}
              className={`
                flex items-center justify-center w-8 h-8 rounded-md border text-sm font-medium transition-colors
                ${currentPage === page
                  ? 'bg-black text-white border-black'
                  : 'border-gray-300 text-gray-700 hover:bg-black hover:text-white hover:border-black'
                }
              `}
            >
              {page}
            </button>
          )}
        </React.Fragment>
      ))}

      {/* Next Button */}
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`
          flex items-center justify-center w-8 h-8 rounded-md border transition-colors
          ${currentPage === totalPages 
            ? 'border-gray-200 text-gray-400 cursor-not-allowed' 
            : 'border-gray-300 text-gray-700 hover:bg-black hover:text-white hover:border-black'
          }
        `}
      >
        <FiChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Pagination;
