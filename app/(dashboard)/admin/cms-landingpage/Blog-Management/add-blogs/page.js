'use client';

import { useState } from 'react';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import Link from 'next/link';
import { postApiWithFile } from 'services/api';
import { config } from 'services/config';

export default function AddBlogs() {
    const [formData, setFormData] = useState({
        title: '',
        type: "blogs",
        descriptions: '',
        button_label: '',
        button_route: '',
        image: null, // Single image file
    });

    const [formErrors, setFormErrors] = useState({});
    const [uploadStatus, setUploadStatus] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
        setFormErrors({
            ...formErrors,
            [name]: '',
        });
    };

    const handleImageUpload = (e) => {
        setFormData({
            ...formData,
            image: e.target.files[0],
        });
        setFormErrors({
            ...formErrors,
            image: '',
        });
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.title.trim()) errors.title = 'Title is required.';
        if (!formData.descriptions.trim()) errors.descriptions = 'Descriptions are required.';
        if (!formData.button_label.trim()) errors.button_label = 'Button Label is required.';
        if (!formData.button_route.trim()) errors.button_route = 'Button Route is required.';
        if (!formData.image) errors.image = 'Image is required.';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            const endpoint = config.AddLandingPageCaraousalData;

            const data = { ...formData };
            delete data.image;

            const files = {};
            if (formData.image) {
                files.file = formData.image;
            }

            const response = await postApiWithFile(endpoint, data, files);
            if (response.statusCode === 201) {
                setFormData({
                    title: '',
                    descriptions: '',
                    button_label: '',
                    button_route: '',
                    image: null,
                });
                setUploadStatus('Blog added successfully!');
            } else {
                setUploadStatus('Failed to add blog.');
            }
        } catch (error) {
            console.error('Error adding blog:', error);
            setUploadStatus('Error occurred while adding blog.');
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
                                    <h2>Add New Blog</h2>
                                </Col>
                                <Col className="d-flex justify-content-end">
                                    <Link href={'/admin/cms-landingpage/Blog-Management'}>
                                        <Button variant="danger">Back</Button>
                                    </Link>
                                </Col>
                            </Row>
                            <Form onSubmit={handleSubmit}>
                                <Row>
                                    <Col md={12}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Title</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="title"
                                                value={formData.title}
                                                onChange={handleInputChange}
                                            />
                                            {formErrors.title && (
                                                <p className="text-danger">{formErrors.title}</p>
                                            )}
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={12}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Descriptions</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="descriptions"
                                                value={formData.descriptions}
                                                onChange={handleInputChange}
                                            />
                                            {formErrors.descriptions && (
                                                <p className="text-danger">{formErrors.descriptions}</p>
                                            )}
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Button Label</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="button_label"
                                                value={formData.button_label}
                                                onChange={handleInputChange}
                                            />
                                            {formErrors.button_label && (
                                                <p className="text-danger">{formErrors.button_label}</p>
                                            )}
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Button Route</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="button_route"
                                                value={formData.button_route}
                                                onChange={handleInputChange}
                                            />
                                            {formErrors.button_route && (
                                                <p className="text-danger">{formErrors.button_route}</p>
                                            )}
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Form.Group className="mb-3">
                                    <Form.Label>Upload Image</Form.Label>
                                    <Form.Control
                                        type="file"
                                        onChange={handleImageUpload}
                                    />
                                    {formErrors.image && (
                                        <p className="text-danger">{formErrors.image}</p>
                                    )}
                                </Form.Group>
                                <Button type="submit" variant="primary">
                                    Add Blog
                                </Button>
                            </Form>
                            {uploadStatus && <p className="mt-3">{uploadStatus}</p>}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}
