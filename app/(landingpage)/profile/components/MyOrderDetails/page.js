'use client';
import { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
import "../../../../../app/(landingpage)/LandingPage/public/css/style.css";

export default function MyOrderDetails({ show, onClose, order }) {
  const [userData, setUserData] = useState();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setUserData(user);
  }, []);

  const formatAmount = (value) => {
  const num = Number(value || 0);
  return Number.isInteger(num) ? num : num.toFixed(2);
};

  return (
    <Modal show={show} onHide={onClose} centered size="xl" className="orderModal">


      <div className="modal-content border-0" style={{ minWidth: '600px' }}>
        <div className="modal-header border-0">
          <h1 className="modal-title fs-6">Order Detail</h1>
          <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={onClose}></button>
        </div>
        <div className="modal-body">
          <h3 className="fs-7">Shipping Address</h3>
          <div className="mb-3 locatonDiv">
            <span className="fw-medium d-flex fs-8 align-items-start">
              <img src="/images/landingpage/location-red-icon.svg" alt="" className="me-3" width="16" />
              <div>
                <b className="d-block fw-semibold mb-1">{order?.address?.name || ""}</b>
                {/* {order?address?flatNo || ""} */}

                <span>
                  {[
                    order?.address?.flatNo,
                    order?.address?.area,
                    order?.address?.city,
                    order?.address?.state,
                    order?.address?.country,
                    order?.address?.pincode
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </span>
                <b className="d-block fw-semibold mt-1">{order?.address?.mobile ? "+1-" + order?.address?.mobile : "N/A"}</b>
              </div>
            </span>
          </div>
          <div className="mb-3">
            <h3 className="fs-7">Your Products</h3>
            <div className="table-responsive yourProducttbl">
              <table className="table mb-0">
                {order?.orderItems?.length > 0 ? order?.orderItems.map((ele, ind) => (
                  <tr key={ind}>
                    <td>
                      <div className="productTable">
                        <figure className="m-0">
                          <img src={order.orderProducts.find(item => item._id === ele._id)?.coverImage?`${process.env.NEXT_PUBLIC_API_URL}/${ele.coverImage}`:"/images/landingpage/amalaki-powder-img.jpg"} alt="" />
                        </figure>
                        <h6>{ele?.productName}</h6>
                        {order?.returnorders?.length>0&&order?.returnorders[0]?.productId.includes(ele._id)&&<h6>(Returned)</h6>}
                      </div>
                    </td>
                    <td className="qty">QTY.{ele?.quantity}</td>
                    <td className="fw-semibold">$ {ele?.productPrice}</td>
                  </tr>
                )) : (
                  <tr className="text-center">
                    <td colSpan={3}>No Records</td>
                  </tr>
                )}
              </table>
            </div>
          </div>
          <div className="mb-3">
            <h3 className="fs-7">Payment Detail</h3>
            <div className="paymentdetail">
              <span>Sub Total<b>$ {formatAmount(order?.totalAmount || 0)}</b></span>
              <span>Discount<b>$ {formatAmount(order?.discountAmount || 0)}</b></span>
              <span>Delivery Charges<b>${formatAmount(order?.deliveryCharge || 0)}</b></span>
              <strong>Grand Total<b>$ {formatAmount(order?.grandTotal || 0)}</b></strong>
            </div>
          </div>
        </div>


        <Modal.Footer className="modal-footer justify-content-center border-0 pt-2 pb-4">
          <button type="button" className="btn btn-primary" onClick={onClose}>Back</button>
        </Modal.Footer>
      </div>
    </Modal>
  );
}
