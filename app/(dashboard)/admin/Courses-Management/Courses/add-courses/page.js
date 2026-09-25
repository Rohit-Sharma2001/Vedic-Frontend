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
import dynamic from "next/dynamic";
import Link from "next/link";
import { PlusCircle, Trash, ArrowLeft } from "react-bootstrap-icons";
import { postApi, postApiWithFile } from "services/api";
import { config } from "services/config";
import "react-quill/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

export default function AddCourse() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [itemTypeList, setItemTypeList] = useState([]);
  const [videoCategories, setVideoCategories] = useState([]);
  const [allVideos, setAllVideos] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [formErrors, setErrors] = useState({});
  const [errors, setAddErrors] = useState()
  const [formData, setFormData] = useState({
    courseName: "",
    description: "",
    price: "",
    categoryId: "",
    learnings: [{ title: "" }],
    courseContent: [
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
    icon_file: null,
  });

  // ✅ Fetch all dropdowns
  useEffect(() => {
    fetchCourseCategories();
    fetchVideoCategories();
  }, []);

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

  // ✅ File Upload
  const handleIconUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, icon_file: 'Image must be less than 10MB.' }));
        return;
      }

      // ✅ File type check
      const allowedTypes = ['image/jpeg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        setErrors((prev) => ({ ...prev, icon_file: 'Only JPEG and PNG formats are allowed.' }));
        return;
      }
      setErrors({})
      const reader = new FileReader();
      reader.onload = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);
      setFormData((prev) => ({ ...prev, icon_file: file }));
    }
  };

  // ✅ Document Upload
  const handleDocumentChange = async (sIndex, lIndex, file) => {
    if (!file) return;
    const updated = [...formData.courseContent];
    updated[sIndex].lectures[lIndex].documentFile = file.name;
    setFormData({ ...formData, courseContent: updated });

    try {
      const res = await postApiWithFile(
        config.addYogaDocument,
        { name: file.name },
        { document: file }
      );
      if (res?.data?._id) {
        const updatedForm = [...formData.courseContent];
        updatedForm[sIndex].lectures[lIndex].documentId = res.data._id;
        setFormData((prev) => ({ ...prev, courseContent: updatedForm }));
      }
    } catch (err) {
      console.error("Error uploading document:", err);
    }
  };

  // ✅ Input Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLearningChange = (index, value) => {
    const updated = [...formData.learnings];
    updated[index].title = value;
    setFormData({ ...formData, learnings: updated });
  };

  const addLearning = () =>
    setFormData({
      ...formData,
      learnings: [...formData.learnings, { title: "" }],
    });

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
  // const validateForm = () => {
  //   let newErrors = "";
  //   console.log("kkkkkkkkkk")
  //   // categoryId: "",
  //   if (!formData.courseName?.trim()) return newErrors =  "Course Name is required.";
  //   if (!formData.price?.trim()) return newErrors = "Price is required.";
  //   if (!formData.price || parseFloat(formData.price) <= 0) {
  //    return newErrors = "Price must be greater than 0.";
  //   }
  //   if (!formData.categoryId)return newErrors = "Category is required.";
  //   if (!formData.description)return newErrors = "Description is required.";


  //   if (!formData.learnings || formData.learnings.some(e => !e.title || e.title.trim() === "")) {
  //   return  newErrors = "Can't add blank learnings";
  //   }
  //   if (!formData?.courseContent[0].sectionTitle) {
  //    return newErrors = "At least one course section is required";
  //   } else {
  //     formData.courseContent.forEach((section, sIndex) => {
  //       if (!section.sectionTitle?.trim()) {
  //       return  newErrors = "Section title is required";
  //       }

  //       if (!section.lectures?.length) {
  //       return  newErrors = "At least one lecture is required";
  //       } else {
  //         section.lectures.forEach((lecture, lIndex) => {
  //           if (!lecture.type) {
  //         return    newErrors = "Lecture type is required";
  //           }

  //           if (!lecture.title?.trim()) {
  //           return  newErrors = "Lecture title is required";
  //           }

  //           if (lecture.type === "video" && !lecture.videoId) {
  //            return newErrors = "Video is required";
  //           }

  //           if (lecture.type === "document" && !lecture.documentFile) {
  //            return newErrors = "Document file is required";
  //           }
  //         });
  //       }
  //     });
  //   }
  //   // setAddErrors(newErrors);
  //   if (!newErrors=='') {
  //     setAddErrors(newErrors)
  //     return newErrors
  //   }else{
  //   return false
  //   }
  // };



  const validateForm = () => {
    let newErrors = "";

    if (!formData.courseName?.trim()) return "Course Name is required.";
    if (!formData.price?.trim()) return "Price is required.";
    if (parseFloat(formData.price) < 0) return "Price must be greater than 0.";
    if (!formData.categoryId) return "Category is required.";
    if (!formData.description) return "Description is required.";

    if (
      !formData.learnings ||
      formData.learnings.some(e => !e.title || e.title.trim() === "")
    ) {
      return "Can't add blank learnings";
    }

    if (!formData.courseContent?.length) {
      return "At least one course section is required";
    }

    // ✅ IMPORTANT: use for...of
    for (const section of formData.courseContent) {
      if (!section.sectionTitle?.trim()) {
        return "Section title is required";
      }

      if (!section.lectures?.length) {
        return "At least one lecture is required";
      }

      for (const lecture of section.lectures) {
        if (!lecture.type) {
          return "Lecture type is required";
        }

        if (!lecture.title?.trim()) {
          return "Lecture title is required";
        }

        if (lecture.type === "video" && !lecture.videoId) {
          return "Video is required";
        }

        if (lecture.type === "document" && !lecture.documentFile) {
          return "Document file is required";
        }
      }
    }
    if (formErrors.icon_file !== undefined) {
      return formErrors.icon_file
    }
    // ✅ No errors
    // setAddErrors("");
    return true;
  };


  const renderError = (field) => { }
  // errors[field] && (
  //   <div style={{ color: "red", fontSize: "0.9em" }}>{errors[field]}</div>
  // );
  // ✅ Submit
  const handleSubmit = async (e) => {
    console.log("lllllllllll")
    e.preventDefault();
    const finalError = validateForm()
    // if (finalError) return;
    if (finalError === true) {
      // submit form
    } else {
      return setAddErrors(finalError); // result is error message
    }
    setLoading(true);
    try {
      const files = {};
      if (formData.icon_file instanceof File)
        files.icon_file = formData.icon_file;

      const res = await postApiWithFile(config.addCourse, formData, files);
      if (res.statusCode === 200 || res.statusCode === 201) {
        setSuccessMessage("✅ Course added successfully!");
        setTimeout(() => router.push("/admin/Courses-Management/Courses"), 1500);
      } else {
        setSuccessMessage(res.error);
      }
    } catch (err) {
      console.error("Error adding course:", err);
      alert("Something went wrong while adding the course.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="p-4">
      <Row>
        <Col>
          <Card className="p-4 shadow-sm">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h3>Add New Course</h3>
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
                      name="courseName"
                      value={formData.courseName}
                      onChange={handleInputChange}
                      placeholder="Enter course name"
                      required
                    />
                    {renderError("courseName")}
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
                    {renderError("")}
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mt-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Course Category *</Form.Label>
                    <small className="text-muted d-block">&nbsp; </small>
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
                    {renderError("")}
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Course Icon
                      <small className="text-muted d-block">
                        (Preferred size: 830×360px, less than 10MB, JPEG/PNG only)
                      </small></Form.Label>
                    <Form.Control
                      type="file"
                      accept="image/*"
                      onChange={handleIconUpload}
                    />{formErrors.icon_file && <p className="text-danger">{formErrors.icon_file}</p>}
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
                  required
                />
                {renderError("description")}
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
                        required
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
                          // required
                          />
                        </Form.Group>

                        {section.lectures.map((lecture, lIndex) => (
                          <Card key={lIndex} className="p-3 mb-2 bg-light">
                            <div style={{ fontWeight: "bold", float: "right" }}>
                              Lecture - {lIndex + 1}
                            </div>
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
              {errors && (
                <div className="alert alert-danger">{errors}</div>
              )}
              <Button
                type="submit"
                className="mt-4"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner size="sm" className="me-2" /> Saving...
                  </>
                ) : (
                  "Add Course"
                )}
              </Button>
            </Form>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
