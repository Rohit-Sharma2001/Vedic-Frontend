"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Container, Row, Col, Form, Button, Card, Table } from "react-bootstrap";
import Link from "next/link";
import { config } from "services/config";
import { postApi,postApiWithFile } from "services/api";
import Select from "react-select";
import dynamic from "next/dynamic";
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";

export default function AddPractitionerScreen() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [centersList, setCentersList] = useState([]);
  const [servicesList, setServicesList] = useState([]);
  const [payrollData, setPayrollData] = useState([]);
  const [errors, setErrors] = useState({});

const [formData, setFormData] = useState({
  name: "",
  email: "",
  number: "",
  salary: "",
  working_days: [],
  working_time_start: "",
  working_time_end: "",
  skills: [],
  services: [],
  centerId: [],
  status: 1,
  designation: "",
  expertise: "",
  description: "",
  file: null, // ✅ new field
   designation: "",         // ✅
  expertise: "",           // ✅
  description: "",         // ✅ (HTML from Quill)
});

const [previewImage, setPreviewImage] = useState(null);





  useEffect(() => {
    fetchAllServices();
    fetchCenters();
  }, []);

  useEffect(() => {
    const selectedServiceIds = formData.services;
    const updatedPayroll = selectedServiceIds.map((serviceId) => {
      const existing = payrollData.find((item) => item.serviceId === serviceId);
      return existing || { serviceId, hourlyRate: "" };
    });
    setPayrollData(updatedPayroll);
  }, [formData.services]);

  const fetchCenters = async () => {
    try {
      const response = await postApi(config.centers, { page: 1, pageSize: 100 });
      const centers = response?.centers || [];
      setCentersList(
        centers.map((center) => ({
          label: center.centerName,
          value: center._id,
        }))
      );
    } catch (err) {
      console.error("Failed to load centers", err);
    }
  };

const fetchAllServices = async () => {
  try {
    // ✅ send all selected centerIds instead of only the first one
    const payload = {
      page: 1,
      pageSize: 100,
      centerId: formData.centerId, // send entire array
    };

    const response = await postApi(config.AllServices, payload);

    setServicesList(
      response?.data?.map((svc) => ({
        label: svc.name,
        value: svc._id,
      })) || []
    );
  } catch (err) {
    console.error("Failed to load services", err);
  }
};


useEffect(() => {
  if (formData.centerId.length > 0) {
    fetchAllServices();
  } else {
    setServicesList([]); // clear services when no center selected
  }
}, [formData.centerId]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleMultiChange = (name, selectedOptions) => {
    setFormData((prev) => ({
      ...prev,
      [name]: selectedOptions.map((opt) => opt.value),
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleFileUpload = (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => setPreviewImage(reader.result);
    reader.readAsDataURL(file);
  }
  setFormData((prev) => ({ ...prev, file: file }));
};


  const handlePayrollChange = (serviceId, value) => {
    setPayrollData((prev) =>
      prev.map((item) =>
        item.serviceId === serviceId ? { ...item, hourlyRate: value } : item
      )
    );
  };

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10,15}$/;
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

    if (!formData.name.trim()) newErrors.name = "Name is required.";
    if (!emailRegex.test(formData.email)) newErrors.email = "Enter a valid email address.";
    if (!phoneRegex.test(formData.number)) newErrors.number = "Enter a valid phone number (10–15 digits).";
    if (!strongPasswordRegex.test(password))
      newErrors.password = "Password must be at least 8 characters with 1 uppercase letter and 1 number.";
    if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match.";
    if (formData.working_days.length === 0) newErrors.working_days = "Select at least one working day.";
    if (!formData.centerId.length) newErrors.centerId = "Select at least one center.";
    if (!formData.services.length) newErrors.services = "Select at least one service.";
    if (!formData.working_time_start) newErrors.working_time_start = "Start time is required.";
    if (!formData.working_time_end) newErrors.working_time_end = "End time is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  try {
    const data = {
      ...formData,
      mobileNo: formData.number,
      password,
      salary: payrollData,
      expertise: formData.expertise,
      description: formData.description,
      designation: formData.designation,
    };

    const files = { file: formData.file }; // ✅ attach image

    const response = await postApiWithFile(config.AddEmployee, data, files); // ✅ updated call

    if (response.statusCode === 201 || response.statusCode === 200) {
      router.push("/admin/users/Practioners");
    } else {
      setErrors({ api: response.message || "Failed to add practitioner" });
    }
  } catch (err) {
    console.error("Submit Error:", err);
    setErrors({ api: "Error submitting form" });
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
                  <h2>Add New Practitioner</h2>
                </Col>
                <Col className="d-flex justify-content-end">
                  <Link href="/admin/users/Practioners">
                    <Button variant="danger">Back</Button>
                  </Link>
                </Col>
              </Row>

              <Form onSubmit={handleSubmit} noValidate>
                {/* Personal Info */}
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        Name <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        isInvalid={!!errors.name}
                      />
                      {errors.name && <div className="text-danger mt-1">{errors.name}</div>}
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        Email <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        isInvalid={!!errors.email}
                      />
                      {errors.email && <div className="text-danger mt-1">{errors.email}</div>}
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        Phone Number <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="tel"
                        name="number"
                        value={formData.number}
                        onChange={handleInputChange}
                        placeholder="Enter 10–15 digit number"
                        isInvalid={!!errors.number}
                      />
                      {errors.number && <div className="text-danger mt-1">{errors.number}</div>}
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        Centers <span className="text-danger">*</span>
                      </Form.Label>
                      <Select
                        isMulti
                        name="centerId"
                        options={centersList}
                        value={centersList.filter((c) => formData.centerId.includes(c.value))}
                        onChange={(opts) => handleMultiChange("centerId", opts)}
                      />
                      {errors.centerId && <div className="text-danger mt-1">{errors.centerId}</div>}
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
  <Col md={6}>
    <Form.Group className="mb-3">
      <Form.Label>
        Designation <span className="text-danger">*</span>
      </Form.Label>
      <Form.Control
        type="text"
        name="designation"
        value={formData.designation}
        onChange={handleInputChange}
        placeholder="Enter practitioner's designation"
        isInvalid={!!errors.designation}
      />
      {errors.designation && <div className="text-danger mt-1">{errors.designation}</div>}
    </Form.Group>
  </Col>
</Row>

                <Row>
  <Col md={6}>
    <Form.Group className="mb-3">
      <Form.Label>
        Expertise <span className="text-danger">*</span>
      </Form.Label>
      <Form.Control
        type="text"
        name="expertise"
        value={formData.expertise}
        onChange={handleInputChange}
        placeholder="Enter practitioner's expertise"
        isInvalid={!!errors.expertise}
      />
      {errors.expertise && <div className="text-danger mt-1">{errors.expertise}</div>}
    </Form.Group>
  </Col>
</Row>



<Row>
  <Col>
    <Form.Group className="mb-3">
      <Form.Label>Description</Form.Label>
      <ReactQuill
        theme="snow"
        value={formData.description}
        onChange={(value) => setFormData((prev) => ({ ...prev, description: value }))}
      />
    </Form.Group>
  </Col>
</Row>

<Row>
  <Col md={6}>
    <Form.Group className="mb-3">
      <Form.Label>Profile Image</Form.Label>
      <Form.Control
        type="file"
        name="file"
        accept="image/*"
        onChange={handleFileUpload}
      />
      {previewImage && (
        <img
          src={previewImage}
          alt="Profile Preview"
          style={{ width: "200px", height: "200px", marginTop: "10px", objectFit: "cover" }}
        />
      )}
    </Form.Group>
  </Col>
</Row>



                {/* Password */}
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        Password <span className="text-danger">*</span>
                      </Form.Label>
                      <div className="d-flex">
                        <Form.Control
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            setErrors((prev) => ({ ...prev, password: "" }));
                          }}
                          placeholder="At least 8 chars, 1 uppercase, 1 number"
                          isInvalid={!!errors.password}
                        />
                        <Button
                          variant="outline-secondary"
                          onClick={() => setShowPassword((prev) => !prev)}
                          className="ms-2"
                        >
                          {showPassword ? "Hide" : "Show"}
                        </Button>
                      </div>
                      {errors.password && <div className="text-danger mt-1">{errors.password}</div>}
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        Confirm Password <span className="text-danger">*</span>
                      </Form.Label>
                      <div className="d-flex">
                        <Form.Control
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            setErrors((prev) => ({ ...prev, confirmPassword: "" }));
                          }}
                          isInvalid={!!errors.confirmPassword}
                        />
                        <Button
                          variant="outline-secondary"
                          onClick={() => setShowConfirmPassword((prev) => !prev)}
                          className="ms-2"
                        >
                          {showConfirmPassword ? "Hide" : "Show"}
                        </Button>
                      </div>
                      {errors.confirmPassword && (
                        <div className="text-danger mt-1">{errors.confirmPassword}</div>
                      )}
                    </Form.Group>
                  </Col>
                </Row>

                {/* Working Schedule */}
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        Working Days <span className="text-danger">*</span>
                      </Form.Label>
                      <Select
                        isMulti
                        name="working_days"
                        options={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => ({
                          label: day,
                          value: day,
                        }))}
                        onChange={(opts) => handleMultiChange("working_days", opts)}
                      />
                      {errors.working_days && <div className="text-danger mt-1">{errors.working_days}</div>}
                    </Form.Group>
                  </Col>

                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        Start Time <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="time"
                        name="working_time_start"
                        value={formData.working_time_start}
                        onChange={handleInputChange}
                        isInvalid={!!errors.working_time_start}
                      />
                      {errors.working_time_start && (
                        <div className="text-danger mt-1">{errors.working_time_start}</div>
                      )}
                    </Form.Group>
                  </Col>

                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        End Time <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="time"
                        name="working_time_end"
                        value={formData.working_time_end}
                        onChange={handleInputChange}
                        isInvalid={!!errors.working_time_end}
                      />
                      {errors.working_time_end && (
                        <div className="text-danger mt-1">{errors.working_time_end}</div>
                      )}
                    </Form.Group>
                  </Col>
                </Row>

                {/* Services & Status */}
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Status</Form.Label>
                      <Form.Select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                      >
                        <option value={1}>Active</option>
                        <option value={0}>Inactive</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        Services <span className="text-danger">*</span>
                      </Form.Label>
                      <Select
                        isMulti
                        name="services"
                        options={servicesList}
                        value={servicesList.filter((svc) =>
                          formData.services.includes(svc.value)
                        )}
                        onChange={(opts) => handleMultiChange("services", opts)}
                      />
                      {errors.services && <div className="text-danger mt-1">{errors.services}</div>}
                    </Form.Group>
                  </Col>
                </Row>

                {/* Payroll */}
                {formData.services.length > 0 && (
                  <Row>
                    <Col>
                      <h5 className="mt-4">Payroll: Hourly Rate per Service</h5>
                      <Table striped bordered hover>
                        <thead>
                          <tr>
                            <th>Service</th>
                            <th>Hourly Rate ($)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {payrollData.map((item) => {
                            const service = servicesList.find((s) => s.value === item.serviceId);
                            return (
                              <tr key={item.serviceId}>
                                <td>{service?.label || "Unknown Service"}</td>
                                <td>
                                  <Form.Control
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={item.hourlyRate}
                                    onChange={(e) =>
                                      handlePayrollChange(item.serviceId, e.target.value)
                                    }
                                    required
                                  />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </Table>
                    </Col>
                  </Row>
                )}

                {errors.api && <div className="text-danger mb-3">{errors.api}</div>}

                <Button variant="primary" type="submit">
                  Add Practitioner
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
