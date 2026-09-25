"use client";
import { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../../../../app/(landingpage)/LandingPage/public/css/style.css";
import { config } from "services/config";
import { postApi } from "services/api";
import Loader from "services/Loader/page";
export default function ReturnModal({ show, onClose, order, onConfirmReturn }) {
  const [userData, setUserData] = useState();
  const [yesReturnModal, setYesReturnModal] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [deliveryCharges, setDeliveryCharges] = useState(2.0);
  const [selectedReason, setSelectedReason] = useState("");
  const [commentText, setCommentText] = useState("");
  const [itemTypeList, setItemTypeList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loader,setLoader]= useState(false)
  const isReturnDisabled = selectedItems.length === 0
  // !selectedReason || !commentText.trim() || ;


  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setUserData(user);
    fetchItemTypes();
  }, []);

  useEffect(() => {
    if (show) {
      setSelectedItems([]);
      setSelectedReason("");
      setCommentText("");
      setYesReturnModal(false);
      setCurrentPage(1);
    }
  }, [show]);

  const cancelReturn = async () => {
    onClose();
  };
  console.log(order, "orderorderorderorderorderorder")
  console.log(selectedItems, "weewewewewewewewewewew")
  const handleCheckboxChange = (ele) => {
    console.log(ele, "rererererwewewe")
    setSelectedItems((prevSelectedItems) => {
      const isAlreadySelected = prevSelectedItems.find((item) => {
        return item.productId === ele._id;
      });
      if (isAlreadySelected) {
        return prevSelectedItems.filter((item) => item.productId !== ele._id);
      } else {
        return [
          ...prevSelectedItems,
          {
            productId: ele._id,
            productPrice: ele.productPrice,
            quantity: ele.quantity,
            productName: ele.productName,
          },
        ];
      }
    });
  };

  const calculateGrandTotal = () => {
    if (selectedItems.length === 0) return "0.00";
    return (
      parseFloat(calculateSubtotal()) + (order?.deliveryCharge || 0)
    )?.toFixed(2);
  };

  const calculateSubtotal = () => {
    if (selectedItems.length === 0) return "0.00";
    return selectedItems
      .reduce((acc, item) => acc + item.productPrice * item.quantity, 0)
      ?.toFixed(2) || 0;
  };

  const handleYesReturn = () => {
    if (onConfirmReturn) {
      onConfirmReturn();
    }
    setYesReturnModal(true);
  };

  const handleCloseYesReturn = () => {
    setYesReturnModal(false);
  };

  const calculateDiscount = () => {
    const subtotal = parseFloat(calculateSubtotal());
    const orderTotal = order?.totalAmount || 0;
    const discountAmount = order?.discountAmount || 0;

    if (orderTotal === 0) return 0;
    return ((subtotal / orderTotal) * discountAmount)?.toFixed(2) || 0;
  };

  const fetchItemTypes = async (page) => {
    try {
      setLoader(true)
      const endpoint = config.category;

      const data = { dropdown_type: "return_reasons", page, pageSize };

      const response = await postApi(endpoint, data);
      setLoader(false)
      setItemTypeList(response.result || []);

      setTotalPages(response.totalPages || 1);
    } catch (error) {
      console.error("Error fetching product types:", error);
    }
  };

  const applyforReturn = async () => {
    try {

      const subtotal = parseFloat(calculateSubtotal());
      const totalDiscount = parseFloat(calculateDiscount());

      const updatedProducts = selectedItems.map((item) => {
        const itemTotal = item.productPrice * item.quantity;
        const itemDiscount =
          subtotal > 0
            ? parseFloat(((itemTotal / subtotal) * totalDiscount).toFixed(2))
            : 0;
        return {
          ...item,
          discount: itemDiscount,
          status: "pending",
          discountedPrice: item.productPrice - itemDiscount
        };
      });


      const payload = {
        userId: userData?._id,
        orderId: order?._id,
        productId: selectedItems.map((item) => item.productId),
        reason: selectedReason,
        comment: commentText,
        products: updatedProducts,
      };
      console.log(payload, "payload owerewrerewrreew")
      // return;
      setLoader(true)
      const endpoint = config.applyforReturn;

      // const response = await postApi(endpoint, payload);
      // setLoader(true)
      // if (response?.statusCode == 200) {
        setSelectedItems([]);
        setSelectedReason("");
        setCommentText("");
        setYesReturnModal(false);
        onClose();
      // } else {
      //   console.error("Error submitting return request");
      // }
    }
    catch (error) {
      console.error("Error applying for return", error);
    }
  };

  return (
    <>
    {loader&&<Loader/>}
      <Modal
        show={show}
        onHide={onClose}
        centered
        size="xl"
        dialogClassName="custom-return-modal-dialog"
        contentClassName="custom-return-modal-content"
      >
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fs-6">Order Return</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="modal-body">
            <div className="mainReturn mb-3">
              <strong>Your Products</strong>
              <div
                className="p-0 m-0"
                style={{ maxHeight: "240px", overflowY: "auto" }}
              >
                {order?.orderItems?.length > 0 ? (
                  <div className="list-group">
                    {order.orderItems.map((ele, ind) => (
                      <label
                        key={ind}
                        className="list-group-item d-flex align-items-center gap-3"
                        style={{ cursor: "pointer" }}
                      >
                        <input
                          className="form-check-input me-2"
                          type="checkbox"
                          onChange={() => handleCheckboxChange(ele)}
                        />
                        <img
                          src="/images/landingpage/amalaki-powder-img.jpg"
                          alt=""
                          className="rounded"
                          style={{
                            height: "50px",
                            width: "50px",
                            objectFit: "cover",
                          }}
                        />
                        <div className="flex-grow-1">
                          <h6 className="mb-1 fs-7">{ele?.productName}</h6>
                          <p style={{ fontWeight: "500" }} className="mb-1">
                            {ele?.productName}
                          </p>
                          <span style={{ fontWeight: "500" }}>
                            Qty: {ele?.quantity}
                          </span>
                        </div>
                        <div className="fw-semibold">$ {ele?.productPrice}</div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">No Records</div>
                )}
              </div>

              <hr className="mb-0" />

              <div className="paymentdetail border-0 pb-0 px-0">
                <span>
                  Sub Total<b>${calculateSubtotal()}</b>
                </span>
                <span>
                  Discount<b>${calculateDiscount()}</b>
                </span>
                <span>
                  Delivery Charge <b>${(order?.deliveryCharge || 0)?.toFixed(2) || 0}</b>
                </span>
                <strong>
                  {/* Grand Total<b>${(order?.grandTotal)?.toFixed(2) || 0}</b> */}
                  Grand Total<b>${(parseFloat(calculateSubtotal()) - parseFloat(calculateDiscount()) + parseFloat(order?.deliveryCharge || 0)).toFixed(2)}</b>
                </strong>
              </div>
            </div>

            {/* <div className="formDtl">
              <div className="row">
                <div className="col-md-12 mb-3">
                  <label>Return Reason <b style={{color:'red'}}>*</b></label>
                  <select
                    className="form-select"
                    aria-label="Default select example"
                    value={selectedReason}
                    onChange={(e) => setSelectedReason(e.
                    target.value)}
                  >
                    <option value="">Select </option>
                    {itemTypeList?.map((item, index) => (
                      <option key={item?._id || index} value={item?._id}>
                        {item?.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-12 mb-3">
                  <label>Comment <b style={{color:'red'}}>*</b></label>
                  <textarea
                    className="form-control"
                    placeholder="Enter"
                    rows="3"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                  />
                </div>
              </div>
            </div> */}
          </div>
        </Modal.Body>
        <Modal.Footer className="justify-content-center border-0 pt-2 pb-4 gap-4">
          {/* <button className="btn btn-primary w-50" onClick={onClose}>
          Back
        </button> */}

          <button
            type="button"
            className="btn btn-danger"
            data-bs-dismiss="modal"
            onClick={() => cancelReturn()}
          >
            Cancel Return
          </button>
          <button
            type="button"
            className="btn btn-primary"
            data-bs-toggle="modal"
            onClick={() => handleYesReturn()}
            disabled={isReturnDisabled}
          >
            Yes, Return
          </button>


        </Modal.Footer>
      </Modal>

      <Modal
        show={yesReturnModal}
        onClick={() => handleCloseYesReturn()}
        centered
        size="md"
        className="cancelModal"
        id="yesreturnModal"
      >
        <Modal.Header closeButton className="border-0"></Modal.Header>
        <Modal.Body className="text-center">
          <div style={{ width: "200px", height: "200px", margin: "auto" }}>
            <lottie-player
              src="/images/landingpage/women-doing-yoga.json"
              background="transparent"
              speed="1"
              style={{ width: "100%", height: "100%" }}
              loop
              autoplay
            ></lottie-player>
          </div>
          {/* <h2 className="fs-6">Are you sure?</h2>
          <p className="mb-0">Do you really want to return order?</p> */}
          <p>To return a product, email <a href="mailto:info@vedichealth.org">info@vedichealth.org</a> with your Order ID, the Product Name, and the Reason for returning the order.</p>
        </Modal.Body>
        <Modal.Footer className="modal-footer justify-content-center border-0 pt-2 pb-4">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleCloseYesReturn}
          >
            Back
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              applyforReturn();
            }}
          >
            Yes
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
