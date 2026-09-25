'use client';
import { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import Link from 'next/link';
import { updateApiWithFile ,postApi} from 'services/api';
import { config } from 'services/config';
import dynamic from 'next/dynamic';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

export default function Aboutayurveda() {
    const [formData, setFormData] = useState({
        bannerImage: null,
        bannerheading: '',
        description: '',
        content_heading: '',
        cardTexts: [], // State to manage dynamic card texts
    });

  

    const [errors, setErrors] = useState({});
    const [uploadStatus, setUploadStatus] = useState('');
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const endpoint = config.AboutAyurveda;
            const response = await postApi(endpoint, {});
            console.log(response)
            if (response.statusCode === 201) {
                setFormData({
                    bannerImage: null, // File cannot be directly pre-populated
                    bannerheading: response.coupon.bannerheading || '',
                    description: response.coupon.description || '',
                    content_heading: response.coupon.content_heading || '',
                    cardTexts: response.coupon.cardTexts || [],
                   
                });
                setImagePreview(response.coupon.file ? `${process.env.NEXT_PUBLIC_API_URL}/${response.coupon.file}` : null);
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
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        setFormData({
            ...formData,
            bannerImage: file,
        });
        if (file) {
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleDescriptionChange = (value) => {
        setFormData({
            ...formData,
            description: value,
        });
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.bannerheading) newErrors.bannerheading = 'Banner heading is required.';
        if (!formData.description) newErrors.description = 'Description is required.';
        if (!formData.content_heading) newErrors.content_heading = 'Content heading is required.';
        if (!formData.bannerImage && !imagePreview) newErrors.bannerImage = 'Banner Image is required.';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleAddCardText = () => {
        setFormData({
            ...formData,
            cardTexts: [...formData.cardTexts, { text: '' }],
        });
    };

    const handleDeleteCardText = (index) => {
        const updatedCardTexts = formData.cardTexts.filter((_, i) => i !== index);
        setFormData({
            ...formData,
            cardTexts: updatedCardTexts,
        });
    };

    const handleCardTextChange = (index, value) => {
        const updatedCardTexts = [...formData.cardTexts];
        updatedCardTexts[index].text = value;
        setFormData({
            ...formData,
            cardTexts: updatedCardTexts,
        });
    };

  
    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(formData)
        if (!validateForm()) return;

        try {
            const endpoint = config.Updateaboutamita;
          
            const files = {
                file: formData.bannerImage,
                
            };
            const data = {
                bannerheading: formData.bannerheading,
                description: formData.description,
                content_heading: formData.content_heading,
                cardTexts: formData.cardTexts,
                
            };
            const id = '67495c60325ea5c184752947';

            const response = await updateApiWithFile(endpoint, id,data,files);
            setUploadStatus('Page updated successfully!');
            console.log('Response:', response);
        } catch (error) {
            setUploadStatus('Error updating page.');
            console.error('Error:', error);
        }
    };


    return (
        <Container fluid>
            <Row>
                <Col>
                    <Card className="p-4 mt-4">
                        <Card.Body>
                            <Row>
                                <Col>
                                    <h2>Update Ayurveda Page</h2>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                    <Form onSubmit={handleSubmit}>
                        <Card className="p-4 mt-4">
                            <Card.Body>
                                <Row className="mb-3">
                                    <Col>
                                        <h4>Banner Details</h4>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label><strong>Banner Heading</strong> <b style={{ color: 'red' }}>*</b></Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="bannerheading"
                                                value={formData.bannerheading}
                                                onChange={handleInputChange}
                                            />
                                            {errors.bannerheading && <p className="text-danger">{errors.bannerheading}</p>}
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label><strong>Banner Image</strong> <b style={{ color: 'red' }}>*</b></Form.Label>
                                            <Form.Control
                                                type="file"
                                                name="bannerImage"
                                                onChange={handleImageUpload}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label><strong>Existing Banner Image</strong></Form.Label>
                                            {errors.bannerImage && <p className="text-danger">{errors.bannerImage}</p>}
                                            {imagePreview && (
                                                <div className="mt-2">
                                                    <img
                                                        src={imagePreview}
                                                        alt="Selected Banner"
                                                        style={{ width: '60%', maxHeight: '150px' }}
                                                    />
                                                </div>
                                            )}
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>

                        <Card className="p-4 mt-4">
                            <Card.Body>
                                <Row className="mb-3">
                                    <Col>
                                        <h4>Card Details</h4>
                                    </Col>
                                </Row>
                                <Row className="mb-3">
                                    <Col md={12}>
                                        <Form.Label><strong>Card Texts</strong></Form.Label>
                                        {formData.cardTexts.map((card, index) => (
                                            <Row key={index} className="mb-3">
                                                <Col md={10}>
                                                    <Form.Control
                                                        type="text"
                                                        value={card.text}
                                                        onChange={(e) => handleCardTextChange(index, e.target.value)}
                                                        placeholder={`Card Text ${index + 1}`}
                                                    />
                                                </Col>
                                                <Col md={2}>
                                                    <Button variant="danger" onClick={() => handleDeleteCardText(index)}>
                                                        Delete
                                                    </Button>
                                                </Col>
                                            </Row>
                                        ))}
                                        <Button variant="success" onClick={handleAddCardText}>
                                            Add Card Text
                                        </Button>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>

                        <Card className="p-4 mt-4">
                            <Card.Body>
                                <Row className="mb-3">
                                    <Col>
                                        <h4>Content Details</h4>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label><strong>Content Heading</strong> <b style={{ color: 'red' }}>*</b></Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="content_heading"
                                                value={formData.content_heading}
                                                onChange={handleInputChange}
                                            />
                                            {errors.content_heading && <p className="text-danger">{errors.content_heading}</p>}
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label><strong>Content Description</strong> <b style={{ color: 'red' }}>*</b></Form.Label>
                                            <div>
                                                <ReactQuill
                                                    value={formData.description}
                                                    onChange={handleDescriptionChange}
                                                    theme="snow"
                                                    style={{
                                                        height: '150px',
                                                        maxHeight: '150px',
                                                    }}
                                                    modules={{
                                                        toolbar: [
                                                            [{ header: [1, 2, false] }],
                                                            ['bold', 'italic', 'underline'],
                                                            [{ list: 'ordered' }, { list: 'bullet' }],
                                                            ['link'],
                                                        ],
                                                    }}
                                                />
                                            </div>
                                            {errors.description && <p className="text-danger">{errors.description}</p>}
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Button type="submit" style={{ marginTop: '70px' }} variant="primary">
                                    Update Page
                                </Button>
                            </Card.Body>
                        </Card>
                    </Form>
                </Col>
            </Row>
        </Container>
    );
}
