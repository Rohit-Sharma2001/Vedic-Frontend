'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import Link from 'next/link';
import { postApi, updateApiWithFile } from 'services/api';
import { config } from 'services/config';
import Swal from "sweetalert2";


export default function EditBanner({ params }) {
    const router = useRouter();
    const editId = params.editid;

    const [formData, setFormData] = useState({
        id: editId,
        title: '',
        descriptions: '',
        sub_title: '',
      
        image: null,
    });

    const [formErrors, setFormErrors] = useState({});
    const [existingImage, setExistingImage] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);

    useEffect(() => {
        if (editId) {
            fetchDataItemDetails();
        }
    }, [editId]);

    const fetchDataItemDetails = async () => {
        try {
            const endpoint = config.ViewMainBannerDataById;
            const data = { id: editId };
            const response = await postApi(endpoint, data);
            if (response.statusCode === 201) {
                setFormData({
                    ...response.Banner,
                    image: null,
                });
                setExistingImage(response.Banner.file);
            }
        } catch (error) {
            console.error('Error fetching data item details:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
        setFormErrors({
            ...formErrors,
            [name]: '',
        });
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData((prevData) => ({
                ...prevData,
                image: file,
            }));
            setPreviewImage(URL.createObjectURL(file));
            setFormErrors({
                ...formErrors,
                image: '',
            });
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.title.trim()) errors.title = 'Title is required.';
        if (!formData.descriptions.trim()) errors.descriptions = 'Descriptions are required.';
        if (!formData.sub_title.trim()) errors.sub_title = 'Sub Title is required.';
        // if (!formData.button_route.trim()) errors.button_route = 'Button Route is required.';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            const endpoint = config.UpdateMainBannerDataById;
            const data = { ...formData };
            delete data.image;

            const files = {
                file: formData.image,
            };

            const response = await updateApiWithFile(endpoint, editId, data, files);
           if (response.statusCode === 200) {
    Swal.fire({
        title: "Updated Successfully!",
        text: "Your banner has been updated.",
        icon: "success",
        confirmButtonText: "OK",
    }).then(() => {
        router.push("/admin/shop-landing");
    });
}
 else {
                alert('Failed to update data item.');
            }
        } catch (error) {
            console.error('Error updating data item:', error);
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
                                    <h2>Edit Data</h2>
                                </Col>
                                <Col className="d-flex justify-content-end">
                                    <Link href={'/admin/shop-landing'}>
                                        <Button variant="danger">Back</Button>
                                    </Link>
                                </Col>
                            </Row>
                            <Form onSubmit={handleSubmit}>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Title</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="title"
                                                value={formData.title}
                                                onChange={handleInputChange}
                                                maxLength={20} // Enforce the limit on input
                                            />
                                            {formErrors.title && (
                                                <p className="text-danger">{formErrors.title}</p>
                                            )}
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Descriptions</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="descriptions"
                                                value={formData.descriptions}
                                                onChange={handleInputChange}
                                                maxLength={230} 
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
                                            <Form.Label>Sub-Title</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="sub_title"
                                                value={formData.sub_title}
                                                onChange={handleInputChange}
                                            />
                                            {formErrors.sub_title && (
                                                <p className="text-danger">{formErrors.sub_title}</p>
                                            )}
                                        </Form.Group>
                                    </Col>
                                 
                                </Row>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Upload Image <small><strong>
                          (Preffered Image 1920×600px and less than 10MB  of  Jpeg,Png type )
                       </strong> </small></Form.Label>
                                            <Form.Control
                                                type="file"
                                                onChange={handleImageUpload}
                                            />
                                            {formErrors.image && (
                                                <p className="text-danger">{formErrors.image}</p>
                                            )}
                                            <div className="mt-3">
                                                {previewImage ? (
                                                    <>
                                                        <p>New Image Preview:</p>
                                                        <img
                                                            src={previewImage}
                                                            alt="New Data Item"
                                                            style={{
                                                                maxWidth: '100%',
                                                                maxHeight: '200px',
                                                                objectFit: 'cover',
                                                            }}
                                                        />
                                                    </>
                                                ) : existingImage ? (
                                                    <>
                                                        <p>Existing Image:</p>
                                                        <img
                                                            src={`${process.env.NEXT_PUBLIC_API_URL}/${existingImage}`}
                                                            alt="Data Item"
                                                            style={{
                                                                maxWidth: '100%',
                                                                maxHeight: '200px',
                                                                objectFit: 'cover',
                                                            }}
                                                        />
                                                    </>
                                                ) : (
                                                    <p>No image available</p>
                                                )}
                                            </div>
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Button type="submit" variant="primary">
                                    Update Data
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}
