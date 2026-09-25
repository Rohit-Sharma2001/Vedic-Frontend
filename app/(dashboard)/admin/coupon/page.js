'use client';

import { useState, useEffect, useRef } from 'react';
import { Col, Row, Form, Table, Button, Container, Pagination } from 'react-bootstrap';
import { Eye, PencilSquare, Trash, Download } from 'react-bootstrap-icons';
import Link from 'next/link';
import Swal from 'sweetalert2';
import { config } from 'services/config';
import { postApi } from 'services/api';

export default function CouponManagement() {
    const [searchQuery, setSearchQuery] = useState('');
    const [coupons, setCoupons] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [downloadingId, setDownloadingId] = useState(null);

    const hasFetched = useRef(false);

    useEffect(() => {
        fetchCoupons(currentPage);
    }, [currentPage]);

    const fetchCoupons = async (page) => {
        try {
            const endpoint = config.coupon;
            const data = { page, pageSize, query: searchQuery };
            const response = await postApi(endpoint, data);
            console.log(response);
            setCoupons(response.coupons || []);
            setTotalPages(response.totalPages || 1);
            setTotalCount(response.totalCount || 0);
        } catch (error) {
            console.error('Error fetching coupons:', error);
        }
    };

const handleDownloadExcel = async (id) => {
  try {
    const payload = btoa(JSON.stringify({ id }));

    const res = await fetch(config.downloadExcel, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: payload }),
    });

    if (!res.ok) {
      const err = await res.json();
      alert(err.message);
      return;
    }

    // ✅ GET BLOB (NOT JSON)
    const blob = await res.blob();

    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;

    // filename from header (optional)
    const disposition = res.headers.get("Content-Disposition");
    let fileName = "coupon.xlsx";

    if (disposition && disposition.includes("filename=")) {
      fileName = disposition.split("filename=")[1];
    }

    a.download = fileName;
    a.click();

    window.URL.revokeObjectURL(url);

  } catch (error) {
    console.error("Download failed", error);
  }
};

    const confirmDelete = (id) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
        }).then((result) => {
            if (result.isConfirmed) {
                deleteCoupon(id);
                Swal.fire('Deleted!', 'Your coupon has been deleted.', 'success');
            }
        });
    };

    const deleteCoupon = async (id) => {
        try {
            const endpoint = config.Deletecoupon;
            const data = { id };
            await postApi(endpoint, data);
            fetchCoupons(currentPage);
        } catch (error) {
            console.error('Error deleting coupon:', error);
        }
    };

    const handleSearch = async () => {
        setCurrentPage(1); // Reset to the first page on search
        fetchCoupons(1);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    return (
        <Container fluid className="p-6">
            <Row className="align-items-center mb-4">
                <Col>
                    <h2>Coupons</h2>
                </Col>
                <Col className="d-flex justify-content-end">
                    <Link href="/admin/coupon/add-coupon">
                        <Button variant="primary">Add New</Button>
                    </Link>
                </Col>
            </Row>

            <Row>
                <Col xl={12} lg={12} md={12} sm={12}>
                    <div className="my-3">
                        <Form className="d-flex align-items-center gap-2">
                            <Form.Control
                                type="text"
                                placeholder="Search by Title or Code"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <Button variant="primary" onClick={handleSearch}>
                                Search
                            </Button>
                        </Form>
                    </div>

                    <Table hover responsive className="text-nowrap">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Title</th>
                                <th>Coupon Code</th>
                                <th>Discount Type</th>
                                <th>Discount Value</th>
                                <th>Max Discount</th>
                                <th>Start Date</th>
                                <th>Expiry Date</th>
                                {/* <th>Applicable To</th> */}
                                {/* <th>Specific Products</th> */}
                                <th>User Limit</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {coupons.map((coupon, index) => (
                                <tr key={coupon._id}>
                                    <td>{(currentPage - 1) * pageSize + index + 1}</td>
                                    <td>{coupon.title}</td>
                                    <td>{coupon.couponCode}</td>
                                    <td>{coupon.discountType}</td>
                                    <td>{coupon.discountValue}</td>
                                    <td>{coupon.maxDiscount || 'N/A'}</td>
                                    <td>{new Date(coupon.startDateTime).toLocaleDateString('en-US')}</td>
                                    <td>
                                        {coupon.expiryType === 'non-expiry'
                                            ? 'Non-Expiry'
                                            : new Date(coupon.expiryDate).toLocaleDateString('en-US')}
                                    </td>
                                    {/* <td>{coupon.applicableTo === 'cart' ? 'Entire Cart' : 'Specific Products'}</td> */}
                                    {/* <td>
                                        {coupon.applicableTo === 'product'
                                            ? coupon.specificProducts.join(', ')
                                            : 'N/A'}
                                    </td> */}
                                    <td>{coupon.perUserLimit}</td>
                                    <td>
                                        <Link href={`/admin/coupon/view/${coupon._id}`}>
                                            <Eye size={20} style={{ marginRight: '10px' }} />
                                        </Link>
                                        <Link href={`/admin/coupon/edit/${coupon._id}`}>
                                            <PencilSquare size={20} style={{ marginRight: '10px' }} />
                                        </Link>
                                        <span
                                            onClick={() => confirmDelete(coupon._id)}
                                            style={{ cursor: 'pointer', color: '#624bff' }}
                                        >
                                            <Trash size={20} />
                                        </span>
                                        <span
                                            onClick={async () => {
                                                setDownloadingId(coupon._id);
                                                await handleDownloadExcel(coupon._id);
                                                setDownloadingId(null);
                                            }}
                                            style={{ cursor: 'pointer', color: '#28a745', marginRight: '10px' }}
                                            title="Download Excel"
                                        >
                                            <Download size={20} style={{ opacity: downloadingId === coupon._id ? 0.5 : 1 }} />
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>






                    <Pagination className="justify-content-center mt-4">
                        <Pagination.First
                            onClick={() => handlePageChange(1)}
                            disabled={currentPage === 1}
                        />
                        <Pagination.Prev
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                        />
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <Pagination.Item
                                key={page}
                                active={page === currentPage}
                                onClick={() => handlePageChange(page)}
                            >
                                {page}
                            </Pagination.Item>
                        ))}
                        <Pagination.Next
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        />
                        <Pagination.Last
                            onClick={() => handlePageChange(totalPages)}
                            disabled={currentPage === totalPages}
                        />
                    </Pagination>
                </Col>
            </Row>
        </Container>
    );
}
