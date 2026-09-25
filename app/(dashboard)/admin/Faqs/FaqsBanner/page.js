'use client';
import { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import dynamic from 'next/dynamic';
import { updateApiWithFile, postApi } from 'services/api';
import { config } from 'services/config';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

export default function AddFAQBanner() {
    const [formData, setFormData] = useState({
        heading: '',
        subheading: '',
        buttonsLabel: '',
        buttonRoute: '',
        bannerImage: null,
    });


    const [imagePreview, setImagePreview] = useState(null);
    const [errors, setErrors] = useState({});
    const [uploadStatus, setUploadStatus] = useState('');


    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const data = { id :"67bede8693dc50687749a3df" };
            const endpoint = config.GetFaqContent;
            const response = await postApi(endpoint, data);
            console.log(response)
            if (response.statusCode === 201) {
                setFormData({
                    bannerImage: null, // File cannot be directly pre-populated
                    heading: response.faqManagementData.heading || '',
                    subheading: response.faqManagementData.subheading || '',
                    buttonsLabel: response.faqManagementData.buttonsLabel || '',
                    buttonRoute: response.faqManagementData.buttonRoute || '',
                    
                });
                setImagePreview(response.faqManagementData.file ? `${process.env.NEXT_PUBLIC_API_URL}/${response.faqManagementData.file}` : null);
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
        if (file) {
            setFormData({
                ...formData,
                bannerImage: file,
            });
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.heading) newErrors.heading = 'Heading is required.';
        if (!formData.subheading) newErrors.subheading = 'Subheading is required.';
        if (!formData.buttonsLabel) newErrors.buttonsLabel = 'Button label is required.';
        if (!formData.buttonRoute) newErrors.buttonRoute = 'Button route is required.';
        if (!formData.bannerImage && !imagePreview) newErrors.bannerImage = 'Banner image is required.';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            const endpoint = config.UpdatebFaqContent;
            const files = {
                file: formData.bannerImage,
            };
            const data = {
                heading: formData.heading,
                subheading: formData.subheading,
                buttonsLabel: formData.buttonsLabel,
                buttonRoute: formData.buttonRoute,
            };
            const id = '67bede8693dc50687749a3df';

            const response = await updateApiWithFile(endpoint, id, data, files);
            if(response.statusCode==200){
            setUploadStatus('FAQ banner updated successfully!');
            fetchInitialData()
            console.log('Response:', response);
        }
        } catch (error) {
            setUploadStatus('Error updating FAQ banner.');
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
                            <h2>Update FAQ Banner</h2>
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
                                            />
                                            {errors.heading && <p className="text-danger">{errors.heading}</p>}
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Subheading</Form.Label>
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
                                            <Form.Label>Button Label</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="buttonsLabel"
                                                value={formData.buttonsLabel}
                                                onChange={handleInputChange}
                                            />
                                            {errors.buttonsLabel && <p className="text-danger">{errors.buttonsLabel}</p>}
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Button Route</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="buttonRoute"
                                                value={formData.buttonRoute}
                                                onChange={handleInputChange}
                                            />
                                            {errors.buttonRoute && <p className="text-danger">{errors.buttonRoute}</p>}
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Banner Image</Form.Label>
                                            <Form.Control
                                                type="file"
                                                name="bannerImage"
                                                onChange={handleImageUpload}
                                            />
                                            {errors.bannerImage && <p className="text-danger">{errors.bannerImage}</p>}
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Preview Banner Image</Form.Label>
                                            {imagePreview && (
                                                <div className="mt-2">
                                                    <img
                                                        src={imagePreview}
                                                        alt="Selected Banner"
                                                        style={{ width: '100%', maxHeight: '150px', objectFit: 'contain' }}
                                                    />
                                                </div>
                                            )}
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Button type="submit" className="mt-3" variant="primary">
                                    Update Banner
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