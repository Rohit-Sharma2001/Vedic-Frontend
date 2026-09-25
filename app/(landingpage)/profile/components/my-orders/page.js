"use client";
import { useState, useEffect, useRef } from "react";
import { config } from "services/config";
import { postApi } from "services/api";
import ReturnModal from "../ReturnModal/page";
import MyOrderDetails from "../MyOrderDetails/page";
import InvoicePage from "../invoicePage/page";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useRouter } from 'node_modules/next/navigation';
import CancelOrder from "services/Pop-ups/cancelOrder/page";
import Pagination from 'services/pagination';
import moment from 'moment'
import { Card } from "node_modules/react-bootstrap/esm";
import Loader from "services/Loader/page";
export default function MyOrders() {
  const [activeTab, setActiveTab] = useState("ordersAll");
  const [userData, setUserData] = useState();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [orderData, setOrderData] = useState();
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [showOrderDetailModal, setShowOrderDetailModal] = useState(false);
  const [showreturnModal, setShowReturnModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedOrderreturn, setSelectedOrderReturn] = useState(null);
  const [returnDays, setReturnDays] = useState(7)
  const [invoiceData, setInvoiceData] = useState({
    invoiceNo: "INV-C-2024-41212012",
    created_at: new Date(),
    grandTotal: 8700,
    address: {
      name: "Rahul Sharma",
      flatNo: "D Block 123",
      area: "Near Surya Park",
      city: "Malviya Nagar",
      state: "Rajasthan",
      country: "India",
      pincode: "302017",
      mobile: "+919999999999",
    }
  })
  const [loader, setLoader] = useState(false)
  const [fromAddress, setFromAddress] = useState(null);
  const [allAddressInStoreDropdown, setAllAddressInStoreDropdown] = useState([]);
  const invoiceRef = useRef();
  const [showCancelModal, setShowCancelModal] = useState(false);
    const [footerData, setFooterData] = useState({
    address: "",
    email: "",
    number: ""
  });
  const[expandedOrders,setExpandedOrders]=useState([])
  
    const getInStoreAddress = async () => {
      try {
        const endpoint = config.centers;
        const response = await postApi(endpoint);
        if (response.statusCode == 200 || response.statusCode == 201) {
          setFromAddress(response?.centers[0]._id);
          setAllAddressInStoreDropdown(response?.centers);
        }
      } catch (error) {
        console.error("Error fetching categorylist:", error);
      }
    };
  console.log("fromAddress", fromAddress,"allAddressInStoreDropdown",allAddressInStoreDropdown)
  useEffect(() => {
    getInStoreAddress();
    const fetchFooterData = async () => {
      try {
        const endpoint = config.Viewcategory;
        const data = { id: "67f4da7497d93651914eb2f7" }; // footer_data ID
        const response = await postApi(endpoint, data);
  
        if (response.statusCode === 201) {
          setFooterData({
            address: response.data.address || "",
            email: response.data.email || "",
            number: response.data.number || ""
          });
        }
      } catch (error) {
        console.error("Error fetching footer data:", error);
      }
    };
  
    fetchFooterData();
  }, []);
  
  let router = useRouter()

  const today = moment();

  const handleShowModal = (order) => {
    setSelectedOrder(order);
    setShowOrderDetailModal(true);
  };

  const handleShowReturnModal = (order) => {
    setSelectedOrderReturn(order);
    setShowReturnModal(true);
  };

  useEffect(() => {
   const user = JSON.parse(localStorage.getItem("user") || "{}");
   setUserData(user);
 }, []);

 useEffect(() => {
   if (!userData?._id) return;
   if (activeTab === "ordersAll") {
     fetchdata(currentPage, userData);                 // no filter
   } else if (activeTab === "shipped") {
     fetchdata(currentPage, userData, "shipped");      // shipped-only filter
   }  else if (activeTab === "delivered") {
   fetchdata(currentPage, userData, "delivered");
    } else if (activeTab === "orderReturns") {
     fetchReturndata("orderReturns");
   } else if (activeTab === "orderCancel") {
     getCancelOrder("orderCancel");
   }
 }, [activeTab, currentPage, userData]);

  const downlosdInvoice = async (data) => {
       {console.log("data details",data)}
    const newdata={...data,invoiceNo:` Ved${data.invoiceNo}`}
    setLoader(true)
    setInvoiceData(newdata)
    // console.log("llllllllp",InvoicePage(data))

    // return(

    //   <InvoicePage data={data} />
    // )
    setTimeout(async () => {
      const element = invoiceRef.current;

      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff', // Ensures white background
        scale: 2, // Higher quality
      });
      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF('p', 'pt', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('invoice.pdf');
      setLoader(false)
    }, 100)

  }


  const fetchdata = async (page, user, tab) => {
    try {
      console.log(userData, page, "userfDatagdswqbn dlasd;kn");
      const endpoint = config.FindUserOrders;
      let data = { user: user?._id, page: page, pageSize: pageSize };

      setLoader(true)
      console.log(data, "datadatadatadatadata")
      const response = await postApi(endpoint, data);
      setLoader(false)
      if (response?.statusCode === 200 || response?.statusCode === 201) {
   if (tab === 'shipped') {
     const shipped = (response?.data || []).filter(e =>
       ( e?.orderStatus == null || e?.orderStatus === 'orderPacked' || e?.orderStatus === 'orderReady')
     );
     setOrderData(shipped);
      } else if (tab === "delivered") {
       const delivered = (response?.data || []).filter((e) =>
        ((e.pickupDate && e?.pickupDoneDate)|| (!e.pickupDate &&e?.deliveryDates?.deliveredDate))
       );
       setOrderData(delivered);
   } else {
     setOrderData(response?.data || []);
   }
   setReturnDays(response?.returnDays ?? returnDays);
   setTotalCount(response?.totalPages ?? 1);
 } else {
        console.error("Error fatching data");
      }
    } catch (error) {
      console.error("Error fetching brands list:", error);
    }
  };

const fetchReturndata = async (tabId) => {
   try {
     const endpoint = tabId === 'orderReturns' ? config.GetUserReturnOrder : config.FindUserOrders;
     setLoader(true);
     const data = { user: userData?._id, page: currentPage, pageSize };
     const response = await postApi(endpoint, data);
     setLoader(false);
     if (response?.statusCode === 200 || response?.statusCode === 201) {
       setOrderData(response?.data || []);
     } else {
       console.error("Error fetching data");
     }
   } catch (error) {
     setLoader(false);
     console.error("Error fetching return data:", error);
   }
 };


  const getCancelOrder = async (data1) => {
    try {
      handleTabChange(data1)
      console.log(userData, "userfDatagdswqbn dlasd;kn");
      let endpoint = config.getCancelOrder
      setLoader(true)
      const data = { userId: userData?._id };
      const response = await postApi(endpoint, data);
      setLoader(false)
      if (response?.statusCode == 200 || response?.statusCode == 201) {
        setOrderData(response?.data);
      } else {
        console.error("Error fatching data");
      }
    } catch (error) {
      console.error("Error fetching brands list:", error);
    }
  };

  const buyAgain = async (cardId, orderItems) => {
    try {
      console.log(userData, "userfDatagdswqbn dlasd;kn");
      const endpoint = config.buyAgain;
      const data = { userId: userData?._id, id: cardId, orderItems: orderItems };
      setLoader(true)
      const response = await postApi(endpoint, data);
      console.log(response, "responseresponse")
      setLoader(false)
      if (response?.statusCode == 200 || response?.statusCode == 201) {
        // setOrderData(response?.data);
        router.push('/Shop/cart')
      } else {
        console.error("Error fatching data");
      }
    } catch (error) {
      console.error("Error fetching brands list:", error);
    }
  };

  const cancelOrder = async (orderItems) => {
    try {
      console.log(userData, "userfDatagdswqbn dlasd;kn");
      const endpoint = config.cancelOrder;
      setLoader(true)
      const data = { orderId: orderItems._id };
      const response = await postApi(endpoint, data);
      console.log(response, "responseresponse")
      setLoader(false)
      if (response?.statusCode == 200 || response?.statusCode == 201) {
        alert("order cancelled")
        fetchdata(currentPage, userData);
      } else {
        console.error("Error fatching data");
      }
    } catch (error) {
      console.error("Error fetching brands list:", error);
    }
  };

  const tabItems = [
    { id: "ordersAll", label: "All Orders" },
    { id: "shipped", label: "Not yet Shipped" },
     { id: "delivered", label: "Delivered Orders" },
    { id: "orderReturns", label: "Return Orders" },
    { id: "orderCancel", label: "Cancelled Orders" },
  ];

// 3) Change tab, reset to page 1; actual fetch happens in the effect above
 const handleTabChange = (tab) => {
   setActiveTab(tab);
   setCurrentPage(1);
 };
  const setDateFormat = (oldDate) => {
    return moment(oldDate).format("D MMMM YYYY h:mm A");
  }

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
    <div className="">
      {loader && <Loader />}
      {/* <h2 className="fs-6 fw-semibold mb-4">My Orders</h2> */}
      <ul className="nav nav-tabs ordersTabs">
        <li className='nav-item'>
          <button
            className={`nav-link ${activeTab == 'ordersAll' ? 'active' : ""}`}
            data-bs-toggle="tab"
            data-bs-target="#ordersAll"
            type="button"
onClick={() => handleTabChange('ordersAll')}
          >
            All Orders
          </button>
        </li>
        <li className='nav-item'>
          <button
            className={`nav-link ${activeTab == 'shipped' ? 'active' : ""}`}
            data-bs-toggle="tab"
            data-bs-target="#shipped"
            type="button"
            onClick={() => { handleTabChange('shipped') }}
          >
            Not yet Shipped
          </button>
        </li>
        <li className='nav-item'>
   <button
     className={`nav-link ${activeTab == 'delivered' ? 'active' : ""}`}
     data-bs-toggle="tab"
     data-bs-target="#delivered"
     type="button"
     onClick={() => handleTabChange('delivered')}
   >
     Delivered Orders
   </button>
 </li>
        <li className='nav-item'>
          <button
            className={`nav-link ${activeTab == 'orderReturns' ? 'active' : ""}`}
            data-bs-toggle="tab"
            data-bs-target="#orderReturns"
            type="button"
onClick={() => handleTabChange('orderReturns')}
          >
            Return Orders
          </button>
        </li>
        <li className='nav-item'>
          <button
            className={`nav-link ${activeTab == 'orderCancel' ? 'active' : ""}`}
            data-bs-toggle="tab"
            data-bs-target="#orderCancel"
            type="button"
onClick={() => handleTabChange('orderCancel')}
          >
            Cancelled Orders
          </button>
        </li>
      </ul>
      {/* <ul className="nav nav-tabs ordersTabs">
        {tabItems.map((tab) => (
          <li className="nav-item" key={tab.id}>
            <button
              className={`nav-link ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => handleTabChange(tab.id)}
            >
              {tab.label}
            </button>
          </li>
        ))}
      </ul> */}

      <div className="tab-content">
        {tabItems.map((tab) => (
          <div
            key={tab.id}
            id={tab.id}
            className={`tab-pane fade ${activeTab === tab.id ? "show active" : ""
              }`}
          >
            {orderData &&
              orderData.map((ele, ind) => {
                return (
                  <div className="ordetails mb-3" key={ind}>
                    {/* {console.log(ele, "eleeleele")} */}
                    <ul className="detailsUl">
                      <li>
                        Order Id <b># Ved{ele?.invoiceNo}</b>
                      </li>
                      <li>
                        Order Placed{" "}
                        <b>
                          {new Date(ele?.created_at)
                            .toLocaleDateString("en-US"
                            //   , {
                            //   day: "2-digit",
                            //   month: "2-digit",
                            //   year: "numeric",
                            // })
                            // .replace(/\//g, "-"
                            )
                            }
                        </b>
                      </li>
                      {/* <li>Order Placed <b>{new Date(ele?.created_at).toLocaleDateString()}</b></li> */}
                      <li>
                        Amount <b>${ele?.totalAmount}</b>
                      </li>
                      <li className="text-md-end">
                        <button
                          type="button"
                          className="btn btn-primary py-2 px-3"
                          onClick={() => handleShowModal(ele)}
                        >
                          View Details
                        </button>
                      </li>
                    </ul>
                    <div className="row align-items-center orderbuy m-0">
                      <div className="col-md-10 px-md-0">
                        <div className="flex-grow-1">

  <div>

    {ele?.orderItems?.length > 0 ? (

      <>

        {[ele.orderItems[0], ...(expandedOrders[ele._id] ? ele.orderItems.slice(1) : [])].map((item, itemInd) => (

          <div key={itemInd} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '9px 0', borderBottom: '1px solid #f0f0f0' }}>

            <figure className="m-0" style={{ width: '40px', height: '40px', flexShrink: 0 }}>

              <img

                src={

                  ele.orderProducts?.find(p => p._id === item._id)?.coverImage

                    ? `${process.env.NEXT_PUBLIC_API_URL}/${ele.orderProducts.find(p => p._id === item._id).coverImage}`

                    : "/images/landingpage/amalaki-powder-img.jpg"

                }

                alt=""

                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' }}

              />

            </figure>

            {/* <div style={{ flex: 1, minWidth: 0 }}> */}

            <div style={{ flex: 1, minWidth: 0, maxWidth: '200px' }}>

              <h6 className="mb-0" style={{ fontSize: '13px', fontWeight: 600 }}>{item?.productName}</h6>

              <small className="text-muted" style={{ fontSize: '11px' }}>{item?.productBrand}</small>

              {ele?.returnorders?.length > 0 && ele?.returnorders[0]?.productId.includes(item._id) && (

                <div className="text-danger" style={{ fontSize: '11px', fontWeight: 500 }}>(Returned)</div>

              )}

            </div>

            <div style={{ flexShrink: 0, fontSize: '13px', fontWeight: 500, color: '#555' }}>

              QTY. {item?.quantity}

            </div>

          </div>

        ))}

      </>

    ) : (

      <div className="text-center text-muted py-2" style={{ fontSize: '13px' }}>No Records</div>

    )}

  </div>

 

<div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>

  

 

  {ele?.orderItems?.length > 1 && (

    <button

      type="button"

      className="btn btn-link p-0"

      style={{ fontSize: '12px', textDecoration: 'none' }}

      onClick={() =>

        setExpandedOrders(prev => ({

          ...prev,

          [ele._id]: !prev[ele._id]

        }))

      }

    >

      {expandedOrders[ele._id]

        ? `▲ View Less`

        : `▼ View All ${ele.orderItems.length} Products`}

    </button>

  )}

 

  {/* Download Invoice */}

  {activeTab != 'shipped' &&

    tab.id !== "orderCancel" &&

    tab.id !== "orderReturns" &&

    ((ele.pickupDate && ele?.orderStatus === 'orderPickedUp') || (!ele.pickupDate && ele?.deliveryDates?.deliveredDate)) &&

    <a

      href="#"

      style={{ fontSize: '12px' }}

      onClick={(e) => {

        e.preventDefault();

        downlosdInvoice(ele);

      }}

    >

      Download invoice

    </a>

  }

 

</div>

</div>
                        <div className="productTable">
                          {/* <figure className="m-0">
                            <img
                              src={ele?.orderProducts?.[0]?.additionalImages?.length > 0 ? `${process.env.NEXT_PUBLIC_API_URL}/${ele?.orderProducts[0].additionalImages[0]}` : "/images/landingpage/order-detail.png"}
                              alt=""
                            />
                          </figure> */}
                          {/* <div>
                            <h6>{ele?.orderItems?.[0]?.productBrand || 'Amalaki Powder'}</h6>
                            {<span>
                              {ele?.orderItems?.[0]?.productName}
                              { activeTab != 'shipped' && tab.id !== "orderCancel" && tab.id !== "orderReturns" &&((ele.pickupDate && ele?.orderStatus === 'orderPickedUp')||(!ele.pickupDate&&ele?.deliveryDates?.deliveredDate ))&& <a href="#" onClick={(e) => { e.preventDefault(); downlosdInvoice(ele) }}>Download invoice</a>}
                            </span>}
                          </div> */}
                        </div>
                        {activeTab !== 'orderCancel' && <ul className="tackList pt-4">
                          {/* {console.log(ele.pickupDate, ele?.orderItems?.[0]?.productName, "hhhhhhhhhh")} */}
                          <li className={ele.orderPackDate && "active"}>
                            <b>Order Pack</b> {ele.orderPackDate ? setDateFormat(ele.orderPackDate) : ''}
                          </li>
                          <li className={ele.orderReadyDate && "active"}>
                            <b>Order Ready</b> {ele.orderReadyDate ? setDateFormat(ele.orderReadyDate) : ''}
                          </li>
                          {!ele.pickupDate && <li className={ele?.deliveryDates?.shippedDate && ele.pickupDoneDate&&"active"}>
                            <b>Order Dispatch</b> {ele?.deliveryDates?.pickupDate ? setDateFormat(ele.deliveryDates?.pickupDate) : ''}
                          </li>}
                          {!ele.pickupDate && <li className={ele.deliveryDates?.deliveredDate && ele.pickupDoneDate&& "active"}>
                            <b>Out For Delivered</b> {ele?.deliveryDates?.shippedDate ? setDateFormat(ele.deliveryDates.shippedDate) : ''}
                          </li>}
                          {!ele.pickupDate && <li className={ele?.deliveryDates?.deliveredDate && ele.pickupDoneDate&&"active"}>
                            <b> Order Delivered</b>{ele?.deliveryDates?.deliveredDate ? setDateFormat(ele?.deliveryDates?.deliveredDate) : ''}
                          </li>}
                          {ele.pickupDate && <li className={ele?.orderStatus === 'orderPickedUp' && "active"}>
                            <b> Order Picked Up</b>{ele?.pickupDoneDate ? setDateFormat(ele?.pickupDoneDate) : ''}
                          </li>}
                        </ul>}
                      </div>
                      <div className="col-md-2 px-md-0">
                        {tab.id !== "orderReturns" && <div className="d-flex flex-md-column gap-3 align-items-end">{console.log(ele.cancelOrder, "ele.cancelOrder")}
                          {!ele.orderReadyDate && ele.status!=='orderCanceled'&&
                          <button
                            type="button"
                            className="btn btn-outline-primary fs-8"
                            onClick={() => cancelOrder(ele)}>
                            Cancel Order
                          </button>
                          }
                          
                          {ele?.returnorders?.length !==ele.orderItems.length &&
                          ele.status!=="orderCanceled"&&(ele?.deliveryDates?.deliveredDate||ele?.pickupDoneDate)&&moment(ele?.deliveryDates?.deliveredDate||ele?.pickupDoneDate).add(returnDays, 'days').isAfter(today) && tab.id !== "shipped" && tab.id !== "orderCancel" &&
                            <button
                              type="button"
                              className="btn btn-outline-primary fs-8"
                              onClick={() => handleShowReturnModal(ele)}
                            // onClick={()=>setShowCancelModal(true)}
                            >
                              {/* {tab.id === "orderReturns"
                              ? "Return"
                              : "Cancel Order"} */}
                              Return
                            </button>}
                          <button
                            type="button"
                            className="btn btn-outline-secondary fs-8"
                            onClick={() => buyAgain(ele.cartIds, ele.orderItems)}
                          >
                            Buy It Again
                          </button>
                        </div>}
                      </div>
                    </div>
                    {/* start  */}

                    <div className="tab-pane active">
                      <div className="mb-3 locatonDiv">
                        <span className="fw-medium">
                          <img
                            src="/images/landingpage/location-red-icon.svg"
                            alt=""
                            className="me-3"
                            width={14}
                          // height={24}
                          />
                          {allAddressInStoreDropdown &&
                            allAddressInStoreDropdown[0]?.address || "N/A"} |
                            <span  style={{marginLeft:"5px"}}>
                              Opening Time:{" "}
                            {allAddressInStoreDropdown &&
                            convertTo12HourFormat(allAddressInStoreDropdown[0]?.openingTime) || "N/A"}
                          </span>
                          <span style={{marginLeft:"5px"}}>
                            Closing Time:{" "}
                            {allAddressInStoreDropdown &&
                            convertTo12HourFormat(allAddressInStoreDropdown[0]?.closingTime) || "N/A"}
                          </span>
                           
                        </span>
                      </div>
                     {ele && ele?.pickupDate  && ( <label className="mb-3 fw-medium fs-7">
                        Pickup Date :-  {ele && new Date(ele?.pickupDate).toLocaleDateString("en-Us")}
                      </label>)}
                    </div>

                    {/* End     */}
                    <strong
                      className={
                        (tab.id === "orderCancel"|| ele.status== 'orderCanceled')
                          ? "cancelled"
                          : tab.id === "orderReturns"
                            ? "delivered"
                            : ""
                      }
                    >
                      {(tab.id === "orderCancel"|| ele.status== 'orderCanceled')
                        ? "Order Cancelled"
                        : tab.id === "orderReturns"
                          ? "Order Returned"
                          : (ele?.orderStatus === null|| !ele?.orderStatus) ? "Order Placed":ele?.orderStatus === 'orderPacked' ? "Order Packed" :(ele?.orderStatus === 'orderReady')? "Order Ready":(ele?.orderStatus === 'orderPickedUp')?"Order Picked Up":(!ele.pickupDate&&ele?.orderStatus === 'orderPickedUp') ? "Out For Delivered":""}
                    </strong>
                  </div>
                );
              })}
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Pagination totalProducts={totalCount} currentPage={currentPage} pageSize={6} onPageChange={(page) => setCurrentPage(page)} />
        </div>
      </div>
      {selectedOrder && (
        <MyOrderDetails
          show={showOrderDetailModal}
          onClose={() => setShowOrderDetailModal(false)}
          order={selectedOrder}
        />
      )}

      <div ref={invoiceRef} style={{ position: 'absolute', left: '-9999px' }}>

        {invoiceData && <InvoicePage data={invoiceData} footerData={footerData} />}
      </div>

      {selectedOrderreturn && (
        <ReturnModal
          show={showreturnModal}
          onClose={() => setSelectedOrderReturn(false)}
          order={selectedOrderreturn}
          onConfirmReturn={() => {
            setShowReturnModal(false);
            // Here you can set another state like `setShowConfirmModal(true)`
          }}
        />
      )}

      {/* <CancelOrder
   show={showCancelModal}
   onClose={() => setShowCancelModal(false)}
   heading={ "Are you sure?"}
   description={"Do you really want to cancel order"}
   onBackButtonClick={() => setShowCancelModal(false)}
   onYesButtonClick={() => setShowCancelModal(false)}
/> */}
    </div>
  );
}
