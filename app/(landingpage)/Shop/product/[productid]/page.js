// components/ProductDetailsPage.jsx

"use client";
import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Slider from "react-slick";
import { config } from "services/config";
import { postApi } from "services/api";
import Pagination from "services/pagination";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "../../../LandingPage/public/css/style.css";
import "../../../LandingPage/public/css/developer.css";
import HeaderWithDropdown from "app/(landingpage)/LandingPage/components/HeaderWithDropdown/page";
// import SubHeader from "app/(landingpage)/LandingPage/components/SubHeader/page";
import FooterSection from "app/(landingpage)/LandingPage/components/Footer/page";
import { usePathname, useRouter } from "next/navigation";
import Loader from "services/Loader/page";
import DynamicModal3 from "services/Pop-ups/popup3/page";
import WriteReview from "services/Pop-ups/write-review/writereview";
import { useLanguage } from "context/languageContext";
import LoginPopup from "services/Pop-ups/LoginPopup/page";

export default function ProductDetailsPage({ params }) {
  const pathname = usePathname(); // Get the current path
  // const currentUrl = window.location.origin + pathname;

  let route = useRouter();
  const thumbWrapRef = useRef(null);

  const { productid } = params;
  const [userData, setUserData] = useState();
  const [order, setOrder] = useState(null);
  const [quantity, setQuantity] = useState(0);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [selectedImage, setSelectedImage] = useState();
  const [sideImages, setSideImages] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewsavg, setReviewsavg] = useState([]);
  const [reviewCount, setReviewCount] = useState({});
  const [loading, setLoading] = useState(false);
  const [responseTitle, setResponseTitle] = useState("");
  const [responseDescription, setResponseDescription] = useState("");
  const [write, setWrite] = useState(false);
  const [responseHeading, setResponseHeading] = useState("");
  const [responseMessage, setResponseMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [currentUrl, setCurrentUrl] = useState("");
  const [expandedReviewId, setExpandedReviewId] = useState(null);
  const [openLogin, setOpenLogin] = useState(false);
  const [pendingCartProductId, setPendingCartProductId] = useState(null);
  const [minimumOrderQuantity, setMinimumOrderQuantity] = useState(null);
  const [buyNow, setBuyNow] = useState(false);
  const { isLoggedIn, login, logout, setCartCount } = useLanguage();
  const [expanded, setExpanded] = useState(false);
  const isLong = order?.product_description?.length > 300;
  const displayedText = expanded
    ? order?.product_description
    : order?.product_description?.slice(0, 300);
  const router = useRouter();
  const increaseQuantity = () => {
    setLoading(true);
    if (quantity < order?.maxOrderQuantity) setQuantity(quantity + 1);
    setLoading(false);
  };

 

  const goToNext = () => {
    sliderRef.current.slickNext();
};

const goToPrev = () => {
    sliderRef.current.slickPrev();
};

useEffect(() => {
  const el = thumbWrapRef.current;
  if (!el) return;

  const onWheel = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const slider = thumbSliderRef.current;
    if (!slider) return;

    const primaryDelta = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
    if (primaryDelta > 0) slider.slickNext();
    else slider.slickPrev();
  };

  el.addEventListener("wheel", onWheel, { passive: false });

  return () => {
    el.removeEventListener("wheel", onWheel);
  };
}, []);

  useEffect(() => {
    if (isLoggedIn && pendingCartProductId) {
      setLoading(true);
      if (buyNow) {
        addToCart1(pendingCartProductId, minimumOrderQuantity);
      } else {
        addToCart(pendingCartProductId, minimumOrderQuantity);
      }
      setPendingCartProductId(null);
    }
  }, [isLoggedIn, pendingCartProductId]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentUrl(window.location.href);
    }
  }, []);
  const handleCopyUrl = async () => {
    try {
      if (
        typeof navigator !== "undefined" &&
        navigator.clipboard &&
        window.isSecureContext
      ) {
        // ✅ Secure context (HTTPS, localhost)
        await navigator.clipboard.writeText(currentUrl);
        alert("URL copied to clipboard!");
      } else {
        // ✅ Fallback for insecure or unsupported environments
        const textArea = document.createElement("textarea");
        textArea.value = currentUrl;
        // Avoid scrolling to bottom
        textArea.style.position = "fixed";
        textArea.style.top = 0;
        textArea.style.left = 0;
        textArea.style.opacity = 0;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        const success = document.execCommand("copy");
        document.body.removeChild(textArea);

        if (success) {
          alert("URL copied to clipboard!");
        } else {
          throw new Error("Fallback: Copy command was unsuccessful.");
        }
      }
    } catch (err) {
      console.error("Failed to copy:", err);
      alert("Failed to copy URL: " + err.message);
    }
  };

  const decreaseQuantity = () => {
    setLoading(true);
    if (quantity > order?.minOrderQuantity) setQuantity(quantity - 1);
    setLoading(false);
  };

  const sliderRef = useRef(null);
  const thumbSliderRef = useRef(null);
  useEffect(() => {
    let user = JSON.parse(localStorage.getItem("user") || JSON.stringify({}));
    setUserData(user);

    // Scroll to top on load
    // window.scrollTo({ top: 0, behavior: "smooth" });
    window.scrollTo(0, 0);

    if (productid) {
      setLoading(true);
      fetchProductDetails();
      fetchReviews();
      fetchAverageReviews();
    }
  }, [productid]);

  async function addToCart(flag) {
    if (!isLoggedIn) {
       let cartData = JSON.parse(localStorage.getItem("cartItems")) || [];

    const existingIndex = cartData.findIndex(item => item.productId === order._id);

    if (existingIndex > -1) {
      // Update quantity
      cartData[existingIndex].quantity += quantity;
    } else {
      // Add new product
      cartData.push({
        productId: order._id,
        quantity: quantity,
      });
    }
    setCartCount(cartData.length);
    localStorage.setItem("cartItems", JSON.stringify(cartData));
    setShowModal(true);
        setResponseTitle("Success");
        setResponseHeading("Congratulations");
        setResponseMessage("Product Added To Cart Successfully !!");

    return;
      setPendingCartProductId(order?._id);
      setMinimumOrderQuantity(order?.minOrderQuantity);
      setOpenLogin(true);
      return;
    }

    try {
      if (order?.stock < 1) {
        return;
      }
      let user = JSON.parse(localStorage.getItem("user") || JSON.stringify({}));

      const endpoint = config.cartAdd;
      const data = {
        productId: order._id,
        userId: user._id,
        quantity: quantity,
      };
      const response = await postApi(endpoint, data);
      console.log(response, "response add cart");
      if (response.statusCode == 200 || response.statusCode == 201) {
        console.log(response);
        setCartCount(response?.data?.count);

        // if (flag) {
        //   route.push("/Shop/payment/" + order._id);
        // } else {
        // alert("Added to cart")
        setShowModal(true);
        setResponseTitle("Success");
        setResponseHeading("Congratulations");
        setResponseMessage("Product Added To Cart Successfully !!");
        setLoading(false);
        // }
      }else if (response.error){
        setShowModal(true);
        setResponseTitle("Failed");
        setResponseHeading("Oops !!");
        setResponseDescription("You have reached the maximum allowed quantity for this product in your cart.")
        setResponseMessage(response.error);
      }
    } catch (error) {
      console.error("Error fetching categorylist:", error);
    }
  }

  async function addToCart1() {
    if (!isLoggedIn) {
      setPendingCartProductId(order?._id);
      setMinimumOrderQuantity(order?.minOrderQuantity);
      setOpenLogin(true);
      return;
    }

    try {
      if (order?.stock < 1) {
        return;
      }
      let user = JSON.parse(localStorage.getItem("user") || JSON.stringify({}));

      const endpoint = config.cartAdd;
      const data = {
        productId: order._id,
        userId: user._id,
        quantity: quantity,
      };
      const response = await postApi(endpoint, data);
      console.log(response, "response add cart 1111111111111");
      if (response.statusCode == 200 || response.statusCode == 201) {
        
        setCartCount(response?.count);

        // if (flag) {
        route.push("/Shop/payment/" + order._id);
        setLoading(false);
        // }
        // else {
        //   // alert("Added to cart")
        //   setShowModal(true);
        //   setResponseTitle("Success");
        //   setResponseHeading("Congratulations");
        //   setResponseMessage("Product Added To Cart Successfully !!");
        // }
      }else if (response.error){
        setShowModal(true);
        setResponseTitle("Error");
        setResponseDescription("You have reached the maximum limit for this product in your cart.")
        setResponseHeading("Oops");
        setResponseMessage(response.error);
      }
    } catch (error) {
      console.error("Error fetching categorylist:", error);
    }
  }

  async function addToCartSimilar(id) {
    try {
      const endpoint = config.cartAdd;
      const data = { productId: id, userId: userData._id, quantity: quantity };
      const response = await postApi(endpoint, data);
      console.log(response, "response add cart");
      if (response.statusCode == 200 || response.statusCode == 201) {
        console.log(response);
        setCartCount(response?.count);
        setShowModal(true);
        setResponseTitle("Success");
        setResponseHeading("Congratulations");
        setResponseMessage("Product Added To Cart Successfully !!");
        // alert("Added to cart")
      }else if (response.error){
        setShowModal(true);
        setResponseTitle("Error");
        setResponseHeading("Oops");
        setResponseMessage(response.error);
      }
    } catch (error) {
      console.error("Error fetching categorylist:", error);
    }
  }

  const fetchProductDetails = async () => {
    try {
      const endpoint = config.Viewproduct;
      const data = { id: productid };
      const response = await postApi(endpoint, data);
      if (response.statusCode === 201) {
        setOrder(response.product);
        setSelectedImage(`${response.product.coverImage}`);
        let temp = [response.product.coverImage];
        setQuantity(response.product?.minOrderQuantity);
        console.log(response.product);
        let a = temp.concat(...response.product.additionalImages);
        setSideImages(a);
        fetchProducts(response.product);
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      console.error("Error fetching product:", error);
    }
  };
  const fetchAverageReviews = async () => {
    try {
      const endpoint = config.GetReviewsRating;
      const data = { 
        product_id: productid,
      };

      const response = await postApi(endpoint, data);

      console.log("tesposne", response);
      if (response.statusCode === 201 || response.statusCode === 200) {
        setReviewsavg(response.data);
        let obj = {};
        response.data.forEach((e) => {
          obj[e.rating] = obj[e.rating] ? obj[e.rating] + 1 : 1;
        });

        setLoading(false);
      } else {
        setReviewsavg({});
      }
    } catch (error) {
      setLoading(false);
      console.error("Error fetching product:", error);
    }
  };
  const fetchReviews = async (page = currentPage) => {
    // try {
    const endpoint = config.getReviews;
    const data = {
      product_id: productid,
      limit: 5,
      page: page,
    };

    const response = await postApi(endpoint, data);

    if (response.statusCode === 201 || response.statusCode === 200) {
      console.log("pagination data", response.data);
      setReviews(response.data);
      setTotalCount(response.total || 0);
      setLoading(false);
    } else {
      setLoading(false);
    }
    // } catch (error) {
    //   setLoading(false);
    //   console.error("Error fetching product:", error);
    // }
  };
  useEffect(() => {
    fetchReviews(currentPage);
    fetchAverageReviews()
  }, [currentPage, !write]);

  const goToNextPage = (cat) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 500);
    router.push(`/Shop/product/${cat._id}`);
  };

  const getInitials = (name = "") => {
    const words = name.trim().split(" ");
    if (words.length === 1) return words[0][0]?.toUpperCase() || "";
    return (words[0][0] + words[1][0]).toUpperCase();
  };

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 4,
    autoplay: false,
    autoplaySpeed: 2500,
    // arrows: true,
    responsive: [
      { breakpoint: 991, settings: { slidesToShow: 2 } },
      { breakpoint: 767, settings: { slidesToShow: 1, dots: true } },
    ],
  };

    const goToThumbNext = () => {
    thumbSliderRef.current?.slickNext();
  };

  const goToThumbPrev = () => {
    thumbSliderRef.current?.slickPrev();
  };
const THUMBS_VISIBLE = 4;

const thumbSliderSettings = {
  slidesToShow: THUMBS_VISIBLE,
  slidesToScroll: 1,
  vertical: true,
  arrows: false,
  swipeToSlide: true,
  draggable: true,
  verticalSwiping: true,
  infinite: sideImages.length > THUMBS_VISIBLE,
  responsive: [
    { breakpoint: 767, settings: { vertical: false, slidesToShow: 3, verticalSwiping: false } },
    { breakpoint: 580, settings: { vertical: false, slidesToShow: 3, verticalSwiping: false } },
    { breakpoint: 380, settings: { vertical: false, slidesToShow: 3, verticalSwiping: false } },
  ],
};

const handleThumbWheel = (e) => {
  // Prevent page scroll while scrolling over thumbs
  e.preventDefault();

  const slider = thumbSliderRef.current;
  if (!slider) return;

  // Works for mouse wheel + trackpad (vertical/horizontal gestures)
  const primaryDelta = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;

  if (primaryDelta > 0) slider.slickNext();
  else slider.slickPrev();
};


  async function fetchProducts(product) {
    setLoading(true);
    try {
      let body = {
        page: 1,
        pageSize: 8,
        category: [product.category],
        brand: [],
        sortBy: "buy_count",
        sortOrder: "desc",
      };
      const response = await postApi(config.product, body);

      const filteredProducts = (response.productsWithUrls || []).filter(
        (product) => product._id !== productid
      );

      setSimilarProducts(filteredProducts);

      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error fetching products:", error);
    }
  }

  const goToNextPagefrombreadcrumb = (cat) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 500);
    router.push(`/Shop/products?category=${cat}`);
  };

  
  const handleToggle = (id) => {
    setExpandedReviewId(prevId => (prevId === id ? null : id));
  };

  return (
    <>
      {loading && <Loader />}
      <HeaderWithDropdown />
      {/* <SubHeader topPosition={80}  /> */}
      <div className="deatilMain">
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
              <li className="breadcrumb-item">
                <a
                  style={{ textDecoration: "none", cursor: "pointer" }}
                  onClick={() => goToNextPagefrombreadcrumb(order?.category)}
                >
                  Products
                </a>
              </li>
              <li className="breadcrumb-item active">{order?.productName}</li>
            </ol>
          </div>

          <div className="row">
            <div className="col-lg-6 mb-4 mb-lg-0">
              <div className="productSlider thumbMobile">
             <div
  ref={thumbWrapRef}
  className="pdtthumb"
  style={{  overflow: "hidden" }}
>


                 
                  {console.log("sideImages",sideImages)}
                  <Slider
            {...thumbSliderSettings}
            ref={thumbSliderRef}
            className="slider slider-nav"
          >
            {sideImages.map((img, idx) => (
              <div
                key={`${img}-${idx}`}
                className="thumbnail-image"
                onClick={() => setSelectedImage(img)}
              >
                <div className="thumbImg" style={{ cursor: "pointer" }}>
                  <img
                    src={`${process.env.NEXT_PUBLIC_API_URL}/${img}`}
                    alt={`thumb-${idx}`}
                  />
                </div>
              </div>
            ))}
          </Slider>

                </div>
                <div className="pdtMain">
                  <div className="slider slider-for">
                    {["product-image1.jpg"].map((img, idx) => (
                      <div key={idx}>
                        <div className="slider-banner-image">
                          {selectedImage && (
                            <img
                              src={
                                selectedImage
                                  ? `${process.env.NEXT_PUBLIC_API_URL}/${selectedImage}`
                                  : ""
                              }
                              alt="slider-img"
                              width={500}
                              height={500}
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="d-xl-flex mt-3 gap-2 px-md-3 btnDiv">
                    <span
                      href=""
                      className="btn btn-primary w-50 d-flex align-items-center justify-content-center"
                      // onClick={() => addToCart(false)}
                      onClick={() => {
                        addToCart(false);
                        setBuyNow(false);
                      }}
                    >
                      <img
                        className="me-1"
                        src="/images/landingpage/carticoncart.svg"
                        width={16}
                        height={16}
                        alt="cart"
                      />{" "}
                      Add To Cart
                    </span>
                    <span
                      href="shopping-cart.html"
                      className="btn btn-orange w-50 d-flex align-items-center justify-content-center"
                      // onClick={() => addToCart(true)}
                      onClick={() => {
                        addToCart1();
                        setBuyNow(true);
                      }}
                    >
                      <img
                        className="me-1"
                        src="/images/landingpage/buyicon.svg"
                        width={16}
                        height={16}
                        alt="buy"
                      />{" "}
                      Buy Now
                    </span>
                  </div>
                </div>
              </div>

              {/* <div className="d-xl-flex mt-3 gap-2 px-md-3 btnmobile">
                <Link href="#" className="btn btn-primary w-50">
                  <img
                    className="me-1"
                    src="/images/landingpage/carticon.svg"
                    width={16}
                    height={16}
                    alt="cart"
                  />{" "}
                  Add To Cartsss
                </Link>
                <Link href="shopping-cart.html" className="btn btn-orange w-50">
                  <img
                    className="me-1"
                    src="/images/landingpage/buyicon.svg"
                    width={16}
                    height={16}
                    alt="buy"
                  />{" "}
                  Buy Now
                </Link>
              </div> */}
            </div>

            <div className="col-lg-6">
              <div className="productContent">
                <div className="d-md-flex justify-content-between">
                  <div className="pdtyName">
                    <h2>{order?.categoryName}</h2>
                    <h3>{order?.productName}</h3>
                    {order?.stock < 1 && (
                      <h4 style={{ color: "red" }}>OUT OF STOCK</h4>
                    )}

                    <div className="item_rating_count">
                      <span className="rating_count">
                      {reviewsavg?.averageRating || 0}{" "}
                        <img
                          src="/images/landingpage/star-icon.svg"
                          width={10}
                          height={10}
                          alt="star"
                        />
                      </span>
                      <span>
                        {/* {reviews.length} Ratings and{" "} */}
                        {reviewsavg?.totalReviews || 0} reviews
                      </span>
                    </div>
                    <div className="qtyGroup">
                      <strong>Quantity</strong>
                      <div className="quantity">
                        <button
                          className="minus"
                          aria-label="Decrease"
                          onClick={decreaseQuantity}
                        >
                          &minus;
                        </button>
                        <input
                          type="number"
                          className="input-box"
                          value={quantity}
                          style={{ width: "50px" }}
                          readOnly
                        />
                        <button
                          className="plus"
                          aria-label="Increase"
                          onClick={increaseQuantity}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    {/* <div className="d-flex gap-4">
                      <div className="item_price mt-3">
                        <span>Price/unit</span>
                        <strong>${order?.price}</strong>
                      </div>
                      <div className="item_price mt-3">
                        <span>Total Price</span>
                        <strong>${order?.price * quantity}</strong>
                      </div>
                    </div> */}
                    <div className="item_price mt-3">
                      <span>Price</span>
                      <strong>${(order?.price * quantity)?.toFixed(2)}</strong>
                    </div>
                  </div>
                  <div className="shareLink">
                    <ul className="d-flex align-items-center gap-2">
                      <li className="me-2">Share:</li>
                      {/* [
                        "facebook-circle-icon.svg",
                        "twitter-circle-icon.svg",
                        "pinterest-circle-icon.svg",
                        "copy-link.svg",
                      ] */}
                      {["copy-link.svg"].map((icon, idx) => (
                        <li key={idx} style={{ cursor: "pointer" }}>
                          <span onClick={handleCopyUrl}>
                            <img
                              src={`/images/landingpage/${icon}`}
                              width={20}
                              height={20}
                              alt="social"
                            />
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="itemsDetail ">
                  <table className="table">
                    <tbody style={{ padding: "20px" }}>
                      <tr>
                        <th>Brand</th>
                        <td>{order?.brandName}</td>
                      </tr>
                      <tr>
                        <th>Item Weight</th>
                        <td>{order?.weight} gm</td>
                      </tr>
                      <tr>
                        <th>Item Form</th>
                        <td>{order?.itemTypeName}</td>
                      </tr>
                      <tr>
                        <th>Ingredients</th>
                        <td>
                          {order?.ingredients}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="aboutItems">
                  <h4>Description</h4>
                  <p>{order?.product_description}</p>
                  {/* Read More functionality commented out - can be restored if needed
                  <p>
      {displayedText}
      {isLong && (
        <b
          onClick={() => setExpanded(!expanded)}
          style={{
            color: "#71318B",
            textDecoration: "underline",
            cursor: "pointer",
            marginLeft: 5,
          }}
        >
          {expanded ? " Show Less" : " Read More"}
        </b>
      )}
    </p>
                  */}
                </div>
              </div>
            </div>
          </div>

          <div className="productReview">
            <div className="section-heading text-start mw-100 pb-3 d-flex align-items-center justify-content-between">
              <h2>Product Review</h2>
              <span
                onClick={() => {
                  setWrite(true);
                }}
                className="btn btn-primary"
              >
                Write a Review
              </span>
            </div>

            <div className="row">
              <div className="col-md-4 mb-3 pe-md-4">
                <div className=" d-flex align-items-center reviewCount mb-3">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const filled = star <= Math.floor(reviewsavg?.averageRating);
                    const half =
                      !filled && star - reviewsavg?.averageRating < 1 && star - reviewsavg?.averageRating > 0;
                    return (
                      <span
                        key={star}
                        className={`star ${filled ? "filled" : half ? "half-filled" : ""} pt-0 me-1`}
                        style={{ display: "inline-block", fontSize: "22px" }}
                      >
                        ★
                      </span>
                    );
                  })}
                  <span className="fs-8">
                    {reviewsavg?.averageRating || 0} out of 5
                  </span>
                </div>


                <div className="ratingBar">
                  {[
                    { english: "five", maths: 5 },
                    { english: "four", maths: 4 },
                    { english: "three", maths: 3 },
                    { english: "two", maths: 2 },
                    { english: "one", maths: 1 },
                  ].map((star, idx) => (
                    <div
                      key={idx}
                      className="d-flex align-items-center gap-2 justify-content-between mb-3"
                    >
                      <span>{star.maths} star</span>
                      <div className="progress" role="progressbar">
                        <div
                          className="progress-bar"
                          style={{
                            width: `${reviewsavg?.[`${star.english}StarPercentage`] || 0
                              }%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-center">
                        {reviewsavg?.[`${star.english}StarPercentage`] || 0}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="col-md-8 border-start ps-md-4">
                {reviews &&
                  reviews.map((rev, index) => {
                    const isExpanded = expandedReviewId === index;
          const isLong = rev?.review?.length > 205;
          const reviewText = isExpanded ? rev?.review : rev?.review?.slice(0, 205);
          return(
                    
                    <div key={rev} className="userReview">
                      <div className="reviewProfile">
                        <figure className="mb-0">
                          <div
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
                            {getInitials(rev?.userName)}
                          </div>
                        </figure>
                        <div className="reviewUserName">
                          <strong className="mb-0">{rev?.userName}</strong>
                          <div className="d-flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <b
                              key={star}
                              className={`star ${star <= rev?.rating ? "filled" : ""
                                } me-0`}
                              // Set rating on click
                              style={{fontSize: 16 , lineHeight: "1"}} // Ensure stars are inline
                            >
                              ★
                            </b>
                          ))}
                          </div>
                          {/* <span>Reviewed on {rev?.date}</span> */}
                          <span>
                            Reviewed on{" "}
                            {rev?.date && (() => {
                              const [datePart] = rev.date.split(',');
                              const [day, month, year] = datePart.split('/');
                              const months = [
                                "January", "February", "March", "April", "May", "June",
                                "July", "August", "September", "October", "November", "December"
                              ];
                              return `${day} ${months[parseInt(month) - 1]} ${year}`;
                            })()}
                          </span>

                        </div>
                      </div>
                      {/* <p>{rev.review?.slice(0, 205)} <b style={{color:"#71318B", textDecoration:"underLine"}}>Read More</b></p> */}
                      <p>
                {reviewText}
                {isLong && (
                  <a
                    onClick={() => handleToggle(index)}
                    style={{
                      color: "#71318B",
                      textDecoration: "underLine",
                      cursor: "pointer",
                      marginLeft: 5,
                    }}
                  >
                    {isExpanded ? " Show Less" : " Read More"}
                  </a>
                )}
              </p>

                    {rev.additionalImages && rev.additionalImages.length > 0 && (
  <ul className="reviewImages">
    {rev.additionalImages.map((img, index) => (
      <li key={index}>
        <img
          // src={img}
          src={`${process.env.NEXT_PUBLIC_API_URL}/${img}`}
          width={100}
          height={100}
          alt={`review-img-${index}`}
        />
      </li>
    ))}
  </ul>
)}

                      <hr />
                    </div>
                  )})}
                {reviews && reviews.length > 0 && (
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <Pagination
                      totalProducts={totalCount}
                      currentPage={currentPage}
                      pageSize={3}
                      onPageChange={(page) => setCurrentPage(page)}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

{similarProducts.length > 0 && 
          <div className="productsInner similarProducts position-relative">
            <div className="section-heading text-start mw-100 pb-3">
              <h2>Similar Products</h2>
            </div>

            <div className="custom-nav-buttons d-flex justify-content-end align-items-center"> 
                        <button className="prev-button1" onClick={goToPrev}>
                            <img src="/images/landingpage/prev-btn.svg" alt="Previous" />
                        </button>
                        <button className="next-button1" onClick={goToNext} >
                            <img src="/images/landingpage/next-btn.svg" alt="Next" />
                        </button>
                    </div>

            <Slider {...settings} ref={sliderRef} className="productSlide">
              {similarProducts.map((img, index) => (
                <div key={index}>
                  <div
                    className="journeyBox"
                    onClick={() => goToNextPage(img)}
                    style={{ cursor: "pointer" }}
                  >
                    <figure className="mb-1">
                      <img
                        src={`${process.env.NEXT_PUBLIC_API_URL}/${img.coverImage}`}
                        alt="product"
                        width={200}
                        height={200}
                      />
                    </figure>
                    <div className="contentproduct">
                      <span className="text-orange fs-8 pb-1">
                        {img?.brandName}
                      </span>
                      <h3
                        className="text-brown fs-7 fw-medium"
                      // style={{ color: "#662A09" }}
                      >
                        {img.productName}
                      </h3>
                      <hr />
                      <div className="d-flex justify-content-between align-items-baseline">
                       <b className="d-flex">
  {img?.mrp > img?.price ? (
    <>
      <span
        style={{
          textDecoration: "line-through",
          color: "rgb(0 190 85 / 69%)",
          marginRight: "8px",
        }}
      >
        ${img?.mrp}
      </span>
      <span
        style={{
          fontWeight: "bold",
          color: "#00BE55",
        }}
      >
        ${img?.price}
      </span>
    </>
  ) : (
    <span
      style={{
        fontWeight: "bold",
        color: "#00BE55",
      }}
    >
      ${img?.price}
    </span>
  )}
</b>

                        <span
                          className="btn btn-primary"
                          onClick={() => {
                            addToCartSimilar(img?._id);
                          }}
                        >
                          Add To Cart
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </Slider>
          </div>
          }
        </div>
      </div>

      {/* Review Modal */}
      <div className="modal fade writeReview" id="writeReview">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0">
            <div className="modal-header border-0">
              <h1 className="modal-title fs-6">Write Comment</h1>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <form className="commentForm">
                <div className="form-group mb-4">
                  <label>Name</label>
                  <input type="text" className="form-control" />
                </div>
                <div className="form-group mb-4">
                  <label>Enter Review</label>
                  <textarea className="form-control"></textarea>
                  <span className="text-end">1000 Characters</span>
                </div>
                <div className="form-group mb-4">
                  <label>Image Attachment</label>
                  <ul className="uploadImgUl mt-3">
                    <li>
                      <figure className="uploadedImg">
                        <img
                          src="/images/landingpage/product-image1.jpg"
                          alt=""
                          width={100}
                          height={100}
                        />
                        <button type="button" className="deleteIcon">
                          <i className="bi bi-trash"></i>
                        </button>
                      </figure>
                    </li>
                    <li>
                      <div className="attachmentGroup">
                        <input
                          type="file"
                          className="d-none"
                          id="attachment1"
                        />
                        <label htmlFor="attachment1">
                          <i className="bi bi-cloud-arrow-up-fill"></i>
                        </label>
                      </div>
                    </li>
                    <li>
                      <div className="attachmentGroup">
                        <input
                          type="file"
                          className="d-none"
                          id="attachment2"
                        />
                        <label htmlFor="attachment2">
                          <i className="bi bi-cloud-arrow-up-fill"></i>
                        </label>
                      </div>
                    </li>
                  </ul>
                </div>
                <div className="form-group mb-4">
                  <label>Rate</label>
                  <img
                    src="/images/landingpage/star.png"
                    width={170}
                    height={30}
                    alt="star"
                  />
                </div>
                <div className="text-center my-2 mt-4">
                  <button type="button" className="btn btn-primary w-75">
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <WriteReview
        show={write}
        product={order?._id}
        user={userData?._id}
        onClose={() => {
          setWrite(false);
          fetchReviews(userData);
        }}
        heading={responseHeading || ""}
        description={responseMessage || ""}
        buttonText="Continue"
        onButtonClick={() => { setWrite(false); }}
      />
    <DynamicModal3
  show={showModal}
  onClose={() => setShowModal(false)}
  title={responseTitle || "Success"}
  heading={responseHeading || ""}
  description={responseDescription || "Item has been added to cart"}
  buttonText="Okay"
  onButtonClick={() => setShowModal(false)}
  showjson={false}
/>

      <LoginPopup
        show={openLogin}
        onClose={() => setOpenLogin(false)}
        title={responseTitle || ""}
        heading={responseHeading || ""}
        description={responseMessage || ""}
        buttonText="Continue"
        onButtonClick={() => setOpenLogin(false)}
      />
      <FooterSection />
    </>
  );
}
