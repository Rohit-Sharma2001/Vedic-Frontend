"use client";

import { useEffect, useState, useRef } from "react";
import { Container, Row, Col, Button, Table, Card, Pagination, Modal } from "react-bootstrap";
import Link from "next/link";
import { config } from "services/config";
import { postApi } from "services/api";
import InvoicePage from "app/(landingpage)/profile/components/invoicePage/page";
import InvoicePageAdmin from "../../../invoicePage/page";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import Loader from "services/Loader/page";
import { Eye } from 'react-bootstrap-icons';
import { DateTime } from "luxon";
import Swal from "sweetalert2";
import { useRouter } from 'next/navigation';

export default function ViewPractitioner({ params }) {
    const { id } = params;

    const [userData, setUserData] = useState(null);
    const [centersList, setCentersList] = useState([]);
    const [activeSection, setActiveSection] = useState("userDetails");
    const [sectionData, setSectionData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [invoiceData, setInvoiceData] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [downloadingInvoice, setDownloadingInvoice] = useState(false);
    const [eventViewData, setEventViewData] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [showEventModal, setShowEventModal] = useState(false);
    const [dateSortOrder, setDateSortOrder] = useState("asc"); // "asc" | "desc"
    const [orderDateSortOrder, setOrderDateSortOrder] = useState("asc"); // "asc" | "desc"
    const [membershipDateSortOrder, setMembershipDateSortOrder] = useState("desc");
    const [footerData, setFooterData] = useState({
        address: "",
        email: "",
        number: ""
    });
    const [selectedMembershipIndex, setSelectedMembershipIndex] = useState(false);
    const [selectedMembershipIndex1, setSelectedMembershipIndex1] = useState(false);
    const router = useRouter();

    const invoiceRef = useRef(null);
    useEffect(() => {

        const fetchFooterData = async () => {
            try {
                const endpoint = config.Viewcategory;
                const data = { id: "67f4da7497d93651914eb2f7" };
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

    useEffect(() => {
        if (id) {
            fetchCenters();
            fetchEmployeeDetails();
            fetchSectionData("userDetails", 1);
        }
    }, [id]);

    useEffect(() => {
        if (activeSection) {
            fetchSectionData(activeSection, currentPage);
        }
    }, [currentPage]);

    const fetchCenters = async () => {
        try {
            const res = await postApi(config.centers, { page: 1, pageSize: 100 });
            const centers = res?.centers || [];
            setCentersList(
                centers.map((c) => ({
                    label: c.centerName,
                    value: c._id,
                }))
            );
        } catch (err) {
            console.error(err);
        }
    };

    const fetchEmployeeDetails = async () => {
        try {
            const res = await postApi(config.viewUser, { _id: id });
            const emp = res?.data?.[0];
            setUserData(emp);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSectionClick = (type) => {
        setActiveSection(type);
        setCurrentPage(1);
        fetchSectionData(type, 1);
    };

    const fetchSectionData = async (type, page = 1) => {
        setLoading(true);

        let apiUrl = "";
        let payload = {
            page,
            pageSize
        };

        if (type === "events") {
            apiUrl = config.findByUserEvents;
            payload.id = userData?._id;
        }

        if (type === "shop") {
            apiUrl = config.FindUserOrders;
            payload.user = userData?._id;
        }

        if (type === "appointments") {
            apiUrl = config.FindAppointmentByUser;
            payload._id = userData?._id;
            payload.status = "all";


            let apiUrl1 = config.findAppointment;
            let payload1 = {
                employeeId: userData?.employeeId,
                $or: [
                    { type: { $ne: "appointment" } },
                    {
                        $and: [
                            { type: "appointment" },
                            { status: { $ne: "notPaid" } }
                        ]
                    }
                ]
            };
            const res = await postApi(apiUrl1, payload1);
            console.log(res, "resresresresresresresres")
            let data = res?.data || [];

            setEventViewData(data);




        }

        // if (type === "invoices") {
        //     apiUrl = config.getUserSubscriptionDetails;
        //     payload.user_id = userData?._id;
        // }
        if (type === "invoices") {
            apiUrl = config.getUserSubscriptionDetails;
            payload.user_id = userData?._id;
        }

        if (type === "userDetails") {
            apiUrl = config.viewUser;
            payload._id = id;
        }

        if (type === "membership" || type === "card") {
            apiUrl = config.viewUser;
            payload._id = id;
        }

        try {
            const res = await postApi(apiUrl, payload);

            let data =
                // type === "events" ? res?.event || [] : type === "userDetails" ? res?.data?.[0] || {} : type === "invoices" ? res?.data?.invoices || [] : res?.data || [];

                type === "events"
                    ? res?.event || []
                    : type === "userDetails"
                        ? res?.data?.[0] || {}
                        : type === "membership"
                            ? res?.data?.[0]?.membershipDetails || []
                            : type === "card"
                                ? [...res?.data?.[0]?.orderDetailsForCard,...res?.data?.[0]?.membershipHistory] || []
                                : type === "invoices"
                                    ? res?.data?.invoices || []
                                    : res?.data || [];

            // setSectionData(data);
            // REPLACE:
setSectionData(data);

// WITH:
// Sort by latest first based on section type
if (Array.isArray(data)) {
  data.sort((a, b) => {
    let dateA, dateB;

    if (type === "appointments") {
      dateA = a?.date ? new Date(a.date).getTime() : 0;
      dateB = b?.date ? new Date(b.date).getTime() : 0;
    } else if (type === "events") {
      dateA = a?.event?.date ? new Date(a.event.date).getTime() : 0;
      dateB = b?.event?.date ? new Date(b.event.date).getTime() : 0;
    } else if (type === "membership") {
      dateA = a?.created_at ? new Date(a.created_at).getTime() : 0;
      dateB = b?.created_at ? new Date(b.created_at).getTime() : 0;
    } else {
      // shop, invoices, card, etc.
      dateA = a?.created_at ? new Date(a.created_at).getTime() : 0;
      dateB = b?.created_at ? new Date(b.created_at).getTime() : 0;
    }

    return dateB - dateA; // latest first
  });
}
setSectionData(data);

            setTotalCount(res?.totalCount || data.length);
            setTotalPages(
                type === "card" ? res.data.filter((res) => res.paymentDetails).length + 1 : 0 ||
                    res?.totalPages ||
                    Math.ceil((res?.totalCount || data.length) / pageSize)
            );
        } catch (err) {
            console.error(err);
        }

        setLoading(false);
    };

    const formatTo12Hour = (time) => {
        if (!time) return "-";
        const [hour, minute] = time.split(":");
        const date = new Date();
        date.setHours(hour, minute);
        return date.toLocaleString("en-US", {
            hour: "numeric",
            minute: "numeric",
            hour12: true,
        });
    };

    const normalizeEventForModal = (item) => {
        if (!item) return null;
        if (item?.extendedProps) return item;

        const startDateTime = item?.date && item?.time ? `${item.date}T${item.time}` : item?.date || item?.startStr;
        const parsedStart = startDateTime ? DateTime.fromISO(startDateTime) : null;
        const duration = item?.duration || item?.durationMins || 0;
        const endDateTime = parsedStart && duration
            ? parsedStart.plus({ minutes: Number(duration) }).toISO()
            : item?.endStr;

        return {
            ...item,
            startStr: parsedStart?.isValid ? parsedStart.toISO() : item?.startStr,
            endStr: endDateTime,
            extendedProps: {
                ...item,
                type: item?.type || "appointment",
                service: item?.service || item?.serviceDetails,
                employee: item?.employee || item?.employeeDetails,
                user: item?.user || { name: userData?.name || "-", email: userData?.email || "-" },
                centerData: item?.centerData || item?.center || item?.centerInfo,
                price: item?.price ?? item?.amount ?? item?.totalAmount ?? 0,
                status: item?.status,
                _id: item?._id,
                note: item?.note || item?.description,
                duration,
            },
        };
    };

    const downloadInvoice = async (invoice) => {
        const payload = prepareInvoicePayload(invoice);
        if (!payload) return;

        setInvoiceData(payload);
        setDownloadingInvoice(true);

        setTimeout(async () => {
            const element = invoiceRef.current;
            if (!element) {
                setDownloadingInvoice(false);
                return;
            }

            try {
                const canvas = await html2canvas(element, {
                    backgroundColor: "#ffffff",
                    scale: 2,
                });
                const imgData = canvas.toDataURL("image/png");
                const pdf = new jsPDF("p", "pt", "a4");
                const imgProps = pdf.getImageProperties(imgData);
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

                pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
                pdf.save(`${payload?.invoiceNo || "invoice"}.pdf`);
            } catch (error) {
                console.error("Error generating invoice PDF:", error);
            } finally {
                setDownloadingInvoice(false);
            }
        }, 150);
    };
    console.log(selectedEvent, "sellwalalsalskaksalskaksssssskkkkkkkkkkk")
    const handleView = async (passData) => {
        console.log(passData, "passDataapassDataapassDataapassDataa")
        const normalized = normalizeEventForModal(passData);
        setSelectedEvent(normalized);
        setShowEventModal(true);
    }

    const prepareInvoicePayload = (invoice) => {
        if (!invoice) return null;

        const lineItem = {
            productName: invoice?.membership?.name || invoice?.plan_name || invoice?.name || "Membership",
            productPrice: invoice?.membership?.unitPrice ?? invoice?.invoiceAmount ?? invoice?.amount ?? 0,
            quantity: invoice?.membership?.quantity ?? 1,
        };

        const subtotal = invoice?.totals?.subtotal ?? invoice?.membership?.subtotal ?? invoice?.invoiceAmount ?? invoice?.amount ?? 0;
        const discount = invoice?.totals?.discount ?? invoice?.membership?.discount ?? 0;
        const deliveryCharge = 0;
        const grandTotal =
            invoice?.totals?.total ??
            invoice?.membership?.total ??
            invoice?.invoiceAmount ??
            invoice?.amount ??
            subtotal - discount;

        return {
            ...invoice,
            invoiceNo: invoice?.invoiceNumber || invoice?.invoiceNo,
            created_at: invoice?.invoiceDate || invoice?.date || invoice?.membership?.purchaseDate,
            grandTotal,
            totalAmount: subtotal,
            discountAmount: discount,
            deliveryCharge,
            orderItems: [lineItem],
            address: {
                name: `${invoice?.customer?.name} ${invoice?.customer?.lastName}`,
                mobile: invoice?.customer?.mobile,
            },
            billingAddress1: [
  invoice?.customer?.address1,
  invoice?.customer?.address2,
  invoice?.customer?.city,
  invoice?.customer?.state,
  invoice?.customer?.country,
  invoice?.customer?.zipcode
]
    .filter(v => v && v.trim() !== "") // removes empty strings also
  .join(", "),
            // billingAddress2: invoice?.customer?.email || "",
        };
    };
    if (!userData) return <div>Loading...</div>;

    const shouldShowCancelButton = (membership) => {
    return membership.status === "paid" && membership.is_expired !== true;
  };
  const cancelMembership = async (membership,user_id) => {
      console.log(membership, user_id,"membership");
      
      const result = await Swal.fire({
        title: "Cancel Membership?",
        text: `Are you sure you want to cancel membership?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#dc2626",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Yes, Cancel Membership",
        cancelButtonText: "No, Keep It"
      });
  
      if (result.isConfirmed) {
        try {
          setLoading(true);
          
          const response = await postApi(config.cancelMembership, {
            plan_id: membership._id,
            user_id: user_id
          });
  
          if (response?.statusCode === 200 || response?.statusCode === 201) {
            Swal.fire({
              title: "Cancelled!",
              text: "Your membership has been cancelled successfully.",
              icon: "success"
            });
            
            await handleSectionClick('membership');
            
            // const modal = bootstrap.Modal.getInstance(document.getElementById("membershipDetailModal"));
            // if (modal) modal.hide();
            // cleanUpModal();
          } else {
            Swal.fire("Error", response?.message || "Failed to cancel membership", "error");
          }
        } catch (error) {
          console.error("Error cancelling membership:", error);
          Swal.fire("Error", "Failed to cancel membership. Please try again.", "error");
        } finally {
          setLoading(false);
        }
      }
    };
    const getStatus = (item) => {
  const renewalDate = new Date(item.renewal_date);
  const today = new Date();

  if (item.is_expired) {
    return renewalDate > today ? "cancelled" : "expired";
  }

  return item.status;
};

    return (
        <Container fluid className="p-4">
            {(downloadingInvoice) && <Loader />}
            <Link href="/admin/users">
                <Button variant="secondary" className="mb-3 float-end">
                    Back
                </Button>
            </Link>

            <Card className="p-4 mt-4 shadow-sm">
                <Card.Body>

                    <h2 style={{ fontWeight: "600", color: "#000" }} className="mb-4">User Details and Purchased History</h2>
                    <h4 style={{ fontWeight: "600", color: "#000" }}>Name: - {userData?.name || "-"} {userData?.lastName || ""}</h4>

                    {/* <Row className="text-center mt-3">
                        {["userDetails", "events", "shop", "appointments", "invoices"].map((tab) => (
                            <Col md={3} key={tab} className="mb-3">
                                <Card
                                    onClick={() => handleSectionClick(tab)}
                                    className="p-2 pt-3 shadow"
                                    style={{
                                        cursor: "pointer",
                                        backgroundColor: activeSection === tab ? "#624bff" : "#bfb6b679",
                                        color: activeSection === tab ? "#fff" : "#000"
                                    }}
                                >
                                    <h5 style={{ color: activeSection === tab ? "#fff" : "#000" }}>
                                        {tab === "userDetails" && "User Detail"}
                                        {tab === "events" && "Events"}
                                        {tab === "shop" && "Orders"}
                                        {tab === "appointments" && "Appointments"}
                                        {tab === "invoices" && "Invoices"}
                                    </h5>
                                </Card>
                            </Col>
                        ))}
                    </Row> */}

                    <div className="d-flex mt-3 w-100">
                        {["userDetails", "events", "shop", "appointments", "membership", "invoices", "card"].map((tab) => (
                            <div key={tab} style={{ flex: 1, margin: "0 8px" }}>
                                <Card
                                    onClick={() => handleSectionClick(tab)}
                                    className="p-3 shadow text-center"
                                    style={{
                                        cursor: "pointer",
                                        width: "100%",
                                        backgroundColor: activeSection === tab ? "#624bff" : "#bfb6b679",
                                        color: activeSection === tab ? "#fff" : "#000",
                                        borderRadius: "10px"
                                    }}
                                >
                                    <h5 style={{ margin: 0 }}>
                                        {tab === "userDetails" && "User Detail"}
                                        {tab === "events" && "Events"}
                                        {tab === "shop" && "Orders"}
                                        {tab === "appointments" && "Appointments"}
                                        {tab === "membership" && "Membership"}
                                        {tab === "invoices" && "Invoices"}
                                        {tab === "card" && "Card Details"}
                                    </h5>
                                </Card>
                            </div>
                        ))}
                    </div>

                    <Card className="mt-4 shadow-sm">
                        <Card.Body>

                            {loading ? (
                                <div className="text-center py-4">Loading...</div>
                            ) : activeSection === "userDetails" ? (
                                <>
                                    {/* 🔹 BASIC DETAILS */}
                                    <h5 className="mt-4 text-primary fw-bold">Basic Details</h5>
                                    <Table bordered responsive>
                                        <tbody>
                                            <tr>
                                                <th>First Name</th><td>{sectionData?.name || "N/A"}</td>
                                                <th>Last Name</th><td>{sectionData?.lastName || "N/A"}</td>
                                            </tr>
                                            <tr>
                                                <th>Email</th><td>{sectionData?.email || "N/A"}</td>
                                                <th>Mobile</th><td>{sectionData?.mobileNo || "N/A"}</td>
                                            </tr>
                                            <tr>
                                                <th>DOB</th><td>{sectionData?.dob || "N/A"}</td>
                                                <th>Gender</th><td>{sectionData?.gender || "N/A"}</td>
                                            </tr>
                                            <tr>
                                                <th>Profile Image</th>
                                                <td>
                                                    <img
                                                        src={`${process.env.NEXT_PUBLIC_API_URL}/${sectionData?.image}`}
                                                        alt={sectionData?.name}
                                                        width={100}
                                                        height={100}
                                                    />
                                                </td>
                                                <th>Created At</th>
                                                <td>
                                                    {sectionData?.date
                                                        ? new Date(sectionData.date).toLocaleString("en-US")
                                                        : "—"}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </Table>

                                    {/* 🔹 ADDRESS DETAILS */}
                                    <h5 className="mt-4 text-primary fw-bold">Address Details</h5>
                                    <Table bordered responsive>
                                        <tbody>
                                            <tr>
                                                <th>Address 1</th><td>{sectionData?.address1 || "N/A"}</td>
                                                <th>Address 2</th><td>{sectionData?.address2 || "N/A"}</td>
                                            </tr>
                                            <tr>
                                                <th>City</th><td>{sectionData?.city || "N/A"}</td>
                                                <th>State</th><td>{sectionData?.state || "N/A"}</td>
                                            </tr>
                                            <tr>
                                                <th>Country</th><td>{sectionData?.country || "N/A"}</td>
                                                <th>Zipcode</th><td>{sectionData?.zipcode || "N/A"}</td>
                                            </tr>
                                        </tbody>
                                    </Table>

                                    {/* 🔹 FAMILY MEMBERS */}
                                    <h5 className="mt-4 text-primary fw-bold">Family Members</h5>
                                    <Table bordered responsive>
                                        <thead>
                                            <tr>
                                                <th>First Name</th>
                                                <th>Last Name</th>
                                                <th>Relation</th>
                                                <th>Email</th>
                                                <th>Phone</th>
                                                <th>Gender</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sectionData?.userFamilyDetails?.length > 0 ? (
                                                sectionData.userFamilyDetails.map((member, index) => (
                                                    <tr key={member._id || index}>
                                                        <td>{member.firstName || "N/A"}</td>
                                                        <td>{member.lastName || "N/A"}</td>
                                                        <td>{member.relation || "N/A"}</td>
                                                        <td>{member.email || "N/A"}</td>
                                                        <td>{member.phone || "N/A"}</td>
                                                        <td>{member.gender || "N/A"}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="6" className="text-center">
                                                        No Family Members Found
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </Table>


                                    {/* <h5 className="mt-4 text-primary fw-bold">Membership Details</h5>
                                    <Table bordered responsive>
                                        <thead>
                                            <tr>
                                                <th>Plan Name</th>
                                                <th>Price</th>
                                                <th>Status</th>
                                                <th>Expire In</th>
                                                <th>Renewal Date</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sectionData?.membershipDetails?.length > 0 ? (
                                                sectionData.membershipDetails.map((item, index) => (
                                                    <>
                                                        <tr>
                                                            <td>{item.plan_name || "N/A"}</td>
                                                            <td>{item.price ? `$ ${item.price}` : "N/A"}</td>
                                                            <td>
                                                                <span style={{
                                                                    color: item.status === "paid" ? "green" : "red",
                                                                    fontWeight: "bold"
                                                                }}>
                                                                    {item.status}
                                                                </span>
                                                            </td>
                                                            <td>{item.expire_in || "N/A"} days</td>
                                                            <td>
                                                                {item.renewal_date
                                                                    ? new Date(item.renewal_date).toLocaleDateString("en-IN")
                                                                    : "N/A"}
                                                            </td>
                                                            <td>
                                                                <button
                                                                    className="btn btn-sm btn-primary"
                                                                    onClick={() =>
                                                                        setSelectedMembershipIndex(
                                                                            selectedMembershipIndex === index ? null : index
                                                                        )
                                                                    }
                                                                >
                                                                    {selectedMembershipIndex === index ? "Hide" : "View"}
                                                                </button>
                                                            </td>
                                                        </tr>

                                                        
                                                        {selectedMembershipIndex === index && (
                                                            <tr>
                                                                <td colSpan="6">
                                                                    <div className="p-3 bg-light border rounded">

                                                                       
                                                                        <h6>Description</h6>
                                                                        <div
                                                                            dangerouslySetInnerHTML={{
                                                                                __html: sectionData?.membership?.[index]?.plan_description || "N/A"
                                                                            }}
                                                                        />

                                                                        
                                                                        <h6 className="mt-3">Features</h6>
                                                                        <ul>
                                                                            {sectionData?.membership?.[index]?.plan_details?.map((feature, i) => (
                                                                                <li key={i}>
                                                                                    <strong>{feature.title}</strong> - {feature.description}
                                                                                </li>
                                                                            ))}
                                                                        </ul>

                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="6" className="text-center">
                                                        No Membership Found
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </Table>

                                   
                                    <h5 className="mt-4 text-primary fw-bold">Card Details</h5>
                                    <Table bordered responsive>
                                        <thead>
                                            <tr>
                                                <th>Card Brand</th>
                                                <th>Card Number (Last  4 Digit) </th>
                                                <th>Membership</th>
                                                <th>Price</th>
                                                <th>Used On</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sectionData?.orderDetailsForCard
                                                ?.filter(item => item?.paymentDetails?.card)
                                                ?.length > 0 ? (

                                                sectionData.orderDetailsForCard
                                                    .filter(item => item?.paymentDetails?.card)
                                                    .map((item, index) => (
                                                        <tr key={index}>
                                                            <td>{item.paymentDetails.card.brand || "N/A"}</td>
                                                            <td>
                                                                **** **** **** {item.paymentDetails.card.last4 || "N/A"}
                                                            </td>
                                                            <td>{item.plan_name || "N/A"}</td>
                                                            <td>{item.price ? `$ ${item.price}` : "N/A"}</td>
                                                            <td>
                                                                {item?.created_at
                                                                    ? new Date(item.created_at).toLocaleString("en-IN", {
                                                                        day: "2-digit",
                                                                        month: "short",
                                                                        year: "numeric",
                                                                        hour: "2-digit",
                                                                        minute: "2-digit"
                                                                    })
                                                                    : "N/A"}
                                                            </td>
                                                        </tr>
                                                    ))

                                            ) : (
                                                <tr>
                                                    <td colSpan="2" className="text-center">
                                                        No Card Details Found
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </Table> */}
                                    <Link href={`/admin/users/user/edit/${id}`} className="btn btn-primary" >Edit Details</Link>
                                </>

                            ) : activeSection === "membership" ? (

                                <>
                                    <h5 className="mt-4 text-primary fw-bold">Membership Details</h5>

                                    <Table bordered responsive>
                                        <thead>
                                                    <tr>
                                                        <th>Plan Name</th>
                                                        <th>Price</th>
                                                        <th>Status</th>
                                                        <th
                                                            style={{ color: "#000", cursor: "pointer", userSelect: "none" }}
                                                            onClick={() => setMembershipDateSortOrder(prev => prev === "asc" ? "desc" : "asc")}
                                                            >
                                                            Purchase Date {membershipDateSortOrder === "asc" ? "↑" : "↓"}
                                                        </th>
                                                        <th>Renewal Date</th>
                                                            {/* <th>Expire In</th> */}
                                                        <th>Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {sectionData.length > 0 ? (
                                                        [...sectionData]
                                                            .sort((a, b) => {
                                                                const dateA = a?.date ? new Date(a.date).getTime() : 0;
                                                                const dateB = b?.date ? new Date(b.date).getTime() : 0;
                                                                return membershipDateSortOrder === "asc" ? dateA - dateB : dateB - dateA;
                                                            })
                                                            .map((item, index) => (
                                                                <>
                                                                    <tr key={index}>
                                                                        <td>{item.plan_name}</td>
                                                                        <td>$ {item.price}</td>
                                                                        <td style={{ color: item.status === "paid" && !item.is_expired ? "green" : "red" }}>
                                                                            {item.is_expired ? getStatus(item) : item.status}
                                                                        </td>
                                                                           <td>
                                                                            {new Date(item.date).toLocaleDateString('en-US')}
                                                                        </td>
                                                                        <td>
                                                                            {new Date(item?.renewal_date).toLocaleDateString('en-US')}
                                                                        </td>

                                                                        {/* <td>{item.expire_in} days</td> */}
                                                                        <td>
                                                                            <button
                                                                                className="btn btn-sm btn-primary"
                                                                                onClick={() =>
                                                                                    setSelectedMembershipIndex1(
                                                                                        selectedMembershipIndex1 === index ? null : index
                                                                                    )
                                                                                }
                                                                            >
                                                                                {selectedMembershipIndex1 === index ? "Hide" : "View"}
                                                                            </button>
                                                                            <button
                                                                                className="btn btn-sm btn-primary m-2"
                                                                                onClick={() =>
                                                                                    router.push(`/admin/Membership-Management/Transactions?openModal=${item._id}`)
                                                                                }
                                                                            >
                                                                                Edit
                                                                            </button>
                                                                        </td>
                                                                    </tr>

                                                                    {selectedMembershipIndex1 === index && (
                                                                        <tr>
                                                                            <td colSpan="7">
                                                                                <div className="p-3 bg-light border rounded">
                                                                                    <h6>Description</h6>
                                                                                    <div
                                                                                        dangerouslySetInnerHTML={{
                                                                                            __html: item?.plan_description || "N/A"
                                                                                        }}
                                                                                    />
                                                                                    <h6 className="mt-3">Features</h6>
                                                                                    <ul>
                                                                                        {item?.plan_details?.map((feature, i) => (
                                                                                            <li key={i}>
                                                                                                <strong>{feature.title}</strong> - {feature.description}
                                                                                            </li>
                                                                                        ))}
                                                                                    </ul>
                                                                                </div>
                                                                            </td>
                                                                        </tr>
                                                                    )}
                                                                </>
                                                            ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan="7" className="text-center">
                                                                No Membership Found
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                    </Table>
                                    {sectionData?.membership?.map((item, index) => {
                                        return selectedMembershipIndex1 === index && (
                                            <tr>
                                                <td colSpan="6">
                                                    <div className="p-3 bg-light border rounded">


                                                        <h6>Description</h6>
                                                        <div
                                                            dangerouslySetInnerHTML={{
                                                                __html: sectionData?.membership?.[index]?.plan_description || "N/A"
                                                            }}
                                                        />


                                                        <h6 className="mt-3">Features</h6>
                                                        <ul>
                                                            {sectionData?.membership?.[index]?.plan_details?.map((feature, i) => (
                                                                <li key={i}>
                                                                    <strong>{feature.title}</strong> - {feature.description}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                        {console.log(sectionData?.membership?.[index],shouldShowCancelButton(sectionData?.membership?.[index]),"lllllllll")}
                                                        

                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    }
                                    )}

                                </>
                            ) : activeSection === "card" ? (

                                <>
                                    <h5 className="mt-4 text-primary fw-bold">Card Details</h5>

                                    <Table bordered responsive>
                                        <thead>
                                            <tr>
                                                <th>Card Brand</th>
                                                <th>Last 4 Digit</th>
                                                <th>Membership</th>
                                                <th>Price</th>
                                                <th>Used On</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sectionData
                                                ?.filter(item => item?.paymentDetails?.card)
                                                ?.length > 0 ? (

                                                sectionData
                                                    .filter(item => item?.paymentDetails?.card)
                                                    .map((item, index) => (
                                                        <tr key={index}>
                                                            <td>{item.paymentDetails.card.brand}</td>
                                                            <td>**** {item.paymentDetails.card.last4}</td>
                                                            <td>{item.plan_name || "N/A"}</td>
                                                            <td>{item.price||item.totalPrice ? `$ ${item.price||item.totalPrice}` : "N/A"}</td>
                                                            <td>
                                                                {new Date(item.created_at||item.date).toLocaleString("en-US")}
                                                            </td>
                                                        </tr>
                                                    ))

                                            ) : (
                                                <tr>
                                                    <td colSpan="5" className="text-center">
                                                        No Card Details Found
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </Table>
                                </>


                            ) : (

                                // ✅ OTHER DATA TABLE
                                <Table bordered responsive>
                                    <thead className="table-dark text-center">
                                        <tr>
                                            <th style={{ color: "#fff" }}>S. No.</th>

                                            {activeSection === "events" && (
                                                <>
                                                    <th style={{ color: "#fff" }}>Event Name</th>
                                                    <th style={{ color: "#fff" }}>User</th>
                                                    <th
  style={{ color: "#fff", cursor: "pointer", userSelect: "none" }}
  onClick={() => setDateSortOrder(prev => prev === "asc" ? "desc" : "asc")}
>
  Date {dateSortOrder === "asc" ? "↑" : "↓"}
</th>
                                                    <th style={{ color: "#fff" }}>Time</th>
                                                    <th style={{ color: "#fff" }}>Qty</th>
                                                    <th style={{ color: "#fff" }}>Total</th>
                                                    <th style={{ color: "#fff" }}>Status</th>
                                                    <th style={{ color: "#fff" }}>View</th>
                                                </>
                                            )}

                                            {activeSection === "shop" && (
                                                <>
                                                    <th style={{ color: "#fff", width: "300px" }}>OrderId</th>
                                                    <th style={{ color: "#fff" }}>Order Amount</th>
                                                    <th style={{ color: "#fff" }}>Discount</th>
                                                    <th style={{ color: "#fff" }}>Shipping</th>
                                                    <th style={{ color: "#fff" }}>Paid Amount</th>
                                                    <th style={{ color: "#fff" }}>Order Status</th>
                                                    <th style={{ color: "#fff" }}>Payment Status</th>
                                                    {/* <th style={{ color: "#fff" }}>Order Date</th> */}
                                                    <th
  style={{ color: "#fff", cursor: "pointer", userSelect: "none" }}
  onClick={() => setOrderDateSortOrder(prev => prev === "asc" ? "desc" : "asc")}
>
  Order Date {orderDateSortOrder === "asc" ? "↑" : "↓"}
</th>
                                                    <th style={{ color: "#fff", width: "350px" }}>Action</th>
                                                </>
                                            )}

                                            {activeSection === "invoices" && (
                                                <>
                                                    <th
  style={{ color: "#fff", cursor: "pointer", userSelect: "none" }}
  onClick={() => setDateSortOrder(prev => prev === "asc" ? "desc" : "asc")}
>
  Date {dateSortOrder === "asc" ? "↑" : "↓"}
</th>
                                                    <th style={{ color: "#fff" }}>Name</th>
                                                    <th style={{ color: "#fff" }}>Amount</th>
                                                    <th style={{ color: "#fff" }}>Status</th>
                                                    <th style={{ color: "#fff" }}>Download</th>
                                                </>
                                            )}

                                            {activeSection === "appointments" && (
                                                <>
                                                    <th style={{ color: "#fff" }}>Service</th>
                                                    <th style={{ color: "#fff" }}>Practitioner</th>
                                                    <th
  style={{ color: "#fff", cursor: "pointer", userSelect: "none" }}
  onClick={() => setDateSortOrder(prev => prev === "asc" ? "desc" : "asc")}
>
  Date {dateSortOrder === "asc" ? "↑" : "↓"}
</th>
                                                    <th style={{ color: "#fff" }}>Time</th>
                                                    <th style={{ color: "#fff" }}>Status</th>
                                                    <th style={{ color: "#fff" }}>View</th>
                                                </>
                                            )}
                                        </tr>
                                    </thead>

                                    <tbody className="text-center">
                                        {sectionData.length === 0 ? (
                                            <tr><td colSpan="6">No Data Found</td></tr>
                                        ) : (
                                         [...sectionData]
  .sort((a, b) => {
    if (activeSection === "appointments") {
      const dateA = a?.date ? new Date(a.date).getTime() : 0;
      const dateB = b?.date ? new Date(b.date).getTime() : 0;
      return dateSortOrder === "asc" ? dateA - dateB : dateB - dateA;
    }
    if (activeSection === "shop") {
      const dateA = a?.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b?.created_at ? new Date(b.created_at).getTime() : 0;
      return orderDateSortOrder === "asc" ? dateA - dateB : dateB - dateA;
    }
    return 0;
  })
  .map((item, index) => (
                                                <tr key={index}>
                                                    <td>{(currentPage - 1) * pageSize + index + 1}</td>

                                                    {activeSection === "events" && (
                                                        <>
                                                            <td>{item?.event?.eventname || "-"}</td>
                                                            <td>{userData?.name || "-"}</td>
                                                            <td>
                                                                {item?.event?.date
                                                                    ? new Date(item.event.date).toLocaleDateString('en-US')
                                                                    : "-"}
                                                            </td>
                                                            <td>{formatTo12Hour(item?.event?.time)}</td>
                                                            <td>{item?.quantity || 0}</td>
                                                            <td>${item?.grandTotal || 0}</td>
                                                            <td>
                                                                <span
                                                                    style={{ width: "100%" }}
                                                                    className={`badge ${item?.status === "paid"
                                                                        ? "bg-success"
                                                                        : item?.status === "pending"
                                                                            ? "bg-warning"
                                                                            : "bg-secondary"
                                                                        }`}
                                                                >
                                                                    {item?.status}
                                                                </span>
                                                            </td>
                                                            <td>
                                                                <Link href={`/admin/Event-Management/Events/view/${item?.eventId}`}>
                                                                    <Eye size={20} />
                                                                </Link>
                                                            </td>
                                                        </>
                                                    )}

                                                    {activeSection === "shop" && (
                                                        <>
                                                            {/* <td>
                                                                {item?.orderProducts?.length
                                                                    ? item.orderProducts
                                                                        .map((p) => p.productName)
                                                                        .join(", ")
                                                                    : "-"}
                                                            </td> */}
                                                            <td>{`Ved${item?.invoiceNo}`}</td>
                                                            <td>${item?.totalAmount || 0}</td>
                                                            <td>${item?.discountAmount || 0}</td>
                                                            <td>${item?.deliveryCharge || 0}</td>
                                                            <td>{(item?.deliveryCharge + item?.totalAmount - item?.discountAmount).toFixed(2)}</td>
                                                            <td>{item?.returnorders.length > 0 ? "Returned" : (!item?.pickupDate || item.pickupDoneDate) ? item?.currentStatus ? item?.currentStatus : item?.orderStatus : item?.orderStatus ? item?.orderStatus : "Order Placed"}</td>
                                                            <td>{item?.status == "paid" ?
                                                                <Button variant="success">{item?.status == "paid" ? 'Success' : 'Failed'}</Button> : <Button variant="danger">{item?.status == "paid" ? 'Success' : item?.status == "orderCanceled" ? 'Cancelled' : 'Failed'}</Button>}</td>
                                                            <td>{new Date(item?.created_at).toLocaleDateString("en-US")}</td>


                                                            <td>
                                                                <Link href={`/admin/orders/${item._id}`} style={{ marginRight: "3px" }}>
                                                                    <Eye size={20} />
                                                                </Link>
                                                                {console.log(item, !item?.pickupDoneDate, "productproduct")}
                                                                {/* Show Picked Up button only if pickupDate exists */}
                                                                {/* {item?.orderPackDate == null ? (
                                                <Button
                                                    variant="warning"
                                                    size="sm"
                                                    className="ms-2"
                                                    onClick={() => changeStatus(item._id, "orderPacked")}
                                                >
                                                    Order Packed
                                                </Button>
                                            ) :
                                                item?.orderReadyDate == null ? (
                                                    <Button
                                                        variant="warning"
                                                        size="sm"
                                                        className="ms-2"
                                                        onClick={() => changeStatus(item._id, "orderReady")}
                                                    >
                                                        Order Ready
                                                    </Button>
                                                ) : (!item?.pickupDoneDate || item?.pickupDoneDate == null) && (
                                                    <Button
                                                        variant="warning"
                                                        size="sm"
                                                        className="ms-2"
                                                        onClick={() => changeStatus(item._id, "orderPickedUp")}
                                                    >
                                                        Picked Up
                                                    </Button>
                                                )} */}
                                                                {!item?.pickupDoneDate && item?.returnorders.length == 0 && item.status !== "orderCanceled" &&
                                                                    <select className={`status-dropdown form-select-sm ${(() => {
                                                                        if (!item?.orderPackDate) return 'status-pending';
                                                                        if (item?.orderPackDate && !item?.orderReadyDate) return 'status-packing';
                                                                        if (item?.orderReadyDate && !item?.pickupDoneDate) return 'status-ready';
                                                                        if (item?.pickupDoneDate) return 'status-completed';
                                                                        return '';
                                                                    })()
                                                                        }`} onChange={(e) => changeStatus(item._id, e.target.value)} defaultValue=""
                                                                        style={{
                                                                            padding: '6px 12px',
                                                                            borderRadius: '8px',
                                                                            border: '1px solid #e2e8f0',
                                                                            fontSize: '0.875rem',
                                                                            cursor: 'pointer',
                                                                            transition: 'all 0.2s ease',
                                                                            backgroundColor: 'white',
                                                                            fontWeight: '500'
                                                                        }}
                                                                        onMouseEnter={(e) => {
                                                                            e.target.style.borderColor = '#3b82f6';
                                                                            e.target.style.boxShadow = '0 0 0 2px rgba(59,130,246,0.1)';
                                                                        }}
                                                                        onMouseLeave={(e) => {
                                                                            e.target.style.borderColor = '#e2e8f0';
                                                                            e.target.style.boxShadow = 'none';
                                                                        }}
                                                                    >
                                                                        <option value="" disabled style={{ fontWeight: '500', color: '#64748b' }}>
                                                                            Update Status
                                                                        </option>
                                                                        {item?.orderPackDate == null && (
                                                                            <option value="orderPacked" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                                📦 Order Packed
                                                                            </option>
                                                                        )}
                                                                        {item?.orderPackDate != null && item?.orderReadyDate == null && (
                                                                            <option value="orderReady">✅ Order Ready
                                                                            </option>
                                                                        )}

                                                                        {item?.orderReadyDate != null && !item?.pickupDoneDate && (
                                                                            <option value="orderPickedUp">
                                                                                🚚 Picked Up
                                                                            </option>
                                                                        )}

                                                                        {item?.pickupDate != null && !item?.pickupDoneDate && (
                                                                            <option value="orderDelayed" style={{ color: '#dc2626' }}>
                                                                                ⏰ Order Delayed
                                                                            </option>
                                                                        )}
                                                                    </select>
                                                                    // <select
                                                                    //     className="ms-2  form-select-sm"
                                                                    //     onChange={(e) => changeStatus(item._id, e.target.value)}
                                                                    //     defaultValue=""
                                                                    // >
                                                                    //     <option value="" disabled>
                                                                    //         Update Status
                                                                    //     </option>

                                                                    //     {item?.orderPackDate == null && (
                                                                    //         <option value="orderPacked">Order Packed</option>
                                                                    //     )}

                                                                    //     {item?.orderPackDate != null && item?.orderReadyDate == null && (
                                                                    //         <option value="orderReady">Order Ready</option>
                                                                    //     )}

                                                                    //     {item?.orderReadyDate != null && !item?.pickupDoneDate && (
                                                                    //         <option value="orderPickedUp">Picked Up</option>
                                                                    //     )}

                                                                    //     {/* ✅ New option */}
                                                                    //     {item?.pickupDate != null && !item?.pickupDoneDate && (
                                                                    //         <option value="orderDelayed">Order Delayed</option>
                                                                    //     )}
                                                                    // </select>
                                                                }
                                                            </td>
                                                        </>
                                                    )}

                                                    {activeSection === "invoices" && (
                                                        <>
                                                            {activeSection === "invoices" && (
                                                                <>
                                                                    <td>{item?.date}</td>

                                                                    <td className="text-primary">
                                                                        {item?.name || "N/A"}
                                                                    </td>

                                                                    <td className="fw-bold">
                                                                        $ {item?.amount || "N/A"}
                                                                    </td>

                                                                    <td className="text-center">
                                                                        <span className="paidBadge">
                                                                            {item?.status || "N/A"}
                                                                        </span>
                                                                    </td>

                                                                    <td className="d-flex justify-content-center">
                                                                        <button
                                                                            type="button"
                                                                            className="btn btn-primary py-2 fs-9 d-flex align-items-center justify-content-center"
                                                                            onClick={() => downloadInvoice(item)}
                                                                        >
                                                                            <img
                                                                                src="/images/landingpage/download-icon.svg"
                                                                                alt=""
                                                                                width="12"
                                                                                className="me-2"
                                                                            />
                                                                            Download
                                                                        </button>
                                                                    </td>
                                                                </>
                                                            )}
                                                        </>
                                                    )}
                                                    {activeSection === "appointments" && (
                                                        <>
                                                            <td>{item?.service?.name || "-"}</td>
                                                            <td>
                                                                {item?.employee?.userDetails?.name || "-"}
                                                            </td>
                                                            <td>
                                                                {item?.date
                                                                    ? new Date(item.date).toLocaleDateString('en-US')
                                                                    : "-"}
                                                            </td>
                                                            <td>{item?.time || "-"}</td>
                                                            <td>{item?.status || "-"}</td>
                                                            <td>
                                                                <Eye
                                                                    size={20}
                                                                    style={{ cursor: "pointer", color: "#624bff" }}
                                                                    onClick={() => handleView(item)}
                                                                />
                                                            </td>
                                                        </>
                                                    )}
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </Table>
                            )


                            }

                        </Card.Body>
                    </Card>

                </Card.Body>
            </Card>

            {activeSection !== "userDetails" &&activeSection!== "membership" && activeSection !== "appointments" && (
                <Pagination className="justify-content-center mt-4">

                    <Pagination.First
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                    />

                    <Pagination.Prev
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                    />
                    {(() => {
                        const maxVisible = 10; // show 10 pages at a time
                        const startPage =
                            Math.floor((currentPage - 1) / maxVisible) * maxVisible + 1;

                        const endPage = Math.min(startPage + maxVisible - 1, totalPages);

                        const pages = [];

                        for (let i = startPage; i <= endPage; i++) {
                            pages.push(
                                <Pagination.Item
                                    key={i}
                                    active={i === currentPage}
                                    onClick={() => setCurrentPage(i)}
                                >
                                    {i}
                                </Pagination.Item>
                            );
                        }

                        return pages;
                    })()}

                    <Pagination.Next
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    />

                    <Pagination.Last
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                    />

                </Pagination>
            )}
            <div ref={invoiceRef} style={{ position: "absolute", left: "-9999px" }}>
                {invoiceData && <InvoicePageAdmin data={invoiceData} footerData={footerData} />}
            </div>


            <Modal
                show={showEventModal}
                onHide={() => setShowEventModal(false)}
                size="md"
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>Appointment Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {console.log(selectedEvent, "selectedEve121212nt", eventViewData)}
                    {selectedEvent && (
                        <>
                            {selectedEvent.extendedProps?.type === "break" ? (
                                <>
                                    {console.log(selectedEvent, "selectedEventselectedEvent")}
                                    <p>
                                        <strong>Note:</strong> {selectedEvent.extendedProps?.note}
                                    </p>
                                    <p><strong>Employee:</strong> {selectedEvent.extendedProps?.employee?.userDetails?.name || "N/A"}</p>
                                    <p>
                                        <strong>Start:</strong>{" "}
                                        {DateTime.fromISO(selectedEvent.startStr).toFormat("fff")}
                                    </p>
                                    <p>
                                        <strong>End:</strong>{" "}
                                        {DateTime.fromISO(selectedEvent.endStr).toFormat("fff")}
                                    </p>
                                    <p>
                                        <strong>Duration:</strong> {selectedEvent.extendedProps?.duration} mins
                                    </p>
                                </>
                            ) : (
                                <>
                                    <p><strong>Service:</strong> {selectedEvent.extendedProps?.service?.name}</p>
                                    <p><strong>Client:</strong> {selectedEvent.extendedProps?.user?.name} ({selectedEvent.extendedProps?.user?.email})</p>
                                    <p><strong>Employee:</strong> {selectedEvent.extendedProps?.employee?.userDetails?.name || "N/A"}</p>
                                    <p>
                                        <strong>Start:</strong>{" "}
                                        {DateTime.fromISO(
                                            `${selectedEvent.date.split("T")[0]}T${selectedEvent.time}`
                                        ).toFormat("ff")}
                                    </p>

                                    <p>
                                        <strong>End:</strong>{" "}
                                        {DateTime.fromISO(
                                            `${selectedEvent.date.split("T")[0]}T${selectedEvent.time}`
                                        )
                                            .plus({ minutes: selectedEvent.extendedProps?.duration || 0 })
                                            .toFormat("ff")}
                                    </p>
                                    <p><strong>Duration:</strong> {selectedEvent.extendedProps?.duration} mins</p>
                                    <p><strong>Price:</strong> $ {selectedEvent.extendedProps?.price}</p>
                                    <p><strong>Center Name:</strong> {selectedEvent.extendedProps?.centerData?.centerName}</p>
                                    <p><strong>Status:</strong> {selectedEvent.extendedProps?.status}</p>
                                    <p><strong>Appt. Status:</strong> {selectedEvent.extendedProps?.status == 'unpaid' && new Date(selectedEvent.startStr) < new Date() ? 'Payment Pending' : selectedEvent.extendedProps?.status == 'paid' ? 'Completed' : selectedEvent.extendedProps?.status == 'unpaid' ? 'Booked Successfully' : selectedEvent.extendedProps?.status}</p>
                                    {selectedEvent.extendedProps?.note && (
                                        <p><strong>Note:</strong> {selectedEvent.extendedProps.note}</p>
                                    )}
                                </>
                            )}
                        </>
                    )}
                </Modal.Body>


                <Modal.Footer>
                    {selectedEvent?.extendedProps?.status == 'unpaid' && <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <button className="btn btn-primary" onClick={() => takePayment(selectedEvent?.extendedProps?._id)}>Process Payment</button></div>}
                    <Button variant="secondary" onClick={() => setShowEventModal(false)}>
                        Close
                    </Button>

                    {selectedEvent?.extendedProps?.type === "break" && (
                        <>
                            <Button
                                variant="warning"
                                onClick={() => {
                                    const props = selectedEvent.extendedProps;
                                    setEditBreakForm({
                                        _id: props?._id,
                                        employeeId: props?.employee?._id || "",
                                        userId: props?.user?._id || "",
                                        note: props?.note || "",
                                        date: DateTime.fromISO(selectedEvent.startStr).toISODate(),
                                        time: DateTime.fromISO(selectedEvent.startStr).toFormat("HH:mm"),
                                        duration: props?.duration || 30,
                                    });
                                    setShowEventModal(false);
                                    setShowEditBreakModal(true);
                                }}
                            >
                                Edit Break
                            </Button>
                            <Button
                                variant="danger"
                                onClick={async () => {
                                    try {
                                        const payload = { _id: selectedEvent.extendedProps?._id };
                                        const res = await postApi(config.deleteBreak, payload);
                                        if (res.statusCode === 200) {
                                            alert("Break deleted successfully!");
                                            await refreshCalendar();  // ✅ refresh here
                                            setShowEventModal(false);

                                        }
                                        else {
                                            alert(res.message || "Failed to delete break");
                                        }
                                    } catch (error) {
                                        console.error("Delete break error:", error);
                                        alert("Error deleting break. Please try again later.");
                                    }
                                }}
                            >
                                Delete Break
                            </Button>
                        </>
                    )}

                </Modal.Footer>

            </Modal>


        </Container>

    );
}