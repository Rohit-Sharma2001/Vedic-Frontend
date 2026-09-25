'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Row, Col, Form, Button, Card, Spinner } from 'react-bootstrap'; // ✅ add Spinner
import Link from 'next/link';
import { postApiWithFile } from 'services/api';
import { config } from 'services/config';

export default function AddYogaClasses() {
    const [isSubmitting, setIsSubmitting] = useState(false); // ✅ disable multiple clicks
const [successMessage, setSuccessMessage] = useState(''); // ✅ success message

    const router = useRouter();
    const [formData, setFormData] = useState({
        title: '',
        type: "yoga_classes",
        descriptions: '',
        button_label: '',
        button_route: '',
        image: null // Single image file
    });

    const [formErrors, setFormErrors] = useState({});
    const [uploadStatus, setUploadStatus] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
        setFormErrors({
            ...formErrors,
            [name]: ''
        });
    };

    const handleImageUpload = (e) => {
      const file = e.target.files[0];
    if (file) {
        // File size check (max 5MB for example)
        if (file.size > 10 * 1024 * 1024) {
            setFormErrors((prev) => ({ ...prev, image: 'Image must be less than 10MB.' }));
            return;
        }

        // File type check
        const allowedTypes = ['image/jpeg', 'image/png'];
        if (!allowedTypes.includes(file.type)) {
            setFormErrors((prev) => ({ ...prev, image: 'Only JPEG and PNG formats are allowed.' }));
            return;
        }

        setFormData({
            ...formData,
            image: file
        });
        setFormErrors((prev) => ({ ...prev, image: '' }));
    }
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.title.trim()) errors.title = 'Title is required.';
        if (!formData.descriptions.trim()) errors.descriptions = 'Descriptions are required.';
        if (!formData.button_label.trim()) errors.button_label = 'Button Label is required.';
        if (!formData.button_route.trim()) errors.button_route = 'Button Route is required.';
        if (!formData.image) errors.image = 'Image is required.';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

   const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateForm()) return;
  if (isSubmitting) return; // ✅ block double submit

  setIsSubmitting(true);
  setSuccessMessage('');
  setUploadStatus('');

  try {
    const endpoint = config.AddLandingPageCaraousalData;
    const data = { ...formData };
    delete data.image;

    const files = {};
    if (formData.image) {
      files.file = formData.image;
    }

    const response = await postApiWithFile(endpoint, data, files);
    if (response.statusCode === 201) {
      setFormData({
        title: '',
        descriptions: '',
        button_label: '',
        button_route: '',
        image: null,
      });

      setSuccessMessage('Classes added successfully! ✅');
      setTimeout(() => {
        router.push('/admin/cms-landingpage/Yoga-Classes');
      }, 1500); // ✅ small delay so user sees success
    } else {
      setUploadStatus('Failed to add classes.');
    }
  } catch (error) {
    console.error('Error adding classes:', error);
    alert(error.response?.data?.message || 'Error occurred while adding classes.');
    setUploadStatus('Error occurred while adding classes.');
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
                                <Col>
                                    <h2>Add New Classes</h2>
                                </Col>
                                <Col className="d-flex justify-content-end">
                                    <Link href={'/admin/cms-landingpage/Yoga-Classes'}>
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
                                                maxLength={30}
                                            />
                                            {formErrors.title && (
                                                <p className="text-danger">{formErrors.title}</p>
                                            )}
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={12}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Descriptions <span style={{ color: 'red' }}>*</span></Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="descriptions"
                                                value={formData.descriptions}
                                                onChange={handleInputChange}
                                                maxLength={250}
                                            />
                                            {formErrors.descriptions && (
                                                <p className="text-danger">{formErrors.descriptions}</p>
                                            )}
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Button Label <span style={{ color: 'red' }}>*</span></Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="button_label"
                                                value={formData.button_label}
                                                onChange={handleInputChange}
                                            />
                                            {formErrors.button_label && (
                                                <p className="text-danger">{formErrors.button_label}</p>
                                            )}
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Button Route <span style={{ color: 'red' }}>*</span></Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="button_route"
                                                value={formData.button_route}
                                                onChange={handleInputChange}
                                            />
                                            {formErrors.button_route && (
                                                <p className="text-danger">{formErrors.button_route}</p>
                                            )}
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Form.Group className="mb-3">
                                    <Form.Label> Upload Image <span style={{ color: 'red' }}>*</span>
   <small className="text-muted d-block">
    
       (Preferred size: 500×350px, less than 10MB, JPEG/PNG only)
   </small></Form.Label>
                                    <Form.Control
                                        type="file"
                                        onChange={handleImageUpload}
                                    />
                                    {formErrors.image && (
                                        <p className="text-danger">{formErrors.image}</p>
                                    )}
                                </Form.Group>
                                <Button type="submit" variant="primary" disabled={isSubmitting}>
  {isSubmitting ? (
    <>
      <Spinner animation="border" size="sm" className="me-2" />
      Adding...
    </>
  ) : (
    'Add Classes'
  )}
</Button>
{successMessage && <p className="text-success mt-3">{successMessage}</p>}
{uploadStatus && <p className="text-danger mt-3">{uploadStatus}</p>}

                            </Form>
                       
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}
