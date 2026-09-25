'use client';

import { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import dynamic from 'next/dynamic';
import { updateApiWithFile, postApi ,postApiWithFile   } from 'services/api';
import { config } from 'services/config';




export default function FooterDataForm() {
  const [formData, setFormData] = useState({
  icon: null,
  name: '',
  description: '',
  dropdown_type: 'footer_data',
  address: '',   // ✅ new
  email: '',     // ✅ new
  number: ''     // ✅ new
});


    const [iconPreview, setIconPreview] = useState(null);
    const [errors, setErrors] = useState({});
    const [uploadStatus, setUploadStatus] = useState('');

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const data = { id: "67f4da7497d93651914eb2f7" }; // Replace with actual ID
            const endpoint = config.Viewcategory;
            const response = await postApi(endpoint, data);

            console.log(response)
          if (response.statusCode === 201) {
  setFormData({
    icon: null,
    name: response.data.name || '',
    description: response.data.description || '',
    address: response.data.address || '',   // ✅
    email: response.data.email || '',       // ✅
    number: response.data.number || ''      // ✅
  });
  setIconPreview(response.data.file ? `${process.env.NEXT_PUBLIC_API_URL}/${response.data.file}` : null);
}

        } catch (error) {
            console.error('Error fetching footer data:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleIconUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, icon: file });
            setIconPreview(URL.createObjectURL(file));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name) newErrors.name = 'Heading is required.';
        if (!formData.description) newErrors.description = 'Text is required.';
        if (!formData.icon && !iconPreview) newErrors.icon = 'Icon is required.';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            const endpoint = config.Updatecategory;
            const files = { file: formData.icon };
          const data = {
  name: formData.name,
  description: formData.description,
  address: formData.address,   // ✅
  email: formData.email,       // ✅
  number: formData.number      // ✅
};


            const id = '67f4da7497d93651914eb2f7'; // Replace with actual ID
            const response = await updateApiWithFile(endpoint, id, data, files);

            if (response.statusCode === 200) {
                setUploadStatus('Footer data updated successfully!');
                fetchInitialData();
            }
        } catch (error) {
            alert(error.response.data.message)
            setUploadStatus('Error updating footer data.');
            console.error('Error:', error);
        }
    };

    return (
        <Container fluid>
            <Row>
                <Col>
                    <Card className="p-4 mt-4">
                        <Card.Body>
                            <h2>Footer Data</h2>
                            <Form onSubmit={handleSubmit}>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Heading</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                    {/* <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Icon</Form.Label>
                                            <Form.Control
                                                type="file"
                                                name="icon"
                                                onChange={handleIconUpload}
                                            />
                                            {iconPreview && (
                                                <div className="mt-2">
                                                    <img
                                                        src={iconPreview}
                                                        alt="Icon Preview"
                                                        style={{ width: '100%', maxHeight: '150px', objectFit: 'contain' }}
                                                    />
                                                </div>
                                            )}
                                        </Form.Group>
                                    </Col> */}
                                </Row>
                                <Row>
                                    <Col md={12}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Text</Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                rows={4}
                                                name="description"
                                                value={formData.description}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row>
  <Col md={4}>
    <Form.Group className="mb-3">
      <Form.Label>Address</Form.Label>
      <Form.Control
        type="text"
        name="address"
        value={formData.address}
        onChange={handleInputChange}
      />
    </Form.Group>
  </Col>
  <Col md={4}>
    <Form.Group className="mb-3">
      <Form.Label>Email</Form.Label>
      <Form.Control
        type="email"
        name="email"
        value={formData.email}
        onChange={handleInputChange}
      />
    </Form.Group>
  </Col>
  <Col md={4}>
    <Form.Group className="mb-3">
      <Form.Label>Number</Form.Label>
      <Form.Control
        type="text"
        name="number"
        value={formData.number}
        onChange={handleInputChange}
      />
    </Form.Group>
  </Col>
</Row>

                                <Button type="submit" className="mt-3" variant="primary">
                                    Update Footer Content
                                </Button>
                            </Form>
                            {uploadStatus && <p className="mt-3">{uploadStatus}</p>}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}