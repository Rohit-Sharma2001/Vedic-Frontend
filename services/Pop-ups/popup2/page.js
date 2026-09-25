// components/DynamicModal2.jsx

"use client";
import React from "react";

export default function DynamicModal2({
  show,
  onClose,
  title,
  heading,
  description,
  buttonText,
  onButtonClick
}) {
  if (!show) return null;

  return (
    <div className="modal fade show d-block verifiedModal" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">

          <div className="modal-header border-0">
            <h1 className="modal-title fs-6">{title}</h1>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body pt-0">
            <form>
              <div className="mb-3 text-center">
                <lottie-player
                  src="/images/landingpage/verify-yoga.json"
                  background="transparent"
                  speed="1"
                  style={{ width: "180px", height: "180px", margin: "auto" }}
                  loop
                  autoPlay
                />
              </div>

              <h6 className="text-center">{heading}</h6>
              <p className="text-center">{description}</p>

              <div className="text-center my-2 mt-4">
                <button
                  type="button"
                  className="btn btn-primary w-75"
                  onClick={onButtonClick}
                >
                  {buttonText}
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
