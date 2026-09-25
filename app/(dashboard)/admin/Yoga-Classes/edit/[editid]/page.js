"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Container, Row, Col, Form, Button, Card } from "react-bootstrap";
import Link from "next/link";
import { postApi, updateApiWithFile } from "services/api";
import { config } from "services/config";
import dynamic from "next/dynamic";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";

export default function EditYogaClass({ params }) {
  const router = useRouter();
  const editid = params.editid;

  const [formData, setFormData] = useState({
    id: editid,
    title: "",
    description: "",
    image: null,
  });

  const [existingImage, setExistingImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    if (editid) fetchClassDetails();
  }, [editid]);

  const fetchClassDetails = async () => {
    try {
      const response = await postApi(config.ViewYogaClasses, { id: editid });
      if (response.statusCode === 201) {
        const data = response.result;
        setFormData({
          id: editid,
          title: data.title || "",
          description: data.description || "",
          image: null,
        });
        setExistingImage(data.image);
      }
    } catch (error) {
      console.error("Error fetching yoga class details:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDescriptionChange = (value) => {
    setFormData((prev) => ({ ...prev, description: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({ ...prev, image: file }));
    setPreviewImage(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { image, ...data } = formData;
      const files = {};
      if (image) files.image = image;

      const response = await updateApiWithFile(
        config.UpdateYogaClasses,
        editid,
        data,
        files
      );

      if (response.statusCode === 201) {
        router.push("/admin/Yoga-Classes");
      } else {
        alert("Failed to update yoga class.");
      }
    } catch (error) {
      console.error("Error updating yoga class:", error);
      alert(error.response?.data?.message || "Unknown error");
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
                  <h2>Edit Yoga Class</h2>
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
                      <Form.Label>Title</Form.Label>
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
                      <Form.Label>Description</Form.Label>
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
                      <Form.Label>Upload Image</Form.Label>
                      <Form.Control type="file" onChange={handleImageChange} />
                      <div className="mt-3">
                        {previewImage ? (
                          <img
                            src={previewImage}
                            alt="Preview"
                            style={{ maxHeight: "200px", objectFit: "cover" }}
                          />
                        ) : existingImage ? (
                          <img
                            src={`${process.env.NEXT_PUBLIC_API_URL}/${existingImage}`}
                            alt="Existing"
                            style={{ maxHeight: "200px", objectFit: "cover" }}
                          />
                        ) : (
                          <p>No image available</p>
                        )}
                      </div>
                    </Form.Group>
                  </Col>
                </Row>

                <Button type="submit" variant="primary">
                  Update Yoga Class
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
