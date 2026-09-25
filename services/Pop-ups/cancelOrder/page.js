// components/DynamicModal3.jsx

"use client";
import React from "react";

export default function CancelOrder({
  show,
  onClose,
  heading,
  description,
  onBackButtonClick,
  onYesButtonClick
}) {
  if (!show) return null;

  return (
    <div className="modal fade show d-block cancelModal" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">

          <div className="modal-header border-0">
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body pt-0">
            <form>
              <div className="mb-3 text-center">
                <lottie-player
                  src="/images/landingpage/women-doing-yoga.json"
                  background="transparent"
                  speed="1"
                  style={{ width: "200px", height: "200px", margin: "auto" }}
                  loop
                  autoPlay
                />
              </div>

              <h6 className="text-center">{heading}</h6>
              <p className="text-center">{description}</p>
                 <div className="modal-footer justify-content-center border-0 pt-2 pb-4">
                    <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" onClick={onBackButtonClick}>Back</button>
                    <button type="button" className="btn btn-primary" onClick={onYesButtonClick}>Yes</button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
