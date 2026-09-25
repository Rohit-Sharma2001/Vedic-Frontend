
"use client";
import React, { useState, useEffect, useRef } from "react";
import DynamicModal3 from "services/Pop-ups/popup3/page";
import Image from "next/image";
import Link from "next/link";
import { Trash } from "react-bootstrap-icons";
import HeaderWithDropdown from "app/(landingpage)/LandingPage/components/HeaderWithDropdown/page";
// import SubHeader from "app/(landingpage)/LandingPage/components/SubHeader/page";
import FooterSection from "app/(landingpage)/LandingPage/components/Footer/page";
import { useParams, useRouter } from "next/navigation";
import { config } from "services/config";
import { useSearchParams } from "next/navigation";
import { postApi } from "services/api";
import axios from "axios";
import Loader from "services/Loader/page";
import { useLanguage } from "context/languageContext";
import ThankYouModal from "../../thankYou/page";
import { BillingAddress } from "sub-components";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";

export default function CartMethodPage() {
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [addressChoice, setAddressChoice] = useState("default");
  // 1) STATE – put near other useState hooks
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [modalContent, setModalContent] = useState("");
  /* 1) STATE – add near other useState hooks */
  const [isEditingAddress, setIsEditingAddress] = useState(false);     // editing mode flag
  const [editingAddressId, setEditingAddressId] = useState(null); // address _id being edited
  const [userData, setUserData] = useState({});
  const [activeTab, setActiveTab] = useState("pickup");
  const [addressTab, setAddressTab] = useState("john");
  const [showShippingCost, setShowShippingCost] = useState(false);
  const [shippingMethod, setShippingMethod] = useState();
  const [billingSame, setBillingSame] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [addAddressModal, setAddAddressModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [giftCard, setGiftCard] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [mounted, setMounted] = useState(false);
  const [products, setProducts] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [defaultAdd, setDefaultAdd] = useState({});
  const [discount, setDiscount] = useState(0);
  const [inStoreAddressDropdown, setInStoreAddressDropdown] = useState("");
  const [allAddressInStoreDropdown, setAllAddressInStoreDropdown] = useState(
    []
  );
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [shippingOptions, setShippingOptions] = useState([]);
  const [showAllShippingOptions, setShowAllShippingOptions] = useState(false);
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
  const [selectedShippingAdd, setSelectedShippingAdd] = useState();
  const [addressValidation, setAddressVailidation] = useState();
  const [toAddress, setToAddress] = useState();
  const [fromAddress, setFromAddress] = useState();
  const [formError, setFormError] = useState("");
  const [pickupDate, setPickupDate] = useState(); // ADD THIS
  const [billingAddress, setBillingAddress] = useState({
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    country: "",
    zipcode: ""
  });
  const [hasMounted, setHasMounted] = useState(false);
  const [plan, setPlan] = useState(null);

  const [refundPolicy, setRefundPolicy] = useState(false)
  useEffect(() => {
    setHasMounted(true);
    window.scrollTo(0, 0);
  }, []);

  const dateRef = useRef(null);

  useEffect(() => {
    if (activeTab !== "pickup") {

      const timer = setTimeout(() => {

        flatpickr('#dateInput', {
          minDate: 'today',
        });

      }, 100);

      return () => clearTimeout(timer);
    } else {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      flatpickr(dateRef.current, {
        minDate: tomorrow,
        disable: [(date) => date.getDay() === 0], // disable Sundays
        dateFormat: "Y-m-d",
        onChange: ([date]) => {
          if (!date) return;
          const yyyy = date.getFullYear();
          const mm = String(date.getMonth() + 1).padStart(2, "0");
          const dd = String(date.getDate()).padStart(2, "0");
          setPickupDate(`${yyyy}-${mm}-${dd}`);
        },
      });
    }
  }, [activeTab]);
  const router = useRouter();

  const searchParams = useSearchParams();

  useEffect(() => {
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

  async function getCart(id, user) {
    try {
      setLoading(true)
      const endpoint = config.getCart;
      const data = {
        // page: 1,
        user: user._id,
        // pageSize: 10,
        product: id,
        // selected: 1,
      };
      const response = await postApi(endpoint, data);
      setLoading(false)
      if (response.statusCode == 200 || response.statusCode == 201) {
        setProducts(response.data);
      }
    } catch (error) {
      console.error("Error fetching categorylist:", error);
    }
  }

  // 2) API HELPER – place near other API helpers
  const fetchRefundPolicy = async () => {
    try {
      const data = { dropdown_type: "shop_refund", page: 1, pageSize: 1 };
      const response = await postApi(config.category, data);
      if (response?.result?.length > 0) {
        const html = response.result[0].description || "";
        setModalContent(html);
        return html;
      }
      return "";
    } catch (err) {
      console.error("Error fetching refund policy:", err);
      return "";
    }
  };


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

  /* 3) API – update existing address (mirrors addAddress, same validations) */
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
        await getAddress(JSON.parse(localStorage.getItem("user") || "{}"));
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
        } else {
          setDefaultAdd(response.data.data[0]);
          setToAddress(response.data.data[0]._id);
        }
      }
    } catch (error) {
      console.error("Error fetching categorylist:", error);
    }
  }

  function getImageUrl(url) {
    const correctedUrl = url.replace(/\\/g, "/");
    return `${process.env.NEXT_PUBLIC_API_URL}/${correctedUrl}`;
  }

  useEffect(() => {
    const initData = async () => {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      setUserData(user);
      setUserProfile(user); // Store full profile

      // Auto-fill billing address from user profile
      autoFillBillingFromProfile(user);
      // 🛒 Load Cart
      if (id === "cart") await getCart(null, user);
      else await getCart(id, user);

      // 📦 Load Addresses & Stores
      await getAddress(user);
      await getInStoreAddress();

      // 🟢 Save membership ID (don’t fetch plan yet)
      if (user?.membershipId) {
        console.log("Membership ID found:", user.membershipId);
        setPlan({ id: user.membershipId });
      }
    };

    initData();
  }, []);
  useEffect(() => {
    if (plan?.id && products.length > 0) {
      console.log("🔁 Products loaded — applying membership discounts...");
      fetchPlanDetails(plan.id, products);
    }
  }, [plan?.id, products]);



  const getInStoreAddress = async () => {
    try {
      setLoading(true)
      const endpoint = config.centers;
      const response = await postApi(endpoint);
      setLoading(false)
      if (response.statusCode == 200 || response.statusCode == 201) {
        setFromAddress(response?.centers[0]._id);
        setAllAddressInStoreDropdown(response?.centers);
      }
    } catch (error) {
      console.error("Error fetching categorylist:", error);
    }
  };
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
          // dis = response.coupon?.discountValue;
          dis = Math.min(response.coupon?.discountValue || 0, sub);
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
          dis = Math.min(response.coupon?.discountValue || 0, sub);
          // dis = response.coupon?.discountValue;
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
      if (!pickupDate) {
        setFormError("Pickup date is required.");
        return;
      }

    }
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
    if (!refundPolicy) {
      setFormError("Please accept refund Policy.");
      return;
    }
    try {
      const cartIds = products.map((p) => p._id);
      const data = {
        cartIds,
        userId: userData._id,
        membershipId: userData?.membershipId,
        deliveryCharge:
          Number(
            shippingOptions.find((e) => e.object_id === shippingMethod)?.amount
          ) || 0,
        carrier: shippingOptions.find((e) => e.object_id === shippingMethod)?.provider || '',
        coupanId: discount && promoCode || "",
        shippingId: shippingMethod,
        pickupDate: pickupDate,
        addressId: defaultAdd?._id,
        billingAddress1: billingAddress.addressLine1,
        billingAddress2: billingAddress?.addressLine2,
        billingCity: billingAddress?.city,
        billingState: billingAddress?.state,
        billingCountry: billingAddress?.country,
        billingZipcode: billingAddress?.zipcode
      };
      setLoading(true)
      const response = await postApi(config.OrderByNow, data);
      setLoading(false)
      if (response.statusCode === 200 || response.statusCode === 201) {
        // window.open(response.paymentUrl);
        window.location.href = response.paymentUrl;
      }
    } catch (err) {
      console.error("Error during byNow:", err);
      setFormError("Something went wrong. Please try again.");
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
        } else setShowShippingCost(!showShippingCost);
        // setShippingOptions(response?.data?.rates);
        const rates = response?.data?.rates || [];
        const sortedRates = rates.sort((a, b) => parseFloat(a.amount) - parseFloat(b.amount));
        console.log(sortedRates, "sortedRates")
        setShippingOptions(sortedRates);
      }
    } catch (err) {
      console.error("Error fetching calculateShippingCost:", err);
    }
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
  const finalAddress = async (e) => {
    try {
      let { name, value } = e.target;

      setNewAddress({ ...newAddress, [name]: value });

    } catch (err) {
      console.error("Error fetching add Address:", err);
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
        // console.log(JSON.stringify(arr1) === JSON.stringify(arr2));
        setLoading(true)
        const endpoint = config.addAddress;
        let data = {
          ...newAddress,
          user_id: JSON.parse(localStorage.getItem("user"))._id,
          stateCode: stateCode,
          countryCode: countryCode,
        };

        const response = await postApi(endpoint, data);
        setLoading(false)
        if (response.statusCode == 200 || response.statusCode == 201) {
          setAddAddressModal(false);
          getAddress(userData);
        } else {
          setAddressVailidation(response.error);
        }
      }
    } catch (err) {
      console.error("Error fetching calculateShippingCost:", err);
    }
  };

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

  // const updateQuantity = (index, newQty) => {
  //   if (newQty < 1) return; // prevent 0 or negative quantities

  //   const updated = [...products];
  //   updated[index].quantity = newQty;
  //   setProducts(updated);

  //   // ✅ Apply coupon only if promoCode is filled
  //   if (promoCode && promoCode.trim() !== "") {
  //     applyCoupon();
  //   }
  // };
  async function updateQuantity(id, quantity, index) {
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
        setCartCount(response?.data.count);
        // ✅ Apply coupon only if promoCode is filled
        if (promoCode && promoCode.trim() !== "") {
          applyCoupon();
        }
      } else if (response) {
        alert(response.message)
      }

    } catch (error) {
      console.error("Error fetching categorylist:", error);
    }
  }


  const removeProduct = async (index, id) => {
    try {
      const updated = [...products];
      updated.splice(index, 1);
      setProducts(updated);
      const endpoint = config.removeItem;
      setLoading(true)
      const data = { id: id, user_id: userData._id };
      const response = await postApi(endpoint, data);
      console.log(response)
      setLoading(false)
      if (response.statusCode == 200 || response.statusCode == 201) {
        console.log(response)
        setCartCount(response?.count)
        getCart(userData)
      } else {
        alert(response.message)
      }

    } catch (error) {
      console.error("Error fetching categorylist:", error);
    }
  };


  // const freeProducts = products
  //   .filter(item => item.productDetails?.buy_one_get_one)
  //   .flatMap(item => Array(item.quantity).fill(item));

  // 1) IMPORT — at top of the file (lazy import below, so this is optional)
  // import Swal from 'sweetalert2'  // we will lazy-load, no static import needed

  // 2) HELPER — add near other API helpers
  const confirmAndDelete = async (add) => {
    try {
      // lazy-load sweetalert2 to keep bundle slim
      const Swal = (await import('sweetalert2')).default;

      const res = await Swal.fire({
        title: 'Delete this address?',
        html: `<div style="text-align:left">
               <b>${add?.name || ''}</b><br/>
               ${add?.flatNo ? add.flatNo + ', ' : ''}${add?.area || ''}<br/>
               ${add?.city || ''}, ${add?.state || ''}, ${add?.country || ''} - ${add?.pincode || ''}
             </div>`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it',
        cancelButtonText: 'Cancel',
        reverseButtons: true,
        focusCancel: true,
      });

      if (!res.isConfirmed) return;

      setLoading(true);
      const response = await postApi(config.deleteAddress, { addressId: add?._id });
      setLoading(false);

      if (response.statusCode === 200 || response.statusCode === 201) {
        // if deleted address was selected, choose another one
        const wasDefault = defaultAdd?._id === add?._id;

        // refresh addresses
        await getAddress(JSON.parse(localStorage.getItem('user') || '{}'));

        // re-open modal state remains; ensure defaultAdd/toAddress are sane
        if (wasDefault) {
          // after getAddress, state already picks primary or first one
          // but double-check if nothing left:
          if (!addresses || addresses.length === 0) {
            setDefaultAdd({});
            setToAddress(undefined);
          }
        }

        await Swal.fire({
          title: 'Deleted',
          text: 'Address deleted successfully.',
          icon: 'success',
          timer: 1400,
          showConfirmButton: false,
        });
      } else {
        await Swal.fire({
          title: 'Delete failed',
          text: response?.message || response?.error || 'Something went wrong.',
          icon: 'error',
        });
      }
    } catch (err) {
      setLoading(false);
      const Swal = (await import('sweetalert2')).default;
      await Swal.fire({
        title: 'Error',
        text: err?.message || 'Something went wrong.',
        icon: 'error',
      });
    }
  };

  const resetShippingOnAddressChange = async () => {
    // clear all previously calculated shipping data
    setShowShippingCost(false);
    setShippingMethod(undefined);
    setShippingOptions([]);
    setShowAllShippingOptions(false);

    // optional: clear any previous errors
    setFormError("");

    // sweetalert2 (lazy-load)
    const Swal = (await import("sweetalert2")).default;
    await Swal.fire({
      title: "Shipping address changed",
      text: "Please calculate the shipping cost again.",
      icon: "info",
      confirmButtonText: "OK",
    });
  };

  // helper: safe wrapper to select address + reset shipping if needed
  const handleSelectShippingAddress = async (add) => {
    const nextId = add?._id;

    // update selected address
    setDefaultAdd(add);
    setToAddress(nextId);

    // only reset if user is on ship tab AND shipping was already calculated
    if (activeTab === "ship" && (showShippingCost || shippingOptions?.length)) {
      await resetShippingOnAddressChange();
    }
  };
  const convertTo12HourFormat = (timeString) => {
    if (!timeString) return "N/A";
    
    if (timeString.match(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes} ${ampm}`;
    }
    
    if (timeString.includes('AM') || timeString.includes('PM')) {
      return timeString;
    }
    
    return timeString;
  };

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
                <Link href={"/"} style={{ textDecoration: "none" }}>
                  Home
                </Link>
              </li>
              <li className="breadcrumb-item">
                <Link href={"/Shop"} style={{ textDecoration: "none" }}>
                  Shop
                </Link>
              </li>

              <li className="breadcrumb-item active">Payment</li>
            </ol>
          </div>
          <div className="row">
            {/* Left Column */}
            <div className="col-lg-12 col-xl-7 mb-3">
              <div className="informationLeft">
                <h6 className="fw-semibold mb-3">Vedic Health Ayurveda</h6>
                <hr className="mb-3" />

                <label className="mb-3 fw-medium">Shipping Information</label>

                {/* Shipping/Pickup Tabs */}
                <ul className="nav nav-tabs cstmTbs mb-4">
                  <li className="nav-item">
                    <button
                      className={`nav-link ${activeTab === "ship" ? "active" : ""
                        }`}
                      onClick={() => { setActiveTab("ship") }}
                    >
                      Ship to Address
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`nav-link ${activeTab === "pickup" ? "active" : ""
                        }`}
                      onClick={() => switchToSelfPickup()}
                    >
                      In-Store Pickup
                    </button>
                  </li>
                </ul>

                {activeTab === "ship" && (
                  <div className="tab-pane active">
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
                                  onChange={async () => {
                                    setAddressChoice("default");
                                    setToAddress(defaultAdd?._id);

                                    if (activeTab === "ship" && (showShippingCost || shippingOptions?.length)) {
                                      await resetShippingOnAddressChange();
                                    }
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
                    </div>


                    {addressTab === "john" &&
                      defaultAdd &&
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

                    {/* Shipping Cost */}
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
                  </div>
                )}
                {/* Store Pickup */}
                {activeTab === "pickup" && (
                  <div className="tab-pane active">
                    <label className="mb-3 fw-medium fs-7">
                      You can pick up your order at:
                    </label>
                    <div className="mb-3 locatonDiv">
                      <span className="fw-medium">
                        <img
                          src="/images/landingpage/location-red-icon.svg"
                          alt=""
                          className="me-3"
                          width={14}
                        // height={24}
                        />
                        {/* challega  */}
                        {allAddressInStoreDropdown &&
                          allAddressInStoreDropdown[0]?.address || "N/A"}
                        <br />
                        <span style={{ marginLeft: "5px" }}>
                          Opening Time:{" "}
                          {allAddressInStoreDropdown &&
                            convertTo12HourFormat(allAddressInStoreDropdown[0]?.openingTime )|| "N/A"}
                        </span>
                        <span style={{ marginLeft: "5px" }}>
                          Closing Time:{" "}
                          {allAddressInStoreDropdown &&
                            convertTo12HourFormat(allAddressInStoreDropdown[0]?.closingTime) || "N/A"}
                        </span>
                      </span>
                    </div>
                    <label className="mb-3 fw-medium fs-7">
                      Pickup Date
                    </label>
                    <div className="inputMain mt-md-3 mt-xl-0 mb-3">
                      {/* <input
                        type="date"
                        className="form-control"
                        min={(() => {
                          const tomorrow = new Date();
                          tomorrow.setDate(tomorrow.getDate() + 1);
                          return tomorrow.toISOString().split("T")[0];
                        })()}
                        value={pickupDate}
                        style={{ width: '40%' }}
                        onChange={(e) => {
                          const selectedDate = new Date(e.target.value);
                          if (selectedDate.getDay() === 0) {
                            alert("Pickup is not available on Sundays. Please choose another date.");
                            return;
                          }
                          setPickupDate(e.target.value);
                        }}
                        required
                      /> */}
                      <input
                        ref={dateRef}
                        className="form-control"
                        placeholder="Select pickup date"
                        style={{ width: "40%" }}
                      // readOnly
                      />
                    </div>
                  </div>
                )}
                {/* Promo Code */}
                <label className="mb-3 fw-medium fs-7">Promo Code</label>
                <div className="inputMain mt-md-3 mt-xl-0 mb-3">
                  <input
                    type="text"
                    className="form-control btnRight"
                    placeholder="Promo Code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                  />
                  <button
                    className="btn btn-primary"
                    onClick={() => applyCoupon()}
                  >
                    Apply
                  </button>
                </div>



                {/* Billing Address */}
                <div className="billingAdd">
                  <h6 className="mb-4">Billing Address</h6>
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
                              addressLine1: `${defaultAdd.flatNo || ""}, ${defaultAdd.area || ""} `,
                              addressLine2: ` `,
                              city: `${defaultAdd.city || ""}`,
                              state: defaultAdd.state || "",
                              country: defaultAdd.country || "",
                              zipcode: defaultAdd.pincode || ""
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
                            city: "",
                            state: "",
                            zipcode: ""
                          });
                        }
                      }}
                    />
                    <label htmlFor="termCheck2" className="fw-medium">
                      Same as shipping address
                    </label>
                  </div>}

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
                      By clicking &#39;Buy Now&#39; I agree to the Vedic Health{" "}
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
                      onClick={() => byNow()}
                      disabled={((activeTab == 'pickup' ? (!pickupDate) : !showShippingCost) && !refundPolicy)}
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
                                  {console.log(pro, "lklklkl")}
                                  <span>{pro?.productDetails.brand_name}</span>
                                  <div className="d-flex mt-2 align-items-center gap-2">
                                    {/* <button
                                      style={{ borderColor: 'transparent' }}
                                      className="btn btn-sm qty-btn"
                                      onClick={() =>
                                        updateQuantity(pro.productId, pro.quantity - 1, idx)
                                      }
                                      disabled={
                                        pro.quantity <=
                                        pro.productDetails.minOrderQuantity
                                      }
                                    >
                                      −
                                    </button> */}

                                    <span className="qty-value">Qty : {pro.quantity}</span>

                                    {/* <button
                                      style={{ borderColor: 'transparent' }}
                                      className="btn btn-sm qty-btn"
                                      onClick={() =>
                                        updateQuantity(pro.productId, pro.quantity + 1, idx)
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


                            <td width="10%" className="text-end pe-0">
                              <span
                                onClick={() => removeProduct(idx, pro._id)}
                                style={{ cursor: "pointer", color: "#662A09" }}
                              >
                                <Trash size={20} />
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
                {/* {freeProducts.length > 0 && (
                  <>
                    <h6 className="mt-4 mb-2">Free Products (BOGO)</h6>
                    <div className="table-responsive tableDiv">
                      <table className="table">
                        <tbody>
                          {freeProducts.map((item, idx) => (
                            <tr key={idx}>
                              <td width="60%" className="ps-0">
                                <div className="productTable firstPd">
                                  <figure className="m-0">
                                    <img
                                      src={`${getImageUrl(item.productDetails.coverImage)}`}
                                      alt="Free Product"
                                      width={80}
                                      height={80}
                                    />
                                  </figure>
                                  <div>
                                    <h6>{item.productDetails.productName}</h6>
                                    <span>{item.productDetails.category}</span>
                                    <div className="mt-2 text-success fw-bold small">Free with Purchase</div>
                                  </div>
                                </div>
                              </td>
                              <td width="20%" className="fw-medium text-end pe-0 text-muted">
                                $0.00
                              </td>
                              <td width="10%" className="text-end pe-0 text-muted">x1</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )} */}

                <div className="d-flex justify-content-between mt-2">
                  <h6 className="m-0">
                    Sub Total ({products.length}{" "}
                    {products.length > 1 ? "Items" : "Item"})
                  </h6>
                  <span>
                    $
                    {/* {products.reduce((p, q) => {
                      return p + q.quantity * q.productDetails.price;
                    }, 0)} */}

                    {(() => {
  const total = products.reduce(
    (p, q) => p + q.quantity * q.productDetails.price,
    0
  );

  return Number.isInteger(total)
    ? total
    : total.toFixed(2);
})()}
                  </span>
                </div>
                <div className="d-flex justify-content-between mt-2">
                  <h6 className="m-0">Discount </h6>
                  <span>${discount ? Number.isInteger(Number(discount)) ? discount : Number(discount).toFixed(2) : 0}</span>
                </div>
                <div className="d-flex justify-content-between mt-2">
                  <h6 className="m-0">Shipping </h6>
                  <span>
                    $
                    {shippingOptions.find((e) => e.object_id === shippingMethod)
                      ?.amount || 0}
                  </span>
                </div>
                <div className="d-flex justify-content-between mt-2">
                  <h6 className="m-0">Total</h6>$
                  {/* {products.reduce(
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
                      : 0)}{" "} */}
                  {(() => {
  const total =
    products.reduce(
      (sum, item) =>
        Number(sum) +
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
      : 0);

  return Number.isInteger(total)
    ? total
    : total.toFixed(2);
})()}
                </div>
                <hr />
                <div className="d-flex flex-column align-items-center gap-3">
                  <Link href={"/Shop/cart"} className="btn-shopping bg-white w-75 d-flex flex-column align-items-center text-decoration-none">
                    {/* <button className="btn btn-shopping bg-white w-100"> */}
                    &lt; Back to Cart
                    {/* </button> */}
                  </Link>
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
                                className="cstmRadio"
                                onClick={() => handleSelectShippingAddress(add)}
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
                                <div className="d-flex gap-2">
                                  <button
                                    type="button"
                                    className="bg-transparent border-0 p-0"
                                    onClick={() => openEditAddress(add)}
                                    aria-label="Edit address"
                                  >
                                    <img src="/images/landingpage/edit-icon.svg" alt="" width="16" />
                                  </button><button
                                    type="button"
                                    className="bg-transparent border-0 p-0"
                                    onClick={() => confirmAndDelete(add)}
                                    aria-label="Delete address"
                                  >
                                    <img src="/images/landingpage/delete-icon.svg" alt="" width="11" />
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
      </div>
      <FooterSection />



      {showPolicyModal && (
        <div className="policyModalOverlay" onClick={() => setShowPolicyModal(false)}>
          <div
            className="policyModal"
            onClick={(e) => e.stopPropagation()} // prevent overlay close when clicking inside
            role="dialog"
            aria-modal="true"
            aria-label="Refund Policy"
          >
            <div className="policyModalHeader">
              <h4>Refund Policy</h4>
              <button className="closeBtn" onClick={() => setShowPolicyModal(false)}>✕</button>
            </div>

            <div
              className="policyModalBody"
              dangerouslySetInnerHTML={{ __html: modalContent || "<p>Loading...</p>" }}
            />

            <div className="policyModalFooter">
              <button className="btn btn-primary w-100" onClick={() => setShowPolicyModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}


      <style jsx>{`
  .hyperlink {
    color: blue;
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
    from { opacity: 0; transform: translateY(-10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`}</style>

    </>
  );
}
