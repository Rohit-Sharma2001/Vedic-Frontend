'use client';

import { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import { config } from 'services/config';
import { postApi } from 'services/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';


export default function EditJobOpening({ params }) {
    const router = useRouter();
    const editid  = params.editid; // Access the ID from the `params` prop
    const [formData, setFormData] = useState({
        _id: '',
        jobTitle: '',
        jobDescription: '',
        jobLocation: '',
        jobType: '',
        salary: '',
        paymentType: '',
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (editid) {
            fetchJobDetails();
        }
    }, [editid]);

    const fetchJobDetails = async () => {
        try {
            const endpoint = config.ViewJob;
            const data = { id: editid };
            const response = await postApi(endpoint, data);
console.log(response)
            if (response.statusCode === 201) {
                const jobs = response.JobManagement;
                setFormData({
                    _id: jobs._id || '',
                    jobTitle: jobs.jobTitle || '',
                    jobDescription: jobs.jobDescription || '',
                    jobLocation: jobs.jobLocation || '',
                    jobType: jobs.jobType || 0,
                    salary: jobs.salary || 0,
                    paymentType: jobs.paymentType || 0,
                });
                
            }
        } catch (error) {
            console.error('Error fetching coupon details:', error);
        }
    };

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
            const endpoint = config.Updatejob;
            const data = { ...formData };

            const response = await postApi(endpoint, data);

            if (response.statusCode === 200) {
                router.push('/admin/cms/Jobs');
            } else {
                alert('Failed to update coupon!');
            }
        } catch (error) {
            console.error('Error updating coupon:', error);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <Container fluid>
            <Row>
                <Col>
                    <Card className="p-4 mt-4">
                        <Card.Body>
                            <Row className="mb-3">
                                <Col>
                                    <h2>Edit Job Opening</h2>
                                </Col>
                                <Col className="d-flex justify-content-end">
                                    <Link href={'/admin/cms/Jobs'}>
                                        <Button variant="danger">Back</Button>
                                    </Link>
                                </Col>
                            </Row>

                            <Form onSubmit={handleSubmit}>
                                <Row>
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
                                    {formData.jobType !== 'Volunteer' && (
                                        <>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>
                                                        <strong>Salary</strong> <b style={{ color: 'red' }}>*</b>
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
                                        </>
                                    )}
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
                                <Button type="submit" variant="primary">
                                    Update Job
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}
