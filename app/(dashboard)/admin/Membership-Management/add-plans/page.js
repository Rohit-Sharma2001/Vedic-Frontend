"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Container, Row, Col, Form, Button, Card } from "react-bootstrap";
import Link from "next/link";
import { postApiWithFile } from "services/api";
import { config } from "services/config";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

export default function AddMembershipPlan() {
  const router = useRouter();

const [formData, setFormData] = useState({
  plan_name: "",
  plan_description: "",
  plan_details: [{ title: "" }],
  image: null,
  price: "",
  expiring_in: "",
  tier: "", // 🆕 added
});


  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.plan_name.trim())
      newErrors.plan_name = "Plan name is required.";

    if (!formData.price || isNaN(formData.price) || formData.price <= 0)
      newErrors.price = "Valid plan price is required.";

    if (
      !formData.expiring_in ||
      isNaN(formData.expiring_in) ||
      parseInt(formData.expiring_in) <= 0
    )
      newErrors.expiring_in = "Valid expiration days are required.";

  formData.plan_details.forEach((detail, i) => {
  if (!detail.title.trim())
    newErrors[`plan_details_title_${i}`] = "Title is required for each plan detail.";
  // 🧹 description no longer required
});

if (!formData.tier) newErrors.tier = "Tier selection is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, image: file }));
  };

  const handlePlanDetailChange = (index, field, value) => {
    const updatedDetails = [...formData.plan_details];
    updatedDetails[index][field] = value;
    setFormData({ ...formData, plan_details: updatedDetails });
  };

  const addPlanDetail = () => {
    setFormData({
      ...formData,
      plan_details: [...formData.plan_details, { title: ""}],
    });
  };

  const removePlanDetail = (index) => {
    const updated = formData.plan_details.filter((_, i) => i !== index);
    setFormData({ ...formData, plan_details: updated });
  };

  const renderError = (field) =>
    errors[field] && (
      <div style={{ color: "red", fontSize: "0.9em" }}>{errors[field]}</div>
    );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const data = { ...formData };
    delete data.image;

    const files = {};
    if (formData.image) files.image = formData.image;

    try {
      const res = await postApiWithFile(config.addMembershipPlan, data, files);
      if (res.statusCode === 201 || res.statusCode === 200) {
        alert("Membership plan added successfully!");
        router.push("/admin/Membership-Management");
      }
    } catch (error) {
      alert(error?.response?.data?.message || "Error adding membership plan.");
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
                  <h2>Add New Membership Plan</h2>
                </Col>
                <Col className="d-flex justify-content-end">
                  <Link href={"/admin/Membership-Management"}>
                    <Button variant="danger">Back</Button>
                  </Link>
                </Col>
              </Row>

              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Plan Name *</Form.Label>
                      <Form.Control
                        name="plan_name"
                        value={formData.plan_name}
                        onChange={handleInputChange}
                        placeholder="Enter plan name"
                      />
                      {renderError("plan_name")}
                    </Form.Group>
                  </Col>

                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Plan Price *</Form.Label>
                      <Form.Control
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        placeholder="Enter plan price"
                        min="0"
                        step="0.01"
                        onWheel={(e) => e.target.blur()}
                      />
                      {renderError("price")}
                    </Form.Group>
                  </Col>

                  <Col md={4}>
                    {/* 🆕 Expiring In Field */}
                    <Form.Group className="mb-3">
                      <Form.Label>Expiring In (Days) *</Form.Label>
                      <Form.Control
                        type="number"
                        name="expiring_in"
                        value={formData.expiring_in}
                        onChange={handleInputChange}
                        placeholder="Enter number of days until expiration"
                        min="1"
                        step="1"
                        onWheel={(e) => e.target.blur()}
                      />
                      {renderError("expiring_in")}
                    </Form.Group>
                  </Col>

                  <Col md={4}>
  <Form.Group className="mb-3">
    <Form.Label>Tier *</Form.Label>
    <Form.Select
      name="tier"
      value={formData.tier}
      onChange={handleInputChange}
    >
      <option value="">Select Tier</option>
      <option value="1">1</option>
      <option value="2">2</option>
      <option value="3">3</option>
    </Form.Select>
    {renderError("tier")}
  </Form.Group>
</Col>

                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Plan Description</Form.Label>
                  <ReactQuill
                    theme="snow"
                    value={formData.plan_description}
                    onChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        plan_description: value,
                      }))
                    }
                    placeholder="Enter plan description"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>
                    Upload Plan Image <small>(optional)</small>
                  </Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  {formData.image && (
                    <img
                      src={URL.createObjectURL(formData.image)}
                      alt="Preview"
                      style={{
                        marginTop: "10px",
                        width: "150px",
                        borderRadius: "8px",
                      }}
                    />
                  )}
                </Form.Group>

                <div className="mt-4">
                  <h5>Plan Details</h5>
                  {formData.plan_details.map((detail, index) => (
                    <Card key={index} className="p-3 mt-3">
                      <Row>
                        <Col md={5}>
                          <Form.Group>
                            <Form.Label>Detail Title *</Form.Label>
                            <Form.Control
                              type="text"
                              value={detail.title}
                              onChange={(e) =>
                                handlePlanDetailChange(
                                  index,
                                  "title",
                                  e.target.value
                                )
                              }
                              placeholder="Enter title"
                            />
                            {renderError(`plan_details_title_${index}`)}
                          </Form.Group>
                        </Col>
                        {/* <Col md={5}>
                          <Form.Group>
                            <Form.Label>Detail Description *</Form.Label>
                            <Form.Control
                              type="text"
                              value={detail.description}
                              onChange={(e) =>
                                handlePlanDetailChange(
                                  index,
                                  "description",
                                  e.target.value
                                )
                              }
                              placeholder="Enter description"
                            />
                            {renderError(`plan_details_desc_${index}`)}
                          </Form.Group>
                        </Col> */}
                        <Col md={2} className="d-flex align-items-end">
                          {formData.plan_details.length > 1 && (
                            <Button
                              variant="danger"
                              onClick={() => removePlanDetail(index)}
                            >
                              Remove
                            </Button>
                          )}
                        </Col>
                      </Row>
                    </Card>
                  ))}
                  <Button
                    className="mt-3"
                    variant="secondary"
                    onClick={addPlanDetail}
                  >
                    + Add More Details
                  </Button>
                </div>

                <Button type="submit" variant="primary" className="mt-4">
                  Add Membership Plan
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
