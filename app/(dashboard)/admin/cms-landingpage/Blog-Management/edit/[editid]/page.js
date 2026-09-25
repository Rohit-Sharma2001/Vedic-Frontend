'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import Link from 'next/link';
import { postApi, updateApiWithFile } from 'services/api';
import { config } from 'services/config';

export default function EditBlogs({ params }) {
    const router = useRouter();
    const editId = params.editid;

    const [formData, setFormData] = useState({
        id: editId,
        title: '',
        descriptions: '',
        button_label: '',
        button_route: '',
        image: null,
    });

    const [formErrors, setFormErrors] = useState({});
    const [existingImage, setExistingImage] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);

    useEffect(() => {
        if (editId) {
            fetchDataItemDetails();
        }
    }, [editId]);

    const fetchDataItemDetails = async () => {
        try {
            const endpoint = config.ViewLandingPageCaraousalDatabyid;
            const data = { id: editId };
            const response = await postApi(endpoint, data);
            if (response.statusCode === 201) {
                setFormData({
                    ...response.result,
                    image: null,
                });
                setExistingImage(response.result.file);
            }
        } catch (error) {
            console.error('Error fetching blog details:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
        setFormErrors({
            ...formErrors,
            [name]: '',
        });
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData((prevData) => ({
                ...prevData,
                image: file,
            }));
            setPreviewImage(URL.createObjectURL(file));
            setFormErrors({
                ...formErrors,
                image: '',
            });
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.title.trim()) errors.title = 'Title is required.';
        if (!formData.descriptions.trim()) errors.descriptions = 'Descriptions are required.';
        if (!formData.button_label.trim()) errors.button_label = 'Button Label is required.';
        if (!formData.button_route.trim()) errors.button_route = 'Button Route is required.';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            const endpoint = config.UpdateLandingPageCaraousalDatabyid;
            const data = { ...formData };
            delete data.image;

            const files = {
                file: formData.image,
            };

            const response = await updateApiWithFile(endpoint, editId, data, files);
            if (response.statusCode === 200) {
                alert('Blog updated successfully!');
                router.push('/admin/cms-landingpage/Blog-Management');
            } else {
                alert('Failed to update blog.');
            }
        } catch (error) {
            console.error('Error updating blog:', error);
            alert('An error occurred. Please try again.');
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
                                    <h2>Edit Blog</h2>
                                </Col>
                                <Col className="d-flex justify-content-end">
                                    <Link href={'/admin/cms-landingpage/Blog-Management'}>
                                        <Button variant="danger">Back</Button>
                                    </Link>
                                </Col>
                            </Row>
                            <Form onSubmit={handleSubmit}>
                                <Row>
                                    <Col md={6}>
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
                                    <Col md={6}>
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
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Upload Image</Form.Label>
                                            <Form.Control
                                                type="file"
                                                onChange={handleImageUpload}
                                            />
                                            {formErrors.image && (
                                                <p className="text-danger">{formErrors.image}</p>
                                            )}
                                            <div className="mt-3">
                                                {previewImage ? (
                                                    <>
                                                        <p>New Image Preview:</p>
                                                        <img
                                                            src={previewImage}
                                                            alt="New Data Item"
                                                            style={{
                                                                maxWidth: '100%',
                                                                maxHeight: '200px',
                                                                objectFit: 'cover',
                                                            }}
                                                        />
                                                    </>
                                                ) : existingImage ? (
                                                    <>
                                                        <p>Existing Image:</p>
                                                        <img
                                                            src={`${process.env.NEXT_PUBLIC_API_URL}/${existingImage}`}
                                                            alt="Data Item"
                                                            style={{
                                                                maxWidth: '100%',
                                                                maxHeight: '200px',
                                                                objectFit: 'cover',
                                                            }}
                                                        />
                                                    </>
                                                ) : (
                                                    <p>No image available</p>
                                                )}
                                            </div>
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Button type="submit" variant="primary">
                                    Update Blog
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}
