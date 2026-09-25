"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Container, Row, Col, Form, Button, Card } from "react-bootstrap";
import Link from "next/link";
import { config } from "services/config";
import { postApiWithFile, postApi } from "services/api";

export default function AddUser() {
  const router = useRouter();

  const [errors, setErrors] = useState({});
  const [roles, setRoles]= useState([]);
  const [formData, setFormData] = useState({
    roleId: "",
    role: "",
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
  });

    useEffect(()=>{
           fetchRoles()
    },[])

    async function fetchRoles() {
       const response = await postApi(config.roleNameList, { });

            setRoles(response?.data)
    }

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10,15}$/;

    if (!formData.name.trim()) newErrors.name = "Name is required.";
    if (!formData.lastName.trim()) newErrors.lastName = "Last Name is required.";
    if (!emailRegex.test(formData.email)) newErrors.email = "Valid email required.";
    if (!phoneRegex.test(formData.number)) newErrors.number = "Valid phone required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const endpoint = config.createVedicUser; // 🔥 CHANGE HERE

      const data = {
        roleId: formData.roleId,
        role: formData.role,
        name: formData.name,
        lastName: formData.lastName,
        email: formData.email,
        mobileNo: formData.number,
        dob: formData.dob,
        status: formData.status,
        address1: formData.address1,
        address2: formData.address2,
        city: formData.city,
        state: formData.state,
        zipcode: formData.zipcode,
        country: formData.country,
        gender: formData.gender,
        password:"Vedic@123"
      };
console.log(data,"askjbijdbjasbkasdb")
      // const response = await postApiWithFile(endpoint, JSON.stringify(data), {});
              const response = await postApi(endpoint, data);
console.log(response,"responseresponse")
      if (response.statusCode === 200 || response.statusCode === 201) {
        alert("User Created Successfully ✅");

        // reset form
        setFormData({
          roleId: "",
          role: "",
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
        });

        router.push("/admin/role/user"); // redirect
      }
      else{
         alert(response?.message || "Something went wrong");
      }
    } catch (err) {
      console.error(err);
      setErrors({ api: "Error creating user" });
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
                  <h2>Add New User</h2>
                </Col>

                <Col className="d-flex justify-content-end">
                  <Link href="/admin/role/user">
                    <Button variant="danger">Back</Button>
                  </Link>
                </Col>
              </Row>

              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={12}>
                    <Form.Label>Assign Role  <span className="text-danger">*</span></Form.Label>
                    <Form.Select
                      name="roleId"
                      value={formData.roleId}
                      onChange={(e) => {
                        const selectedRole = roles.find(
                          (role) => role._id === e.target.value
                        );

                        setFormData((prev) => ({
                          ...prev,
                          roleId: selectedRole?._id || "",
                          role: selectedRole?.roleName || "",
                        }));
                      }}
                    >
                      <option value="">Select</option>

                      {roles?.map((ele, ind) => {
                        return (
                          <option key={ind + ele?._id} value={ele?._id}>
                            {ele?.roleName}
                          </option>
                        );
                      })}
                    </Form.Select>
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>First Name <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter First Name"
                        isInvalid={!!errors.name}
                      />
                      <div className="text-danger">{errors.name}</div>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Last Name <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Enter Last Name"
                        isInvalid={!!errors.lastName}
                      />
                      <div className="text-danger">{errors.lastName}</div>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Email ID <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Enter Email ID"
                        isInvalid={!!errors.email}
                      />
                      <div className="text-danger">{errors.email}</div>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Phone Number <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        name="number"
                        value={formData.number}
                        onChange={handleInputChange}
                        placeholder="Enter Phone Number"
                        isInvalid={!!errors.number}
                      />
                      <div className="text-danger">{errors.number}</div>
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>DOB</Form.Label>
                      <Form.Control
                        type="date"
                        name="dob"
                        value={formData.dob}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Gender</Form.Label>
                      <Form.Select
                        name="gender"
                        value={formData.gender}
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


                {errors.api && <div className="text-danger">{errors.api}</div>}

                <Button type="submit" >Create User</Button> {/* 🔥 CHANGED */}

              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}