"use client";
import React, { useState, useEffect } from "react";

function InvoicePage({ data, footerData }) {

  console.log(data, "invoice data invoice data invoice data")
  const [user, setUser] = useState({});

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = JSON.parse(localStorage.getItem("user") || "{}");
        setUser(stored);
      } catch (err) {
        console.error("Failed to read user from localStorage", err);
      }
    }
  }, []);

  if (!data || !footerData) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <h3>No invoice data available</h3>
      </div>
    );
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const parsed = new Date(dateStr);
    if (isNaN(parsed.getTime())) return dateStr;
    return parsed.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDateWithTime = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const day = date.getUTCDate().toString().padStart(2, "0");
    const month = date.toLocaleString("en-US", {
      month: "short",
      timeZone: "UTC",
    });
    const year = date.getUTCFullYear();
    const hours = date.getUTCHours().toString().padStart(2, "0");
    const minutes = date.getUTCMinutes().toString().padStart(2, "0");

    return `${day} ${month}, ${year} ${hours}:${minutes}`;
  };

  const invoiceNo = data?.invoiceNo || data?.invoiceNumber || data?._id || "N/A";
  console.log(data,"jjjjjjjjj")

  const invoiceDate = data?.created_at || data?.invoiceDate || data?.date || data?.membership?.purchaseDate;
  const invoiceAmount =
    data?.grandTotal ??
    data?.invoiceAmount ??
    data?.totals?.total ??
    data?.amount ??
    0;
  const isMembershipInvoice = Boolean(data?.membership);
  const currencySymbol = isMembershipInvoice ? "$" : "$";
  const customerId =  user.vedicCustomerId ||data?.customer?.id || data?.customer_id || "";
  const billingName = data?.address?.["name"] || `${data?.customer?.name}` || user?.name || "Customer";
  console.log(data?.address?.["name"] , `${data?.customer?.name}` , user?.name , "Customer")
  const billingAddress =[
  data?.billingAddress1,
  data?.billingAddress2,
  data?.billingCity,
  data?.billingState,
  data?.billingCountry,
  data?.billingZipcode
]
  .filter(v => v && v.trim() !== "")
  .join(", ");
   
    // (` ${data?.billingAddress1 ||""},${data?.billingAddress2|| ""}, ${data?.billingCity || ""}, ${data?.billingState || ""}, ${data?.billingCountry || ""}, ${data?.billingZipcode || ""}`
    //   );
  const billingContact = data?.billingAddress2 || data?.customer?.mobile || data?.address?.mobile || "";
  const billingEmail = data?.customer?.email || data?.address?.email || user?.email || "";
  const billingContactNo = data?.address?.mobile || user?.mobileNo
  const orderItems =
    data?.orderItems && data.orderItems.length > 0
      ? data.orderItems
      : data?.membership
        ? [
          {
            productName: data?.membership?.name || "Membership",
            productPrice: data?.membership?.unitPrice || data?.invoiceAmount || data?.amount || 0,
            quantity: data?.membership?.quantity || 1,
          },
        ]
        : [
          {
            productName: data?.plan_name || data?.name || "Item",
            productPrice: data?.invoiceAmount || data?.amount || 0,
            quantity: data?.membership?.quantity || 1,
          },
        ];
  const subTotal =
    data?.totalAmount ??
    data?.totals?.subtotal ??
    data?.membership?.subtotal ??
    invoiceAmount;
  const discountAmount =
    data?.discountAmount ??
    data?.totals?.discount ??
    data?.membership?.discount ??
    0;
  const deliveryCharge = data?.deliveryCharge ?? 0;
  const grandTotal =
    data?.grandTotal ??
    data?.totals?.total ??
    data?.membership?.total ??
    invoiceAmount;
  const cardType = data?.paymentDetails?.card?.brand || ''
  const last4digit = data?.paymentDetails?.card?.last4 || ''
  const paymentMethod = data?.paymentMethod || "";
  const paymentStatus = data?.status || "";
console.log(data?.paymentDetails?.card,"data?.paymentDetails?.card?.brand")
  return (
    <>
      <table
        style={{
          width: 680,
          margin: "auto",
          borderSpacing: 0,
          cellspacing: 0,
          background: "#FFFFFF",
          boxShadow: "0px 0px 6px #00000029",
          borderRadius: 6,
          padding: 20
        }}
        cellSpacing={0}
      >
        <tbody>
          <tr style={{ borderBottom: "1px solid #70707030" }}>
            <th>
              <table style={{ width: "100%" }}>
                <tbody>
                  <tr>
                    <td
                      width="70%"
                      style={{
                        padding: 15,
                        textAlign: "left",
                        verticalAlign: "baseline",
                        borderBottom: "1px solid #C2C2C2"
                      }}
                    >
                      <img src="/images/landingpage/Vedic-Yours.png" width={180} />
                    </td>
                    <td
                      style={{
                        textAlign: "left",
                        padding: 15,
                        borderBottom: "1px solid #C2C2C2"
                      }}
                    >
                      <strong
                        style={{
                          display: "block",
                          fontSize: 14,
                          fontWeight: "bold"
                        }}
                      >
                        INVOICE
                      </strong>
                      <p
                        style={{
                          display: "inline-block",
                          fontSize: 10,
                          fontWeight: "bold",
                          margin: 0
                        }}
                      >
                        <b style={{ fontWeight: "normal" }}>Invoice</b> # 
                        {/* INV-C-2024-41212012 */}
                        {invoiceNo}
                      </p>
                      <p
                        style={{
                          display: "inline-block",
                          fontSize: 10,
                          fontWeight: "bold",
                          margin: 0
                        }}
                      >
                        <b style={{ fontWeight: "normal" }}>Invoice Date</b> {formatDate(invoiceDate)}
                      </p>
                      <p
                        style={{
                          display: "inline-block",
                          fontSize: 10,
                          fontWeight: "bold",
                          margin: 0
                        }}
                      >
                        <b style={{ fontWeight: "normal" }}>Invoice Amount</b> {currencySymbol}{" "}
                        {invoiceAmount}
                      </p>
                      <p
                        style={{
                          display: "inline-block",
                          fontSize: 10,
                          fontWeight: "bold",
                          margin: 0
                        }}
                      >
                        <b style={{ fontWeight: "normal" }}>Customer ID</b>{" "}
                        {customerId || "N/A"}
                      </p>{" "}
                      <br />
                      <p
                        style={{
                          display: "inline-block",
                          fontSize: 12,
                          fontWeight: "bold",
                          margin: 0,
                          color: "#00BE55"
                        }}
                      >
                        PAID
                      </p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </th>
          </tr>
          <tr>
            <td colSpan={9}>
              <table width="100%">
                <tbody>
                  <tr>
                    <td
                      style={{
                        padding: 15,
                        fontWeight: "normal",
                        fontSize: 14,
                        color: "#0546FF"
                      }}
                      align="left"
                    >
                      <strong style={{ fontWeight: "bold" }}>From:</strong>
                    </td>
                    <td
                      align="left"
                      style={{
                        fontSize: 14,
                        textAlign: "right",
                        padding: 15,
                        color: "#0546FF"
                      }}
                    >
                      <strong> To: </strong>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
          <tr>
            <td>
              <table style={{ width: "100%" }}>
                <tbody>
                  <tr>
                    <td align="left" style={{ padding: 15, paddingTop: 0 }}>
                      <span style={{ fontSize: 14, fontWeight: "bold" }}>
                        Vedic Yours Inc.
                      </span>
                      <br />
                      {footerData?.address && (
                        <span style={{ fontSize: 11, color: "#ADABAB" }}>
                          {footerData?.address}
                        </span>
                      )}
                      <br />
                      {footerData?.number && (
                        <span style={{ fontSize: 11 }}>
                          {footerData?.number}
                        </span>
                      )}
                      <br />
                      {footerData?.email && (
                        <span style={{ fontSize: 11 }}>
                          {footerData?.email}
                        </span>
                      )}

                    </td>
                    <td style={{ padding: 15, paddingTop: 0 }} align="end">
                      <span
                        style={{
                          display: "inline-block",
                          fontSize: 14,
                          fontWeight: "bold"
                        }}
                      >
                        {billingName}
                      </span>{" "}
                      <br />
                      <span
                        style={{
                          display: "inline-block",
                          fontSize: 11,
                          color: "#ADABAB"
                        }}
                      >
                        {billingAddress}

                      </span>{" "}
                      <br />
                      {/* {billingContact !== "" && <><span style={{ display: "inline-block", fontSize: 11 }}>
                        {billingContact}
                      </span></>}
                      <br /> */}
                      {billingContactNo && <><span style={{ display: "inline-block", fontSize: 11 }}>
                        {billingContactNo}
                      </span><br /></>}

                      <span style={{ display: "inline-block", fontSize: 11 }}>
                        {billingEmail || " "}
                      </span>{" "}
                      <br />
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
          <tr>
            <td>
              <table style={{ width: "100%", fontWeight: "bold" }}>
                <tbody>
                  <tr style={{ borderBottom: "1px solid #707070" }}>
                    <td
                      style={{
                        padding: 12,
                        verticalAlign: "top",
                        textAlign: "start",
                        color: "#000000",
                        fontSize: 12,
                        fontWeight: "bold",
                        borderBottom: "1px solid #C2C2C2",
                        borderTop: "1px solid #C2C2C2"
                      }}
                    >
                      DESCRIPTION
                    </td>
                    <td
                      style={{
                        padding: 12,
                        verticalAlign: "top",
                        color: "#000000",
                        fontSize: 12,
                        fontWeight: "bold",
                        borderBottom: "1px solid #C2C2C2",
                        borderTop: "1px solid #C2C2C2"
                      }}
                    >
                      COST
                    </td>
                    <td
                      style={{
                        padding: 12,
                        verticalAlign: "top",
                        color: "#000000",
                        fontSize: 12,
                        fontWeight: "bold",
                        borderBottom: "1px solid #C2C2C2",
                        borderTop: "1px solid #C2C2C2"
                      }}
                    >
                      UNIT
                    </td>
                    <td
                      style={{
                        padding: 12,
                        verticalAlign: "top",
                        color: "#000000",
                        fontSize: 12,
                        fontWeight: "bold",
                        borderBottom: "1px solid #C2C2C2",
                        borderTop: "1px solid #C2C2C2"
                      }}
                    >
                      AMOUNT
                    </td>
                  </tr>
                  {orderItems && orderItems.length > 0 &&
                    orderItems.map((order, index) => (
                      <tr key={index} style={{ borderBottom: "1px solid #707070" }}>
                        <td style={{ padding: 12, verticalAlign: "top", textAlign: "start", color: "#000000", fontSize: 12, fontWeight: "bold", borderBottom: "1px solid #C2C2C2" }}>
                          {order.productName}
                        </td>
                        <td style={{ padding: 12, verticalAlign: "top", color: "#000000", fontSize: 12, fontWeight: "normal", borderBottom: "1px solid #C2C2C2" }}>
                          {currencySymbol} {order.productPrice}
                        </td>
                        <td style={{ padding: 12, verticalAlign: "top", color: "#000000", fontSize: 12, fontWeight: "normal", borderBottom: "1px solid #C2C2C2" }}>
                          {order.quantity}
                        </td>
                        <td style={{ padding: 12, verticalAlign: "top", color: "#000000", fontSize: 12, fontWeight: "bold", borderBottom: "1px solid #C2C2C2" }}>
                          {currencySymbol} {order.productPrice * order.quantity}
                        </td>
                      </tr>
                    ))}

                  
                    <>
                      <tr >
                        <td
                          style={{
                            padding: 12,
                            verticalAlign: "top",
                            textAlign: "start",
                            color: "#000000",
                            fontSize: 12,
                            fontWeight: "bold"
                          }}
                        ></td>
                        <td
                          style={{
                            padding: 12,
                            verticalAlign: "top",
                            color: "#000000",
                            fontSize: 12,
                            fontWeight: "normal"
                          }}
                        ></td>
                        <td
                          style={{
                            padding: 12,
                            verticalAlign: "top",
                            color: "#C2C2C2",
                            fontSize: 10,
                            fontWeight: "normal"
                          }}
                        >
                          Sub Total
                        </td>
                        <td
                          style={{
                            padding: 12,
                            verticalAlign: "top",
                            color: "#000000",
                            fontSize: 10,
                            fontWeight: "bold"
                          }}
                        >
                          {currencySymbol} {subTotal || 0}
                        </td>
                      </tr>
                      <tr >
                        <td
                          style={{
                            padding: 12,
                            verticalAlign: "top",
                            textAlign: "start",
                            color: "#000000",
                            fontSize: 12,
                            fontWeight: "bold"
                          }}
                        ></td>
                        <td
                          style={{
                            padding: 12,
                            verticalAlign: "top",
                            color: "#000000",
                            fontSize: 12,
                            fontWeight: "normal"
                          }}
                        ></td>
                        <td
                          style={{
                            padding: 12,
                            verticalAlign: "top",
                            color: "#C2C2C2",
                            fontSize: 10,
                            fontWeight: "normal",
                          }}
                        >
                          Discount
                        </td>
                        <td
                          style={{
                            padding: 12,
                            verticalAlign: "top",
                            color: "#000000",
                            fontSize: 10,
                            fontWeight: "bold"
                          }}
                        >
                          {currencySymbol} {discountAmount || 0}
                        </td>
                      </tr>
                      {!isMembershipInvoice && (<tr >
                        <td
                          style={{
                            padding: 12,
                            verticalAlign: "top",
                            textAlign: "start",
                            color: "#000000",
                            fontSize: 12,
                            fontWeight: "bold"
                          }}
                        ></td>
                        <td
                          style={{
                            padding: 12,
                            verticalAlign: "top",
                            color: "#000000",
                            fontSize: 12,
                            fontWeight: "normal"
                          }}
                        ></td>
                        <td
                          style={{
                            padding: 12,
                            verticalAlign: "top",
                            color: "#C2C2C2",
                            fontSize: 10,
                            fontWeight: "normal",
                            borderBottom: "1px solid #C2C2C2"
                          }}
                        >
                          Delivery
                        </td>
                        <td
                          style={{
                            padding: 12,
                            verticalAlign: "top",
                            color: "#000000",
                            fontSize: 10,
                            fontWeight: "bold",
                            borderBottom: "1px solid #C2C2C2"
                          }}
                        >
                          {currencySymbol} {deliveryCharge || 0}
                        </td>
                      </tr>)}
                    </>
                  
                  <tr>
                    <td
                      style={{
                        padding: 12,
                        verticalAlign: "top",
                        textAlign: "start",
                        color: "#000000",
                        fontSize: 12,
                        fontWeight: "bold"
                      }}
                    ></td>
                    <td
                      style={{
                        padding: 12,
                        verticalAlign: "top",
                        color: "#000000",
                        fontSize: 12,
                        fontWeight: "normal"
                      }}
                    ></td>
                    <td
                      style={{
                        padding: 12,
                        verticalAlign: "top",
                        color: "#C2C2C2",
                        fontSize: 12,
                        fontWeight: "normal",                        
                            borderBottom: "1px solid #C2C2C2"
                      }}
                    >
                      Total
                    </td>
                    <td
                      style={{
                        padding: 12,
                        verticalAlign: "top",
                        color: "#000000",
                        fontSize: 12,
                        fontWeight: "bold",
                            borderBottom: "1px solid #C2C2C2"
                      }}
                    >
                      {currencySymbol} {grandTotal || 0}
                    </td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid #707070" }}>
                    <td
                      colSpan={4}
                      style={{
                        padding: 12,
                        verticalAlign: "top",
                        textAlign: "start",
                        color: "#000000",
                        fontSize: 12,
                        fontWeight: "bold"
                      }}
                    >
                      PAYMENTS <br />
                      <p style={{ fontSize: 10, fontWeight: "normal" }}>
                        <b>{currencySymbol} {grandTotal || 0}</b> was paid on {formatDateWithTime(invoiceDate)}
                        {(cardType != "" && last4digit != "") ? <span>{cardType} {last4digit}  </span> : paymentMethod != "" ?  <span className="ml-3"> | Payment Method: {paymentMethod }</span> : <span className="ml-3"> | Payment Status: {paymentStatus}</span>}.
                      </p>
                    </td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid #707070" }}>
                    <td
                      colSpan={4}
                      style={{
                        padding: 12,
                        verticalAlign: "top",
                        textAlign: "center",
                        color: "#000000",
                        fontSize: 18,
                        fontWeight: "bold",
                        marginTop: 30,
                        paddingTop: 40
                      }}
                    >
                      Thank you for trusting us <br />
                      <p style={{ fontSize: 10, fontWeight: "normal", paddingTop: 0, color: "#ADABAB" }}>
                        {/* {footerData?.address || " "} */}
                      </p>

                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
    </>
  )
}

export default InvoicePage
