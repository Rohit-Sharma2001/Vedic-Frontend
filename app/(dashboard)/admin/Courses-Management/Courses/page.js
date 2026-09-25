"use client";

import { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Spinner, Badge } from "react-bootstrap";
import { PencilSquare, Trash, Eye, Power } from "react-bootstrap-icons";
import Link from "next/link";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { postApi } from "services/api";
import { config } from "services/config";

export default function CourseList() {
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCourses(page);
  }, [page]);

  const fetchCourses = async (pageNum = 1) => {
    try {
      setLoading(true);
      const data = { page: pageNum, pageSize: 8 };
      const response = await postApi(config.getAllCourses, data);
      if (response.statusCode === 200) {
        setCourses(response.result || []);
        setTotalPages(response.totalPages || 1);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  // 🗑 Delete course
  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This course will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await postApi(config.deleteCourse, { _id: id });
          if (response.statusCode === 200) {
            Swal.fire("Deleted!", "Course has been deleted.", "success");
            fetchCourses(page);
          } else {
            Swal.fire("Error!", response.message, "error");
          }
        } catch (err) {
          Swal.fire("Error!", "Something went wrong.", "error");
        }
      }
    });
  };

  // ⚡ Confirm toggle status
  const confirmToggleStatus = (id, currentStatus) => {
    const action = currentStatus === 1 ? "deactivate" : "activate";
    Swal.fire({
      title: `Are you sure you want to ${action} this course?`,
      text: `This will ${action} the course immediately.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: `Yes, ${action} it!`,
    }).then(async (result) => {
      if (result.isConfirmed) {
        await toggleCourseStatus(id);
      }
    });
  };

  // 🔁 Toggle status API call
  const toggleCourseStatus = async (id) => {
    try {
      const response = await postApi(config.toggleCourseStatus, { _id: id });
      if (response.statusCode === 200) {
        Swal.fire("Success", response.message || "Course status updated!", "success");
        fetchCourses(page);
      } else {
        Swal.fire("Error", response.message || "Failed to update status.", "error");
      }
    } catch (error) {
      console.error("Error toggling course status:", error);
      Swal.fire("Error", "Something went wrong while updating status.", "error");
    }
  };

  return (
    <Container fluid className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Yoga Courses</h2>
        <Button
          variant="primary"
          onClick={() => router.push(`/admin/Courses-Management/Courses/add-courses`)}
        >
          + Add New Course
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : courses.length > 0 ? (
        <Row>
          {courses.map((course, index) => (
            <Col md={3} sm={6} xs={12} key={index} className="mb-4">
              <Card className="shadow-sm border-0 h-100 course-card">
                <div className="position-relative">
                  <Card.Img
                    variant="top"
                    src={
                      course.icon_file
                        ? `${process.env.NEXT_PUBLIC_API_URL}/${course.icon_file}`
                        : "/images/default-course.png"
                    }
                    alt={course.courseName}
                    style={{
                      height: "160px",
                      objectFit: "cover",
                      borderTopLeftRadius: "10px",
                      borderTopRightRadius: "10px",
                    }}
                  />
                  <span
                    className={`badge position-absolute ${
                      course.status === 1 ? "bg-success" : "bg-danger"
                    }`}
                    style={{ top: "10px", right: "10px" }}
                  >
                    {course.status === 1 ? "Active" : "Inactive"}
                  </span>
                </div>

                <Card.Body className="p-3">
                  <Card.Title
                    className="fw-semibold mb-2"
                    style={{ fontSize: "1rem" }}
                  >
                    {course.courseName}
                  </Card.Title>
 <small className="text-muted">
                      {course.categoryId?.name || "Uncategorized"}
                    </small>
                  <div className="d-flex justify-content-between small text-muted mb-2">
                    <span>💰 {course.price || 0} USD</span>
                    <span>👁 {course.viewCount || 0}</span>
                  </div>

                  <div className="d-flex justify-content-between align-items-center">
                   
                    <div className="d-flex gap-2 align-items-center">
                      <Link href={`/admin/Courses-Management/Courses/view/${course?._id}`}>
                        <Eye size={18} style={{ cursor: "pointer", color: "#198754" }} />
                      </Link>

                      <Link href={`/admin/Courses-Management/Courses/edit/${course?._id}`}>
                        <PencilSquare
                          size={18}
                          style={{ cursor: "pointer", color: "#007bff" }}
                        />
                      </Link>

                      <Power
                        size={18}
                        style={{
                          cursor: "pointer",
                          color: course.status === 1 ? "#dc3545" : "#198754",
                        }}
                        title={
                          course.status === 1 ? "Deactivate Course" : "Activate Course"
                        }
                        onClick={() => confirmToggleStatus(course._id, course.status)}
                      />

                      <Trash
                        size={18}
                        style={{ cursor: "pointer", color: "#dc3545" }}
                        onClick={() => handleDelete(course._id)}
                      />
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <div className="text-center text-muted py-5">No courses found.</div>
      )}

      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-4 gap-3">
          <Button
            variant="outline-secondary"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
          >
            Previous
          </Button>
          <span className="align-self-center fw-semibold">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline-secondary"
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          >
            Next
          </Button>
        </div>
      )}

      <style jsx>{`
        .course-card {
          border-radius: 10px;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .course-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </Container>
  );
}
