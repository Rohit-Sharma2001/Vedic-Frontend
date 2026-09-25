'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import Link from 'next/link';
import { postApi, updateApiWithFile } from 'services/api';
import { config } from 'services/config';

export default function EditTestimonial({ params }) {
    const router = useRouter();
    const testimonialId = params.editid; // Get testimonial ID from params

    const [formData, setFormData] = useState({
        _id: testimonialId,
        name: '',
        email: '',
        practitionersName: '',
        comment: '',
        status: 'Active',
        ratings: 1,
    });

    useEffect(() => {
        if (testimonialId) {
            fetchTestimonial();
        }
    }, [testimonialId]);

    const fetchTestimonial = async () => {
        try {
            const endpoint = config.Viewtestimonial;
            const data = { id: testimonialId };
            const response = await postApi(endpoint, data);

            if (response.statusCode === 201) {
                setFormData({ ...response.testimonial });
            }
        } catch (error) {
            console.error('Error fetching testimonial:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const endpoint = config.Updatetestimonial;
            const data = { ...formData };

            const response = await postApi(endpoint, data);
console.log(response)
            if (response.statusCode === 200) {
                router.push('/admin/review/testimonial');
            } else {
                alert('Failed to update coupon!');
            }
        } catch (error) {
            console.error('Error updating coupon:', error);
        }
    };

    return (
        <Container fluid>
            <Row>
                <Col>
                    <Card className="p-4 mt-4">
                        <Card.Body>
                            <Row className="mb-3">
                                <Col>
                                    <h2>Edit Testimonial</h2>
                                </Col>
                                <Col className="d-flex justify-content-end">
                                    <Link href={'/admin/review/testimonial'}>
                                        <Button variant="danger">Back</Button>
                                    </Link>
                                </Col>
                            </Row>
                            <Form onSubmit={handleSubmit}>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Name</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Email</Form.Label>
                                            <Form.Control
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Practitioner&apos;s Name</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="practitionersName"
                                                value={formData.practitionersName}
                                                onChange={handleInputChange}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Ratings</Form.Label>
                                            <Form.Control
                                                type="number"
                                                name="ratings"
                                                min="1"
                                                max="5"
                                                value={formData.ratings}
                                                onChange={handleInputChange}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={12}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Comment</Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                name="comment"
                                                rows={3}
                                                value={formData.comment}
                                                onChange={handleInputChange}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Status</Form.Label>
                                            <Form.Select
                                                name="status"
                                                value={formData.status}
                                                onChange={handleInputChange}
                                            >
                                                <option value={1}>Active</option>
                                                <option value={0}>Inactive</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Button type="submit" variant="primary">
                                    Update Testimonial
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}
