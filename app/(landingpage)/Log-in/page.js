"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios"; // Import axios for API calls
// import './public/css/style.css';
import Cookies from "js-cookie";
import "bootstrap/dist/css/bootstrap.min.css";
import { config } from "services/config";
import { postApi } from "services/api";
import Loader from "services/Loader/page";
import DynamicModal from "services/Pop-ups/popup1/page";
import { useLanguage } from "context/languageContext";
import { IoEyeOutline } from "react-icons/io5";
import { IoEyeOffOutline } from "react-icons/io5";
import OtpInput from "react-otp-input";
import DynamicModal3 from "services/Pop-ups/popup3/page";
import DynamicModal2 from "services/Pop-ups/popup2/page";

const Login = () => {
  const router = useRouter();
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const { isLoggedIn, login, logout } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword1, setShowPassword1] = useState(false);
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    apiError: "",
  });
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [forgotScreen, setForgotScreen] = useState(false);
  const [verifyEmailScreen, setVerifyEmailScreen] = useState(false);
  const [otp, setOtp] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showVerifyEmailModal, setShowVerifyEmailModal] = useState(false);
  const [responseMessage, setResponseMessage] = useState({});
  const [responseHeading, setResponseHeading] = useState({});
  const [responseTitle, setResponseTitle] = useState({});
  const [resetPasswordScreen, setResetPasswordScreen] = useState(false);
  const [resetPassword, setResetPassword] = useState("");
  const [resetCPassword, setResetCPassword] = useState("");
  const [showModal1, setShowModal1] = useState(false);
  const [timer, setTimer] = useState(30);

  useEffect(() => {
    let countdown;
    if (timer > 0) {
      countdown = setTimeout(() => setTimer(timer - 1), 1000);
    }
    return () => clearTimeout(countdown);
  }, [timer]);

  useEffect(() => {
    const savedEmail = Cookies.get("email");
    const savedPassword = Cookies.get("password");
    if (savedEmail && savedPassword) {
      setCredentials({ email: savedEmail, password: savedPassword });
      setRememberMe(true);
    }
  }, []);

  function navigate() {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 100);
    router.push("/Sign-up");
  }
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("loggedIn") === "true";
    if (isLoggedIn) {
      router.push("/"); 
    }
  }, []);

  // Validate email format

const validateEmail = (email) => {
  const re = /^[^\s@]{3,}@[^\s@]{2,}\.(com|net|org|info|in)$/i;
  return re.test(email.trim());
};




  // Validate form inputs
  const validateForm = () => {
    let valid = true;
    let newErrors = { email: "", password: "", apiError: "" };

    if (!credentials.email) {
      newErrors.email = "Email is required";
      valid = false;
  } else if (!validateEmail(credentials.email)) {
  newErrors.email = "Enter a valid email (e.g., abc@xy.com, user@mail.in)";
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

    if (response && (response.statusCode === 200 || response.statusCode === 201)) {
      localStorage.setItem("loggedIn", "true");
      localStorage.setItem("user", JSON.stringify(response.data));
      login(response.data);

      if (rememberMe) {
        Cookies.set("email", credentials.email, { expires: 7 });
        Cookies.set("password", credentials.password, { expires: 7 });
      } else {
        Cookies.remove("email");
        Cookies.remove("password");
      }

     if (response.data.role === "admin") {
  setLoading(true);
  window.location.href = "/admin";
} else if (response.data.role === "practitioner") {
  setLoading(true);
  // Save user info for future role checks
  localStorage.setItem("userRole", response.data.role);
  localStorage.setItem("loggedIn", "true");
  router.push("/Employee-Portal/components/Dashboard");
} else {
  setLoading(false);
  router.push("/");
}

    } else {
      setErrors({
        ...errors,
        apiError: response?.message || "Login failed",
      });
      setLoading(false);
    }
  } catch (error) {
    console.error("Login error:", error);
    setErrors({
      ...errors,
      apiError: error?.response?.data?.message || "Unexpected error",
    });
    setLoading(false);
  }
};




  const sendOtp = async () => {
    // validate email before sending OTP
  if (!credentials?.email) {
  setErrors({ ...errors, email: "Email is required" });
  return;
} else if (!validateEmail(credentials.email)) {
  setErrors({ ...errors, email: "Enter a valid email (e.g., abc@xy.com, user@mail.in)" });
  return;
}

    setLoading(true);
    try {
      const data = {
        email: credentials?.email,
        mobile_number: "",
        requestFor: "changePassword",
      };
      const endpoint = config.sendOtp;
      const response = await postApi(endpoint, data);
      if (response?.statusCode == 200 || response?.statusCode == 201) {
        setForgotScreen(false);
        setVerifyEmailScreen(true);
        setTimer(30);
        setLoading(false);
      } else {
        setLoading(false);
        setShowModal(true);
        setResponseTitle("Failed");
        setResponseHeading("Oop's !!");
        setResponseMessage(response?.message);
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  const verifyEmailSubmit = async () => {
    setLoading(true);

    const data = {
      email: credentials?.email,
      otp: otp,
    };
    const endpoint = config.verifyOtp;
    const response = await postApi(endpoint, data);
    if (response?.statusCode == 200 || response?.statusCode == 201) {
      setShowVerifyEmailModal(true);
      setLoading(false);
      setResponseTitle("Verify Email");
      setResponseHeading("Verified");
      setResponseMessage(response?.message);
    }
    if (response.statusCode == 400) {
      setLoading(false);
      setShowModal(true);
      setResponseTitle("Failed");
      setResponseHeading("Oop's !!");
      setResponseMessage(response?.message);
    }
  };

  const finalResetPasswordFunc = async () => {
    if (
      resetPassword == "" ||
      resetCPassword == "" ||
      resetPassword !== resetCPassword
    ) {
      setResponseTitle("Failed!");
      setResponseHeading("Oop's !!");
      setResponseMessage("Password and confirm password do not match.");
      setShowModal(true);
      return;
    }
    setLoading(true);
    try {
      const payLoad = {
        email: credentials?.email,
        password: resetPassword,
        confirmPassword: resetCPassword,
      };
      console.log(payLoad, "payload new");

      const endpoint = config.changePassword;
      const response = await postApi(endpoint, payLoad);
      console.log(response.statusCode, "response.statusCode");

      if (response.statusCode == 200 || response.statusCode == 201) {
        setLoading(false);
        // router.push("/Log-in");

        setResetPassword("");
        setResetCPassword("");

        setShowModal1(true);
        setResponseTitle("Reset Password");
        setResponseHeading("All Done");
        setResponseMessage("Your password has been reset.");
      } else {
        setResponseTitle("Failed!");
        setResponseHeading("Oop's !!");
        setResponseMessage("Password and confirm password do not match.");
        setLoading(false);
        setShowModal(true);
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      {loading && <Loader />}
      {!forgotScreen && !verifyEmailScreen && !resetPasswordScreen && (
        <div className="loginMain">
          <div className="loginSec">
            <div className="loginFormBox">
              <div className="text-center mb-3">
                <img
                  src="/images/landingpage/vedic-health.png"
                  alt="Vedic Health"
                  width="130"
                  style={{ cursor: "pointer" }}
                  onClick={() => router.push("/")}
                />
              </div>
              <h3 className="mb-4">Login</h3>
              {errors.apiError && (
                <div
                  className="alert alert-danger"
                  style={{
                    height: "40px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    fontSize: "12px",
                  }}
                >
                  {errors.apiError}
                </div>
              )}
              <form onSubmit={handleLogin}>
                <div className="mb-2">
                  <label className="form-label">Email</label>
                  <input
                    className={`form-control w-100 ${
                      errors.email ? "is-invalid" : ""
                    }`}
                   type="text"
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
                      className={`form-control w-100 pe-5 ${
                        errors.password ? "is-invalid" : ""
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
                        right: errors.password ? "20px" : "10px",
                        top: errors.password ? "32%" : "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      {showPassword ? (
                        <IoEyeOffOutline size={18} />
                      ) : (
                        <IoEyeOutline size={18} />
                      )}
                    </button>
                  </div>
                </div>
                <div className="loginbtm mt-2">
                  <div className="cstmCheckbox">
                    <input
                      type="checkbox"
                      id="termCheck"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <label htmlFor="termCheck">Remember</label>
                  </div>
                  <a
                    style={{ cursor: "pointer" }}
                    onClick={() => setForgotScreen(true)}
                  >
                    Forgot Password
                  </a>
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
                    Login
                  </button>
                </div>
                <strong className="signupTxt pb-0 pt-1">
                  {"Don't have an account?"} <a onClick={navigate}>SIGN UP</a>
                </strong>
              </form>
              {/* <span >Not a user? <span style={{cursor:"pointer"}}> Sign up </span> </span> */}
            </div>
          </div>
        </div>
      )}

      {forgotScreen && !verifyEmailScreen && !resetPasswordScreen && (
        <div className="loginMain">
          <div className="loginSec">
            <div className="loginFormBox">
              <div className="text-center mb-3">
                <img src="images/vedic-health.png" alt="" width="130" />
              </div>
              <h3>Forgot Password</h3>
              <p className="mb-4">
                Enter your email we will send you a verification code to get
                back into your account.
              </p>
              <form>
                <div className="mb-4">
                  <label className="form-label">Email</label>
                  <input
 className={`form-control w-100 ${errors.email ? "is-invalid" : ""}`}
  type="text" 
  placeholder=""
  value={credentials?.email}
 onChange={(e) => {
  const value = e.target.value;
  setCredentials({ ...credentials, email: value });

 if (validateEmail(value)) {
   setErrors({ ...errors, email: "" });
 }
}}

/>
{errors.email && (
   <div className="invalid-feedback">{errors.email}</div>
 )}

                </div>
                <div className="text-center my-2 mt-5">
                  <button
                    type="button"
                    className="btn btn-primary w-50"
                    onClick={() => sendOtp()}
                  >
                    Get Code
                  </button>
                </div>
                <strong className="signupTxt pb-0">
                  Do not have an account? <a onClick={navigate}>SIGN UP</a>
                </strong>
              </form>
            </div>
          </div>
        </div>
      )}

      {verifyEmailScreen && !forgotScreen && !resetPasswordScreen && (
        <div className="loginMain">
          <div className="loginSec">
            <div className="loginFormBox">
              <div className="text-center mb-3">
                <img src="images/vedic-health.png" alt="" width="130" />
              </div>
              <h3>Verify Email</h3>
              <p className="mb-3">  
               Email Verification Required<br></br>
Enter the OTP sent to your email ID to complete the password reset process.
              </p>
              <form>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    className="form-control w-100"
                    type="email"
                    placeholder="xyz@gmail.com"
                    value={credentials?.email}
                    onChange={(e) =>
                      setCredentials({ ...credentials, email: e.target.value })
                    }
                  />
                </div>
               <a
  className="textUnderline mb-2"
  style={{ cursor: "pointer" }}
  onClick={() => {
    setVerifyEmailScreen(false);
    setForgotScreen(true);
  }}
>
  Change Email
</a>

                <div className="otpMain">
                  <strong>Enter Verification Code</strong>
                  <div className="otpFind">
                    <OtpInput
                      value={otp}
                      onChange={(e) => {
                        setOtp(e);
                      }}
                      numInputs={5}
                      inputStyle={{
                        width: "3rem",
                        height: "3rem",
                        margin: "0 0.5rem",
                        fontSize: "1.0rem",
                        borderRadius: 4,
                        border: "1px solid #ced4da",
                      }}
                      isInputNum={true}
                    />
                  </div>
                </div>
                <span className="timing mt-4">
                  Resend Verification Code in{" "}
                  <b>00:{timer < 10 ? `0${timer}` : timer}</b>second
                </span>
                {timer == 0 && (
                  <strong className="resend pb-0">
                    Did not get a code?{" "}
                    <a
                      style={{ cursor: "pointer", color: "#30C768" }}
                      onClick={() => sendOtp()}
                    >
                      <u>Click to Resend</u>
                    </a>
                  </strong>
                )}
                <div className="text-center my-2 mt-4">
                  <button
                    type="button"
                    className="btn btn-primary w-50"
                    onClick={() => verifyEmailSubmit()}
                    data-bs-toggle="modal"
                  >
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {resetPasswordScreen && (
        <div className="loginMain">
          <div className="loginSec">
            <div className="loginFormBox">
              <div className="text-center mb-3">
                <img src="images/vedic-health.png" alt="" width="130" />
              </div>
              <h3>Reset Password</h3>
              <p className="mb-3">
                Your new password must be different from previous used password.{" "}
              </p>
              <form>
                <div className="mb-3">
                  <label className="form-label">Password</label>
                  <div className="position-relative">
                    <input
                      className="form-control w-100 eyePadding"
                      type={showPassword ? "text" : "password"}
                      placeholder=""
                      value={resetPassword}
                      onChange={(e) => setResetPassword(e.target.value)}
                    />
                    {/* <a href="" className="eyeInput"><img src="images/eye-hide.svg" alt="" width="18" /></a> */}
                    <button
                      type="button"
                      className="eyeInput"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: "absolute",
                        top: "48%",
                        right: "5px",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      {showPassword ? (
                        <IoEyeOffOutline size={18} />
                      ) : (
                        <IoEyeOutline size={18} />
                      )}
                    </button>
                  </div>
                </div>
                <div className="mb-1">
                  <label className="form-label">Confirm Password</label>
                  <div className="position-relative">
                    <input
                      className="form-control w-100 eyePadding"
                      type={showPassword1 ? "text" : "password"}
                      placeholder=""
                      value={resetCPassword}
                      onChange={(e) => setResetCPassword(e.target.value)}
                    />
                    {/* <a href="" className="eyeInput"><img src="images/eye-hide.svg" alt="" width="18" /></a> */}
                    <button
                      type="button"
                      className="eyeInput"
                      onClick={() => setShowPassword1(!showPassword1)}
                      style={{
                        position: "absolute",
                        top: "48%",
                        right: "5px",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      {showPassword1 ? (
                        <IoEyeOffOutline size={18} />
                      ) : (
                        <IoEyeOutline size={18} />
                      )}
                    </button>
                  </div>
                  {console.log(resetCPassword.length, "resetCPassword")}
                </div>
                {resetCPassword.length < 6 && (
                  <span className="characters">
                    Must be at least 8 characters.
                  </span>
                )}
                <div className="text-center my-2 mt-4">
                  <button
                    type="button"
                    className="btn btn-primary w-50"
                    data-bs-target="#continueLogin"
                    onClick={() => finalResetPasswordFunc()}
                  >
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <DynamicModal3
        show={showModal}
        onClose={() => {
          setShowModal(false);
        }}
        title={responseTitle || "Failed "}
        heading={responseHeading || "Oops !!"}
        description={responseMessage || "something went wronge"}
        buttonText="Continue"
        onButtonClick={() => {
          setShowModal(false);
        }}
      />
      <DynamicModal3
        show={showModal1}
        onClose={() => {
          setShowModal1(false);
          setResetPasswordScreen(false);
          setVerifyEmailScreen(false);
          setForgotScreen(false);
        }}
        title={responseTitle || "Failed "}
        heading={responseHeading || "Oops !!"}
        description={responseMessage || "something went wronge"}
        buttonText="Continue"
        onButtonClick={() => {
          setShowModal1(false);
          setResetPasswordScreen(false);
          setVerifyEmailScreen(false);
          setForgotScreen(false);
        }}
      />
      <DynamicModal2
        show={showVerifyEmailModal}
        onClose={() => setShowVerifyEmailModal(false)}
        title={responseTitle || "Failed "}
        heading={responseHeading || "Oops !!"}
        description={responseMessage || "something went wronge"}
        buttonText="Continue"
        onButtonClick={() => {
          setShowVerifyEmailModal(false);
          setResetPasswordScreen(true);
        }}
      />
    </>
  );
};

export default Login;
