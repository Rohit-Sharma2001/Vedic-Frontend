// app/admin/Master/Brands/EditBrand.js

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Row, Col, Form, Button, Card, Image } from 'react-bootstrap';
import Link from 'next/link';
import { postApiWithFile, postApi, updateApiWithFile } from 'services/api';
import { config } from 'services/config';

export default function EditBrand({ params }) {
    const brandId = params.editid;
    const router = useRouter();
    const imagurl = process.env.NEXT_PUBLIC_API_URL;

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
        imagefrom: '',
        iconfrom: '',
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBrandData = async () => {
            try {
                const endpoint = config.Viewcategory;
                const data = { id: brandId };
                const response = await postApi(endpoint, data);
                if (response.statusCode === 201) {
                    const data = response.data;
                    setFormData({
                        name: data.name,
                        description: data.description || '',
                        dropdown_type: data.dropdown_type,
                        brandLogo: null,
                        brandImage: null,
                    });
                    setPreviewImages({
                        brandLogoPreview: data.icon_file,
                        brandImagePreview: data.file,
                        imagefrom: 'api',
                        iconfrom: 'api',
                    });
                }
            } catch (error) {
                console.error('Error fetching brand:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchBrandData();
    }, [brandId]);

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
                    ...(name === 'brandImage' ? { imagefrom: 'pc' } : { iconfrom: 'pc' }),
                }));
            };
            fileReader.readAsDataURL(file);
        }
        setFormData((prev) => ({
            ...prev,
            [name]: file,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // ✅ Basic validation
   if (!formData.name.trim()) {
     alert("Brand Name is required.");
     return;
   }
   if (!formData.description.trim()) {
     alert("Brand Description is required.");
     return;
   }
        try {
            const endpoint = config.Updatecategory;
            const files = {
                file: formData.brandLogo,
                icon_file: formData.brandImage,
            };
            const data = {
                name: formData.name,
                description: formData.description,
                dropdown_type: formData.dropdown_type,
            };
            const response = await updateApiWithFile(endpoint, brandId, data, files);
            if (response && response.statusCode === 200) {
                router.push('/admin/Master/Brands');
            } else {
                alert('Failed to update brand!');
            }
        } catch (error) {
            alert(error.response.data.message)
            console.error('Error updating brand:', error);
          
        }
    };

    if (loading) return <p>Loading...</p>;

    return (
        <Container fluid>
            <Row>
                <Col>
                    <Card className="p-4 mt-4">
                        <Card.Body>
                            <Row className="mb-3">
                                <Col>
                                    <h2>Edit Brand</h2>
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
                                            <Form.Label>Brand Name <span style={{ color: 'red' }}>*</span></Form.Label>
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
                                            <Form.Label>Brand Description <span style={{ color: 'red' }}>*</span></Form.Label>
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
                                            <Form.Label>Brand Logo</Form.Label>
                                            <Form.Control
                                                type="file"
                                                name="brandLogo"
                                                onChange={handleFileUpload}
                                            />
                                            {previewImages.brandLogoPreview && (
                                                <img
                                                    src={
                                                        previewImages.iconfrom === 'api'
                                                            ? `${imagurl}/${previewImages.brandLogoPreview}`
                                                            : previewImages.brandLogoPreview
                                                    }
                                                    style={{ height: '300px', width: '300px' }}
                                                    alt="Brand Logo Preview"
                                                    fluid
                                                    className="mt-3"
                                                />
                                            )}
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Brand Image</Form.Label>
                                            <Form.Control
                                                type="file"
                                                name="brandImage"
                                                onChange={handleFileUpload}
                                            />
                                            {previewImages.brandImagePreview && (
                                                <img
                                                    src={
                                                        previewImages.imagefrom === 'api'
                                                            ? `${imagurl}/${previewImages.brandImagePreview}`
                                                            : previewImages.brandImagePreview
                                                    }
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
                                    Update Brand
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}
