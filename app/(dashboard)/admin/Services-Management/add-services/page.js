"use client";
import { useState ,useEffect} from "react";
import { useRouter } from "next/navigation";
import { Container, Row, Col, Form, Button, Card } from "react-bootstrap";
import Link from "next/link";
import { postApiWithFile ,postApi} from "services/api";
import { config } from "services/config";
import Select from "react-select";



export default function AddServiceScreen() {
  const router = useRouter();
  // top-level states
const [isSubmitting, setIsSubmitting] = useState(false);
const [empErrors, setEmpErrors] = useState({});
  const [employeeData, setEmployeeData] = useState([
  { name: "Test Data.", enabled: false, price: "", duration: "" },
]);
const [addons, setAddons] = useState([]);
const [resources, setResources] = useState([]);

const [formData, setFormData] = useState({
  name: "",
  description: "",
  service_type: "",
  center: "",
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
});
const [centerOptions, setCenterOptions] = useState([]);


  const [uploadStatus, setUploadStatus] = useState("");
const [serviceTypes, setServiceTypes] = useState([]);


  // keep display tidy; show full text on hover
  const truncate = (str = "", max = 20) =>
    typeof str === "string" && str.length > max ? `${str.slice(0, max)}...` : str;

  // for react-select: truncate in menu & selected chips
  const formatOptionLabel = (option) => (
    <span title={option.label}>{truncate(option.label, 20)}</span>
  );
useEffect(() => {
  const fetchServiceTypes = async () => {
    try {
      const response = await postApi(config.AllServiceTypes, { page: 1, pageSize: 100 });
      setServiceTypes(response.data || []);
    
    } catch (error) {
      console.error("Failed to fetch service types", error);
    }
  };

  fetchServiceTypes();
  fetchDetailsForServiceCreate()
   fetchCenters(); 
}, []);
const fetchCenters = async () => {
  try {
    const response = await postApi(config.centers, { page: 1, pageSize: 100 });
    const centers = response?.centers || []; 
    setCenterOptions(
      centers.map((center) => ({
        label: center.centerName,
        value: center._id,
      }))
    );
  } catch (err) {
    console.error("Failed to load centers", err);
  }
};
const fetchDetailsForServiceCreate = async (centerId) => {
  try {
    const response = await postApi(config.getDetailsForServiceCreate, {
      centerId: centerId,
    });

    setAddons(response.result.addOnsModel);
    setResources(response.result.centerResources);
    setEmployeeData(
      response.result.employeeModel.map((emp) => ({
        ...emp,
        enabled: false,
        price: "",
        duration: "",
      }))
    );
  } catch (error) {
    console.error("Failed to fetch service details", error);
  }
};


// 🔁 Replace your current handleEmployeeChange with this JS version
const handleEmployeeChange = (index, field, value) => {
  const updated = [...employeeData];

  if (field === "enabled") {
    const enabled = !!value;
    updated[index].enabled = enabled;

    // WHY: When disabling, clear stale values to avoid accidental submit.
    if (!enabled) {
      updated[index].price = "";
      updated[index].duration = "";
      setEmpErrors((prev) => {
        if (!prev || !prev[index]) return prev || {};
        const { [index]: _removed, ...rest } = prev;
        return rest; // drop entire row error
      });
    } else {
      // if enabling, keep values as-is (user may re-enable)
      // also clear any lingering row errors
      setEmpErrors((prev) => {
        if (!prev || !prev[index]) return prev || {};
        const { [index]: _removed, ...rest } = prev;
        return rest;
      });
    }
  } else {
    // price or duration edit
    updated[index][field] = String(value);
    setEmpErrors((prev) => {
      if (!prev || !prev[index]) return prev || {};
      const next = { ...prev, [index]: { ...prev[index] } };
      delete next[index][field];
      if (!next[index].price && !next[index].duration) {
        const { [index]: _removed, ...rest } = next;
        return rest;
      }
      return next;
    });
  }

  setEmployeeData(updated);
};


const handleInputChange = (e) => {
  const { name, value, type, checked, multiple, options } = e.target;

  if (multiple) {
    const selectedValues = Array.from(options)
      .filter((opt) => opt.selected)
      .map((opt) => opt.value);
    setFormData((prev) => ({ ...prev, [name]: selectedValues }));
  } else {
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  }
};

  const handleFileChange = (e) => {
    setFormData({ ...formData, file: e.target.files[0] });
  };

const validateForm = () => {
  if (!formData.name.trim()) return "Service name is required";
  if (!formData.description.trim()) return "Description is required";
  if (!String(formData.service_type || "").trim()) return "service Type is required";
  if (!formData.centerId.length) return "At least one center is required";
  if (!String(formData.price || "").trim()) return "Price is required";

  // 🔴 Performed By rule: if enabled, BOTH fields must be filled
  const newErrors = {};
  employeeData.forEach((emp, idx) => {
    if (!emp.enabled) return;
    const hasPrice = String(emp.price ?? "").trim() !== "";
    const hasDuration = String(emp.duration ?? "").trim() !== "";
    if (!hasPrice || !hasDuration) {
      newErrors[idx] = {
        price: hasPrice ? undefined : "Required when enabled",
        duration: hasDuration ? undefined : "Required when enabled",
      };
    }
  });

  if (Object.keys(newErrors).length) {
    setEmpErrors(newErrors); // show inline field errors
    return "Please fill both Price and Duration for all enabled performers.";
  }

  setEmpErrors({});
  return null;
};

  const fetchDetailsForAllCenters = async (centerIds) => {
  try {
    let allEmployees = [];
    let allAddons = [];
    let allResources = [];

    for (const cid of centerIds) {
      const response = await postApi(config.getDetailsForServiceCreate, {
        centerId: cid,
      });

      // Merge employees
      const emp = response.result.employeeModel.map((e) => ({
        ...e,
        enabled: false,
        price: "",
        duration: "",
      }));
      allEmployees = [...allEmployees, ...emp];

      // Merge addons
      allAddons = [...allAddons, ...response.result.addOnsModel];

      // Merge resources
      allResources = [...allResources, ...response.result.centerResources];
    }

    // Remove duplicates by _id
    const uniqueEmployees = Array.from(
      new Map(allEmployees.map((item) => [item._id, item])).values()
    );

    const uniqueAddons = Array.from(
      new Map(allAddons.map((item) => [item._id, item])).values()
    );

    const uniqueResources = Array.from(
      new Map(allResources.map((item) => [item._id, item])).values()
    );

    setEmployeeData(uniqueEmployees);
    setAddons(uniqueAddons);
    setResources(uniqueResources);

  } catch (err) {
    console.error("Failed to load details for multiple centers", err);
  }
};

const handleSubmit = async (e) => {
  e.preventDefault();

  // 🚫 ignore double-clicks while submitting
  if (isSubmitting) return;

  const validationError = validateForm();
  if (validationError) {
    setUploadStatus(validationError);
    return;
  }

  setIsSubmitting(true); // ⏳ lock UI immediately

  try {
    const endpoint = config.AddServices;

    const payload = {
      ...formData,
      employeeData: employeeData.filter(e => e.enabled),
    };

    // if you may send without file sometimes:
    // const response = formData.file
    //   ? await postApiWithFile(endpoint, payload, { file: formData.file })
    //   : await postApi(endpoint, payload);

    const response = await postApiWithFile(endpoint, payload, { file: formData.file });

    if (response.statusCode === 201) {
      // no need to re-enable; we're navigating away
       setFormData({
  name: "",
  description: "",
  service_type: "",
  center: "",
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
});
      router.push("/admin/Services-Management");
      return;
    } else {
      alert("Failed to add service!");
    }
    setUploadStatus("Service added successfully!");
  } catch (error) {
    console.error("Error adding service:", error);
    alert(error.response?.data?.message || "Unknown error");
    setUploadStatus("Failed to add service.");
  } finally {
    // re-enable only if we stayed on the page (i.e., failure paths)
    setIsSubmitting(false);
  }
};


  return (
    <Container fluid>
      <Row>
        <Col>
          <Card className="p-4 mt-4">
            <Card.Body>
              <Row className="mb-3">
                <Col><h2>Add New Service</h2></Col>
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
        <Form.Label>Service Name <span style={{ color: 'red' }}>*</span></Form.Label>
        <Form.Control type="text" name="name" value={formData.name} onChange={handleInputChange} />
      </Form.Group>
    </Col>
    <Col md={6}>
      <Form.Group className="mb-3">
        <Form.Label>Price <span style={{ color: 'red' }}>*</span></Form.Label>
        <Form.Control type="number" step="0.01" name="price" value={formData.price} onChange={handleInputChange} />
      </Form.Group>
    </Col>
  </Row>

  <Row>
    <Col md={6}>
      <Form.Group className="mb-3">
        <Form.Label>Type <span style={{ color: 'red' }}>*</span></Form.Label>
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
  <Form.Label>Centers <span style={{ color: 'red' }}>*</span></Form.Label>
<Select
  isMulti
  name="centerId"
  options={centerOptions}
  value={formData.centerId.map((id) => {
    const match = centerOptions.find((c) => c.value === id);
    return match ? { value: match.value, label: match.label } : null;
  }).filter(Boolean)}
  onChange={(selected) => {
    const ids = selected ? selected.map((s) => s.value) : [];

    setFormData((prev) => ({
      ...prev,
      centerId: ids,
    }));

    // Load practitioners + addons + resources for ALL centers
    if (ids.length > 0) fetchDetailsForAllCenters(ids);
  }}
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
    <Form.Label>Add-on Description</Form.Label>
    <Select
  isMulti
  name="add_ons"
options={addons.map((addon) => ({
     value: addon._id,
     label: `${addon.name} | Duration: ${addon.duration} | $${addon.price} | Note: ${addon.note}`,
   }))}
  value={formData.add_ons.map((id) => {
    const matched = addons.find((addon) => addon._id === id);
    return matched
       ? {
           value: matched._id,
           label: `${matched.name} | Duration: ${matched.duration} | $${matched.price} | Note: ${matched.note}`,
         }
       : null;
  }).filter(Boolean)}
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
  options={resources.map((res) => ({
    value: res._id,
    label: res.name,
  }))}
  value={formData.resource.map((id) => {
    const match = resources.find((r) => r._id === id);
    return match ? { value: match._id, label: match.name } : null;
  }).filter(Boolean)}
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
    <Form.Label>Description <span style={{ color: 'red' }}>*</span></Form.Label>
    <Form.Control as="textarea" rows={3} name="description" value={formData.description} onChange={handleInputChange} />
  </Form.Group>

  {/* <Form.Group className="mb-3">
    <Form.Label>Upload Service File <span style={{ color: 'red' }}>*</span> <small className="text-muted d-block">
          (Preffered Image 410×220px and less than 10MB of  Jpeg,Png type )
        </small></Form.Label>
    <Form.Control type="file" onChange={handleFileChange} />
  </Form.Group> */}
  
    {/* <Row>
     <Col md={6} className="d-flex align-items-center">
      <Form.Group className="mb-3 w-100">
        <Form.Check
          type="switch"
          id="live_stream"
          name="live_stream"
          label="Enable Live Stream"
          checked={formData.live_stream}
          onChange={handleInputChange}
        />
        <Form.Check
          type="switch"
          id="mobile_service"
          name="mobile_service"
          label="Enable Mobile Service"
          checked={formData.mobile_service}
          onChange={handleInputChange}
        />
      </Form.Group>
    </Col>
</Row> */}

{/* <Row>
  <Col md={6}>
    <Form.Group className="mb-3">
      <Form.Label>Show Online</Form.Label>
      <div>
        <Form.Check
          inline
          type="radio"
          label="Hide"
          name="show_online"
          value="hide"
          checked={formData.show_online === "hide"}
          onChange={handleInputChange}
        />
        <Form.Check
          inline
          type="radio"
          label="Service Only" 
          name="show_online"
          value="service only"
          checked={formData.show_online === "service only"}
          onChange={handleInputChange}
        />
        <Form.Check
          inline
          type="radio"
          label="Service and Price"
          name="show_online"
          value="service and price"
          checked={formData.show_online === "service and price"}
          onChange={handleInputChange}
        />
      </div>
    </Form.Group>
  </Col>
</Row> */}

  <Card className="mt-4 mb-4">
  <Card.Body>
    <h5>Performed By</h5>
    <div className="table-responsive">
      <table className="table table-bordered">
        <thead className="table-light">
          <tr>
             <th>#</th>
            <th>Performed By</th>
            <th>Price ($/hr)</th>
            <th>Duration (min)</th>
          </tr>
        </thead>
      <tbody>
  {employeeData.map((emp, index) => {
    const rowErr = empErrors[index] || {};
    return (
      <tr key={index}>
        <td>{index + 1}</td>
        <td>
          <Form.Check
            type="switch"
            label={emp.name}
            checked={emp.enabled}
            onChange={(e) => handleEmployeeChange(index, "enabled", e.target.checked)}
          />
        </td>
        <td>
          <Form.Control
            type="number"
            name="price"
            value={emp.price}
            onChange={(e) => handleEmployeeChange(index, "price", e.target.value)}
            disabled={!emp.enabled}
            isInvalid={!!rowErr.price}
          />
          <Form.Control.Feedback type="invalid">
            {rowErr.price}
          </Form.Control.Feedback>
        </td>
        <td>
          <Form.Control
            type="number"
            name="duration"
            value={emp.duration}
            onChange={(e) => handleEmployeeChange(index, "duration", e.target.value)}
            disabled={!emp.enabled}
            isInvalid={!!rowErr.duration}
          />
          <Form.Control.Feedback type="invalid">
            {rowErr.duration}
          </Form.Control.Feedback>
        </td>
      </tr>
    );
  })}
</tbody>

      </table>
    </div>
  </Card.Body>
</Card>
  <Button type="submit" variant="primary" disabled={isSubmitting}>
  {isSubmitting && <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />}
  {isSubmitting ? "Adding..." : "Add Service"}
</Button>


</Form>
              {uploadStatus && <p>{uploadStatus}</p>}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
