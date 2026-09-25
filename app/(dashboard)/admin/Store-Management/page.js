// File path: app/center/page.js

"use client";

import { useState, useEffect, useRef } from "react";
import {
  Col,
  Row,
  Form,
  Table,
  Button,
  Container,
  Pagination,
} from "react-bootstrap";
import { Eye, PencilSquare, Trash } from "react-bootstrap-icons";
import Link from "next/link";
import { config } from "services/config";
import { postApi } from "services/api";
import dynamic from "next/dynamic";
import Swal from "sweetalert2";

// Dynamically import ReactQuill to support SSR
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";

export default function Stores() {
  const [centerName, setCenterName] = useState("");
  const [openingTime, setOpeningTime] = useState("");
  const [closingTime, setClosingTime] = useState("");
  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [details, setDetails] = useState("");
  const [centers, setCenters] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const hasFetched = useRef(false);

  useEffect(() => {
    fetchCenters(currentPage);
  }, [currentPage]);

  const fetchCenters = async (page) => {
    try {
      const endpoint = config.centers;
      const data = {
        page,
        pageSize,
        centerName,
        openingTime,
        closingTime,
        address,
        phoneNumber,
        email,
        details,
      };
      const response = await postApi(endpoint, data);
      console.log(response);
      setCenters(response.CenterManagementWithUrls || []);
      setTotalPages(response.totalPages || 1);
      setTotalCount(response.totalCount || 0);
    } catch (error) {
      console.error("Error fetching centers:", error);
    }
  };

  const handleSearch = async () => {
    try {
      setCurrentPage(1);
      await fetchCenters(1);
    } catch (error) {
      console.error("Error during search:", error);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
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
        Swal.fire("Deleted!", "Your data has been deleted.", "success");
      }
    });
  };

  const deletedata = async (id) => {
    try {
      const endpoint = config.Deletecenter;
      const data = { id };
      await postApi(endpoint, data);
      fetchCenters(currentPage);
    } catch (error) {
      console.error("Error deleting coupon:", error);
    }
  };

  return (
    <Container fluid className="p-6">
      <Row className="align-items-center mb-4">
        <Col>
          <h2>Stores</h2>
        </Col>
        <Col className="d-flex justify-content-end">
          <Link href="Store-Management/add-store" passHref>
            <Button variant="success">Add New Store</Button>
          </Link>
        </Col>
      </Row>

      <Row>
        <Col xl={12} lg={12} md={12} sm={12}>
          {/* <div className="my-3">
                        <Form className="d-flex align-items-center gap-2">
                            <Form.Control
                                type="text"
                                placeholder="Search by Center Name"
                                value={centerName}
                                onChange={(e) => setCenterName(e.target.value)}
                            />
                            <Form.Control
                                type="time"
                                placeholder="Search by Opening Time"
                                value={openingTime}
                                onChange={(e) => setOpeningTime(e.target.value)}
                            />
                            <Form.Control
                                type="time"
                                placeholder="Search by Closing Time"
                                value={closingTime}
                                onChange={(e) => setClosingTime(e.target.value)}
                            />
                            <Form.Control
                                type="text"
                                placeholder="Search by Address"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                            />
                            <Form.Control
                                type="text"
                                placeholder="Search by Phone Number"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                            />
                            <Form.Control
                                type="email"
                                placeholder="Search by Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <ReactQuill
                                value={details}
                                onChange={setDetails}
                                placeholder="Enter details here..."
                            />
                            <Button variant="primary" onClick={handleSearch}>
                                Search
                            </Button>
                        </Form>
                    </div> */}

          <Table hover responsive className="text-nowrap">
            <thead>
              <tr>
                <th>#</th>
                <th>Store Name</th> {/* New Field */}
                <th>Opening Time</th> {/* New Field */}
                <th>Closing Time</th> {/* New Field */}
                {/* <th>Image</th> */}
                {/* <th>Address</th> */}
                <th>Phone Number</th>
                {/* <th>Email</th> */}
                <th>Details</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {centers.map((center, index) => (
                <tr key={center.id}>
                  <td>{(currentPage - 1) * pageSize + index + 1}</td>
                  <td>{center.centerName}</td> 
                  <td>{center.openingTime}</td> 
                  <td>{center.closingTime}</td> |
                  {/* <td>
                    <img
                      src={center.imageUrl}
                      height={50}
                      width={100}
                      alt={center.imageUrl}
                    />
                  </td> */}
                  {/* <td>{center.address}</td> */}
                  <td>{center.phone_number}</td>
                  {/* <td>{center.email}</td> */}
                  <td dangerouslySetInnerHTML={{ __html: center.details }}></td>
                  <td>
                    <Link href={`/admin/Store-Management/view/${center._id}`}>
                      <Eye size={20} style={{ marginRight: "10px" }} />
                    </Link>
                    <Link href={`/admin/Store-Management/edit/${center._id}`}>
                      <PencilSquare size={20} style={{ marginRight: "10px" }} />
                    </Link>
                    <span
                      onClick={() => confirmDelete(center._id)}
                      style={{
                        cursor: "pointer",
                        color: "#624bff",
                      }}
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
