"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Container, Row, Col, Form, Button, Card } from "react-bootstrap";
import Link from "next/link";
import { postApi, updateApiWithFile } from "services/api";
import { config } from "services/config";
import dynamic from "next/dynamic";
import Swal from "sweetalert2";
import "react-quill/dist/quill.snow.css";

// ReactQuill (for description only)
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

export default function EditMembershipPlan({ params }) {
  const router = useRouter();
  const { editid } = params;

const [formData, setFormData] = useState({
  plan_name: "",
  plan_description: "",
  plan_details: [{ title: ""}],
  image: null,
  price: "",
  expiring_in: "",
  tier: "", // 🆕 added
});



  const [existingImage, setExistingImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editid) fetchPlanDetails();
  }, [editid]);

  const fetchPlanDetails = async () => {
    try {
      const res = await postApi(config.ViewMembershipPlan, { id: editid });
      if (res.statusCode === 200 || res.statusCode === 201) {
        const plan = res.result;
setFormData({
  plan_name: plan.plan_name || "",
  plan_description: plan.plan_description || "",
  plan_details:
    plan.plan_details && plan.plan_details.length > 0
      ? plan.plan_details
      : [{ title: ""}],
  image: null,
  price: plan.price || "",
  expiring_in: plan.expiring_in || "",
  tier: plan.tier || "", // 🆕 added
});



        setExistingImage(plan.image);
      }
    } catch (error) {
      console.error("Error fetching plan:", error);
    }
  };

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
    newErrors[`plan_details_title_${i}`] =
      "Title is required for each plan detail.";
  // 🧹 Description is no longer required
});


    if (!formData.tier) newErrors.tier = "Tier selection is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const renderError = (field) =>
    errors[field] && (
      <div style={{ color: "red", fontSize: "0.9em" }}>{errors[field]}</div>
    );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, image: file }));
    setExistingImage(null);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

const data = {
  plan_name: formData.plan_name,
  plan_description: formData.plan_description,
  plan_details: formData.plan_details,
  price: formData.price,
  expiring_in: formData.expiring_in,
  tier: formData.tier, // 🆕 added
};




    const files = {};
    if (formData.image) files.image = formData.image;

    try {
      const res = await updateApiWithFile(
        config.EditMembershipPlan,
        editid,
        data,
        files
      );

      if (res.statusCode === 200) {
        Swal.fire("Success", "Membership plan updated successfully!", "success");
        router.push("/admin/Membership-Management");
      } else {
        Swal.fire("Error", "Failed to update membership plan.", "error");
      }
    } catch (error) {
      Swal.fire("Error", "Something went wrong while updating.", "error");
    } finally {
      setLoading(false);
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
                  <h2>Edit Membership Plan</h2>
                </Col>
                <Col className="d-flex justify-content-end">
                  <Link href={"/admin/Membership-Management"}>
                    <Button variant="danger">Back</Button>
                  </Link>
                </Col>
              </Row>

              <Form onSubmit={handleSubmit}>

                <Row>
                  <Col md={6}>
                     {/* Plan Name */}
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

                   <Col md={6}>
                      {/* Plan Price */}
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
    onWheel={(e) => e.target.blur()} // prevent accidental scroll change
  />
  {renderError("price")}
</Form.Group>



                  </Col>

                  <Col md={6}>
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

<Col md={6}>
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
             

             

                {/* Plan Description */}
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

                {/* Image Upload */}
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
                  {!formData.image && existingImage && (
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL}/${existingImage}`}
                      alt="Existing"
                      style={{
                        marginTop: "10px",
                        width: "150px",
                        borderRadius: "8px",
                      }}
                    />
                  )}
                </Form.Group>

                {/* Plan Details */}
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

                <Button
                  type="submit"
                  variant="primary"
                  className="mt-4"
                  disabled={loading}
                >
                  {loading ? "Updating..." : "Update Membership Plan"}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
