'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Row, Col, Form, Button, Card, Spinner } from 'react-bootstrap';
import Link from 'next/link';
import { postApiWithFile } from 'services/api';
import { config } from 'services/config';

export default function AddResources() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        title: '',
        type: 'main_banner',
        descriptions: '',
        button_label: '',
        button_route: '',
        org_title: '',
        image: null // Single image file
    });

    const [formErrors, setFormErrors] = useState({});
    const [uploadStatus, setUploadStatus] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false); // ✅ Track submission state

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
        if (!formData.button_label.trim()) errors.button_label = 'Button Label is required.';
        if (!formData.button_route.trim()) errors.button_route = 'Button Route is required.';
        if (!formData.org_title.trim()) errors.org_title = 'Organization Title is required.';
        if (!formData.image) errors.image = 'Image is required.';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        if (isSubmitting) return; // ✅ Prevent multiple clicks

        setIsSubmitting(true); // ✅ Start loader + disable button

        try {
            const endpoint = config.AddMainBannerData;
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
                    org_title: '',
                    image: null
                });
                setUploadStatus('Data item added successfully!');
                router.push('/admin/cms-landingpage/Main-Banner');
            } else {
                setUploadStatus('Failed to add data item.');
            }
        } catch (error) {
            console.error('Error adding data item:', error);
            alert(error.response?.data?.message || 'Error occurred while adding data item.');
            setUploadStatus('Error occurred while adding data item.');
        } finally {
            setIsSubmitting(false); // ✅ Re-enable button after response
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
                                    <Link href={'/admin/cms-landingpage/Main-Banner'}>
                                        <Button variant="danger">Back</Button>
                                    </Link>
                                </Col>
                            </Row>
                            <Form onSubmit={handleSubmit}>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Organization Title <span style={{ color: 'red' }}>*</span></Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="org_title"
                                                value={formData.org_title}
                                                onChange={handleInputChange}
                                            />
                                            {formErrors.org_title && (
                                                <p className="text-danger">{formErrors.org_title}</p>
                                            )}
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Title <span style={{ color: 'red' }}>*</span></Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="title"
                                                value={formData.title}
                                                onChange={handleInputChange}
                                                maxLength={25}
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
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Button Label <span style={{ color: 'red' }}>*</span></Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="button_label"
                                                value={formData.button_label}
                                                onChange={handleInputChange}
                                                maxLength={20}
                                            />
                                            {formErrors.button_label && (
                                                <p className="text-danger">{formErrors.button_label}</p>
                                            )}
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Button Route <span style={{ color: 'red' }}>*</span></Form.Label>
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
                                    <Form.Label>
                                        Upload Image <span style={{ color: 'red' }}>*</span>
                                        <small>
                                            (Preferred Image 1920×965px, less than 10MB, JPEG/PNG only)
                                        </small>
                                    </Form.Label>
                                    <Form.Control
                                        type="file"
                                        onChange={handleImageUpload}
                                    />
                                    {formErrors.image && (
                                        <p className="text-danger">{formErrors.image}</p>
                                    )}
                                </Form.Group>

                                {/* ✅ Button with loader and disable state */}
                                <Button type="submit" variant="primary" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <>
                                            <Spinner animation="border" size="sm" className="me-2" />
                                            Submitting...
                                        </>
                                    ) : (
                                        'Add Banner'
                                    )}
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
