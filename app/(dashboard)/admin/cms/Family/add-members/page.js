'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import Link from 'next/link';
import { postApiWithFile } from 'services/api';
import { config } from 'services/config';
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";

// Dynamically import ReactQuill (to avoid SSR issues in Next.js)
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

export default function AddTeamMember() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        experties: '',
        description: '',
        image: null
    });

    const [formErrors, setFormErrors] = useState({});
    const [uploadStatus, setUploadStatus] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setFormErrors({ ...formErrors, [name]: '' });
    };

    const handleImageUpload = (e) => {
        setFormData({ ...formData, image: e.target.files[0] });
        setFormErrors({ ...formErrors, image: '' });
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.name.trim()) errors.name = 'Name is required.';
        if (!formData.experties.trim()) errors.experties = 'Expertise is required.';
       if (!formData.description || formData.description.trim() === '' || formData.description === '<p><br></p>') {
  errors.description = 'Description is required.';
}
        if (!formData.image) errors.image = 'Image is required.';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            const endpoint = config.AddFamilyMember; // Ensure endpoint is defined
            const data = { ...formData };
            delete data.image;

            const files = { file: formData.image };

            const response = await postApiWithFile(endpoint, data, files);
            console.log(response)
         
                setFormData({ name: '', experties: '', description: '', image: null });
                setUploadStatus('Team member added successfully!');
                router.push('/admin/cms/Family');
          
        } catch (error) {
            console.error('Error:', error);
            alert(error.response?.data?.message || 'Unexpected error');
            setUploadStatus('Error occurred while adding team member.');
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
                                    <h2>Add Team Member</h2>
                                </Col>
                                <Col className="d-flex justify-content-end">
                                    <Link href={'/admin/cms/Family'}>
                                        <Button variant="danger">Back</Button>
                                    </Link>
                                </Col>
                            </Row>
                            <Form onSubmit={handleSubmit}>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Name <span style={{ color: 'red' }}>*</span></Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                            />
                                            {formErrors.name && <p className="text-danger">{formErrors.name}</p>}
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Expertise <span style={{ color: 'red' }}>*</span></Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="experties"
                                                value={formData.experties}
                                                onChange={handleInputChange}
                                            />
                                            {formErrors.experties && <p className="text-danger">{formErrors.experties}</p>}
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                       <Form.Group className="mb-3">
  <Form.Label>Description <span style={{ color: 'red' }}>*</span></Form.Label>
  <ReactQuill
    value={formData.description}
    onChange={(value) =>
      setFormData((prev) => ({ ...prev, description: value }))
    }
    theme="snow"
  />
  {formErrors.description && <p className="text-danger">{formErrors.description}</p>}
</Form.Group>

                                    </Col>
                                </Row>
                                <Form.Group className="mb-3">
                                    <Form.Label>Upload Image <span style={{ color: 'red' }}>*</span></Form.Label>
                                    <Form.Control type="file" onChange={handleImageUpload} />
                                    {formErrors.image && <p className="text-danger">{formErrors.image}</p>}
                                </Form.Group>
                                <Button type="submit" variant="primary">Add Member</Button>
                            </Form>
                            {uploadStatus && <p>{uploadStatus}</p>}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}
