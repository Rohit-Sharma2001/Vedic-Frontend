'use client';

import { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, Spinner } from 'react-bootstrap'; // ✅ add Spinner
import { postApi, updateApiWithFile } from 'services/api';
import { config } from 'services/config';

export default function MeetAmita() {
    const [isSubmitting, setIsSubmitting] = useState(false); // ✅ prevent multiple clicks
const [successMessage, setSuccessMessage] = useState(''); // ✅ show success

    const [errors, setErrors] = useState({});
    const [mediaPreview, setMediaPreview] = useState(null);
    const [isVideo, setIsVideo] = useState(false);
    const [uploadStatus, setUploadStatus] = useState('');
    const [formData, setFormData] = useState({
        bannerMedia: null,
        title: '',
        type: "meet_amita",
        descriptions: '',
        button_label: '',
        button_route: '',
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        const data = { id: "6777673936409000f73b2335" };
        try {
            const endpoint = config.ViewLandingPageCaraousalDatabyid;
            const response = await postApi(endpoint, data);
            console.log(response)
            if (response.statusCode === 201) {
                setFormData({
                    bannerMedia: null,
                    title: response.result?.title || '',
                    descriptions: response.result?.descriptions || '',
                    button_label: response.result?.button_label || '',
                    button_route: response.result?.button_route || '',
                });
                setMediaPreview(
                    response.result?.file ? `${process.env.NEXT_PUBLIC_API_URL}/${response.result.file}` : null
                );
                console.log(`${process.env.NEXT_PUBLIC_API_URL}/${response.result.file}`)
                setIsVideo(response.result?.file?.endsWith('.mp4')); // Identify if the file is a video
                
            }
        } catch (error) {
            console.error('Error fetching initial data:', error);
            alert(error.response.data.message)
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

  const handleMediaUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
        // ✅ File size check (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            setErrors((prev) => ({ ...prev, bannerMedia: 'Video must be less than 10MB.' }));
            return;
        }

        // ✅ File type check (only MP4 videos allowed)
        const allowedTypes = ['video/mp4'];
        if (!allowedTypes.includes(file.type)) {
            setErrors((prev) => ({
                ...prev,
                bannerMedia: 'Only MP4 videos are allowed.',
            }));
            return;
        }

        setFormData({
            ...formData,
            bannerMedia: file,
        });
        setMediaPreview(URL.createObjectURL(file));
        setIsVideo(true); // ✅ Always video
        setErrors((prevErrors) => ({
            ...prevErrors,
            bannerMedia: '',
        }));
    }
};


    const validateForm = () => {
        const newErrors = {};
        if (!formData.title.trim()) newErrors.title = 'Title is required.';
        if (!formData.descriptions.trim()) newErrors.descriptions = 'Description is required.';
        if (!formData.button_label.trim()) newErrors.button_label = 'Button label is required.';
        if (!formData.button_route.trim()) newErrors.button_route = 'Button route is required.';
       if (!formData.bannerMedia && !mediaPreview) {
    newErrors.bannerMedia = 'A video file (MP4) is required.';
}

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

 const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateForm()) return;
  if (isSubmitting) return; // ✅ prevent double submit

  setIsSubmitting(true);
  setSuccessMessage('');
  setUploadStatus('');

  try {
    const endpoint = config.UpdateLandingPageCaraousalDatabyid;
    const files = { file: formData.bannerMedia };
    const data = {
      title: formData.title,
      descriptions: formData.descriptions,
      button_label: formData.button_label,
      button_route: formData.button_route,
    };
    const id = '6777673936409000f73b2335'; 

    const response = await updateApiWithFile(endpoint, id, data, files);

    if (response.statusCode === 200) {
      setSuccessMessage('Banner updated successfully! ✅');
      setTimeout(() => {
        fetchInitialData(); // ✅ refresh data after short delay
        setSuccessMessage('');
      }, 1500);
    } else {
      setUploadStatus('Failed to update banner.');
    }
  } catch (error) {
    setUploadStatus('Error updating banner.');
    console.error('Error:', error);
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
                                    <h2>Update Meet Amita Section</h2>
                                </Col>
                            </Row>
                            <Form onSubmit={handleSubmit}>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>
                                                <strong>Title</strong>
                                                 <b style={{ color: 'red' }}>*</b>
                                            </Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="title"
                                                value={formData.title}
                                                onChange={handleInputChange}
                                                maxLength={120}
                                            />
                                            {errors.title && <p className="text-danger">{errors.title}</p>}
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>
    <strong>Banner Media</strong> <b style={{ color: 'red' }}>*</b>
    <small className="text-muted d-block">
        (Allowed: MP4 | Max size: 10MB)
    </small>
</Form.Label>

                                            <Form.Control
                                                type="file"
                                                name="bannerMedia"
                                                onChange={handleMediaUpload}
                                            />
                                            {errors.bannerMedia && (
                                                <p className="text-danger">{errors.bannerMedia}</p>
                                            )}
                                            {mediaPreview && (
                                                <div className="mt-2">
                                                    {isVideo ? (
                                                        <video
                                                            src={mediaPreview}
                                                            autoPlay
                                                            loop
                                                            muted
                                                            style={{
                                                                width: '100%',
                                                                maxHeight: '150px',
                                                                objectFit: 'contain',
                                                            }}
                                                        />
                                                    ) : (
                                                        <img
                                                            src={mediaPreview}
                                                            alt="Banner Preview"
                                                            style={{
                                                                width: '100%',
                                                                maxHeight: '150px',
                                                                objectFit: 'contain',
                                                            }}
                                                        />
                                                    )}
                                                </div>
                                            )}
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>
                                                <strong>Button Label</strong>
                                                <b style={{ color: 'red' }}>*</b>
                                            </Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="button_label"
                                                value={formData.button_label}
                                                onChange={handleInputChange}
                                                maxLength={25}
                                            />
                                            {errors.button_label && (
                                                <p className="text-danger">{errors.button_label}</p>
                                            )}
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>
                                                <strong>Button Route</strong>
                                                <b style={{ color: 'red' }}>*</b>
                                            </Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="button_route"
                                                value={formData.button_route}
                                                onChange={handleInputChange}
                                            />
                                            {errors.button_route && (
                                                <p className="text-danger">{errors.button_route}</p>
                                            )}
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={12}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>
                                                <strong>Description</strong>
                                                <b style={{ color: 'red' }}>*</b>
                                            </Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                rows={5}
                                                name="descriptions"
                                                value={formData.descriptions}
                                                onChange={handleInputChange}
                                                maxLength={300}
                                            />
                                            {errors.descriptions && (
                                                <p className="text-danger">{errors.descriptions}</p>
                                            )}
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
{successMessage && <p className="text-success mt-3">{successMessage}</p>}
{uploadStatus && <p className="mt-3 text-danger">{uploadStatus}</p>}

                            </Form>
                           
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}
