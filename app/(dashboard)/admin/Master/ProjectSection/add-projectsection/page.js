"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import Link from 'next/link';
import { postApiWithFile } from 'services/api';
import { config } from 'services/config';
import Swal from 'sweetalert2';

const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png']); // jpg/jpeg & png
export default function AddProjectSection() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    heading: '',
    text: '',
    description: '',
    image: null
  });

  const [formErrors, setFormErrors] = useState({});
  const [uploadStatus, setUploadStatus] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setFormErrors(prev => ({ ...prev, [name]: '' }));
  };

const handleImageUpload = (e) => {
   const file = e.target.files?.[0];
   if (!file) return;

   // Type check
   if (!ALLOWED_TYPES.has(file.type)) {
     Swal.fire({
       icon: 'warning',
       title: 'Unsupported file type',
       text: 'Please select a JPEG or PNG image.',
     });
     e.target.value = '';                       // clear input
     setFormErrors(prev => ({ ...prev, image: 'Only JPEG/PNG allowed.' }));
     setFormData(prev => ({ ...prev, image: null }));
     return;
   }

   // Size check
   if (file.size > MAX_IMAGE_BYTES) {
     Swal.fire({
       icon: 'warning',
       title: 'File too large',
       text: 'Please select an image smaller than 10 MB.',
     });
     e.target.value = '';                       // clear input
     setFormErrors(prev => ({ ...prev, image: 'Max size is 10 MB.' }));
     setFormData(prev => ({ ...prev, image: null }));
     return;
   }

   setFormData(prev => ({ ...prev, image: file }));
   setFormErrors(prev => ({ ...prev, image: '' }));
 };

  const validateForm = () => {
    const errors = {};
    if (!formData.heading.trim()) errors.heading = 'Heading is required.';
    if (!formData.text.trim()) errors.text = 'Text is required.';
    if (!formData.description.trim()) errors.description = 'Description is required.';
    if (!formData.image) errors.image = 'Image is required.';
     if (formData.image) {
   if (!ALLOWED_TYPES.has(formData.image.type)) {
     errors.image = 'Only JPEG/PNG allowed.';
   } else if (formData.image.size > MAX_IMAGE_BYTES) {
     errors.image = 'Max size is 10 MB.';
   }
 }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const endpoint = config.AddProjectSection; // <-- Add this in your config
      const data = { ...formData };
      delete data.image;

      const files = formData.image ? { image: formData.image } : {};
      const response = await postApiWithFile(endpoint, data, files);

      if (response.statusCode === 201) {
        setFormData({ heading: '', text: '', description: '', image: null });
        setUploadStatus('Project section added successfully!');
        router.push('/admin/Master/ProjectSection');
      } else {
        setUploadStatus('Failed to add project section.');
      }
    } catch (err) {
      console.error('Error adding project section:', err);
      alert(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <Container fluid>
      <Row>
        <Col>
          <Card className="p-4 mt-4">
            <Card.Body>
              <Row className="mb-3">
                <Col><h2>Add New Project</h2></Col>
                <Col className="d-flex justify-content-end">
                  <Link href="/admin/cms-landingpage/Project-Section">
                    <Button variant="danger">Back</Button>
                  </Link>
                </Col>
              </Row>

              <Form onSubmit={handleSubmit}>
                <Row>
                  
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Text <span style={{ color: 'red' }}>*</span></Form.Label>
                      <Form.Control
                        type="text"
                        name="text"
                        value={formData.text}
                        onChange={handleInputChange}
                      />
                      {formErrors.text && <p className="text-danger">{formErrors.text}</p>}
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Heading <span style={{ color: 'red' }}>*</span></Form.Label>
                      <Form.Control
                        type="text"
                        name="heading"
                        value={formData.heading}
                        onChange={handleInputChange}
                      />
                      {formErrors.heading && <p className="text-danger">{formErrors.heading}</p>}
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Description <span style={{ color: 'red' }}>*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                  />
                  {formErrors.description && <p className="text-danger">{formErrors.description}</p>}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Upload Image <span style={{ color: 'red' }}>*</span> <small>
                          (Preffered Image 1920×600px and less than 10MB  of  Jpeg,Png type )
                        </small></Form.Label>
                <Form.Control
   type="file"
   accept="image/png,image/jpeg"
   onChange={handleImageUpload}
 />
                  {formErrors.image && <p className="text-danger">{formErrors.image}</p>}
                </Form.Group>

                <Button type="submit" variant="primary">Add Project</Button>
              </Form>

              {uploadStatus && <p>{uploadStatus}</p>}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
