"use client";
import React, { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { config } from "services/config";
import { postApi } from "services/api";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import HeaderWithDropdown from "app/(landingpage)/LandingPage/components/HeaderWithDropdown/page";
// import SubHeader from "app/(landingpage)/LandingPage/components/SubHeader/page";
import FooterSection from "app/(landingpage)/LandingPage/components/Footer/page";
import "../../LandingPage/public/css/style.css";
import Loader from "services/Loader/page";
import DynamicModal3 from "services/Pop-ups/popup3/page";
import Pagination from "services/pagination";
import { useLanguage } from "context/languageContext";
import DynamicModal from "services/Pop-ups/popup1/page";
import DynamicModal2 from "services/Pop-ups/popup2/page";
import LoginPopup from "services/Pop-ups/LoginPopup/page";
import { usePathname } from "next/navigation";
import { useRef } from "react";
// 1) Add below your imports (keep JS):
const FILTERS_STORAGE_KEY = "shop:list:filters:v1";

const getDefaultFilters = (categoryId) => ({
  page: 1,
  pageSize: 18,
  title: "",
  category: categoryId ? [categoryId] : [],
  subcategory: [],
  brand: [],
  sortBy: "",
  sortOrder: "",
});

function loadSavedFilters(categoryId) {
  if (typeof window === "undefined") return getDefaultFilters(categoryId);
  try {
    const raw = window.localStorage.getItem(FILTERS_STORAGE_KEY);
    if (!raw) return getDefaultFilters(categoryId);
    const parsed = JSON.parse(raw);
    // merge with defaults to avoid missing keys across versions
    const merged = { ...getDefaultFilters(categoryId), ...parsed };
    
    // Special handling for categories: merge instead of overwrite
    if (categoryId) {
      const savedCategories = Array.isArray(parsed.category) ? parsed.category : [];
      const urlCategory = categoryId;
      
      // If URL has a category and it's not in saved categories, add it
      if (!savedCategories.includes(urlCategory)) {
        merged.category = [...savedCategories, urlCategory];
      } else {
        merged.category = savedCategories;
      }
    } else {
      // No category in URL, use saved categories
      merged.category = Array.isArray(parsed.category) ? parsed.category : [];
    }
    
    return merged;
  } catch {
    return getDefaultFilters(categoryId);
  }
}

const ProductListing = () => {
  const { isLoggedIn, login, logout, setCartCount, shopCategory } = useLanguage();
  const searchParams = useSearchParams();
  const categoryFromQuery = searchParams.get('category') || null;
  const category = shopCategory
const pathname = usePathname();

const didRestoreRef = useRef(false);
const previousCategoryRef = useRef(null);
const justClearedRef = useRef(false);
  const [activeFilter, setActiveFilter] = useState({
    categories: false,
    brands: false,
  });
  const [products, setProducts] = useState([]);
  const [userData, setUserData] = useState({});

  const [pageSize, setPageSize] = useState(10);
  const [subcategories, setSubcategories] = useState([]);

  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [responseTitle, setResponseTitle] = useState({});
  const [responseHeading, setResponseHeading] = useState({});
  const [responseMessage, setResponseMessage] = useState({});
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [categories, setCategories] = useState([]);
  const [breadcrumnb, setBreadcrumnb] = useState([]);
  const [brands, setBrands] = useState([]);
  const [currentUrl, setCurrentUrl] = useState("");
  const [openLogin, setOpenLogin] = useState(false);
  const [pendingCartProductId, setPendingCartProductId] = useState(null);
  const [minimumOrderQuantity, setMinimumOrderQuantity] = useState(null);

  
  // 2) Replace your current initial states for filters/sortValue/title with these:

// keep other useStates as-is...
const initialCategory = categoryFromQuery || shopCategory || null;

const [filters, setFilters] = useState(() => loadSavedFilters(initialCategory));
// const [filters, setFilters] = useState(() => loadSavedFilters(shopCategory));

const [sortValue, setSortValue] = useState(() =>
  JSON.stringify({
    order: filters.sortOrder || "desc",
    key: filters.sortBy || "buy_count",
  })
);

const [title, setTitle] = useState(filters.title || "");


useEffect(() => {
  const catId = categoryFromQuery || shopCategory;
  if (!catId) {
    previousCategoryRef.current = null;
    return;
  }

  // Don't auto-add category if filters were just cleared by user
  if (justClearedRef.current) {
    return;
  }

  // Check if this is a new category (different from previous)
  const isNewCategory = previousCategoryRef.current !== catId;
  
  // First pass: ensure the category from URL is included in filters
  if (!didRestoreRef.current) {
    didRestoreRef.current = true;
    previousCategoryRef.current = catId;
    
    // On first pass, check if the category from URL is already in restored filters
    setFilters(prev => {
      const currentCategories = Array.isArray(prev.category) ? prev.category : [];
      
      // If category is already selected, no change needed
      if (currentCategories.includes(catId)) {
        return prev;
      }
      
      // Add the category from URL to existing categories
      return {
        ...prev,
        category: [...currentCategories, catId],
        subcategory: [], // Clear subcategories when adding new category
        page: 1
      };
    });
    return;
  }

  // Subsequent passes: only update if category changed
  if (isNewCategory) {
    previousCategoryRef.current = catId;
    
    setFilters(prev => {
      const currentCategories = Array.isArray(prev.category) ? prev.category : [];
      
      // If category is already selected, keep it as is (no change needed)
      if (currentCategories.includes(catId)) {
        return prev;
      }
      
      // Add the new category to existing categories instead of replacing
      return { 
        ...prev, 
        category: [...currentCategories, catId], 
        subcategory: [], // Clear subcategories when adding new category
        page: 1 
      };
    });
  }
}, [categoryFromQuery, shopCategory]);

// 3) Persist filters whenever they change (new effect):
useEffect(() => {
  try {
    window.localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(filters));
    // Reset the cleared flag after filters are updated and persisted
    if (justClearedRef.current) {
      justClearedRef.current = false;
    }
  } catch (e) {
    console.warn("Failed to persist filters:", e);
  }
}, [filters]);

// 4) Keep sort dropdown in sync with restored filters (new effect):
useEffect(() => {
  if (filters.sortBy && filters.sortOrder) {
    setSortValue(JSON.stringify({ order: filters.sortOrder, key: filters.sortBy }));
  }
  // keep search box in sync too
  if (typeof filters.title === "string") {
    setTitle(filters.title);
  }
}, [filters.sortBy, filters.sortOrder, filters.title]);


  useEffect(() => {
    setFilters({ ...filters, page: currentPage });
  }, [currentPage]);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (typeof window !== "undefined") {
      setCurrentUrl(window.location.href);
    }
  }, []);

// replace your existing fetchSubcategories with a memoized version
const fetchSubcategories = useCallback(async (categoryIds) => {
  if (!Array.isArray(categoryIds) || categoryIds.length === 0) {
    setSubcategories([]);
    return;
  }
  try {
    const response = await postApi(config.GetSubCategoryForFilter, {
      category_ids: categoryIds,
    });
    setSubcategories(response?.data || []);
  } catch (error) {
    console.error("Error fetching subcategories:", error);
    setSubcategories([]); // keep UI consistent
  }
}, []);

  

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
     alert("Failed to copy URL: " , err.message);
   }
 };

  const toggleCollapse = (section) => {
    setActiveFilter((prev) => ({ ...prev, [section]: !prev[section] }));
  };
  useEffect(() => {
    setLoading(true);
    let user = JSON.parse(localStorage.getItem("user") || JSON.stringify({}));
    setUserData(user);
    console.log("yeh toh ana hi tha")
    fetchProducts();
  }, [filters]);

  useEffect(() => {
    if (isLoggedIn && pendingCartProductId) {
      addToCart(pendingCartProductId, minimumOrderQuantity);
      setPendingCartProductId(null);
    }
  }, [isLoggedIn, pendingCartProductId]);

  useEffect(() => {
   
    setLoading(true);
    console.log("yeh chl rha h")
    fetchBrands();
    fetchCategories();
  }, [shopCategory]);

  async function fetchProducts() {
    try {
      console.log(filters)
      const response = await postApi(config.product, filters);

      console.log(response.productsWithUrls);
      setProducts(response.productsWithUrls || []);
      setTotalPages(response.totalPages || 1);
      setTotalCount(response.totalCount || 0);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error fetching products:", error);
    }
  }

  const fetchBrands = async () => {
    try {
      const endpoint = config.category;
      const data = { dropdown_type: "brand", page: 1, pageSize: 1000, status:1 };
      const response = await postApi(endpoint, data);

      setBrands(response.result);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error fetching categorylist:", error);
    }
  };

// 5) Guard category seeding so restored categories are not overwritten (edit fetchCategories):
const fetchCategories = async () => {
  const catId = categoryFromQuery || shopCategory;
  try {
    const endpoint = config.category;
    const data = { dropdown_type: "category", page: 1, pageSize: 1000, status:1 };
    const response = await postApi(endpoint, data);

    // breadcrumb for the selected category
    const filteredCategories = catId
      ? (response.result || []).filter(c => c._id === catId)
      : [];
    setBreadcrumnb(filteredCategories);

    setCategories(response.result || []);

    // Only seed filters if nothing selected yet (first load or cleared)
   setFilters(prev => {
  if (catId && (!prev.category || prev.category.length === 0)) {
    fetchSubcategories([catId]);
    return { ...prev, category: [catId], page: 1 };
  }
  return prev; // preserve multi-select
});

    setLoading(false);
  } catch (error) {
    setLoading(false);
    console.error("Error fetching categories:", error);
  }
};



function applyFilter(filter, id, event) {
  setLoading(true);
  const updated = { ...filters };

  if (event.target.checked) {
    updated[filter].push(id);
  } else {
    updated[filter] = updated[filter].filter((item) => item !== id);
  }

  // reset page to 1
  setCurrentPage(1);
  updated.page = 1;
  setFilters(updated);

  if (filter === "category") {
    fetchSubcategories(updated.category); 
  }

  setLoading(false);
}

  useEffect(() => {
  if (filters?.category?.length > 0) {
    fetchSubcategories(filters.category);
  } else {
    setSubcategories([]);
  }
}, [filters.category, fetchSubcategories]);


  function sortBY(value) {
    setLoading(true);
    setSortValue(value); // <-- Track the selected sort value
    let obj = JSON.parse(value);
    let temp = { ...filters };
    temp["sortOrder"] = obj.order;
    temp["sortBy"] = obj.key;
    setFilters(temp);
    setLoading(false);
  }

function clearFilters() {
  // Clear all filters including categories, regardless of URL category
  const base = getDefaultFilters(null); // Pass null to get empty category array
  setTitle("");
  setSortValue(JSON.stringify({ order: "desc", key: "buy_count" }));
  setCurrentPage(1);
  justClearedRef.current = true; // Flag that filters were just cleared
  setFilters(base);
  setSubcategories([]); // keep UI in sync immediately
}



  async function addToCart(id, minOrderQty) {
    if (!isLoggedIn) {

       let cartData = JSON.parse(localStorage.getItem("cartItems")) || [];

    const existingIndex = cartData.findIndex(item => item.productId === id);

    if (existingIndex > -1) {
      // Update quantity
      cartData[existingIndex].quantity += minOrderQty;
    } else {
      // Add new product
      cartData.push({
        productId: id,
        quantity: minOrderQty,
      });
    }
    setCartCount(cartData.length);
    localStorage.setItem("cartItems", JSON.stringify(cartData));
    setShowModal(true);
        setResponseTitle("Success");
        setResponseHeading("Congratulations");
        setResponseMessage("Product Added To Cart Successfully !!");

    return;
      setPendingCartProductId(id);
      setMinimumOrderQuantity(minOrderQty);
      setOpenLogin(true);
      return;
    }

    try {
      let user = JSON.parse(localStorage.getItem("user") || JSON.stringify({}));
      const endpoint = config.cartAdd;
      const data = {
        productId: id,
        userId: user._id,
        quantity: minOrderQty,
      };
      const response = await postApi(endpoint, data);
      console.log(response);
      if (response.statusCode == 200 || response.statusCode == 201) {
        console.log(response);
        setCartCount(response?.data.count);
        setShowModal(true);
        setResponseTitle("Success");
        setResponseHeading("Congratulations");
        setResponseMessage("Product Added To Cart Successfully !!");
        
        // alert("Product Added To Cart Successfully !!")
      }else if (response.error){
        setShowModal(true);
        setResponseTitle("Failed");
        setResponseHeading("Oops !!");
        setResponseMessage(response.error);
      }
    } catch (error) {
      console.error("Error fetching categorylist:", error);
    }
  }

  return (
    <>
      {loading && <Loader />}
      <HeaderWithDropdown />
    {/* {!pathname.includes("view-Business") && <SubHeader topPosition={80} />} */}

    <div className={pathname.includes("view-Business") ? "" : "shopPage"}>
      
           <div className={pathname.includes("view-Business") ? "" : "container-fluid"}>
        {!pathname.includes("view-Business") &&
          <div className="breadcrumbGroup">
            <ol className="breadcrumb mb-0">
              {/* <li className="breadcrumb-item">
                <Link href={"/"} style={{ textDecoration: "none" }}>
                  Home
                </Link>
              </li> */}
              <li className="breadcrumb-item">
                <Link href={"/Shop"} style={{ textDecoration: "none" }}>
                  Shop
                </Link>
              </li>
              <li className="breadcrumb-item active">{breadcrumnb[0]?.name}</li>
            </ol>
          </div>
}
          <div className="d-flex flex-wrap">
            <div className="itemFilter">
              <h3>
                Filters
               <a
  type="button"
  style={{
    fontSize: "14px",
    color: "#662A09",          // link blue
    textDecoration: "underline",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 0,
  }}
  onClick={clearFilters}
>
  Clear All Filters
</a>

              </h3>

              {/* Categories Filter */}
              <div className="filterGroup">
                <h4>
                  <a
                    className="collapseToggle"
                    onClick={() => toggleCollapse("categories")}
                  >
                    Categories
                  </a>
                </h4>
                <div
                  className={`filter-content ${
                    activeFilter.categories ? "open" : ""
                  }`}
                >
                  <ul className="checkList">
                    {[...categories]?.sort((a, b) => a?.name.localeCompare(b?.name)).map((cat, index) => (
                      <>
                        <li key={cat.id}>
                          <div className="cstmCheckbox d-flex">
                           <input
  type="checkbox"
  id={`check1-${index + 1}`}
  checked={filters.category?.includes(cat._id)}
  onChange={(e) => applyFilter("category", cat._id, e)}
/>
                            <label htmlFor={`check1-${index + 1}`} title={cat.name}>
                              {cat.name.length > 25
    ? cat.name.slice(0, 25) + "..."
    : cat.name}
                            </label>
                          </div>
                        </li>
                      </>
                    ))}
                  </ul>
                </div>
              </div>

 {/* Subcategory filter */}

 {subcategories.length > 0 && (
  <div className="filterGroup">
    <h4>Subcategories</h4>
    <div className="filter-content open">
      <ul className="checkList">
        {[...subcategories]
  .sort((a, b) => a.name.localeCompare(b.name)).map((sub, idx) => (
          <li key={idx}>
            <div className="cstmCheckbox d-flex">
             <input
  type="checkbox"
  id={`sub-${idx}`}
  checked={filters.subcategory?.includes(sub._id)}
  onChange={(e) => applyFilter("subcategory", sub._id, e)}
/>

              <label htmlFor={`sub-${idx}`} title={sub.name}>{sub.name.length > 25
    ? sub.name.slice(0, 25) + "..."
    : sub.name}</label>
            </div>
          </li>
        ))}
      </ul>
    </div>
  </div>
)}

              {/* Sort Filter */}
              <div className="filterGroup">
                <h4 className="mb-3">Sort By</h4>
                <select
                  className="form-control"
                  value={sortValue}
                  onChange={(e) => sortBY(e.target.value)}
                >
                  <option
                    value={JSON.stringify({ order: "desc", key: "buy_count" })}
                  >
                    Bestseller
                  </option>
                  <option
                    value={JSON.stringify({ order: "asc", key: "price" })}
                  >
                    Price : Low to High
                  </option>
                  <option
                    value={JSON.stringify({ order: "desc", key: "price" })}
                  >
                    Price : High to Low
                  </option>
                </select>
              </div>

              {/* Brands Filter */}
              <div className="filterGroup">
                <h4>
                  <a
                    className="collapseToggle"
                    onClick={() => toggleCollapse("brands")}
                  >
                    Brands
                  </a>
                </h4>
                <div
                  className={`filter-content ${
                    activeFilter.brands ? "open" : ""
                  }`}
                >
                  <ul className="checkList">
                    {[...brands]?.sort((a, b) => a?.name.localeCompare(b?.name)).map((brand, index) => (
                      <li key={index}>
                        <div className="cstmCheckbox d-flex">
                         <input
  type="checkbox"
  id={`brnd-${index + 1}`}
  checked={filters.brand?.includes(brand._id)}
  onChange={(e) => applyFilter("brand", brand._id, e)}
/>
                          <label htmlFor={`brnd-${index + 1}`}title={brand.name}>
                           {brand.name.length > 25
    ? brand.name.slice(0, 25) + "..."
    : brand.name}
                          </label>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Product List */}
            <div className="itemList">
              <div className="productSearch">
                <div className="searchInput position-relative">
                  <input
                    type="text"
                    className="form-control pe-5"
                    placeholder="Search Your Product Name"
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                    }}
                  />

                  {title && (
                    <span
                      onClick={() => {
                        setTitle("");
                        setFilters({ ...filters, title: "" });
                      }}
                      style={{
                        position: "absolute",
                        right: "100px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        cursor: "pointer",
                        fontSize: "25px",
                        color: "#888",
                      }}
                    >
                      &times;
                    </span>
                  )}

                 {/* // 7) (Optional) Ensure Search button writes title into filters (you already do this): */}
<button
  type="submit"
  className="btn btn-primary position-absolute"
  style={{ right: 0, top: 0, height: "100%" }}
  onClick={() => {
    setFilters({ ...filters, page: 1, title });
  }}
>
  Search
</button>

                </div>
              </div>

              <div className="row">
                {products.length > 0 &&
                  products.map((item) => (
                    <div className="col-md-6 col-lg-4 mb-4" key={item}>
                      <div className="journeyBox product-card">
                      <figure className="mb-2 position-relative">
  {/* {item?.buy_one_get_one && (
    <div
      style={{
        position: "absolute",
        top: "10px",
        left: "10px",
        background: "linear-gradient(135deg, #8B4513, #D2691E)",
        color: "#fff8f0",
        padding: "6px 14px",
        fontSize: "11px",
        fontWeight: 600,
        borderRadius: "30px",
        boxShadow: "0 3px 8px rgba(0, 0, 0, 0.15)",
        transform: "rotate(-4deg)",
        letterSpacing: "0.5px",
        zIndex: 2,
      }}
    >
      🛍️  Buy 1 Get 1
    </div>
  )} */}
  <Link href={`/Shop/product/${item?._id}`}>
    <img
      src={`${process.env.NEXT_PUBLIC_API_URL}/${item?.coverImage}`}
      style={{ objectFit: "cover" }}
      alt="Product Image"
      width={390}
      height={250}
    />
  </Link>
 <button
  type="button"
  onClick={() => handleCopyUrl(item?._id)}
  className="shareBtn"
>
  <Image
    src="/images/landingpage/share-icon.svg"
    alt="Share"
    width={30}
    height={30}
  />
</button>

</figure>

                        <div className="contentproduct">
                          <span className="text-orange fs-8 pb-1">
                            {item.brandName}
                          </span>
                          {/* <Link href={"/Shop/product/"+item._id}>
                            <h3 className="text-orange fs-7 fw-semibold">
                              {item?.productName}
                            </h3>
                          </Link> */}
                          <Link
                            href={`/Shop/product/${item?._id}`}
                            style={{ textDecoration: "none" }}
                          >
                            <h3
                              className="text-brown fs-7 fw-medium"
                              style={{
                                cursor: "pointer",
                                textDecoration: "none",
                                color: "#662A09",
                              }}
                            >
                              {/* {item?.productName} */}
                              {item?.productName}
                            </h3>
                          </Link>
                          <hr />
                          <div className="d-flex justify-content-between align-items-baseline">
                           <div className="d-flex align-items-center gap-2">
  {item?.mrp > item?.price ? (
    <>
      <span
        style={{
          textDecoration: "line-through",
          color: "rgb(0 190 85 / 69%)",
          marginRight: "8px",
        }}
      >
        ${item?.mrp}
      </span>
      <span
        style={{
          fontWeight: "bold",
          color: "#00BE55",
        }}
      >
        ${item?.price}
      </span>
    </>
  ) : (
    <span
      style={{
        fontWeight: "bold",
        color: "#00BE55",
      }}
    >
      ${item?.price}
    </span>
  )}
</div>

                            <span
                              className="btn btn-primary"
                              onClick={(e) => {
                                addToCart(item._id, item?.minOrderQuantity);
                              }}
                            >
                              Add To Cart
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              {products.length > 0 ? (
  <>
    <div style={{ display: "flex", justifyContent: "center" }}>
      {totalCount > 12 && ( // 👈 only show pagination if more than 1 page
        <Pagination
          totalProducts={totalCount}
          currentPage={currentPage}
          pageSize={18}
          onPageChange={(page) => setCurrentPage(page)}
        />
      )}
    </div>
  </>
) : (
  <div className="col-md-6 col-lg-4 mb-4">
    <h5>No Products are available</h5>
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
     
        {!pathname.includes("view-Business") &&  <FooterSection />}
    </>
  );
};

export default ProductListing;
