'use client';
import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import "../../../../../app/(landingpage)/LandingPage/public/css/style.css"
import Loader from 'services/Loader/page';

export default function ThankYouModal() {
  const router = useRouter();
  const modalRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const backToShop = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push('/YogaClasses/components/YogaClassSchedule');
    }, 700);
  };

  return (
    <>
      {loading && <Loader />}

      <div
        className="d-flex justify-content-center align-items-center vh-100"
      >
        <div className="modal-dialog modal-dialog-centered w-100" style={{ maxWidth: '400px' }}>
          <div className="modal-content border-0 ">
            <div className="modal-body text-center">
              <lottie-player
                src="/images/landingpage/cart.json"
                background="transparent"
                speed="1"
                style={{ width: '130px', height: '130px', margin: 'auto' }}
                loop
                autoplay
              ></lottie-player>
              <h2 className="fs-5 mt-3">Thank you for joining! Your Class registration and payment have been successfully completed.</h2>
              <p className="px-3">Registration successful — check your email for Class details and joining instructions</p>
              <div className="modal-footer justify-content-center border-0">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={backToShop}
                >
                  Back
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

    </>
  );
}
