"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Table, Button, Container, Row, Col, Pagination } from "react-bootstrap";
import { Eye, Trash ,PencilSquare} from "react-bootstrap-icons";
import Swal from "sweetalert2";
import { config } from "services/config";
import { postApi } from "services/api";

export default function Talks() {
  const [talks, setTalks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchTalks(currentPage);
  }, [currentPage]);

  const fetchTalks = async (page) => {
    try {
      const response = await postApi(config.GetTalks, { page, pageSize });
      console.log("Response",response)
      setTalks(response.resultWithUrls || []);
      setTotalPages(response.totalPages || 1);
    } catch (err) {
      console.error("Error fetching talks:", err);
    }
  };

  const confirmDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This talk will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteTalk(id);
        Swal.fire("Deleted!", "Talk has been deleted.", "success");
      }
    });
  };

  const deleteTalk = async (id) => {
    try {
      await postApi(config.DeleteTalks, { id });
      fetchTalks(currentPage);
    } catch (error) {
      console.error("Error deleting talk:", error);
    }
  };

  return (
    <Container fluid className="p-4">
      <Row className="align-items-center mb-4">
        <Col>
          <h2>Talks</h2>
        </Col>
        <Col className="d-flex justify-content-end">
          <Link href="/admin/Talks/add-talks" passHref>
            <Button variant="success">Add New Talk</Button>
          </Link>
        </Col>
      </Row>

      <Table hover responsive className="text-nowrap">
        <thead>
          <tr>
            <th>#</th>
            <th>Title</th>
            <th>Image</th>
            <th>Video Link</th>
            <th>Description</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {talks.map((talk, index) => (
            <tr key={talk._id}>
              <td>{(currentPage - 1) * pageSize + index + 1}</td>
              <td>{talk.title}</td>
              <td>
                <img
                  src={`${process.env.NEXT_PUBLIC_API_URL}/${talk.image}`}
                  width={50}
                  height={50}
                  alt="talk image"
                />
              </td>
              <td>{talk.video_link}</td>
              {/* <td>{talk.description}</td> */}
               <td dangerouslySetInnerHTML={{ __html: talk.description }}></td>
              <td style={{ color: talk.status === 1 ? "green" : "red" }}>
                {talk.status === 1 ? "Active" : "Inactive"}
              </td>
              <td>
                <Link href={`/admin/Talks/view/${talk._id}`}>
                  <Eye size={20} className="me-2" />
                </Link>
                <Link
                      href={`/admin/Talks/edit/${talk._id}`}
                    >
                      <PencilSquare size={20} style={{ marginRight: "10px" }} />
                    </Link>
                <span
                  onClick={() => confirmDelete(talk._id)}
                  style={{ cursor: "pointer", color: "#624bff" }}
                >
                  <Trash size={20} />
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Pagination className="justify-content-center mt-4">
        <Pagination.First
          onClick={() => setCurrentPage(1)}
          disabled={currentPage === 1}
        />
        <Pagination.Prev
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
        />
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <Pagination.Item
            key={page}
            active={page === currentPage}
            onClick={() => setCurrentPage(page)}
          >
            {page}
          </Pagination.Item>
        ))}
        <Pagination.Next
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
        />
        <Pagination.Last
          onClick={() => setCurrentPage(totalPages)}
          disabled={currentPage === totalPages}
        />
      </Pagination>
    </Container>
  );
}