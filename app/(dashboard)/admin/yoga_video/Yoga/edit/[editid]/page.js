'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Row, Col, Form, Button, Card, Image } from 'react-bootstrap';
import Link from 'next/link';
import { postApi, updateApiWithFile } from 'services/api';
import { config } from 'services/config';
import dynamic from 'next/dynamic';


// Import ReactQuill dynamically for SSR compatibility
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

const libraries = ['places'];

export default function EditCategory({ params }) {
    const router = useRouter();
    const editid = params.editid;

    const [formData, setFormData] = useState({
        name: '',
        date: '',
        description: '',
    });


    const [formErrors, setFormErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        if (editid) {
            fetchCategoryDetails();
            // fetchMemberships();
        }
    }, [editid]);

    const fetchCategoryDetails = async () => {
        try {
            const endpoint = config.Viewcategory;
            const data = { id: editid };
            const response = await postApi(endpoint, data);
            console.log(response);
            if (response.statusCode === 201 || response.statusCode === 200) {
                const yogaData = response.data;
                setFormData({
                    ...yogaData,
                    file: null,
                    icon_file: null,
                    coverImage: null,
                });
                setExistingImages({
                    file: yogaData.file,
                    icon_file: yogaData.icon_file,
                    coverImage: yogaData.coverImage,
                });


            }
        } catch (error) {
            console.error('Error fetching categoty details:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;

        // 🧠 Reset meeting link when switching away from Online format
        if (name === "format" && value !== "Online") {
            setFormData(prev => ({ ...prev, format: value, meeting_link: "" }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === "checkbox" ? checked : value,
            }));
        }
    };

   
   
    const validateForm = () => {
        const errors = {};

        if (!formData.name.trim()) errors.name = 'Yoga Playlist name is required.';
        if (!formData.description.trim()) errors.description = 'Description is required.';

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        console.log("kkkkkk")
        e.preventDefault();
        if (!validateForm()) return;
        if (isSubmitting) return;

        setIsSubmitting(true);
        setSuccessMessage('');

        try {
            let data = { ...formData };

            const endpoint = config.Updatecategory;
            const response = await updateApiWithFile(endpoint, editid, data);

            if (response.statusCode === 200) {
                setSuccessMessage('Yoga Playlist updated successfully! ✅');
                setTimeout(() => {
                    router.push('/admin/yoga_video/Yoga');
                }, 1500);
            } else {
                alert('Failed to update Yoga Playlist.');
            }
        } catch (error) {
            console.error('Error updating Yoga Playlist:', error);
            alert(error.response?.data?.message || 'An error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Container fluid>
            <Row>
                <Col>
                    <Card className="p-4 mt-4">
                        <Card.Body>
                            <Row className="mb-3">
                                <Col><h2>Edit Yoga Playlist</h2></Col>
                                <Col className="d-flex justify-content-end">
                                    <Link href="/admin/yoga_video/Yoga">
                                        <Button variant="danger">Back</Button>
                                    </Link>
                                </Col>
                            </Row>

                            {successMessage && (
                                <div className="alert alert-success" role="alert">
                                    {successMessage}
                                </div>
                            )}

                            <Form onSubmit={handleSubmit}>
                                
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Yoga Name *</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                isInvalid={!!formErrors.name}
                                                required
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {formErrors.name}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Description *</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="description"
                                                value={formData.description}
                                                onChange={handleInputChange}
                                                isInvalid={!!formErrors.description}
                                                required
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {formErrors.description}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                </Row>



                                <Button type="submit" variant="primary" disabled={isSubmitting}>
                                    {isSubmitting ? 'Updating...' : 'Update Playlist'}
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

