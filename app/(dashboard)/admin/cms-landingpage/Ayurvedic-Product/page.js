'use client';

import { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, Spinner } from 'react-bootstrap'; // ✅ add Spinner
import { postApi, updateApiWithFile } from 'services/api';
import { config } from 'services/config';

export default function AyurvedicProducts() {
    const [isSubmitting, setIsSubmitting] = useState(false); // ✅ new state
const [successMessage, setSuccessMessage] = useState(''); // ✅ success message

    const [errors, setErrors] = useState({});
    const [imagePreview, setImagePreview] = useState(null);
    const [uploadStatus, setUploadStatus] = useState('');
    const [formData, setFormData] = useState({
        bannerImage: null,
        title: '',
        type: "ayurvedic_products",
        descriptions: '',
        button_label: '',
        button_route: '',
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        const data = { id: "676d2d96d81f0fb149036358" };
        try {
            const endpoint = config.ViewLandingPageCaraousalDatabyid;
            const response = await postApi(endpoint, data);
            if (response.statusCode === 201) {
                setFormData({
                    bannerImage: null,
                    title: response.result?.title || '',
                    descriptions: response.result?.descriptions || '',
                    button_label: response.result?.button_label || '',
                    button_route: response.result?.button_route || '',
                });
                setImagePreview(response.result?.file ? `${process.env.NEXT_PUBLIC_API_URL}/${response.result.file}` : null);
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
        setErrors((prevErrors) => ({
            ...prevErrors,
            [name]: '',
        }));
    };

    const handleImageUpload = (e) => {
      const file = e.target.files[0];
    if (file) {
        // ✅ File size check (10MB max)
        if (file.size > 10 * 1024 * 1024) {
            setErrors((prev) => ({ ...prev, bannerImage: 'Image must be less than 10MB.' }));
            return;
        }

        // ✅ File type check
        const allowedTypes = ['image/jpeg', 'image/png'];
        if (!allowedTypes.includes(file.type)) {
            setErrors((prev) => ({ ...prev, bannerImage: 'Only JPEG and PNG formats are allowed.' }));
            return;
        }

        setFormData({
            ...formData,
            bannerImage: file,
        });
        setImagePreview(URL.createObjectURL(file));
        setErrors((prevErrors) => ({
            ...prevErrors,
            bannerImage: '',
        }));
    }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.title.trim()) newErrors.title = 'Title is required.';
        if (!formData.descriptions.trim()) newErrors.descriptions = 'Description is required.';
        if (!formData.button_label.trim()) newErrors.button_label = 'Button label is required.';
        if (!formData.button_route.trim()) newErrors.button_route = 'Button route is required.';
         // ✅ Require new bannerImage OR existing preview
  if (!formData.bannerImage && !imagePreview) {
       newErrors.bannerImage = 'Banner image is required.';
   }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateForm()) return;
  if (isSubmitting) return; // ✅ prevent multiple clicks

  setIsSubmitting(true); // ✅ start loader
  setSuccessMessage('');

  try {
    const endpoint = config.UpdateLandingPageCaraousalDatabyid;
    const files = { file: formData.bannerImage };
    const data = {
      title: formData.title,
      descriptions: formData.descriptions,
      button_label: formData.button_label,
      button_route: formData.button_route,
    };
    const id = '676d2d96d81f0fb149036358';

    const response = await updateApiWithFile(endpoint, id, data, files);
    if (response.statusCode === 200) {
      setSuccessMessage('Banner updated successfully! ✅');

      // ✅ Redirect after short delay
      setTimeout(() => {
        window.location.reload(); // or use router.push if needed
      }, 1500);
    } else {
      setUploadStatus('Failed to update banner.');
    }
  } catch (error) {
    setUploadStatus('Error updating banner.');
    alert(error.response?.data?.message || 'An error occurred. Please try again.');
    console.error('Error:', error);
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
                                    <h2>Update Ayurvedic Product Section</h2>
                                </Col>
                            </Row>
                            <Form onSubmit={handleSubmit}>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label><strong>Title</strong><span style={{ color: 'red' }}> *</span></Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="title"
                                                value={formData.title}
                                                onChange={handleInputChange}
                                                maxLength={30}
                                            />
                                            {errors.title && <p className="text-danger">{errors.title}</p>}
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label><strong>Banner Image</strong><span style={{ color: 'red' }}> *</span>
                                            <small className="text-muted d-block">
    (Preferred size: 830×360px, less than 10MB, JPEG/PNG only)
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
                                            <Form.Label><strong>Button Label</strong><span style={{ color: 'red' }}> *</span></Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="button_label"
                                                value={formData.button_label}
                                                onChange={handleInputChange}
                                                maxLength={20}
                                            />
                                            {errors.button_label && <p className="text-danger">{errors.button_label}</p>}
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label><strong>Button Route</strong><span style={{ color: 'red' }}> *</span></Form.Label>
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
                                            <Form.Label><strong>Description</strong><span style={{ color: 'red' }}> *</span></Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                rows={5}
                                                name="descriptions"
                                                value={formData.descriptions}
                                                onChange={handleInputChange}
                                                maxLength={250}
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
    'Update'
  )}
</Button>
{successMessage && (
  <p className="text-success mt-3">{successMessage}</p>
)}

                            </Form>
                            {uploadStatus && <p className="mt-3">{uploadStatus}</p>}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}
