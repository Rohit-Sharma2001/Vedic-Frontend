'use client';

import { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import dynamic from 'next/dynamic';
import { updateApiWithFile, postApi } from 'services/api';
import { config } from 'services/config';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

export default function UpdateBlogDetails() {
    const [formData, setFormData] = useState({
        bannerImage: null,
        heading: '',
        subheading: '',
        description: '',
        postText: '',
        articlesText: ''
    });

    const [imagePreview, setImagePreview] = useState(null);
    const [errors, setErrors] = useState({});
    const [uploadStatus, setUploadStatus] = useState('');

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const data = { id :"67bd8ab5732a78ad0c5e91bb" };
            const endpoint = config.ViewBlogPageContent;
            const response = await postApi(endpoint, data);
            console.log("response content",response.blogContantManagementData)
            if (response.statusCode === 201) {
                setFormData({
                    bannerImage: null,
                    heading: response.blogContantManagementData.heading || '',
                    subheading: response.blogContantManagementData.subheading || '',
                    description: response.blogContantManagementData.description || '',
                    postText: response.blogContantManagementData.post_text || '',
                    articlesText: response.blogContantManagementData.articles_text || ''
                });
                setImagePreview(response.blogContantManagementData.file ? `${process.env.NEXT_PUBLIC_API_URL}/${response.blogContantManagementData.file}` : null);
            }
        } catch (error) {
            console.error('Error fetching initial data:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({
                ...formData,
                bannerImage: file
            });
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleDescriptionChange = (value) => {
        setFormData({
            ...formData,
            description: value
        });
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.heading) newErrors.heading = 'Heading is required.';
        if (!formData.subheading) newErrors.subheading = 'Subheading is required.';
        if (!formData.description) newErrors.description = 'Description is required.';
        if (!formData.postText) newErrors.postText = 'Post text is required.';
        if (!formData.articlesText) newErrors.articlesText = 'Articles text is required.';
        if (!formData.bannerImage && !imagePreview) newErrors.bannerImage = 'Banner image is required.';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            const endpoint = config.UpdateBlogPageContent;

            const files = {
                file: formData.bannerImage
            };

            const data = {
                heading: formData.heading,
                subheading: formData.subheading,
                description: formData.description,
                post_text: formData.postText,
                articles_text: formData.articlesText
            };

            const id = '67bd8ab5732a78ad0c5e91bb';

            const response = await updateApiWithFile(endpoint, id, data, files);
            setUploadStatus('Blog details updated successfully!');
            if (response.statusCode === 200) {
                fetchInitialData()
            }
            console.log('Response:', response);
        } catch (error) {
            setUploadStatus('Error updating blog details.');
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
                            <h2>Update Blog Page Details</h2>
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
                                                required
                                            />
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
                                                required
                                            />
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
                                            <Form.Label>Description</Form.Label>
                                            <ReactQuill
                                                value={formData.description}
                                                onChange={handleDescriptionChange}
                                                theme="snow"
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Post Text</Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                rows={3}
                                                name="postText"
                                                value={formData.postText}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Articles Text</Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                rows={3}
                                                name="articlesText"
                                                value={formData.articlesText}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Button type="submit" className="mt-3" variant="primary">
                                    Update Blog Page 
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