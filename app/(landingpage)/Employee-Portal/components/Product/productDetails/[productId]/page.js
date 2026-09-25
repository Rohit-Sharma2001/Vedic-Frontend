"use client";
import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Slider from "react-slick";
import { config } from "services/config";
import { postApi, getApi } from "services/api";
import Pagination from "services/pagination";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "../../../../../LandingPage/public/css/style.css";
// import "../../../LandingPage/public/css/developer.css";
import HeaderWithDropdown from "app/(landingpage)/LandingPage/components/HeaderWithDropdown/page";
// import SubHeader from "app/(landingpage)/LandingPage/components/SubHeader/page";
import FooterSection from "app/(landingpage)/LandingPage/components/Footer/page";
import { usePathname, useRouter } from "next/navigation";
import Loader from "services/Loader/page";
import DynamicModal3 from "services/Pop-ups/popup3/page";
import WriteReview from "services/Pop-ups/write-review/writereview";
import { useLanguage } from "context/languageContext";

import LoginPopup from "services/Pop-ups/LoginPopup/page";
import Swal from "sweetalert2";
import PractitionerHeader from "../../../PractionerHeader/page";


export default function ProductDetailsPage({ params }) {

    let router = useRouter();
    const [loading, setLoading] = useState(false);
    const { productId } = params;
    const [products, setProducts] = useState()
    const [similarProducts, setSimilarProducts] = useState([]);
    const sliderRef = useRef(null);
    const [showModal, setShowModal] = useState(false)
    const [responseTitle, setResponseTitle] = useState({});
    const [responseHeading, setResponseHeading] = useState("");
    const [responseDescription, setResponseDescription] = useState("");
    const [responseMessage, setResponseMessage] = useState({})
    const { isLoggedIn, login, logout, setCartCount, shopCategory } = useLanguage();
    const [reviewsavg, setReviewsavg] = useState([]);
    const [minimumOrderQuantity, setMinimumOrderQuantity] = useState(null);
    const [quantity, setQuantity] = useState(0);


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
    const fetchProducts = async () => {
        setLoading(true);
        try {
            const endpoint = config.Viewproduct;
            const response = await postApi(endpoint, { id: productId });

            console.log("products", response.product);
            fetchSimilerProducts(response.product)
            setQuantity(response.product?.minOrderQuantity);
            setProducts(response.product);
            setLoading(false);
        } catch (error) {
            setLoading(false);
            console.error("Error fetching product list:", error);
        }
    };
    async function fetchSimilerProducts(product) {
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
                (product) => product._id !== productId
            );

            setSimilarProducts(filteredProducts);

            setLoading(false);
        } catch (error) {
            setLoading(false);
            console.error("Error fetching products:", error);
        }
    }
    useEffect(() => {
        fetchProducts()
        fetchAverageReviews()
    }, [])
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

    async function addToCart(id, minOrderQty) {
        if (!isLoggedIn) {
            setPendingCartProductId(id);
            setMinimumOrderQuantity(minOrderQty);
            setOpenLogin(true);
            return;
        }

        try {
            setLoading(true);
            let user = JSON.parse(localStorage.getItem("user") || JSON.stringify({}));
            const endpoint = config.cartAdd;
            const data = { productId: id, userId: user._id, quantity: minOrderQty };
            const response = await postApi(endpoint, data);

            if (response.statusCode == 200 || response.statusCode == 201) {
                // setShowModal(true);
                router.push("/Employee-Portal/components/Employee-cart")
                setResponseTitle("Success");
                setResponseHeading("Congratulations");
                setResponseMessage("Product Added To Cart Successfully !!");
                setCartCount(response?.data.count);
                setLoading(false);

            }
        } catch (error) {
            setResponseTitle("Failed");
            setResponseHeading("Oops !!");
            setResponseMessage("Something went wrong");
            setLoading(false);
        } finally {
            setLoading(false);
        }
    }
    const fetchAverageReviews = async () => {
        try {
            const endpoint = config.GetReviewsRating;
            const data = {
                product_id: productId,
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

    const increaseQuantity = () => {
        setLoading(true);
        console.log("kk")
        if (quantity < products?.maxOrderQuantity) setQuantity(quantity + 1);
        setLoading(false);
    };
    const decreaseQuantity = () => {
        setLoading(true);
        if (quantity > products?.minOrderQuantity) setQuantity(quantity - 1);
        setLoading(false);
    };

    const handleCopyUrl = async () => {
        try {
            const currentUrl = `${window.location.origin}/Shop/product/${productId}`;
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
    async function addToCartSimilar(id) {
        try {
            const endpoint = config.cartAdd;
            const data = { productId: id, userId: userData._id, quantity: quantity };
            const response = await postApi(endpoint, data);
            console.log(response, "response add cart");
            if (response.statusCode == 200 || response.statusCode == 201) {
                console.log(response);
                setCartCount(response?.data.count);
                setShowModal(true);
                setResponseTitle("Success");
                setResponseHeading("Congratulations");
                setResponseMessage("Product Added To Cart Successfully !!");
                // alert("Added to cart")
            } else if (response.error) {
                setShowModal(true);
                setResponseTitle("Error");
                setResponseHeading("Oops");
                setResponseMessage(response.error);
            }
        } catch (error) {
            console.error("Error fetching categorylist:", error);
        }
    }
    return (
        <>
            {loading && <Loader />}
            <PractitionerHeader />
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
                                    <img src="images/toggle-icon.svg" alt="" width={24} />
                                </button>
                            </div>
                            <div className="row">
                                <div className="col-lg-7 mb-4 mb-lg-0">
                                    <div className="productSlider thumbMobile">
                                        <div className="pdtthumb">
                                            <div className="slider slider-nav">
                                                {products && products.additionalImages.length > 0 && products.additionalImages.map((image, index) =>
                                                    <div className="thumbnail-image" key={index}>
                                                        <div className="thumbImg">
                                                            <img src={`${process.env.NEXT_PUBLIC_API_URL}/${image}`} alt={products?.brand} />
                                                        </div>
                                                    </div>
                                                )}

                                            </div>
                                        </div>
                                        <div className="pdtMain">
                                            <div className="slider slider-for">
                                                <div>
                                                    <div className="slider-banner-image">
                                                        <img src={`${process.env.NEXT_PUBLIC_API_URL}/${products?.coverImage}`} alt={products?.brand} />
                                                    </div>
                                                </div>
                                            </div>
                                            {/* href="/Employee-Portal/components/Employee-cart" */}
                                            <div className="mt-3 px-md-2 justify-content-end text-end btnDiv">
                                                <a className="btn btn-primary " onClick={() =>
                                                    addToCart(products._id, products?.minOrderQuantity)
                                                }>
                                                    <img className="me-1" src="/images/landingpage/carticon.svg" width={16} />
                                                    Add To Cart
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                    {/* <div className="d-xl-flex mt-3 gap-2 px-md-3 btnmobile">
                                        <a href="shopping-cart.html" className="btn btn-primary w-50">
                                            <img className="me-1" src="/images/landingpage/carticon.svg" width={16} />
                                            Add To Cart
                                        </a>
                                    </div> */}
                                </div>
                                <div className="col-lg-5">
                                    <div className="productContent">
                                        <div className="d-md-flex justify-content-between">
                                            <div className="pdtyName">
                                                <h2>{products?.categoryName}</h2>
                                                <h3>{products?.productName}</h3>
                                                <div className="item_price mt-3">
                                                    <span>Price</span>
                                                    <strong> {products?.mrp > products?.price ? (
                                                        <>
                                                            <span
                                                                style={{
                                                                    textDecoration: "line-through",
                                                                    color: "#999",
                                                                    marginRight: "8px",
                                                                }}
                                                            >
                                                                ${products?.mrp}
                                                            </span>
                                                            <span style={{ color: "#662A09" }}>${products?.price}</span>
                                                        </>
                                                    ) : (
                                                        <span style={{ color: "#662A09", fontWeight: "bold" }}>
                                                            ${products?.price}
                                                        </span>
                                                    )}</strong>
                                                </div>
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
                                            </div>
                                            <div className="shareLink">
                                                <ul className="d-flex align-items-center gap-2">
                                                    <li className="me-2">Share:</li>
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
                                                    {/* <li>
                                                        <a href="">
                                                            <img src="images/facebook-circle-icon.svg" />
                                                        </a>
                                                    </li>
                                                    <li>
                                                        <a href="">
                                                            <img src="images/twitter-circle-icon.svg" />
                                                        </a>
                                                    </li>
                                                    <li>
                                                        <a href="">
                                                            <img src="images/pinterest-circle-icon.svg" />
                                                        </a>
                                                    </li>
                                                    <li>
                                                        <a href="">
                                                            <img src="images/copy-link.svg" />
                                                        </a>
                                                    </li> */}
                                                </ul>
                                            </div>
                                        </div>
                                        <div className="itemsDetail">
                                            <table className="table">
                                                <tbody>
                                                    <tr>
                                                        <th>Brand</th>
                                                        <td>{products?.brandName}</td>
                                                    </tr>
                                                    <tr>
                                                        <th>Item Weight</th>
                                                        <td>{products?.weight}</td>
                                                    </tr>
                                                    <tr>
                                                        <th>Item From</th>
                                                        <td>{products?.itemTypeName}</td>
                                                    </tr>
                                                    <tr>
                                                        <th>Ingredient</th>
                                                        <td>{products?.ingredients}</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                        <div className="aboutItems">
                                            <h4>About Item</h4>
                                            <p>
                                                {products?.product_description}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="productsInner similarProducts">


                    <div className="section-heading text-start mw-100 pb-3">


                        <h2>Similar Products</h2>


                    </div>

                    


                    {similarProducts && similarProducts.length > 0 ? (


                        <Slider {...settings} ref={sliderRef} className="productSlide">


                            {similarProducts.map((img, index) => (


                                <div key={index} onClick={() => router.push(`/Employee-Portal/components/Product/productDetails/${img._id}`)}>


                                    {console.log(similarProducts, "similarProducts")}


                                    <div


                                        className="journeyBox"


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


                                            <h3 className="text-brown fs-7 fw-medium">


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


                                                <button onClick={() => {


                                                    addToCartSimilar(img?._id);


                                                }} className="btn btn-primary">

                                                    Add To Cart


                                                </button>


                                            </div>


                                        </div>


                                    </div>


                                </div>


                            ))}


                        </Slider>


                    ) : (


                        <div className="text-center py-5 my-4">


                            <div className="no-products-message">


                                <svg 


                                    width="80" 


                                    height="80" 


                                    viewBox="0 0 24 24" 


                                    fill="none" 


                                    xmlns="https://qdegrees.icewarpcloud.in/teamchatapi/http.download?token=xoxp-f436e9f8991e747e2423c4d0fdfd257daea170fb2d25a6034b2abb70e9b35bdc&url=http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg"


                                    className="mx-auto mb-3"


                                    style={{ color: '#d1d5db' }}


                                >


                                    <path 


                                        d="M20 7L4 7M10 11L14 11M12 4V20M4 7L6 19C6 20.1046 6.89543 21 8 21H16C17.1046 21 18 20.1046 18 19L20 7M4 7L3 4H21L20 7" 


                                        stroke="currentColor" 


                                        strokeWidth="1.5" 


                                        strokeLinecap="round"


                                        strokeLinejoin="round"


                                    />


                                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>


                                </svg>


                                <h4 className="text-muted mb-2" style={{ color: '#6c757d', fontWeight: '500' }}>

                                    No Products Available


                                </h4>


                                <p className="text-secondary mb-0" style={{ color: '#9ca3af' }}>

                                    Check back later for similar products


                                </p>


                            </div>


                        </div>


                    )}


                </div>
                        </div>
                    </div>
                </div>
            </div>
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
        </>
    )
}