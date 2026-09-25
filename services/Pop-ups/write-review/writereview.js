// components/DynamicModal.jsx

"use client";

import "../../../app/(landingpage)/LandingPage/public/css/style.css"
import React, { useEffect, useState } from 'react';
import './sty.css'
import { useRouter } from 'next/navigation';
import axios from 'axios'; // Import axios for API calls
import Swal from "sweetalert2";

import 'bootstrap/dist/css/bootstrap.min.css';
import { config } from 'services/config';
import { postApi ,postApiWithFile} from 'services/api';
import Loader from 'services/Loader/page';
import DynamicModal from 'services/Pop-ups/popup1/page';
import { useLanguage } from "context/languageContext";
import style from "react-syntax-highlighter/dist/esm/styles/hljs/a11y-dark";
export default function WriteReview({
    show,
    user,product,
    onClose,
    title,
    heading,
    description,
    buttonText,
    onButtonClick
}) {
    if (!show) return null;
    const router = useRouter();
    const [credentials, setCredentials] = useState({ rating: '', review: '', product_id: "", user_id: "" });
    const { isLoggedIn, login, logout } = useLanguage();
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({ email: '', password: '', apiError: '' });
    const [loading, setLoading] = useState(false);

const [reviewImages, setReviewImages] = useState([]);
    const [rating, setRating] = useState(0); // Default rating is 0

    // Handle the star click
    const handleStarClick = (star) => {
      setRating(star); // Set the rating to the clicked star number
    };

    // Handle file selection
const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10MB

const handleFileChange = (e) => {
  const input = e.target;
  const selectedFiles = Array.from(input.files || []);

  const tooLarge = selectedFiles.filter((f) => f.size > MAX_FILE_BYTES);
  if (tooLarge.length > 0) {
    Swal.fire({
      icon: "error",
      title: "File too large",
      text: `Please upload files up to 10 MB only. Rejected: ${tooLarge
        .map((f) => f.name)
        .join(", ")}`,
    });

    // Prevent selection: clear the file input so it doesn't stay selected
    input.value = "";
  }

  const validFiles = selectedFiles.filter((f) => f.size <= MAX_FILE_BYTES);
  if (validFiles.length === 0) return;

  // Optional: avoid duplicates by name+size
  setReviewImages((prev) => {
    const seen = new Set(prev.map((f) => `${f.name}:${f.size}`));
    const add = validFiles.filter((f) => !seen.has(`${f.name}:${f.size}`));
    return [...prev, ...add];
  });
};


// Remove selected image
const handleRemoveImage = (index) => {
  setReviewImages((prev) => prev.filter((_, i) => i !== index));
};



    // Handle form submission
  const handleLogin = async (e) => {
  e.preventDefault();
  const MAX_FILE_BYTES = 10 * 1024 * 1024;

if (reviewImages.some((f) => f.size > MAX_FILE_BYTES)) {
  Swal.fire({
    icon: "error",
    title: "File too large",
    text: "Please remove files larger than 10 MB before submitting.",
  });
  return;
}

  setLoading(true);

  try {
    const endpoint = config.addreviews;
    let body = { ...credentials, product_id: product, user_id: user, rating };

    // ✅ Attach images as files
    const files = { additionalImages: reviewImages };

    const response = await postApiWithFile(endpoint, body, files);

    setLoading(false);
    if (response.statusCode == 200 || response.statusCode == 201) {
      onClose();
    } else if (response.statusCode == 409) {
      alert(response.message);
      onClose();
    } else {
      setErrors({ ...errors, apiError: response.message || "Review failed" });
    }
  } catch (error) {
    setLoading(false);
    console.error(error);
    setErrors({ ...errors, apiError: error.response?.data?.message || "An error occurred" });
  }
};


    return (
        <div className="modal fade show d-block verifiedModal" style={{ background: "rgba(0,0,0,0.5)" }}>
         {loading&& <Loader/>}
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">

                    <div className="modal-header border-0">
                        <h1 className="modal-title fs-6">{"Write a Review "}</h1>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>

                    <div className="modal-body pt-0">
                        <form className="commentForm">

                            <div className="form-group mb-4">
                                <label>Enter Review</label>
                                <textarea className="form-control" onChange={(e) => { setCredentials({ ...credentials, review: e.target.value }) }}></textarea>
                                <span className="text-end">1000 Characters</span>
                            </div>
                            <div className="form-group mb-4">
  <label>Attach Images</label>
  <input
    type="file"
    multiple
    accept="image/*"
    className="form-control"
    onChange={handleFileChange}
  />
  <div className="d-flex gap-2 mt-2 flex-wrap">
    {reviewImages.map((img, index) => (
      <div key={index} className="position-relative">
        <img
          src={URL.createObjectURL(img)}
          alt="preview"
          width={80}
          height={80}
          style={{ objectFit: "cover", borderRadius: "5px" }}
        />
        <button
          type="button"
          className="position-absolute top-0 end-0"
          onClick={() => handleRemoveImage(index)}
        >
          ×
        </button>
      </div>
    ))}
  </div>
</div>

                            <div className="form-group mb-4">
                                <label>Rate</label>
                                {[1, 2, 3, 4, 5].map((star) => (
  <span
    key={star}
    className={`star ${star <=  rating ? 'filled' : ''} me-1 mt-0`}
    onClick={() => handleStarClick(star)} // Set rating on click
    style={{ display: 'inline-block',fontSize:40,lineHeight:"1" }} // Ensure stars are inline
  >
    ★
  </span>
))}
                            </div>
                            <div className="text-center my-2 mt-4">
                                <button type="button" className="btn btn-primary w-75" onClick={handleLogin}>
                                    Submit
                                </button>
                            </div>
                        </form>
                    </div>

                </div>
            </div>
        </div>
    );
}
