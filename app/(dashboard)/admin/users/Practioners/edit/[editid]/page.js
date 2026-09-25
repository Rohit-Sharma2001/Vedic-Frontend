// src/app/admin/users/Practioners/EditPractitioner.js
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Container, Row, Col, Form, Button, Card, Table } from "react-bootstrap";
import Link from "next/link";
import Select from "react-select";
import { config } from "services/config";
import { postApi, updateApiWithFile } from "services/api";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

export default function EditPractitioner({ params }) {
  const router = useRouter();
  const employeeId = params.editid;

  

  const [centersList, setCentersList] = useState([]);
  const [servicesList, setServicesList] = useState([]);
  const [payrollData, setPayrollData] = useState([]);
  const [errors, setErrors] = useState({});
const [previewImage, setPreviewImage] = useState({
  filePreview: null,
  from: "",  // "api" | "pc"
});

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
  });

  useEffect(() => {
    fetchCenters();
  }, []);

  useEffect(() => {
    if (employeeId) {
      fetchEmployeeDetails();
    }
  }, [employeeId]);

  useEffect(() => {
    if (formData.centerId.length > 0) {
      fetchAllServices();
      
    } else {
      setServicesList([]);
    }
  }, [formData.centerId]);

  // useEffect(() => {
  //   const updatedPayroll = formData.services.map((serviceId) => {
  //     const existing = payrollData.find((p) => {p.serviceId === serviceId});
      
  //     return existing || { serviceId, hourlyRate: "" };
  //   });
  //   console.log(updatedPayroll,"updatedPayroll")
  //   setPayrollData(updatedPayroll);
  // }, [formData.services]);

//   useEffect(() => {
//   if (!formData.services.length) {
//     setPayrollData([]);
//     return;
//   }

//   setPayrollData((prev) =>
//     formData.services.map((serviceId) => {
//       const existing = prev.find(
//         (p) => p.serviceId === serviceId
//       );

//       return existing || { serviceId, hourlyRate: "" };
//     })
//   );
// }, [formData.services]);

useEffect(() => {
  if (!formData.services.length) return;

  setPayrollData((prev) => {
    const updated = [...prev];

    formData.services.forEach((serviceId) => {
      const exists = updated.find((p) => p.serviceId === serviceId);

      if (!exists) {
        updated.push({ serviceId, hourlyRate: "" });
      }
    });

    // remove services that are no longer selected
    return updated.filter((p) =>
      formData.services.includes(p.serviceId)
    );
  });
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
      const payload = {
        page: 1,
        pageSize: 100,
        centerId: formData.centerId,
      };
      const response = await postApi(config.AllServices, payload);
      
      setServicesList(
        response?.data?.map((svc) => ({
          label: svc.name,
          value: svc._id,
        })) || []
      );
      const validServiceIds = response?.data?.map((svc) => svc._id) || [];

setFormData((prev) => ({
  ...prev,
  services: prev.services.filter((id) => validServiceIds.includes(id)),
}));

setPayrollData((prev) =>
  prev.filter((item) => validServiceIds.includes(item.serviceId))
);

    } catch (err) {
      console.error("Failed to load services", err);
    }
  };

  useEffect(() => {
  const validIds = servicesList.map((s) => s.value);

  setFormData((prev) => ({
    ...prev,
    services: prev.services.filter((id) => validIds.includes(id)),
  }));

  setPayrollData((prev) =>
    prev.filter((item) => validIds.includes(item.serviceId))
  );
}, [servicesList]);

const fetchEmployeeDetails = async () => {
  try {
    const response = await postApi(config.viewEmployee, employeeId);
    console.log("response",response)
    if (response.statusCode === 201) {
      const emp = response.data.employeeData[0];

      // Step 1: Set basic fields first
      setFormData((prev) => ({
        ...prev,
        name: emp?.user?.name || "",
        email: emp?.user?.email || "",
        number: emp?.user?.mobileNo || "",
        working_days: emp?.working_days || [],
        working_time_start: emp?.working_time_start || "",
        working_time_end: emp?.working_time_end || "",
        skills: emp?.skills || [],
        centerId: emp?.centerId || [],
        status: emp?.is_deleted === 1 ? 0 : 1,
         designation: emp?.designation || "",     // ✅
  expertise: emp?.expertise || "",         // ✅
  description: emp?.description || "",     // ✅
      }));

setPreviewImage({
  filePreview: emp?.userFile || null,
  from: "api",
});


      // Step 2: Set payroll data immediately
      const salaryData =
        emp?.salary?.map((s) => ({
          serviceId: s.serviceId,
          hourlyRate: s.hourlyRate || "",
        })) || [];
      setPayrollData(salaryData);

      // Step 3: Wait for centers → fetch services
      if (emp?.centerId?.length) {
        const serviceResp = await postApi(config.AllServices, {
          page: 1,
          pageSize: 100,
          centerId: emp.centerId,
        });

        const svcList =
          serviceResp?.data?.map((svc) => ({
            label: svc.name,
            value: svc._id,
          })) || [];

        setServicesList(svcList);

        // Step 4: Map existing services correctly
        const existingServices =
          emp?.services?.map((s) => s.serviceId || s) || [];

        setFormData((prev) => ({
          ...prev,
          services: existingServices,
        }));

        const validServiceIds = svcList.map((svc) => svc.value);

setFormData((prev) => ({
  ...prev,
  services: prev.services.filter((id) => validServiceIds.includes(id)),
}));

setPayrollData((prev) =>
  prev.filter((p) => validServiceIds.includes(p.serviceId))
);

      }
    }
  } catch (err) {
    console.error("Failed to fetch employee data", err);
  }
};


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

    if (!formData.name.trim()) newErrors.name = "Name is required.";
    if (!emailRegex.test(formData.email)) newErrors.email = "Enter a valid email address.";
    if (!phoneRegex.test(formData.number)) newErrors.number = "Enter a valid phone number (10–15 digits).";
    if (formData.working_days.length === 0) newErrors.working_days = "Select at least one working day.";
    if (!formData.centerId.length) newErrors.centerId = "Select at least one center.";
    if (!formData.services.length) newErrors.services = "Select at least one service.";
    if (!formData.working_time_start) newErrors.working_time_start = "Start time is required.";
    if (!formData.working_time_end) newErrors.working_time_end = "End time is required.";
if (!formData.designation.trim()) newErrors.designation = "Designation is required.";
if (!formData.expertise.trim()) newErrors.expertise = "Expertise is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewImage({
        filePreview: reader.result,
        from: "pc",
      });
    };
    reader.readAsDataURL(file);

    setFormData((prev) => ({
      ...prev,
      file: file,
    }));
  }
};


// EditPractitioner.js
const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  try {
    const payload = {
      ...formData,
      mobileNo: formData.number,
      _id: employeeId,
      salary: payrollData,
       centerId: formData.centerId,
      // 🔐 always derive services from payrollData to keep consistent
      services: payrollData.map((p) => p.serviceId),
     
       designation: formData.designation,   // ✅
  expertise: formData.expertise,       // ✅
  description: formData.description,   // ✅
    };

    const files = {};
    if (formData.file instanceof File) {
      files.file = formData.file;
    }

    const response = await updateApiWithFile(
      config.updateEmployee,
      employeeId,
      payload,
      files
    );

    if (response.statusCode === 200) {
      router.push("/admin/users/Practioners");
    } else {
      setErrors({ api: response.message || "Failed to update practitioner" });
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
                  <h2>Edit Practitioner</h2>
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

{/* Expertise */}
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

{/* Description (ReactQuill) */}
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
{/* Profile Image Upload */}
<Row>
  <Col md={6}>
    <Form.Group className="mb-3">
  <Form.Label>Profile Image</Form.Label>
  <Form.Control
    type="file"
    accept="image/*"
    onChange={handleFileChange}
  />

  {previewImage.filePreview && (
    <img
  src={
    previewImage.from === "api"
      ? `${process.env.NEXT_PUBLIC_API_URL}/${previewImage.filePreview}`
      : previewImage.filePreview
  }
  style={{
    width: "150px",
    height: "150px",
    objectFit: "cover",
    marginTop:'10px'
  }}
  alt="Profile Preview"
/>

  )}
</Form.Group>

  </Col>
</Row>

 
              
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        Working Days <span className="text-danger">*</span>
                      </Form.Label>
                      <Select
                        isMulti
                        name="working_days"
                        options={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => ({
                          label: d,
                          value: d,
                        }))}
                        value={formData.working_days.map((d) => ({ label: d, value: d }))}
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
                    </Form.Group>
                  </Col>
                </Row>

                {/* Services & Payroll */}
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

                {/* Payroll Table */}
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
                          {payrollData.map((item,index) => {
                            console.log(item.hourlyRate,"item.hourlyRate")
                            const service = servicesList.find((s) => s.value === item.serviceId);
                            return (
                              <tr key={index}>
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
                  Update Practitioner
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
