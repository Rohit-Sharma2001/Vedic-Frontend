"use client";

import { useState, useEffect } from "react";
import { Col, Row, Table, Button, Container } from "react-bootstrap";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { Eye, PencilSquare, Trash } from "react-bootstrap-icons";
import { config } from "services/config";
import { getApi, postApi } from "services/api";
import Swal from "sweetalert2";

export default function TeamMembers() {
  const router = useRouter();
  const [dataItems, setDataItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('loggedIn') === 'false';
    if (isLoggedIn) {
        router.push('/Log-in');
    }
    fetchData(currentPage);
  }, [currentPage]);

  const fetchData = async (page) => {
    try {
      const endpoint = config.AllFamilyMember;
      
      const response = await getApi(endpoint);
      console.log(response)
      setDataItems(response || []);
    
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const truncateText = (text, maxLength) => {
    return text?.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
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
        deleteData(id);
        Swal.fire("Deleted!", "The member has been deleted.", "success");
      }
    });
  };

  const deleteData = async (id) => {
    try {
      const endpoint = config.DeleteFamilyMember;
      const data = { id };
      await postApi(endpoint, data);
      fetchData(currentPage);
    } catch (error) {
      console.error("Error deleting data:", error);
    }
  };

  return (
    <Container fluid className="p-6">
      <Row className="align-items-center mb-4">
        <Col>
          <h2>Team Members</h2>
        </Col>
        <Col className="d-flex justify-content-end">
          <Link href="/admin/cms/Family/add-members" passHref>
            <Button variant="success">Add New Member</Button>
          </Link>
        </Col>
      </Row>

      <Row>
        <Col xl={12}>
          <Table hover responsive className="text-nowrap">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Expertise</th>
                {/* <th>Description</th> */}
                <th>Image</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {dataItems?.map((item, index) => (
                <tr key={item.id}>
                  <td>{(currentPage - 1) * pageSize + index + 1}</td>
                  <td>{item.name}</td>
                  <td>{item.experties}</td>
                  {/* <td>{truncateText(item.description, 40)}</td> */}
                  <td>
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL}/${item.file}`}
                      height={50}
                      width={100}
                      alt={item.name}
                    />
                  </td>
                  <td>
                    
                    <Link href={`/admin/cms/Family/edit/${item._id}`}>
                      <PencilSquare size={20} style={{ marginRight: "10px" }} />
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
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
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
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
}