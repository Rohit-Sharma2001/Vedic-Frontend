"use client";
import { useState, useEffect } from "react";
import { Col, Row, Table, Button, Container } from "react-bootstrap";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { Eye, PencilSquare, Trash } from "react-bootstrap-icons";
import { config } from "services/config";
import { postApi } from "services/api";
import Swal from "sweetalert2";

export default function ProjectSection() {
  const router = useRouter();
  const [dataItems, setDataItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('loggedIn') === 'false';
    if (isLoggedIn) router.push('/Log-in');
    fetchData(currentPage);
  }, [currentPage]);

  const fetchData = async (page) => {
    try {
      const res = await postApi(config.GetProjectSections, {});
      console.log("projec sections",res)
      setDataItems(res.resultWithUrls || []);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      console.error("Error fetching data:", err);
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
        deletedata(id);
        Swal.fire("Deleted!", "Project has been deleted.", "success");
      }
    });
  };

  const deletedata = async (id) => {
    try {
      const res = await postApi(config.DeleteProjectSections, { id });
      fetchData();
    } catch (err) {
      console.error("Error deleting project section:", err);
    }
  };

  const truncate = (text, len) => text?.length > len ? text.slice(0, len) + "..." : text;

  return (
    <Container fluid className="p-6">
      <Row className="align-items-center mb-4">
        <Col><h2>Project Section</h2></Col>
        <Col className="d-flex justify-content-end">
          <Link href="/admin/Master/ProjectSection/add-projectsection" passHref>
            <Button variant="success">Add New Project</Button>
          </Link>
        </Col>
      </Row>

      <Table hover responsive className="text-nowrap">
        <thead>
          <tr>
            <th>#</th>
            <th>Heading</th>
            <th>Text</th>
            <th>Description</th>
            <th>Image</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {dataItems.map((item, index) => (
            <tr key={item._id}>
              <td>{(currentPage - 1) * pageSize + index + 1}</td>
              <td>{item.heading}</td>
              <td>{item.text}</td>
              <td>{truncate(item.description, 30)}</td>
              <td>
                <img
                  src={`${process.env.NEXT_PUBLIC_API_URL}/${item.image}`}
                  height={50}
                  width={100}
                  alt="project-image"
                />
              </td>
              <td>
                <Link href={`/admin/Master/ProjectSection/view/${item._id}`}>
                  <Eye size={20} className="me-2" />
                </Link>
                <Link href={`/admin/Master/ProjectSection/edit/${item._id}`}>
                  <PencilSquare size={20} className="me-2" />
                </Link>
                <span onClick={() => confirmDelete(item._id)} style={{ cursor: 'pointer', color: '#624bff' }}>
                  <Trash size={20} />
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Row className="justify-content-center mt-4">
        <Col xs="auto">
          <Button
            variant="secondary"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
          >
            Previous
          </Button>
        </Col>
        <Col xs="auto">
          Page {currentPage} of {totalPages}
        </Col>
        <Col xs="auto">
          <Button
            variant="secondary"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
          >
            Next
          </Button>
        </Col>
      </Row>
    </Container>
  );
}
