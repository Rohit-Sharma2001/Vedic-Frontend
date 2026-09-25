'use client';

import { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import dynamic from 'next/dynamic';
import { updateApiWithFile, postApi } from 'services/api';
import { config } from 'services/config';

// Dynamically import ReactQuill to support SSR
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

export default function ContactManagement() {
    const [formData, setFormData] = useState({
        bannerImage: null,
        heading: '',
        text: '',
        openingClosingDetails: '' // Using ReactQuill for this field
    });

    const [imagePreview, setImagePreview] = useState(null);
    const [errors, setErrors] = useState({});
    const [uploadStatus, setUploadStatus] = useState('');

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const data = { id: "67bdad5cf25817c9eb8d0600" };
            const endpoint = config.ViewContactPageContent;
            const response = await postApi(endpoint, data);

            if (response.statusCode === 201) {
                setFormData({
                    bannerImage: null,
                    heading: response.contactManagementData.heading || '',
                    text: response.contactManagementData.text || '',
                    openingClosingDetails: response.contactManagementData.opening_closing_details || ''
                });
                setImagePreview(response.contactManagementData.file ? `${process.env.NEXT_PUBLIC_API_URL}/${response.contactManagementData.file}` : null);
            }
        } catch (error) {
            console.error('Error fetching initial data:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleQuillChange = (value) => {
        setFormData({
            ...formData,
            openingClosingDetails: value // Store ReactQuill content
        });
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({
                ...formData,
                bannerImage: file
            });
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.heading) newErrors.heading = 'Heading is required.';
        if (!formData.text) newErrors.text = 'Text is required.';
        if (!formData.openingClosingDetails) newErrors.openingClosingDetails = 'Opening/Closing details are required.';
        if (!formData.bannerImage && !imagePreview) newErrors.bannerImage = 'Banner image is required.';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            const endpoint = config.UpdateContactPageContent;

            const files = {
                file: formData.bannerImage
            };

            const data = {
                heading: formData.heading,
                text: formData.text,
                opening_closing_details: formData.openingClosingDetails
            };

            const id = '67bdad5cf25817c9eb8d0600';

            const response = await updateApiWithFile(endpoint, id, data, files);
            if(response.statusCode == 200){
                setUploadStatus('Contact details updated successfully!');
                fetchInitialData()
            console.log('Response:', response);
        }
        } catch (error) {
            setUploadStatus('Error updating contact details.');
            console.error('Error:', error);
            alert(error.response.data.message)
        }
    };

    return (
        <Container fluid>
            <Row>
                <Col>
                    <Card className="p-4 mt-4">
                        <Card.Body>
                            <h2>Contact Management</h2>
                            <Form onSubmit={handleSubmit}>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Heading</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="heading"
                                                value={formData.heading}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Banner Image</Form.Label>
                                            <Form.Control
                                                type="file"
                                                name="bannerImage"
                                                onChange={handleImageUpload}
                                            />
                                            {imagePreview && (
                                                <div className="mt-2">
                                                    <img
                                                        src={imagePreview}
                                                        alt="Banner Preview"
                                                        style={{ width: '100%', maxHeight: '150px', objectFit: 'contain' }}
                                                    />
                                                </div>
                                            )}
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Text</Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                rows={3}
                                                name="text"
                                                value={formData.text}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Opening/Closing Details</Form.Label>
                                            <ReactQuill
                                                value={formData.openingClosingDetails}
                                                onChange={handleQuillChange}
                                                theme="snow"
                                            />
                                            {errors.openingClosingDetails && (
                                                <div className="text-danger">{errors.openingClosingDetails}</div>
                                            )}
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Button type="submit" className="mt-3" variant="primary">
                                    Update Contact Page
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
