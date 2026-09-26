
"use client";
import React, { useState, useRef, useEffect } from "react";
import DynamicModal3 from "services/Pop-ups/popup3/page";
import { DateTime } from "luxon";
import Link from "next/link";
import HeaderWithDropdown from "app/(landingpage)/LandingPage/components/HeaderWithDropdown/page";
import FooterSection from "app/(landingpage)/LandingPage/components/Footer/page";
import { useParams, useRouter } from "next/navigation";
import { config } from "services/config";
import { useSearchParams } from "next/navigation";
import { postApi } from "services/api";
import axios from "axios";
import Loader from "services/Loader/page";
import 'app/(landingpage)/LandingPage/public/css/developer.css';
import 'app/(landingpage)/LandingPage/public/css/style.css';
import { StarFill } from 'react-bootstrap-icons';
// import SubHeader from "app/(landingpage)/LandingPage/components/SubHeader/page";
import moment from "node_modules/moment/moment";
import { loadStripe } from "@stripe/stripe-js";
import {
  forwardRef,
  useImperativeHandle,
} from "react";
import Swal from "sweetalert2";
import { PencilSquare, Trash } from "react-bootstrap-icons";
// import CardPage from "app/(landingpage)/LandingPage/components/CardDetails/page";
import dynamic from 'next/dynamic';

// Import CardDetailsPage dynamically and disable SSR
// const CardPage = dynamic(
//   () => import('app/(landingpage)/LandingPage/components/CardDetails/page'),
//   { ssr: false }
// );
import {
  Elements,
  CardElement,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";


const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
const INITIAL_FAMILY_FORM = {
  email: "",
  phone: "",
  firstName: "",
  lastName: "",
  gender: "",
  birthMonth: "",
  birthDay: "",
  birthYear: "",
  species: "",
  weight: ""
};
const NAME_MIN = 2;                          // doc: min readable length
const NAME_MAX = 15;                         // doc: hard cap
const NAME_REGEX = /^[A-Za-z][A-Za-z\s'-]*$/; // doc: letters, spaces, apostrophes, hyphens
export default function CartMethodPage() {
  let { id } = useParams();
  id = decodeURIComponent(id).split(",");
  const [loading, setLoading] = useState(false);
  const cardRef = useRef(null);
const [isEditing, setIsEditing] = useState(false);
  const [policyHtml, setPolicyHtml] = useState("");
const [policyLoading, setPolicyLoading] = useState(false);
const [policyError, setPolicyError] = useState("");
  const [acceptPolicy, setAcceptPolicy] = useState(false)
  const [userData, setUserData] = useState({});
  const [activeTab, setActiveTab] = useState("self");
  ;
  const [billingSame, setBillingSame] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [addAddressModal, setAddAddressModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    nameOnCard: "",
    cardNumber: "",
    expiry: "",
    cvc: ""
  });
  const [aboutAppoiment, setAboutAppoiment] = useState('');

  const [products, setProducts] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [defaultAdd, setDefaultAdd] = useState({});
  const [employeeReview, setEmployeeReview] = useState();
  const [allAddressInStoreDropdown, setAllAddressInStoreDropdown] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
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
  const [selectedShippingAdd, setSelectedShippingAdd] = useState();
  const [addressValidation, setAddressVailidation] = useState();
  const [toAddress, setToAddress] = useState();
  const [fromAddress, setFromAddress] = useState();
  const [formError, setFormError] = useState("");
  const [billingAddress, setBillingAddress] = useState({
    addressLine1: "",
    addressLine2: "",
    city:"",
    state:"",
    country:"",
    zipcode:""
  });
  const [appointmentData, setAppointment] = useState()
  const [hasMounted, setHasMounted] = useState(false);
  const [userFamliyData, setUserFamliyData] = useState([])
  const [userFamilyType, setUserFamilyType] = useState("Parent"); // default tab
  const [selectedFamily, setSelectedFamily] = useState();
   const [formData, setFormData] = useState(INITIAL_FAMILY_FORM);
  const [errors, setErrors] = useState({});
  const [showCardPayment, setShowCardPayment] = useState(false)

  // Keep userFamilyType in sync with tab button clicks in your markup
  useEffect(() => {
    // nothing else — userFamilyType changes by clicking the tab buttons (they call setUserFamilyType)
  }, [userFamilyType]);


    const clearFamilyForm = React.useCallback(() => {
    setFormData(INITIAL_FAMILY_FORM);
    setErrors({});
    // Optionally return tab to default relation:
    // setUserFamilyType("Parent"); // <-- uncomment if you also want to reset the selected relation tab
  }, []);
const handleChange = (e) => {
  const { name } = e.target;
  let { value } = e.target;

  if (name === "firstName" || name === "lastName") {
    value = value.replace(/[^A-Za-z\s'-]/g, ""); // keep only allowed chars
    value = value.replace(/\s{2,}/g, " ");       // collapse multiple spaces
    value = value.slice(0, NAME_MAX);            // clamp
  }

  setFormData((prev) => ({ ...prev, [name]: value }));
  setErrors((prev) => ({ ...prev, [name]: undefined }));
};

  // Which fields are required per relation/tab
 const requiredFieldsByType = {
  Parent: ["firstName", "lastName", "gender", "phone", "email"],
  Spouse: ["firstName", "lastName", "gender", "phone", "email"],
  Child: ["firstName", "lastName", "gender", "birthMonth", "birthDay", "birthYear"],
  Sibling: ["firstName", "lastName", "gender", "phone", "email"],
  Pet: ["firstName", "lastName", "gender", "phone", "email", "species", "weight"],
  Friend: ["firstName", "lastName", "gender", "phone", "email"],
};


const validate = () => {
  const errs = {};
  const required = requiredFieldsByType[userFamilyType] || [];

  required.forEach((field) => {
    const val = formData[field];
    if (val === undefined || val === null || String(val).trim() === "") {
      errs[field] = "This field is required";
    }
  });

  // Names: length & allowed characters
  const fn = String(formData.firstName ?? "").trim();
  const ln = String(formData.lastName ?? "").trim();

  if (required.includes("firstName") || fn) {
    if (fn.length < NAME_MIN || fn.length > NAME_MAX) {
      errs.firstName = `First name must be ${NAME_MIN}-${NAME_MAX} letters`;
    } else if (!NAME_REGEX.test(fn)) {
      errs.firstName = "Only letters, spaces, apostrophes (') and hyphens (-)";
    }
  }

  if (required.includes("lastName") || ln) {
    if (ln.length < NAME_MIN || ln.length > NAME_MAX) {
      errs.lastName = `Last name must be ${NAME_MIN}-${NAME_MAX} letters`;
    } else if (!NAME_REGEX.test(ln)) {
      errs.lastName = "Only letters, spaces, apostrophes (') and hyphens (-)";
    }
  }

  // Email
  const email = String(formData.email ?? "");
  if ((required.includes("email") || email) && email) {
    const re = /^\S+@\S+\.\S+$/;
    if (!re.test(email)) errs.email = "Enter a valid email";
  }

  // Phone
  const phoneRaw = String(formData.phone ?? "");
  if ((required.includes("phone") || phoneRaw) && phoneRaw) {
    const digits = phoneRaw.replace(/\D/g, "");
    if (digits.length < 6 || digits.length > 15) {
      errs.phone = "Enter a valid phone number";
    }
  }

  // Weight
  const weightRaw = String(formData.weight ?? "");
  if ((required.includes("weight") || weightRaw) && weightRaw) {
    if (isNaN(Number(weightRaw))) errs.weight = "Weight must be a number";
  }

  // Child date
  if (userFamilyType === "Child") {
    const m = Number(formData.birthMonth);
    const d = Number(formData.birthDay);
    const y = Number(formData.birthYear);
    if (formData.birthMonth && (!Number.isFinite(m) || m < 1 || m > 12)) errs.birthMonth = "Invalid month";
    if (formData.birthDay && (!Number.isFinite(d) || d < 1 || d > 31)) errs.birthDay = "Invalid day";
    if (formData.birthYear && (!Number.isFinite(y) || y < 1900)) errs.birthYear = "Invalid year";
  }

  setErrors(errs);
  return Object.keys(errs).length === 0;
};


  /**
   * handleSave called by Save button in your JSX.
   * We stop Bootstrap's propagation if validation fails to prevent the next modal opening.
   */

function openEditFamily(member) {
  setIsEditing(true);
  setSelectedFamily(member);
  setUserFamilyType(member.relation || "Parent");
  setFormData({
    email: String(member.email ?? ""),
    phone: String(member.phone ?? ""),
    firstName: String(member.firstName ?? ""),
    lastName: String(member.lastName ?? ""),
    gender: String(member.gender ?? ""),
    birthMonth: member.birthDate ? String(new Date(member.birthDate).getMonth() + 1) : "",
    birthDay:   member.birthDate ? String(new Date(member.birthDate).getDate()) : "",
    birthYear:  member.birthDate ? String(new Date(member.birthDate).getFullYear()) : "",
    species: String(member.species ?? ""),
    weight: String(member.weight ?? ""),
  });
  setErrors({});
  setActiveTab("newUserFamily");
}

function confirmDeleteFamily(member) {
  Swal.fire({
    title: `Delete ${member.firstName} ${member.lastName}?`,
    text: "This action cannot be undone.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, delete",
  }).then(async (res) => {
    if (res.isConfirmed) {
      await deleteFamily(member._id);
      if (selectedFamily?._id === member._id) setSelectedFamily(undefined);

      Swal.fire("Deleted!", "Family member removed.", "success");
    }
  });
}

async function deleteFamily(id) {
  try {
    // NOTE: replace with your actual endpoint key if different
    await postApi(config.deleteUserFamily, { id });
    await switchToSelfPickup(); // refresh the list
    // keep user on the same modal
  } catch (err) {
    console.error("Delete family failed:", err);
    Swal.fire("Error", err?.response?.data?.message || "Delete failed", "error");
  }
}


const handleSave = async (e) => {
  const valid = validate();
  if (!valid) {
    if (e && (e).stopImmediatePropagation) (e).stopImmediatePropagation();
    return;
  }

  const isChild = userFamilyType === "Child";
  const birthDate = isChild
    ? `${formData.birthYear || ""}-${String(formData.birthMonth || "").padStart(2, "0")}-${String(formData.birthDay || "").padStart(2, "0")}`
    : undefined;

  // ⚠️ IMPORTANT: use `id` for update (backend requires it)
  const payload = {
    relation: userFamilyType,
    email: formData.email,
    phone: formData.phone,
    firstName: formData.firstName,
    lastName: formData.lastName,
    gender: formData.gender,
    birthDate,
    species: formData.species,
    weight: formData.weight,
    userId: userData._id,
    ...(isEditing && selectedFamily?._id ? { id: String(selectedFamily._id) } : {}), // <-- key fix
  };

  try {
    const endpoint = isEditing ? config.updateUserFamily : config.addNewUserFamliy;
    const res = await postApi(endpoint, payload);
    if (res && (res.statusCode === 200 || res.statusCode === 201)) {
      clearFamilyForm();
      setIsEditing(false);
      await switchToSelfPickup();
      setActiveTab("other");
    }
  } catch (err) {
    console.error("Save error:", err);
    alert("Save failed. See console for details.");
  }
};
// 2) EFFECT — fetch once on mount
useEffect(() => {
  const fetchPolicy = async () => {
    try {
      setPolicyLoading(true);
      const res = await postApi(config.category, {
        dropdown_type: "cancelation_policy",
        page: 1,
        pageSize: 1,
      });
      const html = res?.result?.[0]?.description || "";
      setPolicyHtml(html);
    } catch (e) {
      setPolicyError("Failed to load cancellation policy.");
      setPolicyHtml("");
    } finally {
      setPolicyLoading(false);
    }
  };
  fetchPolicy();
}, []);


  useEffect(() => {
    setHasMounted(true);
    window.scrollTo(0, 0);
  }, []);


  const router = useRouter();

  const searchParams = useSearchParams();

  useEffect(() => {
    findAppointment()
    findReviews()
    const products = searchParams.get("selectedProducts");
    if (products) {
      try {
        setSelectedProducts(JSON.parse(products));
        setProducts(JSON.parse(products));
        // localStorage.setItem("selectedProducts", products);
      } catch (error) {
        console.error("Error parsing selected products:", error);
      }
    } else {
      const savedProducts = localStorage.getItem("selectedProducts");
      if (savedProducts) {
        setSelectedProducts(JSON.parse(savedProducts));
      }
    }
  }, [searchParams]);
  console.log(id, "iddd")
  async function findAppointment() {

    try {
      const endpoint = config.findAppointment;
      const data = {
        _id: id
      };
      const response = await postApi(endpoint, data);

      if (response.statusCode == 200 || response.statusCode == 201) {
        console.log(response, "response.data")
        setAppointment(response.data);
        findReviews(response.data[0].employeeId)
        setShowCardPayment(response?.isAcceptCard || false)
      }
    } catch (error) {
      console.error("Error fetching categorylist:", error);
    }

  }
  const findReviews = async (employee_id) => {
    try {
      const endpoint = config.GetEmployeeReviewByEmployee
      const data = {
        employee_id: employee_id
      };
      const response = await postApi(endpoint, data);

      if (response.statusCode == 200 || response.statusCode == 201) {
        console.log(response, "reviewsssssssss")
        setEmployeeReview(response.data[0]);
      }
    } catch (error) {
      console.error("Error fetching categorylist:", error);
    }
  }
  async function getCart(id, user) {
    try {
      const endpoint = config.getCart;
      const data = {
        page: 1,
        user: user._id,
        pageSize: 10,
        product: id,
        selected: 1,
      };
      const response = await postApi(endpoint, data);

      if (response.statusCode == 200 || response.statusCode == 201) {
        setProducts(response.data);
      }
    } catch (error) {
      console.error("Error fetching categorylist:", error);
    }
  }
  async function getAddress(user) {
    try {
      const endpoint = config.getAddress;
      const data = { user: user._id };
      console.log("nainji", data);
      const response = await postApi(endpoint, data);
      if (response.statusCode == 200 || response.statusCode == 201) {
        setAddresses(response.data.data);
        if (response.data.data.filter((ele) => ele.primary)[0]) {
          setDefaultAdd(response.data.data.filter((ele) => ele.primary)[0]);
          setToAddress(response.data.data.filter((ele) => ele.primary)[0]._id);
        } else {
          setDefaultAdd(response.data.data[0]);
          setToAddress(response.data.data[0]?._id);
        }
      }
    } catch (error) {
      console.error("Error fetching categorylist:", error);
    }
  }


  useEffect(() => {
    let user = JSON.parse(localStorage.getItem("user") || JSON.stringify({}));
    setUserData(user);

    if (id == "cart") {
      getCart(null, user);
    } else {
      getCart(id, user);
    }

    getAddress(user);
    getInStoreAddress();
  }, []);

  const getInStoreAddress = async () => {
    try {
      const endpoint = config.centers;
      const response = await postApi(endpoint);
      if (response.statusCode == 200 || response.statusCode == 201) {
        console.log(response?.centers, "centers instore dropdown address");
        setFromAddress(response?.centers[0]._id);
        setAllAddressInStoreDropdown(response?.centers);
      }
    } catch (error) {
      console.error("Error fetching categorylist:", error);
    }
  };

  async function switchToSelfPickup() {
    setActiveTab("other");
    setBillingSame(false);
    try {
      const endpoint = config.findUserFamily;
      const data = { userId: userData._id };
      const response = await postApi(endpoint, data);
      console.log(response, "response")
      if (response.statusCode == 200 || response.statusCode == 201) {
        setActiveTab("other");
        // let sub = products.reduce((p, q) => {
        //   return p + q.quantity * q.productDetails.price;
        // }, 0);
        // let dis = 0;
        // if (response.coupon?.discountType == "percentage") {
        //   dis = (response.coupon?.discountValue / 100) * sub;
        // } else {
        //   dis = response.coupon?.discountValue;
        // }

        // setDiscount(
        //   response.coupon?.maxDiscount && dis > response.coupon?.maxDiscount
        //     ? response.coupon?.maxDiscount
        //     : dis
        // );
        setUserFamliyData(response?.data?.userFamilyData)
      } else {
        alert(response.message);
      }
    } catch (error) {
      console.error("Error fetching categorylist:", error);
    }
  }

  

  const checkAddress = async () => {
    try {
      // e.preventDefault();
      console.log(newAddress, "eeeeeeee");
      let setAddress = `${newAddress?.flatNo},${newAddress?.area},${newAddress.city},${newAddress.state},${newAddress.pincode}`;
      console.log(setAddress, "settttttttttttttttt");
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      const location = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=%7B${setAddress}%7D&key=${apiKey}`
      );
      console.log(location, "lllllllllllllllllllllllll");
      if (location.data.status == "OK") {
        console.log(location, "aaaa");
        // finalAddress()
        return location.data.results[0];
      } else {
        return false;
      }
    } catch (err) {
      console.error("Error fetching calculateShippingCost:", err);
    }
  };
  const finalAddress = async (e) => {
    try {
      let { name, value } = e.target;
      console.log(name, value, "name,value");
      setNewAddress({ ...newAddress, [name]: value });
      console.log(newAddress, "newAddressnewAddress");
    } catch (err) {
      console.error("Error fetching add Address:", err);
    }
  };

  const addAddress = async () => {
    try {
      const blankKeys = Object.keys(newAddress).filter(
        (key) =>
          newAddress[key] === "" ||
          newAddress[key] === null ||
          newAddress[key] === undefined
      );
      let addre = await checkAddress();
      console.log(blankKeys, "blankKeys");
      if (blankKeys.length !== 0) {
        setAddressVailidation(`Please enter your ${blankKeys.join(", ")}`);
      } else if (addre == false) {
        setAddressVailidation(`Please enter valid address`);
      } else {
        setAddressVailidation();
        let stateCode = "";
        let countryCode = "";
        console.log(addre, "addre");
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
        // console.log(JSON.stringify(arr1) === JSON.stringify(arr2));
        const endpoint = config.addAddress;
        let data = {
          ...newAddress,
          user_id: JSON.parse(localStorage.getItem("user"))._id,
          stateCode: stateCode,
          countryCode: countryCode,
        };

        const response = await postApi(endpoint, data);

        if (response.statusCode == 200 || response.statusCode == 201) {
          setAddAddressModal(false);
          getAddress(userData);
        } else {
          console.log(response, "responseresponse");
          setAddressVailidation(response.error);
        }
      }
    } catch (err) {
      console.error("Error fetching calculateShippingCost:", err);
    }
  };


  const getInitials = (name = "") => {
    const words = name.trim().split(" ");
    if (words.length === 1) return words[0][0]?.toUpperCase() || "";
    return (words[0][0] + words[1][0]).toUpperCase();
  };
  const createPayment = async () => {
    if (billingAddress.addressLine1 == '') {
      setFormError("Billing address 1 is required.");
      return;
    }
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
    // if (billingAddress.addressLine2 == '') {
    //   setFormError("Billing address 2 is required.");
    //   return;
    // }
    
    let data = {
      ...newAddress,
      id: id,
      price: appointmentData?.reduce((sum, p) => sum + p.price, 0) || 0,
      familyMemberId: selectedFamily,
      aboutAppoiment: aboutAppoiment,
      billingAddress1: billingAddress.addressLine1,
      billingAddress2: billingAddress?.addressLine2,
      billingCity: billingAddress?.city,
      billingState: billingAddress?.state,
      billingCountry: billingAddress?.country,
      billingZipcode: billingAddress?.zipcode
    };
    if (showCardPayment) {
      const paymentIntent = await handleCardSetup()

      if (!paymentIntent) {
        return
      }
      data.paymentIntent = paymentIntent
    } else {
      if (!acceptPolicy) {
        setFormError("Please accept cancellation Policy.");
        return;
      }
    }
    setFormError('')
    const endpoint = config.appointmentPayment;


    if (activeTab === "otherSelected" && selectedFamily) {
      data.familyMemberId = selectedFamily._id
    }
    setLoading(true)
    const response = await postApi(endpoint, data);
    setLoading(false)
    if (response.statusCode == 200 || response.statusCode == 201) {
      // if (!showCardPayment) {
      router.push(response.paymentUrl)
      // } else {
      //   window.open(response.paymentUrl);
      // }
    }else{
      setFormError(response.message);
        return;
    }
  }

  const onRelationChange = (type) => {
  setUserFamilyType(type);
  setErrors({});
  // Optional: clear fields that are not relevant, prevents “carryover”
  setFormData((prev) => ({
    ...prev,
    birthMonth: type === "Child" ? prev.birthMonth : "",
    birthDay: type === "Child" ? prev.birthDay : "",
    birthYear: type === "Child" ? prev.birthYear : "",
    species: type === "Pet" ? prev.species : "",
    weight: type === "Pet" ? prev.weight : "",
  }));
};


  const handleCardSetup = async () => {
    setFormError("");
    const stripe = await stripePromise;

    if (!stripe || !cardRef.current) {
      setFormError("Stripe not ready yet");
      return;
    }

    const elements = stripe.elements();
    const cardElement = cardRef.current.getCardNumberElement();
    if (!cardDetails.nameOnCard) {
      setFormError("Name on card is required.");
      return;
    }
    if (!acceptPolicy) {
      setFormError("Please accept cancellation Policy.");
      return;
    }

    try {
      // Call backend to create PaymentIntent or SetupIntent
      const response = await postApi(config.sendKey, {
        _id: appointmentData[0].userId
      });
      const data = response.data;

      if (!data.client_secret) {
        setFormError(data.message || "Payment setup failed");
        return;
      }

      const result = await stripe.confirmCardSetup(data.client_secret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: cardDetails.nameOnCard,
            address: {
              line1: billingAddress.addressLine1,
              line2: billingAddress.addressLine2,
            },
          },
        },
      });

      if (result.error) {
        setFormError(result.error.message);
      } else {
        console.log("Card setup successful:", result.setupIntent.payment_method);
        return result.setupIntent.payment_method
      }
    } catch (err) {
      console.error(err);
      setFormError("Something went wrong with card setup.");
    }
  };
const openAddFamilyModal = () => {
  setIsEditing(false);
  setSelectedFamily(undefined);
  setUserFamilyType("Parent");
  setFormData(INITIAL_FAMILY_FORM);
  setErrors({});
  setActiveTab("newUserFamily");
};

const closeAddFamilyModal = React.useCallback(() => {
  setFormData(INITIAL_FAMILY_FORM);
  setErrors({});
  setUserFamilyType("Parent");
  setIsEditing(false);        // reset edit mode
  setActiveTab("other");
  document.body.classList.remove("modal-open");
  document.body.style.removeProperty("overflow");
}, []);


useEffect(() => {
  if (activeTab !== 'newUserFamily') return;
  const onEsc = (e) => { if (e.key === 'Escape') closeAddFamilyModal(); };
  window.addEventListener('keydown', onEsc);
  return () => window.removeEventListener('keydown', onEsc);
}, [activeTab, closeAddFamilyModal]);

  return (
    <>
      {loading && <Loader />}
      <HeaderWithDropdown />
      {/* <SubHeader topPosition={80} /> */}
      <div className="cartMain">
        <div className="container-fluid">
          <div className="breadcrumbGroup">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <Link href={"/Appointment/components/BookAppointment"} style={{ textDecoration: "none" }}>
                  Services
                </Link>
              </li>
              <li className="breadcrumb-item">
                <Link href={"/Appointment/components/BookAppointment"} style={{ textDecoration: "none" }}>
                  Book Appointment
                </Link>
              </li>

              <li className="breadcrumb-item active">Payment</li>
            </ol>
          </div>
          <div className="row">
            {/* Left Column */}
            <div className="col-lg-12 col-xl-7 mb-3">
              <div className="informationLeft">
                <h6 className="fw-semibold mb-3">Vedic Yours Ayurveda</h6>
                <hr className="mb-3" />


                {/* Shipping/Pickup Tabs */}
                <div className="mb-3">
                  <label className="mb-3 fw-medium fs-7">Who Are You Booking For?</label>
                  <ul className="nav cstmTbs mb-4">
                    <li className="nav-item">
                      <button
                        className={`nav-link ${activeTab === "self" && "active" //!selectedFamily ? "active" : ""
                          }`}
                        onClick={() => setActiveTab("self")}
                      >
                        {userData.name} (ME)
                      </button>
                    </li>
                    <li className="nav-item">
                      <button
                        className={`nav-link ${(activeTab === "other" || activeTab === "otherSelected") && "active"// selectedFamily ? "active" : ""
                          }`}
                        data-bs-toggle="tab" data-bs-target="#addresstab"
                        onClick={() => switchToSelfPickup()}
                      >
                        Other Person {selectedFamily?.firstName ? `(${selectedFamily.firstName})` : ""}
                      </button>
                    </li>
                  </ul>
                </div>

                {/* Store Pickup */}
                {/* {activeTab === "pickup" && ( */}
                <div className="inputMain mt-md-3 mt-xl-0 mb-3">
                  <h6 className="fw-semibold mb-3">About Your Appointment</h6>
                  <textarea type="text" className="form-control fs-8" rows="4" onChange={(e) => setAboutAppoiment(e.target.value)}
                    placeholder="Do you have any special request or ideas to share with service provider? (Optional)"></textarea>
                </div>
                {showCardPayment && <>
                  <div className="inputMain mt-md-3 mt-xl-0 mb-3">
                    <h6 className="fw-semibold mb-2">Payment Information</h6>
                    <p className="fs-8 text-orange fst-italic">A card is required to hold your appointment slot. You will not be charged.</p>
                  </div>
                  <Elements stripe={stripePromise}>
                    <StripePaymentForm
                      cardDetails={cardDetails}
                      setCardDetails={setCardDetails}
                      billingAddress={billingAddress}
                      setBillingAddress={setBillingAddress}
                      formError={formError}
                      setFormError={setFormError}
                      appointmentData={appointmentData}
                      acceptPolicy={acceptPolicy}
                      setAcceptPolicy={setAcceptPolicy}
                      handleCardSetup={handleCardSetup}
                      ref={cardRef}
                    />
                  </Elements>
                  {/* <Elements stripe={stripePromise}>
                    <CardPage
                      cardDetails={cardDetails}
                      setCardDetails={setCardDetails}
                      billingAddress={billingAddress}
                      setBillingAddress={setBillingAddress}
                      formError={formError}
                      setFormError={setFormError}
                      appointmentData={appointmentData}
                      handleCardSetup={handleCardSetup}
                      ref={cardRef}

                    />
                  </Elements> */}
                </>}
                {/* <CardPage /> */}
                {/* <Elements stripe={stripePromise}> */}
                {/* <div className="creditMain mb-4">
                  <div className="d-sm-flex justify-content-between align-items-end">
                    <h6 className="fs-7 mb-md-3 mb-sm-2">Credit Card</h6>
                    <b>Enter your name as it’s written on your card.</b>
                  </div> */}
                {/* <div className="inputMain mt-md-3 mt-xl-0 mb-3"> */}
                {/* <input type="text" className="form-control" placeholder="Name On Card" name='nameOnCard' onChange={(e) => { setCardDetails({ ...cardDetails, [e.target.name]: e.target.value }) }} /> */}
                {/* <CardNumberElement options={{ style: { base: { fontSize: "16px" } } }} />
                  </div>
                  <div className="inputMain inputImg mt-md-3 mt-xl-0 mb-3">
                    <input type="number" className="form-control" placeholder="1234 1234 1234 1234" name='cardNumber' onChange={(e) => { setCardDetails({ ...cardDetails, [e.target.name]: e.target.value }) }} />
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="inputMain mt-md-3 mt-xl-0 mb-xl-0 mb-3">
                        <CardExpiryElement options={{ style: { base: { fontSize: "16px" } } }} /> */}
                {/* <input type="text" className="form-control" placeholder="Expiry (MM/YY)" name='expiry' onChange={(e) => { setCardDetails({ ...cardDetails, [e.target.name]: e.target.value }) }} /> */}
                {/* </div>
                    </div>
                    <div className="col-md-6">
                      <div className="inputMain mt-md-3 mt-xl-0 mb-xl-0">
                                  <CardCvcElement options={{ style: { base: { fontSize: "16px" } } }} /> */}
                {/* <input type="text" className="form-control" placeholder="Security Code" name='cvc' onChange={(e) => { setCardDetails({ ...cardDetails, [e.target.name]: e.target.value }) }} /> */}
                {/* </div> */}
                {/* </div> */}
                {/* </div> */}

                {/* </div> */}
                {/* </Elements> */}
                {/* )} */}
                {/* Billing Address */}
                <div className="billingAdd">
                  <h6 className="mb-4">Billing Address</h6>

                  <div class="inputMain input-group d-flex mb-3">
                    <button class="btn btnDrop" type="button" data-bs-toggle="dropdown"><img
                      src="/images/landingpage/flag-icon.svg" alt="" width="20" /></button>
                    {/* <ul class="dropdown-menu"> */}
                    {/* <li><a class="dropdown-item" href="#">
                        <img src="/images/landingpage/flag-icon.svg" alt="" width="20" />
                      </a></li> */}
                    {/* </ul> */}
                    <input type="text" class="form-control" placeholder="Address Line 1"
                      value={billingAddress.addressLine1}
                      onChange={(e) =>
                        setBillingAddress({
                          ...billingAddress,
                          addressLine1: e.target.value,
                        })
                      } />
                  </div>

                  <div className="inputMain mt-xl-0 mb-xl-0 mb-3">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Address Line 2 (Optional)"
                      value={billingAddress.addressLine2}
                      onChange={(e) =>
                        setBillingAddress({
                          ...billingAddress,
                          addressLine2: e.target.value,
                        })
                      }
                    />

                  </div>
                  <div className="inputMain xl-0 mb-xl-0 mt-3 mb-3">
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
                 {/* 3) UI — replace the static label block under “Cancellation Policy” */}
<div className="inputMain mt-xl-0 mb-xl-0">
  <h6 className="fw-semibold mb-2 mt-3">Cancellation Policy</h6>

  {policyLoading && (
    <p className="fs-8 text-muted mb-2">Loading policy…</p>
  )}

  {policyError && (
    <p className="fs-8 text-danger mb-2">{policyError}</p>
  )}

  {!!policyHtml ? (
    <div
      className="fs-8"
      // WHY: backend provides rich text; ensure it’s sanitized server-side
      dangerouslySetInnerHTML={{ __html: policyHtml }}
    />
  ) : !policyLoading && !policyError ? (
    <p className="fs-8 text-muted mb-2">No policy available.</p>
  ) : null}
</div>


                  <div className="cstmCheckbox mb-2">

                    <input type="checkbox" onClick={() => setAcceptPolicy(!acceptPolicy)} id="termCheck3" />
                    <label htmlFor="termCheck3" className="fw-medium my-4">
                      By Clicking (Book) you agree to the Cancellation Policy and conditions of this business.
                      {/* <Link href="">refund policy</Link> */}
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
                  <div className="ftrBtn mb-3">
                    <button type="button" className="btn btn-secondary w-25" onClick={() => router.back()}>Back</button>
                    <button type="button" className="btn btn-success w-25" onClick={() => createPayment()}>Book Now</button>
                  </div>
                  {/* <div className="text-center mb-3"> */}

                  {/* <button
                      type="button"
                      className="btn btn-gray m-2"
                      onClick={() => byNow()}
                      disabled={activeTab == 'pickup' ? !pickupDate : !showShippingCost}
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      className="btn btn-success"
                      onClick={() => byNow()}
                    // disabled={activeTab == 'pickup' ? !pickupDate : !showShippingCost}
                    >
                      Buy Now
                    </button> */}
                  {/* </div> */}
                </div>
              </div>
            </div>

            <div className="col-lg-12 col-xl-4 mb-3">
              <div className="rightSec">
                <strong className="schWatch">{appointmentData && DateTime.fromISO(appointmentData[0]?.date, { zone: "utc" }).toFormat("ccc, MMM dd, yyyy")} <b><img src="images/watch-icon.svg" alt=""
                  width="14" />{appointmentData && moment(appointmentData[0]?.time, "HH:mm").format("hh:mm A")}</b></strong>
                {appointmentData && appointmentData.map((appointment,index) => (
                  <div key={index} className="textprfile">
                    <figure className="m-0">
                      {/* <img src="images/meena-sankar.jpg" alt="" /> */}
                      {/* {getInitials(userData?.name || "U")} */}
                      {/* <div
                        className="d-flex justify-content-center align-items-center rounded-circle"
                        style={{
                          width: "50px",
                          height: "50px",
                          backgroundColor: "#E0E0E0",
                          fontSize: "18px",
                          fontWeight: "bold",
                          color: "#662A09",
                        }}
                      >
                        {getInitials(appointment?.employee.userDetails.name)}
                      </div> */}
                      <img src={`${process.env.NEXT_PUBLIC_API_URL}/${appointment?.employee?.userDetails?.file}`} alt="" />
                    </figure>
                    <div className="">
                      <span>{appointment?.employee.userDetails.name}</span>
                      <ul className="d-flex align-items-end gap-1 m-0">
                        {console.log(employeeReview)}
                        {Array.from({ length: employeeReview?.overall_review || 1 }, (_, index) => (
                          <StarFill
                            key={index}
                            size={15}
                            color='gold'
                            value={employeeReview?.reviews?.average?.overall_review}
                            // color={index < reviewForm.rating ? 'gold' : 'lightgray'}
                            // onClick={() => handleRatingClick(index + 1)}
                            style={{ cursor: 'pointer' }}
                          />
                        ))}
                        <li>
                          <p className="fs-9 m-0 fw-semibold"> ({appointment?.reviews?.data?.length || 0})</p>
                        </li>
                      </ul>
                      <b>${appointment?.price || 0}</b>
                    </div>
                    <hr />
                  </div>
                ))}

                <hr />
                <div className="d-flex justify-content-between mt-2">
                  <h6 className="m-0 fw-bold"> Total </h6>
                  <span className="fw-bold">${appointmentData?.reduce((sum, p) => sum + p.price, 0) || 0}</span>
                </div>
                <hr />
                <div className="d-flex justify-content-between mt-2 mb-4">
                  <h6 className="m-0 d-flex align-items-center flex-wrap gap-2"> Total Due Now <b
                    className="holdCard">Hold with card</b></h6>
                  <span>$0.00</span>
                </div>
                <div className="d-flex justify-content-between mt-2">
                  <h6 className="m-0"> Total Due at Business</h6>
                  <span>${appointmentData?.reduce((sum, p) => sum + p.price, 0) || 0}</span>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* Optional Modal */}
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
                    >
                      Add Address
                    </button>
                  </div>
                  <div className="row">
                    {addresses &&
                      addresses.map((add) => {
                        return (
                          <div className="col-md-6 mb-3" key={"lk"}>
                            <div className="addressDivBox">
                              <div
                                className="cstmRadio "
                                onClick={() => setDefaultAdd(add)}
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
                                <b>({add?.mobile})</b>
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
                                <div className="d-flex gap-2">
                                  <button
                                    type="button"
                                    className="bg-transparent border-0 p-0"
                                  >
                                    <img
                                      src="/images/landingpage/edit-icon.svg"
                                      alt=""
                                      width="16"
                                    />
                                  </button>
                                  <button
                                    type="button"
                                    className="bg-transparent border-0 p-0"
                                  >
                                    <img
                                      src="/images/landingpage/delete-icon.svg"
                                      alt=""
                                      width="11"
                                    />
                                  </button>
                                </div>
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
                    className=" "
                    onClick={() => setModalOpen(false)}
                    style={{ backgroundColor: '#F8F8F' }}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => setModalOpen(false)}
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <DynamicModal3
          show={showModal}
          onClose={() => setShowModal(false)}
          title="hello ji "
          heading="Congratulations!!"
          description="Your account has been successfully created."
          buttonText="Continue"
          onButtonClick={() => setShowModal(false)}
        />

        {addAddressModal && (
          <div
            className="modal fade show d-block orderDetailModal"
            style={{ background: "rgba(0,0,0,0.5)" }}
          >
            <div className="modal-dialog">
              <div className="modal-content border-0">
                <div className="modal-header border-0">
                  <h1 className="modal-title fs-6">Add Address</h1>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setAddAddressModal(false)}
                  ></button>
                </div>

                <div className="modal-body">
                  <form className="commentForm">
                    <div className="row">
                      {/* <div className="row">
                        <div className="col-md-6 mb-3">
                          <div className="form-group">
                            <label>Full Address</label>
                            <input type="text" className="form-control w-100" onChange={(e)=>setAddress(e.target.value)}>
                            </input>
                          </div>
                        </div>
                        <div className="col-md-6 mb-3">
                          <div className="form-group">
                            <label>{" "}</label><br />
                            <button type="button"
                              className="btn btn-primary" onClick={checkAddress}>Search</button>
                          </div>
                        </div>
                        <h6 className="text-danger">Please check your address</h6>
                      </div> */}
                      <div className="col-md-6 mb-3">
                        <div className="form-group">
                          <label>Full Name</label>
                          <input
                            type="text"
                            name="name"
                            className="form-control w-100"
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
                            onChange={(e) => finalAddress(e)}
                          />
                        </div>
                      </div>
                      <div className="col-md-6 mb-3">
                        <div className="form-group">
                          <label>Flat, House no., Building</label>
                          <input
                            type="text"
                            name="flatNo"
                            className="form-control w-100"
                            onChange={(e) => finalAddress(e)}
                          />
                        </div>
                      </div>
                      <div className="col-md-6 mb-3">
                        <div className="form-group">
                          <label>Area, Street, Sector</label>
                          <input
                            type="text"
                            name="area"
                            className="form-control w-100"
                            onChange={(e) => finalAddress(e)}
                          />
                        </div>
                      </div>
                      <div className="col-md-6 mb-3">
                        <div className="form-group">
                          <label>state</label>
                          <input
                            type="text"
                            name="state"
                            className="form-control w-100"
                            onChange={(e) => finalAddress(e)}
                          />
                        </div>
                      </div>

                      <div className="col-md-6 mb-3">
                        <div className="form-group">
                          <label>Town / City</label>
                          <input
                            type="text"
                            name="city"
                            className="form-control w-100"
                            onChange={(e) => finalAddress(e)}
                          />
                        </div>
                      </div>
                      <div className="col-md-6 mb-3">
                        <div className="form-group">
                          <label>Country / Region</label>
                          <input
                            type="text"
                            name="country"
                            className="form-control w-100"
                            onChange={(e) => finalAddress(e)}
                          />
                        </div>
                      </div>
                      <div className="col-md-6 mb-3">
                        <div className="form-group">
                          <label>Zipcode</label>
                          <input
                            type="text"
                            name="pincode"
                            className="form-control w-100"
                            onChange={(e) => finalAddress(e)}
                          />
                        </div>
                      </div>
                    </div>
                    {addressValidation && (
                      <h6 className="text-danger">{addressValidation}</h6>
                    )}
                    <div className="modal-footer justify-content-center border-0">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setAddAddressModal(false)}
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => addAddress()}
                      >
                        Continue
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* {modal fade orderDetailModal} */}
        {activeTab == 'other' &&
          <div className="modal fade show d-block orderDetailModal" style={{ background: "rgba(0,0,0,0.5)" }} id="bookingFor">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 rounded-0">
                <div className="modal-header border-0">
                  <h1 className="modal-title fs-6">Who Are You Booking For?</h1>
                  <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={() => setActiveTab('self')}></button>
                  {console.log(activeTab, "activeTab")}
                </div>
                <div className="modal-body">
                  <div className="d-sm-flex justify-content-between align-items-center mb-4">
                    <h6 className="mb-lg-0 mb-sm-1 fs-8">Select Person</h6>
                    <button type="button" className="btn btn-primary fs-8" data-bs-target="#addNew"
                      data-bs-toggle="modal" onClick={openAddFamilyModal}>Add New Family or Friend</button>
                  </div>
                  <ul className="personUl">
                   {userFamliyData && userFamliyData.length > 0 ? userFamliyData.map((e, ind) => (
  <li key={ind} onClick={() => { setSelectedFamily(e); }}>
    <input type="radio" className="d-none" id={`name${ind}`} name="selectName" />
    <label htmlFor={`name${ind}`} style={{ width: "100%" }}>
      <figure>{getInitials(e.firstName)}</figure>
      <span style={{ flex: 1 }}>
        {`${e.firstName} ${e?.lastName}`} <b>({e.relation})</b>
      </span>

      {/* Actions */}
      <div>      <span
        role="button"
        aria-label={`Edit ${e.firstName}`}
        onClick={(ev) => { ev.stopPropagation(); openEditFamily(e); }}
        style={{ cursor: "pointer", marginRight: 3, color: "#198754" }}
        title="Edit"
      >
        <PencilSquare size={18} />
      </span>
      <span
        role="button"
        aria-label={`Delete ${e.firstName}`}
        onClick={(ev) => { ev.stopPropagation(); confirmDeleteFamily(e); }}
        style={{ cursor: "pointer", color: "#d33" }}
        title="Delete"
      >
        <Trash size={18} />
      </span>
      </div>
    </label>
  </li>
)) : <h6>No family members found</h6>}
                    {/* <li>
                    <input type="radio" className="d-none" id="name1" name="selectName" checked />
                    <label for="name1">
                      <figure>
                        SJ
                      </figure> <span>Smith Jhons <b>(Me)</b></span>
                    </label>
                  </li>
                  <li>
                    <input type="radio" className="d-none" id="name2" name="selectName" />
                    <label for="name2">
                      <figure> RS </figure><span>Rachel Smith <b>(Spouse)</b></span>
                    </label>
                  </li>
                  <li>
                    <input type="radio" className="d-none" id="name3" name="selectName" />
                    <label for="name3">
                      <figure> JH </figure><span>Jordan Houston <b>(Child)</b></span>
                    </label>
                  </li>
                  <li>
                    <input type="radio" className="d-none" id="name4" name="selectName" />
                    <label for="name4">
                      <figure> AB </figure><span>Alexa Brown <b>(Parent)</b></span>
                    </label>
                  </li>
                  <li>
                    <input type="radio" className="d-none" id="name5" name="selectName" />
                    <label for="name5">
                      <figure> EM </figure><span>Emilia Smith <b>(Sibling)</b></span>
                    </label>
                  </li>
                  <li>
                    <input type="radio" className="d-none" id="name6" name="selectName" />
                    <label for="name6">
                      <figure> CR </figure><span>Case Richardson <b>(Friend)</b></span>
                    </label>
                  </li>
                  <li>
                    <input type="radio" className="d-none" id="name7" name="selectName" />
                    <label for="name7">
                      <figure> L </figure><span>Lillie <b>(Pet)</b></span>
                    </label>
                  </li> */}
                  </ul>
                </div>
                <div className="modal-footer justify-content-center border-0">
                  <button type="button" className="btn btn-secondary" onClick={() => setActiveTab('self')} data-bs-dismiss="modal">Back</button>
                  <button type="button" className="btn btn-primary" onClick={() => setActiveTab(selectedFamily ? 'otherSelected' : 'self')}>Continue</button>
                </div>
              </div>
            </div>
          </div>}
        {activeTab == 'newUserFamily' &&
        <div
    className="modal fade show d-block orderDetailModal"
    style={{ background: "rgba(0,0,0,0.5)" }}
    onClick={(e) => {
      if (e.target.classList.contains("orderDetailModal")) {
        closeAddFamilyModal();
      }
    }}
  >
            <div className="modal-dialog modal-dialog-centered ">
              <div className="modal-content border-0 rounded-0">
                <div className="modal-header border-0">
                  <h1 className="modal-title fs-6">Add New Family or Friend</h1>
                  <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={() => { setActiveTab('self') }}></button>
                </div>
                <div className="modal-body">
                  <h6 className="subheading">
   Relationship to {userData?.name || "You"}
 </h6>
                  <div className="nav addnewTabs nav-tabs mb-4">
                    <button className={`nav-link ${userFamilyType === "Parent" ? "active" : ""}`}  onClick={() => setUserFamilyType('Parent')}  type="button">Parent</button>
                    <button className={`nav-link ${userFamilyType === 'Spouse' ? 'active' : ''}`}  onClick={() => setUserFamilyType('Spouse')}  type="button">Spouse</button>
                    <button className={`nav-link ${userFamilyType === 'Child' ? 'active' : ''}`}  onClick={() => setUserFamilyType('Child')}  type="button">Child</button>
                    <button className={`nav-link ${userFamilyType === 'Sibling' ? 'active' : ''}`}  onClick={() => setUserFamilyType('Sibling')}  type="button">Sibling</button>
                    <button className={`nav-link ${userFamilyType === 'Pet' ? 'active' : ''}`}  onClick={() => setUserFamilyType('Pet')}  type="button">Pet</button>
                    <button className={`nav-link ${userFamilyType === 'Friend' ? 'active' : ''}`}  onClick={() => setUserFamilyType('Friend')}  type="button">Friend</button>
                  </div>
                  <hr />
                  <div className="tab-content ">
                    {/* Parent Tab */}
                  <div className={`tab-pane fade ${userFamilyType === "Parent" ? "show active" : ""}`} id="parentTab">
                      <div className="row formMdl ">
                        <div className="col-md-6 mb-3">
                          <div>
                            <label htmlFor="">Email </label>
                            <input type="email" name="email" className="form-control w-100" placeholder="Enter" value={formData.email} onChange={handleChange} />
                            {errors.email && <div className="text-danger small">{errors.email}</div>}
                          </div>
                        </div>
                        <div className="col-md-6 mb-3">
                          <div>
                            <label htmlFor="">Phone </label>
                            <input type="text" id="mobile_code" name="phone" className="form-control w-100" placeholder="" value={formData.phone} onChange={handleChange} />
                            {errors.phone && <div className="text-danger small">{errors.phone}</div>}
                          </div>
                        </div>
                       <div className="col-md-6 mb-3">
  <div>
    <label htmlFor="">First Name </label>
    <input
      type="text"
      name="firstName"
      className="form-control w-100"
      placeholder="Enter"
      value={formData.firstName}
      onChange={handleChange}
      maxLength={NAME_MAX}             // UI cap
      aria-describedby="firstNameHelp"
    />
    <div className="d-flex justify-content-between">
      {errors.firstName && <div className="text-danger small">{errors.firstName}</div>}
      <small id="firstNameHelp" className="text-muted ms-auto">
        {formData.firstName.length}/{NAME_MAX}
      </small>
    </div>
  </div>
</div>
                       <div className="col-md-6 mb-3">
  <div>
    <label htmlFor="">Last Name </label>
    <input
      type="text"
      name="lastName"
      className="form-control w-100"
      placeholder="Enter"
      value={formData.lastName}
      onChange={handleChange}
      maxLength={NAME_MAX}
      aria-describedby="lastNameHelp"
    />
    <div className="d-flex justify-content-between">
      {errors.lastName && <div className="text-danger small">{errors.lastName}</div>}
      <small id="lastNameHelp" className="text-muted ms-auto">
        {formData.lastName.length}/{NAME_MAX}
      </small>
    </div>
  </div>
</div>
                        <div className="col-md-6 mb-3">
                          <div>
                            <label htmlFor="">Gender </label>
                            <select name="gender" className="form-select" aria-label="Default select example" value={formData.gender} onChange={handleChange}>
                              <option value="">Select</option>
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                              <option value="Other">Other</option>
                            </select>
                            {errors.gender && <div className="text-danger small">{errors.gender}</div>}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Spouse Tab */}
                    <div className={`tab-pane fade ${userFamilyType === "Spouse" ? "show active" : ""}`} id="spouseTab">
                      <div className="row formMdl">
                        <div className="col-md-6 mb-3">
                          <div>
                            <label htmlFor="">Email </label>
                            <input type="email" name="email" className="form-control w-100" placeholder="Enter" value={formData.email} onChange={handleChange} />
                            {errors.email && <div className="text-danger small">{errors.email}</div>}
                          </div>
                        </div>
                        <div className="col-md-6 mb-3">
                          <div>
                            <label htmlFor="">Phone </label>
                            <input type="text" id="mobile_code1" name="phone" className="form-control w-100" placeholder="" value={formData.phone} onChange={handleChange} />
                            {errors.phone && <div className="text-danger small">{errors.phone}</div>}
                          </div>
                        </div>
                        <div className="col-md-6 mb-3">
                          <div>
                            <label htmlFor="">First Name </label>
                            <input type="text" name="firstName" className="form-control w-100" placeholder="Enter" value={formData.firstName} onChange={handleChange} />
                            {errors.firstName && <div className="text-danger small">{errors.firstName}</div>}
                          </div>
                        </div>
                        <div className="col-md-6 mb-3">
                          <div>
                            <label htmlFor="">Last Name </label>
                            <input type="text" name="lastName" className="form-control w-100" placeholder="Enter" value={formData.lastName} onChange={handleChange} />
                            {errors.lastName && <div className="text-danger small">{errors.lastName}</div>}
                          </div>
                        </div>
                        <div className="col-md-6 mb-3">
                          <div>
                            <label htmlFor="">Gender </label>
                            <select name="gender" className="form-select" aria-label="Default select example" value={formData.gender} onChange={handleChange}>
                              <option value="">Select</option>
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                            </select>
                            {errors.gender && <div className="text-danger small">{errors.gender}</div>}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Child Tab */}
                  <div className={`tab-pane fade ${userFamilyType === "Child" ? "show active" : ""}`} id="childTab">
                      <div className="row formMdl">
                        <div className="col-md-6 mb-3">
                          <div>
                            <label htmlFor="">First Name </label>
                            <input type="text" name="firstName" className="form-control w-100" placeholder="Enter" value={formData.firstName} onChange={handleChange} />
                            {errors.firstName && <div className="text-danger small">{errors.firstName}</div>}
                          </div>
                        </div>
                        <div className="col-md-6 mb-3">
                          <div>
                            <label htmlFor="">Last Name </label>
                            <input type="text" name="lastName" className="form-control w-100" placeholder="Enter" value={formData.lastName} onChange={handleChange} />
                            {errors.lastName && <div className="text-danger small">{errors.lastName}</div>}
                          </div>
                        </div>
                        <div className="col-md-6 mb-3">
                          <div>
                            <label htmlFor="">Gender </label>
                            <select name="gender" className="form-select w-100" aria-label="Default select example" value={formData.gender} onChange={handleChange}>
                              <option value="">Select</option>
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                            </select>
                            {errors.gender && <div className="text-danger small">{errors.gender}</div>}
                          </div>
                        </div>
                        <div className="col-md-6 mb-3">
                          <div>
                            <label htmlFor="">Birth Date </label>
                            <div className="d-flex gap-2">
                              <select name="birthMonth" className="form-select w-50" aria-label="Month" value={formData.birthMonth} onChange={handleChange}>
                                <option value="">Month</option>
                                {[...Array(12)].map((_, i) => <option key={i} value={i + 1}>{i + 1}</option>)}
                              </select>
                              <select name="birthDay" className="form-select w-25" aria-label="Day" value={formData.birthDay} onChange={handleChange}>
                                <option value="">Day</option>
                                {[...Array(31)].map((_, i) => <option key={i} value={i + 1}>{i + 1}</option>)}
                              </select>
                              <select name="birthYear" className="form-select w-25" aria-label="Year" value={formData.birthYear} onChange={handleChange}>
                                <option value="">Year</option>
                                {Array.from({ length: 120 }, (_, idx) => new Date().getFullYear() - idx).map(y => <option key={y} value={y}>{y}</option>)}
                              </select>
                            </div>
                            {(errors.birthMonth || errors.birthDay || errors.birthYear) && <div className="text-danger small">{errors.birthMonth || errors.birthDay || errors.birthYear}</div>}
                          </div>
                        </div>
                        <div className="col-md-6 mb-3">
                          <div>
                            <label htmlFor="">Email </label>
                            <input type="email" name="email" className="form-control w-100" placeholder="Enter" value={formData.email} onChange={handleChange} />
                            {errors.email && <div className="text-danger small">{errors.email}</div>}
                          </div>
                        </div>
                        <div className="col-md-6 mb-3">
                          <div>
                            <label htmlFor="">Phone </label>
                            <input type="text" id="mobile_code2" name="phone" className="form-control w-100" placeholder="" value={formData.phone} onChange={handleChange} />
                            {errors.phone && <div className="text-danger small">{errors.phone}</div>}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Sibling Tab */}
                    <div className={`tab-pane fade ${userFamilyType === "Sibling" ? "show active" : ""}`} id="siblingTab">
                      <div className="row formMdl ">
                        <div className="col-md-6 mb-3">
                          <div>
                            <label htmlFor="">Email </label>
                            <input
                              type="email"
                              name="email"
                              className="form-control w-100"
                              placeholder="Enter"
                              value={formData.email}
                              onChange={handleChange}
                            />
                            {errors.email && <div className="text-danger small">{errors.email}</div>}
                          </div>
                        </div>
                        <div className="col-md-6 mb-3">
                          <div>
                            <label htmlFor="">Phone </label>
                            <input
                              type="text"
                              id="mobile_code_sibling"
                              name="phone"
                              className="form-control w-100"
                              placeholder=""
                              value={formData.phone}
                              onChange={handleChange}
                            />
                            {errors.phone && <div className="text-danger small">{errors.phone}</div>}
                          </div>
                        </div>
                        <div className="col-md-6 mb-3">
                          <div>
                            <label htmlFor="">First Name </label>
                            <input
                              type="text"
                              name="firstName"
                              className="form-control w-100"
                              placeholder="Enter"
                              value={formData.firstName}
                              onChange={handleChange}
                              maxLength={NAME_MAX}
                              aria-describedby="firstNameSiblingHelp"
                            />
                            <div className="d-flex justify-content-between">
                              {errors.firstName && <div className="text-danger small">{errors.firstName}</div>}
                              <small id="firstNameSiblingHelp" className="text-muted ms-auto">
                                {formData.firstName.length}/{NAME_MAX}
                              </small>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-6 mb-3">
                          <div>
                            <label htmlFor="">Last Name </label>
                            <input
                              type="text"
                              name="lastName"
                              className="form-control w-100"
                              placeholder="Enter"
                              value={formData.lastName}
                              onChange={handleChange}
                              maxLength={NAME_MAX}
                              aria-describedby="lastNameSiblingHelp"
                            />
                            <div className="d-flex justify-content-between">
                              {errors.lastName && <div className="text-danger small">{errors.lastName}</div>}
                              <small id="lastNameSiblingHelp" className="text-muted ms-auto">
                                {formData.lastName.length}/{NAME_MAX}
                              </small>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-6 mb-3">
                          <div>
                            <label htmlFor="">Gender </label>
                            <select
                              name="gender"
                              className="form-select"
                              aria-label="Default select example"
                              value={formData.gender}
                              onChange={handleChange}
                            >
                              <option value="">Select</option>
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                              <option value="Other">Other</option>
                            </select>
                            {errors.gender && <div className="text-danger small">{errors.gender}</div>}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Pet Tab */}
                   <div className={`tab-pane fade ${userFamilyType === "Pet" ? "show active" : ""}`} id="petTab">
                      <div className="row formMdl">
                        <div className="col-md-6 mb-3">
                          <div>
                            <label htmlFor="">First Name </label>
                            <input type="text" name="firstName" className="form-control w-100" placeholder="Enter" value={formData.firstName} onChange={handleChange} />
                            {errors.firstName && <div className="text-danger small">{errors.firstName}</div>}
                          </div>
                        </div>
                        <div className="col-md-6 mb-3">
                          <div>
                            <label htmlFor="">Last Name </label>
                            <input type="text" name="lastName" className="form-control w-100" placeholder="Enter" value={formData.lastName} onChange={handleChange} />
                            {errors.lastName && <div className="text-danger small">{errors.lastName}</div>}
                          </div>
                        </div>
                        <div className="col-md-6 mb-3">
                          <div>
                            <label htmlFor="">Gender </label>
                            <select name="gender" className="form-select" aria-label="Default select example" value={formData.gender} onChange={handleChange}>
                              <option value="">Select</option>
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                            </select>
                            {errors.gender && <div className="text-danger small">{errors.gender}</div>}
                          </div>
                        </div>
                        <div className="col-md-6 mb-3">
                          <div>
                            <label htmlFor="">Birth Date </label>
                            <div className="d-flex gap-2">
                              <select name="birthMonth" className="form-select w-50" aria-label="Month" value={formData.birthMonth} onChange={handleChange}>
                                <option value="">Month</option>
                                {[...Array(12)].map((_, i) => <option key={i} value={i + 1}>{i + 1}</option>)}
                              </select>
                              <select name="birthDay" className="form-select w-25" aria-label="Day" value={formData.birthDay} onChange={handleChange}>
                                <option value="">Day</option>
                                {[...Array(31)].map((_, i) => <option key={i} value={i + 1}>{i + 1}</option>)}
                              </select>
                              <select name="birthYear" className="form-select w-25" aria-label="Year" value={formData.birthYear} onChange={handleChange}>
                                <option value="">Year</option>
                                {Array.from({ length: 120 }, (_, idx) => new Date().getFullYear() - idx).map(y => <option key={y} value={y}>{y}</option>)}
                              </select>
                            </div>
                          </div>
                        </div>
                         <div className="col-md-6 mb-3">
      <div>
        <label htmlFor="">Email </label>
        <input
          type="email"
          name="email"
          className="form-control w-100"
          placeholder="Enter"
          value={formData.email}
          onChange={handleChange}
        />
        {errors.email && <div className="text-danger small">{errors.email}</div>}
      </div>
    </div>

    {/* NEW: Phone */}
    <div className="col-md-6 mb-3">
      <div>
        <label htmlFor="">Phone </label>
        <input
          type="text"
          id="mobile_code_pet"
          name="phone"
          className="form-control w-100"
          placeholder=""
          value={formData.phone}
          onChange={handleChange}
        />
        {errors.phone && <div className="text-danger small">{errors.phone}</div>}
      </div>
    </div>
                        <div className="col-md-6 mb-3">
                          <div>
                            <label htmlFor="">Species/Breed </label>
                            <input type="text" name="species" className="form-control w-100" placeholder="Select Species/Breed" value={formData.species} onChange={handleChange} />
                            {errors.species && <div className="text-danger small">{errors.species}</div>}
                          </div>
                        </div>
                        <div className="col-md-6 mb-3">
                          <div>
                            <label htmlFor="">Weight </label>
                            <input type="text" name="weight" className="form-control w-100" placeholder="Enter Weight(lbs)" value={formData.weight} onChange={handleChange} />
                            {errors.weight && <div className="text-danger small">{errors.weight}</div>}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Friend Tab */}
                  <div className={`tab-pane fade ${userFamilyType === "Friend" ? "show active" : ""}`} id="friendTab">
                      <div className="row formMdl ">
                        <div className="col-md-6 mb-3">
                          <div>
                            <label htmlFor="">Email </label>
                            <input
                              type="email"
                              name="email"
                              className="form-control w-100"
                              placeholder="Enter"
                              value={formData.email}
                              onChange={handleChange}
                            />
                            {errors.email && <div className="text-danger small">{errors.email}</div>}
                          </div>
                        </div>
                        <div className="col-md-6 mb-3">
                          <div>
                            <label htmlFor="">Phone </label>
                            <input
                              type="text"
                              id="mobile_code_friend"
                              name="phone"
                              className="form-control w-100"
                              placeholder=""
                              value={formData.phone}
                              onChange={handleChange}
                            />
                            {errors.phone && <div className="text-danger small">{errors.phone}</div>}
                          </div>
                        </div>
                        <div className="col-md-6 mb-3">
                          <div>
                            <label htmlFor="">First Name </label>
                            <input
                              type="text"
                              name="firstName"
                              className="form-control w-100"
                              placeholder="Enter"
                              value={formData.firstName}
                              onChange={handleChange}
                              maxLength={NAME_MAX}
                              aria-describedby="firstNameFriendHelp"
                            />
                            <div className="d-flex justify-content-between">
                              {errors.firstName && <div className="text-danger small">{errors.firstName}</div>}
                              <small id="firstNameFriendHelp" className="text-muted ms-auto">
                                {formData.firstName.length}/{NAME_MAX}
                              </small>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-6 mb-3">
                          <div>
                            <label htmlFor="">Last Name </label>
                            <input
                              type="text"
                              name="lastName"
                              className="form-control w-100"
                              placeholder="Enter"
                              value={formData.lastName}
                              onChange={handleChange}
                              maxLength={NAME_MAX}
                              aria-describedby="lastNameFriendHelp"
                            />
                            <div className="d-flex justify-content-between">
                              {errors.lastName && <div className="text-danger small">{errors.lastName}</div>}
                              <small id="lastNameFriendHelp" className="text-muted ms-auto">
                                {formData.lastName.length}/{NAME_MAX}
                              </small>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-6 mb-3">
                          <div>
                            <label htmlFor="">Gender </label>
                            <select
                              name="gender"
                              className="form-select"
                              aria-label="Default select example"
                              value={formData.gender}
                              onChange={handleChange}
                            >
                              <option value="">Select</option>
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                              <option value="Other">Other</option>
                            </select>
                            {errors.gender && <div className="text-danger small">{errors.gender}</div>}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer justify-content-center border-0">
                 <button
    type="button"
    className="btn btn-secondary"
    onClick={closeAddFamilyModal}
  >
    Back
  </button>
                  {/* Save: we intercept click for validation; if invalid we stop Bootstrap from opening next modal */}
               <button
  type="button"
  className="btn btn-primary"
  onClick={handleSave}
>
  {isEditing ? "Update" : "Save"}
</button>
                </div>
              </div>
            </div>
          </div>


          // <div className="modal fade show d-block orderDetailModal" style={{ background: "rgba(0,0,0,0.5)" }} id="addNew">
          //   <div className="modal-dialog modal-dialog-centered ">
          //     <div className="modal-content border-0 rounded-0">
          //       <div className="modal-header border-0">
          //         <h1 className="modal-title fs-6">Add New Family or Friend</h1>
          //         <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={() => { setActiveTab('self') }}></button>
          //       </div>
          //       <div className="modal-body">
          //         <h6 className="subheading">Relationship to John Smith</h6>
          //         <div className="nav addnewTabs nav-tabs mb-4">
          //           <button className="nav-link active" data-bs-toggle="tab" onClick={() => setUserFamilyType('Parent')} data-bs-target="#parentTab"
          //             type="button">Parent</button>
          //           <button className="nav-link" data-bs-toggle="tab" onClick={() => setUserFamilyType('Spouse')} data-bs-target="#spouseTab"
          //             type="button">Spouse</button>
          //           <button className="nav-link" data-bs-toggle="tab" onClick={() => setUserFamilyType('Child')} data-bs-target="#childTab"
          //             type="button">Child</button>
          //           <button className="nav-link" data-bs-toggle="tab" onClick={() => setUserFamilyType('Sibling')} data-bs-target="#siblingTab"
          //             type="button">Sibling</button>
          //           <button className="nav-link" data-bs-toggle="tab" onClick={() => setUserFamilyType('Pet')} data-bs-target="#petTab"
          //             type="button">Pet</button>
          //           <button className="nav-link" data-bs-toggle="tab" onClick={() => setUserFamilyType('Friend')} data-bs-target="#friendTab"
          //             type="button">Friend</button>
          //         </div >
          //         <hr />
          //         <div className="tab-content ">
          //           <div className="tab-pane fade show active" id="parentTab">
          //             <div className="row formMdl ">
          //               <div className="col-md-6 mb-3">
          //                 <div>
          //                   <label for="">Email </label>
          //                   <input type="email" className="form-control w-100" placeholder="Enter" />
          //                 </div>
          //               </div>
          //               <div className="col-md-6 mb-3">
          //                 <div>
          //                   <label for="">Phone </label>
          //                   <input type="text" id="mobile_code" className="form-control w-100" placeholder=""
          //                     name="name" />
          //                 </div>
          //               </div>
          //               <div className="col-md-6 mb-3">
          //                 <div>
          //                   <label for="">First Name </label>
          //                   <input type="name" className="form-control w-100" placeholder="Enter" />
          //                 </div>
          //               </div>
          //               <div className="col-md-6 mb-3">
          //                 <div>
          //                   <label for="">Last Name </label>
          //                   <input type="name" className="form-control w-100" placeholder="Enter" />
          //                 </div>
          //               </div>
          //               <div className="col-md-6 mb-3">
          //                 <div>
          //                   <label for="">Gender </label>
          //                   <select className="form-select" aria-label="Default select example">
          //                     <option selected>Select</option>
          //                     <option >Male</option>
          //                     <option >Female</option>
          //                   </select>
          //                 </div>
          //               </div>
          //             </div>
          //           </div>
          //           <div className="tab-pane fade" id="spouseTab">
          //             <div className="row formMdl">
          //               <div className="col-md-6 mb-3">
          //                 <div>
          //                   <label for="">Email </label>
          //                   <input type="email" className="form-control w-100" placeholder="Enter" />
          //                 </div>
          //               </div>
          //               <div className="col-md-6 mb-3">
          //                 <div>
          //                   <label for="">Phone </label>
          //                   <input type="text" id="mobile_code1" className="form-control w-100" placeholder=""
          //                     name="name" />
          //                 </div>
          //               </div>
          //               <div className="col-md-6 mb-3">
          //                 <div>
          //                   <label for="">First Name </label>
          //                   <input type="text" className="form-control w-100" placeholder="Enter" />
          //                 </div>
          //               </div>
          //               <div className="col-md-6 mb-3">
          //                 <div>
          //                   <label for="">Last Name </label>
          //                   <input type="text" className="form-control" placeholder="Enter" />
          //                 </div>
          //               </div>
          //               <div className="col-md-6 mb-3">
          //                 <div>
          //                   <label for="">Gender </label>
          //                   <select className="form-select" aria-label="Default select example">
          //                     <option selected>Select</option>
          //                   </select>
          //                 </div>
          //               </div>
          //             </div>
          //           </div>
          //           <div className="tab-pane fade" id="childTab">
          //             <div className="row formMdl">
          //               <div className="col-md-6 mb-3">
          //                 <div>
          //                   <label for="">First Name </label>
          //                   <input type="text" className="form-control w-100" placeholder="Enter" />
          //                 </div>
          //               </div>
          //               <div className="col-md-6 mb-3">
          //                 <div>
          //                   <label for="">Last Name </label>
          //                   <input type="text" className="form-control w-100" placeholder="Enter" />
          //                 </div>
          //               </div>
          //               <div className="col-md-6 mb-3">
          //                 <div>
          //                   <label for="">Gender </label>
          //                   <select className="form-select w-100" aria-label="Default select example">
          //                     <option selected>Select</option>
          //                   </select>
          //                 </div>
          //               </div>
          //               <div className="col-md-6 mb-3">
          //                 <div>
          //                   <label for="">Birth Date </label>
          //                   <div className="d-flex gap-2">
          //                     <select className="form-select w-50" aria-label="Default select example">
          //                       <option selected>Month</option>
          //                     </select>
          //                     <select className="form-select w-25" aria-label="Default select example">
          //                       <option selected>Day</option>
          //                     </select>
          //                     <select className="form-select w-25" aria-label="Default select example">
          //                       <option selected>Year</option>
          //                     </select>
          //                   </div>
          //                 </div>
          //               </div>
          //               <div className="col-md-6 mb-3">
          //                 <div>
          //                   <label for="">Email </label>
          //                   <input type="email" className="form-control" placeholder="Enter" />
          //                 </div>
          //               </div>
          //               <div className="col-md-6 mb-3">
          //                 <div>
          //                   <label for="">Phone </label>
          //                   <input type="text" id="mobile_code2" className="form-control w-100" placeholder=""
          //                     name="name" />
          //                 </div>
          //               </div>
          //             </div>
          //           </div>
          //           <div className="tab-pane fade" id="siblingTab">...</div>
          //           <div className="tab-pane fade" id="petTab">
          //             <div className="row formMdl">
          //               <div className="col-md-6 mb-3">
          //                 <div>
          //                   <label for="">First Name </label>
          //                   <input type="text" className="form-control" placeholder="Enter" />
          //                 </div>
          //               </div>
          //               <div className="col-md-6 mb-3">
          //                 <div>
          //                   <label for="">Last Name </label>
          //                   <input type="text" className="form-control" placeholder="Enter" />
          //                 </div>
          //               </div>
          //               <div className="col-md-6 mb-3">
          //                 <div>
          //                   <label for="">Gender </label>
          //                   <select className="form-select" aria-label="Default select example">
          //                     <option selected>Select</option>
          //                   </select>
          //                 </div>
          //               </div>
          //               <div className="col-md-6 mb-3">
          //                 <div>
          //                   <label for="">Birth Date </label>
          //                   <div className="d-flex gap-2">
          //                     <select className="form-select w-50" aria-label="Default select example">
          //                       <option selected>Month</option>
          //                     </select>
          //                     <select className="form-select w-25" aria-label="Default select example">
          //                       <option selected>Day</option>
          //                     </select>
          //                     <select className="form-select w-25" aria-label="Default select example">
          //                       <option selected>Year</option>
          //                     </select>
          //                   </div>
          //                 </div>
          //               </div>
          //               <div className="col-md-6 mb-3">
          //                 <div>
          //                   <label for="">Species/Breed </label>
          //                   <input type="text" className="form-control" placeholder="Select Species/Breed" />
          //                 </div>
          //               </div>
          //               <div className="col-md-6 mb-3">
          //                 <div>
          //                   <label for="">Weight </label>
          //                   <input type="text" className="form-control w-100" placeholder="Enter Weight(lbs)" />
          //                 </div>
          //               </div>
          //             </div>
          //           </div>
          //           <div className="tab-pane fade" id="friendTab">...</div>
          //         </div>

          //       </div>
          //       <div className="modal-footer justify-content-center border-0">
          //         <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Back</button>
          //         <button type="button" className="btn btn-primary" data-bs-target="#healthNotice"
          //           data-bs-toggle="modal">Save</button>
          //       </div>
          //     </div>
          //   </div>
          // </div>
        }
      </div >
      <FooterSection />
    </>
  );
}

const StripePaymentForm = React.forwardRef(function StripePaymentForm(
  {
    cardDetails,
    setCardDetails,
    billingAddress,
    setBillingAddress,
    formError,
    setFormError,
    appointmentData,
    acceptPolicy,
    setAcceptPolicy,
    handleCardSetup,
  },
  ref
) {
  const stripe = useStripe();
  const elements = useElements();

  useImperativeHandle(ref, () => ({
    getCardNumberElement: () => elements.getElement(CardNumberElement),
  }));

  return (
    <div className="creditMain mb-4">
      <h6 className="fs-7 mb-md-3 mb-sm-2">Card Details</h6>
      <b>Enter your name as it’s written on your card.</b>

      <div className="inputMain mt-md-3 mt-xl-0 mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Name On Card"
          value={cardDetails.nameOnCard}
          onChange={(e) =>
            setCardDetails({ ...cardDetails, nameOnCard: e.target.value })
          }
        />
      </div>

      <div className="form-control" style={{ padding: "10px" }}>
        <CardNumberElement
          options={{
            disableLink: true,
            style: {
              base: {
                fontSize: "13px", color: "#637381", fontWeight: 400, '::placeholder': { color: '#cec9d5', },
              }
            },
          }}
        />
      </div>

      <div className="row mt-3">
        <div className="col-md-6 mb-3">
          <CardExpiryElement className="form-control" options={{
            style: { base: { fontSize: "13px", color: "#637381", fontWeight: 400, '::placeholder': { color: '#cec9d5', }, } },
          }} />
        </div>
        <div className="col-md-6">
          <CardCvcElement className="form-control" options={{
            style: { base: { fontSize: "13px", color: "#637381", fontWeight: 400, '::placeholder': { color: '#cec9d5', }, } },
          }} />
        </div>
      </div>
    </div>
  );
});


// const StripePaymentForm=forwardRef(({
//   cardDetails,
//   setCardDetails,
//   billingAddress,
//   setBillingAddress,
//   formError,
//   setFormError,
//   appointmentData,
//   acceptPolicy,
//   setAcceptPolicy,
//   handleCardSetup,
// },ref) =>{
//   const stripe = useStripe();
//   const elements = useElements();
//   // const getCardNumber = () => {
//   //   return elements.getElement(CardNumberElement)
//   // }
//   useImperativeHandle(ref, () => ({
//     getCardNumberElement: () => elements.getElement(CardNumberElement),
//   }));
//   return (
//     <div className="creditMain mb-4">
//       <h6 className="fs-7 mb-md-3 mb-sm-2">Credit Card</h6>
//       <b>Enter your name as it’s written on your card.</b>

//       <div className="inputMain mt-md-3 mt-xl-0 mb-3">
//         <input
//           type="text"
//           className="form-control"
//           placeholder="Name On Card"
//           value={cardDetails.nameOnCard}
//           onChange={(e) => setCardDetails({ ...cardDetails, nameOnCard: e.target.value })}
//         />
//       </div>

//       <div className="i">
//         <div className="form-control" style={{ padding: "10px" }}>
//           <CardNumberElement options={{ disableLink: true, style: { base: { fontSize: "13px", color: "#c9cccc" } } }} />
//         </div>
//       </div>

//       <div className="row mt-3">
//         <div className="col-md-6 mb-3">
//           <CardExpiryElement className="form-control" />
//         </div>
//         <div className="col-md-6">
//           <CardCvcElement className="form-control" />
//         </div>
//       </div>
//     </div>
//   );
// })
