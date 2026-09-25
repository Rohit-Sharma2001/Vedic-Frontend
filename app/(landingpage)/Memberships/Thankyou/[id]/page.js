'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import "../../../../../app/(landingpage)/LandingPage/public/css/style.css";
import Loader from 'services/Loader/page';
import { postApi, postApiWithFile, updateApiWithFile } from "services/api";
import { config } from "services/config";


export default function ThankYouModal(props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { id } = props.params
  // console.log('params', id)

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async (page) => {
    try {
      const body = { id: id, user_id: JSON.parse(localStorage.getItem("user"))._id }
      const response = await postApi(config.getMemberShipByPaymentId, body);
      console.log("ll")
      if (response?.data && response?.data?.data?.membership_id) {
        const user = JSON.parse(localStorage.getItem("user"));

        user.membershipId = response.data.data.membership_id; // update field

        localStorage.setItem("user", JSON.stringify(user));
      }
      // setPlans(response.result || []);
      // setTotalPages(response.totalPages || 1);
    } catch (error) {
      console.error("Error fetching plans:", error);
    }
  };
  const handleLoginRedirect = () => {
    setLoading(true);

    // 🧹 Clear user data before redirect
    // localStorage.clear();
    // localStorage.setItem("membershipId", id)
    // const user = JSON.parse(localStorage.getItem("user"));

    // user.membershipId = id; // update field

    // localStorage.setItem("user", JSON.stringify(user));
    // Small delay for loader UX
    setTimeout(() => {
      setLoading(false);
      router.push('/Memberships'); // ✅ Navigate to login page
    }, 500);
  };

  return (
    <>
      {loading && <Loader />}

      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="modal-dialog modal-dialog-centered w-100" style={{ maxWidth: '400px' }}>
          <div className="modal-content border-0">
            <div className="modal-body text-center">
              <lottie-player
                src="/images/landingpage/cart.json"
                background="transparent"
                speed="1"
                style={{ width: '130px', height: '130px', margin: 'auto' }}
                loop
                autoplay
              ></lottie-player>
              <h2 className="fs-5 mt-3">Thank you for your purchase!</h2>
              <p className="px-3">Your membership was purchased successfully.</p>
              <div className="modal-footer justify-content-center border-0">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleLoginRedirect}
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
