'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import Link from 'next/link';
import { postApiWithFile } from 'services/api';
import { config } from 'services/config';

export default function AddCategory() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        dropdown_type: 'category',
        categoryImage: null,
        categoryIcon: null,
        order: '',
    });

    const [previewImages, setPreviewImages] = useState({
        categoryImagePreview: null,
        categoryIconPreview: null,
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleFileUpload = (e) => {
        const { name, files } = e.target;
        const file = files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setPreviewImages((prev) => ({
                    ...prev,
                    [`${name}Preview`]: reader.result,
                }));
            };
            reader.readAsDataURL(file);
        }
        setFormData((prev) => ({
            ...prev,
            [name]: file,
        }));
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            dropdown_type: 'category',
            categoryImage: null,
            categoryIcon: null,
            order: '',
        });
        setPreviewImages({
            categoryImagePreview: null,
            categoryIconPreview: null,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

     if (!formData.name.trim() || !formData.description.trim() || !formData.order) {
    alert('Name, description, and order are required.');
    return;
}


        try {
            const endpoint = config.Addcategory;
            const files = {
                file: formData.categoryImage,
                icon_file: formData.categoryIcon,
            };

            const data = {
                name: formData.name,
                description: formData.description,
                dropdown_type: formData.dropdown_type,
                order: formData.order,
            };

            const response = await postApiWithFile(endpoint, data, files);
            if (response && response.statusCode === 201) {
                resetForm();
                router.push('/admin/Master/category');
            } else {
                alert('Failed to add category!');
                
            }
        } catch (error) {
            console.error('Error adding category:', error);
            alert(error.response.data.message)
        }
    };

    return (
        <Container fluid>
            <Row>
                <Col>
                    <Card className="p-4 mt-4">
                        <Card.Body>
                            <Row className="mb-3">
                                <Col><h2>Add New Category</h2></Col>
                                <Col className="d-flex justify-content-end">
                                    <Link href={'/admin/Master/category'}>
                                        <Button variant="danger">Back</Button>
                                    </Link>
                                </Col>
                            </Row>
                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Category Name <span style={{ color: 'red' }}>*</span></Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Category Description <span style={{ color: 'red' }}>*</span></Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={4}
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Order <span style={{ color: 'red' }}>*</span></Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="order"
                                        value={formData.order}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </Form.Group>

                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Category Image  <small>
                          (Preffered Image 1920×600px and less than 10MB  of  Jpeg,Png type )
                        </small></Form.Label>
                                            <Form.Control
                                                type="file"
                                                name="categoryImage"
                                                onChange={handleFileUpload}
                                               
                                            />
                                            {previewImages.categoryImagePreview && (
                                                <img
                                                    src={previewImages.categoryImagePreview}
                                                    alt="Category Image Preview"
                                                    style={{ height: '300px', width: '300px' }}
                                                    className="mt-3"
                                                />
                                            )}
                                        </Form.Group>
                                    </Col>

                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Category Icon <small>
                          (Preffered Image 1920×600px and less than 10MB  of  Jpeg,Png type )
                        </small></Form.Label>
                                            <Form.Control
                                                type="file"
                                                name="categoryIcon"
                                                onChange={handleFileUpload}
                                               
                                            />
                                            {previewImages.categoryIconPreview && (
                                                <img
                                                    src={previewImages.categoryIconPreview}
                                                    alt="Category Icon Preview"
                                                    style={{ height: '300px', width: '300px' }}
                                                    className="mt-3"
                                                />
                                            )}
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Button type="submit" variant="primary">Add Category</Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}
