"use client";

import { useState, useEffect, useRef } from "react";
import {
  Col,
  Row,
  Table,
  Button,
  Container,
  Pagination,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import {
  Eye,
  Trash,
  PencilSquare,
  Power,
} from "react-bootstrap-icons";
import Link from "next/link";
import Swal from "sweetalert2";
import { config } from "services/config";
import { postApi } from "services/api";

export default function Services() {
  const [services, setServices] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const hasFetched = useRef(false);

  useEffect(() => {
    fetchServices(currentPage);
  }, [currentPage]);

  
  // keep display to 20 chars; preserve full value in tooltip
  const truncate = (str = "", max = 20) =>
    typeof str === "string" && str.length > max ? `${str.slice(0, max)}...` : str;

  const fetchServices = async (page) => {
    try {
      const endpoint = config.AllServices;
      const data = { page, pageSize };
      const response = await postApi(endpoint, data);
      setServices(response?.data || []);
      setTotalPages(response?.totalPages || 1);
    } catch (error) {
      console.error("Error fetching services:", error);
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
        deleteService(id);
        Swal.fire("Deleted!", "Service has been deleted.", "success");
      }
    });
  };

  const deleteService = async (id) => {
    try {
      const endpoint = config.DeleteService;
      const data = { id };
      await postApi(endpoint, data);
      fetchServices(currentPage);
    } catch (error) {
      console.error("Error deleting service:", error);
    }
  };

  const confirmToggleStatus = (id, currentStatus) => {
    const newStatusText = currentStatus === 1 ? "Inactive" : "Active";
    Swal.fire({
      title: "Are you sure?",
      text: `Change status to ${newStatusText}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#aaa",
      confirmButtonText: "Yes, change it!",
    }).then((result) => {
      if (result.isConfirmed) {
        toggleStatus(id);
      }
    });
  };

  const toggleStatus = async (id) => {
    try {
      const endpoint = `${config.ToggleStatus}/${id}`;
      await postApi(endpoint, {});
      fetchServices(currentPage);
      Swal.fire("Updated!", "Service status has been updated.", "success");
    } catch (error) {
      console.error("Error toggling status:", error);
      Swal.fire("Error", "Failed to update status.", "error");
    }
  };

  const handlePageChange = (page) => setCurrentPage(page);

  return (
    <Container fluid className="p-6">
      <Row className="align-items-center mb-4">
        <Col>
          <h2>Services</h2>
        </Col>
        <Col className="d-flex justify-content-end">
          <Link href="/admin/Services-Management/add-services" passHref>
            <Button variant="success">Add New Service</Button>
          </Link>
        </Col>
      </Row>

      <Row>
        <Col xl={12} lg={12} md={12} sm={12}>
          <Table hover responsive className="text-nowrap">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Type</th>
                <th>Price</th>
                {/* <th>Image</th> */}
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service, index) => (
                <tr key={service._id}>
                  <td>{(currentPage - 1) * pageSize + index + 1}</td>
 <td>
                    <OverlayTrigger
                      placement="top"
                      overlay={
                        <Tooltip id={`tip-svc-name-${service._id}`}>
                          {service.name || ""}
                        </Tooltip>
                      }
                    >
                      <span title={service.name || ""}>
                        {truncate(service.name, 20)}
                      </span>
                    </OverlayTrigger>
                  </td>
                  <td>
                    <OverlayTrigger
                      placement="top"
                      overlay={
                        <Tooltip id={`tip-svc-type-${service._id}`}>
                          {service.service_type?.name || ""}
                        </Tooltip>
                      }
                    >
                      <span title={service.service_type?.name || ""}>
                        {truncate(service.service_type?.name || "", 20)}
                      </span>
                    </OverlayTrigger>
                  </td>
                  <td>{service.price || '0'}$</td>
                  {/* <td>
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL}/${service.file}`}
                      width={50}
                      height={50}
                    />
                  </td> */}
                  <td style={{ color: service.status === 1 ? "green" : "red" }}>
                    {service.status === 1 ? "Active" : "Inactive"}
                  </td>
                  <td>
                    <Link href={`/admin/Services-Management/view/${service._id}`}>
                      <Eye size={20} style={{ marginRight: "10px" }} />
                    </Link>
                    <Link href={`/admin/Services-Management/edit/${service._id}`}>
                      <PencilSquare size={20} style={{ marginRight: "10px" }} />
                    </Link>
                    <span
                      onClick={() => confirmToggleStatus(service._id, service.status)}
                      style={{ cursor: "pointer", marginRight: "10px" }}
                    >
                      <Power size={20} color={service.status === 1 ? "green" : "red"} />
                    </span>
                    {/* <span
                      onClick={() => confirmDelete(service._id)}
                      style={{ cursor: "pointer", color: "#624bff" }}
                    >
                      <Trash size={20} />
                    </span> */}
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