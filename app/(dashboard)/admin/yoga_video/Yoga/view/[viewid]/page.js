// File path: app/events/[viewid]/page.js
"use client";

import { useEffect, useState } from "react";
import { Container, Row, Col, Button, Card } from "react-bootstrap";
import Link from "next/link";
import { config } from "services/config";
import { postApi } from "services/api";
import { useRouter } from "next/navigation";
import { PencilSquare, Trash, CheckCircle, XCircle } from "react-bootstrap-icons";

import Swal from "sweetalert2";


export default function EventDetails({ params }) {
  const id = params.viewid;
  const router = useRouter();
  const [categoryData, setCatetoryData] = useState([]);

  useEffect(() => {
    if (id) fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      const endpoint = config.yogaCatVideoById;
      const data = { categoryId: id };
      const response = await postApi(endpoint, data);
      console.log("response",response)
      if (response.statusCode === 201 || response.statusCode === 200) {
        setCatetoryData(response.result);
      }
    } catch (error) {
      console.error("Error fetching yoga details:", error);
    }
  };

  const routeToVideo = (id) => {
    router.push(`/admin/yoga_video/Yoga/edit-Video/${id}`);
  };

  const handleDelete = (id) => {
  Swal.fire({
    title: "Are you sure?",
    text: "This video will be permanently deleted.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, delete it!",
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const endpoint = config.DeleteYogaVideo; // ✅ make sure this exists in config
        const data = { _id : id };
        const response = await postApi(endpoint, data);

        if (response.statusCode === 200) {
          Swal.fire("Deleted!", "Video has been deleted.", "success");
          fetchEventDetails(); // refresh list
        } else {
          Swal.fire("Error!", "Failed to delete video.", "error");
        }
      } catch (error) {
        console.error("Error deleting video:", error);
        Swal.fire("Error!", "Something went wrong while deleting.", "error");
      }
    }
  });
};

const handleStatusToggle = (id, currentStatus) => {
  Swal.fire({
    title: "Are you sure?",
    text: "This will toggle the video's status.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#28a745",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, update it!",
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const endpoint = config.UpdateYogaVideoStatus; // ✅ add this to config
        const data = { _id: id };
        const response = await postApi(endpoint, data);
console.log(response)
        if (response.statusCode === 200) {
          Swal.fire("Updated!", "Video status has been changed.", "success");
          fetchEventDetails(); // refresh list
        } else {
          Swal.fire("Error!", response.message, "error");
        }
      } catch (error) {
        console.error("Error updating video status:", error);
        Swal.fire("Error!", "Something went wrong while updating status.", "error");
      }
    }
  });
};


  return (
    <Container fluid className="p-4">
      <div className="d-flex justify-content-end mb-3">
        <Link href={`/admin/yoga_video/Yoga/add-yoga-videos`} passHref>
          <Button variant="primary" className="me-2">
            Add New Video
          </Button>
        </Link>
        <Link href={`/admin/yoga_video/Yoga`} passHref>
          <Button variant="secondary">Back</Button>
        </Link>
      </div>

      <h2 className="mb-4">Yoga Playlist Videos</h2>

      <section className="yogaclassSection">
        {categoryData.length > 0 ? (
          categoryData.map((category, catIndex) => (
            <div key={catIndex} className="mb-5">
              <div className="section-heading mb-4">
              
                <h3 className="d-inline-block">{category.name}</h3>
                <p className="text-muted mt-2">{category.description}</p>
              </div>

           <Row>
  {category.videos && category.videos.length > 0 ? (
    category.videos.map((video, index) => (
      <Col md={3} sm={4} xs={12} key={index} className="mb-3">
        <Card
          className="shadow-sm border-0 h-100 video-card"
          style={{
            borderRadius: "10px",
            overflow: "hidden",
            transition: "transform 0.2s ease",
          }}
        >
          <div className="position-relative">
  <Card.Img
    variant="top"
    src={
      video.coverImage
        ? `${process.env.NEXT_PUBLIC_API_URL}/${video.coverImage}`
        : "/images/landingpage/kids-yoga-fitness.jpg"
    }
    alt={video.name}
    style={{
      height: "140px",
      objectFit: "contain",
      borderTopLeftRadius: "10px",
      borderTopRightRadius: "10px",
    }}
  />

  {/* ✅ Status Badge moved to top-right corner */}
  <span
    className={`badge position-absolute ${
      video.status === 1 ? "bg-success" : "bg-danger"
    }`}
    style={{
      top: "10px",
      right: "10px",
      padding: "6px 10px",
      fontSize: "0.75rem",
      borderRadius: "12px",
    }}
  >
    {video.status === 1 ? "Listed On Landing Page" : "Not Listed"}
  </span>
</div>

          <Card.Body className="py-3 px-3">
            <Card.Title
              className="fw-semibold mb-1"
              style={{ fontSize: "1rem" }}
            >
              {video.name}
            </Card.Title>
            <Card.Text
              className="text-muted mb-2"
              style={{ fontSize: "0.85rem", lineHeight: "1.2rem" }}
              dangerouslySetInnerHTML={{
                __html:
                  video.description?.length > 60
                    ? video.description.substring(0, 60) + "..."
                    : video.description || "",
              }}
            />
            <div className="d-flex justify-content-between align-items-center mt-2">
              <small className="text-muted">
                ⏱ {video.duration || "N/A"} min
              </small>
              <small className="text-muted">
                👤 {video.employee?.name || "—"}
              </small>
            </div>
        <div className="d-flex flex-column align-items-center mt-3">
  {/* Status Badge */}


  {/* Action Icons */}
  <div className="d-flex gap-3 justify-content-center">
    <PencilSquare
      size={20}
      style={{ cursor: "pointer", color: "#007bff" }}
      onClick={() => routeToVideo(video._id)}
    />
    <Trash
      size={20}
      style={{ cursor: "pointer", color: "#dc3545" }}
      onClick={() => handleDelete(video._id)}
    />
    {video.status === 1 ? (
      <XCircle
        size={20}
        style={{ cursor: "pointer", color: "#ffc107" }}
        onClick={() => handleStatusToggle(video._id, video.status)}
      />
    ) : (
      <CheckCircle
        size={20}
        style={{ cursor: "pointer", color: "#28a745" }}
        onClick={() => handleStatusToggle(video._id, video.status)}
      />
    )}
  </div>
</div>



          </Card.Body>
        </Card>
      </Col>
    ))
  ) : (
    <p className="text-muted text-center">No videos found for this Playlist.</p>
  )}
</Row>
            </div>
          ))
        ) : (
          <div className="text-center text-muted py-5">
            No categories found.
          </div>
        )}
      </section>

     <style jsx>{`
  .video-card {
    min-height: 260px;
    max-width: 280px;
    margin: auto;
  }
  .video-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  }
`}</style>
    </Container>
  );
}
