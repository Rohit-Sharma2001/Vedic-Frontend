// app/admin/Master/sub-category/EditSubCategory.js

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Row, Col, Form, Button, Card, Image } from 'react-bootstrap';
import Link from 'next/link';
import { postApiWithFile, postApi, updateApiWithFile } from 'services/api';
import { config } from 'services/config';

export default function EditSubCategory({ params }) {
    const subCategoryId = params.editid;
    const router = useRouter();
    const imagurl = process.env.NEXT_PUBLIC_API_URL;

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        dropdown_type: 'sub_category',
        category: '',
        subcategoryImage: null,
        subcategoryIcon: null,
    });

    const [categories, setCategories] = useState([]);
    const [previewImages, setPreviewImages] = useState({
        subcategoryImagePreview: null,
        subcategoryIconPreview: null,
        imagefrom: '',
        iconfrom: '',
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const categoryResponse = await postApi(config.category, { page: 1, pageSize: 1000, dropdown_type: 'category' });
                if (categoryResponse && categoryResponse.result) setCategories(categoryResponse.result);

                if (subCategoryId) {
                    const response = await postApi(config.Viewcategory, { id: subCategoryId });
                    if (response && response.data) {
                        const subCategory = response.data;
                        setFormData({
                            name: subCategory.name || '',
                            description: subCategory.description || '',
                            dropdown_type: 'sub_category',
                            category: subCategory.category_id || '',
                            subcategoryImage: null,
                            subcategoryIcon: null,
                        });

                        setPreviewImages({
                            subcategoryImagePreview: subCategory.file || null,
                            subcategoryIconPreview: subCategory.icon_file || null,
                            imagefrom: 'api',
                            iconfrom: 'api',
                        });
                    }
                }
            } catch (error) {
                console.error('Error fetching initial data:', error);
                alert('An error occurred while fetching data.');
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, [subCategoryId]);

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
                    ...(name === 'subcategoryImage' ? { imagefrom: 'pc' } : { iconfrom: 'pc' }),
                }));
            };
            reader.readAsDataURL(file);
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
     alert("Subcategory Name is required.");
     return;
   }
   if (!formData.description.trim()) {
     alert("Subcategory Description is required.");
     return;
   }
   if (!formData.category) {
     alert("Please select a Category.");
     return;
   }
   
        try {
            const endpoint = config.Updatecategory;
            const files = {
                file: formData.subcategoryImage,
                icon_file: formData.subcategoryIcon,
            };
            const data = {
                name: formData.name,
                description: formData.description,
                dropdown_type: formData.dropdown_type,
                category_id: formData.category,
            };

            const response = await updateApiWithFile(endpoint, subCategoryId, data, files);
            if (response && response.statusCode === 200) {
                alert('Subcategory updated successfully!');
                router.push('/admin/Master/sub-category');
            } else {
                alert('Failed to update subcategory!');
            }
        } catch (error) {
            console.error('Error updating subcategory:', error);
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
                                <Col><h2>Edit Subcategory</h2></Col>
                                <Col className="d-flex justify-content-end">
                                    <Link href={'/admin/Master/sub-category'}>
                                        <Button variant="danger">Back</Button>
                                    </Link>
                                </Col>
                            </Row>

                            <Form onSubmit={handleSubmit}>
                                <Row>
                                    <Col md={12}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Subcategory Name <span style={{ color: 'red' }}>*</span></Form.Label>
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
                                            <Form.Label>Subcategory Description <span style={{ color: 'red' }}>*</span></Form.Label>
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

                                <Row>
                                    <Col md={12}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Select Category <span style={{ color: 'red' }}>*</span></Form.Label>
                                            <Form.Control
                                                as="select"
                                                name="category"
                                                value={formData.category}
                                                onChange={handleInputChange}
                                                required
                                            >
                                                <option value="">-- Select Category --</option>
                                                {categories.map((category) => (
                                                    <option key={category._id} value={category._id}>
                                                        {category.name}
                                                    </option>
                                                ))}
                                            </Form.Control>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                {/* <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Subcategory Image</Form.Label>
                                            <Form.Control
                                                type="file"
                                                name="subcategoryImage"
                                                onChange={handleFileUpload}
                                            />
                                            {previewImages.subcategoryImagePreview && (
                                                <img
                                                    src={
                                                        previewImages.imagefrom === 'api'
                                                            ? `${imagurl}/${previewImages.subcategoryImagePreview}`
                                                            : previewImages.subcategoryImagePreview
                                                    }
                                                    style={{ height: '300px', width: '300px' }}
                                                    alt="Subcategory Image Preview"
                                                    fluid
                                                    className="mt-3"
                                                />
                                            )}
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Subcategory Icon</Form.Label>
                                            <Form.Control
                                                type="file"
                                                name="subcategoryIcon"
                                                onChange={handleFileUpload}
                                            />
                                            {previewImages.subcategoryIconPreview && (
                                                <img
                                                    src={
                                                        previewImages.iconfrom === 'api'
                                                            ? `${imagurl}/${previewImages.subcategoryIconPreview}`
                                                            : previewImages.subcategoryIconPreview
                                                    }
                                                    style={{ height: '300px', width: '300px' }}
                                                    alt="Subcategory Icon Preview"
                                                    fluid
                                                    className="mt-3"
                                                />
                                            )}
                                        </Form.Group>
                                    </Col>
                                </Row> */}

                                <Button type="submit" variant="primary">Update Sub-category</Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}
