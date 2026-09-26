"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import "bootstrap/dist/css/bootstrap.min.css";
// import "../Log-in/public/css/style.css";
import "../../(landingpage)/LandingPage/public/css/style.css"
import { config } from "services/config";
import { postApi } from "services/api";
import Loader from "services/Loader/page";
import DynamicModal3 from "services/Pop-ups/popup3/page";
import { IoEyeOutline } from "react-icons/io5";
import { IoEyeOffOutline } from "react-icons/io5";
import { useLanguage } from "context/languageContext";
import DynamicModal2 from "services/Pop-ups/popup2/page";
import DynamicModal from "services/Pop-ups/popup1/page";
import OtpInput from "react-otp-input";
const Registration = () => {
    const { login } = useLanguage();
    const router = useRouter();
    // Registration Policy From API
const [registrationPolicy, setRegistrationPolicy] = useState("");
const [termspolicy, setTermspolicy] = useState("");
// Terms & Privacy Modal
const [showPolicyModal, setShowPolicyModal] = useState(false);
const [modalContent, setModalContent] = useState("");

  const [user, setUser] = useState({
  name: "",
  lastName: "", // ✅ NEW
  mobileNo: "",
  email: "",
  password: "",
  cPassword: "",
});

    const [checked, setChecked] = useState(false);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showVerifyEmailModal, setShowVerifyEmailModal] = useState(false);
    const [showAccountCreatedModal, setShowAccountCreatedModal] = useState(false);
    const [responseMessage, setResponseMessage] = useState({})
    const [responseHeading, setResponseHeading] = useState({})
    const [responseTitle, setResponseTitle] = useState({})
    const [showPassword, setShowPassword] = useState(false);
    const [showPassword1, setShowPassword1] = useState(false);
    const [verifyEmailScreen, setVerifyEmailScreen] = useState(false);
    const [otp, setOtp] = useState("");
    const [timer, setTimer] = useState(30);


    function navigate() {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
        }, 500);
        router.push('/Log-in');
    }
  const validate = () => {
    let tempErrors = {};
    
    // Name validation (required + only letters)
    if (!user.name.trim()) {
        tempErrors.name = "Name is required and should contain only letters.";
    } else if (!/^[A-Za-z\s]+$/.test(user.name)) {
        tempErrors.name = "Name is required and should contain only letters.";
    }

    // Last Name validation (required + only letters)
if (!user.lastName?.trim()) {
  tempErrors.lastName = "Last name is required and should contain only letters.";
} else if (!/^[A-Za-z\s]+$/.test(user.lastName)) {
  tempErrors.lastName = "Last name is required and should contain only letters.";
}


   if (!user.mobileNo) {
    tempErrors.mobileNo = "Mobile number is required";
} else if (!/^\d+$/.test(user.mobileNo)) {
    tempErrors.mobileNo = "Mobile number can contain digits only (no spaces or special characters).";
} else if (user.mobileNo.length < 8) {
    tempErrors.mobileNo = "Mobile number is too short. It must have at least 8 digits.";
} else if (user.mobileNo.length > 15) {
    tempErrors.mobileNo = "Mobile number cannot exceed 15 digits in international format.";
}


// Email validation
if (!user.email) {
    tempErrors.email = "Email is required";
} else if (!/^[^\s@]{3,}@[^\s@]{2,}\.[A-Za-z]{2,4}$/.test(user.email)) {
    tempErrors.email = "Enter a valid email (e.g., abc@xy.com, user@mail.in)";
}

    if (!user.password || user.password.length < 6)
        tempErrors.password = "Password must be at least 6 characters";
    if (user.password !== user.cPassword)
        tempErrors.cPassword = "Passwords do not match";
    if (!checked) tempErrors.policyCheck = "You must agree to the terms";

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
};


    useEffect(() => {
        let countdown;
        if (timer > 0) {
            countdown = setTimeout(() => setTimer(timer - 1), 1000);
        }
        return () => clearTimeout(countdown);
    }, [timer]);

    const handleChange = (e) => {
        setUser({ ...user, [e.target.name]: e.target.value });
    };


const fetchRegistrationPolicy = async () => {
  try {
    const data = {
      dropdown_type: "registration_policy",
      page: 1,
      pageSize: 1
    };

    const response = await postApi(config.category, data);

    if (response?.result?.length > 0) {
      const policy = response.result[0].description || "";
      setRegistrationPolicy(policy);
      return policy;  // ✅ return actual value immediately
    }

    return "";
  } catch (error) {
    console.error("Error fetching registration policy:", error);
    return "";
  }
};


const fetchTermsPolicy = async () => {
  try {
    const data = {
      dropdown_type: "terms_of_use",
      page: 1,
      pageSize: 1
    };

    const response = await postApi(config.category, data);

    if (response?.result?.length > 0) {
      const policy = response.result[0].description || "";
      setTermspolicy(policy);
      return policy;  // ✅ return instantly
    }

    return "";
  } catch (error) {
    console.error("Error fetching terms policy:", error);
    return "";
  }
};


const registerUser = async () => {
    setLoading(true);
    try {
        const endpoint = config.createUser;
        const response = await postApi(endpoint, user);

        if (response.statusCode === 200 || response.statusCode === 201) {
            setLoading(false);

            // Auto-login after registration
            localStorage.setItem("loggedIn", "true");
            localStorage.setItem("user", JSON.stringify(response.data));
            login(response.data);

            router.push("/"); // Go to home directly
        } else {
            setLoading(false);
            setShowModal(true);
            setResponseTitle("Signup Failed");
            setResponseHeading("Oop's !!");
            setResponseMessage(response?.message);
        }
    } catch (error) {
        setLoading(false);
        console.log(error);
        setShowModal(true);
    } finally {
        setLoading(false);
    }
};


    const handleSubmit = async (e) => {
        setLoading(true)
        e.preventDefault();
        if (!validate()){
            setLoading(false);
            return;
        }
       try {
        const data = {
            email: user.email,
            mobile_number: user.mobileNo,
            requestFor:""
        }
        const endpoint = config.sendOtp;
        const response = await postApi(endpoint, data);
        if(response?.statusCode == 200 || response?.statusCode == 201){
            setVerifyEmailScreen(true);
            setTimer(30); 
            setLoading(false);
        }
        else{
            setLoading(false);
            setShowModal(true);
            setResponseTitle("Signup Failed");
            setResponseHeading("Oop's !!");
            setResponseMessage(response?.message);
        }
       } catch (error) {
            console.log(error)
            setLoading(false);
       }
    };

    const submitForVerify = async () => {
        setLoading(true);
        
        const data = {
            email: user.email,
            otp: otp
        }
        const endpoint = config.verifyOtp;
        const response = await postApi(endpoint, data);
        if(response?.statusCode == 200 || response?.statusCode == 201){
            setShowVerifyEmailModal(true);
            setLoading(false);
            setResponseTitle("Verify Email");
            setResponseHeading("Verified");
            setResponseMessage(response?.message);
        }
        if(response.statusCode == 400){
            setLoading(false);
            setShowModal(true);
            setResponseTitle("Failed");
            setResponseHeading("Oop's !!");
            setResponseMessage(response?.message);
        }
        
    }
    return (
        <>
            {loading && <Loader/>}
       {!verifyEmailScreen && <div className="loginMain">
            <div className="loginSec registration">
                <div className="loginFormBox">
                    <div className="text-center mb-3">
                        <img
                            src="/images/landingpage/Vedic-Yours.png"
                            alt="Vedic Yours"
                            width="130"
                            style={{cursor: 'pointer'}}
                            onClick={() => router.push("/")}
                        />
                    </div>
                    <h3>Registration</h3>
                    <p className="mb-3">
                        Enter your details to register your account
                    </p>
                    <form onSubmit={handleSubmit}>
                        <div className="row px-md-1">
                            <div className="col-md-6 px-md-2">
                                <div className="form-group mb-4">
                                    <label className="form-label">Name*</label>
                                    <input
                                        className="form-control w-100"
                                        type="text"
                                        name="name"
                                        value={user.name}
                                        onChange={handleChange}
                                    />
                                    {errors.name && (
                                        <small className="text-danger">
                                            {errors.name}
                                        </small>
                                    )}
                                </div>
                                 </div>
                                <div className="col-md-6 px-md-2">
                                <div className="form-group mb-4">
  <label className="form-label">Last Name*</label>
  <input
    className="form-control w-100"
    type="text"
    name="lastName"
    value={user.lastName}
    onChange={handleChange}
  />
  {errors.lastName && (
    <small className="text-danger">
      {errors.lastName}
    </small>
  )}
</div>
</div>
                           
                            <div className="col-md-6 px-md-2">
                                <div className="form-group mb-3">
                                    <label className="form-label">
                                        Mobile Number*
                                    </label>
                                    <input
                                        className="form-control w-100"
                                        type="number"
                                        name="mobileNo"
                                        placeholder="Please enter your mobile number"
                                        value={user.mobileNo}
                                        onChange={handleChange}
                                    />
                                    {errors.mobileNo && (
                                        <small className="text-danger">
                                            {errors.mobileNo}
                                        </small>
                                    )}
                                </div>
                            </div>
                            <div className="col-md-6 px-md-2">
                                <div className="form-group mb-3">
                                    <label className="form-label">Email*</label>
                                    <input
                                        className="form-control w-100"
                                        type="email"
                                        name="email"
                                        value={user.email}
                                        onChange={handleChange}
                                    />
                                    {errors.email && (
                                        <small className="text-danger">
                                            {errors.email}
                                        </small>
                                    )}
                                </div>
                            </div>
                            <div className="col-md-6 px-md-2">
                                <div className="form-group mb-3 position-relative">
                                    <label className="form-label">
                                        Password*
                                    </label>
                                    <input
                                        className="form-control w-100"
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={user.password}
                                        onChange={handleChange}
                                    />
                                    {errors.password && (
                                        <small className="text-danger">
                                            {errors.password}
                                        </small>
                                    )}
                                    <button
                                        type="button"
                                        className="eyeInput"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{
                                            position: 'absolute',
                                            right: errors.password ? '5px' : '5px',
                                        top: errors.password ? '43%' : '70%',
                                            transform: 'translateY(-50%)',
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        {showPassword ?
                                            <IoEyeOffOutline size={18} />
                                            :
                                            <IoEyeOutline size={18} />
                                        }
                                    </button>
                                </div>
                            </div>
                            <div className="col-md-6 px-md-2">
                                <div className="form-group mb-3 position-relative">
                                    <label className="form-label">
                                        Confirm Password*
                                    </label>
                                    <input
                                        className="form-control w-100"
                                        type={showPassword1 ? 'text' : 'password'}
                                        name="cPassword"
                                        value={user.cPassword}
                                        onChange={handleChange}
                                    />
                                    {errors.cPassword && (
                                        <small className="text-danger">
                                            {errors.cPassword}
                                        </small>
                                    )}
                                    <button
                                        type="button"
                                        className="eyeInput"
                                        onClick={() => setShowPassword1(!showPassword1)}
                                        style={{
                                            position: 'absolute',
                                            right: errors.cPassword ? '5px' : '5px',
                                            top: errors.cPassword ? '53%' : '70%',
                                            transform: 'translateY(-50%)',
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        {showPassword1 ?
                                            <IoEyeOffOutline size={18} />
                                            :
                                            <IoEyeOutline size={18} />
                                        }
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="loginbtm mt-2">
                            <div className="cstmCheckbox">
                                <input
                                    type="checkbox"
                                    id="termCheck"
                                    name="policyCheck"
                                    checked={checked}
                                    onChange={(e) => setChecked(e.target.checked)}
                                />
                <label htmlFor="termCheck">
  By clicking you agree to our&nbsp;

  <span
  className="hyperlink"
  onClick={async (e) => {
    e.preventDefault();
    e.stopPropagation();   // ⭐ prevent checkbox toggle
    const html = await fetchTermsPolicy();
    setModalContent(html);
    setShowPolicyModal(true);
  }}
>
  Terms of Use
</span>
 &nbsp;and&nbsp;
<span
  className="hyperlink"
  onClick={async (e) => {
    e.preventDefault();
    e.stopPropagation();   // ⭐ prevent checkbox toggle
    const html = await fetchRegistrationPolicy();
    setModalContent(html);
    setShowPolicyModal(true);
  }}
>
  Privacy Policy
</span>

</label>


                                {errors.policyCheck && (
                                    <small className="text-danger d-block mt-1">
                                        {errors.policyCheck}
                                    </small>
                                )}
                            </div>
                        </div>
                        <div className="text-center my-2 mt-4">
                            <button
                                type="submit"
                                className="btn btn-primary w-50"
                                disabled={loading}
                            >
                                {loading ? "Registering..." : "Register"}
                            </button>
                        </div>
                        <strong className="signupTxt pb-0 pt-1" > Already have an account?  <a onClick={navigate} >LOGIN</a></strong>
                       
                    </form>
                </div>
            </div>
        </div>}

           {verifyEmailScreen &&  <div className="loginMain">
                <div className="loginSec">
                    <div className="loginFormBox">
                        <div className="text-center mb-3">
                            <img src="images/Vedic-Yours.png" alt="" width="130" />
                        </div>
                        <h3>Verify Email</h3>
                        <p className="mb-3">Verify your email to finish setting up your account</p>
                        <form>
                            <div className="mb-3">
                                <label className="form-label">Email</label>
                                <input className="form-control w-100" type="email" value={user?.email} disabled />
                            </div>
                            <a className="textUnderline mb-2" onClick={()=>{setVerifyEmailScreen(false);}}>Change Email</a>
                            <div className="otpMain">
                                <strong>Enter Verification Code</strong>
                                <div className="otpFind">
                                    <OtpInput
                                        value={otp}
                                        onChange={(e)=>{setOtp(e)}}
                                        numInputs={5}
                                        inputStyle={{
                                            width: "3rem",
                                            height: "3rem",
                                            margin: "0 0.5rem",
                                            fontSize: "1.0rem",
                                            borderRadius: 4,
                                            border: "1px solid #ced4da"
                                        }}
                                        isInputNum={true}
                                    />
                                </div>
                            </div>
                            <span className="timing mt-4">Resend Verification Code in <b>00:{timer < 10 ? `0${timer}` : timer}</b>second</span>
                            {timer ==0 && <strong className="resend pb-0">Did not get a code? <a style={{cursor:"pointer", color:"#30C768"}} onClick={(e)=>handleSubmit(e)}><u>Click to Resend</u></a></strong>}
                            <div className="text-center my-2 mt-4">
                                <button type="button" className="btn btn-primary w-50" data-bs-target="#verifyMobile"
                                    data-bs-toggle="modal" onClick={()=>{submitForVerify()}}>Submit</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>}
            <DynamicModal3
                show={showModal}
                onClose={() => setShowModal(false)}
                title={responseTitle || "Signup Failed "}
                heading={responseHeading || "Oops !!"}
                description={responseMessage || "something went wronge"}
                buttonText="Continue"
                onButtonClick={() => setShowModal(false)}
            />
            <DynamicModal2
                show={showVerifyEmailModal}
                onClose={() => setShowVerifyEmailModal(false)}
                title={responseTitle || "Failed "}
                heading={responseHeading || "Oops !!"}
                description={responseMessage || "something went wronge"}
                buttonText="Continue"
                onButtonClick={() => {registerUser(); setShowVerifyEmailModal(false)}}
            />
            <DynamicModal
                show={showAccountCreatedModal}
                onClose={() => setShowAccountCreatedModal(false)}
                title={responseTitle || "Failed "}
                heading={responseHeading || "Oops !!"}
                description={responseMessage || "something went wronge"}
                buttonText="Continue"
                onButtonClick={() => navigate()}
            />


{/* ===== Custom Terms / Privacy Modal ===== */}
{showPolicyModal && (
  <div className="policyModalOverlay">
    <div className="policyModal">
      <div className="policyModalHeader">
        <h4>Policy Details</h4>
        <button className="closeBtn" onClick={() => setShowPolicyModal(false)}>
          ✕
        </button>
      </div>

   <div
  className="policyModalBody"
  dangerouslySetInnerHTML={{ __html: modalContent }}
/>

      <div className="policyModalFooter">
        <button
          className="btn btn-primary w-100"
          onClick={() => setShowPolicyModal(false)}
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}


<style jsx>{`
  .hyperlink {
    color: #30c768;
    text-decoration: underline;
    cursor: pointer;
    font-weight: 600;
  }

  .policyModalOverlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.55);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 99999;
    padding: 20px;
  }

  .policyModal {
    background: #fff;
    width: 100%;
    max-width: 550px;
    border-radius: 10px;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
    animation: fadeSlide 0.3s ease-out;
  }

  .policyModalHeader {
    padding: 16px;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .policyModalBody {
    padding: 16px;
    max-height: 350px;
    overflow-y: auto;
    line-height: 1.6;
    color: #444;
  }

  .policyModalFooter {
    padding: 16px;
    border-top: 1px solid #eee;
  }

  .closeBtn {
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
  }

  @keyframes fadeSlide {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`}</style>

        </>
    );
};

export default Registration;
