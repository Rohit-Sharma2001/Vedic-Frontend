'use client'
import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { titleCase } from "services/common";
import { Trash } from "react-bootstrap-icons";
import { config } from 'services/config';
import Swal from "sweetalert2";
import 'app/(landingpage)/LandingPage/public/css/style.css';
import Loader from "services/Loader/page";
import { useRouter } from "next/navigation";
import { postApi } from 'services/api';
import axios from "axios";
import Memberships from "./MemberShip/page";
import OtpInput from "react-otp-input";
import { useLanguage } from "context/languageContext";
import PractitionerHeader from '../PractionerHeader/page';

export default function EmeployeePortal() {
    const [loading, setLoading] = useState(false);
    const [searchData, setSearchData] = useState({
        // email: '',
        // mobileNo: ''
    })
    const [showAllShippingOptions, setShowAllShippingOptions] = useState(false);
    const [memberData, setMemberData] = useState()
    const [isEditingAddress, setIsEditingAddress] = useState(false);     // editing mode flag
    const [editingAddressId, setEditingAddressId] = useState(null);
    const router = useRouter();
    const [addAddressModal, setAddAddressModal] = useState(false);
    const [addAddressType, setAddAddressType] = useState()
    const [selectedShippingAdd, setSelectedShippingAdd] = useState();
    const [showPlans, setShowPlans] = useState(false)
    const [addressChoice, setAddressChoice] = useState('default')
    const [defaultAdd, setDefaultAdd] = useState({});
    const [emailVarification, setEmailVarification] = useState(true)
    const [toAddress, setToAddress] = useState();
    const [fromAddress, setFromAddress] = useState();
    const [shippingOptions, setShippingOptions] = useState([]);
    const [paymentType, setPaymentType] = useState('offline')
    const [userData, setUserData] = useState()
    const [promoCode, setPromoCode] = useState("");
    const [discount, setDiscount] = useState(0);
    const [activeTab, setActiveTab] = useState("pickup");
    const [refundPolicy, setRefundPolicy] = useState(false)
    const [billingSame, setBillingSame] = useState(false);
    const [formError, setFormError] = useState("");
    const [addresses, setAddresses] = useState()
    const [modalOpen, setModalOpen] = useState(false)
    const [userProfile, setUserProfile] = useState(null);
    const [newAddress, setNewAddress] = useState({
        name: "",
        mobile: "",
        flatNo: "",
        area: "",
        state: "",
        city: "",
        country: "",
        pincode: "",
    });
    const fieldLabels = {
        name: "Name",
        mobile: "Mobile Number",
        area: "Street Address",
        // flatNo: "Apt/Suite",
        city: "City",
        state: "State",
        country: "Country",
        pincode: "Zip",
    };
    const [billingAddress, setBillingAddress] = useState({
        addressLine1: "",
        addressLine2: "",
    });
    const [addressValidation, setAddressVailidation] = useState();
    const [nonMemberAddress, setNonMemberAddress] = useState()
    const [selecetedMembership, setSelecetedMembership] = useState(false)
    const [otp, setOtp] = useState("");
    const [timer, setTimer] = useState(30);
    const [products, setProducts] = useState()
    const [plan, setPlan] = useState(null);
    const [searchUserData, setSearchUserData] = useState()
    const { isLoggedIn, login, logout, setCartCount } = useLanguage();
    const [errors, setErrors] = useState({});
    const [oldMemberShip, setOldMemberShip] = useState(false)


    useEffect(() => {
        if (plan?.id && products.length > 0) {
            console.log("🔁 Products loaded — applying membership discounts...");
            fetchPlanDetails(plan.id, products);
        }
    }, [plan?.id, products]);
    const autoFillBillingFromProfile = (user) => {
  if (user && user._id) {
    setBillingAddress({
      addressLine1: user.address1 || "",
      addressLine2: user.address2 || "",
      city: user.city || "",
      state: user.state || "",
      country: user.country || "",
      zipcode: user.zipcode || ""
    });
  }
};
    const searchUser = async (e) => {
        setLoading(true)
        e.preventDefault();
        // if (!validate()) {
        //     setLoading(false);
        //     return;
        // }
        const endpoint = config.searchUser;
        const userData = await postApi(endpoint, searchUserData)
        console.log(userData, 'userData')
        
        const localUserData = JSON.parse(localStorage.getItem("user"))
        setLoading(false)
        if (userData.statusCode == 200 && userData?.data.length > 0) {
            
            if (userData?.data.length > 0 && userData.data[0]?.membership?.length > 0) {
                setUserProfile(userData.data[0]); // Store full profile
    
    // Auto-fill billing address from user profile
    autoFillBillingFromProfile(userData.data[0]);
                // setDefaultAdd(userData?.data[0]?.address)
                // setSelecetedMembership(userData.data[0]?.membership[0])
                setOldMemberShip(userData.data[0]?.membership[0])
                fetchPlanDetails(userData.data[0]?.membership[0]._id, products)
            } else {
                getCart(localUserData);
                setOldMemberShip(false)
            }
            setMemberData(userData.data)
            setAddresses(userData.data[0]?.address);
            if (userData.data[0]?.address.filter((ele) => ele.primary)[0]) {
                setDefaultAdd(userData.data[0].address.filter((ele) => ele.primary)[0]);
                setToAddress(userData.data[0].address.filter((ele) => ele.primary)[0]._id);
            } else {
                setDefaultAdd(userData.data[0]?.address[0]);
                setToAddress(userData.data[0]?.address[0]?._id);
            }
        } else {
            getCart(localUserData);
            setMemberData([])
            setSelecetedMembership()
            setOldMemberShip(false)
        }
    }
    const fetchPlanDetails = async (id, productList = []) => {
        try {
            const response = await postApi(config.ViewMembershipPlan, { id });
            if (response.statusCode === 200 || response.statusCode === 201) {
                const planData = response.result;
                setPlan(planData);

                // ✅ Handle missing products
                if (!Array.isArray(productList) || productList.length === 0) {
                    console.log("⏳ No products available yet — skipping discount for now");
                    return;
                }

                console.log("🧾 Membership categories:", planData.product_categories);
                console.log("🛒 Cart product categories:", productList.map(p => p.productDetails.category));

                // ✅ Apply discount to matching category
                const updatedProducts = productList.map((prod) => {
                    const prodCategoryId =
                        prod?.productDetails?.category?._id || prod?.productDetails?.category;

                    const matchedCategory = planData.product_categories.find((cat) => {
                        const catId =
                            cat?.category_id?._id || cat?.category_id || cat?.category;
                        return String(catId) === String(prodCategoryId);
                    });

                    if (matchedCategory) {
                        const discountPercent = matchedCategory.discount || 0;
                        const originalPrice = prod.productDetails.price;
                        const discountedPrice =
                            originalPrice - (originalPrice * discountPercent) / 100;

                        return {
                            ...prod,
                            productDetails: {
                                ...prod.productDetails,
                                originalPrice,
                                price: discountedPrice,
                                membershipDiscount: discountPercent,
                            },
                        };
                    }

                    return prod;
                });

                console.log("✅ Matching discounted products:", updatedProducts.filter(p => p.productDetails.membershipDiscount));
                setProducts(updatedProducts);
            }
        } catch (error) {
            console.error("Error fetching plan:", error);
        } finally {
            setLoading(false);
        }
    };
    const [showShippingCost, setShowShippingCost] = useState(false);
    const [shippingMethod, setShippingMethod] = useState();

    const openEditAddress = (add) => {
        // why: reuse add modal with prefilled values for seamless UX
        setIsEditingAddress(true);
        setEditingAddressId(add?._id || null);
        setNewAddress({
            name: add?.name || "",
            mobile: add?.mobile || "",
            flatNo: add?.flatNo || "",
            area: add?.area || "",
            state: add?.state || "",
            city: add?.city || "",
            country: add?.country || "",
            pincode: add?.pincode || "",
        });
        setAddressVailidation(undefined);
        setAddAddressModal(true);
    };

    const registerUser = async () => {
        setLoading(true);
        try {
            const endpoint = config.createUserByPractitionar;
            const response = await postApi(endpoint, searchData);

            if (response.statusCode === 200 || response.statusCode === 201) {
                setLoading(false);
                setMemberData(response.data)
                // Auto-login after registration
                // localStorage.setItem("loggedIn", "true");
                // localStorage.setItem("user", JSON.stringify(response.data));
                // login(response.data);

                // router.push("/"); // Go to home directly
            } else {
                setLoading(false);
                // setShowModal(true);
                // setResponseTitle("Signup Failed");
                // setResponseHeading("Oop's !!");
                // setResponseMessage(response?.message);
            }
        } catch (error) {
            setLoading(false);
            console.log(error);
            // setShowModal(true);
        } finally {
            setLoading(false);
        }
    };
    const handleLogout = () => {
        Swal.fire({
            title: "Are you sure?",
            text: "You will be logged out of your account.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, logout",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
        }).then((result) => {
            if (result.isConfirmed) {
                logout();               // clear user data
                Swal.fire({
                    title: "Logged Out",
                    text: "You have been successfully logged out.",
                    icon: "success",
                    timer: 500,
                    showConfirmButton: false,
                });
                setTimeout(() => {
                    router.push("/Log-in"); // redirect to login page
                }, 500);
            }
        });
    };

    const updateAddress = async () => {
        try {
            // basic required check same as add
            const blankKeys = Object.keys(newAddress).filter(
                (key) =>
                    key !== "flatNo" &&
                    ((newAddress)[key] === "" ||
                        (newAddress)[key] === null ||
                        (newAddress)[key] === undefined)
            );
            if (blankKeys.length) {
                const missingLabels = blankKeys.map((k) => (fieldLabels)[k]);
                setAddressVailidation(`Please enter your ${missingLabels.join(", ")}`);
                return;
            }

            setLoading(true);
            const payload = {
                id: editingAddressId, // backend expects "id"
                ...newAddress,
            };
            const response = await postApi(config.editAddress, payload);
            setLoading(false);

            if (response.statusCode === 200 || response.statusCode === 201) {
                // success -> refresh, close modal
                await getAddress(memberData ? memberData[0] : JSON.parse(localStorage.getItem("user") || "{}"));
                setAddAddressModal(false);
                setIsEditingAddress(false);
                setEditingAddressId(null);
                setAddressVailidation(undefined);

                // if edited one is selected, keep selection in sync
                const updatedAddr = response?.data;
                if (updatedAddr && defaultAdd?._id === updatedAddr?._id) {
                    setDefaultAdd(updatedAddr);
                    setToAddress(updatedAddr?._id);
                }
            } else {
                // ❗ Server enforces Shippo validation; show the exact message
                setAddressVailidation(response?.error || response?.message || "Update failed");
            }
        } catch (err) {
            setLoading(false);
            // ❗ display server error (e.g., Shippo invalid)
            setAddressVailidation(err?.message || "Something went wrong");
        }
    };
    async function getAddress(user) {
        try {
            setLoading(true)
            const endpoint = config.getAddress;
            const data = { user: user._id };

            const response = await postApi(endpoint, data);
            setLoading(false)
            if (response.statusCode == 200 || response.statusCode == 201) {
                setAddresses(response.data.data);
                if (response.data.data.filter((ele) => ele.primary)[0]) {
                    setDefaultAdd(response.data.data.filter((ele) => ele.primary)[0]);
                    setToAddress(response.data.data.filter((ele) => ele.primary)[0]._id);
                    setSelectedShippingAdd(response.data.data.filter((ele) => ele.primary)[0]._id)
                } else {
                    setDefaultAdd(response.data.data[0]);
                    setToAddress(response.data.data[0]._id);
                    setSelectedShippingAdd(response.data.data[0]._id)
                }
            }
        } catch (error) {
            console.error("Error fetching categorylist:", error);
        }
    }

    async function getAllNonMemberAddress(user) {
        try {
            setLoading(true)
            const endpoint = config.allNonMemberAddress;
            const data = { user: user._id };

            const response = await postApi(endpoint, data);
            setLoading(false)
            if (response.statusCode == 200 || response.statusCode == 201) {
                setNonMemberAddress(response.data.data);

            }
        } catch (error) {
            console.error("Error fetching categorylist:", error);
        }
    }

    const validate = () => {
        let tempErrors = {};

        // Name validation (required + only letters)


        if (!searchData.mobileNo) {
            tempErrors.mobileNo = "Mobile number is required";
        } else if (!/^\d+$/.test(searchData.mobileNo)) {
            tempErrors.mobileNo = "Mobile number can contain digits only (no spaces or special characters).";
        } else if (searchData.mobileNo.length < 8) {
            tempErrors.mobileNo = "Mobile number is too short. It must have at least 8 digits.";
        } else if (searchData.mobileNo.length > 15) {
            tempErrors.mobileNo = "Mobile number cannot exceed 15 digits in international format.";
        }

        // Email validation
        if (!searchData.email) {
            tempErrors.email = "Email is required";
        } else if (!/^[^\s@]{3,}@[^\s@]{2,}\.[A-Za-z]{2,4}$/.test(searchData.email)) {
            tempErrors.email = "Enter a valid email (e.g., abc@xy.com, user@mail.in)";
        }

        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const checkAddress = async () => {
        try {
            // e.preventDefault();
            let setAddress = `${newAddress?.flatNo},${newAddress?.area},${newAddress.city},${newAddress.state},${newAddress.pincode}`;

            const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
            const location = await axios.get(
                `https://maps.googleapis.com/maps/api/geocode/json?address=%7B${setAddress}%7D&key=${apiKey}`
            );

            if (location.data.status == "OK") {
                // finalAddress()
                return location.data.results[0];
            } else {
                return false;
            }
        } catch (err) {
            console.error("Error fetching calculateShippingCost:", err);
        }
    };

    const addAddress = async () => {
        try {
            const blankKeys = Object.keys(newAddress).filter(
                (key) => key !== 'flatNo' &&
                    newAddress[key] === "" ||
                    newAddress[key] === null ||
                    newAddress[key] === undefined
            );
            let addre = await checkAddress();

            if (blankKeys.length !== 0) {
                const missingLabels = blankKeys.map((key) => fieldLabels[key]);
                setAddressVailidation(`Please enter your ${missingLabels.join(", ")}`);

            } else if (addre == false) {
                setAddressVailidation(`Please enter valid address`);
            } else {
                setAddressVailidation();
                let stateCode = "";
                let countryCode = "";
                if (addre) {
                    let countryArr = ["country", "political"];
                    let stateArr = ["administrative_area_level_1", "political"];
                    addre?.address_components.length > 0 &&
                        addre?.address_components.map((e) => {
                            if (JSON.stringify(e.types) == JSON.stringify(countryArr)) {
                                countryCode = e.short_name;
                            } else if (JSON.stringify(e.types) == JSON.stringify(stateArr)) {
                                stateCode = e.short_name;
                            }
                        });
                }
                console.log(memberData, "memberDatamemberData");
                setLoading(true)
                const endpoint = !addAddressType ? config.addAddress : config.addNonMemberaddress;
                let data = {
                    ...newAddress,
                    stateCode: stateCode,
                    countryCode: countryCode,
                };
                memberData?.length > 0 ? data['user_id'] = memberData[0]._id : data['employee_id'] = JSON.parse(localStorage.getItem("user"))._id
                const response = await postApi(endpoint, data);
                setLoading(false)
                if (response.statusCode == 200 || response.statusCode == 201) {
                    setAddAddressModal(false);
                    setNewAddress({
                        name: "",
                        mobile: "",
                        flatNo: "",
                        area: "",
                        state: "",
                        city: "",
                        country: "",
                        pincode: "",
                    })
                    getAddress(memberData ? memberData[0] : JSON.parse(localStorage.getItem("user") || "{}"));
                } else {
                    setAddressVailidation(response.error);
                }
            }
        } catch (err) {
            console.error("Error fetching calculateShippingCost:", err);
        }
    };

    const finalAddress = async (e) => {
        try {
            let { name, value } = e.target;

            setNewAddress({ ...newAddress, [name]: value });

        } catch (err) {
            console.error("Error fetching add Address:", err);
        }
    };
    const sendOtp = async (e) => {
        setLoading(true)
        e.preventDefault();
        if (!validate()) {
            setLoading(false);
            let tempErrors = {};
            setErrors({ formError: '' })
            return;
        }
        const endpoint = config.sendOtp;
        let data = {
            email: searchData.email,
            mobile_number: searchData.mobileNo
        };
        // addressChoice == 'member' ? data['user_id'] = memberData._id : data['employee_id'] = JSON.parse(localStorage.getItem("user"))._id
        const response = await postApi(endpoint, data);
        setLoading(false)
        if (response.statusCode == 200 || response.statusCode == 201) {
            setEmailVarification(false)
            setTimer(30);

        } else {
            let tempErrors = {};
            setErrors({ formError: response.message })
        }
    }
    const submitForVerify = async () => {
        setLoading(true);

        const data = {
            email: searchData.email,
            otp: otp
        }
        const endpoint = config.verifyOtp;
        const response = await postApi(endpoint, data);
        if (response?.statusCode == 200 || response?.statusCode == 201) {
            // setShowVerifyEmailModal(true);
            setLoading(false);
            // setResponseTitle("Verify Email");
            // setResponseHeading("Verified");
            // setResponseMessage(response?.message);
            registerUser()
        }
        if (response.statusCode == 400) {
            setLoading(false);
            // setShowModal(true);
            // setResponseTitle("Failed");
            // setResponseHeading("Oop's !!");
            // setResponseMessage(response?.message);
        }

    }
    useEffect(() => {
        fetchPlanDetails(selecetedMembership?._id, products)
    }, [selecetedMembership])
    useEffect(() => {
        let countdown;
        if (timer > 0) {
            countdown = setTimeout(() => setTimer(timer - 1), 1000);
        }
        return () => clearTimeout(countdown);
    }, [timer]);

    useEffect(() => {
        getInStoreAddress()
    }, [])

    async function applyCoupon() {
        try {
            setLoading(true)
            const endpoint = config.applyCoupon;
            const data = { couponCode: promoCode, userId: userData._id };
            const response = await postApi(endpoint, data);
            setLoading(false)
            if (response.statusCode == 200 || response.statusCode == 201) {
                let sub = products.reduce((p, q) => {
                    return p + q.quantity * q.productDetails.price;
                }, 0);
                let dis = 0;
                if (response.coupon?.discountType == "percentage") {
                    dis = (response.coupon?.discountValue / 100) * sub;
                } else {
                    dis = response.coupon?.discountValue;
                }

                setDiscount(
                    response.coupon?.maxDiscount && dis > response.coupon?.maxDiscount
                        ? response.coupon?.maxDiscount
                        : dis
                );
            } else {
                setDiscount(0)
                setFormError(response.message);
                alert(response.message);
            }
        } catch (error) {
            console.error("Error fetching categorylist:", error);
        }
    }

    const calculateShippingCost = async () => {
        setLoading(true);
        setShowAllShippingOptions(false);
        if (!toAddress) {
            setLoading(false)
            setFormError("Please select address first");
            return
        }
        try {
            const endpoint = config.getShippingCharge;

            const data = {
                from: fromAddress,
                to: toAddress,
            };

            const response = await postApi(endpoint, data);

            setLoading(false);
            if (response.statusCode == 200 || response.statusCode == 201) {
                if (response?.data?.rates.length == 0) {
                    // alert("We Not Deliver here");
                    setFormError("We Not Deliver here.");
                } else {
                    const rates = response?.data?.rates || [];
        const sortedRates = rates.sort((a, b) => parseFloat(a.amount) - parseFloat(b.amount));
                setShippingOptions(sortedRates);
                    setShowShippingCost(!showShippingCost);
                }
            }
        } catch (err) {
            console.error("Error fetching calculateShippingCost:", err);
        }
    };
    const getInStoreAddress = async () => {
        try {
            setLoading(true)
            const endpoint = config.centers;
            const response = await postApi(endpoint);
            setLoading(false)
            if (response.statusCode == 200 || response.statusCode == 201) {
                setFromAddress(response?.centers[0]._id);
                // setAllAddressInStoreDropdown(response?.centers);
            }
        } catch (error) {
            console.error("Error fetching categorylist:", error);
        }
    };


    useEffect(() => {
        const userStr = localStorage.getItem("user");
        console.log("Raw user from localStorage:", userStr);

        if (userStr) {
            const user = JSON.parse(userStr);
            console.log("Parsed user:", user);

            setUserData(user);
            getCart(user); // only call this if user is valid
        } else {
            console.warn("No user found in localStorage");
        }
    }, []);

    //   useEffect(() => {
    //     if (userData?._id) {
    //       getCart(userData);
    //     }
    //   }, [currentPage]);



    async function getCart(user) {
        console.log(user, "getCart user")
        if (user) {
            try {
                const endpoint = config.getCart;
                setLoading(true)
                const data = { user: user?._id, };
                const response = await postApi(endpoint, data);
                console.log(data, "getcart data payload")
                setLoading(false)
                if (response.statusCode == 200 || response.statusCode == 201) {
                    console.log(response.data)
                    setProducts(response.data)
                    // setTotalCount(response.totalCount)
                }

            } catch (error) {
                console.error("Error fetching categorylist:", error);
            }
        }
    }

    function getImageUrl(url) {
        const correctedUrl = url?.replace(/\\/g, "/");
        return `${process.env.NEXT_PUBLIC_API_URL}/${correctedUrl}`
    }
    async function addToCart(id, quantity, index) {
        try {

            let temp = [...products]

            if (temp[index].quantity < 2 && quantity == -1) {
                return;
            }
            setLoading(true)
            const endpoint = config.cartAdd;
            const data = { productId: id, userId: userData._id, quantity: quantity };
            const response = await postApi(endpoint, data);
            setLoading(false)
            console.log(response)
            if (response.statusCode == 200 || response.statusCode == 201) {
                temp[index].quantity = temp[index].quantity + quantity
                setProducts(temp)

            } else if (response.error) {
                alert(response.error)
            }

        } catch (error) {
            console.error("Error fetching categorylist:", error);
        }
    }

    async function removeItem(id, index) {
        try {
            let temp = [...products]
            const endpoint = config.removeItem;
            setLoading(true)
            const data = { id: id, user_id: userData._id };
            const response = await postApi(endpoint, data);
            console.log(response)
            setLoading(false)
            if (response.statusCode == 200 || response.statusCode == 201) {
                console.log(response)
                // setCartCount(response?.count)
                getCart(userData)
            }

        } catch (error) {
            console.error("Error fetching categorylist:", error);
        }
    }
    async function switchToSelfPickup() {
        setActiveTab("pickup");
        setShippingMethod()
        setBillingSame(false);
        try {
            setLoading(true)
            const endpoint = config.centers;
            const data = { couponCode: promoCode };
            const response = await postApi(endpoint, data);
            setLoading(false)
            if (response.statusCode == 200 || response.statusCode == 201) {
                setActiveTab("pickup");
                let sub = products.reduce((p, q) => {
                    return p + q.quantity * q.productDetails.price;
                }, 0);
                let dis = 0;
                if (response.coupon?.discountType == "percentage") {
                    dis = (response.coupon?.discountValue / 100) * sub;
                } else {
                    dis = response.coupon?.discountValue;
                }

                setDiscount(
                    response.coupon?.maxDiscount && dis > response.coupon?.maxDiscount
                        ? response.coupon?.maxDiscount
                        : dis
                );
            } else {
                setDiscount(0)
                alert(response.message);
            }
        } catch (error) {
            console.error("Error fetching categorylist:", error);
        }
    }

    async function byNow() {
        setFormError("");

        if (!products.length) {
            setFormError("Your cart is empty.");
            return;
        }
        if (!memberData || memberData?.length == 0) {
            setFormError("Customer is required.");
            return;
        }
        if (activeTab === "ship") {
            if (!defaultAdd || !defaultAdd._id) {
                setFormError("Shipping address is required.");
                return;
            }
            if (!shippingMethod) {
                setFormError("Shipping method is required.");
                return;
            }
        }
        else if (activeTab === "pickup") {
            // if (!pickupDate) {
            //     setFormError("Pickup date is required.");
            //     return;
            // }

        }
        if (paymentType !== "offline") {
            if (billingAddress.addressLine1 == '') {
                setFormError("Billing address 1 is required.");
                return;
            }
            // if (billingAddress.addressLine2 == '') {
            //   setFormError("Billing address 2 is required.");
            //   return;
            // }
            if (billingAddress.city == '') {
                setFormError("Billing city is required.");
                return;
            }
            if (billingAddress.state == '') {
                setFormError("Billing state is required.");
                return;
            }
            if (billingAddress.country == '') {
                setFormError("Billing country is required.");
                return;
            }
            if (billingAddress.zipcode == '') {
                setFormError("Billing zip code is required.");
                return;
            }
        }
        if (!refundPolicy) {
            setFormError("Please accept refund Policy.");
            return;
        }
        try {
            const cartIds = products.map((p) => p._id);
            const data = {
                cartIds,
                userId: memberData[0]._id,
                deliveryCharge:
                    Number(
                        shippingOptions.find((e) => e.object_id === shippingMethod)?.amount
                    ) || 0,
                carrier: shippingOptions.find((e) => e.object_id === shippingMethod)?.provider || '',
                coupanId: discount && promoCode || "",
                shippingId: shippingMethod,
                pickupDate: new Date().toISOString().split("T")[0],
                addressId: defaultAdd?._id,
                paymentMethod: paymentType,
                billingAddress1: billingAddress.addressLine1,
                billingAddress2: billingAddress?.addressLine2
            };
            if (selecetedMembership?._id) {
                data["newMembershipId"] = selecetedMembership?._id
                data["membershipId"] = selecetedMembership?._id
            } else if (oldMemberShip) {
                data["membershipId"] = oldMemberShip?._id
            }
            setLoading(true)
            const response = await postApi(paymentType == "offline" ? config.orderNowForPractitioner : config.practitionerOrderByNow, data);
            setLoading(false)
            if (response.statusCode === 200 || response.statusCode === 201) {
                if (paymentType !== 'offline') {
                    window.open(response.paymentUrl);
                } else {
                    router.push(response.paymentUrl)
                }
            }
        } catch (err) {
            console.error("Error during byNow:", err);
            setFormError("Something went wrong. Please try again.");
        }
    }
    async function removeItem(id, index) {
        try {
            let temp = [...products]
            const endpoint = config.removeItem;
            setLoading(true)
            const data = { id: id, user_id: userData._id };
            const response = await postApi(endpoint, data);
            console.log(response)
            setLoading(false)
            if (response.statusCode == 200 || response.statusCode == 201) {
                console.log(response)
                // setCartCount(response?.count)
                getCart(userData)
            }

        } catch (error) {
            console.error("Error fetching categorylist:", error);
        }
    }
    const updateQuantity = (index, newQty) => {
        if (newQty < 1) return; // prevent 0 or negative quantities

        const updated = [...products];
        updated[index].quantity = newQty;
        setProducts(updated);

        // ✅ Apply coupon only if promoCode is filled
        if (promoCode && promoCode.trim() !== "") {
            applyCoupon();
        }
    };
    useEffect(() => {
        setPaymentType('online')
    }, [selecetedMembership])
    return (
        <>
            <PractitionerHeader />
            {loading && <Loader />}
            <div className="profilesection " style={{ paddingTop: '40px' }}>
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-4 col-lg-3">
                            <div className="sidebarBx">
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h2 className="fs-7 fw-semibold m-0">My Account</h2>
                                    <button type="button" className="closeSide d-lg-none"><img src="/images/landingpage/close-icon.svg" alt=""
                                        width="24px" /></button>
                                </div>
                                <ul className="sidebar">
                                    <li><Link href={`/Employee-Portal/components/Dashboard`} >
                                        <figure> <img src="/images/landingpage/my-profile-icon.svg" alt="" width="20" /></figure> Dashboard
                                    </Link></li>
                                    <li><Link href={`/Employee-Portal/components/Calender`}>
                                        <figure> <img src="/images/landingpage/calender-icon.svg" alt="" width="20" /></figure>
                                        Calender
                                    </Link></li>
                                    <li><Link href={`/Employee-Portal/components/Earnings`}>
                                        <figure> <img src="/images/landingpage/earnings-icon.svg" alt="" width="16" /></figure>Earnings
                                    </Link></li>
                                    <li><Link href={`/Employee-Portal/components/Product`} className="active">
                                        <figure> <img src="/images/landingpage/product-icon.svg" alt="" width="21" /></figure>Product
                                    </Link></li>
                                    <li>
                                        <a
                                            className="text-danger bg-transparent border-0 d-flex align-items-center gap-2"
                                            onClick={handleLogout}
                                            style={{ cursor: "pointer" }}
                                        >
                                            <figure>
                                                <img src="/images/landingpage/logout-icon.svg" alt="" width="16" />
                                            </figure>
                                            Log out
                                        </a>
                                    </li>

                                </ul>
                            </div>
                        </div>

                        <div className="col-md-12 col-lg-9 ps-md-2 mb-3">
                            <div className="myaccoutToggle d-flex d-lg-none align-items-center gap-3 mb-3 w-100 justify-content-between">
                                <h3 className="fs-7 fw-semibold m-0">My Account</h3>
                                <button type="button" className="accToggle">
                                    <img src="/images/landingpage/toggle-icon.svg" alt="" width={24} />
                                </button>
                            </div>
                            <div className="">
                                <div className="row">
                                    <div className="col-lg-12 col-xl-7 mb-3">
                                        <div className="informationLeft ">
                                            <h6 className="fw-semibold mb-3">Vedic Yours Ayureveda</h6>
                                            <hr className="mb-3" />
                                            <div className="mb-3">
                                                <label className="mb-3 fw-medium fs-7">
                                                    Please Select your Customer
                                                </label>
                                                <ul className="nav nav-tabs cstmTbs mb-4">
                                                    <li className="nav-item">
                                                        <button
                                                            className={`nav-link ${memberData?.length > 0 && 'active'}`}//active
                                                            data-bs-toggle="modal"
                                                            data-bs-target="#memberSelect"
                                                            type="button"
                                                        >
                                                            {" "}
                                                            {memberData?.length > 0 ? memberData[0].name : "Customer"}
                                                        </button>
                                                    </li>
                                                    {/* <li className="nav-item">
                                                        <button
                                                            className={`nav-link ${addressChoice === "nonMember" && 'active'}`}
                                                            data-bs-toggle="modal"
                                                            data-bs-target="#differentModal"
                                                            type="button"
                                                            onClick={() => getAllNonMemberAddress(JSON.parse(localStorage.getItem("user")))}
                                                        >
                                                            Guest
                                                        </button>
                                                    </li> */}
                                                </ul>
                                                {/* <div className="tab-content">
                                                    <div
                                                        className="tab-pane fade show active"
                                                        id="addresstab"
                                                    >
                                                        <div className="mb-3 locatonDiv">
                                                            <span className="fw-medium d-flex fs-8 align-items-start">
                                                                <img
                                                                    src="/images/landingpage/location-red-icon.svg"
                                                                    alt=""
                                                                    className="me-3"
                                                                    width={16}
                                                                />
                                                                <div>
                                                                    <b className="d-block fw-semibold mb-1">
                                                                        {defaultAdd?.name}
                                                                    </b>
                                                                    {defaultAdd?.area},{defaultAdd?.city},
                                                                    {defaultAdd?.state},{defaultAdd?.country}-
                                                                    {defaultAdd?.pincode}
                                                                </div>
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="tab-pane fade  " id="differentAdd" />
                                                </div> */}
                                            </div>
                                            <label className="mb-3 fw-medium">Shipping Information</label>
                                            <ul className="nav nav-tabs cstmTbs mb-4">
                                                <li className="nav-item">
                                                    <button
                                                        // className="nav-link active"
                                                        // data-bs-toggle="tab"
                                                        // data-bs-target="#shipTabPane"
                                                        className={`nav-link ${activeTab === "ship" ? "active" : ""}`}
                                                        onClick={() => { setActiveTab("ship") }}
                                                        type="button"
                                                    >
                                                        Ship to Address
                                                    </button>
                                                </li>
                                                <li className="nav-item">
                                                    <button
                                                        // className="nav-link"
                                                        // data-bs-toggle="tab"
                                                        // data-bs-target="#storeTabPane"
                                                        className={`nav-link ${activeTab === "pickup" ? "active" : ""}`}
                                                        onClick={() => switchToSelfPickup()}
                                                        type="button"
                                                    >
                                                        In - Store Pickup
                                                    </button>
                                                </li>
                                            </ul>
                                            {activeTab === "ship" && <>
                                                <label className="mb-3 fw-medium fs-7">
                                                    Select Shipping Address
                                                </label>
                                                {/* NEW: Radio group – Default vs Different Address */}
                                                <div className="mb-3">
                                                    <div className="row g-2">
                                                        <div className="col-6">
                                                            {defaultAdd && Object.keys(defaultAdd).length > 0 && (
                                                                <div className="col-12">
                                                                    <div className="cstmRadio">
                                                                        <input
                                                                            type="radio"
                                                                            id="addrDefault"
                                                                            name="shipAddrChoice"
                                                                            checked={addressChoice === "default"}
                                                                            onChange={() => {
                                                                                setAddressChoice("default");
                                                                                // keep shipping 'to' in sync with currently selected default
                                                                                setToAddress(defaultAdd?._id);
                                                                            }}
                                                                        />
                                                                        <label htmlFor="addrDefault">
                                                                            <p className="d-block fw-semibold mb-1">{defaultAdd?.name}</p>
                                                                            {/* {defaultAdd?.area}, {defaultAdd?.city}, {defaultAdd?.state},{" "}
                                                                           {defaultAdd?.country} - {defaultAdd?.pincode} */}
                                                                        </label>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="col-6">
                                                            <div className="cstmRadio">
                                                                <input
                                                                    type="radio"
                                                                    id="addrDifferent"
                                                                    name="shipAddrChoice"
                                                                    checked={addressChoice === "different"}
                                                                    onChange={() => {
                                                                        setAddressChoice("different");
                                                                        setModalOpen(true); // open address selection modal
                                                                    }}
                                                                />
                                                                {/* RIGHT CARD: Different Address (open modal, DO NOT select) */}
                                                                <label
                                                                    htmlFor="addrDifferent"
                                                                    className={`addressChoiceCard ${addressChoice === "different" ? "active alt" : "alt"}`}
                                                                    // prevent label from toggling the radio
                                                                    onMouseDown={(e) => e.preventDefault()}
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        setModalOpen(true);     // open modal only
                                                                    }}
                                                                    onKeyDown={(e) => {
                                                                        // support keyboard without toggling selection
                                                                        if (e.key === "Enter" || e.key === " ") {
                                                                            e.preventDefault();
                                                                            setModalOpen(true);
                                                                        }
                                                                    }}
                                                                    role="button"
                                                                    tabIndex={0}
                                                                    aria-controls="address-select-modal"
                                                                    aria-expanded={modalOpen}
                                                                >
                                                                    <input
                                                                        type="radio"
                                                                        id="addrDifferent"
                                                                        name="shipAddrChoice"
                                                                        // never let it become checked by click/keyboard
                                                                        checked={false}
                                                                        // block native change (safety)
                                                                        onChange={(e) => {
                                                                            e.preventDefault();
                                                                            e.currentTarget.blur();
                                                                        }}
                                                                        // also block mousedown on the input itself
                                                                        onMouseDown={(e) => e.preventDefault()}
                                                                        aria-label="Choose a different address"
                                                                    />
                                                                    <div className="addrText">
                                                                        <span className="d-block fw-semibold mb-1">Different Address</span>
                                                                    </div>
                                                                </label>

                                                            </div>
                                                        </div>
                                                    </div>
                                                </div></>}
                                            {defaultAdd &&
                                                Object.keys(defaultAdd).length > 0 && (
                                                    <div className="mb-3 locatonDiv">
                                                        <span className="fw-medium d-flex fs-8 align-items-start">
                                                            <img
                                                                src="/images/landingpage/location-red-icon.svg"
                                                                alt=""
                                                                width={16}
                                                                height={16}
                                                            />
                                                            <div>
                                                                <b className="d-block fw-semibold mb-1">
                                                                    {defaultAdd?.name}
                                                                </b>
                                                                {defaultAdd?.area},{defaultAdd?.city},
                                                                {defaultAdd?.state},{defaultAdd?.country}-
                                                                {defaultAdd?.pincode}
                                                                {/* <b className="d-block fw-semibold mt-1">
                                ({defaultAdd?.mobile})s
                              </b> */}
                                                            </div>
                                                        </span>
                                                    </div>
                                                )}
                                            <div className="mb-3">
                                                <label className="mb-3 fw-medium fs-7">
                                                    Select Payment Type
                                                </label>
                                                <ul className="nav nav-tabs cstmTbs mb-4">
                                                    <li className="nav-item" onClick={() => setPaymentType('offline')}>
                                                        {!selecetedMembership && activeTab !== "ship" && <button
                                                            className={`nav-link ${paymentType == 'offline' && 'active'}`}
                                                            // data-bs-toggle="tab"
                                                            // data-bs-target="#addresstab"
                                                            type="button"
                                                        >
                                                            {" "}
                                                            Offline
                                                        </button>}
                                                    </li>
                                                    <li className="nav-item" onClick={() => setPaymentType('online')}>
                                                        <button
                                                            className={`nav-link ${paymentType == 'online' && 'active'}`}
                                                            // data-bs-toggle="modal"
                                                            // data-bs-target="#differentModal"
                                                            type="button"
                                                        >
                                                            Online
                                                        </button>
                                                    </li>
                                                </ul>
                                            </div>
                                            <div className="tab-content">
                                                <div className="tab-pane fade show active" id="shipTabPane">

                                                    {/* {!showShippingCost && activeTab === "ship" && <div className="mb-4">
                                                        <div className="d-sm-flex justify-content-between align-items-center">
                                                            <h6 className="mb-md-0 mb-sm-1">
                                                                Select Shipping Method
                                                            </h6>
                                                            {!showShippingCost && activeTab === "ship" && (
                                                                <button
                                                                    className="btn btn-primary"
                                                                    onClick={() => calculateShippingCost()}
                                                                >
                                                                    Calculate Shipping Cost
                                                                </button>
                                                            )}
                                                        </div>

                                                        {showShippingCost && activeTab === "ship" && (
                                                            <div className="calculateCost">
                                                                <figure className="my-3">
                                                                    <img
                                                                        src="/images/landingpage/postal-service.svg"
                                                                        alt=""
                                                                        width={120}
                                                                        height={80}
                                                                    />
                                                                </figure>
                                                                <div className="row m-0">
                                                                    {(showAllShippingOptions ? shippingOptions : shippingOptions.slice(0, 3)).map(
                                                                        ({
                                                                            amount,
                                                                            duration_terms,
                                                                            object_id,
                                                                            estimated_days,
                                                                        }) => (
                                                                            <div
                                                                                key={object_id}
                                                                                className="col-md-12 mb-3 px-1"
                                                                            >
                                                                                <div className="cstmRadio">
                                                                                    <input
                                                                                        type="radio"
                                                                                        id={object_id}
                                                                                        name="shipping"
                                                                                        // checked={shippingMethod === id}
                                                                                        onChange={() =>
                                                                                            setShippingMethod(object_id)
                                                                                        }
                                                                                    />
                                                                                    <label htmlFor={object_id}>
                                                                                        {duration_terms !== ""
                                                                                            ? duration_terms
                                                                                            : `Delivery within ${estimated_days} estimated days.`}{" "}
                                                                                        ${amount}
                                                                                    </label>
                                                                                </div>
                                                                            </div>
                                                                        )
                                                                    )}
                                                                </div>
                                                                <div className="text-center mt-2">
                                                                    <small className="text-muted">
                                                                        Showing {Math.min(3, shippingOptions.length)} of {shippingOptions.length}
                                                                    </small>
                                                                </div>
                                                                {shippingOptions.length > 3 && (
                                                                    <div className="text-center mt-1">
                                                                        <button
                                                                            type="button"
                                                                            className="bg-transparent border-0"
                                                                            style={{ color: '#662A09', textDecoration: 'underline', cursor: 'pointer' }}
                                                                            onClick={() => setShowAllShippingOptions(!showAllShippingOptions)}
                                                                            aria-label={showAllShippingOptions ? 'Show fewer shipping options' : 'Show all shipping options'}
                                                                        >
                                                                            {showAllShippingOptions ? 'Display less' : `Display All (${shippingOptions.length - 3} more)`}
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                        {!showShippingCost && (
                                                            <span className="note">
                                                                Click on calculate shipping cost to find shipping cost
                                                            </span>
                                                        )}
                                                    </div>} */}
                                                    <div className="mb-4">
                                                        <div className="d-sm-flex justify-content-between align-items-center">
                                                            <h6 className="mb-md-0 mb-sm-1">
                                                                Select Shipping Method
                                                            </h6>
                                                            {!showShippingCost && (
                                                                <button
                                                                    className="btn btn-primary"
                                                                    onClick={() => calculateShippingCost()}
                                                                >
                                                                    Calculate Shipping Cost
                                                                </button>
                                                            )}
                                                        </div>

                                                        {showShippingCost && (
                                                            <div className="calculateCost">
                                                                <figure className="my-3">
                                                                    <img
                                                                        src="/images/landingpage/postal-service.svg"
                                                                        alt=""
                                                                        width={120}
                                                                        height={80}
                                                                    />
                                                                </figure>
                                                                <div className="row m-0">
                                                                    {(showAllShippingOptions ? shippingOptions : shippingOptions.slice(0, 3)).map(
                                                                        ({
                                                                            amount,
                                                                            duration_terms,
                                                                            object_id,
                                                                            estimated_days,
                                                                        }) => (
                                                                            <div
                                                                                key={object_id}
                                                                                className="col-md-12 mb-3 px-1"
                                                                            >
                                                                                <div className="cstmRadio">
                                                                                    <input
                                                                                        type="radio"
                                                                                        id={object_id}
                                                                                        name="shipping"
                                                                                        // checked={shippingMethod === id}
                                                                                        onChange={() =>
                                                                                            setShippingMethod(object_id)
                                                                                        }
                                                                                    />
                                                                                    <label htmlFor={object_id}>
                                                                                        {duration_terms !== ""
                                                                                            ? duration_terms
                                                                                            : `Delivery within ${estimated_days} estimated days.`}{" "}
                                                                                        ${amount}
                                                                                    </label>
                                                                                </div>
                                                                            </div>
                                                                        )
                                                                    )}
                                                                </div>
                                                                <div className="text-center mt-2">
                                                                    <small className="text-muted">
                                                                        Showing {Math.min(3, shippingOptions.length)} of {shippingOptions.length}
                                                                    </small>
                                                                </div>
                                                                {shippingOptions.length > 3 && (
                                                                    <div className="text-center mt-1">
                                                                        <button
                                                                            type="button"
                                                                            className="bg-transparent border-0"
                                                                            style={{ color: '#662A09', textDecoration: 'underline', cursor: 'pointer' }}
                                                                            onClick={() => setShowAllShippingOptions(!showAllShippingOptions)}
                                                                            aria-label={showAllShippingOptions ? 'Show fewer shipping options' : 'Show all shipping options'}
                                                                        >
                                                                            {showAllShippingOptions ? 'Display less' : `Display All (${shippingOptions.length - 3} more)`}
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                        {!showShippingCost && (
                                                            <span className="note">
                                                                Click on calculate shipping cost to find shipping cost
                                                            </span>
                                                        )}
                                                    </div>
                                                    <label className="mb-3 fw-medium fs-7">Promo Code</label>
                                                    <div className="inputMain mt-md-3 mt-xl-0 mb-3">
                                                        <input
                                                            type="text"
                                                            className="form-control btnRight"
                                                            placeholder="Promo Code"
                                                            value={promoCode}
                                                            onChange={(e) => setPromoCode(e.target.value)}
                                                        />
                                                        <button type="button" onClick={() => applyCoupon()} className="btn btn-primary">
                                                            Apply
                                                        </button>
                                                    </div>
                                                </div>
                                                {/* <div className="tab-pane fade" id="storeTabPane">
                                                    <label className="mb-3 fw-medium fs-7">
                                                        You can pick up your order at:
                                                    </label>
                                                    <div className="mb-3 locatonDiv">
                                                        <span className="fw-medium ">
                                                            <img
                                                                src="/images/landingpage/location-red-icon.svg"
                                                                alt=""
                                                                className="me-3"
                                                                width={16}
                                                            />
                                                            Vedic Yours Ayurveda 15235 Shady Grove Road,
                                                            Rockville, MD 20850
                                                        </span>
                                                    </div>
                                                    <label className="mb-3 fw-medium fs-7">
                                                        Date To Pickup
                                                    </label>
                                                    <div className="inputMain mt-md-3 mt-xl-0 mb-3">
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            placeholder="Mar 12, 2025 - 2:10 PM"
                                                        />
                                                    </div>
                                                </div> */}
                                            </div>
                                            {/* <label className="mb-3 fw-medium fs-7">Gift Card</label>
                                            <div className="inputMain mt-md-3 mt-xl-0 mb-3">
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="Add Gift Card"
                                                />
                                            </div> */}
                                            {/* {paymentType == 'online' && <><div className="d-sm-flex justify-content-between align-items-center mb-3">
                                                <h6 className="mb-lg-0 mb-sm-1">Payment Information</h6>

                                            </div>
                                                <div className="creditMain mb-4">
                                                    <div className="d-sm-flex justify-content-between align-items-end">
                                                        <h6 className="fs-7 mb-md-3 mb-sm-2">Credit Card</h6>
                                                        <b>Enter Your Name As It’s Written On Your Card.</b>
                                                    </div>
                                                    <div className="inputMain mt-md-3 mt-xl-0 mb-3">
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            placeholder="Name On Card"
                                                        />
                                                    </div>
                                                    <div className="inputMain inputImg mt-md-3 mt-xl-0 mb-3">
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            placeholder="1234 1234 1234 1234"
                                                        />
                                                    </div>
                                                    <div className="row">
                                                        <div className="col-md-6">
                                                            <div className="inputMain mt-md-3 mt-xl-0 mb-xl-0">
                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    placeholder="Expiry (MM/YY)"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="col-md-6">
                                                            <div className="inputMain mt-md-3 mt-xl-0 mb-xl-0">
                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    placeholder="Security Code"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div></>} */}
                                            <div className="billingAdd">
                                                <h6 className="mb-4">Billing Address</h6>
                                                {/* {activeTab !== 'pickup' && <div className="cstmCheckbox mb-2">
                                                    <input type="checkbox" id="termCheck2" />
                                                    <label htmlFor="termCheck2" className="fw-medium">
                                                        Same as shipping address
                                                    </label>
                                                </div>} */}
                                                {activeTab !== 'pickup' && <div className="cstmCheckbox mb-2">
                                                    <input
                                                        type="checkbox"
                                                        id="termCheck2"
                                                        checked={billingSame}
                                                        onChange={(e) => {
                                                            const isChecked = e.target.checked;
                                                            setBillingSame(isChecked);

                                                            if (isChecked) {
                                                                if (activeTab === "ship" && defaultAdd) {
                                                                    setBillingAddress({
                                                                        addressLine1: `${defaultAdd.flatNo || ""}, ${defaultAdd.area || ""
                                                                            }, ${defaultAdd.city || ""}`,
                                                                        addressLine2: `${defaultAdd.state || ""}, ${defaultAdd.country || ""
                                                                            } - ${defaultAdd.pincode || ""}`,
                                                                    });
                                                                } else if (
                                                                    activeTab === "pickup" &&
                                                                    inStoreAddressDropdown
                                                                ) {
                                                                    const selectedInstore =
                                                                        allAddressInStoreDropdown.find(
                                                                            (x) => x._id === inStoreAddressDropdown
                                                                        );
                                                                    if (selectedInstore) {
                                                                        setBillingAddress({
                                                                            addressLine1: `${selectedInstore.address || ""
                                                                                }`,
                                                                            addressLine2: `${selectedInstore.city || ""}, ${selectedInstore.state || ""
                                                                                }`,
                                                                        });
                                                                    }
                                                                }
                                                            } else {
                                                                setBillingAddress({
                                                                    addressLine1: "",
                                                                    addressLine2: "",
                                                                });
                                                            }
                                                        }}
                                                    />
                                                    <label htmlFor="termCheck2" className="fw-medium">
                                                        Same as shipping address
                                                    </label>
                                                </div>}
                                                {/* <div className="inputMain input-group d-flex mb-3">
                                                    <button
                                                        className="btn btnDrop"
                                                        type="button"
                                                        data-bs-toggle="dropdown"
                                                    >
                                                        <img src="/images/landingpage/flag-icon.svg" alt="" width={20} />
                                                    </button>
                                                    <ul className="dropdown-menu">
                                                        <li>
                                                            <a className="dropdown-item" href="#">
                                                                <img src="/images/landingpage/flag-icon.svg" alt="" width={20} />
                                                            </a>
                                                        </li>
                                                    </ul>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        placeholder="Address Line 1"
                                                    />
                                                </div>
                                                <div className="inputMain mt-xl-0 mb-xl-0">
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        placeholder="Address Line 2 (Optional)"
                                                    />
                                                </div> */}
                                                <div className="inputMain input-group d-flex mb-3">
                                                    <button className="btn btnDrop" type="button">
                                                        <img
                                                            src="/images/landingpage/flag-icon.svg"
                                                            alt=""
                                                            width={20}
                                                            height={20}
                                                        />
                                                    </button>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        placeholder="Address Line 1"
                                                        value={billingAddress.addressLine1}
                                                        onChange={(e) =>
                                                            setBillingAddress({
                                                                ...billingAddress,
                                                                addressLine1: e.target.value,
                                                            })
                                                        }
                                                    />
                                                </div>

                                                <div className="inputMain mt-xl-0 mb-xl-0 mb-3">
                                                    <input
                                                        type="text"
                                                        className="form-control mb-3"
                                                        placeholder="Address Line 2 (Optional)"
                                                        value={billingAddress.addressLine2}
                                                        onChange={(e) =>
                                                            setBillingAddress({
                                                                ...billingAddress,
                                                                addressLine2: e.target.value,
                                                            })
                                                        }
                                                    />
                                                    {/* <span className="secured">
                      <img
                        src="/images/landingpage/secured-icon.svg"
                        alt=""
                        width={18}
                        height={18}
                        className="me-2"
                      />
                      Secured <b>By Vagaro</b>
                    </span> */}
                                                </div>
                                                <div className="inputMain mt-xl-0 mb-xl-0 mb-3">
                                                    <input
                                                        type="text"
                                                        className="form-control mb-3"
                                                        placeholder="City"
                                                        value={billingAddress.city}
                                                        onChange={(e) =>
                                                            setBillingAddress({
                                                                ...billingAddress,
                                                                city: e.target.value,
                                                            })
                                                        }
                                                    />
                                                    <input
                                                        type="text"
                                                        className="form-control mb-3 "
                                                        placeholder="State"
                                                        value={billingAddress.state}
                                                        onChange={(e) =>
                                                            setBillingAddress({
                                                                ...billingAddress,
                                                                state: e.target.value,
                                                            })
                                                        }
                                                    />
                                                    <input
                                                        type="text"
                                                        className="form-control mb-3 "
                                                        placeholder="Country"
                                                        value={billingAddress.country}
                                                        onChange={(e) =>
                                                            setBillingAddress({
                                                                ...billingAddress,
                                                                country: e.target.value,
                                                            })
                                                        }
                                                    />
                                                    <input
                                                        type="text"
                                                        className="form-control "
                                                        placeholder="Zip Code"
                                                        value={billingAddress.zipcode}
                                                        onChange={(e) =>
                                                            setBillingAddress({
                                                                ...billingAddress,
                                                                zipcode: e.target.value,
                                                            })
                                                        }
                                                    />
                                                </div>
                                                <div className="cstmCheckbox mb-2">
                                                    <input
                                                        type="checkbox"
                                                        id="termCheck3"
                                                        onChange={(e) => setRefundPolicy(e.target.checked)}
                                                        checked={refundPolicy}
                                                    />
                                                    <label htmlFor="termCheck3" className="fw-medium my-4">
                                                        By clicking &#39;Buy Now&#39; I agree to the Vedic Yours{" "}
                                                        <span
                                                            className="hyperlink"
                                                            onClick={async (e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation(); // 🔒 don’t toggle checkbox
                                                                // open immediately (better UX), then load content
                                                                setShowPolicyModal(true);
                                                                const html = await fetchRefundPolicy();
                                                                setModalContent(html);
                                                            }}
                                                            role="button"
                                                            tabIndex={0}
                                                        >
                                                            Refund Policy
                                                        </span>
                                                    </label>
                                                </div>
                                                {formError && (
                                                    <div
                                                        className="alert alert-danger text-center" style={{ height: "40px", display: "flex", justifyContent: "center", alignItems: "center" }}
                                                        role="alert"
                                                    >
                                                        {formError}
                                                    </div>
                                                )}
                                                <div className="text-center mb-3">
                                                    <button
                                                        type="button"
                                                        className="btn btn-success"
                                                        data-bs-target="#thankyouorderModal"
                                                        data-bs-toggle="modal"
                                                        onClick={() => byNow()}
                                                        disabled={(!showShippingCost && !refundPolicy)}
                                                    >
                                                        Buy Now
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-lg-12 col-xl-5 mb-3">
                                        <div className="totalMain">
                                            <div className="table-responsive tableDiv">
                                                <table className="table">
                                                    <tbody>
                                                        {/* {products&&products?.length>0&&products.map((pro,index)=>
                                                        
                                                        <tr>
                                                            <td width="60%" className="ps-0">
                                                                <div className="productTable firstPd">
                                                                    <figure className="m-0" style={{ cursor: "pointer" }}
                                onClick={() => goToNextPage(pro?.productDetails)} >
                                <img src={`${getImageUrl(pro.productDetails?.coverImage)}`} alt="Product" width={80} height={80} />
                              </figure>
                                                                    <div className="">
                                                                        <h6 style={{ cursor: "pointer" }}
                                                                            onClick={() => goToNextPage(pro?.productDetails)}
                                                                        >{pro?.productDetails?.productName}</h6>
                                                                        <span>{pro?.productDetails?.category_name}<b className="d-block">Brand: {pro?.productDetails?.brand_name}</b></span>
                                                                        
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td width="20%" className="fw-medium text-center">
                                                                1
                                                            </td>
                                                            <td width="20%" className="fw-medium text-end pe-0">
                                                                $15.00
                                                            </td>
                                                        </tr>)} */}
                                                        {products &&
                                                            products.map((pro, idx) => (
                                                                <tr key={idx}>
                                                                    <td width="60%" className="ps-0">
                                                                        <div className="productTable firstPd">
                                                                            <figure className="m-0">
                                                                                <img
                                                                                    src={`${getImageUrl(
                                                                                        pro.productDetails.coverImage
                                                                                    )}`}
                                                                                    alt=""
                                                                                    width={80}
                                                                                    height={80}
                                                                                />
                                                                            </figure>
                                                                            <div>
                                                                                <h6 className="d-flex align-items-center gap-2">
                                                                                    {pro?.productDetails.productName}
                                                                                    {pro?.productDetails?.membershipDiscount && (
                                                                                        <span
                                                                                            style={{
                                                                                                backgroundColor: "#e8f5e9",
                                                                                                color: "#2e7d32",
                                                                                                fontSize: "0.75rem",
                                                                                                padding: "2px 6px",
                                                                                                borderRadius: "6px",
                                                                                                fontWeight: "600",
                                                                                            }}
                                                                                        >
                                                                                            Member Price
                                                                                        </span>
                                                                                    )}
                                                                                </h6>

                                                                                <span>{pro?.productDetails.brand_name}</span>
                                                                                <div className="d-flex mt-2 align-items-center gap-2">
                                                                                    {/* <button
                                                                                        style={{ borderColor: 'transparent' }}
                                                                                        className="btn btn-sm qty-btn"
                                                                                        onClick={() =>
                                                                                            updateQuantity(idx, pro.quantity - 1)
                                                                                        }
                                                                                        disabled={
                                                                                            pro.quantity <=
                                                                                            pro.productDetails.minOrderQuantity
                                                                                        }
                                                                                    >
                                                                                        −
                                                                                    </button> */}

                                                                                    <span className="qty-value">{pro.quantity}</span>

                                                                                    {/* <button
                                                                                        style={{ borderColor: 'transparent' }}
                                                                                        className="btn btn-sm qty-btn"
                                                                                        onClick={() =>
                                                                                            updateQuantity(idx, pro.quantity + 1)
                                                                                        }
                                                                                        disabled={
                                                                                            pro.quantity >=
                                                                                            pro.productDetails.maxOrderQuantity
                                                                                        }
                                                                                    >
                                                                                        +
                                                                                    </button> */}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </td>

                                                                    <td width="20%" className="fw-medium text-end pe-0">
                                                                        {pro?.productDetails?.membershipDiscount ? (
                                                                            <>
                                                                                <span className="text-decoration-line-through text-muted me-1">
                                                                                    ${pro?.productDetails.originalPrice * pro?.quantity}
                                                                                </span>
                                                                                <span className="text-success">
                                                                                    ${pro?.productDetails.price * pro?.quantity}
                                                                                </span>
                                                                                <small className="text-success d-block">
                                                                                    ({pro?.productDetails.membershipDiscount}% off )
                                                                                </small>
                                                                            </>
                                                                        ) : (
                                                                            <>${pro?.productDetails.price * pro?.quantity}</>
                                                                        )}
                                                                    </td>


                                                                    {/* <td width="10%" className="text-end pe-0">
                                                                        <span
                                                                            onClick={() => removeItem(idx)}
                                                                            style={{ cursor: "pointer", color: "#662A09" }}
                                                                        >
                                                                            <Trash size={20} />
                                                                        </span>
                                                                    </td> */}
                                                                </tr>
                                                            ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                            {/* <div className="d-flex justify-content-between mt-2">
                                                
                                                <h6 className="m-0">
                                                    Sub Total ({products?.length}{" "}
                                                    {products?.length > 1 ? "Items" : "Item"})
                                                </h6>
                                                <span>
                                                    $
                                                    {products?.reduce((p, q) => {
                                                        return p + q.quantity * q.productDetails.price;
                                                    }, 0)}
                                                </span>
                                            </div> */}
                                            <div className="d-flex justify-content-between mt-2">
                                                <h6 className="m-0">
                                                    Sub Total ({products?.length}{" "}
                                                    {products?.length > 1 ? "Items" : "Item"})
                                                </h6>
                                                <span>
                                                    $
                                                    {products?.reduce((p, q) => {
                                                        return p + q.quantity * q.productDetails.price;
                                                    }, 0)}
                                                </span>
                                            </div>
                                            <div className="d-flex justify-content-between mt-2">
                                                <h6 className="m-0">Discount </h6>
                                                <span>${discount || 0}</span>
                                            </div>
                                            <div className="d-flex justify-content-between mt-2">
                                                <h6 className="m-0">Shipping </h6>
                                                <span>
                                                    $
                                                    {shippingOptions.find((e) => e.object_id === shippingMethod)
                                                        ?.amount || 0}
                                                </span>
                                            </div>
                                            {selecetedMembership && <div className="d-flex justify-content-between mt-2">
                                                <h6 className="m-0">MemberShip </h6>
                                                <span>
                                                    $ {`${selecetedMembership?.price}`}</span></div>}
                                            {console.log(products?.reduce(
                                                (total, item) =>
                                                    Number(total) +
                                                    Number(item.quantity) * Number(item.productDetails.price),
                                                0
                                            ), discount, (shippingMethod
                                                ? Number(
                                                    shippingOptions.find(
                                                        (e) => e.object_id === shippingMethod
                                                    )?.amount
                                                ) || 0
                                                : 0), products, "bbbbbbbbbbb")}
                                            <div className="d-flex justify-content-between mt-2">
                                                <h6 className="m-0">Total</h6>$
                                                {products?.reduce(
                                                    (total, item) =>
                                                        Number(total) +
                                                        Number(item.quantity) * Number(item.productDetails.price),
                                                    0
                                                ) -
                                                    Number(discount || 0) +
                                                    (shippingMethod
                                                        ? Number(
                                                            shippingOptions.find(
                                                                (e) => e.object_id === shippingMethod
                                                            )?.amount
                                                        ) || 0
                                                        : 0) + Number(selecetedMembership?.price || 0)}{" "}
                                            </div>

                                            <hr />
                                            <div className="d-flex flex-column align-items-center gap-3" onClick={() => router.push("/Employee-Portal/components/Employee-cart")}>
                                                <button className="btn btn-shopping bg-white w-75">
                                                    &lt; Back to Cart
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="modal fade orderDetailModal" id="differentModal">
                <div className="modal-dialog">
                    <div className="modal-content border-0">
                        <div className="modal-header border-0">
                            <h1 className="modal-title fs-6">Order Detail</h1>
                            <button
                                type="button"
                                className="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                                onClick={() => setAddAddressType()}
                            />
                        </div>
                        <div className="modal-body">
                            <div className="d-flex align-items-center justify-content-between mb-3">
                                <h3 className="text-secondary fs-8">Select Address</h3>
                                <button
                                    type="button"
                                    className="btn btn-primary fs-8 py-2 px-3"
                                    data-bs-target="#addDifferentModal"
                                    data-bs-toggle="modal"
                                    onClick={() => { setAddAddressType('nonMember'), setAddAddressModal(true) }}
                                >
                                    Add Address
                                </button>
                            </div>
                            <div className="row">
                                {nonMemberAddress && nonMemberAddress?.length > 0 && nonMemberAddress.map((add, index) =>
                                    <div key={add?._id} className="col-md-6 mb-3"
                                        onClick={() => {
                                            setDefaultAdd(add);
                                            setToAddress(add?._id);
                                            setAddressChoice('nonMember')
                                        }}>
                                        <div className="addressDivBox">
                                            <div className="cstmRadio">
                                                <input
                                                    type="radio"
                                                    name="radio1"
                                                    className="d-none"
                                                    id="radio1"
                                                    checked={defaultAdd?._id == add?._id}
                                                />
                                                <label htmlFor="radio1" className="p-0 border-0" />
                                            </div>
                                            <h4>
                                                {add?.name || ""} <b>({add.mobile || ""})</b>
                                            </h4>
                                            <p>
                                                {add?.flatNo},{add?.city},{add?.state},
                                                {add?.country}-{add?.pincode}
                                            </p>
                                            <div className="d-flex justify-content-between">
                                                <span className="d-flex align-items-center gap-2 fs-8">
                                                    <img
                                                        src="/images/landingpage/material-location-on.svg"
                                                        alt=""
                                                        width={13}
                                                    />{" "}
                                                    {add?.area}
                                                </span>
                                                <div className="d-flex gap-2">
                                                    <button
                                                        type="button"
                                                        className="bg-transparent border-0 p-0"
                                                    >
                                                        <img src="/images/landingpage/edit-icon.svg" alt="" width={16} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="bg-transparent border-0 p-0"
                                                    >
                                                        <img src="/images/landingpage/delete-icon.svg" alt="" width={11} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>)}
                            </div>

                        </div>

                        <div className="modal-footer justify-content-center">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                data-bs-dismiss="modal"
                                onClick={() => { setAddAddressType() }}>
                                Back
                            </button>
                            <button type="button" className="btn btn-primary"
                                onClick={() => { setAddAddressType() }}>
                                Continue
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="modal fade orderDetailModal" id="memberSelect">
                <div className="modal-dialog">
                    <div className="modal-content border-0">
                        <div className="modal-header border-0">
                            <h1 className="modal-title fs-6">Search Customer</h1>
                            <button
                                type="button"
                                className="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                            />
                        </div>
                        <div className="modal-body">

                            <div className="row">
                                <form onSubmit={searchUser} className="row">
                                    <div className="col-md-6  mb-3">
                                        <div className="form-group">
                                            <label htmlFor="">Search</label>
                                            <input type="text" className="form-control" onChange={(e) => {

                                                // {  // ...searchData,
                                                // // [e.target.name]: 
                                                // e.target.value,  }                          
                                                // )
                                                setSearchUserData(e.target.value), setMemberData(), setSelecetedMembership(false), setOldMemberShip(false), setShowPlans(false)
                                            }}
                                                placeholder="Search by Name, Email, Mobile No."
                                                name="mobileNo" id="" required />
                                            {errors.mobileNo && (
                                                <small className="text-danger">
                                                    {errors.mobileNo}
                                                </small>
                                            )}
                                        </div>
                                    </div>
                                    {/* <div className="col-md-6  mb-3">
                                        <div className="form-group">
                                            <label htmlFor="">Email Id</label>
                                            <input type="text" className="form-control" name="email" id="" onChange={(e) => {
                                                setSearchData({
                                                    ...searchData,
                                                    [e.target.name]: e.target.value,
                                                }), setMemberData(), setSelecetedMembership(false),setOldMemberShip(false),setShowPlans(false)
                                            }} required
                                            />
                                            {errors.email && (
                                                <small className="text-danger">
                                                    {errors.email}
                                                </small>
                                            )}
                                        </div>
                                    </div> */}
                                    <div className="modal-footer justify-content-center">
                                        {!memberData && <button
                                            type="submit"
                                            className="btn btn-primary"
                                        >
                                            Search Customer Details
                                        </button>}
                                    </div>
                                    <div className="d-flex align-items-center justify-content-between mb-3">
                                        {/* {memberData && memberData?.length > 0 && <><h3 className="text-secondary fs-8">Select Address</h3>
                                            <button
                                                type="button"
                                                className="btn btn-primary fs-8 py-2 px-3"
                                                data-bs-target="#addDifferentModal"
                                                data-bs-toggle="modal"
                                                onClick={() => setAddAddressModal(true)}
                                            >
                                                Add Address
                                            </button></>} */}
                                    </div>
                                </form>
                                {/* {memberData && memberData[0]?.address?.length > 0 && memberData[0]?.address.map((add, index) =>

                                    <div key={index} className="col-md-6 mb-3" onClick={() => {
                                        setDefaultAdd(add);
                                        setToAddress(add?._id); // IMPORTANT: ship-to must follow selected address
                                    }}>
                                        <div className="addressDivBox">
                                            <div className="cstmRadio" >
                                                <input
                                                    type="radio"
                                                    name="radio1"
                                                    className="d-none"
                                                    id="radio1"
                                                    checked={defaultAdd?._id == add?._id}
                                                />
                                                <label htmlFor="radio1" className="p-0 border-0" />
                                            </div>
                                            <h4>
                                                {add?.name || ""} <b>({add.mobile || ""})</b>
                                            </h4>
                                            <p>
                                                {add?.flatNo},{add?.city},{add?.state},
                                                {add?.country}-{add?.pincode}
                                            </p>
                                            <div className="d-flex justify-content-between">
                                                <span className="d-flex align-items-center gap-2 fs-8">
                                                    <img
                                                        src="/images/landingpage/material-location-on.svg"
                                                        alt=""
                                                        width={13}
                                                    />{" "}
                                                    {add?.area}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )} */}

                            </div>
                            {memberData && <>
                                {memberData.length > 0 ? <h6>Membership Detail</h6> : <><h6>{"The mobile number and email Id not regester in our system click to verify with customer's email Id."}</h6>
                                    <span className="text-center justify-content-center">Verify your email Id to Proceed this order</span>
                                    <form onSubmit={sendOtp} className="row">
                                        <div className="col-md-6  mb-3">
                                            <div className="form-group">
                                                <label htmlFor="">First Name</label>
                                                <input type="text" className="form-control" name="name" id="" onChange={(e) => {
                                                    setSearchData({
                                                        ...searchData,
                                                        [e.target.name]: e.target.value,
                                                    })//, setMemberData(), setSelecetedMembership(false), setOldMemberShip(false), setShowPlans(false)
                                                }} required
                                                />
                                                {errors.name && (
                                                    <small className="text-danger">
                                                        {errors.name}
                                                    </small>
                                                )}
                                            </div>
                                        </div>
                                        <div className="col-md-6  mb-3">
                                            <div className="form-group">
                                                <label htmlFor="">Last Name</label>
                                                <input type="text" className="form-control" name="lastName" id="" onChange={(e) => {
                                                    setSearchData({
                                                        ...searchData,
                                                        [e.target.name]: e.target.value,
                                                    })//, setMemberData(), setSelecetedMembership(false), setOldMemberShip(false), setShowPlans(false)
                                                }} required
                                                />
                                                {errors.lastName && (
                                                    <small className="text-danger">
                                                        {errors.lastName}
                                                    </small>
                                                )}
                                            </div>
                                        </div>
                                        <div className="col-md-6  mb-3">
                                            <div className="form-group">
                                                <label htmlFor="">Email Id</label>
                                                <input type="text" className="form-control" name="email" id="" onChange={(e) => {
                                                    setSearchData({
                                                        ...searchData,
                                                        [e.target.name]: e.target.value,
                                                    })//, setMemberData(), setSelecetedMembership(false), setOldMemberShip(false), setShowPlans(false)
                                                }} required
                                                />
                                                {errors.email && (
                                                    <small className="text-danger">
                                                        {errors.email}
                                                    </small>
                                                )}
                                            </div>
                                        </div>
                                        <div className="col-md-6  mb-3">
                                            <div className="form-group">
                                                <label htmlFor="">Mobile No.</label>
                                                <input type="number" className="form-control" name="mobileNo" id="" onChange={(e) => {
                                                    setSearchData({
                                                        ...searchData,
                                                        [e.target.name]: e.target.value,
                                                    })//, setMemberData(), setSelecetedMembership(false), setOldMemberShip(false), setShowPlans(false)
                                                }} required
                                                />
                                                {errors.mobileNo && (
                                                    <small className="text-danger">
                                                        {errors.mobileNo}
                                                    </small>
                                                )}
                                            </div>
                                        </div>
                                        {errors.formError && (
                                            <small className="text-danger">
                                                {errors.formError}
                                            </small>
                                        )}
                                        {memberData?.length == 0 && emailVarification && <div className="text-center justify-content-center"><br></br>
                                            <button type="submit" className=" btn btn-primary" >Email Verification</button></div>}
                                    </form></>}

                                {/* {memberData?.length == 0 && emailVarification && <div className="text-center justify-content-center"><br></br>
                                    <button className=" btn btn-primary" onClick={() => sendOtp()}>Email Verification</button></div>} */}


                                {memberData?.length == 0 && !emailVarification &&
                                    <form>
                                        {/* <div className="mb-3">
                                            <label className="form-label">Name</label>
                                            <input className="form-control w-100" type="email" value={searchData?.name} onChange={(e) => setSearchData({ ...searchData, name: e.target.value })} />
                                        </div> */}
                                        <div className="otpMain">
                                            <strong>Enter Verification Code</strong>
                                            <div className="otpFind">
                                                <OtpInput
                                                    value={otp}
                                                    onChange={(e) => { setOtp(e) }}
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
                                        {timer == 0 && <strong className="resend pb-0">Did not get a code? <a style={{ cursor: "pointer", color: "#30C768" }} onClick={(e) => sendOtp(e)}><u>Click to Resend</u></a></strong>}
                                        <div className="text-center my-2 mt-4">
                                            <button type="button" className="btn btn-primary w-50" onClick={() => { submitForVerify() }}>Submit</button>
                                        </div>
                                    </form>
                                }
                                {console.log(showPlans, !selecetedMembership, memberData, memberData[0]?.membership?.length > 0)}
                                {/* <div className='d-flex'> <span> Active Membership plan : <h6>No Active plan</h6> </span> </div> */}
                                {!selecetedMembership && memberData && memberData[0]?.membership?.length == 0 && <div className='d-flex'>
                                    <span>
                                        Membership Status: <span className="text-danger fw-semibold">No Active Plan</span>
                                    </span>
                                </div>}
                                {!selecetedMembership && oldMemberShip && <>
                                    <span>
                                        MemberShip Price: <span className="text-success fw-semibold">$ {`${oldMemberShip?.price}`}</span>
                                    </span><div className='d-flex'>
                                        <span>
                                            Selected Membership Plan: <span className="text-success fw-semibold">{`${oldMemberShip ? oldMemberShip?.plan_name : 'Current Plan'}`}</span>
                                        </span>
                                    </div>
                                </>}
                                {selecetedMembership && showPlans && !oldMemberShip && <>
                                    <span>
                                        MemberShip Price: <span className="text-success fw-semibold">$ {`${selecetedMembership?.price}`}</span>
                                    </span><div className='d-flex'>
                                        <span>
                                            Selected Membership Plan: <span className="text-success fw-semibold">{`${selecetedMembership ? selecetedMembership?.plan_name : 'Current Plan'}`}</span>
                                        </span>
                                    </div>
                                </>}

                                {!selecetedMembership && !oldMemberShip && (memberData?.length > 0) && <> <div className="text-center m-2">
                                    <span>
                                        Ask the customer if they would like to add a membership to receive additional discounts on purchases.
                                    </span>
                                </div>
                                    <div className="text-center justify-content-center ">
                                        {!showPlans && <button //memberData[0]?.membership?.length == 0&&
                                            type="submit"
                                            className="btn btn-primary"
                                            onClick={() => setShowPlans(true)}
                                        >
                                            Add Membership
                                        </button>}
                                    </div></>}
                                {!selecetedMembership && showPlans && <Memberships setSelecetedMembership={setSelecetedMembership} />}
                                {console.log(selecetedMembership, "setSelecetedMembership")}
                            </>}
                            {/* maderchoood */}
                        </div>

                        <div className="modal-footer justify-content-center">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                data-bs-dismiss="modal"
                            // onClick={() => setModalOpen(false)}

                            >
                                Back
                            </button>
                            <button type="button" data-bs-dismiss="modal"
                                aria-label="Close" className="btn btn-primary" onClick={() => {
                                    // setModalOpen(false);
                                    // setAddressChoice("member"); // show the newly selected address as the active choice
                                }}>
                                Continue
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {addAddressModal && (
                <div className="modal fade show d-block orderDetailModal" style={{ background: "rgba(0,0,0,0.5)" }}>
                    <div className="modal-dialog">
                        <div className="modal-content border-0">
                            <div className="modal-header border-0">
                                <h1 className="modal-title fs-6">
                                    {isEditingAddress ? "Edit Address" : "Add Address"}
                                </h1>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => {
                                        setAddAddressModal(false);
                                        setIsEditingAddress(false);
                                        setEditingAddressId(null);
                                        setAddressVailidation(undefined);
                                    }}
                                />
                            </div>

                            <div className="modal-body">
                                <form className="commentForm">
                                    {/* keep existing inputs; ensure they are controlled with value=... */}
                                    {/* CHANGES: make inputs use value=newAddress.<field> so they show prefilled data */}
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <div className="form-group">
                                                <label>Name</label>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    className="form-control w-100"
                                                    value={newAddress.name}
                                                    onChange={(e) => finalAddress(e)}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <div className="form-group">
                                                <label>Mobile Number</label>
                                                <input
                                                    type="text"
                                                    name="mobile"
                                                    className="form-control w-100"
                                                    value={newAddress.mobile}
                                                    onChange={(e) => finalAddress(e)}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <div className="form-group">
                                                <label>Street Address</label>
                                                <input
                                                    type="text"
                                                    name="area"
                                                    className="form-control w-100"
                                                    value={newAddress.area}
                                                    onChange={(e) => finalAddress(e)}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <div className="form-group">
                                                <label>Apt/Suite</label>
                                                <input
                                                    type="text"
                                                    name="flatNo"
                                                    className="form-control w-100"
                                                    value={newAddress.flatNo}
                                                    onChange={(e) => finalAddress(e)}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <div className="form-group">
                                                <label>City</label>
                                                <input
                                                    type="text"
                                                    name="city"
                                                    className="form-control w-100"
                                                    value={newAddress.city}
                                                    onChange={(e) => finalAddress(e)}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <div className="form-group">
                                                <label>State</label>
                                                <input
                                                    type="text"
                                                    name="state"
                                                    className="form-control w-100"
                                                    value={newAddress.state}
                                                    onChange={(e) => finalAddress(e)}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <div className="form-group">
                                                <label>Country</label>
                                                <input
                                                    type="text"
                                                    name="country"
                                                    className="form-control w-100"
                                                    value={newAddress.country}
                                                    onChange={(e) => finalAddress(e)}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <div className="form-group">
                                                <label>Zip</label>
                                                <input
                                                    type="text"
                                                    name="pincode"
                                                    className="form-control w-100"
                                                    value={newAddress.pincode}
                                                    onChange={(e) => finalAddress(e)}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {addressValidation && <h6 className="text-danger">{addressValidation}</h6>}

                                    <div className="modal-footer justify-content-center border-0">
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={() => {
                                                setAddAddressModal(false);
                                                setIsEditingAddress(false);
                                                setEditingAddressId(null);
                                                setAddressVailidation(undefined);
                                            }}
                                        >
                                            Back
                                        </button>

                                        <button
                                            type="button"
                                            className="btn btn-primary"
                                            onClick={() => (isEditingAddress ? updateAddress() : addAddress())}
                                            disabled={loading}
                                        >
                                            {isEditingAddress ? (loading ? "Saving..." : "Save Changes") : (loading ? "Saving..." : "Continue")}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {modalOpen && (
                <div
                    className="modal fade show d-block orderDetailModal"
                    style={{ background: "rgba(0,0,0,0.5)" }}
                >
                    <div className="modal-dialog" >
                        <div className="modal-content border-0" style={{ minWidth: '700px' }}>
                            <div className="modal-header border-0">
                                <h1 className="modal-title" style={{ fontSize: '1rem' }}>Order Detail</h1>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setModalOpen(false)}
                                ></button>
                            </div>

                            <div className="modal-body">
                                <div className="d-flex align-items-center justify-content-between mb-3">

                                    <h3 className="text-secondary fs-8">Select Address</h3>
                                    <button
                                        type="button"
                                        className="btn btn-primary fs-8 py-2 px-3"
                                        onClick={() => {
                                            setModalOpen(false);
                                            setAddAddressModal(true);
                                        }}
                                        disabled={!memberData || memberData?.length == 0}
                                    >
                                        Add Address
                                    </button>
                                </div>
                                <div className="row">
                                    {(!memberData || memberData?.length == 0) &&
                                        <span>Please first select customer</span>}
                                    {addresses &&
                                        addresses.map((add, index) => {
                                            return (
                                                <div className="col-md-6 mb-3" key={index} onClick={() => {
                                                    setDefaultAdd(add);
                                                    setToAddress(add?._id); // IMPORTANT: ship-to must follow selected address
                                                }}>
                                                    <div className="addressDivBox">
                                                        <div
                                                            className="cstmRadio"
                                                            onClick={() => {
                                                                setDefaultAdd(add);
                                                                setToAddress(add?._id); // IMPORTANT: ship-to must follow selected address
                                                            }}
                                                        >

                                                            <input
                                                                type="radio"
                                                                onClick={() =>
                                                                    setSelectedShippingAdd(add?._id)
                                                                }
                                                                checked={defaultAdd?._id == add?._id}
                                                            />
                                                            <label
                                                                htmlFor="radio1"
                                                                className="p-0 border-0"
                                                            ></label>
                                                        </div>
                                                        <h4>
                                                            {add?.name}
                                                            {/* <b>({add?.mobile})s</b> */}
                                                        </h4>
                                                        <p>
                                                            {add?.flatNo},{add?.city},{add?.state},
                                                            {add?.country}-{add?.pincode}
                                                        </p>
                                                        <div className="d-flex justify-content-between">
                                                            <span className="d-flex align-items-center gap-2 fs-8">
                                                                <img
                                                                    src="/images/landingpage/material-location-on.svg"
                                                                    alt=""
                                                                    width="13"
                                                                />{" "}
                                                                {add?.area}
                                                            </span>

                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                </div>
                            </div>

                            <div className="modal-footer justify-content-center">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setModalOpen(false)}
                                >
                                    Back
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={() => {
                                        setModalOpen(false);
                                        setAddressChoice("default"); // show the newly selected address as the active choice
                                    }}
                                >
                                    Continue
                                </button>

                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* <div className="modal fade " id="thankyouorderModal">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content border-0">
                        <div className="modal-header border-0">
                            <button
                                type="button"
                                className="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                            />
                        </div>
                        <div className="modal-body text-center">
                            <lottie-player
                                src="/images/landingpage/cart.json"
                                background="transparent"
                                speed={1}
                                style={{ width: 130, height: 130, margin: "auto" }}
                                loop=""
                                autoPlay=""
                            />
                            <h2 className="fs-6">Thank you for ordering !</h2>
                            <p>Lorem Ipsum Simply dummy text for typesetting industry</p>
                            <div className="modal-footer justify-content-center border-0">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    data-bs-dismiss="modal"
                                >
                                    Back
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div> */}

        </>

    )
}