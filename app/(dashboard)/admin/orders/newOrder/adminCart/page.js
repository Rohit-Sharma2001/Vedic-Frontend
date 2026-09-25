'use client'
import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { titleCase } from "services/common";
import { config } from 'services/config';
import Swal from "sweetalert2";
// import 'app/(landingpage)/LandingPage/public/css/style.css';
import Loader from "services/Loader/page";
import { useRouter } from "next/navigation";
import { postApi } from "services/api";
import { useLanguage } from "context/languageContext";
// import PractitionerHeader from '../PractionerHeader/page';


export default function EmeployeePortal() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const [products, setProducts] = useState([])
    const [userData, setUserData] = useState()
    const { isLoggedIn, login, logout, setCartCount, shopCategory } = useLanguage();

    useEffect(() => {
        let user = JSON.parse(localStorage.getItem("user") || JSON.stringify({}));
        setUserData(user)
        getCart(user)
    }, [])
    async function getCart(user) {
        try {
            setLoading(true)
            const endpoint = config.getCart;
            const data = {
                // page: 1,
                user: user._id,
                // pageSize: 10,
                // product: id,
                // selected: 1,
            };
            const response = await postApi(endpoint, data);
            setLoading(false)
            if (response.statusCode == 200 || response.statusCode == 201) {
                console.log(response.data, "response.data")
                setCartCount(response?.totalCount)
                setProducts(response.data);
            }
        } catch (error) {
            console.error("Error fetching categorylist:", error);
        }
    }
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
                setCartCount(response?.count)
            } else if (response.message){
                alert(response.message)
            }else if (response.error) {
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
            console.log(response,"remove")
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
    function getImageUrl(url) {
        const correctedUrl = url?.replace(/\\/g, "/");
        return `${process.env.NEXT_PUBLIC_API_URL}/${correctedUrl}`
    }
    const goToNextPage = (cat) => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
        }, 500);
        router.push(`/Employee-Portal/components/Product/productDetails/${cat._id}`);
    };

    return (
        <>
            {loading && <Loader />}
            {/* <PractitionerHeader/> */}
            <div className="profilesection " style={{ paddingTop: '40px' }}>
                <div className="container-fluid">
                    <div className="row">
                        {/* <div className="col-md-4 col-lg-3">
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
                        </div> */}
                        <div className="col-md-12 col-lg-12 ps-md-2 mb-3">
                            <div className="myaccoutToggle d-flex d-lg-none align-items-center gap-3 mb-3 w-100 justify-content-between">
                                <h3 className="fs-7 fw-semibold m-0">My Account</h3>
                                <button type="button" className="accToggle">
                                    <img src="images/toggle-icon.svg" alt="" width={24} />
                                </button>
                            </div>
                            <h6 className="fw-semibold mb-3">Shopping Cart</h6>
                            <div className="table-responsive tableDiv ">
                                <table className="table">
                                    <tbody>
                                        <tr>
                                            <th className="" />
                                            <th className="">PRODUCT</th>
                                            <th className="text-center"> PRICE</th>
                                            <th className="text-center"> QTY</th>
                                            <th className="text-center"> TOTAL PRICE</th>
                                            <th className="text-center" />
                                        </tr>
                                        {products && products?.length > 0 && products.map((pro, index) =>

                                            <tr key={index}>
                                                <td className="text-center">
                                                    <div className="cstmCheckbox">
                                                        {/* <input type="checkbox" id="termCheck" defaultChecked="" />
                                                    <label htmlFor="termCheck" /> */}
                                                    </div>
                                                </td>
                                                <td>
                                                    {pro?.type=='appointment'?  <div className="productTable d-flex align-items-center gap-3">
                                                        <figure className="m-0" style={{ cursor: "pointer" }}
                                                            onClick={() => goToNextPage(pro?.productDetails)} >
                                                            {/* <img src={`${getImageUrl(pro.productDetails?.coverImage)}`} alt="Product" width={80} height={80} /> */}
                                                        </figure>
                                                        {/* <div className="">
                                                            <h6>{pro?.appointmentDetails?.employee.firstName || ""}</h6>
                                                            <span className="">
                                                                {pro?.appointmentDetails?.service?.serviceName || ""} 
                                                                <b className="d-block">Brand: {pro?.productDetails?.brand_name}</b>
                                                            </span>
                                                        </div> */}
                                                        <div className="appointment-info">
    <div><strong>Service:</strong> {pro?.appointmentDetails?.service?.serviceName || "-"}</div>

    <div>
        <strong>Client:</strong> {userData?.firstName} {userData?.lastName}
        {userData?.email && ` (${userData.email})`}
    </div>

  
    <div>
        <strong>Employee:</strong>{" "}
        {`${pro?.appointmentDetails?.employee?.firstName || ""} ${pro?.appointmentDetails?.employee?.lastName || ""}`}
    </div>
    <div>
    <strong>Appointment Date:</strong>{" "}
    {pro?.appointmentDetails?.appointmentDate
        ? new Date(pro.appointmentDetails.appointmentDate).toLocaleDateString(
              "en-US",
              {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
              }
          )
        : "-"}
</div>

    <div>
        <strong>appointmentTime:</strong>{" "}
        {pro?.appointmentDetails?.appointmentTime }
    </div>
</div>              </div>
                                                    :
                                                    
                                                    <div className="productTable d-flex align-items-center gap-3">
                                                        <figure className="m-0" style={{ cursor: "pointer" }}
                                                            onClick={() => goToNextPage(pro?.productDetails)} >
                                                            <img src={`${getImageUrl(pro.productDetails?.coverImage)}`} alt="Product" width={80} height={80} />
                                                        </figure>
                                                        {/* <div className="">
                                                            <h6>{pro?.productDetails?.category_name || ""}</h6>
                                                            <span className="">
                                                                {pro?.productDetails?.productName || ""} <b className="d-block">Brand: {pro?.productDetails?.brand_name}</b>
                                                            </span>
                                                        </div> */}
                                                        <div className="product-info">
                                                            <h6 className="text-truncate">
                                                                {pro?.productDetails?.category_name || ""}
                                                            </h6>

                                                            <span className="product-name text-truncate">
                                                                {pro?.productDetails?.productName || ""}
                                                            </span>

                                                            <b className="brand-name text-truncate d-block">
                                                                Brand: {pro?.productDetails?.brand_name}
                                                            </b>
                                                        </div>
                                                    </div>}
                                                </td>
                                                <td className="fw-semibold text-center">
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
                                                            ${pro?.productDetails?.price||pro?.appointmentDetails?.service?.price}
                                                        </span>
                                                    )}
                                                </td>
                                                {/* <td className="text-center">
                                                <div className="cartaddMain" >
                                                    <button className="btn cartBtn" 
                                                        style={{ borderColor: 'transparent' }}
                                                    >
                                                        <img src="/images/landingpage/cart-add-icon.svg"
                                                            alt="add"
                                                            width={20}
                                                            height={20} />
                                                    </button>
                                                    <input  style={{ borderColor: 'transparent' }}
                                                        //  type="text" defaultValue={1}
                                                        type="text"
                                                        value={1}
                                                        readOnly
                                                    />
                                                    <button className="btn cartBtn"
                                                        style={{ borderColor: 'transparent' }}>
                                                        <img
                                                            src="/images/landingpage/cart-remove-icon.svg"
                                                            alt=""
                                                            width={20}
                                                        />
                                                    </button>
                                                </div>
                                            </td> */}
                                                <td className="text-center">
                                                    <div className="cartaddMain">
                                                        {pro?.type!=='appointment'&&<button
                                                            className="btn cartBtn"
                                                            disabled={pro.quantity >= pro?.productDetails?.maxOrderQuantity}
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
                                                        </button>}

                                                        <input
                                                            type="text"
                                                            className="text-center m-2"
                                                            value={pro?.quantity}
                                                            style={{ width: 20, height: 20, outline: 'none', border: 'none' }}
                                                            readOnly
                                                        />

                                                        {pro?.type!=='appointment'&&<button
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
                                                        </button>}
                                                    </div>
                                                </td>
                                                <td className="text-success fw-semibold text-center">${(pro?.productDetails?.price * pro?.quantity)||pro?.appointmentDetails?.service?.price}</td>
                                                <td className="text-center" onClick={() => { removeItem(pro._id, index) }} style={{ cursor: 'pointer' }}><span className="removeBtn">Remove</span></td>

                                            </tr>)}
                                        {/* <tr>
                                            <td className="text-center">
                                                <div className="cstmCheckbox">
                                                    <input type="checkbox" id="termCheck1" defaultChecked="" />
                                                    <label htmlFor="termCheck1" />
                                                </div>
                                            </td>
                                            <td>
                                                <div className="productTable d-flex align-items-center gap-3">
                                                    <figure className="m-0">
                                                        <img src="./images/anantmool-powder-img.jpg" alt="" />
                                                    </figure>
                                                    <div className="">
                                                        <h6>Anantmool Powder</h6>
                                                        <span className="">
                                                            Rasa Herbs <b className="d-block">Brand: Swanson</b>
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="fw-semibold text-center">$15.00</td>
                                            <td className="text-center">
                                                <div className="cartaddMain">
                                                    <button className="btn cartBtn">
                                                        <img src="images/cart-add-icon.svg" alt="" width={20} />
                                                    </button>
                                                    <input type="text" defaultValue={2} />
                                                    <button className="btn cartBtn">
                                                        <img
                                                            src="images/cart-remove-icon.svg"
                                                            alt=""
                                                            width={20}
                                                        />
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="text-success fw-semibold text-center">$15.00</td>
                                            <td className="text-center">
                                                <a href="" className="removeBtn">
                                                    Remove
                                                </a>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="text-center">
                                                <div className="cstmCheckbox">
                                                    <input type="checkbox" id="termCheck2" defaultChecked="" />
                                                    <label htmlFor="termCheck2" />
                                                </div>
                                            </td>
                                            <td>
                                                <div className="productTable d-flex align-items-center gap-3">
                                                    <figure className="m-0">
                                                        <img src="./images/brahmi-powder-img.jpg" alt="" />
                                                    </figure>
                                                    <div className="">
                                                        <h6>Brahmi (Gotu Kola) Powder</h6>
                                                        <span className="">
                                                            Rasa Herbs <b className="d-block">Brand: Swanson</b>
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="fw-semibold text-center">$15.00</td>
                                            <td className="text-center">
                                                <div className="cartaddMain">
                                                    <button className="btn cartBtn">
                                                        <img src="images/cart-add-icon.svg" alt="" width={20} />
                                                    </button>
                                                    <input type="text" defaultValue={1} />
                                                    <button className="btn cartBtn">
                                                        <img
                                                            src="images/cart-remove-icon.svg"
                                                            alt=""
                                                            width={20}
                                                        />
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="text-success fw-semibold text-center">$30.00</td>
                                            <td className="text-center">
                                                <a href="" className="removeBtn">
                                                    Remove
                                                </a>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td colSpan={4} className="text-end">
                                                <h6 className="m-0">Sub Total (3 Items)</h6>
                                            </td>
                                            <td className="text-center">
                                                <span className="fw-semibold">$60.00</span>
                                            </td>
                                            <td className="text-start"></td>
                                        </tr> */}
                                    </tbody>
                                </table>
                            </div>
                            <div className="d-flex flex-wrap align-items-center justify-content-center gap-3 shoppingCardBtn">
                                <Link href="/admin/orders/newOrder" className="btn btn-shopping bg-white">
                                    &lt; Continue Shopping
                                </Link>
                                {products&&products.length>0&&<Link href="/admin/orders/newOrder/ShopPayment" className="btn btn-shopping">
                                    Proceed to Buy
                                </Link>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <style>{`
            .fw-semibold {
    font-weight: 600 !important;
}
    .table-responsive {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
}
    .tableDiv tr th, .tableDiv tr td {
    padding: 16px;
    font-size: 13px !important;
    vertical-align: middle;
    background-color
Sets the background color of an element.

Widely available across major browsers (Baseline since January 2018)
Learn more

Don't show
: transparent;
    white-space: nowrap;
}
    .tableDiv .cstmCheckbox {
    position: relative;
    top: -14px;
}
    .productTable img {
    width: 80px;
    max-width: 80px;
    height: 60px;
    object-fit: cover;
    border-radius: 6px;
}
    .product-info {
    max-width: 220px;
    min-width: 220px;
}
    .product-info h6 {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
    .productTable span {
    font-size: 12px;
    font-weight: 600;
}
    .product-name, .brand-name, .product-info h6 {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
    .tableDiv tr th, .tableDiv tr td {
    padding: 16px;
    font-size: 13px !important;
    vertical-align: middle;
    background-color: transparent;
    white-space: nowrap;
}
    .removeBtn {
    color: #E84B4B !important;
    text-decoration: underline;
    font-size: 13px;
}
    .btn-shopping.bg-white {
    background-color: #fff !important;
    border: 1px solid #D3D3D3;
    color: #000 !important;
}
    .btn-shopping {
    background-color: #662A09 !important;
    padding: 9px 10px;
    color: #fff !important;
    font-size: 13px;
    width: 100%;
    border-radius: 100px;
    border: 1px solid transparent;
}
            `}</style>

        </>
    );
}
