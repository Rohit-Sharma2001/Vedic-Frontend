"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Container, Row, Col, Form, Button, Card } from "react-bootstrap";
import Link from "next/link";
import { postApiWithFile } from "services/api";
import { config } from "services/config";
import dynamic from "next/dynamic";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";

export default function AddYogaClass() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: null,
  });

  const [uploadStatus, setUploadStatus] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDescriptionChange = (value) => {
    setFormData({ ...formData, description: value });
  };

  const handleImageChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  const validateForm = () => {
    if (!formData.title.trim()) return "Title is required";
    if (!formData.description.trim()) return "Description is required";
    if (!formData.image) return "Yoga class image is required";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setUploadStatus(validationError);
      return;
    }

    try {
      const endpoint = config.AddYogaClasses;
      const { image, ...data } = formData;
      const files = { image };

      const response = await postApiWithFile(endpoint, data, files);
      if (response.statusCode === 201) {
        router.push("/admin/Yoga-Classes");
      } else {
        alert("Failed to add yoga class!");
      }
      setUploadStatus("Yoga class added successfully!");
    } catch (error) {
      console.error("Error adding yoga class:", error);
      alert(error.response?.data?.message || "Unknown error");
      setUploadStatus("Failed to add yoga class.");
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
                  <h2>Add New Yoga Class</h2>
                </Col>
                <Col className="d-flex justify-content-end">
                  <Link href="/admin/Yoga-Classes">
                    <Button variant="danger">Back</Button>
                  </Link>
                </Col>
              </Row>
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>Title <span style={{ color: "red" }}>*</span></Form.Label>
                      <Form.Control
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>Description <span style={{ color: "red" }}>*</span></Form.Label>
                      <ReactQuill
                        value={formData.description}
                        onChange={handleDescriptionChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>Upload Yoga Class Image <span style={{ color: "red" }}>*</span></Form.Label>
                      <Form.Control
                        type="file"
                        onChange={handleImageChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Button type="submit" variant="primary">
                  Add Yoga Class
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
