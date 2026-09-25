// File path: app/center/edit/[id]/page.js

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import Link from 'next/link';
import { postApi, updateApiWithFile } from 'services/api';
import { config } from 'services/config';
import dynamic from 'next/dynamic';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

export default function EditCenter({ params }) {
    const router = useRouter();
    const editid = params.edit;

    const [formData, setFormData] = useState({
        id: editid,
        centerName: '',         // New Field
        openingTime: '',        // New Field
        closingTime: '',        // New Field
        address: '',
        phone_number: '',
        email: '',
        details: '',
        status: 'Active',
        imageUrl: null,
    });

    const [existingImage, setExistingImage] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["image/jpeg", "image/png"]; // jpg/jpeg + png

const [imageError, setImageError] = useState("");

    useEffect(() => {
        if (editid) {
            fetchCenterDetails();
        }
    }, [editid]);

    const fetchCenterDetails = async () => {
        try {
            const endpoint = config.Viewcenter;
            const data = { id: editid };
            const response = await postApi(endpoint, data);
            if (response.statusCode === 201) {
                setFormData({
                    ...response.centerManagementData,
                    imageUrl: null,
                });
                setExistingImage(response.centerManagementData.file);
            }
        } catch (error) {
            console.error('Error fetching center details:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleDetailsChange = (value) => {
        setFormData((prevData) => ({
            ...prevData,
            details: value,
        }));
    };

   const handleImageUpload = (e) => {
  const file = e.target.files?.[0];
  setImageError("");

  if (!file) return;

  if (!ALLOWED_TYPES.includes(file.type)) {
    setImageError("Only JPG/JPEG and PNG images are allowed.");
    e.target.value = ""; // clear selection
    setFormData((prev) => ({ ...prev, imageUrl: null }));
    setPreviewImage(null);
    return;
  }

  if (file.size > MAX_FILE_SIZE) {
    setImageError("Image must be less than 10 MB.");
    e.target.value = ""; // clear selection
    setFormData((prev) => ({ ...prev, imageUrl: null }));
    setPreviewImage(null);
    return;
  }

  setFormData((prev) => ({ ...prev, imageUrl: file }));
  setPreviewImage(URL.createObjectURL(file));
};


    const handleSubmit = async (e) => {
        if (formData.imageUrl) {
  if (!ALLOWED_TYPES.includes(formData.imageUrl.type)) {
    return alert("Only JPG/JPEG and PNG images are allowed.");
  }
  if (formData.imageUrl.size > MAX_FILE_SIZE) {
    return alert("Image must be less than 10 MB.");
  }
}

        e.preventDefault();
        try {
            const endpoint = config.Updatecenter;
            const data = { ...formData };
            delete data.imageUrl;

            const files = formData.imageUrl ? { file: formData.imageUrl } : {};

            const response = await updateApiWithFile(endpoint, editid, data, files);
            if (response.statusCode === 200) {
                alert('Center updated successfully!');
                router.push('/admin/center');
            } else {
                alert('Failed to update center.');
            }
        } catch (error) {
            console.error('Error updating center:', error);
            alert(error.response.data.message)
            // alert('An error occurred. Please try again.');
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
                                    <h2>Edit Center</h2>
                                </Col>
                                <Col className="d-flex justify-content-end">
                                    <Link href={'/admin/center'}>
                                        <Button variant="danger">Back</Button>
                                    </Link>
                                </Col>
                            </Row>
                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Center Name</Form.Label>   {/* New Field */}
                                    <Form.Control
                                        type="text"
                                        name="centerName"
                                        value={formData.centerName}
                                        onChange={handleInputChange}
                                    />
                                </Form.Group>
                            
                                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <strong>Opening Time</strong>{" "}
                        {/* <b style={{ color: "red" }}>*</b> */}
                      </Form.Label>
                      <Form.Control
                        type="time"
                        name="openingTime"
                        value={formData.openingTime}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <strong>Closing Time</strong>
                      </Form.Label>
                      <Form.Control
                        type="time"
                        name="closingTime"
                        value={formData.closingTime}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                                <Form.Group className="mb-3">
                                    <Form.Label>Address</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Phone Number</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="phone_number"
                                        value={formData.phone_number}
                                        onChange={handleInputChange}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Details</Form.Label>
                                    <ReactQuill
                                        value={formData.details}
                                        onChange={handleDetailsChange}
                                    />
                                </Form.Group>
                                {/* <Form.Group className="mb-3">
                                    <Form.Label>Status</Form.Label>
                                    <Form.Select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </Form.Select>
                                </Form.Group> */}
                                <Form.Group className="mb-3">
                                    <Form.Label>Upload Image</Form.Label>
                                   <Form.Control
  type="file"
  accept=".jpg,.jpeg,.png,image/jpeg,image/png"
  onChange={handleImageUpload}
/>

{imageError && <div className="text-danger mt-1">{imageError}</div>}

                                    <div className="mt-3">
                                        {previewImage ? (
                                            <img
                                                src={previewImage}
                                                alt="New Center"
                                                style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'cover' }}
                                            />
                                        ) : existingImage ? (
                                            <img
                                                src={`${process.env.NEXT_PUBLIC_API_URL}/${existingImage}`}
                                                alt="Center"
                                                style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'cover' }}
                                            />
                                        ) : (
                                            <p>No image available</p>
                                        )}
                                    </div>
                                </Form.Group>
                                <Button type="submit" variant="primary">
                                    Update Center
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}
