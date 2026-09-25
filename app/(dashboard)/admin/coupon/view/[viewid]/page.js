'use client';

import { useEffect, useState } from 'react';
import { Container, Row, Col, Button, Table } from 'react-bootstrap';
import Link from 'next/link';
import { postApi } from 'services/api';
import { config } from 'services/config';

export default function CouponDetails({ params }) {
    const { viewid } = params;
    const [coupon, setCoupon] = useState(null);

    useEffect(() => {
        if (viewid) {
            fetchCouponDetails();
        }
    }, [viewid]);

    const fetchCouponDetails = async () => {
        try {
            const endpoint = config.Viewcoupon;
            const data = { id: viewid };
            const response = await postApi(endpoint, data);

            if (response.statusCode === 201) {
                setCoupon(response.coupon);
            }
        } catch (error) {
            console.error('Error fetching coupon details:', error);
        }
    };

    if (!coupon) {
        return <div>Loading...</div>;
    }

    return (
        <Container fluid className="p-6">
            <Link href={`/admin/coupon`}>
                <Button variant="secondary" style={{ float: 'right' }} className="mb-3">
                    Back
                </Button>
            </Link>
            <Row>
                <Col md={12}>
                    <h2>Coupon Details</h2>
                    <Table bordered className="mt-3">
                        <tbody>
                            <tr>
                                <th>Title</th>
                                <td>{coupon.title}</td>
                            </tr>
                            <tr>
                                <th>Coupon Code</th>
                                <td>{coupon.couponCode}</td>
                            </tr>
                            <tr>
                                <th>Start Date Time</th>
                                <td>{new Date(coupon.startDateTime).toLocaleString()}</td>
                            </tr>
                            <tr>
                                <th>Discount Type</th>
                                <td>{coupon.discountType}</td>
                            </tr>
                            <tr>
                                <th>Discount Value</th>
                                <td>{coupon.discountValue}</td>
                            </tr>
                            {coupon.discountType === 'percentage' && (
                                <tr>
                                    <th>Max Discount</th>
                                    <td>{coupon.maxDiscount || 'N/A'}</td>
                                </tr>
                            )}
                            <tr>
                                <th>Threshold Amount</th>
                                <td>{coupon.thresholdAmount || 'N/A'}</td>
                            </tr>
                            <tr>
                                <th>Total User Limit</th>
                                <td>{coupon.totalUserLimit}</td>
                            </tr>
                            <tr>
                                <th>Per User Limit</th>
                                <td>{coupon.perUserLimit}</td>
                            </tr>
                            <tr>
                                <th>Expiry Type</th>
                                <td>{coupon.expiryType === 'non-expiry' ? 'Non-Expiry' : 'Expiry'}</td>
                            </tr>
                            {coupon.expiryType === 'expiry' && (
                                <tr>
                                    <th>Expiry Date</th>
                                    <td>{new Date(coupon.expiryDate).toLocaleString()}</td>
                                </tr>
                            )}
                            {/* <tr>
                                <th>Applicable To</th>
                                <td>{coupon.applicableTo === 'cart' ? 'Entire Cart' : 'Specific Products'}</td>
                            </tr> */}
                            {/* {coupon.applicableTo === 'product' && (
                                <tr>
                                    <th>Specific Products</th>
                                    <td>{coupon.specificProducts?.join(', ') || 'N/A'}</td>
                                </tr>
                            )} */}
                            <tr>
                                <th>Customer Type</th>
                                <td>
                                    {coupon.customerType === 'new'
                                        ? 'customerType'
                                        : coupon.customerType === 'existing'
                                        ? 'Existing Customers'
                                        : 'All Customers'}
                                </td>
                            </tr>
                            <tr>
                                <th>Description</th>
                                <td>{coupon.description || 'N/A'}</td>
                            </tr>
                            <tr>
                                <th>Status</th>
                                <td>{coupon.status === 1 ? 'Active' : 'Inactive'}</td>
                            </tr>
                            <tr>
                                <th>Last Modified</th>
                                <td>{new Date(coupon.modified).toLocaleString()}</td>
                            </tr>
                            <tr>
                                <th>Created At</th>
                                <td>{new Date(coupon.date).toLocaleString()}</td>
                            </tr>
                        </tbody>
                    </Table>
                </Col>
            </Row>
        </Container>
    );
}
