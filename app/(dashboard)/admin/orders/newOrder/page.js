'use client';
import { useEffect, useState } from 'react';
import { useRouter } from "next/navigation";
import { useLanguage } from "context/languageContext";
import { Row, Col, Button } from 'react-bootstrap';
import Highcharts from 'highcharts';
// import HeaderWithDropdown from 'app/(landingpage)/LandingPage/components/HeaderWithDropdown/page';
// import FooterSection from 'app/(landingpage)/LandingPage/components/Footer/page';
// import 'app/(landingpage)/LandingPage/public/css/style.css';
import Loader from "services/Loader/page";
import Link from 'next/link';
import { postApi, getApi } from 'services/api';
import { titleCase } from "services/common";
import { config } from 'services/config';
import Swal from "sweetalert2";
// import PractitionerHeader from '../PractionerHeader/page';
import Pagination from 'services/pagination';
import DynamicModal3 from 'services/Pop-ups/popup3/page';
export default function EmployeeProduct() {
    // const { logout } = useLanguage();
    const { isLoggedIn, login, logout, setCartCount, shopCategory } = useLanguage();
    const [monthlyRevenue, setMonthlyRevenue] = useState([]);
    const [topServices, setTopServices] = useState([]);
    const [employee, setEmployee] = useState(null);
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [userData, setUserData] = useState({});
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const [brands, setBrands] = useState([]);
    const [responseMessage, setResponseMessage] = useState({})
    const [formData, setFormData] = useState({
        title:"",
        brand: "",
        category: "",
        subCategory: ""
    })
    const [pageSize] = useState(16)
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [showModal, setShowModal] = useState(false)
    const [responseTitle, setResponseTitle] = useState({});
    const [responseHeading, setResponseHeading] = useState("");
    const [responseDescription, setResponseDescription] = useState("");

    // useEffect(() => {
    //     const isLoggedIn = localStorage.getItem("loggedIn") === "true";
    //     const role = localStorage.getItem("userRole");
    //     if (!isLoggedIn || role !== "practitioner") router.push("/Log-in");
    // }, []);

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
    useEffect(() => {
        let user = JSON.parse(localStorage.getItem("user") || JSON.stringify({}));
        setUserData(user);
        fetchCategories();
        // fetchProducts();
        fetchBrands()

    }, []);
    useEffect(() => {
        filterProducts()
    }, [currentPage])
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

    async function addToCart(id, minOrderQty) {
        // if (!isLoggedIn) {
        //     setPendingCartProductId(id);
        //     setMinimumOrderQuantity(minOrderQty);
        //     setOpenLogin(true);
        //     return;
        // }

        try {
            setLoading(true);
            let user = JSON.parse(localStorage.getItem("user") || JSON.stringify({}));
            const endpoint = config.cartAdd;
            const data = { productId: id, userId: user._id, quantity: minOrderQty };
            const response = await postApi(endpoint, data);

            if (response.statusCode == 200 || response.statusCode == 201) {
                setShowModal(true);
                // router.push("/Employee-Portal/components/Employee-cart")
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

    const fetchBrands = async () => {
        const data = { dropdown_type: "brand", page: 1, pageSize: 20 };
        const res = await postApi(config.category, data);
        setBrands(res.result);
    };
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
    const fetchSubCategories = async (id) => {
        const res = await postApi(config.Getsubcategory, { category_id: id });
        setSubCategories(res.data);
    };

    const handleCategoryChange = (e) => {
        const val = e.target.value;
        setFormData({ ...formData, category: val, subCategory: "" });
        fetchSubCategories(val);
    };
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    }
    const clearFormData = () => {
        let filter = {
            brand: "",
            category: "",
            subCategory: "",
            title:""
        }
        setFormData(filter)
        setCurrentPage(1)
        filterProducts(filter)
    }

    async function filterProducts(clearFilter) {
        try {
            let filters = { ...formData, pageSize, page: currentPage }
            if (clearFilter) {
                filters = { ...filters, ...clearFilter }
            }
            console.log(clearFilter, "ttttttttt")
            const response = await postApi(config.product, filters);

            console.log(response.productsWithUrls, "kkkkkkkk");
            setProducts(response.productsWithUrls || []);
            setTotalPages(response.totalPages || 1);
            setTotalCount(response.totalCount || 0);
            setLoading(false);
        } catch (error) {
            setLoading(false);
            console.error("Error fetching products:", error);
        }
    }

    const handleCopyUrl = async (id) => {
        try {
            const url = `${window.location.origin}/Shop/product/${id}`;

            if (navigator.clipboard && window.isSecureContext) {
                // ✅ Secure context (HTTPS or localhost)
                await navigator.clipboard.writeText(url);
                alert("URL copied to clipboard!");
            } else {
                // ✅ Fallback for insecure context
                const textArea = document.createElement("textarea");
                textArea.value = url;
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
            alert("Failed to copy URL: ", err.message);
        }
    };
 const handleHeaderSearch = (searchValue) => {
    let filter = {
            brand: "",
            category: "",
            subCategory: "",
            title:searchValue
        }
        setFormData(filter)
        setCurrentPage(1)
        filterProducts(filter)
    // fetchProducts(searchValue);
  };
    return (
        <>
            {loading && <Loader />}
            {/* <PractitionerHeader onSearch={handleHeaderSearch} /> */}
                <div style={{display:"flex", alignItems:"center"}}>
                    <span style={{fontSize:"20px", fontWeight:"600", color:"#000", marginLeft:"13px", marginTop:"10px"}}>Product Listing Page</span>
                </div>
            <div className="profilesection " style={{ paddingTop: '20px' }}>
                <div className="container-fluid">
                    <div className="row">
                        
                        <div className="col-md-12 col-lg-12 ps-md-2 mb-3">
                            <div className="myaccoutToggle d-flex d-lg-none align-items-center gap-3 mb-3 w-100 justify-content-between">
                                <h3 className="fs-7 fw-semibold m-0">My Account</h3>
                                <button type="button" className="accToggle">
                                    <img src="images/toggle-icon.svg" alt="" width={24} />
                                </button>
                            </div>
                            <div className="itemList w-100">
                                <div className="topFilterGroup">
                                    <div className="row px-md-1">
                                        <div className=" col-lg-3 col-xl-2 px-md-2 mb-3 mb-lg-0">
                                            <select className="form-select fs-8"
                                                name="brand"
                                                value={formData.brand}
                                                onChange={handleInputChange}>
                                                <option selected="" hidden>Select Brand</option>
                                                {brands.map((brand, index) => (
                                                    <option key={index} value={brand._id} title={brand.name}>
                                                        {brand.name.length > 25
                                                            ? brand.name.slice(0, 25) + "..."
                                                            : brand.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="col-lg-4 col-xl-2 px-md-2 mb-3 mb-lg-0">
                                            <select className="form-select fs-8"
                                                name="category"
                                                value={formData.category} onChange={handleCategoryChange}>
                                                <option selected="" hidden>Select Categories</option>
                                                {categories && categories.length > 0 && categories.map((category, index) => (
                                                    <option key={index} value={category._id}>
                                                        {category.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="col-lg-2 col-xl-2 px-md-2 mb-3 mb-lg-0">
                                            <select className="form-select fs-8"
                                                name="subCategory"
                                                value={formData.subCategory}
                                                onChange={handleInputChange}>
                                                <option hidden>Select Sub-Category</option>
                                                {
                                                    subCategories.map((subCategory, index) => (
                                                        <option key={index} value={subCategory._id}>
                                                            {subCategory.name}
                                                        </option>
                                                    ))}
                                            </select>
                                        </div>
                                        <div className="col-lg-4 col-xl-3 px-md-2 mb-3 mb-lg-0">
                                            <input className="form-control fs-8"
                                                name="title"
                                                value={formData.title}
                                                placeholder='Enter Product Name'
                                                onChange={handleInputChange}>
                                            </input>
                                        </div>
                                        <div className="col-lg-12 col-xl-3 px-md-2 mt-0 mt-lg-3 mt-xl-0 d-flex justify-content-center gap-2">
                                            <button type="button" className="btn btn-primary fs-9 px-2" onClick={clearFormData}>
                                                Clear All
                                            </button>
                                            <button type="button" className="btn btn-success fs-9 px-2" onClick={() => filterProducts()}>
                                                Apply
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="row ">

                                    {
                                        // categories &&
                                        //     categories.map((category, index) => {
                                        //         return (
                                        // products[category["_id"]]?.
                                        products?.length > 0 ? products
                                            .map((product, index) => (
                                                <div className="col-md-6 col-lg-3 mb-4" key={index}>
                                                    {console.log(product, "product")}
                                                    <div className="journeyBox">
                                                        <figure className="mb-2 position-relative">
                                                            <a href={`/admin/orders/newOrder/productDetails/${product._id}`}>
                                                                <img src={`${process.env.NEXT_PUBLIC_API_URL}/${product.coverImage}`}
                                                                    alt={product.brand} width={230} height={250} />
                                                            </a>
                                                            <button type="button" className="shareBtn" onClick={() => handleCopyUrl(product?._id)}>
                                                                <img src="/images/landingpage/share-icon.svg" alt="" width={30} />
                                                            </button>
                                                        </figure>
                                                        <div className="contentproduct">
                                                            <span className="text-orange fs-7 pb-1 text-ellipsis-2">{product.brand}</span>{" "}
                                                            <a href={`/admin/orders/newOrder/productDetails/${product._id}`}>
                                                                <h3
                                                                    className="text-brown fs-7 fw-semibold "
                                                                    data-bs-toggle="tooltip"
                                                                    data-bs-title="Amalaki Powder"
                                                                >
                                                                    {titleCase(product.productName)}
                                                                </h3>
                                                            </a>
                                                            <hr />
                                                            <div className="d-flex justify-content-between align-items-baseline">
                                                                <b className="text-success">
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
                                                                <button onClick={() => addToCart(product._id, product.minOrderQuantity)} className="btn btn-primary">
                                                                    Add To Cart
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>)):<div className="col-md-6 col-lg-4 mb-4" >No Products Found</div>
                                    }
                                    {/* )
                                        } */}
                                    {/* ) */}
                                    {/* } */}
                                  
                                </div>
                                <>
                                    <div style={{ display: "flex", justifyContent: "center" }}>
                                        {totalCount > 12 && ( // 👈 only show pagination if more than 1 page
                                            <Pagination
                                                totalProducts={totalCount}
                                                currentPage={currentPage}
                                                pageSize={16}
                                                onPageChange={(page) => setCurrentPage(page)}
                                            />
                                        )}
                                    </div>
                                </>
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

            <style>{`
            .topFilterGroup {
    background: #F9FAFC 0% 0% no-repeat padding-box;
    box-shadow: 0px 0px 6px #00000029;
    border-radius: 6px;
    padding: 10px;
    margin-bottom: 20px;
    }
    .itemList .journeyBox {
    background: #F5FCFF;
    box-shadow: 0px 0px 6px #00000029;
    padding: 10px;
    }

    .shareBtn {
    position: absolute;
    top: 0;
    right: 0;
    background: none;
    border: none;
    padding: 0;
    z-index: 1;
}
`}</style>
        </>
    )
}