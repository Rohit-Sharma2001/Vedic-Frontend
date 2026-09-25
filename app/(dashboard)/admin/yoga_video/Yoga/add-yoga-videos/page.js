"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Container, Row, Col, Form, Button, Card, Image } from "react-bootstrap";
import { useRouter } from "next/navigation";
import { postApiWithFile, postApi } from "services/api";
import { config } from "services/config";
import dynamic from "next/dynamic";
import Select from "react-select"; // ✅ ADD

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";

export default function AddYogaVideo() {
  const [membershipPrices, setMembershipPrices] = useState([]);
  const router = useRouter();
  const autocompleteRef = useRef(null);

  const [employeeList, setEmployeeList] = useState([]);
  const [category, setCategory] = useState([]);
  const [yogaLevels, setYogaLevels] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    duration: "",
    employeeId: "",
    categoryId: "",
    levelId: "",
    is_show: false,
    video: "",
    is_rsvp: false,
    is_exclusive: false,
    icon_file: null,
    coverImage: null,
  });

  const [uploadStatus, setUploadStatus] = useState("");
  const [previewImages, setPreviewImages] = useState({
    filePreview: null,
    icon_filePreview: null,
    coverImagePreview: null,
  });

  const [memberships] = useState([
    { _id: "1", name: "Silver" },
    { _id: "2", name: "Gold" },
    { _id: "3", name: "Platinum" },
  ]);

  useEffect(() => {
    if (formData.is_exclusive) {
      const initialPrices = memberships.map((m) => ({
        membership_id: m._id,
        membership_name: m.name,
        price: "",
      }));
      setMembershipPrices(initialPrices);
    } else {
      setMembershipPrices([]);
    }
  }, [formData.is_exclusive, memberships]);

  useEffect(() => {
    getEmployees();
    getCategory();
    getLevels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const instructorOptions = useMemo(
    () =>
      (employeeList || []).map((e) => ({
        value: e._id,
        label: e?.user?.name ?? "Unknown",
      })),
    [employeeList]
  );

  const selectedInstructor = useMemo(() => {
    if (!formData.employeeId) return null;
    return instructorOptions.find((o) => o.value === formData.employeeId) || null;
  }, [formData.employeeId, instructorOptions]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDescriptionChange = (value) => {
    setFormData((prev) => ({ ...prev, description: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setFormData((prev) => ({ ...prev, [name]: file }));
    setPreviewImages((prev) => ({ ...prev, [`${name}Preview`]: previewUrl }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) return alert("yoga name is required.");
    if (!formData.duration) return alert("duration is required.");
    if (!formData.description.trim()) return alert("Description is required.");
    if (!formData.employeeId.trim()) return alert("Instructor is required.");
    if (!formData.coverImage) return alert("Cover images are required.");

    try {
      let data = { ...formData };

      if (formData.is_rsvp) {
        data.is_rsvp = true;
        data.Price = 0;
        data.membership_pricing = [];
      } else if (formData.is_exclusive) {
        const validPrices = membershipPrices.filter((mp) => mp.price);
        if (validPrices.length === 0) {
          return alert("Please enter prices for memberships.");
        }
        data.membership_pricing = validPrices;
      }

      delete data.coverImage;
      data.is_exclusive = formData.is_exclusive ? true : false;

      const files = {
        coverImage: formData.coverImage,
      };

      const endpoint = config.addYogaVideo;
      const response = await postApiWithFile(endpoint, data, files);

      if (response.statusCode === 201) {
        setUploadStatus("Yoga video added successfully!");
        ResetForm();
        router.back();
      }
      if (response.message) {
        alert(response.message);
      } else {
        alert("Failed to add Yoga!");
      }
    } catch (error) {
      console.error("Error adding yoga:", error);
      alert(error.response?.data?.message || "Error adding yoga");
      setUploadStatus("Failed to add yoga.");
    }
  };

  const getEmployees = async () => {
    try {
      const endpoint = config.GetEmployee;
      const response = await postApi(endpoint);
      if (response.statusCode === 201 || response.statusCode === 200) {
        setEmployeeList(response.data.employeeData);
      } else {
        alert("Failed to get employeeList!");
      }
    } catch (error) {
      console.error("Error getting employees:", error);
      alert(error.response?.data?.message || "Error getting employees");
    }
  };

  const getCategory = async () => {
    try {
      const endpoint = config.category;
      const data = { dropdown_type: "yogaVideoCategory", page: 1, pageSize: 10 };
      const response = await postApi(endpoint, data);

      if (response.statusCode === 200) {
        setCategory(response.result);
      } else {
        alert("Failed to get category!");
      }
    } catch (error) {
      console.error("Error getting category:", error);
      alert(error.response?.data?.message || "Error getting category");
    }
  };

  const getLevels = async () => {
    try {
      const endpoint = config.category;
      const data = { dropdown_type: "yoga_level", page: 1, pageSize: 10 };
      const response = await postApi(endpoint, data);

      if (response.statusCode === 200) {
        setYogaLevels(response.result);
      } else {
        alert("Failed to get yogalevel!");
      }
    } catch (error) {
      console.error("Error getting yoga level:", error);
      alert(error.response?.data?.message || "Error getting yoga level");
    }
  };

  const ResetForm = () => {
    setFormData({
      name: "",
      description: "",
      duration: "",
      employeeId: "",
      categoryId: "",
      levelId: "",
      is_show: false,
      video: "",
      is_rsvp: false,
      is_exclusive: false,
      icon_file: null,
      coverImage: null,
    });
    setPreviewImages({
      filePreview: null,
      icon_filePreview: null,
      coverImagePreview: null,
    });
  };

  return (
    <Container fluid>
      <Row>
        <Col>
          <Card className="p-4 mt-4">
            <Card.Body>
              <Row className="mb-3">
                <Col>
                  <h2>Add Yoga Video</h2>
                </Col>
                <Col
                  onClick={() => router.back()}
                  className="d-flex justify-content-end"
                >
                  <Button variant="danger">Back</Button>
                </Col>
              </Row>

              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Name *</Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Description *</Form.Label>
                      <ReactQuill
                        value={formData.description}
                        onChange={handleDescriptionChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Duration (in minutes) *</Form.Label>
                      <Form.Control
                        type="number"
                        name="duration"
                        value={formData.duration}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Instructor *</Form.Label>

                      {/* ✅ REPLACED: native select -> react-select (scrollable + viewport-safe) */}
                      <Select
                        inputId="employeeId"
                        options={instructorOptions}
                        value={selectedInstructor}
                        onChange={(opt) =>
                          setFormData((prev) => ({
                            ...prev,
                            employeeId: opt?.value ?? "",
                          }))
                        }
                        placeholder="Select Instructor"
                        isClearable
                        menuPortalTarget={
                          typeof document !== "undefined" ? document.body : null
                        }
                        menuPosition="fixed"
                        maxMenuHeight={240}
                        styles={{
                          menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                          menuList: (base) => ({
                            ...base,
                            maxHeight: 240,
                            overflowY: "auto",
                          }),
                        }}
                      />

                      {/* Optional: keeps native required semantics if you rely on browser validation */}
                      <input
                        type="hidden"
                        name="employeeId"
                        value={formData.employeeId}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mt-2">
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>level *</Form.Label>
                        <Form.Select
                          name="levelId"
                          value={formData.levelId}
                          onChange={handleInputChange}
                          required
                        >
                          <option hidden>-- Select Level --</option>
                          {yogaLevels.length > 0 &&
                            yogaLevels.map((e) => (
                              <option key={e._id} value={e._id}>
                                {e.name}
                              </option>
                            ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Playlist *</Form.Label>
                        <Form.Select
                          name="categoryId"
                          value={formData.categoryId}
                          onChange={handleInputChange}
                          required
                        >
                          <option hidden>Select Playlist</option>
                          {category.length > 0 &&
                            category.map((e) => (
                              <option key={e._id} value={e._id}>
                                {e.name}
                              </option>
                            ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Cover Image *</Form.Label>
                      <Form.Control
                        type="file"
                        name="coverImage"
                        accept="image/*"
                        onChange={handleFileChange}
                        required
                      />
                      {previewImages.coverImagePreview && (
                        <Image
                          src={previewImages.coverImagePreview}
                          thumbnail
                          width={100}
                          height={100}
                          className="mt-2"
                        />
                      )}
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Vimeo ID *</Form.Label>
                      <Form.Control
                        type="text"
                        name="video"
                        placeholder="Enter Video Link"
                        value={formData.video}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Button type="submit" className="mt-4" variant="primary">
                  Add Video
                </Button>
              </Form>

              {uploadStatus && <p className="mt-3">{uploadStatus}</p>}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
