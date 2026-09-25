"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "bootstrap/dist/css/bootstrap.min.css";
// import "../Log-in/public/css/style.css";
// import "../../../Log-in/public/css/style.css";
import "../../../../(landingpage)/LandingPage/public/css/style.css"
import { config } from "services/config";
import { postApi } from "services/api";
import Loader from "services/Loader/page";
import DynamicModal3 from "services/Pop-ups/popup3/page";
import { IoEyeOutline } from "react-icons/io5";
import { IoEyeOffOutline } from "react-icons/io5";
import { useLanguage } from "context/languageContext";  // ✅ add this


const ChangePassword = () => {

const { logout } = useLanguage();   // ✅ add inside ChangePassword

    const router = useRouter();
    const [checked, setChecked] = useState(false);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [responseMessage, setResponseMessage] = useState({})
    const [responseHeading, setResponseHeading] = useState({})
    const [responseTitle, setResponseTitle] = useState({})
    const [showPassword, setShowPassword] = useState(false);
    const [showPassword1, setShowPassword1] = useState(false);
    const [userData, setUserData] = useState({})
    const [user, setUser] = useState({
        email: "",
        password: "",
        cPassword: "",
    });

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        setUserData(user);
    }, [])

    function navigate() {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
        }, 500);
        router.push('/Log-in');
    }
    const validate = () => {
        let tempErrors = {};

        
        if (!user.cPassword || user.cPassword.length < 6)
            tempErrors.cPassword = "Password must be at least 6 characters";

        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleChange = (e) => {
        setUser({ ...user, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        try {
            const payLoad = {
                email: userData.email,
                password: user.password,
                confirmPassword: user.cPassword,
            }
            console.log(payLoad,"payload new")

            const endpoint = config.changePassword;
            const response = await postApi(endpoint, payLoad);
            console.log(response.statusCode, "response.statusCode");


            if (response.statusCode == 200 || response.statusCode == 201) {
                setLoading(false);
                // router.push("/Log-in");
                setUser({
                    password: "",
                    cPassword: "",
                })
              setShowModal(true);
setResponseTitle("Success");
setResponseHeading("Password Reset");
setResponseMessage("Your password has been reset successfully. Please log in again.");

// ✅ logout & redirect after short delay
setTimeout(() => {
  logout();
  router.push("/Log-in");
}, 2000);

            } else {
                setResponseTitle("Failed!");
                setResponseHeading("Oop's !!");
                setResponseMessage("Password and confirm password do not match.");
                setLoading(false);
                setShowModal(true);

            }
        } catch (error) {
            setLoading(false);
            console.log(error)
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="row px-0 mx-0 w-100">
            {loading && <Loader />}
            <div className="loginSec registration">
                <div className="loginFormBox">

                    <form onSubmit={handleSubmit}>
                        <div className="row px-md-1">
                            <div className="col-md-12 px-md-2">
                                <div className="form-group mb-4">
                                    <label className="form-label">Email</label>
                                    <input
                                        className="form-control w-100"
                                        type="text"
                                        name="name"
                                        disabled={true}
                                        value={userData.email}
                                        onChange={handleChange}
                                    />

                                </div>
                            </div>

                            <div className="col-md-6 px-md-2">
                                <div className="form-group mb-3 position-relative">
                                    <label className="form-label">
                                        Password
                                    </label>
                                    <input
                                        className="form-control w-100"
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={user.password}
                                        onChange={handleChange}
                                    />
                                    
                                    <button
                                        type="button"
                                        className="eyeInput"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{
                                            position: 'absolute',
                                            top: '70%',
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
                                        required
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
                                            top: errors.cPassword ? "45%" : '70%',
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

                        <div className="text-center my-2 mt-4">
                            <button
                                type="submit"
                                className="btn btn-primary w-50"
                                disabled={!(user?.password) || !(user?.cPassword)}
                            >
                                {loading ? "Submitting..." : "Submit"}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
            <DynamicModal3
                          show={showModal}
                          onClose={() => setShowModal(false)}
                          title={responseTitle}
                          heading={ responseHeading}
                          description={ responseMessage }
                          buttonText="Continue"
                          onButtonClick={() => setShowModal(false)}
                        />
        </div>
    );
};

export default ChangePassword;
