'use client'
import { Col, Row, Form, Table, Button, Container, Pagination, Modal } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import { Eye } from 'react-bootstrap-icons';
import Link from 'next/link';
import { postApi } from 'services/api';
import { config } from 'services/config';
import Loader from 'services/Loader/page';
import Swal from 'sweetalert2';

export default function Orders() {
    const [productName, setProductName] = useState("");
    const [productType, setProductType] = useState("");
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false)
    const [orders, setOrders] = useState([])
    const [order_id, setOrderID] = useState()
    const [nextDate, setNextDate] = useState("");
    const [showModel, setShowModel] = useState(false)
    const [searchText, setSearchText] = useState("");     // name/email/mobile
    const [orderId, setOrderId] = useState("");

    const handleSubmit = (orderId) => {
        if (!nextDate) return;
        console.log(nextDate, "nextDatenextDate")
        updatePickupDate(
            order_id, nextDate,
        );

        // setNextDate();
        onHide();
    };
    const onHide = () => {
        setNextDate()
        setOrderID()
        setShowModel(false)
    }

    const updatePickupDate = async (orderId, pickupDate) => {
        try {
            // let body = {orderId}
            // if(status==)
            console.log(orderId, pickupDate, "orderId,status")
            const response = await postApi(config.updatePickupDate, {
                orderId: order_id,
                newPickupDate: pickupDate,
            });

            if (response.statusCode === 200 || response.statusCode === 201) {
                alert("Order picked up date changed successfully");
                fetchUsers(currentPage); // refresh orders list
                
            } else {
                alert("Failed to update order: " + response.message);
            }
        } catch (error) {
            console.error("Error updating order:", error);
            alert("Error updating order. Please try again later.");
        }
    };


    const handlePickedUp = async (orderId, status) => {
        try {
            // let body = {orderId}
            // if(status==)
            console.log(orderId, status, "orderId,status")
            const response = await postApi(config.updateOrderStatus, {
                orderId,
                status: status,
            });

            if (response.statusCode === 200 || response.statusCode === 201) {
                // alert("Order marked as picked up!");
                fetchUsers(currentPage); // refresh orders list
            } else {
                alert("Failed to update order: " + response.message);
            }
        } catch (error) {
            console.error("Error updating order:", error);
            alert("Error updating order. Please try again later.");
        }
    };


    // const fetchUsers = async (page = 1) => {
    //     try {
    //         setLoading(true)
    //         const endpoint = config.FindUserOrders;
    //         const response = await postApi(endpoint, { page, pageSize });

    //         if (response.statusCode === 201) {
    //             console.log(response)
    //             setOrders(response.data || []);
    //             setFilteredProducts(response.data || []);
    //             setTotalPages(response.totalPages || 1);  // assuming API returns this
    //             setLoading(false)
    //         }
    //         setLoading(false)
    //     } catch (error) {
    //         setLoading(false)
    //         console.error("Error fetching orders:", error);
    //     }
    // };

    useEffect(() => {
        // fetchUsers(currentPage);
        fetchUsers(currentPage, searchText, orderId);
    }, [currentPage]);

    const fetchUsers = async (page = 1, search = "", order_id = "") => {
        try {
            setLoading(true);
            let newOrder_id = order_id.replace(/ved/gi, "");

            const response = await postApi(config.FindUserOrders, {
                page,
                pageSize,
                search,
                invoiceNo: newOrder_id
            });

            if (response.statusCode === 200 || response.statusCode === 201) {
                setOrders(response.data || []);
                setFilteredProducts(response.data || []);
                setTotalPages(response.totalPages || 1);
            }

            setLoading(false);
        } catch (error) {
            setLoading(false);
            console.error("Error fetching orders:", error);
        }
    };


    // const handleSearch = () => {
    //     const results = orders.filter(product =>
    //         (product?.name?.toLowerCase().includes(productName?.toLowerCase())) &&
    //         (productType === "" || product.type === productType)
    //     );
    //     setFilteredProducts(results);
    //     setCurrentPage(1); // Reset pagination
    // };
    const handleSearch = () => {
        setCurrentPage(1);
        fetchUsers(1, searchText, orderId); // ✅ send both
    };

    const changeStatus = (id, status) => {
        if (status == 'orderDelayed') {
            setOrderID(id)
            setShowModel(true)
            return
        }
        Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#11ff6a",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, Change Status!",
        }).then((result) => {
            if (result.isConfirmed) {

                handlePickedUp(id, status);
                Swal.fire("Status Changed!", "Order status Changed.", "success");
            }
        });
    };

    const clearFilter = ()=>{
        setOrderId("")
        setSearchText("")
        fetchUsers()
    }

    const formatAmount = (value) => {
  const num = Number(value || 0);
  return Number.isInteger(num) ? num : num.toFixed(2);
};

    return (
        <Container fluid className="p-6">
            {loading && <Loader />}
            <Row className="align-items-center mb-4">
                <Col>
                    <h2>Orders</h2>
                </Col>

            </Row>

            <Row>
                <Col xl={12} lg={12} md={12} sm={12}>
                    <div className='my-3'>
                        {/* <Form className="d-flex align-items-center gap-2">
                            <Form.Control
                                type="text"
                                placeholder="Search by User Name"
                                value={productName}
                                onChange={(e) => setProductName(e.target.value)}
                            />
                            <Form.Control
                                type="text"
                                placeholder="Search by Order No."
                                value={productType}
                                onChange={(e) => setProductType(e.target.value)}
                            />

                            <Button variant="primary" onClick={handleSearch}>Search</Button>
                        </Form> */}
                        <Form className="d-flex align-items-center gap-2">
                            <Form.Control
                                type="text"
                                placeholder="Search by Name, Email, Mobile"
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                            />

                            <Form.Control
                                type="text"
                                placeholder="Search by Order No."
                                value={orderId}
                                onChange={(e) => setOrderId(e.target.value)}
                            />

                            <Button variant="primary" onClick={handleSearch}>
                                Search
                            </Button>
                            <Button variant="primary" onClick={() => { clearFilter() }}>
                                Clear
                            </Button>
                        </Form>
                    </div>

                    <Table hover responsive className="text-nowrap">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Order Id</th>
                                <th>Order Amount</th>
                                <th>Discount</th>
                                <th>Shipping</th>
                                <th>Paid amount</th>
                                <th>Order Status</th>
                                <th>Payment Status</th>
                                {/* <th>Order Items</th> */}
                                <th>Order Date</th>
                                {/* <th>Quantity</th> */}
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.length > 0 &&
                                filteredProducts.map((product, ind) => (
                                    <tr key={product.id}>
                                        <td>{ind + 1}</td>
                                        <td>{`Ved${product.invoiceNo}`}</td>
                                        <td>{formatAmount(product.totalAmount)}</td>
                                        <td>{formatAmount(product.discountAmount)}</td>
                                        <td>{formatAmount(product.deliveryCharge)}</td>
                                        <td>{formatAmount(product.deliveryCharge + product.totalAmount - product.discountAmount)}</td>
                                        <td>{product?.returnorders.length > 0 ? "Returned" : (!product?.pickupDate || product.pickupDoneDate) ? product?.currentStatus ? product?.currentStatus : ((product?.carrier&&product?.carrier!==""&&product?.pickupDate==null&&product?.orderReadyDate !== null)?"Order Dispatched":product?.orderStatus) : product?.orderStatus ? product?.orderStatus : "Order Placed"}</td>

                                        <td>{product.status == "paid" ?
                                            <Button variant="success">{product.status == "paid" ? 'Success' : 'Failed'}</Button> : <Button variant="danger">{product.status == "paid" ? 'Success' : product.status == "orderCanceled" ? 'Cancelled' : 'Failed'}</Button>}</td>
                                        {/* <td>{product.cartIds?.length}</td> */}
                                        <td>{new Date(product?.created_at).toLocaleDateString("en-US")}</td>
                                        {/* <td>{product.Quantity}</td> */}

                                        <td>
                                            <Link href={`/admin/orders/${product._id}`}>
                                                <Eye size={20} />
                                            </Link>
                                            {console.log(product, !product?.pickupDoneDate, "productproduct")}
                                            {/* Show Picked Up button only if pickupDate exists */}
                                            {/* {product?.orderPackDate == null ? (
                                                <Button
                                                    variant="warning"
                                                    size="sm"
                                                    className="ms-2"
                                                    onClick={() => changeStatus(product._id, "orderPacked")}
                                                >
                                                    Order Packed
                                                </Button>
                                            ) :
                                                product?.orderReadyDate == null ? (
                                                    <Button
                                                        variant="warning"
                                                        size="sm"
                                                        className="ms-2"
                                                        onClick={() => changeStatus(product._id, "orderReady")}
                                                    >
                                                        Order Ready
                                                    </Button>
                                                ) : (!product?.pickupDoneDate || product?.pickupDoneDate == null) && (
                                                    <Button
                                                        variant="warning"
                                                        size="sm"
                                                        className="ms-2"
                                                        onClick={() => changeStatus(product._id, "orderPickedUp")}
                                                    >
                                                        Picked Up
                                                    </Button>
                                                )} */}
                                            {!product?.pickupDoneDate && product?.returnorders.length == 0 && product.status !== "orderCanceled" &&
                                                <select className={`status-dropdown form-select-sm ${(() => {
                                                    if (!product?.orderPackDate) return 'status-pending';
                                                    if (product?.orderPackDate && !product?.orderReadyDate) return 'status-packing';
                                                    if (product?.orderReadyDate && !product?.pickupDoneDate) return 'status-ready';
                                                    if (product?.pickupDoneDate) return 'status-completed';
                                                    return '';
                                                })()
                                                    }`} onChange={(e) => changeStatus(product._id, e.target.value)} value=""
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
                                                    {product?.orderPackDate == null && (
                                                        <option value="orderPacked" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            📦 Order Packed
                                                        </option>
                                                    )}
                                                    {product?.orderPackDate != null && product?.orderReadyDate == null && (
                                                        <option value="orderReady">✅ Order Ready
                                                        </option>
                                                    )}

                                                    {product?.orderReadyDate != null && !product?.pickupDoneDate && (
                                                        <option value="orderPickedUp">
                                                            🚚 {(product?.carrier&&product?.carrier!==""&&product?.pickupDate==null)?"Order Dispatched":'Picked Up'}
                                                        </option>
                                                    )}

                                                    {product?.pickupDate != null && !product?.pickupDoneDate && (
                                                        <option value="orderDelayed" style={{ color: '#dc2626' }}>
                                                            ⏰ Order Delayed
                                                        </option>
                                                    )}
                                                </select>
                                                // <select
                                                //     className="ms-2  form-select-sm"
                                                //     onChange={(e) => changeStatus(product._id, e.target.value)}
                                                //     defaultValue=""
                                                // >
                                                //     <option value="" disabled>
                                                //         Update Status
                                                //     </option>

                                                //     {product?.orderPackDate == null && (
                                                //         <option value="orderPacked">Order Packed</option>
                                                //     )}

                                                //     {product?.orderPackDate != null && product?.orderReadyDate == null && (
                                                //         <option value="orderReady">Order Ready</option>
                                                //     )}

                                                //     {product?.orderReadyDate != null && !product?.pickupDoneDate && (
                                                //         <option value="orderPickedUp">Picked Up</option>
                                                //     )}

                                                //     {/* ✅ New option */}
                                                //     {product?.pickupDate != null && !product?.pickupDoneDate && (
                                                //         <option value="orderDelayed">Order Delayed</option>
                                                //     )}
                                                // </select>
                                            }
                                        </td>

                                    </tr>
                                ))}
                        </tbody>
                    </Table>
                    <Pagination className="justify-content-center mt-4">
                        <Pagination.First onClick={() => setCurrentPage(1)} disabled={currentPage === 1} />
                        <Pagination.Prev onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} />
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <Pagination.Item key={page} active={page === currentPage} onClick={() => setCurrentPage(page)}>
                                {page}
                            </Pagination.Item>
                        ))}
                        <Pagination.Next onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} />
                        <Pagination.Last onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} />
                    </Pagination>

                </Col>
            </Row>


            <Modal show={showModel} onHide={onHide} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Order Delayed</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <p className="text-muted">
                        Your order has been delayed. Please enter your next pickup date.
                    </p>

                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Pickup Date</Form.Label>
                            <Form.Control
                                type="date"
                                value={nextDate}
                                onChange={(e) => setNextDate(e.target.value)}
                            />
                        </Form.Group>

                        <Button
                            variant="danger"
                            className="w-100"
                            onClick={handleSubmit}
                        >
                            Confirm Reschedule
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </Container>
    );
}
