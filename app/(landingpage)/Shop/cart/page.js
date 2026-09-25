// components/ShoppingCartPage.jsx

"use client";
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Loader from 'services/Loader/page';
import HeaderWithDropdown from 'app/(landingpage)/LandingPage/components/HeaderWithDropdown/page';
// import SubHeader from 'app/(landingpage)/LandingPage/components/SubHeader/page';
import FooterSection from 'app/(landingpage)/LandingPage/components/Footer/page';
import '../../LandingPage/public/css/style.css';
import Pagination from 'services/pagination';
import { postApi } from 'services/api';
import { config } from 'services/config';
import { useRouter } from 'node_modules/next/navigation';
import { useLanguage, isLoggedIn } from 'context/languageContext';
import LoginPopup from "services/Pop-ups/LoginPopup/page";

export default function ShoppingCartPage() {
  let router = useRouter()
  const [userData, setUserData] = useState({})
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([])
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  // const [selectedProducts, setSelectedProducts] = useState([]);
  const { isLoggedIn, login, logout, setCartCount } = useLanguage();
  // const isAnyProductSelected = products.some(item => item.selected);

  async function getCart(user) {
    console.log(user, "getCart user")
    if (user) {
      try {
        const endpoint = config.getCart;
        setLoading(true)
        const data = { page: currentPage, user: user?._id };
        const response = await postApi(endpoint, data);
        console.log(data, "getcart data payload")
        setLoading(false)
        if (response.statusCode == 200 || response.statusCode == 201) {
          console.log(response.data)
          setProducts(response.data)
          setTotalCount(response.totalCount)
        }

      } catch (error) {
        console.error("Error fetching categorylist:", error);
      }
    } else {
      const userCart = JSON.parse(localStorage.getItem("cartItems")) || [];
      if (userCart.length > 0) {
        try {
          const endpoint = config.findUserCartForNonLogin;
          setLoading(true)
          const data = { productIds: userCart.map(e => { return e.productId }) };
          const response = await postApi(endpoint, data);
          console.log(data, "getcart data payload")
          setLoading(false)
          if (response.statusCode == 200 || response.statusCode == 201) {
            console.log(response.data)
            const cartMap = new Map(
              userCart.map(item => [item.productId, item.quantity])
            );

            const updatedData = response.data.map(product => ({
              ...product,
              quantity: cartMap.get(product.productId) || 0
            }));
            setProducts(updatedData)
            setTotalCount(response.totalCount)
          }

        } catch (error) {
          console.error("Error fetching categorylist:", error);
        }
      }
    }
  }

  const goToNextPage = (cat) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 500);
    router.push(`/Shop/product/${cat._id}`);
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
      getCart()
      console.warn("No user found in localStorage");
    }
  }, []);

  useEffect(() => {
    if (userData?._id) {
      getCart(userData);
    } else {
      getCart();
    }
  }, [currentPage]);



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
        setCartCount(response?.data.count);
      }else if (response.message){
        alert(response.message)
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
        setCartCount(response?.count)
        getCart(userData)
      }

    } catch (error) {
      console.error("Error fetching categorylist:", error);
    }
  }


  // function handleCheckboxChange(ind, event) {
  //   let temp = [...products]
  //   temp[ind].selected = event.target.checked ? 1 : 0
  //   setProducts(temp)
  // }

  async function navTopayment() {
    if (isLoggedIn) {
      const allIds = products.map((ele) => ele._id);

      setLoading(true)
      let user = JSON.parse(localStorage.getItem("user") || JSON.stringify({}))
      const endpoint = config.selectItems;
      const data = { ids: allIds, user: user?._id };
      const response = await postApi(endpoint, data);
      console.log(response)
      setLoading(false)
      if (response.statusCode == 200 || response.statusCode == 201) {
        router.push('/Shop/payment/cart');
      }
    } else {
      setShowLoginPopup(true)
    }
  }

  // const selectedCount = products.reduce(
  //   (total, item) => (item.selected ? total + 1 : total),
  //   0
  // );

  return (
    <>
      <HeaderWithDropdown />
      {/* <SubHeader topPosition={80} /> */}
      <div className="cartMain">
        {loading && <Loader />}
        <div className="container-fluid">
          <div className="breadcrumbGroup">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">


                <Link href={"/"} style={{ textDecoration: 'none' }}>Home</Link>

              </li>
              <li className="breadcrumb-item">
                <Link href={'/Shop'} style={{ textDecoration: 'none' }}>Shop</Link>
              </li>

              <li className="breadcrumb-item active">
                Cart
              </li>
            </ol>
          </div>

          <h6 style={{ fontWeight: '600', marginBottom: '1rem', fontSize: '1rem' }}>Shopping Cart</h6>

          <div className="row tablePd">
            <div className="col-md-8 col-lg-9 mb-3">
              {products && products.length > 0 ?
                <div className="table-responsive tableDiv">
                  <table className="table">
                    <thead>
                      <tr>
                        {/* <th></th> */}
                        <th style={{ color: 'black' }}>PRODUCT</th>
                        <th style={{ color: 'black' }} className="text-center">PRICE</th>
                        <th style={{ color: 'black' }} className="text-center">QTY</th>
                        <th style={{ color: 'black' }} className="text-center">TOTAL PRICE</th>
                        <th style={{ color: 'black' }} className="text-center"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {console.log("produtsc", products)}
                      {products && products.map((pro, index) => (
                        <tr key={index}>
                          {/* <td className="text-center">
                            <div className="cstmCheckbox">

                              <input
                                type="checkbox"
                                id={`termCheck${index}`}
                                checked={pro?.selected}
                                onChange={(event) => handleCheckboxChange(index, event)}

                              />
                              <label htmlFor={`termCheck${index}`}></label>
                            </div>
                          </td> */}
                          <td>
                            <div className="productTable d-flex align-items-center gap-3">
                              <figure className="m-0" style={{ cursor: "pointer" }}
                                onClick={() => goToNextPage(pro?.productDetails)} >
                                <img src={`${getImageUrl(pro.productDetails?.coverImage)}`} alt="Product" width={80} height={80} />
                              </figure>
                              <div>
                                <h6 style={{ cursor: "pointer" }}
                                  onClick={() => goToNextPage(pro?.productDetails)}
                                >{pro?.productDetails?.productName}</h6>
                                <span>{pro?.productDetails?.category_name}<b className="d-block">Brand: {pro?.productDetails?.brand_name}</b></span>
                              </div>
                            </div>
                          </td>
                          {console.log(pro)}
                          <td className="fw-semibold text-center" style={{ fontWeight: "600" }}>
                            {pro?.productDetails?.mrp > pro?.productDetails?.price ? (
                              <>
                                <span
                                  style={{
                                    textDecoration: "line-through",
                                    color: "#999",
                                    marginRight: "8px",
                                  }}
                                >
                                  ${pro?.productDetails?.mrp}
                                </span>
                                <span style={{ color: "#662A09", fontWeight: "600" }}>
                                  ${pro?.productDetails?.price}
                                </span>
                              </>
                            ) : (
                              <span style={{ color: "#662A09", fontWeight: "600" }}>
                                ${pro?.productDetails?.price}
                              </span>
                            )}
                          </td>

                          <td className="text-center">
                            <div className="cartaddMain">
                              <button
                                className="btn cartBtn"
                                disabled={pro.quantity >= pro.productDetails?.maxOrderQuantity}
                                style={{ borderColor: 'transparent' }}

                                onClick={() => {
                                  if (pro.quantity < pro.productDetails?.maxOrderQuantity) {
                                    addToCart(pro.productId, 1, index);
                                  }
                                }}
                              >
                                <img
                                  src="/images/landingpage/cart-add-icon.svg"
                                  alt="Add"
                                  width={20}
                                  height={20}
                                />
                              </button>

                              <input
                                type="text"
                                value={pro?.quantity}
                                readOnly
                              />

                              <button
                                className="btn cartBtn"
                                disabled={pro.quantity <= pro.productDetails?.minOrderQuantity}
                                style={{ borderColor: 'transparent' }}

                                onClick={() => {
                                  if (pro.quantity > pro.productDetails?.minOrderQuantity) {
                                    addToCart(pro.productId, -1, index);
                                  }
                                }}
                              >
                                <img
                                  src="/images/landingpage/cart-remove-icon.svg"
                                  alt="Remove"
                                  width={20}
                                  height={20}
                                />
                              </button>
                            </div>
                          </td>
                          <td className="text-success fw-semibold text-center">${pro?.productDetails?.price * pro?.quantity }</td>
                          <td className="text-center" onClick={() => { removeItem(pro._id, index) }} style={{ cursor: 'pointer' }}><span className="removeBtn">Remove</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* <div style={{ display: "flex", justifyContent: "center" }}>
                    <Pagination totalProducts={totalCount} currentPage={currentPage} pageSize={6} onPageChange={(page) => setCurrentPage(page)} />


                  </div> */}

                </div>
                : <div className="text-center py-5">
                  <h2 className="mb-3">Your Cart is Empty !</h2>
                  <p className="mb-4">Looks like you haven’t added anything yet. Let’s fix that!</p>
                  <Link href="/Shop" className="navbar-brand p-0">
                    <button className="btn btn-primary">
                      🛍️ Start Shopping
                    </button>
                  </Link>
                </div>
              }
            </div>

            <div className="col-md-4 col-lg-3 mb-3">
              <div className="totalMain">

                <div className="d-flex justify-content-between align-items-center">
                  {/* ({products.length} {products.length > 1 ? 'Items' : 'Item'}) */}
                  {/* <h6 className="m-0">Sub Total ({selectedCount} {selectedCount === 1 ? "Item" : "Items"})
                  </h6>
                  <span style={{ color: 'black' }}>
                    ${products.reduce((total, item) => {
                      return item.selected ? total + item.quantity * item.productDetails?.price : total;
                    }, 0)}
                  </span> */}
                  <h6 className="m-0">
                    Sub Total ({products.length} {products.length === 1 ? "Item" : "Items"})
                  </h6>
                  <span style={{ color: "black" }}>
                    ${products.reduce((total, item) => total + item.quantity * item.productDetails?.price, 0)}
                  </span>

                </div>
                <hr />
                <div className="d-flex flex-column align-items-center gap-3">
                  {products && products.length > 0 &&
                    // <button
                    //   onClick={navTopayment}
                    //   className="btn-shopping d-flex flex-column align-items-center"
                    //   disabled={!isAnyProductSelected}
                    //   style={{ cursor: isAnyProductSelected ? 'pointer' : 'not-allowed', opacity: isAnyProductSelected ? 1 : 0.6 }}
                    // >
                    //   Proceed to Buy
                    // </button>
                    <button
                      onClick={navTopayment}
                      className="btn-shopping d-flex flex-column align-items-center"
                    >
                      Proceed to Buy
                    </button>

                  }
                  {/* <Link href={"/Shop/products"}><button className="btn btn-shopping bg-white">&lt; Continue Shopping</button></Link> */}
                  <Link href={"/Shop/products"} className=" btn-shopping bg-white d-flex flex-column align-items-center text-decoration-none" >&lt; Continue Shopping</Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
      <FooterSection />
      <LoginPopup
        show={showLoginPopup}
        onClose={() => setShowLoginPopup(false)}
        title="Login Required"
        heading="Please Login"
        description="You need to be logged in to make a donation."
        buttonText="Continue"
        onButtonClick={() => setShowLoginPopup(false)}
      />
    </>
  );
}
