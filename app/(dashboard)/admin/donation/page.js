'use client';
import { useState } from 'react';
import { Container, Row, Col, Table, Pagination } from 'react-bootstrap';

// DonationList Component
export default function DonationList() {
    // Dummy donation data
    const [donations, setDonations] = useState([
        { id: 1, name: 'John Doe', email: 'john.doe@example.com', amount: 50, method: 'Credit Card' },
        { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com', amount: 100, method: 'PayPal' },
        { id: 3, name: 'Alice Johnson', email: 'alice.johnson@example.com', amount: 75, method: 'Bank Transfer' },
        { id: 4, name: 'Mark Lee', email: 'mark.lee@example.com', amount: 200, method: 'Credit Card' },
        { id: 5, name: 'Sophia Brown', email: 'sophia.brown@example.com', amount: 150, method: 'PayPal' },
    ]);

    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 2; // Number of donations per page
    const totalPages = Math.ceil(donations.length / pageSize);

    // Paginated donations
    const paginatedDonations = donations.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    // Handle page change
    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    return (
        <Container fluid className="p-4">
            <Row className="mb-4">
                <Col>
                    <h2>Donation List</h2>
                </Col>
            </Row>

            <Row>
                <Col xl={12} lg={12} md={12} sm={12}>
                    <Table hover responsive className="text-nowrap">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Amount ($)</th>
                                <th>Payment Method</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedDonations.map((donation, index) => (
                                <tr key={donation.id}>
                                    <td>{(currentPage - 1) * pageSize + index + 1}</td>
                                    <td>{donation.name}</td>
                                    <td>{donation.email}</td>
                                    <td>{donation.amount.toFixed(2)}</td>
                                    <td>{donation.method}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>

                    {/* Pagination */}
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
