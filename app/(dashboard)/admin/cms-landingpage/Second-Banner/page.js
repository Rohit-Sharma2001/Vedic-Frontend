'use client';

import { useState, useEffect } from 'react';
import { postApi, updateApiWithFile } from 'services/api';
import { config } from 'services/config';
import { Container, Row, Col, Form, Button, Card, Spinner } from 'react-bootstrap'; // ✅ add Spinner


export default function SecondBannerUpdate() {
    const [isSubmitting, setIsSubmitting] = useState(false); // ✅ new state
    const [errors, setErrors] = useState({});
    const [imagePreview, setImagePreview] = useState(null);
    const [uploadStatus, setUploadStatus] = useState('');
    const [formData, setFormData] = useState({
        bannerImage: null,
        title: '',
        type: "second_banner",
        descriptions: '',
        button_label: '',
        button_route: '',
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        const data = { id: "676cf9be3f55d1765f106e81" };
        try {
            const endpoint = config.GetSecondBannerData;
            const response = await postApi(endpoint, data);
            if (response.statusCode === 201) {
                setFormData({
                    bannerImage: null,
                    title: response.Banner?.title || '',
                    descriptions: response.Banner?.descriptions || '',
                    button_label: response.Banner?.button_label || '',
                    button_route: response.Banner?.button_route || '',
                });
                setImagePreview(response.Banner?.file ? `${process.env.NEXT_PUBLIC_API_URL}/${response.Banner.file}` : null);
            }
        } catch (error) {
            console.error('Error fetching initial data:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
        setErrors({
            ...errors,
            [name]: '',
        });
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        setFormData({
            ...formData,
            bannerImage: file,
        });
        setImagePreview(file ? URL.createObjectURL(file) : null);
        setErrors({
            ...errors,
            bannerImage: '',
        });
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.title.trim()) newErrors.title = 'Title is required.';
        if (!formData.descriptions.trim()) newErrors.descriptions = 'Description is required.';
        if (!formData.button_label.trim()) newErrors.button_label = 'Button label is required.';
        if (!formData.button_route.trim()) newErrors.button_route = 'Button route is required.';
        if (!formData.bannerImage && !imagePreview) newErrors.bannerImage = 'Banner image is required.';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

   const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (isSubmitting) return; // ✅ prevent multiple clicks

    setIsSubmitting(true); // ✅ start loader
    setUploadStatus('');

    try {
        const endpoint = config.UpdateSecondBannerData;
        const files = { file: formData.bannerImage };
        const data = {
            title: formData.title,
            descriptions: formData.descriptions,
            button_label: formData.button_label,
            button_route: formData.button_route,
        };
        const id = '676cf9be3f55d1765f106e81';

        const response = await updateApiWithFile(endpoint, id, data, files);
        setUploadStatus('Banner updated successfully!');
    } catch (error) {
        setUploadStatus('Error updating banner.');
        alert(error.response?.data?.message || 'An error occurred.');
    } finally {
        setIsSubmitting(false); // ✅ stop loader
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
                                    <h2>Update Second Banner</h2>
                                </Col>
                            </Row>
                            <Form onSubmit={handleSubmit}>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label><strong>Title</strong><b style={{ color: 'red' }}>*</b></Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="title"
                                                value={formData.title}
                                                onChange={handleInputChange}
                                                maxLength={25}
                                            />
                                            {errors.title && <p className="text-danger">{errors.title}</p>}
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label><strong>Banner Image</strong><b style={{ color: 'red' }}>*</b> <small>
                          (Preffered Image 736×435px and less than 10MB of  Jpeg,Png type )
                        </small></Form.Label>
                                            <Form.Control
                                                type="file"
                                                name="bannerImage"
                                                onChange={handleImageUpload}
                                            />
                                            {errors.bannerImage && <p className="text-danger">{errors.bannerImage}</p>}
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
                                </Row>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label><strong>Button Label</strong><b style={{ color: 'red' }}>*</b></Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="button_label"
                                                value={formData.button_label}
                                                onChange={handleInputChange}
                                            />
                                            {errors.button_label && <p className="text-danger">{errors.button_label}</p>}
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label><strong>Button Route</strong><b style={{ color: 'red' }}>*</b></Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="button_route"
                                                value={formData.button_route}
                                                onChange={handleInputChange}
                                            />
                                            {errors.button_route && <p className="text-danger">{errors.button_route}</p>}
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={12}>
                                        <Form.Group className="mb-3">
                                            <Form.Label><strong>Description</strong><b style={{ color: 'red' }}>*</b></Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                rows={5}
                                                name="descriptions"
                                                value={formData.descriptions}
                                                onChange={handleInputChange}
                                                maxLength={230}
                                                
                                            />
                                            {errors.descriptions && <p className="text-danger">{errors.descriptions}</p>}
                                        </Form.Group>
                                    </Col>
                                </Row>
                               <Button type="submit" variant="primary" disabled={isSubmitting}>
  {isSubmitting ? (
    <>
      <Spinner animation="border" size="sm" className="me-2" />
      Updating...
    </>
  ) : (
    'Update Banner'
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
