"use client";

import { useState, useEffect, useRef } from "react";
import {
  Col,
  Row,
  Table,
  Button,
  Container,
  Pagination,
} from "react-bootstrap";
import {
  Eye,
  PencilSquare,
  Trash,
} from "react-bootstrap-icons";
import Link from "next/link";
import Swal from "sweetalert2";
import { config } from "services/config";
import { postApi } from "services/api";

export default function YogaClasses() {
  const [classes, setClasses] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const hasFetched = useRef(false);

  useEffect(() => {
    fetchYogaClasses(currentPage);
  }, [currentPage]);

  const fetchYogaClasses = async (page) => {
    try {
      const endpoint = config.GetYogaClasses;
      const data = { page, pageSize };
      const response = await postApi(endpoint, data);
      setClasses(response.resultWithUrls || []);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      console.error("Error fetching yoga classes:", error);
    }
  };

  const confirmDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This yoga class will be deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteYogaClass(id);
        Swal.fire("Deleted!", "Yoga class has been deleted.", "success");
      }
    });
  };

  const deleteYogaClass = async (id) => {
    try {
      const endpoint = config.DeleteYogaClasses;
      const data = { id };
      await postApi(endpoint, data);
      fetchYogaClasses(currentPage);
    } catch (error) {
      console.error("Error deleting yoga class:", error);
    }
  };

  const handlePageChange = (page) => setCurrentPage(page);

  return (
    <Container fluid className="p-6">
      <Row className="align-items-center mb-4">
        <Col>
          <h2>Yoga Classes</h2>
        </Col>
        <Col className="d-flex justify-content-end">
          <Link href="/admin/Yoga-Classes/add-yogaclasses" passHref>
            <Button variant="success">Add New Class</Button>
          </Link>
        </Col>
      </Row>

      <Row>
        <Col xl={12} lg={12} md={12} sm={12}>
          <Table hover responsive className="text-nowrap">
            <thead>
              <tr>
                <th>#</th>
                <th>Title</th>
                <th>Description</th>
                <th>Image</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {classes.map((item, index) => (
                <tr key={item._id}>
                  <td>{(currentPage - 1) * pageSize + index + 1}</td>
                  <td>{item.title}</td>
                  {/* <td>{item.description}</td> */}
                   <td dangerouslySetInnerHTML={{ __html: item.description }}></td>
                  <td>
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL}/${item.image?.replace(/\\/g, "/")}`}
                      width={50}
                      height={50}
                      alt="Yoga"
                    />
                  </td>
                  <td>
                    <Link href={`/admin/Yoga-Classes/view/${item._id}`}>
                      <Eye size={20} className="me-2" />
                    </Link>
                    <Link href={`/admin/Yoga-Classes/edit/${item._id}`}>
                      <PencilSquare size={20} className="me-2" />
                    </Link>
                    <span
                      onClick={() => confirmDelete(item._id)}
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
