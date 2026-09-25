// File path: app/admin/course_management/view/[id]/page.js
"use client";
import VimeoPreview from "services/Reusable/Vimeoplayer";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Badge,
  Accordion,
  Modal,
} from "react-bootstrap";
import { postApi } from "services/api";
import { config } from "services/config";
import Link from "node_modules/next/link";
import { ArrowLeft, PlayCircle, FileEarmarkText } from "react-bootstrap-icons";

export default function CourseDetails({ params }) {
  const id = params.id;
  const router = useRouter();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    if (id) fetchCourseDetails();
  }, [id]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      const data = { _id: id };
      const response = await postApi(config.getCourseById, data);
      console.log("course details ",response)
      if (response.statusCode === 200) setCourse(response.data);
    } catch (error) {
      console.error("Error fetching course details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = (video) => {
    setSelectedVideo(video);
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setSelectedVideo(null);
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (!course) {
    return (
      <Container className="text-center py-5 text-muted">
        No course details found.
      </Container>
    );
  }

  return (
    <Container fluid className="p-4">
    

      <Card className="shadow-sm border-0 mb-4 p-4">
          <div>
          <Link  className="btn btn-danger mb-3" style={{float:'right'}} href={'/admin/Courses-Management/Courses'} >
        <ArrowLeft className="me-2" /> Back
      </Link>
      </div>
        <Row>
          <Col md={3} sm={12} className="text-center mb-3">
            <img
              src={
                course.icon_file
                  ? `${process.env.NEXT_PUBLIC_API_URL}/${course.icon_file}`
                  : "/images/default-course.png"
              }
              alt={course.courseName}
              style={{ width: "100%", borderRadius: "10px", objectFit: "cover" }}
            />
          </Col>

          <Col md={9} sm={12}>
            <h3 className="fw-bold mb-2">{course.courseName}</h3>
            <div className="d-flex align-items-center gap-2 mb-3">
              <Badge bg={course.status === 1 ? "success" : "danger"}>
                {course.status === 1 ? "Active" : "Inactive"}
              </Badge>
              <span className="text-muted small">
                Category: {course.categoryId?.name || "Uncategorized"}
              </span>
            </div>

            <p
              className="text-muted mb-3"
              dangerouslySetInnerHTML={{ __html: course.description }}
            />

            <div className="mb-2">
              <strong>Price:</strong> ${course.price}
            </div>
            <div className="mb-2">
              <strong>Views:</strong> {course.viewCount}
            </div>
            <div className="text-muted small">
              Created: {new Date(course.createdAt).toLocaleDateString('en-US')} | Modified: {new Date(course.modified).toLocaleDateString('en-US')}
            </div>
          </Col>
        </Row>
      </Card>

      {course.learnings?.length > 0 && (
        <Card className="shadow-sm border-0 mb-4 p-4">
          <h5 className="fw-semibold mb-3">What you will learn</h5>
          <ul className="mb-0">
            {course.learnings.map((item, i) => (
              <li key={i} className="mb-1 text-muted">{item.title}</li>
            ))}
          </ul>
        </Card>
      )}

      {course.courseContent?.length > 0 && (
        <Card className="shadow-sm border-0 p-4">
          <h5 className="fw-semibold mb-4">Course Content</h5>
          <Accordion alwaysOpen>
            {course.courseContent.map((section, sIndex) => (
              <Accordion.Item eventKey={String(sIndex)} key={sIndex} className="mb-2 border-0 shadow-sm">
                <Accordion.Header>
                  <div className="d-flex justify-content-between w-100">
                    <span className="fw-semibold">{section.sectionTitle}</span>
                    <small className="text-muted">{section.lectures.length} Lectures</small>
                  </div>
                </Accordion.Header>

                <Accordion.Body className="bg-light">
                  {section.lectures.map((lecture, lIndex) => (
                    <div
                      key={lIndex}
                      className="d-flex justify-content-between align-items-center py-2 border-bottom"
                    >
                      <div className="d-flex align-items-center gap-3">
                        {lecture.type === "video" ? (
                          <>
                            <img
                              src={
                                lecture.videoId?.coverImage
                                  ? `${process.env.NEXT_PUBLIC_API_URL}/${lecture.videoId.coverImage}`
                                  : "/images/default-video.png"
                              }
                              alt="Video Thumbnail"
                              width="60"
                              height="40"
                              style={{ borderRadius: "6px", objectFit: "cover" }}
                            />
                            <PlayCircle size={18} className="text-primary" />
                          </>
                        ) : (
                          <FileEarmarkText size={18} className="text-secondary" />
                        )}
                        <span className="fw-medium">{lecture.title}</span>
                      </div>

                      {lecture.type === "video" && lecture.videoId?.video ? (
                        <Button
                          variant="link"
                          className="text-primary p-0 small"
                          onClick={() => handlePreview(lecture.videoId.video)}
                        >
                          Preview
                        </Button>
                      ) : lecture.documentFile ? (
                        <a
                          href={`${process.env.NEXT_PUBLIC_API_URL}/${lecture?.documentId?.file}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary small"
                        >
                          Download
                        </a>
                      ) : null}
                    </div>
                  ))}
                </Accordion.Body>
              </Accordion.Item>
            ))}
          </Accordion>
        </Card>
      )}

      <Modal show={showModal} onHide={handleClose} size="lg" centered>
        {/* <Modal.Header closeButton>
          <Modal.Title>Video Preview</Modal.Title>
        </Modal.Header> */}
        <Modal.Body className="p-0">
          {selectedVideo && (
            // <iframe
            //   src={selectedVideo}
            //   title="Video Preview"
            //   width="100%"
            //   height="450px"
            //   style={{ border: "none", borderRadius: "8px" }}
            //   allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            //   allowFullScreen
            // ></iframe>
             <VimeoPreview  videoId={selectedVideo}  previewTime={30} controls={false} width={'800px'} height={'450px'} />
          )}
        </Modal.Body>
      </Modal>

      <style jsx>{`
        ul li::marker {
          color: #0d6efd;
        }
      `}</style>
    </Container>
  );
}