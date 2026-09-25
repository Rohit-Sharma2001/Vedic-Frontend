'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import Link from 'next/link';
import { postApi, updateApiWithFile } from 'services/api';
import { config } from 'services/config';
import Swal from 'sweetalert2';

const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png']);
export default function EditProjectSection({ params }) {
  const router = useRouter();
  const editId = params.editid;

  const [formData, setFormData] = useState({
    id: editId,
    heading: '',
    text: '',
    description: '',
    image: null,
  });

  const [formErrors, setFormErrors] = useState({});
  const [existingImage, setExistingImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    if (editId) fetchDataItemDetails();
  }, [editId]);

  const fetchDataItemDetails = async () => {
    try {
      const response = await postApi(config.ViewProjectSections, { id: editId });
      if (response.statusCode === 201) {
        setFormData({
          ...response.result,
          image: null,
        });
        setExistingImage(response.result.image);
      }
    } catch (error) {
      console.error('Error fetching project section:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: '' }));
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
     e.target.value = ''; // clear the input
     // keep existingImage as-is, do not overwrite formData.image
     setFormData(prev => ({ ...prev, image: null }));
     setPreviewImage(null);
     return;
   }

   // Size check
   if (file.size > MAX_IMAGE_BYTES) {
     Swal.fire({
       icon: 'warning',
       title: 'File too large',
       text: 'Please select an image smaller than 10 MB.',
     });
     e.target.value = ''; // clear the input
     setFormData(prev => ({ ...prev, image: null }));
     setPreviewImage(null);
     return;
   }

   // Valid file
   setFormData(prev => ({ ...prev, image: file }));
   setPreviewImage(URL.createObjectURL(file));
 };

  const validateForm = () => {
    const errors = {};
    if (!formData.heading.trim()) errors.heading = 'Heading is required.';
    if (!formData.text.trim()) errors.text = 'Text is required.';
    if (!formData.description.trim()) errors.description = 'Description is required.';
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
      const data = { ...formData };
      delete data.image;

      const files = formData.image ? { image: formData.image } : {};
      const response = await updateApiWithFile(config.UpdateProjectSections, editId, data, files);

      if (response.statusCode === 200 || response.statusCode === 201) {
        router.push('/admin/Master/ProjectSection');
      } else {
        alert('Failed to update project section.');
      }
    } catch (error) {
      console.error('Error updating project section:', error);
      alert(error.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <Container fluid>
      <Row>
        <Col>
          <Card className="p-4 mt-4">
            <Card.Body>
              <Row className="mb-3">
                <Col><h2>Edit Project Section</h2></Col>
                <Col className="d-flex justify-content-end">
                  <Link href="/admin/Master/ProjectSection">
                    <Button variant="danger">Back</Button>
                  </Link>
                </Col>
              </Row>

              <Form onSubmit={handleSubmit}>
                <Row>
                  

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Text</Form.Label>
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
                      <Form.Label>Heading</Form.Label>
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
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                  />
                  {formErrors.description && <p className="text-danger">{formErrors.description}</p>}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Upload Image <small>
                          (Preffered Image 1920×600px and less than 10MB  of  Jpeg,Png type )
                        </small></Form.Label>
                 <Form.Control
   type="file"
   accept="image/jpeg,image/png"
   onChange={handleImageUpload}
 />
                  <div className="mt-3">
                    {previewImage ? (
                      <>
                        <p>New Image Preview:</p>
                        <img src={previewImage} alt="Preview" style={{ maxHeight: '200px' }} />
                      </>
                    ) : existingImage ? (
                      <>
                        <p>Existing Image:</p>
                        <img src={`${process.env.NEXT_PUBLIC_API_URL}/${existingImage}`} alt="Existing" style={{ maxHeight: '200px' }} />
                      </>
                    ) : (
                      <p>No image available</p>
                    )}
                  </div>
                </Form.Group>

                <Button type="submit" variant="primary">Update Project</Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
