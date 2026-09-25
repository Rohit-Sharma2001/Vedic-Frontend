'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import Link from 'next/link';
import { StarFill } from 'react-bootstrap-icons';
import { postApi } from 'services/api'; // Assuming you have a helper function for API calls
import { config } from 'services/config'; // Assuming your API endpoint configuration is here

export default function AddTestimonial() {
    const router = useRouter(); // Initialize router
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        designation: '',
        practitionersName: '',
        ratings: 0, // Stores the selected rating
        comment: ''
    });

    const [submissionStatus, setSubmissionStatus] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleStarClick = (rating) => {
        setFormData({
            ...formData,
            ratings: rating
        });
    };
    const ResetForm = () => {
        setFormData({
            name: '',
            email: '',
            designation: '',
            practitionersName: '',
            ratings: 0, // Stores the selected rating
            comment: ''
        }); 
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(formData)
        try {
            const endpoint = config.Addtestimonial; // Replace with your actual endpoint

            // Send form data to the API
            const response = await postApi(endpoint, formData);

            console.log('Response:', response);
            if(response.statusCode===201){
                ResetForm();
                router.push('/admin/testimonial');

            }
            
        } catch (error) {
            console.error('Error submitting testimonial:', error);
            setSubmissionStatus('Failed to add testimonial.');
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
                                    <h2>Add New Testimonial</h2>
                                </Col>
                                <Col className="d-flex justify-content-end">
                                    <Link href={'/admin/review/testimonial'}>
                                        <Button variant="danger">Back</Button>
                                    </Link>
                                </Col>
                            </Row>
                            <Form onSubmit={handleSubmit}>
                                {/* Form Fields */}
                                <Row>
                                    <Col md={12}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Name</Form.Label><b style={{ color: 'red' }}>*</b>
                                            <Form.Control
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={12}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Email</Form.Label><b style={{ color: 'red' }}>*</b>
                                            <Form.Control
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={12}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Designation</Form.Label><b style={{ color: 'red' }}>*</b>
                                            <Form.Control
                                                type="text"
                                                name="designation"
                                                value={formData.designation}
                                                onChange={handleInputChange}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={12}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Practitioner Name</Form.Label><b style={{ color: 'red' }}>*</b>
                                            <Form.Control
                                                type="text"
                                                name="practitionersName"
                                                value={formData.practitionersName}
                                                onChange={handleInputChange}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={12}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Ratings</Form.Label><b style={{ color: 'red' }}>*</b>
                                            <div>
                                                {Array.from({ length: 5 }, (_, index) => (
                                                    <StarFill
                                                        key={index}
                                                        size={24}
                                                        color={index < formData.ratings ? "gold" : "lightgray"}
                                                        onClick={() => handleStarClick(index + 1)}
                                                        style={{ cursor: 'pointer', marginRight: '5px' }}
                                                    />
                                                ))}
                                            </div>
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={12}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Comment</Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                rows={4}
                                                name="comment"
                                                value={formData.comment}
                                                onChange={handleInputChange}
                                                
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Button type="submit" variant="primary">Add Testimonial</Button>
                            </Form>
                            {submissionStatus && <p className="mt-3">{submissionStatus}</p>}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}
