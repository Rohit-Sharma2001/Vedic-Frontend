// filepath: /components/admin/EventList.js
"use client";
import { useState, useEffect } from "react";
import {
  Col,
  Row,
  Table,
  Button,
  Container,
  Pagination,
} from "react-bootstrap";
import { Badge, OverlayTrigger, Tooltip } from "react-bootstrap";

import { Eye, PencilSquare, Trash, CheckCircle, XCircle  } from "react-bootstrap-icons";

import Link from "next/link";
import { config } from "services/config";
import { postApi, updateApiWithFileinBody } from "services/api";
import Swal from "sweetalert2";

export default function EventList() {
  const [events, setCatetory] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchEvents(currentPage);
  }, [currentPage]);

  const fetchEvents = async (page) => {
    try {
      const endpoint = config.category;
      const data = { dropdown_type: "yogaVideoCategory", page, pageSize };
      const response = await postApi(endpoint, data);

      // const endpoint = config.Allevents;
      // const data = { page, pageSize, search };
      // const response = await postApi(endpoint, data);

      console.log(response, "kkkkkk")
      setCatetory(response.result || []);
      setTotalPages(response.totalPages || 1);
      setTotalCount(response.totalCount || 0);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const searchCategory = async (page) => {
    try {
      const endpoint = config.searchByNameAndDescription;

      const data = { dropdown_type: "yogaVideoCategory", search, page, pageSize };
      const response = await postApi(endpoint, data);

      console.log(response, "kkkkkk")
      setCatetory(response.result || []);
      setTotalPages(response.totalPages || 1);
      setTotalCount(response.totalCount || 0);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const handleSearch = async () => {
    setCurrentPage(1);
    await searchCategory(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const confirmDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This Playlist will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteEvent(id);
        Swal.fire("Deleted!", "Playlist has been deleted.", "success");
      }
    });
  };

  const deleteEvent = async (id) => {
    try {
      const endpoint = config.Deletecategory;
      const data = { id };
      await postApi(endpoint, data);
      fetchEvents(currentPage);
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };
  // Confirm before toggling event status
  const confirmUpdate = (id, currentStatus) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This will toggle the event's status.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, update it!",
    }).then((result) => {
      if (result.isConfirmed) {
        updateStatus(id, currentStatus);
        Swal.fire("Updated!", "Event status has been changed.", "success");
      }
    });
  };

  // Toggle event status
  const updateStatus = async (id, currentStatus) => {
    try {
      const endpoint = config.Updatecategorystatus; // Ensure your API path exists
      const data = { id };

      console.log("Updating event status:", data);

      const response = await postApi(endpoint, data);

      if (response.statusCode === 200) {
        fetchEvents(currentPage);
      } else {
        console.error("Failed to update event status.");
        Swal.fire("Error!", "Failed to update event status.", "error");
      }
    } catch (error) {
      console.error("Error updating event:", error);
      Swal.fire("Error!", "Something went wrong while updating status.", "error");
    }
  };

  return (
    <Container fluid className="p-6">
      <Row className="align-items-center mb-4">
        <Col>
          <h2>Yoga</h2>
        </Col>
        <Col className="d-flex justify-content-end">
          <Link href="/admin/yoga_video/Yoga/add-yoga-category" passHref>
            <Button variant="success">Add New Yoga Playlist</Button>
          </Link>
        </Col>
      </Row>

      {/* Optional: Search bar */}
      <Row className="mb-3">
        <Col md={4}>
          <input
            type="text"
            className="form-control"
            placeholder="Search by Yoga Playlist Name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Col>
        <Col md="auto">
          <Button variant="primary" onClick={handleSearch}>
            Searchs
          </Button>
        </Col>
      </Row>

      <Row>
        <Col xl={12} lg={12} md={12} sm={12}>
          <Table hover responsive className="text-nowrap">
            <thead>
              <tr>
                <th>#</th>
                <th>Playlist Name</th>
                <th>Date</th>
                {/* <th>Time</th> */}
                <th>Description</th>
                {/* <th>Price ($)</th> */}
                {/* <th>Image</th> */}
                {/* <th>City</th> */}
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.length > 0 ? (
                events.map((event, index) => (
                  <tr key={event._id}>
                    <td>{(currentPage - 1) * pageSize + index + 1}</td>
                    <td>{event.name}</td>
                    <td>{event.date ? new Date(event.date).toLocaleDateString("en-US") : "N/A"}</td>
                    {/* <td>{event.time}</td> */}
                    <td>{event.description}</td>
                    {/* <td>{event.Price}</td> */}

                    {/* <td>{event.city}</td> */}
                    <td>
                      {event.status === 1 ? (
                        <span className="text-success">
                          <CheckCircle /> Active
                        </span>
                      ) : (
                        <span className="text-danger">
                          <XCircle  /> Inactive
                        </span>
                      )}
                    </td>


                    <td>
                      <OverlayTrigger
  placement="top"
  overlay={<Tooltip>Manage videos for this playlist </Tooltip>}
>
  <Link href={`/admin/yoga_video/Yoga/view/${event._id}`} passHref>
    <Button
      variant="outline-primary"
      size="sm"
      className="me-2"
    >
      Manage Yoga Videos
    </Button>
  </Link>
</OverlayTrigger>

                      <Link href={`/admin/yoga_video/Yoga/edit/${event._id}`}>
                        <PencilSquare size={20} style={{ marginRight: "10px" }} />
                      </Link>

                      <span
                        onClick={() => confirmDelete(event._id)}
                        style={{
                          cursor: "pointer",
                          color: "#624bff",
                          marginRight: "10px",
                        }}
                      >
                        <Trash size={20} />
                      </span>

{/* ✅ Toggle Status Icon with Tooltip */}
<OverlayTrigger
  placement="top"
  overlay={
    <Tooltip>
      {event.status === 1 ? "Deactivate Playlist" : "Activate Playlist"}
    </Tooltip>
  }
>
  <span
    onClick={() => confirmUpdate(event._id, event.status)}
    style={{
      cursor: "pointer",
      color: event.status === 1 ? "red" : "green",
      marginRight: "10px",
    }}
  >
    {event.status === 1 ? <XCircle /> : <CheckCircle />}
  </span>
</OverlayTrigger>


                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="text-center">
                    No events found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>

          {/* Pagination */}
          <Pagination className="justify-content-center mt-4">
            <Pagination.First
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
            />
            <Pagination.Prev
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            />
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Pagination.Item
                key={page}
                active={page === currentPage}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </Pagination.Item>
            ))}
            <Pagination.Next
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            />
            <Pagination.Last
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
            />
          </Pagination>
        </Col>
      </Row>
    </Container>
  );
}
