'use client';

import { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import { postApi,updateApiWithFile } from 'services/api';
import { config } from 'services/config';
export default function DoshatTest() {
    const [errors, setErrors] = useState({});
    const [imagePreview, setImagePreview] = useState(null);
    const [uploadStatus, setUploadStatus] = useState('');
    const [formData, setFormData] = useState({
        bannerImage: null,
        heading: '',
        subheading: '',
        description: '',
        buttonLabel: '',
        linkToButton: '',
    });



    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const endpoint = config.Doshatest;
            const response = await postApi(endpoint, {});
            console.log(response)
            if (response.statusCode === 201) {
                setFormData({
                    bannerImage: null, // File cannot be directly pre-populated
                    heading: response.coupon.heading || '',
                    subheading: response.coupon.subheading || '',
                    description: response.coupon.description || '',
                    buttonLabel: response.coupon.buttonLabel || '',
                    linkToButton: response.coupon.linkToButton || '',
                });
                setImagePreview(response.coupon.file ? `${process.env.NEXT_PUBLIC_API_URL}/${response.coupon.file}` : null);
            }
        } catch (error) {
            console.error('Error fetching initial data:', error);
        }
    };
   

 

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        setFormData({
            ...formData,
            bannerImage: file,
        });
        if (file) {
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.heading) newErrors.heading = 'Heading is required.';
        if (!formData.subheading) newErrors.subheading = 'Subheading is required.';
        if (!formData.description) newErrors.description = 'Description is required.';
        if (!formData.buttonLabel) newErrors.buttonLabel = 'Button label is required.';
        if (!formData.linkToButton) newErrors.linkToButton = 'Link for the button is required.';
        if (!formData.bannerImage && !imagePreview) newErrors.bannerImage = 'Banner image is required.';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            const endpoint = config.Updateaboutamita;
          
            const files = {
                file: formData.bannerImage,
                
            };
            const data = {
                heading: formData.heading,
                subheading: formData.subheading,
                description: formData.description,
                buttonLabel: formData.buttonLabel,
                linkToButton: formData.linkToButton,
            };
            const id = '67495001f782a33be496bae1';

            const response = await updateApiWithFile(endpoint, id,data,files);
            setUploadStatus('Page updated successfully!');
            console.log('Response:', response);
        } catch (error) {
            setUploadStatus('Error updating page.');
            console.error('Error:', error);
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
                                    <h2>Update Dosha Test Page</h2>
                                </Col>
                            </Row>
                            <Form onSubmit={handleSubmit}>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label> <strong>Heading</strong><b style={{ color: 'red' }}>*</b></Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="heading"
                                                value={formData.heading}
                                                onChange={handleInputChange}
                                            />
                                            {errors.heading && <p className="text-danger">{errors.heading}</p>}
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label><strong>Subheading</strong> <b style={{ color: 'red' }}>*</b></Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="subheading"
                                                value={formData.subheading}
                                                onChange={handleInputChange}
                                            />
                                            {errors.subheading && <p className="text-danger">{errors.subheading}</p>}
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label> <strong>Banner Image</strong><b style={{ color: 'red' }}>*</b></Form.Label>
                                            <Form.Control
                                                type="file"
                                                name="bannerImage"
                                                onChange={handleImageUpload}
                                            />
                                            {errors.bannerImage && <p className="text-danger">{errors.bannerImage}</p>}
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
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label> <strong>Button Label </strong><b style={{ color: 'red' }}>*</b></Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="buttonLabel"
                                                value={formData.buttonLabel}
                                                onChange={handleInputChange}
                                            />
                                            {errors.buttonLabel && <p className="text-danger">{errors.buttonLabel}</p>}
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label> <strong>Link to Button </strong><b style={{ color: 'red' }}>*</b></Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="linkToButton"
                                                value={formData.linkToButton}
                                                onChange={handleInputChange}
                                            />
                                            {errors.linkToButton && <p className="text-danger">{errors.linkToButton}</p>}
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={12}>
                                        <Form.Group className="mb-3">
                                            <Form.Label><strong>Description  </strong><b style={{ color: 'red' }}>*</b></Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                rows={5}
                                                name="description"
                                                value={formData.description}
                                                onChange={handleInputChange}
                                            />
                                            {errors.description && <p className="text-danger">{errors.description}</p>}
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Button type="submit" variant="primary">Update Details</Button>
                            </Form>
                            {uploadStatus && <p className="mt-3">{uploadStatus}</p>}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}
