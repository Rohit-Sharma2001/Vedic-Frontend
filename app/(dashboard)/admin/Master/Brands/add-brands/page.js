// app/admin/Master/Brands/AddBrand.js

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Row, Col, Form, Button, Card, Image } from 'react-bootstrap';
import Link from 'next/link';
import { postApiWithFile } from 'services/api';
import { config } from 'services/config';

export default function AddBrand() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        dropdown_type: 'brand',
        brandLogo: null,
        brandImage: null,
    });

    const [previewImages, setPreviewImages] = useState({
        brandLogoPreview: null,
        brandImagePreview: null,
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
            const fileReader = new FileReader();
            fileReader.onload = () => {
                setPreviewImages((prev) => ({
                    ...prev,
                    [`${name}Preview`]: fileReader.result,
                }));
            };
            fileReader.readAsDataURL(file);
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
            dropdown_type: 'brand',
            brandLogo: null,
            brandImage: null,
        });
        setPreviewImages({
            brandLogoPreview: null,
            brandImagePreview: null,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
       if (!formData.name.trim() || !formData.description.trim()) {
  alert("Brand name and description are required.");
  return;
}

          
        try {
            const endpoint = config.Addcategory;
            const files = {
                file: formData.brandLogo,
                icon_file: formData.brandImage,
            };
            const data = {
                name: formData.name,
                description: formData.description,
                dropdown_type: formData.dropdown_type,
            };

            const response = await postApiWithFile(endpoint, data, files);
            console.log('Brand added successfully:', response);
            if (response && response.statusCode === 201) {
                resetForm();
                router.push('/admin/Master/Brands');
            } else {
                alert('Failed to add brand!');
            }
        } catch (error) {
            alert(error.response.data.message)
            console.error('Error submitting brand:', error);
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
                                    <h2>Add New Brand</h2>
                                </Col>
                                <Col className="d-flex justify-content-end">
                                    <Link href={'/admin/Master/Brands'}>
                                        <Button variant="danger">Back</Button>
                                    </Link>
                                </Col>
                            </Row>
                            <Form onSubmit={handleSubmit}>
                                <Row>
                                    <Col md={12}>
                                        <Form.Group className="mb-3">
                                        <Form.Label>
  Brand Name <span style={{ color: 'red' }}>*</span>
</Form.Label>
<Form.Control
  type="text"
  name="name"
  value={formData.name}
  onChange={handleInputChange}
  required
/>

                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md={12}>
                                        <Form.Group className="mb-3">
                                        <Form.Label>
  Brand Description <span style={{ color: 'red' }}>*</span>
</Form.Label>
<Form.Control
  as="textarea"
  rows={4}
  name="description"
  value={formData.description}
  onChange={handleInputChange}
  required
/>

                                        </Form.Group>
                                    </Col>
                                </Row>

                                {/* <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                        <Form.Label>
  Brand Logo <span style={{ color: 'red' }}>*</span>
</Form.Label>
<Form.Control
  type="file"
  name="brandLogo"
  onChange={handleFileUpload}
  required
/>

                                            {previewImages.brandLogoPreview && (
                                                <img
                                                    src={previewImages.brandLogoPreview}
                                                    alt="Brand Logo Preview"
                                                    style={{ height: '300px', width: '300px' }}
                                                    fluid
                                                    className="mt-3"
                                                />
                                            )}
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                        <Form.Label>
  Brand Image <span style={{ color: 'red' }}>*</span>
</Form.Label>
<Form.Control
  type="file"
  name="brandImage"
  onChange={handleFileUpload}
  required
/>

                                            {previewImages.brandImagePreview && (
                                                <img
                                                    src={previewImages.brandImagePreview}
                                                    alt="Brand Image Preview"
                                                    style={{ height: '300px', width: '300px' }}
                                                    fluid
                                                    className="mt-3"
                                                />
                                            )}
                                        </Form.Group>
                                    </Col>
                                </Row> */}

                                <Button type="submit" variant="primary">
                                    Add Brand
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}
