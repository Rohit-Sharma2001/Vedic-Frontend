'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import Link from 'next/link';
import { postApiWithFile } from 'services/api';
import { config } from 'services/config';

export default function AddResources() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        title: '',
        type: 'shop_banner',
        descriptions: '',
        sub_title: '',
        
        image: null // Single image file
    });

    const [formErrors, setFormErrors] = useState({});
    const [uploadStatus, setUploadStatus] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
        setFormErrors({
            ...formErrors,
            [name]: ''
        });
    };

    const handleImageUpload = (e) => {
        setFormData({
            ...formData,
            image: e.target.files[0]
        });
        setFormErrors({
            ...formErrors,
            image: ''
        });
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.title.trim()) errors.title = 'Title is required.';
        if (!formData.descriptions.trim()) errors.descriptions = 'Descriptions are required.';
        if (!formData.sub_title.trim()) errors.sub_title = 'Sub Title  is required.';
        // if (!formData.button_route.trim()) errors.button_route = 'Button Route is required.';
        if (!formData.image) errors.image = 'Image is required.';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            const endpoint = config.AddMainBannerData; // Update with your API endpoint

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
                    sub_title: '',
                    button_route: '',
                    image: null
                });
                setUploadStatus('Data item added successfully!');
                router.push('/admin/shop-landing');
            } else {
                setUploadStatus('Failed to add data item.');
            }
        } catch (error) {
            console.error('Error adding data item:', error);
            alert(error.response.data.message)
            setUploadStatus('Error occurred while adding data item.');
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
                                    <h2>Add New Banner</h2>
                                </Col>
                                <Col className="d-flex justify-content-end">
                                    <Link href={'/admin/shop-landing'}>
                                        <Button variant="danger">Back</Button>
                                    </Link>
                                </Col>
                            </Row>
                            <Form onSubmit={handleSubmit}>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Title <span style={{ color: 'red' }}>*</span></Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="title"
                                                value={formData.title}
                                                onChange={handleInputChange}
                                                maxLength={25} // Enforce the limit on input
                                            />
                                            {formErrors.title && (
                                                <p className="text-danger">{formErrors.title}</p>
                                            )}
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Sub Title <span style={{ color: 'red' }}>*</span></Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="sub_title"
                                                value={formData.sub_title}
                                                onChange={handleInputChange}
                                                maxLength={20}
                                            />
                                            {formErrors.sub_title && (
                                                <p className="text-danger">{formErrors.sub_title}</p>
                                            )}
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={12}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Descriptions <span style={{ color: 'red' }}>*</span></Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="descriptions"
                                                value={formData.descriptions}
                                                onChange={handleInputChange}
                                                maxLength={230}
                                            />
                                            {formErrors.descriptions && (
                                                <p className="text-danger">{formErrors.descriptions}</p>
                                            )}
                                        </Form.Group>
                                    </Col>
                                </Row>
                              
                                <Form.Group className="mb-3">
                                    <Form.Label>Upload Image  <span style={{ color: 'red' }}>*   <small>
                          (Preffered Image 1920×600px and less than 10MB  of  Jpeg,Png type )
                        </small></span>
                                   
                                  </Form.Label>
                                    <Form.Control
                                        type="file"
                                        onChange={handleImageUpload}
                                    />
                                    {formErrors.image && (
                                        <p className="text-danger">{formErrors.image}</p>
                                    )}
                                </Form.Group>
                                <Button type="submit" variant="primary">Add Banner</Button>
                            </Form>
                            {uploadStatus && <p>{uploadStatus}</p>}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}
