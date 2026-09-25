'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Row, Col, Form, Button, Card, Spinner } from 'react-bootstrap';
import Link from 'next/link';
import { postApiWithFile } from 'services/api';
import { config } from 'services/config';
import dynamic from 'next/dynamic';

// Dynamically import ReactQuill (for SSR compatibility in Next.js)
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css'; // Import styles

export default function AddBlog() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'post',
        status: 'Active',
        images: []
    });
const [formErrors, setFormErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleDescriptionChange = (value) => {
        setFormData({
            ...formData,
            description: value
        });
    };

  const handleImageUpload = (e) => {
     const files = Array.from(e.target.files);
     const errors = {};

     // ✅ Validate each file
     for (let file of files) {
         // File size check (10MB max)
         if (file.size > 10 * 1024 * 1024) {
              errors.images = 'Image must be less than 10MB.';
             break;
         }

         // File type check
         const allowedTypes = ['image/jpeg', 'image/png'];
         if (!allowedTypes.includes(file.type)) {
             errors.images = 'Only JPEG and PNG formats are allowed.';
             break;
         }
     }

     if (Object.keys(errors).length > 0) {
         setFormErrors(errors);
         return;
     }

     // ✅ If validation passes → save files
     setFormData({
         ...formData,
         images: files,
     });
     setFormErrors((prev) => ({ ...prev, images: '' }));
 };

 const validateForm = () => {
        const errors = {};
        if (!formData.title.trim()) errors.title = 'Title is required.';
       if (!formData.description || formData.description.trim() === '' || formData.description === '<p><br></p>') {
        errors.description = 'Description is required.';
    }
        if (!formData.type) errors.type = 'Type is required.';
        if (!formData.images || formData.images.length === 0) {
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
            const endpoint = config.Addblog;
            const data = { ...formData };
            delete data.images;
            const files = {};
            if (formData.images.length > 0) {
                files.file = formData.images[0];
            }

            const response = await postApiWithFile(endpoint, data, files);
            if (response.statusCode === 201) {
           setSuccessMessage('Blog added successfully! ✅');
               setTimeout(() => {
                    router.push('/admin/Blog-Management/Blogs');
                }, 1500);
            } else {
              setFormErrors({ general: 'Failed to add blog.' });
            }

           
        } catch (error) {
            console.error('Error adding blog:', error);
       setFormErrors({ general: error?.response?.data?.message || 'Error occurred while adding blog.' });
        }
        finally {
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
                                <Col>
                                    <h2>Add New Blog</h2>
                                </Col>
                                <Col className='d-flex justify-content-end'>
                                    <Link href={'/admin/Blog-Management/Blogs'}>
                                        <Button variant="danger">Back</Button>
                                    </Link>
                                </Col>
                            </Row>
                            <Form onSubmit={handleSubmit}>
                                <Row>
                                    <Col md={12}>
                                        <Form.Group className="mb-3">
                                        <Form.Label>
  Title <span style={{ color: 'red' }}>*</span>
</Form.Label>

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
                                <Form.Group className="mb-3">
                                     <Form.Label>
        Upload Images <span style={{ color: 'red' }}>*</span>
        <small className="text-muted d-block">
           (Preffered Image 410×220px and less than 10MB of  Jpeg,Png type )
        </small>
    </Form.Label>
                                    <Form.Control
                                        type="file"
                                        multiple
                                        onChange={handleImageUpload}
                                    />
                                      {formErrors.images && <p className="text-danger">{formErrors.images}</p>}
                                </Form.Group>

                               <Button type="submit" variant="primary" disabled={isSubmitting}>
       {isSubmitting ? (
           <>
               <Spinner animation="border" size="sm" className="me-2" />
               Adding...
           </>
       ) : (
           'Add Blog'
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
