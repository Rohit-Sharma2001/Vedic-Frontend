// enquiry_management.page.tsx
"use client";

import { useState, useEffect } from "react";
import { Table, Button, Container, Pagination } from "react-bootstrap";
import { Trash } from "react-bootstrap-icons";
import Swal from "sweetalert2";
import { postApi } from "services/api";
import { config } from "services/config";

export default function Enquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchEnquiries(currentPage);
  }, [currentPage]);

  const fetchEnquiries = async (page) => {
    try {
      const endpoint = config.GetAllEnquiry;
      const data = { page, pageSize };
      const response = await postApi(endpoint, data);
      setEnquiries(response.enquiries || []);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      console.error("Error fetching enquiries:", error);
    }
  };

  const confirmDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteEnquiry(id);
      }
    });
  };

  const deleteEnquiry = async (id) => {
    try {
      const endpoint = config.DeleteEnquiry;
      const data = { id };
      await postApi(endpoint, data);
      fetchEnquiries(currentPage);
    } catch (error) {
      console.error("Error deleting enquiry:", error);
    }
  };

  return (
    <Container>
      <h2>Enquiries</h2>
      <Table hover responsive>
        <thead>
          <tr>
            <th>#</th>
            <th>Email</th>
            <th>First Name</th>
            <th>Phone</th>
            <th>Subject</th>
            <th>Message</th>
            <th>Date</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {enquiries.map((enquiry, index) => (
            <tr key={enquiry.id}>
              <td>{(currentPage - 1) * pageSize + index + 1}</td>
              <td>{enquiry.email}</td>
              <td>{enquiry.firstName}</td>
              <td>{enquiry.phone}</td>
              <td>{enquiry.subject}</td>
              <td>{enquiry.message}</td>
              <td>{new Date(enquiry.createdAt).toLocaleDateString("en-US")}</td>
              <td>
                <span
                  onClick={() => confirmDelete(enquiry._id)}
                  style={{ cursor: "pointer", color: "#d33" }}
                >
                  <Trash size={20} />
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Pagination className="justify-content-center mt-4">
        <Pagination.First onClick={() => setCurrentPage(1)} disabled={currentPage === 1} />
        <Pagination.Prev onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1} />
        {[...Array(totalPages)].map((_, i) => (
          <Pagination.Item key={i + 1} active={i + 1 === currentPage} onClick={() => setCurrentPage(i + 1)}>
            {i + 1}
          </Pagination.Item>
        ))}
        <Pagination.Next onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages} />
        <Pagination.Last onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} />
      </Pagination>
    </Container>
  );
}
