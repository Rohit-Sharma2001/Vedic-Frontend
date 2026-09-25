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

export default function EditTalk({ params }) {
  const router = useRouter();
  const talkId = params.editid;

  const [formData, setFormData] = useState({
    id: talkId,
    title: "",
    description: "",
    video_link: "",
    image: null,
  });

  const [existingImage, setExistingImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    if (talkId) fetchTalkDetails();
  }, [talkId]);

  const fetchTalkDetails = async () => {
    try {
      const response = await postApi(config.ViewTalks, { id: talkId });
      if (response.statusCode === 201) {
        const talk = response.result;
        setFormData({
          ...talk,
          image: null,
        });
        setExistingImage(talk.image);
      }
    } catch (error) {
      console.error("Error fetching talk details:", error);
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
      const endpoint = config.UpdateTalks;
      const { image, ...data } = formData;
      const files = {};
      if (image) files.image = image;

      const response = await updateApiWithFile(endpoint, talkId, data, files);
      if (response.statusCode === 201) {
        router.push("/admin/Talks");
      } else {
        alert("Failed to update talk.");
      }
    } catch (error) {
      console.error("Error updating talk:", error);
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
                  <h2>Edit Talk</h2>
                </Col>
                <Col className="d-flex justify-content-end">
                  <Link href="/admin/Talks">
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
                      <Form.Label>Video Link (eg. Youtube,Instagram)</Form.Label>
                      <Form.Control
                        type="text"
                        name="video_link"
                        value={formData.video_link}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>Upload Talk Image</Form.Label>
                      <Form.Control
                        type="file"
                        onChange={handleImageChange}
                      />
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
                  Update Talk
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
