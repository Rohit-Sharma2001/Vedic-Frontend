// app/admin/Master/sub-category/AddSubCategory.js

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Card,
  Image,
} from "react-bootstrap";
import Link from "next/link";
import { postApiWithFile, postApi } from "services/api";
import { config } from "services/config";

export default function AddSubCategory() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    dropdown_type: "sub_category",
    category: "",
    subcategoryImage: null,
    subcategoryIcon: null,
  });

  const [categories, setCategories] = useState([]);
  const [previewImages, setPreviewImages] = useState({
    subcategoryImagePreview: null,
    subcategoryIconPreview: null,
  });

  useEffect(() => {
    const fetchCategories = async () => {
      const data = { page: 1, pageSize: 1000, dropdown_type: "category" };
      try {
        const response = await postApi(config.category, data);
        if (response && response.result) {
          setCategories(response.result);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileUpload = (e) => {
    const { name, files } = e.target;
    const file = files[0];
    if (file) {
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setPreviewImages((prev) => ({
          ...prev,
          [`${name}Preview`]: fileReader.result,
        }));
      };
      fileReader.readAsDataURL(file);
    }
    setFormData((prev) => ({
      ...prev,
      [name]: file,
    }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      dropdown_type: "sub_category",
      category: "",
      subcategoryImage: null,
      subcategoryIcon: null,
    });
    setPreviewImages({
      subcategoryImagePreview: null,
      subcategoryIconPreview: null,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = config.Addcategory;
      const files = {
        file: formData.subcategoryImage,
        icon_file: formData.subcategoryIcon,
      };
      const data = {
        name: formData.name,
        description: formData.description,
        dropdown_type: formData.dropdown_type,
        category_id: formData.category,
      };
      const response = await postApiWithFile(endpoint, data, files);
      if (response && response.statusCode === 201) {
        resetForm();
        router.push("/admin/Master/sub-category");
      } else {
        alert("Failed to add subcategory!");
      }
    } catch (error) {
      console.error("Error submitting subcategory:", error);
      alert(error.response.data.message)
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
                  <h2>Add New Subcategory</h2>
                </Col>
                <Col className="d-flex justify-content-end">
                  <Link href={"/admin/Master/sub-category"}>
                    <Button variant="danger">Back</Button>
                  </Link>
                </Col>
              </Row>
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        Subcategory Name <span style={{ color: "red" }}>*</span>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        Subcategory Description{" "}
                        <span style={{ color: "red" }}>*</span>
                      </Form.Label>
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
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        Select Category <span style={{ color: "red" }}>*</span>
                      </Form.Label>
                      <Form.Control
                        as="select"
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">-- Select Category --</option>
                        {categories.map((category) => (
                          <option key={category._id} value={category._id}>
                            {category.name}
                          </option>
                        ))}
                      </Form.Control>
                    </Form.Group>
                  </Col>
                </Row>

                {/* <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        Subcategory Image{" "}
                        <span style={{ color: "red" }}>*</span>
                      </Form.Label>
                      <Form.Control
                        type="file"
                        name="subcategoryImage"
                        onChange={handleFileUpload}
                        required
                      />

                      {previewImages.subcategoryImagePreview && (
                        <img
                          src={previewImages.subcategoryImagePreview}
                          style={{ height: "300px", width: "300px" }}
                          alt="Subcategory Image Preview"
                          fluid
                          className="mt-3"
                        />
                      )}
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        Subcategory Icon <span style={{ color: "red" }}>*</span>
                      </Form.Label>
                      <Form.Control
                        type="file"
                        name="subcategoryIcon"
                        onChange={handleFileUpload}
                        // required
                      />

                      {previewImages.subcategoryIconPreview && (
                        <img
                          src={previewImages.subcategoryIconPreview}
                          style={{ height: "300px", width: "300px" }}
                          alt="Subcategory Icon Preview"
                          fluid
                          className="mt-3"
                        />
                      )}
                    </Form.Group>
                  </Col>
                </Row> */}

                <Button type="submit" variant="primary">
                  Add Subcategory
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
