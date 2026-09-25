// app/admin/services/[editid]/EditServiceScreen.jsx
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Container, Row, Col, Form, Button, Card, Alert } from "react-bootstrap";
import Link from "next/link";
import Select from "react-select";
import { postApi, updateApiWithFile } from "services/api";
import { config } from "services/config";

export default function EditServiceScreen({ params }) {
  const router = useRouter();
  const serviceId = params.editid;

  const [employeeData, setEmployeeData] = useState([]);
  const [addons, setAddons] = useState([]);
  const [resources, setResources] = useState([]);
  const [centerOptions, setCenterOptions] = useState([]);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [previewImage, setPreviewImage] = useState("");

  // Single source of truth for user feedback
  const [statusMsg, setStatusMsg] = useState(null); // { kind: "success" | "error", message: string }

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    service_type: "",
    status: 1,
    file: null,
    price: "",
    add_ons: [],
    resource: [],
    live_stream: false,
    mobile_service: false,
    cleanup_time: "",
    centerId: [],
    show_online: "hide",
    employees: [],
  });

  const truncate = (str = "", max = 20) =>
    typeof str === "string" && str.length > max ? `${str.slice(0, max)}...` : str;

  useEffect(() => {
    if (!serviceId) return;
    (async () => {
      await fetchServiceTypes();
      await fetchCenters();
      await fetchServiceDetails();
    })();
  }, [serviceId]);

  const fetchServiceTypes = async () => {
    try {
      const response = await postApi(config.AllServiceTypes, { page: 1, pageSize: 100 });
      setServiceTypes(response.data || []);
    } catch (error) {
      console.error("Failed to fetch service types", error);
    }
  };

  const fetchCenters = async () => {
    try {
      const response = await postApi(config.centers, { page: 1, pageSize: 100 });
      const centers = response?.centers || [];
      setCenterOptions(centers.map((c) => ({ label: c.centerName, value: c._id })));
    } catch (err) {
      console.error("Failed to load centers", err);
    }
  };

  const fetchServiceDetails = async () => {
    try {
      const response = await postApi(config.ViewService, { id: serviceId });
      if (response.statusCode === 200) {
        const s = response.data[0];
        const existingEmployees = s.employees || [];
        setFormData({
          name: s.name || "",
          description: s.description || "",
          price: s.price ?? "",
          service_type:
            typeof s.service_type === "object" ? s.service_type._id : s.service_type || "",
          add_ons: s.add_ons?.map((a) => a._id) || [],
          resource: s.resource?.map((r) => r._id) || [],
          centerId: Array.isArray(s.centerId) ? s.centerId : [],
          live_stream: !!s.live_stream,
          mobile_service: !!s.mobile_service,
          cleanup_time: s.cleanup_time ?? "",
          show_online: s.show_online || "hide",
          status: s.status ?? 1,
          file: null,
          employees: existingEmployees,
        });
        if (s.file) setPreviewImage(`${process.env.NEXT_PUBLIC_API_URL}/${s.file}`);
      }
    } catch (error) {
      console.error("Failed to fetch service details", error);
    }
  };

  const fetchDetailsForAllCenters = async (centerIds) => {
    try {
      const requests = centerIds.map((cid) =>
        postApi(config.getDetailsForServiceCreate, { centerId: cid })
      );
      const results = await Promise.all(requests);

      let allEmployees = [];
      let allAddons = [];
      let allResources = [];

      results.forEach((res) => {
        allEmployees = [...allEmployees, ...(res.result.employeeModel || [])];
        allAddons = [...allAddons, ...(res.result.addOnsModel || [])];
        allResources = [...allResources, ...(res.result.centerResources || [])];
      });

      const uniqueEmployees = Array.from(new Map(allEmployees.map((e) => [e._id, e])).values());
      const uniqueAddons = Array.from(new Map(allAddons.map((a) => [a._id, a])).values());
      const uniqueResources = Array.from(new Map(allResources.map((r) => [r._id, r])).values());

      const existing = formData?.employees || [];
      const mergedEmployees = uniqueEmployees.map((emp) => {
        const matched = existing.find((e) => e._id === emp._id);
        return {
          ...emp,
          enabled: !!matched,
          price: matched ? matched.price : "",
          duration: matched ? matched.duration : "",
          employeeHourlyRate: matched ? matched?.employeeHourlyRate : []
        };
      });

      setEmployeeData(mergedEmployees);
      setAddons(uniqueAddons);
      setResources(uniqueResources);
    } catch (err) {
      console.error("Failed to load multi-center data", err);
    }
  };

  const handleEmployeeChange = (index, field, value) => {
    const updated = [...employeeData];
    if (field === "enabled") {
      updated[index][field] = value;
      if (!value) {
        updated[index].price = "";
        updated[index].duration = "";
      }
    } else {
      updated[index][field] = value;
    }
    setEmployeeData(updated);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : name === "status"
            ? Number(value)
            : value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    setFormData((prev) => ({ ...prev, file }));
    if (file) setPreviewImage(URL.createObjectURL(file));
  };

  // Strict validation incl. per-employee fields
  const validateForm = () => {
    if (!String(formData.name).trim()) return "Service name is required.";
    if (!String(formData.description).trim()) return "Description is required.";
    if (!String(formData.service_type).trim()) return "Service type is required.";
    if (!formData.centerId.length) return "At least one center is required.";

    const servicePriceOk = Number.isFinite(Number(formData.price));
    if (!servicePriceOk) return "Service price is required and must be a number.";

    // Validate enabled employees
    const enabled = employeeData.filter((e) => e.enabled);
    for (const emp of enabled) {
      const p = Number(emp.price);
      const d = Number(emp.duration);
      if (!Number.isFinite(p) || p < 0) {
        return `Price is required for ${emp.name} and must be a non-negative number.`;
      }
      if (!Number.isFinite(d) || d <= 0) {
        return `Duration is required for ${emp.name} and must be greater than 0.`;
      }
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMsg(null); // clear previous

    const validationError = validateForm();
    if (validationError) {
      setStatusMsg({ kind: "error", message: validationError });
      return;
    }

    try {
      const files = {};
      if (formData.file) files.file = formData.file;

      // Coerce numeric fields before submit
      const sanitizedEmployees = employeeData
        .filter((emp) => emp.enabled)
        .map((emp) => ({
          ...emp,
          price: Number(emp.price),
          duration: Number(emp.duration),
          serviceId, // required by backend
        }));

      const payload = {
        ...formData,
        price: Number(formData.price),
        cleanup_time:
          formData.cleanup_time === "" ? "" : Number(formData.cleanup_time),
        employeeData: sanitizedEmployees,
      };
      delete payload.file;

      const response = await updateApiWithFile(
        config.UpdateServices,
        serviceId,
        payload,
        files
      );

      if (response?.statusCode === 200) {
        setStatusMsg({ kind: "success", message: "Service updated successfully!" });
        // Navigate after brief delay so user sees success (why: UX clarity)
        setTimeout(() => router.push("/admin/Services-Management"), 300);
      } else {
        setStatusMsg({
          kind: "error",
          message: response?.message || "Failed to update service.",
        });
      }
    } catch (error) {
      console.error("Error updating service:", error);
      setStatusMsg({
        kind: "error",
        message:
          error?.response?.data?.message ||
          error?.message ||
          "Failed to update service.",
      });
    }
  };

  useEffect(() => {
    if (formData.employees?.length > 0 && formData.centerId.length > 0) {
      fetchDetailsForAllCenters(formData.centerId);
    }
  }, [formData.employees, formData.centerId]);

  return (
    <Container fluid>
      <Row>
        <Col>
          <Card className="p-4 mt-4">
            <Card.Body>
              <Row className="mb-3">
                <Col><h2>Edit Service</h2></Col>
                <Col className="d-flex justify-content-end">
                  <Link href="/admin/Services-Management">
                    <Button variant="danger">Back</Button>
                  </Link>
                </Col>
              </Row>

              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Service Name *</Form.Label>
                      <Form.Control type="text" name="name" value={formData.name} onChange={handleInputChange} />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Price *</Form.Label>
                      <Form.Control type="number" step="0.01" name="price" value={formData.price} onChange={handleInputChange} />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Type *</Form.Label>
                      <Form.Select name="service_type" value={formData.service_type} onChange={handleInputChange}>
                        <option value="">-- Select Service Type --</option>
                        {serviceTypes.map((type) => (
                          <option key={type._id} value={type._id} title={type.name}>
                            {truncate(type.name, 20)}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Centers *</Form.Label>
                      <Select
                        isMulti
                        name="centerId"
                        options={centerOptions}
                        value={formData.centerId
                          .map((id) => {
                            const match = centerOptions.find((c) => c.value === id);
                            return match ? { value: match.value, label: match.label } : null;
                          })
                          .filter(Boolean)}
                        onChange={(selected) =>
                          setFormData((prev) => ({
                            ...prev,
                            centerId: selected ? selected.map((s) => s.value) : [],
                          }))
                        }
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Status</Form.Label>
                      <Form.Control as="select" name="status" value={formData.status} onChange={handleInputChange}>
                        <option value={1}>Active</option>
                        <option value={0}>Inactive</option>
                      </Form.Control>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Add-ons</Form.Label>
                      <Select
                        isMulti
                        name="add_ons"
                        options={addons.map((addon) => ({
                          value: addon._id,
                          label: `${addon.name} | Duration: ${addon.duration} | $${addon.price} | Note: ${addon.note}`,
                        }))}
                        value={formData.add_ons
                          .map((id) => {
                            const matched = addons.find((a) => a._id === id);
                            return matched
                              ? { value: matched._id, label: `${matched.name} | Duration: ${matched.duration} | $${matched.price} | Note: ${matched.note}` }
                              : null;
                          })
                          .filter(Boolean)}
                        onChange={(selected) =>
                          setFormData((prev) => ({
                            ...prev,
                            add_ons: selected.map((s) => s.value),
                          }))
                        }
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Resources</Form.Label>
                      <Select
                        isMulti
                        name="resource"
                        options={resources.map((res) => ({ value: res._id, label: res.name }))}
                        value={formData.resource
                          .map((id) => {
                            const match = resources.find((r) => r._id === id);
                            return match ? { value: match._id, label: match.name } : null;
                          })
                          .filter(Boolean)}
                        onChange={(selected) =>
                          setFormData((prev) => ({
                            ...prev,
                            resource: selected.map((s) => s.value),
                          }))
                        }
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Cleanup Time (minutes)</Form.Label>
                      <Form.Control
                        type="number"
                        min="0"
                        name="cleanup_time"
                        value={formData.cleanup_time}
                        onChange={handleInputChange}
                        placeholder="Enter cleanup time"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Description *</Form.Label>
                  <Form.Control as="textarea" rows={3} name="description" value={formData.description} onChange={handleInputChange} />
                </Form.Group>

                <Card className="mt-4 mb-4">
                  <Card.Body>
                    <h5>Performed By</h5>
                    <div className="table-responsive">
                      <table className="table table-bordered">
                        <thead className="table-light">
                          <tr>
                            {/* <th>#</th> */}
                            <th>Performed By</th>
                            <th>Price ($/hr)</th>
                            <th>Duration (min)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {employeeData.map((emp) => (
                            <tr key={emp._id || emp.name}>
                              {/* <td /> */}
                              <td>
                                <Form.Check
                                  type="switch"
                                  label={emp.name}
                                  checked={!!emp.enabled}
                                  onChange={(e) => handleEmployeeChange(
                                    employeeData.findIndex((x) => (x._id || x.name) === (emp._id || emp.name)),
                                    "enabled",
                                    e.target.checked
                                  )}
                                />                            
                                <span style={{ fontSize: "12px", color: "#777", fontWeight: "400", }}>{emp?.employeeHourlyRate.length > 0 ? `Hourly Rate ($) : ${emp.employeeHourlyRate.find((r) => String(r.serviceId) === String(serviceId))?.hourlyRate}` : ""}</span>
                              </td>
                              <td>
                                <Form.Control
                                  type="number"
                                  name="price"
                                  value={emp.price}
                                  onChange={(e) =>
                                    handleEmployeeChange(
                                      employeeData.findIndex((x) => (x._id || x.name) === (emp._id || emp.name)),
                                      "price",
                                      e.target.value
                                    )
                                  }
                                  disabled={!emp.enabled}
                                />
                              </td>
                              <td>
                                <Form.Control
                                  type="number"
                                  name="duration"
                                  value={emp.duration}
                                  onChange={(e) =>
                                    handleEmployeeChange(
                                      employeeData.findIndex((x) => (x._id || x.name) === (emp._id || emp.name)),
                                      "duration",
                                      e.target.value
                                    )
                                  }
                                  disabled={!emp.enabled}
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card.Body>
                </Card>

                <Button type="submit" variant="primary">Update Service</Button>

                {/* Single, authoritative message block */}
                {statusMsg && (
                  <Alert className="mt-3" variant={statusMsg.kind === "success" ? "success" : "danger"}>
                    {statusMsg.message}
                  </Alert>
                )}
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
