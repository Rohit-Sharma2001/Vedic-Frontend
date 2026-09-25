"use client";

import React, { useState, useEffect } from "react";
import { postApi } from "services/api";
import { config } from "services/config";
import { checkIsOwner } from "services/config";
import Link from "node_modules/next/link";

const FAQSection = () => {
   const [isOwner, setIsOwner] = useState(false);
  const [faqs, setFaqs] = useState([]);
  const [openIndex, setOpenIndex] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  
   const handleEditClick = () => {
    // router.push("/admin/Faqs/FaqsBanner");
    window.location.href = "/admin/Faqs";
  };
  useEffect(() => {
  setIsOwner(checkIsOwner());
}, []);

  useEffect(() => {
    fetchInitialData();
  }, [currentPage]);

  const fetchInitialData = async () => {
    try {
      const endpoint = config.Faqs;
      const response = await postApi(endpoint, {});

      if (response.statusCode === 201) {
        setFaqs(response.FaqManagement || []); // Fetch FAQs from API
        setTotalPages(response.totalPages || 1);
        setTotalCount(response.totalCount || 0);
      }
    } catch (error) {
      console.error("Error fetching FAQs:", error);
    }
  };

  const handleToggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="faqSection">
       {isOwner &&<> 
       <div className="d-flex justify-content-center"> 
           <button
              className="btn btn-primary"
              style={{ marginLeft: "3px" }}
              onClick={handleEditClick}
            >
              <b>+</b> Edit Details
            </button>
           </div>
          </>}
      <div className="container">
        <div className="section-heading">
          <img
            src="/images/landingpage/watermark.png"
            width="50"
            className="d-block mx-auto"
            alt="Watermark"
          />
          <h2 className="mb-3">Popular Questions</h2>
        </div>
        <div className="accordion" id="accordionFaq">
          {faqs.map((faq, index) => (
            <div className="accordion-item" key={index}>
              <button
                className={`accordion-button ${openIndex === index ? "" : "collapsed"}`}
                type="button"
                onClick={() => handleToggle(index)}
                aria-expanded={openIndex === index ? "true" : "false"}
              >
                {faq.question} 
              </button>
              <div
                id={`faq${index + 1}`}
                className={`accordion-collapse collapse ${openIndex === index ? "show" : ""}`}
              >
                <div className="accordion-body">
                  
                  <div dangerouslySetInnerHTML={{ __html: faq.answer }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
