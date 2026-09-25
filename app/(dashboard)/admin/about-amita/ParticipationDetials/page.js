"use client";
import { useState, useEffect } from "react";
import {
  Col,
  Row,
  Table,
  Button,
  Container,
  Pagination,
  Modal,
} from "react-bootstrap";
import { Eye } from "react-bootstrap-icons";
import { config } from "services/config";
import { postApi } from "services/api";

export default function ParticipationDetailsTable() {
  const [participants, setParticipants] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState(null);

    const parseCustomDate = (dateStr) => {
  if (!dateStr) return null;
  const [d, t] = dateStr.split(", ");
  const [day, month, year] = d.split("/");
  return new Date(`${year}-${month}-${day}T${t}`);
};
  useEffect(() => {
    fetchParticipants(currentPage);
  }, [currentPage]);

  const fetchParticipants = async (page) => {
    try {
      const endpoint = config.GetParticipation; // 👈 define in config.js
      const data = { page, pageSize };
      const response = await postApi(endpoint, data);

      setParticipants(response.result || []);
      setTotalPages(response.totalPages || 1);
      setTotalCount(response.totalCount || 0);
    } catch (error) {
      console.error("Error fetching participants:", error);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleView = (participant) => {
    setSelectedParticipant(participant);
    setShowModal(true);
  };

  return (
    <Container fluid className="p-6">
      <Row className="align-items-center mb-4">
        <Col>
          <h2>Participation Details</h2>
          <p className="text-muted">Total Records: {totalCount}</p>
        </Col>
      </Row>

      <Table hover responsive>
        <thead>
          <tr>
            <th>#</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>DOB</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {participants.map((p, index) => (
            <tr key={p._id}>
              <td>{(currentPage - 1) * pageSize + index + 1}</td>
              <td>{p.firstName}</td>
              <td>{p.lastName}</td>
              <td>{p.email}</td>
              <td>{p.phoneNumber}</td>
              <td>{new Date(p.dob).toLocaleDateString("en-US")}</td>
              <td>
                <Eye
                  size={20}
                  style={{ cursor: "pointer", color: "#624bff" }}
                  onClick={() => handleView(p)}
                />
              </td>
            </tr>
          ))}
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

      {/* Details Modal */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Participation Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedParticipant ? (
            <div className="row">
              <div className="col-md-6">
                <p><b>First Name:</b> {selectedParticipant.firstName}</p>
                <p><b>Last Name:</b> {selectedParticipant.lastName}</p>
                <p><b>Email:</b> {selectedParticipant.email}</p>
                <p><b>Phone:</b> {selectedParticipant.phoneNumber}</p>
              </div>
              <div className="col-md-6">
                <p><b>DOB:</b>{new Date(selectedParticipant.dob).toLocaleDateString("en-US")}</p>
                <p><b>Address:</b> {selectedParticipant.homeAddress}</p>
                <p><b>Card Number:</b> {selectedParticipant.cardNumber}</p>
                <p><b>Card Location:</b> {selectedParticipant.cardLocation}</p>
              </div>
            </div>
          ) : (
            <p>No participant selected.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
