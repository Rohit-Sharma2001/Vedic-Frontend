// src/app/admin/users/Practioners/EditPractitioner.js
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Container, Row, Col, Form, Button, Card, Table, Spinner } from "react-bootstrap";
import Link from "next/link";
import Select from "react-select";
import { config } from "services/config";
import { postApi, updateApiWithFile } from "services/api";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";
import { postApiWithFile } from "services/api";
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

export default function EditPractitioner({ params }) {
  const router = useRouter();
  const employeeId = params.editid;



  const [centersList, setCentersList] = useState([]);
  const [servicesList, setServicesList] = useState([]);
  const [payrollData, setPayrollData] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [existingImage, setExistingImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const isDefaultProfileImage = !previewImage && !existingImage;
  const [editMode, setEditMode] = useState(false)
  // const [previewImage, setPreviewImage] = useState({
  //   filePreview: null,
  //   from: "",  // "api" | "pc"
  // });

  const styles = {
    overlay: {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(255, 255, 255, 0.6)", // light blur effect
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 9999,
    },
  };
  const [formData, setFormData] = useState({
    name: "",
    lastName: "",
    email: "",
    number: "",
    dob: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    gender: "",
    status: 1,
    image: ""
  });

  useEffect(() => {
    fetchCenters();
  }, []);

  useEffect(() => {
    if (employeeId) {
      fetchEmployeeDetails();
    }
  }, [employeeId]);

  // useEffect(() => {
  //   if (formData.centerId.length > 0) {
  //     fetchAllServices();

  //   } else {
  //     setServicesList([]);
  //   }
  // }, [formData.centerId]);

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

  //   useEffect(() => {
  //   const validIds = servicesList.map((s) => s.value);

  //   setFormData((prev) => ({
  //     ...prev,
  //     services: prev.services.filter((id) => validIds.includes(id)),
  //   }));

  //   setPayrollData((prev) =>
  //     prev.filter((item) => validIds.includes(item.serviceId))
  //   );
  // }, [servicesList]);

  const fetchEmployeeDetails = async () => {
    console.log("responsecccc iisme aaya c")

    try {
      const response = await postApi(config.viewUser, { _id: employeeId });
      console.log("responseccccc", response)
      if (response.statusCode === 201 || response.statusCode === 200) {
        const emp = response.data[0];

        console.log("empempempempemp", emp)


        // Step 1: Set basic fields first
        setFormData((prev) => ({
          ...prev,
          name: emp?.name || "",
          lastName: emp?.lastName || "",
          email: emp?.email || "",
          number: emp?.mobileNo || "",
          status: emp?.status,
          dob: emp?.dob,
          address1: emp?.address1,
          address2: emp?.address2,
          city: emp?.city,
          state: emp?.state,
          zipcode: emp?.zipcode,
          country: emp?.country,
          gender: emp?.gender,
          status: emp?.status,
        }));

        // setPreviewImage({
        //   filePreview: emp?.userFile || null,
        //   from: "api",
        // });
        setExistingImage(emp?.image || null);


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
    if (!formData.lastName.trim()) newErrors.lastName = "Last Name is required.";
    if (!emailRegex.test(formData.email)) newErrors.email = "Enter a valid email address.";
    // if (!phoneRegex.test(formData.number)) newErrors.number = "Enter a valid phone number (10–15 digits).";

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
  const handleProfileImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProfileImage(file);
    setPreviewImage(URL.createObjectURL(file));
  };

  // EditPractitioner.js
  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();
    if (!validateForm()) return;

    try {
      //  setLoader(true)
      const endpoint = config.updateProfile;
      const data = {
        user_id: employeeId,

        name: formData.name,
        lastName: formData.lastName,

        dob: formData.dob,
        email: formData.email,
        mobileNo: formData.mobileNo,
        status: formData.status,
        address1: formData.address1,
        address2: formData.address2,
        city: formData.city,
        state: formData.state,
        zipcode: formData.zipcode,
        country: formData.country,
        gender: formData.gender,
        // image:formData.image
      };

      const files = {};
      if (profileImage) files.image = profileImage;
      // console.log(userData?._id)
      const response = await postApiWithFile(endpoint, data, files);
      //  setLoader(false)
      if (response.statusCode == 200 || response.statusCode == 201) {
        setFormData((prev) => ({ ...prev, ...response.data }));
        router.push('/admin/users');
        router.refresh();
        setLoading(false);
        // setUserData(response.data);
        setExistingImage(response.data?.image || existingImage);
        setPreviewImage(null);
        // setProfileImage(null);
      }
      else {
        setLoading(false);
      }
    } catch (err) {
      setLoading(false);
      console.error("Submit Error:", err);
      setErrors({ api: "Error submitting form" });
    }
  };



  return (
    <Container fluid>
      {loading && (
        <div style={styles.overlay}>
          <Spinner animation="border" variant="primary" />
        </div>
      )}
      <Row>
        <Col>
          <Card className="p-4 mt-4">
            <Card.Body>
              <Row className="mb-3">
                <Col>
                  <h2>Edit User</h2>
                </Col>
                <Col className="d-flex justify-content-end">
                  <Link href="/admin/users">
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
                        First Name <span className="text-danger">*</span>
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
                        Last Name <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        isInvalid={!!errors.lastName}
                      />
                      {errors.lastName && <div className="text-danger mt-1">{errors.lastName}</div>}
                    </Form.Group>
                  </Col>


                </Row>

                <Row>
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
                        disabled
                      />
                      {errors.email && <div className="text-danger mt-1">{errors.email}</div>}
                    </Form.Group>
                  </Col>
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
                        disabled
                      />
                      {errors.number && <div className="text-danger mt-1">{errors.number}</div>}
                    </Form.Group>
                  </Col>

                  {/* <Col md={6}>
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
                  </Col> */}
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        DOB
                      </Form.Label>
                      <Form.Control
                        type="Date"
                        name="dob"
                        value={formData?.dob}
                        onChange={handleInputChange}
                        placeholder="DOB"
                        isInvalid={!!errors.dob}
                      />
                      {errors.designation && <div className="text-danger mt-1">{errors.dob}</div>}
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        Gender
                      </Form.Label>
                      <Form.Select
                        name="gender"
                        className="form-control"
                        value={formData.gender || ''}
                        // disabled={!editMode}
                        onChange={handleInputChange}
                      >
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                {/* address */}
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        Address 1
                      </Form.Label>
                      <Form.Control
                        name="address1"
                        value={formData.address1 || ''}
                        type="text"
                        onChange={handleInputChange}
                        placeholder="Enter User Address 1"
                        isInvalid={!!errors.address1}
                      />
                      {errors.address1 && <div className="text-danger mt-1">{errors.address1}</div>}
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        Address 2
                      </Form.Label>
                      <Form.Control
                        name="address2"
                        value={formData.address2 || ''}
                        type="text"
                        onChange={handleInputChange}
                        placeholder="Enter User Address 2"
                        isInvalid={!!errors.address2}
                      />
                      {errors.address2 && <div className="text-danger mt-1">{errors.address2}</div>}
                    </Form.Group>
                  </Col>
                </Row>
                {/* City State */}
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        City
                      </Form.Label>
                      <Form.Control
                        name="city"
                        value={formData.city || ''}
                        type="text"
                        onChange={handleInputChange}
                        placeholder="Enter User Address 1"
                        isInvalid={!!errors.city}
                      />
                      {errors.city && <div className="text-danger mt-1">{errors.city}</div>}
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        State
                      </Form.Label>
                      <Form.Control
                        name="state"
                        value={formData.state || ''}
                        type="text"
                        onChange={handleInputChange}
                        placeholder="Enter User State"
                        isInvalid={!!errors.address2}
                      />
                      {errors.state && <div className="text-danger mt-1">{errors.state}</div>}
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        Country
                      </Form.Label>
                      <Form.Control
                        name="country"
                        value={formData.country || ''}
                        type="text"
                        onChange={handleInputChange}
                        placeholder="Enter User Country"
                        isInvalid={!!errors.country}
                      />
                      {errors.country && <div className="text-danger mt-1">{errors.country}</div>}
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        Zipcode
                      </Form.Label>
                      <Form.Control
                        name="zipcode"
                        value={formData.zipcode || ''}
                        type="text"
                        onChange={handleInputChange}
                        placeholder="Enter User Zipcode"
                        isInvalid={!!errors.zipcode}
                      />
                      {errors.zipcode && <div className="text-danger mt-1">{errors.zipcode}</div>}
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        Profile Image
                      </Form.Label>
                      <figure className="position-relative">
                        <img
                          src={
                            previewImage
                              ? previewImage
                              : existingImage
                                ? `${process.env.NEXT_PUBLIC_API_URL}/${existingImage}`
                                : "/images/landingpage/profile-img.png"
                          }
                          alt="Profile"
                          style={{ objectFit: "cover" }}
                          onClick={ ()=>setEditMode(!editMode) }
                        />

                        <input
                          type="file"
                          className="d-none"
                          id="uploadImg1"
                          accept="image/*"
                          onChange={handleProfileImageChange}
                          disabled={!editMode}
                        />

                        {editMode && (
                          <label htmlFor="uploadImg1" style={{ cursor: "pointer" }}>
                            <div className="d-flex flex-column align-items-center">
                              <img
                                src="/images/landingpage/edit-white-icon.svg"
                                className="pb-2"
                                width="12"
                                alt=""
                              />
                              <b>Click here to change profile Image</b>
                            </div>
                          </label>
                        )}
                      </figure>
                      {/* {!editMode && <button type="button" className="btn btn-primary" onClick={() => { setEditMode(!editMode) }}>
                        Edit Image
                      </button>} */}
                      {/* <Form.Control
                        type="file"
                        // className="d-none"
                        id="uploadImg1"
                        accept="image/*"
                        onChange={handleProfileImageChange}
                        // disabled={!editMode}

                      /> */}
                      {errors.zipcode && <div className="text-danger mt-1">{errors.zipcode}</div>}
                    </Form.Group>
                  </Col>
                </Row>
                {/* Description (ReactQuill) */}
                {/* <Row>
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
</Row> */}
                {/* Profile Image Upload */}
                {/* <Row>
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
</Row> */}



                {/* <Row>
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
                </Row> */}

                {/* Services & Payroll */}
                <Row>
                  {/* <Col md={6}>
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
                  </Col> */}

                  {/* <Col md={6}>
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
                  </Col> */}
                </Row>

                {/* Payroll Table */}
                {/* {formData.services.length > 0 && (
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
                )} */}

                {errors.api && <div className="text-danger mb-3">{errors.api}</div>}

                <Button variant="primary" type="submit">
                  Update User
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
