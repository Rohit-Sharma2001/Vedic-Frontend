// services/pagination.js or wherever it's stored
import React from "react";
import 'services/page.css'
import "../app/(landingpage)/LandingPage/public/css/developer.css"
const Pagination = ({ currentPage, totalProducts, pageSize, onPageChange }) => {
  const totalPages = Math.ceil(totalProducts / pageSize);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  return (
    <div className="pagination cstmPagination">
      <button className="prevButton"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Prev
      </button>

      {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
        <button 
          key={page}
          onClick={() => handlePageChange(page)}
          className={`${page === currentPage ? "active" : ""} pageButtonLink`}
        >
          {page}
        </button>
      ))}

      <button className="nextButton"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
