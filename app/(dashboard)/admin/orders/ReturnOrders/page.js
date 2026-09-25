'use client';
import { Col, Row, Form, Table, Button, Container, Modal, Badge } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import { postApi, getApi } from 'services/api';
import { config } from 'services/config';
import Paginations from 'app/(dashboard)/components/pagination/page';
import Swal from 'sweetalert2';

export default function ReturnOrders() {
  const [returnOrders, setReturnOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchOrderNo, setSearchOrderNo] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [fullOrderDetails, setFullOrderDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  const fetchReturnOrders = async () => {
    try {
      setLoading(true);
      const endpoint = config.findAllOrders;
      const response = await postApi(endpoint);
      console.log("Response:", response);
      if (response.statusCode === 201 || response.statusCode === 200) {
        // Filter only return orders
        const returns = response.data?.filter(item => item.status === 'orderReturned') || [];
        setReturnOrders(returns);
        setFilteredOrders(returns);
        setTotalPages(Math.ceil(returns.length / itemsPerPage));
      }
    } catch (error) {
      console.error("Error fetching return orders:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to fetch return orders',
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch full order details using FindOrderDataById
  const fetchFullOrderDetails = async (orderId) => {
    try {
      setModalLoading(true);
      const endpoint = config.FindOrderDataById;
      const data = { order_id: orderId };
      const response = await postApi(endpoint, data);
      console.log("Full Order Details:", response);
      if (response.statusCode === 200 || response.statusCode === 201) {
        setFullOrderDetails(response.data[0]);
      } else {
        throw new Error('Failed to fetch order details');
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to fetch order details',
      });
    } finally {
      setModalLoading(false);
    }
  };

  useEffect(() => {
    fetchReturnOrders();
  }, []);

  // Pagination
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSearch = async () => {
    if (!searchOrderNo.trim()) {
      setFilteredOrders(returnOrders);
      setTotalPages(Math.ceil(returnOrders.length / itemsPerPage));
      return;
    }

    const filtered = returnOrders.filter(order => 
      order?.order?.invoiceNo?.toString().includes(searchOrderNo.toLowerCase())
    );
    setFilteredOrders(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    setCurrentPage(1);
  };

  const handleViewClick = async (returnOrder) => {
    console.log("Selected Return:", returnOrder);
    setSelectedReturn(returnOrder);
    setShowModal(true);
    // Fetch full order details using the orderId
    if (returnOrder?.orderId) {
      await fetchFullOrderDetails(returnOrder.orderId);
    }
  };

  const handleApproveReturn = async (productItem, returnOrder) => {
    try {
      const payload = {
        orderId: returnOrder.orderId,
        productId: productItem._id,
        products: {
          productId: productItem._id,
          productPrice: productItem.productPrice || productItem.price,
          quantity: productItem.quantity || productItem.buy_count || 1,
          productName: productItem.productName,
          discount: productItem.discount || "",
          status: 'approved',
          discountedPrice: productItem.discountedPrice || productItem.price
        },
      };
      
      console.log("Approve Payload:", payload);
      const endpoint = config.applyforReturn || config.applyForReturnByAdmin;
      const response = await postApi(endpoint, payload);
      
      if (response && (response.statusCode === 201 || response.statusCode === 200)) {
        Swal.fire({
          icon: 'success',
          title: 'Approved',
          text: 'Return request approved successfully',
        });
        fetchReturnOrders(); // Refresh the list
        // Refresh the modal data
        if (returnOrder?.orderId) {
          await fetchFullOrderDetails(returnOrder.orderId);
        }
      } else {
        throw new Error(response?.message || 'Failed to approve return');
      }
    } catch (error) {
      console.error("Error approving return:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Failed to approve return',
      });
    }
  };

  const handleRejectReturn = async (productItem, returnOrder) => {
    try {
      const payload = {
        orderId: returnOrder.orderId,
        productId: productItem._id,
        status: 'rejected',
        reason: 'Return request rejected by admin'
      };
      
      console.log("Reject Payload:", payload);
      // Add your reject API endpoint here
      // const response = await postApi(config.rejectReturn, payload);
      
      Swal.fire({
        icon: 'info',
        title: 'Rejected',
        text: 'Return request rejected',
      });
      
      fetchReturnOrders();
      if (returnOrder?.orderId) {
        await fetchFullOrderDetails(returnOrder.orderId);
      }
    } catch (error) {
      console.error("Error rejecting return:", error);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'orderReturned':
        return <Badge bg="warning">Returned</Badge>;
      case 'returnApproved':
        return <Badge bg="success">Approved</Badge>;
      // case 'returnRejected':
      //   return <Badge bg="danger">Rejected</Badge>;
      // case 'returnCompleted':
      //   return <Badge bg="info">Completed</Badge>;
      // default:
      //   return <Badge bg="secondary">{status || 'Pending'}</Badge>;
    }
  };

  const handleResetSearch = () => {
    setSearchOrderNo("");
    setFilteredOrders(returnOrders);
    setTotalPages(Math.ceil(returnOrders.length / itemsPerPage));
    setCurrentPage(1);
  };

  // Calculate discount ratio for items (similar to OrderDetails component)
  const calculateItemDetails = (item, orderData) => {
    const adminDiscount = orderData?.adminDiscount || 0;
    const couponDiscount = orderData?.discountAmount || 0;
    const totalDiscount = adminDiscount || couponDiscount;
    const subtotal = orderData?.orderItems?.reduce((acc, i) => acc + (i.productPrice * i.quantity), 0) || 0;
    const discountRatio = subtotal > 0 ? totalDiscount / subtotal : 0;
    
    const itemTotal = (item?.productPrice || 0) * (item?.quantity || 0);
    const itemDiscount = itemTotal * discountRatio;
    const finalPrice = itemTotal - itemDiscount;
    
    return { itemTotal, itemDiscount, finalPrice };
  };

  return (
    <Container fluid className="p-6">
      <Row className="align-items-center mb-4">
        <Col>
          <h2>Return Orders</h2>
          <p className="text-muted">Manage and process customer return requests</p>
        </Col>
        <Col xs="auto">
          <Button variant="outline-primary" onClick={fetchReturnOrders}>
            Refresh
          </Button>
        </Col>
      </Row>

      <Row>
        <Col xl={12}>
          <Form className="d-flex align-items-center gap-2 my-3">
            <Form.Control
              type="text"
              placeholder="Search by Order No."
              value={searchOrderNo}
              onChange={(e) => setSearchOrderNo(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              style={{ maxWidth: '300px' }}
            />
            <Button variant="primary" onClick={handleSearch}>
              Search
            </Button>
            <Button variant="secondary" onClick={handleResetSearch}>
              Reset
            </Button>
          </Form>

          <div className="mb-3">
            <strong>Total Return Requests:</strong> {filteredOrders.length}
          </div>

          <Table hover responsive className="text-nowrap">
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                <th>#</th>
                <th>Order ID</th>
                <th>Order Amount</th>
                <th>Discount</th>
                <th>Shipping</th>
                <th>Grand Total</th>
                <th>Status</th>
                <th>Return Date</th>
                <th>Action</th>
               </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" className="text-center">Loading...</td>
                </tr>
              ) : paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center">No return orders found</td>
                </tr>
              ) : (
                paginatedOrders.map((returnOrder, index) => (
                  <tr key={returnOrder._id}>
                    <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td>
                      <strong>Ved{returnOrder?.order?.invoiceNo || returnOrder?.orderId?.slice(-6)}</strong>
                    </td>
                    <td>${returnOrder?.order?.totalAmount?.toFixed(2) || '0.00'}</td>
                    <td>${returnOrder?.order?.discountAmount?.toFixed(2) || '0.00'}</td>
                    <td>${returnOrder?.order?.deliveryCharge?.toFixed(2) || '0.00'}</td>
                    <td>
                      <strong>${returnOrder?.order?.grandTotal?.toFixed(2) || '0.00'}</strong>
                    </td>
                    <td>{getStatusBadge(returnOrder?.status)}</td>
                    <td>{new Date(returnOrder?.created_at).toLocaleDateString("en-US")}</td>
                    <td>
                      <Button 
                        onClick={() => handleViewClick(returnOrder)} 
                        variant="warning" 
                        size="sm"
                      >
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>

          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <Paginations 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </Col>
      </Row>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          Return Request Details - Order No. Ved{selectedReturn?.order?.invoiceNo || selectedReturn?.orderId?.slice(-6) || 'N/A'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {modalLoading ? (
          <div className="text-center py-5">Loading order details...</div>
        ) : fullOrderDetails ? (
          <>
            <Row className="mb-3">
              <Col md={6}>
                <strong>Order ID:</strong> Ved-{fullOrderDetails?.invoiceNo || 'N/A'}<br />
                <strong>Order Status:</strong> {fullOrderDetails?.orderStatus || 'N/A'}<br />
                <strong>Payment Method:</strong> {fullOrderDetails?.paymentMethod || 'N/A'}<br />
                {/* <strong>Return Status:</strong> {getStatusBadge(selectedReturn?.status)}<br /> */}
                <strong>Return Date:</strong> {selectedReturn?.created_at ? new Date(selectedReturn.created_at).toLocaleString() : 'N/A'}
              </Col>
              <Col md={6}>
                <strong>Customer:</strong> {fullOrderDetails?.userInfo?.name || 'N/A'}<br />
                <strong>Email:</strong> {fullOrderDetails?.userInfo?.email || 'N/A'}<br />
                <strong>Phone:</strong> {fullOrderDetails?.userInfo?.mobileNo || 'N/A'}<br />
                <strong>Order Date:</strong> {fullOrderDetails?.created_at ? new Date(fullOrderDetails.created_at).toLocaleString() : 'N/A'}
              </Col>
            </Row>
            
            <hr />
            <h6>Products Return Request:</h6>
            <Table bordered responsive size="sm">
              <thead>
                <tr style={{ backgroundColor: '#332d2d', color: 'whitesmoke' }}>
                  <th style={{ width: '80px' }}>Status</th>
                  <th style={{ width: '50px' }}>#</th>
                  <th>Product Name</th>
                  <th style={{ width: '100px' }}>Unit Price</th>
                  <th style={{ width: '80px' }}>Quantity</th>
                  <th style={{ width: '100px' }}>Discount</th>
                  <th style={{ width: '100px' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {fullOrderDetails?.orderItems?.map((item, idx) => {
                  const isReturned = selectedReturn?.productId?.some(
                    id => id.toString() === item._id?.toString()
                  );
                  const { itemTotal, itemDiscount, finalPrice } = calculateItemDetails(item, fullOrderDetails);
                  
                  return (
                    <tr key={item._id || idx}>
                      <td style={{ textAlign: 'center' }}>
                        {isReturned ? (
                          <Badge bg="success">Returned</Badge>
                        ) : (
                          <Badge bg="secondary">Not Returned</Badge>
                        )}
                      </td>
                      <td>{idx + 1}</td>
                      <td>{item?.productName || 'N/A'}</td>
                      <td>${item?.productPrice?.toFixed(2) || '0.00'}</td>
                      <td>{item?.quantity || 1}</td>
                      <td>
                        <div>${itemTotal.toFixed(2)}</div>
                        <div style={{ color: 'red', fontSize: '11px' }}>
                          -${itemDiscount.toFixed(2)}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: '600' }}>
                          ${finalPrice.toFixed(2)}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>

            {/* Order Summary */}
            <Row className="mt-3">
              <Col md={{ span: 6, offset: 6 }}>
                <Table bordered size="sm" style={{ fontSize: '0.9rem' }}>
                  <tbody>
                    <tr>
                      <th style={{ backgroundColor: '#f1f3f5' }}>Subtotal</th>
                      <td>${fullOrderDetails?.orderItems?.reduce((acc, item) => acc + (item.productPrice * item.quantity), 0).toFixed(2)}</td>
                    </tr>
                    
                    {/* Show Coupon Discount only if coupon was applied */}
                    {fullOrderDetails?.couponInfo?.couponCode && fullOrderDetails?.discountAmount > 0 && (
                      <tr>
                        <th style={{ backgroundColor: '#f1f3f5' }}>Coupon Discount</th>
                        <td>- ${fullOrderDetails?.discountAmount?.toFixed(2)}</td>
                      </tr>
                    )}
                    
                    {/* Show Admin Discount only if NO coupon was applied */}
                    {!fullOrderDetails?.couponInfo?.couponCode && fullOrderDetails?.adminDiscount > 0 && (
                      <tr>
                        <th style={{ backgroundColor: '#f1f3f5' }}>Discount</th>
                        <td>- ${fullOrderDetails?.adminDiscount?.toFixed(2)}</td>
                      </tr>
                    )}
                    
                    <tr>
                      <th style={{ backgroundColor: '#f1f3f5' }}>Delivery Charge</th>
                      <td>${fullOrderDetails?.deliveryCharge?.toFixed(2) || '0.00'}</td>
                    </tr>
                    <tr>
                      <th style={{ backgroundColor: '#f1f3f5' }}>Grand Total</th>
                      <td style={{ fontWeight: 'bold', fontSize: '1rem' }}>
                        ${fullOrderDetails?.grandTotal?.toFixed(2) || '0.00'}
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </Col>
            </Row>

            {fullOrderDetails?.couponInfo?.couponCode && (
              <div className="mt-2">
                <strong>Coupon Applied:</strong> {fullOrderDetails.couponInfo.couponCode} — {fullOrderDetails.couponInfo.description || ''}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-5">No order details available</div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowModal(false)}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
    </Container>
  );
}