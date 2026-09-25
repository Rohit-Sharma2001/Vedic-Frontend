'use client';

import { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import dynamic from 'next/dynamic';
import { updateApiWithFile, postApi } from 'services/api';
import { config } from 'services/config';
import { useCallback } from 'react';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

export default function UpdateArticleDetails() {
    const [formData, setFormData] = useState({
        heading: '',
        sub_heading: '',
        article_text: '',
        article_description: '',
        book_text: '',
        book_description: ''
    });

   
    const [errors, setErrors] = useState({});
    const [uploadStatus, setUploadStatus] = useState('');

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const data = { id: "682afe850640a2bf4cf74479" };
            const endpoint = config.ViewArticlePageContent;
            const response = await postApi(endpoint, data);
            console.log(response)
            if (response.statusCode === 201) {
                setFormData({
                   
                    heading: response.result.heading || '',
                    sub_heading: response.result.sub_heading || '',
                    article_text: response.result.article_text || '',
                    article_description: response.result.article_description || '',
                    book_text: response.result.book_text || '',
                    book_description: response.result.book_description || ''
                });
              
            }
        } catch (error) {
            console.error('Error fetching initial data:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

 

   const handleQuillChange = useCallback((field) => {
    return (value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };
}, []);


    const validateForm = () => {
        const newErrors = {};
        if (!formData.heading) newErrors.heading = 'Heading is required.';
        if (!formData.sub_heading) newErrors.sub_heading = 'Subheading is required.';
        if (!formData.article_text) newErrors.article_text = 'Article text is required.';
        if (!formData.article_description) newErrors.article_description = 'Article description is required.';
        if (!formData.book_text) newErrors.book_text = 'Book text is required.';
        if (!formData.book_description) newErrors.book_description = 'Book description is required.';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            const endpoint = config.UpdateArticlePageContent;
            const id = '682afe850640a2bf4cf74479';
            // const files = { file: formData.bannerImage };
            const data = {
                heading: formData.heading,
                sub_heading: formData.sub_heading,
                article_text: formData.article_text,
                article_description: formData.article_description,
                book_text: formData.book_text,
                book_description: formData.book_description
            };
const files={}
            const response = await updateApiWithFile(endpoint, id, data, files);
            setUploadStatus('Article details updated successfully!');
            if (response.statusCode === 200) fetchInitialData();
        } catch (error) {
            setUploadStatus('Error updating article details.');
            console.error('Error:', error);
            alert(error.response?.data?.message || 'Unknown error');
        }
    };

    return (
        <Container fluid>
            <Row>
                <Col>
                    <Card className="p-4 mt-4">
                        <Card.Body>
                            <h2>Update Page Details</h2>
                            <Form onSubmit={handleSubmit}>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Heading</Form.Label>
                                            <Form.Control type="text" name="heading" value={formData.heading} onChange={handleInputChange} required />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Sub Heading</Form.Label>
                                            <Form.Control type="text" name="sub_heading" value={formData.sub_heading} onChange={handleInputChange} required />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row>
                                  
                                    <Col md={12}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Article Description</Form.Label>
                                            <ReactQuill value={formData.article_description} onChange={handleQuillChange('article_description')} theme="snow" />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Article Text</Form.Label>
                                            <Form.Control as="textarea" rows={3} name="article_text" value={formData.article_text} onChange={handleInputChange} required />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Book Text</Form.Label>
                                            <Form.Control as="textarea" rows={3} name="book_text" value={formData.book_text} onChange={handleInputChange} required />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Book Description</Form.Label>
                                            <ReactQuill value={formData.book_description} onChange={handleQuillChange('book_description')} theme="snow" />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Button type="submit" className="mt-3" variant="primary">
                                    Update Article Page
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