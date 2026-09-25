"use client";
import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { getApi, postApi } from "services/api";
import { config } from "services/config";
import { titleCase } from "services/common";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Loader from "services/Loader/page";
import DynamicModal3 from "services/Pop-ups/popup3/page";
import DynamicModal2 from "services/Pop-ups/popup2/page";
import { useLanguage } from "context/languageContext";
import LoginPopup from "services/Pop-ups/LoginPopup/page";
import "../../../LandingPage/public/css/style.css";

const AyurvedicProductsShopPage = () => {
  // ✅ add near top (same file)
const FILTERS_STORAGE_KEY = "shop:list:filters:v1";

  const router = useRouter();
  const [userData, setUserData] = useState({});
  const { isLoggedIn, login, logout, setCartCount } = useLanguage();
  const sliderSettings = {
    dots: true,
    arrows: false, 
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 2,
    autoplay: true,
    autoplaySpeed: 2000,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(false);
  const [responseTitle, setResponseTitle] = useState({});
  const [responseHeading, setResponseHeading] = useState({});
  const [responseMessage, setResponseMessage] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [openLogin, setOpenLogin] = useState(false);
  const [pendingCartProductId, setPendingCartProductId] = useState(null);
  const [minimumOrderQuantity, setMinimumOrderQuantity] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const endpoint = config.productByCategory;
      const response = await getApi(endpoint);

      console.log("products", response.data);
      setProducts(response.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error fetching product list:", error);
    }
  };

  useEffect(() => {
    if (isLoggedIn && pendingCartProductId) {
      addToCart(pendingCartProductId, minimumOrderQuantity);
      setPendingCartProductId(null);
    }
  }, [isLoggedIn, pendingCartProductId]);

const fetchCategories = async () => {
  setLoading(true);
  try {
    const endpoint = config.category;
    const data = { dropdown_type: "category", page: 1, pageSize: 20 };
    const response = await postApi(endpoint, data);

    // ✅ Filter only active categories (status = 1)
    const activeCategories = (response.result || []).filter(
      (cat) => cat.status === 1
    );

    setCategories(activeCategories);
    setLoading(false);
  } catch (error) {
    setLoading(false);
    console.error("Error fetching category list:", error);
  }
};

// ✅ replace your existing goToNextPage with this
const goToNextPage = (cat) => {
  // 👇 overwrite ALL saved filters with ONLY this category
  const onlyCategoryFilters = {
    page: 1,
    pageSize: 18,
    title: "",
    category: [cat._id],
    subcategory: [],
    brand: [],
    sortBy: "",
    sortOrder: "",
  };

  try {
    localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(onlyCategoryFilters));
  } catch (e) {
    console.warn("Failed to persist landing filters:", e);
  }

  setLoading(true);
  setTimeout(() => setLoading(false), 500);

  router.push(`/Shop/products?category=${cat._id}`);
};


  // async function addToCart(id) {
  //   try {
  //     if (isLoggedIn) {
  //       setLoading(true);
  //       const endpoint = config.cartAdd;
  //       const data = { productId: id, userId: userData._id, quantity: 1 };
  //       const response = await postApi(endpoint, data);
  //       console.log("Das");
  //       console.log(data.userId);
  //       console.log("DASda");
  //       console.log(response);
  //       if (response.statusCode == 200 || response.statusCode == 201) {
  //         setShowModal(true);
  //         setResponseTitle("Success");
  //         setResponseHeading("Congratulations");
  //         setResponseMessage("Product Added To Cart Successfully !!");
  //         setCartCount(response?.data.count);
  //       }
  //       setLoading(false);
  //     } else {
  //       setOpenLogin(true);
  //     }
  //   } catch (error) {
  //     setLoading(false);

  //     setResponseTitle("Failed");
  //     setResponseHeading("oop's !!");
  //     setResponseMessage("Something went wrong");
  //     // console.error("Error fetching categorylist:", error);
  //   }
  // }

  // UseEffect for fetching categories and products

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
        setShowModal(true);
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

  useEffect(() => {
    let user = JSON.parse(localStorage.getItem("user") || JSON.stringify({}));
    setUserData(user);
    fetchCategories();
    fetchProducts();
  }, []);

  const goToNextPage1 = (cat) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 500);
    router.push(`/Shop/product/${cat._id}`);
  };

  return (
  <>
    <div className="ayurvedicProducts">
      {loading && <Loader />}
      <div className="container-fluid">
        {categories &&
  categories.map((category, index) => {
    return (
      products[category["_id"]]?.products?.length > 0 && (
        <div className="productsInner mb-5 pb-4 border-bottom" key={category["_id"]}>

                 <div className="row align-items-center mb-4">
  {index % 2 === 0 ? (
    <>
      {/* Image Left */}
      <div className="col-md-7 col-lg-5">
        <figure className="mb-0">
          <img
            src={`${process.env.NEXT_PUBLIC_API_URL}/${category.file}`}
            alt="Ayurvedic Products" className="w-100"
          />
        </figure>
      </div>
      {/* Content Right */}
      <div className="col-md-5 col-lg-7">
        <div className="section-heading text-start pb-0 mw-100">
          <img src="/images/landingpage/watermark.png" width={40} alt="Watermark" />
          <h2 className="mb-3">{titleCase(category?.name)}</h2>
          <p className="mb-4 fs-6">{titleCase(category?.description)}</p>
          <button className="btn btn-primary" onClick={() => goToNextPage(category)}>
            Shop Now
          </button>
        </div>
      </div>
    </>
  ) : (
    <>
      {/* Content Left */}
      <div className="col-md-5 col-lg-6">
        <div className="section-heading text-start pb-0 mw-100">
          <img src="/images/landingpage/watermark.png" width={40} alt="Watermark" />
          <h2>{titleCase(category?.name)}</h2>
          <p className="mb-3">{titleCase(category?.description)}</p>
          <button className="btn btn-primary" onClick={() => goToNextPage(category)}>
            Shop Now
          </button>
        </div>
      </div>
      {/* Image Right */}
      <div className="col-md-7 col-lg-6">
        <figure className="mb-0">
          <img
            src={`${process.env.NEXT_PUBLIC_API_URL}/${category.file}`}
            alt="Ayurvedic Products" className="w-100"
          />
        </figure>
      </div>
    </>
  )}
</div>


               <Slider {...sliderSettings} className="productSlide bannerSlide">
  {products[category["_id"]]?.products
    ?.filter((product) => product.is_show) // ✅ show only those visible on landing page
    .map((product, index) => (
      <div key={index}>
        <div className="journeyBox">
          <div style={{ position: "relative" }}>
            <figure
              className="mb-1"
              onClick={() => goToNextPage1(product)}
              style={{ cursor: "pointer" }}
            >
              <img
                src={`${process.env.NEXT_PUBLIC_API_URL}/${product.coverImage}`}
                alt={product.brand}
              />
            </figure>
          </div>

          <div className="contentproduct">
            <span className="text-orange fs-8 pb-1">{product.brand}</span>
            <div className="d-flex justify-content-between align-items-baseline gap-2">
              <Link
                href={"/Shop/product/" + product._id}
                style={{ textDecoration: "none" }}
              >
                <h3 className="text-brown fs-7 fw-medium">
                  {titleCase(product.productName)}
                </h3>
              </Link>
              <b className="d-flex">
                {product?.mrp > product?.price ? (
                  <>
                    <span
                      style={{
                        textDecoration: "line-through",
                        color: "#999",
                        marginRight: "8px",
                      }}
                    >
                      ${product?.mrp}
                    </span>
                    <span style={{ color: "#662A09" }}>${product?.price}</span>
                  </>
                ) : (
                  <span style={{ color: "#662A09", fontWeight: "bold" }}>
                    ${product?.price}
                  </span>
                )}
              </b>
            </div>
            <hr />
            <button
              className="btn btn-primary fs-9"
              onClick={() =>
                addToCart(product._id, product?.minOrderQuantity)
              }
            >
              Add To Cart
            </button>
          </div>
        </div>
      </div>
    ))}
</Slider>

                </div>
              )
            );
          })}
      </div>
      <DynamicModal3
        show={showModal}
        onClose={() => setShowModal(false)}
        title={responseTitle || ""}
        heading={""}
        description={"Item has been added to cart" || ""}
        buttonText="Okay"
        onButtonClick={() => setShowModal(false)}
        showjson = {false}
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
    </div>

  
<style jsx>{`
  /* Fix: Prevent dots from overlapping product cards */
  :global(.ayurvedicProducts .bannerSlide .slick-dots) {
    position: relative !important;
    bottom: -15px !important; /* move below product cards */
  
  }

  /* Center align and remove unwanted background bleed */
  :global(.ayurvedicProducts .bannerSlide .slick-dots li) {
    margin: 0 6px !important;
  }

  /* remove unwanted dots  */
  :global(.ayurvedicProducts .bannerSlide .slick-dots li button:before) {
    content: '' !important;
  }
  

  /* Dot style (inactive) */
  :global(.ayurvedicProducts .bannerSlide .slick-dots li button) {
    width: 12px !important;
    height: 12px !important;
    border-radius: 50%;
    background-color: #ffb476 !important;
    border: none !important;
  }

  /* Dot style (active) */
  :global(.ayurvedicProducts .bannerSlide .slick-dots li.slick-active button) {
    background-color: #662A09 !important;
  }

 
`}</style>

</>
  );
};

export default AyurvedicProductsShopPage;
