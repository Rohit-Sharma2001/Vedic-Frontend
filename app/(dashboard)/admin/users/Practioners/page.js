'use client';

import { useState, useEffect, useRef } from 'react';
import { Col, Row, Table, Button, Container, Pagination } from 'react-bootstrap';
import { Eye, PencilSquare, Trash, Calendar2, Power } from 'react-bootstrap-icons';
import Link from 'next/link';
import Swal from 'sweetalert2';
import { config } from 'services/config';
import { postApi } from 'services/api';

export default function PractitionersList() {
  const [practitioners, setPractitioners] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchPractitioners(currentPage);
  }, [currentPage]);

  const fetchPractitioners = async (page, searchText = search) => {
    try {
      const res = await postApi(config.GetEmployee, { search: searchText });

      const allData = res?.data?.employeeData || [];

      const start = (page - 1) * pageSize;
      const paginated = allData.slice(start, start + pageSize);

      const mapped = paginated.map((emp) => ({
        _id: emp._id,
        name: emp.user?.name || "N/A",
        email: emp.user?.email || "N/A",
        number: emp.user?.mobileNo || "N/A",
        salary: emp.salary?.hourlyRate || emp.salary || 0,
        status: emp.status || 0,
      }));

      setPractitioners(mapped);
      setTotalPages(Math.ceil(allData.length / pageSize));
    } catch (err) {
      console.error("Failed to fetch practitioners:", err);
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
        // ✅ Only call API here
        deletePractitioner(id);
      }
    });
  };

  const moveToUser = async (id) => {
    try {
      const res = await postApi(config.practitionersMoveToUser, { _id: id });

      // Normalize structure safely
      const statusCode = res?.statusCode ?? res?.data?.statusCode;
      const topMessage = res?.message ?? res?.data?.message;
      const payload = res?.data?.data ?? res?.data ?? {};
      const moveStatus = payload?.status;
      const moveMessage =
        payload?.message || topMessage || "Something went wrong";

      // 🟢 SUCCESS — Practitioner moved to user
      if (statusCode === 201) {
        Swal.fire({
          icon: "success",
          title: "Moved!",
          text: moveMessage || "Practitioner moved to user successfully.",
          timer: 1500,
          showConfirmButton: false,
        });

        // Remove from practitioner list
        setPractitioners((prev) => prev.filter((p) => p._id !== id));

        // Optional refresh
        setTimeout(() => fetchPractitioners(currentPage), 500);
        return;
      }

      // 🟡 Business validation failure
      if (moveStatus === false) {
        Swal.fire({
          icon: "warning",
          title: "Cannot Move",
          text: moveMessage,
          confirmButtonColor: "#3085d6",
        });
        return;
      }

      // 🔴 Unexpected edge case
      Swal.fire({
        icon: "error",
        title: "Error",
        text: moveMessage || "Failed to move practitioner.",
      });
    } catch (err) {
      console.error("Error moving practitioner:", err);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Something went wrong while moving practitioner.",
      });
    }
  };

  const confirmMoveToUser = (id) => {
  Swal.fire({
    title: "Move to User?",
    text: "This practitioner will be moved to the user list.",
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#624bff",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, move it!",
  }).then((result) => {
    if (result.isConfirmed) {
      moveToUser(id);
    }
  });
};


  const deletePractitioner = async (id) => {
    try {
      const res = await postApi(config.DeleteEmployee, { _id: id });

      // Normalize structure safely
      const statusCode = res?.statusCode ?? res?.data?.statusCode;
      const topMessage = res?.message ?? res?.data?.message;
      const payload = res?.data?.data ?? res?.data ?? {};
      const employeeStatus = payload?.status;
      const employeeMessage = payload?.message || topMessage || "Something went wrong";

      // 🟢 SUCCESS — Employee deleted
      if (employeeStatus === true) {
        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: employeeMessage,
          timer: 1500,
          showConfirmButton: false,
        });

        // Instantly update UI
        setPractitioners((prev) => prev.filter((p) => p._id !== id));

        // Optional background refresh to stay in sync with DB
        setTimeout(() => fetchPractitioners(currentPage), 500);
        return;
      }

      // 🟡 Has active appointments
      if (employeeStatus === false) {
        Swal.fire({
          icon: "warning",
          title: "Cannot Delete",
          text: employeeMessage || "Please delete all appointments first.",
          confirmButtonColor: "#3085d6",
        });
        return;
      }

      // 🔴 Unexpected edge case
      Swal.fire({
        icon: "error",
        title: "Error",
        text: employeeMessage || "Failed to delete practitioner.",
      });
    } catch (err) {
      console.error("Error deleting practitioner:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Something went wrong while deleting.",
      });
    }
  };


  const confirmToggleStatus = (id, currentStatus) => {
    const nextLabel = currentStatus === 1 ? "Inactive" : "Active";

    Swal.fire({
      title: "Are you sure?",
      text: `Change practitioner status to ${nextLabel}?`,
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
      const res = await postApi(config.ToggleEmployeeStatus, { id });

      Swal.fire({
        icon: "success",
        title: "Updated!",
        text: "Status has been updated.",
        timer: 1500,
        showConfirmButton: false,
      });

      fetchPractitioners(currentPage);
    } catch (error) {
      console.error("Error updating status:", error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to update status.",
      });
    }
  };







  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchPractitioners(page);
  };


  return (
    <Container fluid className="p-6">
      <Row className="align-items-center mb-4">
        <Col>
          <h2>Practitioners</h2>
        </Col>
        <Col className="d-flex justify-content-end">
          <Link href="/admin/users/Practioners/add-practioners" passHref>
            <Button variant="success">Add New Practitioner</Button>
          </Link>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={4}>
          <input
            type="text"
            className="form-control"
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Col>

        <Col md={2}>
          <Button
            variant="primary"
            onClick={() => {
              setCurrentPage(1);
              fetchPractitioners(1, search);
            }}
          >
            Search
          </Button>

        </Col>

        <Col md={2}>
          <Button
            variant="secondary"
            onClick={() => {
              setSearch("");
              setCurrentPage(1);
              fetchPractitioners(1, "");
            }}
          >
            Reset
          </Button>

        </Col>
      </Row>


      <Row>
        <Col xl={12} lg={12} md={12} sm={12}>
          <Table hover responsive className="text-nowrap">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Number</th>
                <th>Status</th>


                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {practitioners.map((p, index) => (
                <tr key={p._id}>
                  <td>{(currentPage - 1) * pageSize + index + 1}</td>
                  <td>{p.name}</td>
                  <td>{p.email}</td>
                  <td>{p.number}</td>
                  <td style={{ color: p.status === 1 ? "green" : "red" }}>
                    {p.status === 1 ? "Active" : "Inactive"}
                  </td>


                  <td>
                    <Link href={`/admin/users/Practioners/view/${p._id}`}>
                      <Eye size={20} style={{ marginRight: '10px' }} />
                    </Link>

                    <Link href={`/admin/users/Practioners/edit/${p._id}`}>
                      <PencilSquare size={20} style={{ marginRight: '10px' }} />
                    </Link>
                    {/* <Link href={`/admin/users/Practioners/practioner-calender/${p._id}`}>
                      <Calendar2 size={20} style={{ marginRight: '10px' }} />
                    </Link> */}

                    <span
                      onClick={() => confirmToggleStatus(p._id, p.status)}
                      style={{ cursor: "pointer", marginRight: "10px" }}
                    >
                      <Power size={20} color={p.status === 1 ? "green" : "red"} />
                    </span>
                    {/* <span
                      onClick={() => confirmDelete(p._id)}
                      style={{ cursor: 'pointer', color: '#624bff' }}
                    >
                      <Trash size={20} />
                    </span> */}
                    <button
                      onClick={() => confirmMoveToUser(p._id)}
                      style={{
                        cursor: 'pointer',
                        backgroundColor: '#624bff',
                        color: '#fff',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '4px',
                      }}
                    >
                      Move to User
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          <Pagination className="justify-content-center mt-4">
            <Pagination.First onClick={() => handlePageChange(1)} disabled={currentPage === 1} />
            <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Pagination.Item
                key={page}
                active={page === currentPage}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </Pagination.Item>
            ))}
            <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
            <Pagination.Last onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} />
          </Pagination>
        </Col>
      </Row>
    </Container>
  );
}