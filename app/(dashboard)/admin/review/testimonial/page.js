'use client';

import { Col, Row, Form, Table, Button, Container, Pagination } from 'react-bootstrap';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Eye, PencilSquare } from 'react-bootstrap-icons';
import { StarFill } from 'react-bootstrap-icons';
import { postApi } from 'services/api';
import { config } from 'services/config';

export default function Testimonials() {
    const [searchTerm, setSearchTerm] = useState('');
    const [testimonials, setTestimonials] = useState([]);
    const [filteredTestimonials, setFilteredTestimonials] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const hasFetched = useRef(false);

    useEffect(() => {
        fetchTestimonials(currentPage);
    }, [currentPage]);

    const fetchTestimonials = async (page) => {
        try {
            const endpoint = config.testimonials;
            const data = { page: page, pageSize: pageSize };
            const response = await postApi(endpoint, data);
            console.log(response)
            setTestimonials(response.testimonial || []);
            setFilteredTestimonials(response.testimonial || []);
            setTotalPages(response.totalPages || 1);
            setTotalCount(response.totalCount || 0);
        } catch (error) {
            console.error('Error fetching testimonials:', error);
        }
    };

    const toggleStatus = async (id, status) => {
        try {
            const endpoint = config.updateTestimonialStatus;
            const data = { id, status: status === 'Active' ? 'Inactive' : 'Active' };
            await postApi(endpoint, data);
            fetchTestimonials(currentPage);
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const handleSearch = () => {
        const results = testimonials.filter(testimonial =>
            testimonial.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            testimonial.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            testimonial.practitionersName.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredTestimonials(results);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const renderStars = (rating) => {
        return Array.from({ length: 5 }, (_, index) => (
            <StarFill key={index} color={index < rating ? "gold" : "lightgray"} />
        ));
    };

    const truncateComment = (comment) => {
        return comment?.length > 50 ? comment.slice(0, 50) + '...' : comment;
    };

    return (
        <Container fluid className="p-6">
            <Row className="align-items-center mb-4">
                <Col>
                    <h2>Customer Reviews</h2>
                </Col>
                <Col className="d-flex justify-content-end">
                    {/* <Link href="testimonial/add-testimonial" passHref>
                        <Button variant="primary">Add New Testimonial</Button>
                    </Link> */}
                </Col>
            </Row>

            <Row>
                <Col xl={12} lg={12} md={12} sm={12}>
                    <div className="my-3">
                        <Form className="d-flex align-items-center gap-2">
                            <Form.Control
                                type="text"
                                placeholder="Search by Name, Email, or Practitioner's Name"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <Button variant="primary" onClick={handleSearch}>Search</Button>
                        </Form>
                    </div>

                    <Table hover responsive className="text-nowrap">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>First Name</th>
                                 <th>Last Name</th>
                                <th>Practitioner Name</th>
                                <th>Ratings</th>
                                <th>Review</th>
                                 <th>Note</th>
                                {/* <th>Status</th> */}
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTestimonials.map((testimonial, index) => (
                                <tr key={testimonial.id}>
                                    <td>{(currentPage - 1) * pageSize + index + 1}</td>
                                    <td>{testimonial.firstName}</td>
                                    <td>{testimonial.lastName}</td>
                                     <td>{testimonial.practionerName}</td>
                                    <td>{renderStars(testimonial.rating)}</td>
                                    <td>{truncateComment(testimonial.review)}</td>
                                    <td>{truncateComment(testimonial.note)}</td>
                                    
                                    <td>
                                        <Link href={`/admin/review/testimonial/view/${testimonial._id}`}>
                                            <Eye size={20} style={{ marginRight: '10px' }} />
                                        </Link>
                                        {/* <Link href={`/admin/review/testimonial/edit/${testimonial._id}`}>
                                            <PencilSquare size={20} />
                                        </Link> */}
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
