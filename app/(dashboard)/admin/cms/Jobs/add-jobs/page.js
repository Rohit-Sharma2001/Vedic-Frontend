'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import { config } from 'services/config';
import { postApi } from 'services/api';
import Link from 'next/link';

export default function AddJobOpening() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        jobTitle: '',
        jobDescription: '',
        jobLocation: '',
        jobType: '',
        salary: '',
        paymentType: '',
    });

    const [errors, setErrors] = useState({});

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
        setErrors({ ...errors, [name]: '' }); // Clear error for this field
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(formData)
        try {
            const endpoint = config.Addjob;
            const data = { ...formData };
            console.log(data);

            const response = await postApi(endpoint, data);

            if (response.statusCode === 201) {
                router.push('/admin/cms/Jobs');
                resetForm();
            } else {
                alert('Failed to add coupon!');
            }
        } catch (error) {
            console.error('Error submitting coupon:', error);
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
                                    <h2>Add New Job Opening</h2>
                                </Col>
                                <Col className="d-flex justify-content-end">
                                    <Link href={'/admin/cms/Jobs'}>
                                        <Button variant="danger">Back</Button>
                                    </Link>
                                </Col>
                            </Row>

                            <Form onSubmit={handleSubmit}>
                                <Row>
                                    {/* Job Title */}
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>
                                                <strong>Job Title</strong> <b style={{ color: 'red' }}>*</b>
                                            </Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="jobTitle"
                                                value={formData.jobTitle}
                                                onChange={handleInputChange}
                                            />
                                            {errors.jobTitle && (
                                                <div className="text-danger">{errors.jobTitle}</div>
                                            )}
                                        </Form.Group>
                                    </Col>

                                    {/* Job Location */}
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>
                                                <strong>Job Location</strong> <b style={{ color: 'red' }}>*</b>
                                            </Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="jobLocation"
                                                value={formData.jobLocation}
                                                onChange={handleInputChange}
                                            />
                                            {errors.jobLocation && (
                                                <div className="text-danger">{errors.jobLocation}</div>
                                            )}
                                        </Form.Group>
                                    </Col>

                                    {/* Job Type */}
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>
                                                <strong>Job Type</strong> <b style={{ color: 'red' }}>*</b>
                                            </Form.Label>
                                            <Form.Select
                                                name="jobType"
                                                value={formData.jobType}
                                                onChange={handleInputChange}
                                            >
                                                <option value="">Select Job Type</option>
                                                <option value="Volunteer">Volunteer</option>
                                                <option value="Paid">Paid</option>
                                            </Form.Select>
                                            {errors.jobType && (
                                                <div className="text-danger">{errors.jobType}</div>
                                            )}
                                        </Form.Group>
                                    </Col>

                                    {/* Salary (hidden for Volunteer) */}
                                    {formData.jobType !== 'Volunteer' && (
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>
                                                    <strong>Salary (in dollars)</strong> <b style={{ color: 'red' }}>*</b>
                                                </Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    name="salary"
                                                    value={formData.salary}
                                                    onChange={handleInputChange}
                                                />
                                                {errors.salary && (
                                                    <div className="text-danger">{errors.salary}</div>
                                                )}
                                            </Form.Group>
                                        </Col>
                                    )}

                                    {/* Payment Type (hidden for Volunteer) */}
                                    {formData.jobType !== 'Volunteer' && (
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>
                                                    <strong>Payment Type</strong> <b style={{ color: 'red' }}>*</b>
                                                </Form.Label>
                                                <Form.Select
                                                    name="paymentType"
                                                    value={formData.paymentType}
                                                    onChange={handleInputChange}
                                                >
                                                    <option value="">Select Payment Type</option>
                                                    <option value="Monthly">Monthly</option>
                                                    <option value="Hourly">Hourly</option>
                                                    <option value="Weekly">Weekly</option>
                                                </Form.Select>
                                                {errors.paymentType && (
                                                    <div className="text-danger">{errors.paymentType}</div>
                                                )}
                                            </Form.Group>
                                        </Col>
                                    )}

                                    {/* Job Description */}
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>
                                                <strong>Job Description</strong> <b style={{ color: 'red' }}>*</b>
                                            </Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                rows={3}
                                                name="jobDescription"
                                                value={formData.jobDescription}
                                                onChange={handleInputChange}
                                            />
                                            {errors.jobDescription && (
                                                <div className="text-danger">{errors.jobDescription}</div>
                                            )}
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Button type="submit" variant="primary">Add Job Opening</Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}
