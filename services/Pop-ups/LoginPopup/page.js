// components/DynamicModal.jsx

"use client";

// import "../../../app/(landingpage)/LandingPage/public/css/style.css";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios"; // Import axios for API calls
// import "./public/css/style.css";/
import '../../../app/(landingpage)/LandingPage/public/css/style.css'
import "bootstrap/dist/css/bootstrap.min.css";
import { config } from "services/config";
import { postApi } from "services/api";
import Loader from "services/Loader/page";
import DynamicModal from "services/Pop-ups/popup1/page";
import { useLanguage } from "context/languageContext";
import { IoEyeOutline } from "react-icons/io5";
import { IoEyeOffOutline } from "react-icons/io5";

export default function LoginPopup({
  show,
  onClose,
  title,
  heading,
  description,
  buttonText,
  onButtonClick,
}) {
  if (!show) return null;
  const router = useRouter();
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const { isLoggedIn, login, logout } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    apiError: "",
  });
  const [loading, setLoading] = useState(false);
  function navigate() {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 100);
    router.push("/Sign-up");
  }
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // Validate form inputs
  const validateForm = () => {
    let valid = true;
    let newErrors = { email: "", password: "", apiError: "" };

    if (!credentials.email) {
      newErrors.email = "Email is required";
      valid = false;
    } else if (!validateEmail(credentials.email)) {
      newErrors.email = "Invalid email format";
      valid = false;
    }

    if (!credentials.password) {
      newErrors.password = "Password is required";
      valid = false;
    } else if (credentials.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  // Handle form submission
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setErrors({ ...errors, apiError: "" });

    try {
      const endpoint = config.signin;

      const response = await postApi(endpoint, credentials);
      if (response.statusCode == 200 || response.statusCode == 201) {
        const userCart = JSON.parse(localStorage.getItem("cartItems")) || [];
        localStorage.setItem("loggedIn", "true");
        localStorage.setItem("user", JSON.stringify(response.data));

        if (userCart.length > 0) {
          const apiEndpoint = config.addCartForNonLogin;
          const body = { userId: response.data._id, productIds: userCart }
          const responses = await postApi(apiEndpoint, body);
          if (responses.statusCode == 200 || responses.statusCode == 201) {
            // const endpoint = config.signin;
            localStorage.removeItem('cartItems')

          }
        }
        login();
        onClose();
      } else {
        setLoading(false);
        setErrors({ ...errors, apiError: response.message || "Login failed" });
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
      setErrors({
        ...errors,
        apiError: error.response?.data?.message || "An error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal fade show d-block verifiedModal"
      style={{ background: "rgba(0,0,0,0.5)" }}
    >
      {loading && <Loader />}
      <div className="modal-dialog modal-dialog-centered d-flex justify-content-center">
        <div className="modal-content" style={{ maxWidth: '330px' }}>
          <div className="modal-header border-0">
            <h1 className="modal-title fs-6">{"Login"}</h1>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>

          <div className="modal-body pt-0">
            <form onSubmit={handleLogin}>
              {errors.apiError && (
                <div className="alert alert-danger" role="alert" style={{ height: "40px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {errors.apiError}
                </div>
              )}
              <div className="mb-2">
                <label className="form-label">Email</label>
                <input
                  className={`form-control w-100 ${errors.email ? "is-invalid" : ""
                    }`}
                  type="email"
                  value={credentials.email}
                  onChange={(e) =>
                    setCredentials({ ...credentials, email: e.target.value })
                  }
                  required
                />
                {errors.email && (
                  <div className="invalid-feedback">{errors.email}</div>
                )}
              </div>
              <div className="mb-1">
                <label className="form-label">Password</label>
                <div className="position-relative">
                  <input
                    className={`form-control w-100 pe-5 ${errors.password ? "is-invalid" : ""
                      }`}
                    type={showPassword ? "text" : "password"}
                    value={credentials.password}
                    onChange={(e) =>
                      setCredentials({
                        ...credentials,
                        password: e.target.value,
                      })
                    }
                    required
                  />
                  {errors.password && (
                    <div className="invalid-feedback">{errors.password}</div>
                  )}
                  <button
                    type="button"
                    className="eyeInput"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: errors.password ? "25px" : "10px",
                      top: errors.password ? "32%" : "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    {/* <img
                                        src={showPassword ? "/images/landingpage/eye-show.svg" : "/images/landingpage/eye-hide.svg"}
                                        // alt="Toggle Visibility"
                                        width="18"
                                    /> */}
                    {showPassword ? (
                      <IoEyeOffOutline size={18} />
                    ) : (
                      <IoEyeOutline size={18} />
                    )}
                  </button>
                </div>
              </div>
              <div className="loginbtm mt-2 d-flex justify-content-between align-items-center">
                <div className="cstmCheckbox d-flex align-items-center">
                  <input type="checkbox" id="termCheck" />
                </div>
              </div>
              <div className="text-center mb-2 mt-4">
                <button
                  type="submit"
                  className="btn btn-primary w-50"
                  disabled={loading}
                >
                  {loading ? "Signing In..." : "Sign In"}
                </button>
              </div>
              <strong className="signupTxt pb-0 pt-1">
                {"Don't have an account?"} <a onClick={navigate}>SIGN UP</a>
              </strong>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
