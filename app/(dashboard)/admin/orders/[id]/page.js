// app/order/[id]/page.js

'use client';
import { useEffect, useState } from 'react';
import { Container, Row, Col, Button, Table } from 'react-bootstrap';
import { useRouter, useParams } from 'next/navigation'; // Add useParams
import { config } from 'services/config';
import { postApi } from 'services/api';
import Swal from 'sweetalert2';
import Loader from 'services/Loader/page';

export default function OrderDetails() {
    const params = useParams(); // Use useParams hook
    const { id } = params;
    const [order, setOrder] = useState(null);
    const [selectedItems, setSelectedItems] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const fetchOrder = async () => {
        try {
            setLoading(true);
            const endpoint = config.FindOrderDataById;
            const data = { order_id: id };
            const response = await postApi(endpoint, data);
            if (response.statusCode === 200) {
                console.log(response);
                setOrder(response.data[0]);
                setLoading(false);
            }
        } catch (error) {
            setLoading(false);
            console.error("Error fetching product:", error);
        }
    };

    useEffect(() => {
        if (id) {
            fetchOrder();
        }
    }, [id]);

    if (!order) {
        return <div>Loading...</div>;
    }

    const refundItem = async (selectedProducts) => {
        const endPoint = config.applyForReturnByAdmin;
        const body = {
            orderId: order._id,
            selectedProducts: selectedProducts
        };
        const refund = await postApi(endPoint, body);
        if (refund.statusCode == 200 || refund.statusCode == 201) {
            fetchOrder();
            setSelectedItems([]); // Clear selections after return
            setSelectAll(false); // Reset select all
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: refund.message,
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: refund.message || 'Failed to process return',
            });
        }
    };

    // Check if total amount is 0 or less
    // const isTotalAmountZero = order?.grandTotal ;

    // Check if any item is already returned
    const isItemReturned = (itemId) => {
        return order?.returnOrders?.productId?.includes(itemId);
    };

    // Check if all items are returned
    const areAllItemsReturned = () => {
        if (!order?.orderItems?.length) return false;
        return order.orderItems.every(item => isItemReturned(item._id));
    };

    // Check if any returnable items exist
    const hasReturnableItems = () => {
        return order?.orderItems?.some(item => !isItemReturned(item._id));
    };

    // Get returnable items count
    const getReturnableItemsCount = () => {
        return order?.orderItems?.filter(item => !isItemReturned(item._id)).length || 0;
    };

    const handleSelectAllChange = (e) => {
        const checked = e.target.checked;
        setSelectAll(checked);
        if (checked) {
            // Only select items that are NOT already returned
            const returnableIndices = order.orderItems.reduce((indices, item, idx) => {
                if (!isItemReturned(item._id)) {
                    indices.push(idx);
                }
                return indices;
            }, []);
            setSelectedItems(returnableIndices);
        } else {
            setSelectedItems([]);
        }
    };

    const handleItemSelect = (index, checked) => {
        if (checked) {
            setSelectedItems(prev => [...prev, index]);
            // Check if all returnable items are now selected
            const returnableIndices = order.orderItems.reduce((indices, item, idx) => {
                if (!isItemReturned(item._id)) {
                    indices.push(idx);
                }
                return indices;
            }, []);
            const allSelected = returnableIndices.every(idx => [...selectedItems, index].includes(idx));
            setSelectAll(allSelected);
        } else {
            setSelectedItems(prev => prev.filter(i => i !== index));
            setSelectAll(false);
        }
    };

    const handleReturnClick = () => {
        // Check if total amount is 0
        // if (isTotalAmountZero) {
        //     Swal.fire({
        //         icon: 'error',
        //         title: 'Return Not Possible',
        //         text: 'Customer amount is $0.00, return is not possible for this order.',
        //     });
        //     return;
        // }

        // Check if no items are selected
        if (selectedItems.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'No Items Selected',
                text: 'Please select at least one item to refund.',
            });
            return;
        }

        const selectedProducts = order.orderItems.filter((_, idx) => selectedItems.includes(idx));

        // Confirm before returning
        Swal.fire({
            title: 'Confirm Return',
            text: `Are you sure you want to return ${selectedProducts.length} item(s)?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, return items',
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                refundItem(selectedProducts);
            }
        });
    };
    // Total discounts
    const adminDiscount = order?.adminDiscount || 0;
    const couponDiscount = order?.discountAmount || 0;

    const totalDiscount = adminDiscount || couponDiscount;


    // Calculate subtotal
    const subtotal = order?.orderItems?.reduce((acc, item) => acc + (item.productPrice * item.quantity), 0) || 0;
    // Avoid divide by zero
    const discountRatio = subtotal > 0 ? totalDiscount / subtotal : 0;

    // Calculate discount to display
    const hasCouponDiscount = !!order?.couponInfo?.couponCode;
    const displayDiscount = hasCouponDiscount ? (order?.discountAmount || 0) : 0;
    const displayAdminDiscount = !hasCouponDiscount ? (order?.adminDiscount || 0) : 0;
    const selectCheckBox = order.pickupDate ? order.pickupDoneDate : order?.deliveryDates?.deliveredDate

      const cancelOrder = async (orderItems) => {
    try {
    //   console.log(userData, "userfDatagdswqbn dlasd;kn");
      const endpoint = config.cancelOrder;
    //   setLoader(true)
      const data = { orderId: id };
      const response = await postApi(endpoint, data);
      console.log(response, "responseresponse")
    //   setLoader(false)
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
    return (
        <>
            {loading && <Loader />}
            <Container fluid className="p-6" style={{ background: '#f8fbff', padding: '2rem' }}>
                <Button
                    variant="dark"
                    style={{ float: 'right' }}
                    className="mb-3"
                    onClick={() => router.back()}
                >
                    Back
                </Button>

                <Row className="mb-4">
                    <Col md={12} className="text-center">
                        <h2 className="mb-1" style={{ fontWeight: '700' }}>Order Details</h2>
                        <div className="text-muted" style={{ fontSize: '0.9rem' }}>
                            Invoice Number: Ved{order?.invoiceNo || "N/A"}
                        </div>
                        <hr />
                    </Col>
                </Row>

                <Row className="mb-4">
                    <Col md={6}>
                        <h5 style={{ fontWeight: 600 }}>Order Info</h5>
                        <p className="mb-0">
                            <strong>Status:</strong> {order?.status || "N/A"} <br />
                            <strong>Order Status:</strong>
                            {/* {order?.orderStatus || "N/A"} */}
                            {(!order?.pickupDate || order.pickupDoneDate) ? order?.currentStatus ? product?.currentStatus : order?.orderStatus : order?.orderStatus ? order?.orderStatus : "Order Placed"}
                            <br />
                            <strong>Payment Method:</strong> {order?.paymentMethod || "N/A"} <br />
                            <strong>Pickup Date:</strong> {order?.pickupDate ? order.pickupDate : "N/A"} <br />
                        </p>
                    </Col>
                    {order?.carrier&&order?.carrier!==""&&order?.addressInfo&&<Col md={6} className="text-md-end">
                       <h5 style={{ fontWeight: 600 }}>Shipping Address</h5>
                        <p className="mb-0">
                            {order?.addressInfo?.name}<br />
                            {order?.addressInfo?.flatNo && `${order.addressInfo?.flatNo }`}<br />
                            {order.addressInfo?.area }<br />
                            {order.addressInfo?.city } {order.addressInfo?.state }<br />
                            {order.addressInfo?.country } 
                            {order.addressInfo?.pincode }<br />
                            <strong>Phone:</strong> {order?.addressInfo?.mobile || order?.addressInfo?.mobile || "N/A"}
                        </p>
                    </Col>}
                </Row>

                <Row className="mb-4">
                    <Col md={6}>
                        <h5 style={{ fontWeight: 600 }}>Billing Address</h5>
                        <p className="mb-0">
                            {order.billingAddress1}<br />
                            {order.billingAddress2 && `${order.billingAddress2}`}<br />
                            {order.billingCity}<br />
                            {order.billingState}<br />
                            {order.billingCountry}<br />
                            {order.billingZipcode}<br />
                            <strong>Phone:</strong> {order?.addressInfo?.mobile || order?.userInfo?.mobileNo || "N/A"}
                        </p>
                    </Col>

                    <Col md={6} className="text-md-end">
                        <h5 style={{ fontWeight: 600 }}>User Details</h5>
                        <p className="mb-0">
                            {order?.userInfo?.name || "N/A"}<br />
                            <strong>Mobile:</strong> {order?.userInfo?.mobileNo || "N/A"}<br />
                            <strong>Email ID:</strong> {order?.userInfo?.email || "N/A"}<br />
                            <strong>Status:</strong> {order?.status || "N/A"} <br />
                            <strong>Order Date:</strong> {order?.created_at ? new Date(order.created_at).toLocaleString() : "N/A"}
                        </p>
                    </Col>
                </Row>

                <Row className="mb-4">
                    <Col md={12}>
                        <h5 style={{ fontWeight: 600 }}>Order Items</h5>
                        <Table bordered hover responsive>
                            <thead>
                                <tr>
                                    <th style={{ backgroundColor: '#332d2d', color: 'whitesmoke', width: '80px' }}>
                                        {!areAllItemsReturned() && hasReturnableItems() && selectCheckBox && (
                                            <input
                                                type="checkbox"
                                                style={{ marginRight: '8px', cursor: 'pointer' }}
                                                checked={selectAll}
                                                // disabled={isTotalAmountZero}
                                                onChange={handleSelectAllChange}
                                            />
                                        )}
                                        Select
                                    </th>
                                    <th style={{ backgroundColor: '#332d2d', color: 'whitesmoke', width: '50px' }}>#</th>
                                    <th style={{ backgroundColor: '#332d2d', color: 'whitesmoke' }}>Product Name</th>
                                    <th style={{ backgroundColor: '#332d2d', color: 'whitesmoke', width: '120px' }}>Unit Price</th>
                                    <th style={{ backgroundColor: '#332d2d', color: 'whitesmoke', width: '80px' }}>Quantity</th>
                                    <th style={{ backgroundColor: '#332d2d', color: 'whitesmoke', width: '80px' }}>Discount</th>
                                    <th style={{ backgroundColor: '#332d2d', color: 'whitesmoke', width: '120px' }}>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {order?.orderItems?.map((item, index) => {
                                    const itemTotal = (item?.productPrice || 0) * (item?.quantity || 0);
                                    const itemDiscount = itemTotal * discountRatio;
                                    const finalPrice = itemTotal - itemDiscount;
                                    // const totalAmount  = itemTotal+finalPrice
                                    return (

                                        (<tr key={item._id || index}>
                                            <td style={{ textAlign: 'center' }}>
                                                {isItemReturned(item?._id) ? (
                                                    <span style={{ color: 'red', fontWeight: 'bold', fontSize: '12px' }}>Returned</span>
                                                ) : !selectCheckBox ?
                                                    <span style={{ color: 'red', fontWeight: 'bold', fontSize: '12px' }}>Delivery Pending</span>
                                                    : (
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedItems.includes(index)}
                                                            style={{ cursor: 'pointer' }}
                                                            // disabled={isTotalAmountZero}
                                                            onChange={(e) => handleItemSelect(index, e.target.checked)}
                                                        />
                                                    )}
                                            </td>
                                            <td>{index + 1}</td>
                                            <td>{item?.productName || "N/A"}</td>
                                            <td>${item?.productPrice?.toFixed(2) || "0.00"}</td>
                                            <td>{item?.quantity || 0}</td>
                                            {/* <td>${((item?.productPrice || 0) * (item?.quantity || 0)).toFixed(2)}</td> */}
                                            <td>
                                                <div>${itemTotal.toFixed(2)}</div>
                                                <div style={{ color: 'red', fontSize: '12px' }}>
                                                    -${itemDiscount.toFixed(2)}
                                                </div>

                                            </td>
                                            <td><div style={{ fontWeight: '600' }}>
                                                ${finalPrice.toFixed(2)}
                                            </div></td>
                                        </tr>)
                                    )
                                })}
                            </tbody>
                        </Table>

                        {/* {hasReturnableItems() && !areAllItemsReturned() && (
                            <div className="mt-2 mb-2 text-muted" style={{ fontSize: '0.85rem' }}>
                                {getReturnableItemsCount()} item(s) available for return
                            </div>
                        )} */}

                        {!areAllItemsReturned() && order.status!=="orderCanceled"&&(
                            <Button
                                variant="danger"
                                className="mt-3"
                                onClick={handleReturnClick}
                                disabled={ !hasReturnableItems() || selectedItems.length === 0}
                                // title={isTotalAmountZero ? "Cannot return order with $0.00 total amount" : ""}
                            >
                                Return Selected Items ({selectedItems.length})
                            </Button>
                        )}
                         {!order?.pickupDoneDate&&order.status!=="orderCanceled"&&<Button
                                variant="danger"
                                className="mt-3"
                                onClick={cancelOrder}
                                // disabled={ !hasReturnableItems() || selectedItems.length === 0}
                                // title={isTotalAmountZero ? "Cannot return order with $0.00 total amount" : ""}
                            >
                                Cancel Order 
                            </Button>}
                        {areAllItemsReturned() && (
                            <div className="mt-3 alert alert-info">
                                <i className="bi bi-check-circle-fill me-2"></i>
                                All items in this order have been returned.
                            </div>
                        )}

                        {/* {isTotalAmountZero && !areAllItemsReturned() && (
                            <div className="mt-3 alert alert-warning">
                                <strong>Note:</strong> Customer amount is $0.00, return is not possible for this order.
                            </div>
                        )} */}
                    </Col>
                </Row>

                <Row className="mb-4">
                    <Col md={{ span: 4, offset: 8 }}>
                        <Table bordered style={{ fontSize: '0.95rem' }}>
                            <tbody>
                                <tr>
                                    <th style={{ backgroundColor: '#f1f3f5' }}>Subtotal</th>
                                    <td>${subtotal.toFixed(2)}</td>

                                </tr>
                                {displayDiscount > 0 && (
                                    <tr>
                                        <th style={{ backgroundColor: '#f1f3f5' }}>Coupon Discount</th>
                                        <td>- ${displayDiscount.toFixed(2) || "0.00"}</td>
                                    </tr>
                                )}
                                {displayAdminDiscount > 0 && (
                                    <tr>
                                        <th style={{ backgroundColor: '#f1f3f5' }}>Admin Discount</th>
                                        <td>- ${displayAdminDiscount.toFixed(2)}</td>
                                    </tr>
                                )}
                                <tr>
                                    <th style={{ backgroundColor: '#f1f3f5' }}>Delivery Charge</th>
                                    <td>${order?.deliveryCharge?.toFixed(2) || "0.00"}</td>
                                </tr>
                                <tr>
                                    <th style={{ backgroundColor: '#f1f3f5' }}>Total Amount</th>
                                    <td style={{ fontWeight: 600, fontSize: '1rem' }}>
                                        ${order?.grandTotal?.toFixed(2) || "0.00"}
                                    </td>
                                </tr>
                            </tbody>
                        </Table>
                    </Col>
                </Row>

                {order?.couponInfo?.couponCode && (
                    <Row className="mb-4">
                        <Col md={12}>
                            <h5 style={{ fontWeight: 600 }}>Coupon Applied</h5>
                            <p className="mb-0">
                                <strong>{order?.couponInfo?.couponCode}</strong> — {order?.couponInfo?.description || ""}
                            </p>
                        </Col>
                    </Row>
                )}
            </Container>
        </>
    );
}