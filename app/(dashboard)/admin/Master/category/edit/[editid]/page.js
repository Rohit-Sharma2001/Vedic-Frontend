// app/admin/Master/category/EditCategory.js

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Row, Col, Form, Button, Card, Image } from 'react-bootstrap';
import Link from 'next/link';
import { postApi, updateApiWithFile } from 'services/api';
import { config } from 'services/config';

export default function EditCategory({ params }) {
    const categoryId = params.editid;
    const router = useRouter();
    const imagurl = process.env.NEXT_PUBLIC_API_URL;

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        dropdown_type: 'category',
        categoryImage: null,
        categoryIcon: null,
        order: '', // ✅ Added order field
    });

    const [previewImages, setPreviewImages] = useState({
        categoryImagePreview: null,
        categoryIconPreview: null,
        imagefrom: '',
        iconfrom: '',
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategoryData = async () => {
            try {
                const endpoint = config.Viewcategory;
                const data = { id: categoryId };
                const response = await postApi(endpoint, data);

                if (response.statusCode === 201) {
                    const data = response.data;
                    setFormData({
                        name: data.name,
                        description: data.description || '',
                        dropdown_type: data.dropdown_type,
                        categoryImage: null,
                        categoryIcon: null,
                        order: data.order || '', // ✅ Populate order from API
                    });

                    setPreviewImages({
                        categoryImagePreview: data.file,
                        categoryIconPreview: data.icon_file,
                        imagefrom: 'api',
                        iconfrom: 'api',
                    });
                }
            } catch (error) {
                console.error('Error fetching category:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCategoryData();
    }, [categoryId]);

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
        // ⚠️ Validate file size (10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            alert("File size must be less than 10MB.");
            e.target.value = ""; // Clear input
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            setPreviewImages((prev) => ({
                ...prev,
                [`${name}Preview`]: reader.result,
                ...(name === "categoryImage" ? { imagefrom: "pc" } : { iconfrom: "pc" }),
            }));
        };
        reader.readAsDataURL(file);

        setFormData((prev) => ({
            ...prev,
            [name]: file,
        }));
    }
};


    const handleSubmit = async (e) => {
        e.preventDefault();
        // ✅ Basic validation
   if (!formData.name.trim()) {
     alert("Category Name is required.");
     return;
   }
   if (!formData.description.trim()) {
     alert("Category Description is required.");
     return;
   }
   if (!formData.order) {
     alert("Order number is required.");
     return;
   }
 
        try {
            const endpoint = config.Updatecategory;
            const files = {
                file: formData.categoryImage,
                icon_file: formData.categoryIcon,
            };

            const data = {
                name: formData.name,
                description: formData.description,
                dropdown_type: formData.dropdown_type,
                order: formData.order, // ✅ Send order
            };

            const response = await updateApiWithFile(endpoint, categoryId, data, files);

            if (response && response.statusCode === 200) {
                alert('Category updated successfully!');
                router.push('/admin/Master/category');
            } else {
                alert('Failed to update category!');
            }
        } catch (error) {
            console.error('Error updating category:', error);
            alert(error.response.data.message)
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
                                <Col><h2>Edit Category</h2></Col>
                                <Col className="d-flex justify-content-end">
                                    <Link href={'/admin/Master/category'}>
                                        <Button variant="danger">Back</Button>
                                    </Link>
                                </Col>
                            </Row>
                            <Form onSubmit={handleSubmit}>
                                <Row>
                                    <Col md={12}>
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
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md={12}>
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
                                    </Col>
                                </Row>

                                {/* ✅ Order Number Field */}
                                <Row>
                                    <Col md={12}>
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
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Category Image <small>
                          (Preffered Image 1920×600px and less than 10MB  of  Jpeg,Png type )
                        </small></Form.Label>
                                            <Form.Control
                                                type="file"
                                                name="categoryImage"
                                                onChange={handleFileUpload}
                                            />
                                            {previewImages.categoryImagePreview && (
                                                <img
                                                    src={previewImages.imagefrom === 'api' ? `${imagurl}/${previewImages.categoryImagePreview}` : previewImages.categoryImagePreview}
                                                    style={{ height: '300px', width: '300px' }}
                                                    alt="Category Image Preview"
                                                    fluid
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
                                                    src={previewImages.iconfrom === 'api' ? `${imagurl}/${previewImages.categoryIconPreview}` : previewImages.categoryIconPreview}
                                                    alt="Category Icon Preview"
                                                    style={{ height: '300px', width: '300px' }}
                                                    fluid
                                                    className="mt-3"
                                                />
                                            )}
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Button type="submit" variant="primary">Update Category</Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}
