'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import Link from 'next/link';
import { postApi, updateApiWithFile } from 'services/api';
import { config } from 'services/config';
import dynamic from 'next/dynamic';

// Import ReactQuill dynamically for SSR compatibility
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css'; // Import styles

export default function EditBlog({ params }) {
    const router = useRouter();
    const editid = params.editid;

    const [formData, setFormData] = useState({
        id: editid,
        title: '',
        description: '',
        type: 'post',
        images: []
    });

    const [existingImage, setExistingImage] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
const [formErrors, setFormErrors] = useState({});
const [isSubmitting, setIsSubmitting] = useState(false);
const [successMessage, setSuccessMessage] = useState('');
    useEffect(() => {
        if (editid) {
            fetchBlogDetails();
        }
    }, [editid]);

    const fetchBlogDetails = async () => {
        try {
            const endpoint = config.Viewblog;
            const data = { id: editid };
            const response = await postApi(endpoint, data);
            if (response.statusCode === 201) {
                console.log(response);
                setFormData({
                    ...response.blogManagementData,
                    images: []
                });
                setExistingImage(response.blogManagementData.file);
            }
        } catch (error) {
            console.error('Error fetching blog details:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleDescriptionChange = (value) => {
        setFormData((prevData) => ({
            ...prevData,
            description: value
        }));
    };

   const handleImageUpload = (e) => {
     const file = e.target.files[0];
     if (file) {
         // ✅ File size check (10MB max)
         if (file.size > 10 * 1024 * 1024) {
             setFormErrors((prev) => ({ ...prev, images: 'Image must be less than 10MB.' }));
             return;
         }

         // ✅ File type check
         const allowedTypes = ['image/jpeg', 'image/png'];
         if (!allowedTypes.includes(file.type)) {
             setFormErrors((prev) => ({ ...prev, images: 'Only JPEG and PNG formats are allowed.' }));
             return;
         }

         // ✅ Save file if valid
         setFormData((prevData) => ({
             ...prevData,
             images: [file],
         }));
         setPreviewImage(URL.createObjectURL(file));
         setFormErrors((prev) => ({ ...prev, images: '' }));
     }
 };
const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = 'Title is required.';
    if (!formData.description || formData.description.trim() === '' || formData.description === '<p><br></p>') {
        errors.description = 'Description is required.';
    }
    if (!formData.type) errors.type = 'Type is required.';
    if (!formData.images.length && !existingImage) {
        errors.images = 'At least one image is required.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
};

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
    if (isSubmitting) return;

    setIsSubmitting(true);
    setSuccessMessage('');

    try {
            const endpoint = config.Updateblog;
            const data = { ...formData };
            delete data.images;

            const files = {
                file: formData.images[0]
            };

            console.log(data);
            const response = await updateApiWithFile(endpoint, editid, data, files);
            if (response.statusCode === 200) {
               
                setSuccessMessage('Blog updated successfully! ✅');
            setTimeout(() => {
                router.push('/admin/Blog-Management/Blogs');
            }, 1500);
            } else {
                alert('Failed to update blog.');
            }
        } catch (error) {
            console.error('Error updating blog:', error);
            alert(error.response.data.message)
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
                                    <h2>Edit Blog</h2>
                                </Col>
                                <Col className="d-flex justify-content-end">
                                    <Link href={'/admin/Blog-Management/Blogs'}>
                                        <Button variant="danger">Back</Button>
                                    </Link>
                                </Col>
                            </Row>
                            <Form onSubmit={handleSubmit}>
                                <Row>
                                    <Col md={12}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Title <span style={{ color: 'red' }}>*</span></Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="title"
                                                value={formData.title}
                                                onChange={handleInputChange}
                                                required
                                            />
                                            {formErrors.title && <p className="text-danger">{formErrors.title}</p>}
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={12}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Description <span style={{ color: 'red' }}>*</span></Form.Label>
                                            <ReactQuill
                                                value={formData.description}
                                                onChange={handleDescriptionChange}
                                            />
                                            {formErrors.description && <p className="text-danger">{formErrors.description}</p>}
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={12}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Type <span style={{ color: 'red' }}>*</span></Form.Label>
                                            <Form.Select
                                                name="type"
                                                value={formData.type}
                                                onChange={handleInputChange}
                                                required
                                            >
                                                <option value="post">Post</option>
                                                <option value="article">Article</option>
                                            </Form.Select>
                                            {formErrors.type && <p className="text-danger">{formErrors.type}</p>}
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={12}>
                                        <Form.Group className="mb-3">
                                           <Form.Label>
        Upload Image <span style={{ color: 'red' }}>*</span>
        <small className="text-muted d-block">
          (Preffered Image 410×220px and less than 10MB of  Jpeg,Png type )
        </small>
    </Form.Label>
                                            <Form.Control
                                                type="file"
                                                onChange={handleImageUpload}
                                            />
                                            {formErrors.images && <p className="text-danger">{formErrors.images}</p>}
                                            <div className="mt-3">
                                                {previewImage ? (
                                                    <img
                                                        src={previewImage}
                                                        alt="New Blog"
                                                        style={{
                                                            maxWidth: '100%',
                                                            maxHeight: '200px',
                                                            objectFit: 'cover'
                                                        }}
                                                    />
                                                ) : existingImage ? (
                                                    <img
                                                        src={`${process.env.NEXT_PUBLIC_API_URL}/${existingImage}`}
                                                        alt="Blog"
                                                        style={{
                                                            maxWidth: '100%',
                                                            maxHeight: '200px',
                                                            objectFit: 'cover'
                                                        }}
                                                    />
                                                ) : (
                                                    <p>No image available</p>
                                                )}
                                            </div>
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Button type="submit" variant="primary" disabled={isSubmitting}>
    {isSubmitting ? (
        <>
            <span className="spinner-border spinner-border-sm me-2"></span>
            Updating...
        </>
    ) : (
        'Update Blog'
    )}
</Button>

{successMessage && <p className="text-success mt-3">{successMessage}</p>}

                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}
