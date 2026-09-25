"use client";

import { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Card } from "react-bootstrap";
import { config } from "services/config";
import { postApi, postApiWithFile,updateApiWithFile } from "services/api";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function EditTeamMember({ params }) {
  const router = useRouter();
  const editid = params.editid;

  const [formData, setFormData] = useState({
    _id: "",
    name: "",
    experties: "", // keep same as Add functionality
    description: "",
    image: null,
  });

  const [errors, setErrors] = useState({});
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    if (editid) fetchTeamMemberDetails();
  }, [editid]);

  const fetchTeamMemberDetails = async () => {
    try {
      const endpoint = config.ViewTeamMember;
      const data = { id: editid };
      const response = await postApi(endpoint, data);
console.log("response",response)
      const member = response?.result || response; // depends on API response shape
      setFormData({
  _id: member._id || "",
  name: member.name || "",
  experties: member.experties || "",
  description: member.description || "",
  image: member.image || null, // ✅ keep existing image path
});


     setPreviewImage(member.imageUrl);
    } catch (error) {
      console.error("Error fetching member details:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required.";
    if (!formData.experties.trim()) newErrors.experties = "Expertise is required.";
    if (!formData.description.trim()) newErrors.description = "Description is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const endpoint = config.UpdateTeamMember;

      const data = {
      
        name: formData.name,
        experties: formData.experties,
        description: formData.description,
      };

const files =
  formData.image && formData.image instanceof File
    ? { file: formData.image }
    : {};

    //   const response = await postApiWithFile(endpoint, data, files);
 const response =  await updateApiWithFile(
      config.UpdateTeamMember,
      formData._id,
      data,
      files
    );
      if (response.statusCode === 200 || response.statusCode === 201) {
        router.push("/admin/cms/Family");
      } else {
        alert("Failed to update team member!");
      }
    } catch (error) {
      console.error("Error updating member:", error);
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
                  <h2>Edit Team Member</h2>
                </Col>
                <Col className="d-flex justify-content-end">
                  <Link href={"/admin/cms/Family"}>
                    <Button variant="danger">Back</Button>
                  </Link>
                </Col>
              </Row>
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        Name <b style={{ color: "red" }}>*</b>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                      />
                      {errors.name && <div className="text-danger">{errors.name}</div>}
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        Expertise <b style={{ color: "red" }}>*</b>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="experties"
                        value={formData.experties}
                        onChange={handleInputChange}
                      />
                      {errors.experties && (
                        <div className="text-danger">{errors.experties}</div>
                      )}
                    </Form.Group>
                  </Col>

                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        Description <b style={{ color: "red" }}>*</b>
                      </Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                      />
                      {errors.description && (
                        <div className="text-danger">{errors.description}</div>
                      )}
                    </Form.Group>
                  </Col>

                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>Upload Image</Form.Label>
                      <Form.Control type="file" onChange={handleImageUpload} />
                      {previewImage && (
                        <img
                          src={previewImage}
                          alt="Preview"
                          width="100"
                          className="mt-2"
                        />
                      )}
                    </Form.Group>
                  </Col>
                </Row>
                <Button type="submit" variant="primary">
                  Update Member
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
