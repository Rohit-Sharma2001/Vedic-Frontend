'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import Link from 'next/link';
import { postApi, updateApiWithFile } from 'services/api';
import { config } from 'services/config';
import dynamic from 'next/dynamic';
import VimeoPreview from 'services/Reusable/Vimeoplayer';
import Select from "react-select";
// ReactQuill for description
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

export default function EditEvent({ params }) {
    const router = useRouter();
    const editid = params.editid;
    const [yogaLevels, setYogaLevels] = useState([])

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        duration: '',
        level: '',
        employeeId: '',
        categoryId: '',
        is_exclusive: false,
        is_show: false,
        membership_id: '',
        video: '',
        coverImage: null,
        levelId: ""
    });

    const [existingFiles, setExistingFiles] = useState({
        coverImage: '',
    });

    const [previewFiles, setPreviewFiles] = useState({
        coverImagePreview: null,
    });

    const [memberships, setMemberships] = useState([
        { _id: 1, name: 'Membership 1' },
        { _id: 2, name: 'Membership 2' },
        { _id: 3, name: 'Membership 3' },
    ]);

    const [formErrors, setFormErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [employeeList, setEmployeeList] = useState([])
    useEffect(() => {
        const init = async () => {
            await getEmployees(); // load employees first
            if (editid) await fetchYogaDetails(); // then load video
        };
        init();
    }, [editid]);

    // Level dropdown (react-select)
const levelOptions = useMemo(
  () =>
    (yogaLevels || []).map((l) => ({
      value: l._id,
      label: l?.name ?? "Unknown",
    })),
  [yogaLevels]
);

const selectedLevel = useMemo(() => {
  if (!formData.levelId) return null;
  return levelOptions.find((o) => o.value === formData.levelId) || null;
}, [formData.levelId, levelOptions]);

// Instructor dropdown (react-select)
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


    const fetchYogaDetails = async () => {
        try {
            const response = await postApi(config.findYogaVideoById, { videoId: editid });
            console.log("response 64",response)
            if (response.statusCode === 200 || response.statusCode === 201) {
                const YogaData = response.result[0];
                setFormData({
                    name: YogaData.name || '',
                    description: YogaData.description || '',
                    duration: YogaData.duration || '',
                    level: YogaData.level || '',
                    employeeId: YogaData.employeeId || '',
                    is_exclusive: YogaData.is_exclusive || false,
                    membership_id: YogaData.membership_id || '',
                    video: YogaData.video || '', // Use URL
                    categoryId: YogaData.categoryId || "",
                    coverImage: null,
                    levelId: YogaData.levelId || "",
                    is_show: YogaData.is_show || false,
                });
                setExistingFiles({
                    coverImage: YogaData.coverImage || '',
                });
                setYogaLevels(response.yogaLevels)
            }
        } catch (error) {
            console.error('Error fetching video details:', error);
        }
    };
    const getEmployees = async () => {
        try {
            const endpoint = config.GetEmployee;
            const response = await postApi(endpoint);
           
            if (response.statusCode === 201 || response.statusCode === 200) {
                // setUploadStatus("Event added successfully!");
                setEmployeeList(response.data.employeeData);
                // router.push("/admin/Event-Management/Events");
            } else {
                alert("Failed to get employeeList!");
            }
        } catch (error) {
            console.error("Error adding event:", error);
            alert(error.response?.data?.message || "Error adding event");
            setUploadStatus("Failed to add event.");
        }
    };
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
            ...(name === 'is_exclusive' && !checked ? { membership_id: '' } : {}),
        }));
    };

    const handleDescriptionChange = (value) => {
        setFormData((prev) => ({ ...prev, description: value }));
    };

    const handleCoverImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const previewUrl = URL.createObjectURL(file);
        setFormData((prev) => ({ ...prev, coverImage: file }));
        setPreviewFiles((prev) => ({ ...prev, coverImagePreview: previewUrl }));
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.name.trim()) errors.name = 'Video name is required';
        if (!formData.description.trim()) errors.description = 'Description is required';
        if (!formData.duration) errors.duration = 'Duration is required';
        if (!formData.levelId.trim()) errors.level = 'Level is required';
        if (!formData.employeeId.trim()) errors.employeeId = 'Instructor is required';
        if (formData.is_exclusive && !formData.membership_id) errors.membership_id = 'Please select a membership';
        if (!formData.video.trim()) errors.video = 'Video URL is required';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        if (isSubmitting) return;

        setIsSubmitting(true);
        setSuccessMessage('');

        try {
            const data = { ...formData };
            delete data.coverImage; // Keep video URL, remove file only

            const files = {};
            if (formData.coverImage) files.coverImage = formData.coverImage;
console.log("data sent",data)
            const response = await updateApiWithFile(config.updateVideoDetails, editid, data, files);
            if (response.statusCode === 201) {
                setSuccessMessage('Video updated successfully! ✅');
                setTimeout(() => router.back(), 1500);
            } else {
                alert('Failed to update video');
            }
        } catch (error) {
            console.error('Error updating video:', error);
            alert(error.response?.data?.message || 'An error occurred');
        } finally {
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
                                <Col><h2>Edit Yoga Video</h2></Col>
                                <Col className="d-flex justify-content-end">
                                    {/* <Link href="/admin/Event-Management/Events"> */}
                                    <Button onClick={() => router.back()} variant="danger">Back</Button>
                                    {/* </Link> */}
                                </Col>
                            </Row>

                            {successMessage && <div className="alert alert-success">{successMessage}</div>}

                            <Form onSubmit={handleSubmit}>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Video Name *</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                isInvalid={!!formErrors.name}
                                                required
                                            />
                                            <Form.Control.Feedback type="invalid">{formErrors.name}</Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>

                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Description *</Form.Label>
                                            <ReactQuill value={formData.description} onChange={handleDescriptionChange} />
                                            {formErrors.description && <div className="text-danger mt-1">{formErrors.description}</div>}
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Duration *</Form.Label>
                                            <Form.Control
                                                type="number"
                                                name="duration"
                                                value={formData.duration}
                                                onChange={handleInputChange}
                                                isInvalid={!!formErrors.duration}
                                                required
                                            />
                                            <Form.Control.Feedback type="invalid">{formErrors.duration}</Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>

                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>level *</Form.Label>
                                           <Select
  inputId="levelId"
  options={levelOptions}
  value={selectedLevel}
  onChange={(opt) =>
    setFormData((prev) => ({
      ...prev,
      levelId: opt?.value ?? "",
    }))
  }
  placeholder="-- Select Level --"
  isClearable
  menuPortalTarget={typeof document !== "undefined" ? document.body : null}
  menuPosition="fixed"
  maxMenuHeight={240}
  styles={{
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    menuList: (base) => ({ ...base, maxHeight: 240, overflowY: "auto" }),
    control: (base) => ({
      ...base,
      borderColor: formErrors.levelId ? "#dc3545" : base.borderColor,
    }),
  }}
/>

{/* keep native required semantics */}
<input type="hidden" name="levelId" value={formData.levelId} required />

{formErrors.levelId && (
  <div className="text-danger mt-1">{formErrors.levelId}</div>
)}

                                            <Form.Control.Feedback type="invalid">{formErrors.employeeId}</Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Instructor *</Form.Label>
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
  placeholder="-- Select Instructor --"
  isClearable
  menuPortalTarget={typeof document !== "undefined" ? document.body : null}
  menuPosition="fixed"
  maxMenuHeight={240}
  styles={{
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    menuList: (base) => ({ ...base, maxHeight: 240, overflowY: "auto" }),
    control: (base) => ({
      ...base,
      borderColor: formErrors.employeeId ? "#dc3545" : base.borderColor,
    }),
  }}
/>

{/* keep native required semantics */}
<input type="hidden" name="employeeId" value={formData.employeeId} required />

{formErrors.employeeId && (
  <div className="text-danger mt-1">{formErrors.employeeId}</div>
)}

                                        <Form.Control.Feedback type="invalid">{formErrors.employeeId}</Form.Control.Feedback>
                                    </Form.Group></Col>

                                </Row>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Cover Image</Form.Label>
                                            <Form.Control type="file" accept="image/*" onChange={handleCoverImageChange} />
                                            {previewFiles.coverImagePreview ? (
                                                <img src={previewFiles.coverImagePreview} width={100} height={100} className="mt-2" />
                                            ) : existingFiles.coverImage ? (
                                                <img src={`${process.env.NEXT_PUBLIC_API_URL}/${existingFiles.coverImage}`} width={100} height={100} className="mt-2" />
                                            ) : null}
                                        </Form.Group>
                                    </Col>

                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Vimeo Id *</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="video"
                                                value={formData.video}
                                                onChange={handleInputChange}
                                                placeholder="Enter video URL"
                                                isInvalid={!!formErrors.video}
                                                required
                                            />
                                            {formData.video && formData.video.startsWith('http') && (
                                                // <video src={formData.video} width={200} height={120} controls className="mt-2" />
                                                // <iframe
                                                //     style={{
                                                //         width: "50%",
                                                //         height: "120px",
                                                //         objectFit: "cover",
                                                //         borderRadius: "15px",
                                                //         border: "none" // optional to remove iframe border
                                                //     }}
                                                //     src={formData.video}
                                                //     title="YouTube video player"
                                                //     frameBorder="0"
                                                //     allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                                //     allowFullScreen
                                                // ></iframe>
                                                 <VimeoPreview  videoId={formData.video}  previewTime={30} controls={false} width={'440px'} height={'440px'} />
                                            )}
                                            <Form.Control.Feedback type="invalid">{formErrors.video}</Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row>
                                    {/* <Col md={3}>
                                        <Form.Group className="mb-3 d-flex align-items-center">
                                            <Form.Check
                                                type="checkbox"
                                                label="Is Exclusive Video?"
                                                checked={formData.is_exclusive}
                                                onChange={handleInputChange}
                                                name="is_exclusive"
                                            />
                                        </Form.Group>
                                    </Col> */}
                                    {/* <Col md={3}>
                                        <Form.Group className="mb-3 d-flex align-items-center">
                                            <Form.Check
                                                type="checkbox"
                                                label="Is Show On Landing Page?"
                                                checked={formData.is_show}
                                                onChange={handleInputChange}
                                                name="is_show"
                                            />
                                        </Form.Group>
                                    </Col> */}
                                </Row>
                                {/* {formData.is_exclusive && (
                                    <Form.Group className="mb-3">
                                        <Form.Label>Select Membership *</Form.Label>
                                        <Form.Select
                                            name="membership_id"
                                            value={formData.membership_id}
                                            onChange={handleInputChange}
                                            isInvalid={!!formErrors.membership_id}
                                            required
                                        >
                                            <option value="">-- Select Membership --</option>
                                            {memberships.map((m) => (
                                                <option key={m._id} value={m._id}>{m.name}</option>
                                            ))}
                                        </Form.Select>
                                        <Form.Control.Feedback type="invalid">{formErrors.membership_id}</Form.Control.Feedback>
                                    </Form.Group>
                                )} */}

                                <Button type="submit" variant="primary" disabled={isSubmitting}>
                                    {isSubmitting ? 'Updating...' : 'Update Video'}
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}
