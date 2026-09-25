// File path: app/testimonial/[id]/page.js

'use client';

import { useEffect, useState } from 'react';
import { Container, Row, Col, Button, Table } from 'react-bootstrap';
import Link from 'next/link';
import { config } from 'services/config';
import { postApi } from 'services/api';

export default function TestimonialDetails({ params }) {
    const id = params.viewid;
    const [testimonial, setTestimonial] = useState(null);

    useEffect(() => {
        if (id) {
            fetchTestimonialDetails();
        }
    }, [id]);

    const fetchTestimonialDetails = async () => {
        try {
            const endpoint = config.Viewtestimonial; // Replace with the correct endpoint for fetching a single testimonial
            const data = { id };
            const response = await postApi(endpoint, data);

            console.log('Fetched Testimonial:', response);
            if (response.statusCode === 201) {
                setTestimonial(response.testimonial);
            }
        } catch (error) {
            console.error('Error fetching testimonial:', error);
        }
    };

    if (!testimonial) {
        return <div>Loading...</div>;
    }

    const renderStars = (rating) => {
        return Array.from({ length: 5 }, (_, index) => (
            <span key={index} style={{ color: index < rating ? 'gold' : 'lightgray' }}>
                ★
            </span>
        ));
    };

    return (
        <Container fluid className="p-6">
            <Link href={`/admin/review/testimonial`}>
                <Button variant="secondary" style={{ float: 'right' }} className="mb-3">
                    Back
                </Button>
            </Link>
            <Row>
                <Col md={12}>
                    <h2>Cstomer Review Details</h2>
                    <Table bordered className="mt-3">
                        <tbody>
                            <tr>
                                <th>First Name</th>
                                <td>{testimonial.firstName}</td>
                            </tr>
                            <tr>
                                <th>Last Name</th>
                                <td>{testimonial.lastName}</td>
                            </tr>
                            <tr>
                                <th>Email</th>
                                <td>{testimonial.email}</td>
                            </tr>
                            <tr>
                                <th>Mobile Number</th>
                                <td>{testimonial.mobile}</td>
                            </tr>
                            <tr>
                                <th>Practitioner&apos;s Name</th>
                                <td>{testimonial.practionerName}</td>
                            </tr>
                            <tr>
                                <th>Ratings</th>
                                <td>{renderStars(testimonial.rating)}</td>
                            </tr>
                            <tr>
                                <th>Review</th>
                                <td>{testimonial.review}</td>
                            </tr>
                            <tr>
                                <th>Note</th>
                                <td>{testimonial.note}</td>
                            </tr>
                            <tr>
                                <th>Status</th>
                                <td style={{ color: testimonial.isAnonymous === true ? 'green' : 'red' }}>
                                    <b>{testimonial.isAnonymous === true ? "Anonymous":"Public"}</b>
                                </td>
                            </tr>
                            <tr>
                                <th>Created Date</th>
                                <td>{testimonial.date}</td>
                            </tr>
                        </tbody>
                    </Table>
                </Col>
            </Row>
        </Container>
    );
}
