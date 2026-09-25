"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Card,
  Accordion,
  Spinner,
} from "react-bootstrap";
import Link from "next/link";
import dynamic from "next/dynamic";
import { postApi, postApiWithFile, updateApiWithFile } from "services/api";
import { config } from "services/config";
import { PlusCircle, Trash, ArrowLeft } from "react-bootstrap-icons";
import "react-quill/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

export default function EditCourse({ params }) {
  const router = useRouter();
  const courseId = params.id;

  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState(null);
  const [itemTypeList, setItemTypeList] = useState([]);
  const [videoCategories, setVideoCategories] = useState([]);
  const [allVideos, setAllVideos] = useState({});
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  const [formData, setFormData] = useState({
    courseName: "",
    description: "",
    price: "",
    categoryId: "",
    learnings: [{ title: "" }],
    courseContent: [],
    icon_file: null,
  });

  // ✅ Fetch Course, Categories, Video Categories
  useEffect(() => {
    if (courseId) {
      fetchCourseDetails();
      fetchCourseCategories();
      fetchVideoCategories();
    }
  }, [courseId]);

  const fetchCourseDetails = async () => {
    try {
      const res = await postApi(config.getCourseById, { _id: courseId });
      console.log("getbyid",res)
      if (res.statusCode === 200) {
        const data = res.data;
      setFormData({
  courseName: data.courseName || "",
  description: data.description || "",
  price: data.price || "",
  categoryId: data.categoryId?._id || data.categoryId || "",
  learnings: data.learnings?.length ? data.learnings : [{ title: "" }],
  courseContent: data.courseContent?.length
    ? data.courseContent.map((section) => ({
        ...section,
        lectures: section.lectures.map((lec) => ({
          ...lec,
          videoCategoryId: lec.videoCategoryId?._id || "",
          videoCategoryName: lec.videoCategoryId?.name || "",
          videoId: lec.videoId?._id || "",
          videoTitle: lec.videoId?.name || "",
          documentId: lec.documentId?._id || lec.documentId || null,
          documentFile: lec.documentFile || lec.documentId?.file || "",
        })),
      }))
    : [
        {
          sectionTitle: "",
          lectures: [
            {
              type: "video",
              title: "",
              videoCategoryId: "",
              videoId: "",
              documentFile: null,
            },
          ],
        },
      ],
  icon_file: data.icon_file || null,
});

        if (data.icon_file) {
          setPreviewImage(
            `${process.env.NEXT_PUBLIC_API_URL}/${data.icon_file}`
          );
        }
      }
    } catch (error) {
      console.error("Error fetching course details:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseCategories = async () => {
    try {
      const res = await postApi(config.category, {
        dropdown_type: "course_category",
      });
      if (res.statusCode === 200) setItemTypeList(res.result || []);
    } catch (err) {
      console.error("Error fetching course categories:", err);
    }
  };

  const fetchVideoCategories = async () => {
    try {
      const res = await postApi(config.category, {
        dropdown_type: "yogaVideoCategory",
      });
      if (res.statusCode === 200) setVideoCategories(res.result || []);
    } catch (err) {
      console.error("Error fetching video categories:", err);
    }
  };
  useEffect(() => {
  if (formData.courseContent.length > 0 && videoCategories.length > 0) {
  // Remove undefined/null document fields to avoid overwriting
formData.courseContent.forEach((section) => {
  section.lectures.forEach((lec) => {
    if (!lec.documentFile && !lec.documentId) {
      delete lec.documentFile;
      delete lec.documentId;
    }
  });
});

  }
}, [videoCategories, formData.courseContent]);


  // ✅ Fetch videos by category
  const fetchVideosByCategory = async (categoryId) => {
    if (!categoryId) return;
    try {
      const res = await postApi(config.yogaCatVideoById, { categoryId });
      if (res?.result?.[0]?.videos) {
        const videos = res.result[0].videos.map((v) => ({
          id: v._id,
          title: v.name,
        }));
        setAllVideos((prev) => ({ ...prev, [categoryId]: videos }));
      }
    } catch (err) {
      console.error("Error fetching videos by category:", err);
    }
  };

  // ✅ Handle document upload
  const handleDocumentChange = async (sectionIndex, lectureIndex, file) => {
    if (!file) return;
    const updated = [...formData.courseContent];
  if (file) {
  updated[sectionIndex].lectures[lectureIndex].documentFile = file.name;
} else {
  updated[sectionIndex].lectures[lectureIndex].documentFile =
    updated[sectionIndex].lectures[lectureIndex].documentFile ||
    updated[sectionIndex].lectures[lectureIndex].documentId?.file ||
    null;
}

    setFormData({ ...formData, courseContent: updated });
    try {
      const res = await postApiWithFile(
        config.addYogaDocument,
        { name: file.name },
        { document: file }
      );
      if (res?.data?._id) {
        const updatedForm = [...formData.courseContent];
        updatedForm[sectionIndex].lectures[lectureIndex].documentId =
          res.data._id;
        setFormData((prev) => ({ ...prev, courseContent: updatedForm }));
      }
    } catch (err) {
      console.error("Error uploading document:", err);
    }
  };

  // ✅ File (Icon) Upload
  const handleIconUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);
      setFormData((prev) => ({ ...prev, icon_file: file }));
    }
  };

  // ✅ Input handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLearningChange = (index, value) => {
    const updated = [...formData.learnings];
    updated[index].title = value;
    setFormData({ ...formData, learnings: updated });
  };

  const addLearning = () => {
    setFormData({
      ...formData,
      learnings: [...formData.learnings, { title: "" }],
    });
  };

  const removeLearning = (index) => {
    const updated = formData.learnings.filter((_, i) => i !== index);
    setFormData({ ...formData, learnings: updated });
  };

  // ✅ Course Content Management
  const addSection = () => {
    setFormData((prev) => ({
      ...prev,
      courseContent: [
        ...prev.courseContent,
        {
          sectionTitle: "",
          lectures: [
            {
              type: "video",
              title: "",
              videoCategoryId: "",
              videoId: "",
              documentFile: null,
            },
          ],
        },
      ],
    }));
  };

  const removeSection = (index) => {
    const updated = formData.courseContent.filter((_, i) => i !== index);
    setFormData({ ...formData, courseContent: updated });
  };

  const handleSectionTitleChange = (index, value) => {
    const updated = [...formData.courseContent];
    updated[index].sectionTitle = value;
    setFormData({ ...formData, courseContent: updated });
  };

  const addLecture = (sIndex) => {
    const updated = [...formData.courseContent];
    updated[sIndex].lectures.push({
      type: "video",
      title: "",
      videoCategoryId: "",
      videoId: "",
      documentFile: null,
    });
    setFormData({ ...formData, courseContent: updated });
  };

  const removeLecture = (sIndex, lIndex) => {
    const updated = [...formData.courseContent];
    updated[sIndex].lectures.splice(lIndex, 1);
    setFormData({ ...formData, courseContent: updated });
  };

  const handleLectureChange = (sIndex, lIndex, field, value) => {
    const updated = [...formData.courseContent];
    updated[sIndex].lectures[lIndex][field] = value;
    setFormData({ ...formData, courseContent: updated });
  };

  // ✅ Form submission
const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const files = {};
    if (formData.icon_file instanceof File) {
      files.icon_file = formData.icon_file;
    } else {
      delete formData.icon_file; // ✅ keep previous image
    }

    const response = await updateApiWithFile(
      config.UpdateCourse,
      courseId,
      formData,
      files
    );

    if (response.statusCode === 200) {
      setSuccessMessage("✅ Course updated successfully!");
      setTimeout(() => router.push("/admin/Courses-Management/Courses"), 1500);
    }
  } catch (err) {
    console.error("Error updating course:", err);
    alert("Something went wrong.");
  }
};


  if (loading)
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" />
      </div>
    );

  return (
    <Container fluid className="p-4">
      <Row>
        <Col>
          <Card className="p-4 shadow-sm">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h3>Edit Course</h3>
              <Button variant="secondary" onClick={() => router.back()}>
                <ArrowLeft className="me-2" /> Back
              </Button>
            </div>

            {successMessage && (
              <div className="alert alert-success">{successMessage}</div>
            )}

            <Form onSubmit={handleSubmit}>
              {/* Basic Info */}
              <Row>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Course Name *</Form.Label>
                    <Form.Control
                      type="text"
                      name="courseName"
                      value={formData.courseName}
                      onChange={handleInputChange}
                      placeholder="Enter course name"
                      required
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Price *</Form.Label>
                    <Form.Control
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="Enter price"
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mt-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Course Category *</Form.Label>
                    <Form.Select
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select category</option>
                      {itemTypeList.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Course Icon</Form.Label>
                    <Form.Control
                      type="file"
                      accept="image/*"
                      onChange={handleIconUpload}
                    />
                    {previewImage && (
                      <img
                        src={previewImage}
                        alt="Course Icon"
                        className="mt-2 rounded"
                        width="100"
                      />
                    )}
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mt-3">
                <Form.Label>Course Description</Form.Label>
                <ReactQuill
                  value={formData.description}
                  onChange={(value) =>
                    setFormData((prev) => ({ ...prev, description: value }))
                  }
                />
              </Form.Group>

              {/* Learnings */}
              <Card className="p-3 mt-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h5>Learnings</h5>
                  <Button size="sm" onClick={addLearning}>
                    <PlusCircle /> Add
                  </Button>
                </div>
                {formData.learnings.map((learn, i) => (
                  <Row key={i} className="mb-2">
                    <Col md={10}>
                      <Form.Control
                        value={learn.title}
                        onChange={(e) => handleLearningChange(i, e.target.value)}
                        placeholder="Learning point"
                      />
                    </Col>
                    <Col md={2}>
                      {formData.learnings.length > 1 && (
                        <Button
                          variant="outline-danger"
                          onClick={() => removeLearning(i)}
                        >
                          <Trash size={18} />
                        </Button>
                      )}
                    </Col>
                  </Row>
                ))}
              </Card>

              {/* Course Content */}
              <Card className="p-3 mt-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h5>Course Content</h5>
                  <Button size="sm" onClick={addSection}>
                    <PlusCircle /> Add Section
                  </Button>
                </div>

                <Accordion alwaysOpen>
                  {formData.courseContent.map((section, sIndex) => (
                    <Accordion.Item key={sIndex} eventKey={String(sIndex)}>
                      <Accordion.Header>
                        {section.sectionTitle || `Section ${sIndex + 1}`}
                      </Accordion.Header>
                      <Accordion.Body>
                        <Form.Group className="mb-3">
                          <Form.Label>Section Title</Form.Label>
                          <Form.Control
                            value={section.sectionTitle}
                            onChange={(e) =>
                              handleSectionTitleChange(sIndex, e.target.value)
                            }
                          />
                        </Form.Group>

                        {section.lectures.map((lecture, lIndex) => (
                          <Card key={lIndex} className="p-3 mb-2 bg-light">
                            <div style={{fontWeight:'bold',float:'right'}}>Lecture - {lIndex + 1}</div>
                            <Row>
                              <Col md={2}>
                                <Form.Label>Type</Form.Label>
                                <Form.Select
                                  value={lecture.type}
                                  onChange={(e) =>
                                    handleLectureChange(
                                      sIndex,
                                      lIndex,
                                      "type",
                                      e.target.value
                                    )
                                  }
                                >
                                  <option value="video">Video</option>
                                  <option value="document">Document</option>
                                </Form.Select>
                              </Col>

                              <Col md={3}>
                                <Form.Label>Lecture Title</Form.Label>
                                <Form.Control
                                  value={lecture.title}
                                  onChange={(e) =>
                                    handleLectureChange(
                                      sIndex,
                                      lIndex,
                                      "title",
                                      e.target.value
                                    )
                                  }
                                />
                              </Col>

                              {lecture.type === "video" ? (
                                <>
                                  <Col md={3}>
                                    <Form.Label>Video Category</Form.Label>
                                    <Form.Select
                                      value={lecture.videoCategoryId}
                                      onChange={async (e) => {
                                        const categoryId = e.target.value;
                                        handleLectureChange(
                                          sIndex,
                                          lIndex,
                                          "videoCategoryId",
                                          categoryId
                                        );
                                        await fetchVideosByCategory(categoryId);
                                      }}
                                    >
                                      <option value="">
                                        Select Category
                                      </option>
                                      {videoCategories.map((cat) => (
                                        <option key={cat._id} value={cat._id}>
                                          {cat.name}
                                        </option>
                                      ))}
                                    </Form.Select>
                                  </Col>

                                  <Col md={3}>
                                    <Form.Label>Select Video</Form.Label>
                                    <Form.Select
                                      value={lecture.videoId}
                                      onChange={(e) =>
                                        handleLectureChange(
                                          sIndex,
                                          lIndex,
                                          "videoId",
                                          e.target.value
                                        )
                                      }
                                    >
                                      <option value="">Select Video</option>
                                      {(allVideos[
                                        lecture.videoCategoryId
                                      ] || []).map((vid) => (
                                        <option key={vid.id} value={vid.id}>
                                          {vid.title}
                                        </option>
                                      ))}
                                    </Form.Select>
                                  </Col>
                                </>
                              ) : (
                                <Col md={3}>
                                  <Form.Label>Upload Document</Form.Label>
                                  <Form.Control
                                    type="file"
                                    accept=".pdf,.docx,.pptx"
                                    onChange={async (e) =>
                                      await handleDocumentChange(
                                        sIndex,
                                        lIndex,
                                        e.target.files?.[0]
                                      )
                                    }
                                  />
                                </Col>
                              )}

                              <Col md={1} className="d-flex align-items-end">
                                <Button
                                  variant="outline-danger"
                                  onClick={() =>
                                    removeLecture(sIndex, lIndex)
                                  }
                                >
                                  <Trash />
                                </Button>
                              </Col>
                            </Row>
                          </Card>
                        ))}

                        <Button
                          variant="outline-primary"
                          className="mt-3"
                          size="sm"
                          onClick={() => addLecture(sIndex)}
                        >
                          + Add Lecture
                        </Button>

                        {formData.courseContent.length > 1 && (
                          <Button
                            variant="outline-danger"
                            size="sm"
                            className="ms-2 mt-3"
                            onClick={() => removeSection(sIndex)}
                          >
                            Remove Section
                          </Button>
                        )}
                      </Accordion.Body>
                    </Accordion.Item>
                  ))}
                </Accordion>
              </Card>

              <Button type="submit" className="mt-4">
                Update Course
              </Button>
            </Form>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
