'use client'
import { Col, Row, Table, Container, Button, Pagination, Spinner, Modal, Form, } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import { config } from 'services/config';
import { Badge, OverlayTrigger, Tooltip } from "react-bootstrap";
import { CheckCircle, XCircle } from "react-bootstrap-icons";
import { postApi, postApiWithFile } from "services/api";
import Swal from 'sweetalert2';
import Link from 'next/link';
import { Eye, PencilSquare, Trash, Calendar2, Power } from 'react-bootstrap-icons';
import Select from "react-select";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";

const ReactQuill = dynamic(
  () => import("react-quill"),
  { ssr: false }
);

export default function Users() {

  const [users, setUsers] = useState([]);
  const [allDeletedUsers, setAllDeletedUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [showDeletedUsers, setShowDeletedUsers] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPractitionerModal, setShowPractitionerModal] = useState(false);
  const [centersList, setCentersList] = useState([]);
  const [servicesList, setServicesList] = useState([]);

  const [practitionerFormData, setPractitionerFormData] = useState({
    userId: "",
    name: "",
    email: "",
    mobileNo: "",
    designation: "",
    expertise: "",
    description: "",
    centerId: [],
    services: [],
    working_days: [],
    working_time_start: "",
    working_time_end: "",
    status: 1,
    file: null,
  });

  const styles = {
    overlay: {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(255, 255, 255, 0.6)", // light blur effect
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 9999,
    },
  };

  const fetchUsers = async (page) => {
    setLoading(true);
    try {
      const endpoint = config.getUsers;

      const response = await postApi(`${endpoint}/${page - 1}`, {
        search: search
      });

      if (response.statusCode === 201) {
        setUsers(response.data);
        setTotalCount(response.total);
        setTotalPages(Math.ceil(response.total / pageSize));
        setLoading(false);
      }
      else {
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      console.error("Error fetching users:", error);
    }
  };

  const fetchDeletedUsers = async (page) => {
    setLoading(true);
    try {
      const endpoint = config.getAllDeletedUsers;

      const response = await postApi(`${endpoint}/${page - 1}`, {
        search: search
      });

      if (response.statusCode === 201) {
        setUsers(response.data);
        setTotalCount(response.total);
        setTotalPages(Math.ceil(response.total / pageSize));
        setLoading(false);
      }
      else {
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      console.error("Error fetching users:", error);
    }
  };


  useEffect(() => {

    if (showDeletedUsers) {
      fetchDeletedUsers(currentPage);
    }
    else {
      fetchUsers(currentPage);
    }
  }, [currentPage, search, showDeletedUsers]);

  useEffect(() => {
    fetchCenters();
  }, []);

  useEffect(() => {
    if (practitionerFormData.centerId?.length > 0) {
      fetchAllServices(practitionerFormData.centerId);
    } else {
      setServicesList([]);
    }
  }, [practitionerFormData.centerId]);

  const handleSearch = () => {
    setCurrentPage(1);

    if (showDeletedUsers) {
      fetchDeletedUsers(1);
    } else {
      fetchUsers(1);
    }
  };

  const handleReset = () => {
    setSearch("");
    setCurrentPage(1);
    if (showDeletedUsers) {
      fetchDeletedUsers(1);
    } else {
      fetchUsers(1);
    }
  };

  const confirmDelete = (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You want to delete this user!",
      icon: 'error',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        deleteUser(id);
        Swal.fire('Deleted!', 'Your user has been deleted.', 'success');
      }
    });
  };

  const deleteUser = async (id) => {
    try {
      const endpoint = config.deleteUser;
      const data = { id };
      await postApi(endpoint, data);
      fetchUsers(currentPage);
    } catch (error) {
      console.error('Error deleting coupon:', error);
    }
  };

  const confirmActivate = (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You want to Activate this user!",
      icon: 'success',
      showCancelButton: true,
      confirmButtonColor: '#198754',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, Activate it!',
    }).then((result) => {
      if (result.isConfirmed) {
        activateUser(id);
        Swal.fire('Deleted!', 'Your user is activated.', 'success');
      }
    });
  };

  const activateUser = async (id) => {
    try {
      const endpoint = config.activateUser;
      const data = { id };
      await postApi(endpoint, data);
      fetchDeletedUsers(currentPage);
    } catch (error) {
      console.error('Error deleting coupon:', error);
    }
  };

  const moveToPractitioner = async (id) => {
    try {
      const res = await postApi(config.userMoveToPractitioner, { _id: id });

      const response = res?.data || res;

      // 🔥 Open Practitioner Form
      if (response?.openPractitionerForm) {
        setPractitionerFormData({
          userId: response.data.userId,
          name: response.data.name,
          email: response.data.email,
          mobileNo: response.data.mobileNo,
        });

        setShowPractitionerModal(true);
        return;
      }

      // ✅ Move Successful
      if (response?.status) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: response.message,
        });

        fetchUsers(currentPage);
        return;
      }

      Swal.fire({
        icon: "warning",
        title: "Warning",
        text: response.message,
      });

    } catch (err) {
      console.error(err);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Something went wrong",
      });
    }
  };

  const confirmMoveToPractitioner = (id) => {
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
        moveToPractitioner(id);
      }
    });
  };
  

 const savePractitioner = async () => {
  try {
    const payload = {
      ...practitionerFormData,
    };

    const files = {};

    if (practitionerFormData.file) {
      files.file = practitionerFormData.file;
    }

    const response = await postApiWithFile(
      config.addPractitioner,
      payload,
      files
    );

    if (response?.statusCode === 201) {
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Practitioner added successfully",
      });

      setShowPractitionerModal(false);

      setPractitionerFormData({
        userId: "",
        name: "",
        email: "",
        mobileNo: "",
        designation: "",
        expertise: "",
        description: "",
        centerId: [],
        services: [],
        working_days: [],
        working_time_start: "",
        working_time_end: "",
        status: 1,
        file: null,
      });

      fetchUsers(currentPage);
    } else {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: response?.message || "Failed to add practitioner",
      });
    }
  } catch (error) {
    console.error(error);

    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Something went wrong",
    });
  }
};

  const fetchCenters = async () => {
    try {
      const response = await postApi(
        config.centers,
        {
          page: 1,
          pageSize: 100,
        }
      );

      const centers = response?.centers || [];

      setCentersList(
        centers.map((center) => ({
          label: center.centerName,
          value: center._id,
        }))
      );
    } catch (err) {
      console.error("Failed to load centers", err);
    }
  };


  const fetchAllServices = async (centerIds) => {
    try {
      const payload = {
        page: 1,
        pageSize: 100,
        centerId: centerIds,
      };

      const response = await postApi(
        config.AllServices,
        payload
      );

      setServicesList(
        response?.data?.map((svc) => ({
          label: svc.name,
          value: svc._id,
        })) || []
      );
    } catch (err) {
      console.error("Failed to load services", err);
    }
  };

  return (
    <Container fluid className="p-6">
      {/* {loading && <div className="text-center">
          <Spinner animation="border" variant="primary" />
        </div>} */}
      {loading && (
        <div style={styles.overlay}>
          <Spinner animation="border" variant="primary" />
        </div>
      )}

      <Row className="align-items-center mb-4">
        <Col><h2>Users</h2></Col>
        <Col className="d-flex justify-content-end">
    {!showDeletedUsers && (
      <Link href="/admin/orders/newOrder" passHref>
        <Button style={{ marginRight: "10px" }} variant="secondary">
         Place New Order
        </Button>
      </Link>
    )}
    {!showDeletedUsers && (
    <Link href="/admin/Practitioner-Dashboard" passHref>
      <Button style={{ marginRight: "10px" }} variant="secondary">
        New Appointment
      </Button>
    </Link>
    )}
     {!showDeletedUsers && (
    <Link href="/admin/email-subscribers" passHref>
      <Button style={{ marginRight: "10px" }} variant="secondary">
        Email Subscription
      </Button>
    </Link>
    )}
  </Col>
      </Row>


      {/* 🔍 Search + Reset */}
      <Row className="mb-3">
        <Col md={3}>
          <input
            type="text"
            placeholder="Search by name, email, or mobile..."
            className="form-control"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Col>

        <Col md="auto">
          <Button variant="secondary" onClick={handleReset}>Reset</Button>
        </Col>
        {/* <Col>
          <h2>Blogs</h2>
        </Col> */}
        <Col className="d-flex justify-content-end">
          {!showDeletedUsers && <Link href="/admin/users/user/add" passHref>
            <Button style={{ marginRight: "10px" }} variant="success">Add New User</Button>
          </Link>}
          {/* <Link href="Blogs/add-blogs" passHref> */}
          <Button variant={showDeletedUsers ? "success" : "danger"} onClick={() => { showDeletedUsers ? setShowDeletedUsers(false) : setShowDeletedUsers(true); }}>{showDeletedUsers ? "Active Users" : "Deleted User"}</Button>
          {/* </Link> */}
        </Col>
      </Row>

      <Table hover>
        <thead>
          <tr>
            <th>#</th>
            <th>First Name</th>
            <th>last Name</th>
            <th>E-mail</th>
            <th>Mobile</th>
            {/* <th>Status</th> */}
            <th>Actions</th>
          </tr>
        </thead>
        {showDeletedUsers ?
          <tbody>
            {users.length > 0 ? (
              users.map((ele, ind) => (
                <tr key={ind}>
                  <td>{(currentPage - 1) * pageSize + ind + 1}</td>
                  <td>{ele.name}</td>
                  <td>{ele?.lastName || ""}</td>
                  <td>{ele.email}</td>
                  <td>{ele.mobileNo}</td>
                  {/* <td style={{ color:  "red" }}>
               Inactive
                </td> */}


                  <td>
                    <Button variant="secondary"
                      onClick={() => confirmActivate(ele?._id)}
                    >Activate</Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center">No users found</td>
              </tr>
            )}
          </tbody>
          :
          <tbody>
            {users.length > 0 ? (
              users.map((ele, ind) => (
                <tr key={ind}>
                  <td>{(currentPage - 1) * pageSize + ind + 1}</td>
                  <td>{ele.name}</td>
                  <td>{ele?.lastName || ""}</td>
                  <td>{ele.email}</td>
                  <td>{ele.mobileNo}</td>
                  {/* <td style={{ color: ele.status === 1 ? "green" : "red" }}>
                  {ele.status === 1 ? "Active" : "Inactive"}
                </td> */}


                  <td>
                    <OverlayTrigger
                      placement="top"
                      overlay={
                        <Tooltip> View Details </Tooltip>
                      }
                    >
                      <span
                        // onClick={() => confirmUpdate(event._id, event.status)}
                        style={{
                          cursor: "pointer",
                          color: "red",
                          fontSize: "20px",
                          marginRight: "10px",
                        }}
                      >
                        <Link href={`/admin/users/user/view/${ele._id}`}>
                          <Eye size={20} style={{ marginRight: '10px' }} />
                        </Link>
                      </span>
                    </OverlayTrigger>

                    <OverlayTrigger
                      placement="top"
                      overlay={
                        <Tooltip> Edit User </Tooltip>
                      }
                    >
                      <span
                        // onClick={() => confirmUpdate(event._id, event.status)}
                        style={{
                          cursor: "pointer",
                          color: "red",
                          fontSize: "20px",
                          marginRight: "10px",
                        }}
                      >
                        <Link href={`/admin/users/user/edit/${ele._id}`}>
                          <PencilSquare size={20} style={{ marginRight: '10px' }} />
                        </Link>
                      </span>
                    </OverlayTrigger>

                    <OverlayTrigger
                      placement="top"
                      overlay={
                        <Tooltip> Delete User </Tooltip>
                      }
                    >
                      <span
                        onClick={() => confirmDelete(ele?._id)}
                        style={{
                          cursor: "pointer",
                          color: "red",
                          fontSize: "20px",
                          marginRight: "10px",
                        }}
                      >
                        {/* {<XCircle />} */}
                        <Trash />
                      </span>
                    </OverlayTrigger>
                    <button
                      onClick={() => confirmMoveToPractitioner(ele?._id)}
                      style={{
                        cursor: 'pointer',
                        backgroundColor: '#624bff',
                        color: '#fff',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '4px',
                      }}
                    >
                      Move to Practitioner
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center">No users found</td>
              </tr>
            )}
          </tbody>}
      </Table>

      {/* 🔢 Pagination */}
      {/* <Pagination className="justify-content-center mt-4">
        <Pagination.First          onClick={() => setCurrentPage(1)}          disabled={currentPage === 1}
        />        <Pagination.Prev          onClick={() => setCurrentPage(currentPage - 1)}          disabled={currentPage === 1}
        />        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <Pagination.Item            key={page}            active={page === currentPage}
            onClick={() => setCurrentPage(page)}          >            {page}
          </Pagination.Item>
        ))}        <Pagination.Next
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage === totalPages}
        />        <Pagination.Last
          onClick={() => setCurrentPage(totalPages)}
          disabled={currentPage === totalPages}
        />
      </Pagination> */}

      {/* 🔢 Pagination */}
      <Pagination className="justify-content-center mt-4">

        <Pagination.First
          onClick={() => setCurrentPage(1)}
          disabled={currentPage === 1}
        />

        <Pagination.Prev
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
        />

        {/* 🔥 Smart Page Range Logic */}
        {(() => {
          const maxVisible = 10; // show 10 pages at a time
          const startPage =
            Math.floor((currentPage - 1) / maxVisible) * maxVisible + 1;

          const endPage = Math.min(startPage + maxVisible - 1, totalPages);

          const pages = [];

          for (let i = startPage; i <= endPage; i++) {
            pages.push(
              <Pagination.Item
                key={i}
                active={i === currentPage}
                onClick={() => setCurrentPage(i)}
              >
                {i}
              </Pagination.Item>
            );
          }
          return pages;
        })()}
        <Pagination.Next
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage === totalPages}
        />
        <Pagination.Last
          onClick={() => setCurrentPage(totalPages)}
          disabled={currentPage === totalPages}
        />
      </Pagination>
      <Modal
        show={showPractitionerModal}
        onHide={() => setShowPractitionerModal(false)}
        size="xl"
        scrollable
      >
        <Modal.Header closeButton>
          <Modal.Title>Add Practitioner</Modal.Title>
        </Modal.Header>

        <Modal.Body>

          {/* Name & Email */}
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  value={practitionerFormData.name}
                  onChange={(e) =>
                    setPractitionerFormData({
                      ...practitionerFormData,
                      name: e.target.value,
                    })
                  }
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  value={practitionerFormData.email}
                  onChange={(e) =>
                    setPractitionerFormData({
                      ...practitionerFormData,
                      email: e.target.value,
                    })
                  }
                />
              </Form.Group>
            </Col>
          </Row>

          {/* Mobile & Designation */}
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Mobile Number</Form.Label>
                <Form.Control
                  type="text"
                  value={practitionerFormData.mobileNo}
                  onChange={(e) =>
                    setPractitionerFormData({
                      ...practitionerFormData,
                      mobileNo: e.target.value,
                    })
                  }
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Designation</Form.Label>
                <Form.Control
                  type="text"
                  value={practitionerFormData.designation}
                  onChange={(e) =>
                    setPractitionerFormData({
                      ...practitionerFormData,
                      designation: e.target.value,
                    })
                  }
                />
              </Form.Group>
            </Col>
          </Row>

          {/* Expertise */}
          <Row>
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label>Expertise</Form.Label>
                <Form.Control
                  type="text"
                  value={practitionerFormData.expertise}
                  onChange={(e) =>
                    setPractitionerFormData({
                      ...practitionerFormData,
                      expertise: e.target.value,
                    })
                  }
                />
              </Form.Group>
            </Col>
          </Row>

          {/* Centers */}
          <Row>
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label>Centers</Form.Label>

                <Select
                  isMulti
                  options={centersList}
                  value={centersList.filter((c) =>
                    practitionerFormData.centerId?.includes(c.value)
                  )}
                  onChange={(selected) =>
                    setPractitionerFormData({
                      ...practitionerFormData,
                      centerId: selected?.map((s) => s.value) || [],
                    })
                  }
                />
              </Form.Group>
            </Col>
          </Row>

          {/* Services */}
          <Row>
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label>Services</Form.Label>

                <Select
                  isMulti
                  options={servicesList}
                  value={servicesList.filter((s) =>
                    practitionerFormData.services?.includes(s.value)
                  )}
                  onChange={(selected) =>
                    setPractitionerFormData({
                      ...practitionerFormData,
                      services: selected?.map((s) => s.value) || [],
                    })
                  }
                />
              </Form.Group>
            </Col>
          </Row>

          {/* Working Days */}
          <Row>
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label>Working Days</Form.Label>

                <Select
                  isMulti
                  options={[
                    { label: "Mon", value: "Mon" },
                    { label: "Tue", value: "Tue" },
                    { label: "Wed", value: "Wed" },
                    { label: "Thu", value: "Thu" },
                    { label: "Fri", value: "Fri" },
                    { label: "Sat", value: "Sat" },
                    { label: "Sun", value: "Sun" },
                  ]}
                  value={
                    practitionerFormData.working_days?.map((d) => ({
                      label: d,
                      value: d,
                    })) || []
                  }
                  onChange={(selected) =>
                    setPractitionerFormData({
                      ...practitionerFormData,
                      working_days: selected.map((s) => s.value),
                    })
                  }
                />
              </Form.Group>
            </Col>
          </Row>

          {/* Time */}
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Start Time</Form.Label>
                <Form.Control
                  type="time"
                  value={practitionerFormData.working_time_start}
                  onChange={(e) =>
                    setPractitionerFormData({
                      ...practitionerFormData,
                      working_time_start: e.target.value,
                    })
                  }
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>End Time</Form.Label>
                <Form.Control
                  type="time"
                  value={practitionerFormData.working_time_end}
                  onChange={(e) =>
                    setPractitionerFormData({
                      ...practitionerFormData,
                      working_time_end: e.target.value,
                    })
                  }
                />
              </Form.Group>
            </Col>
          </Row>

          {/* Status */}
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>

                <Form.Select
                  value={practitionerFormData.status}
                  onChange={(e) =>
                    setPractitionerFormData({
                      ...practitionerFormData,
                      status: Number(e.target.value),
                    })
                  }
                >
                  <option value={1}>Active</option>
                  <option value={0}>Inactive</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          {/* Description */}
          <Row>
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>

                <ReactQuill
                  theme="snow"
                  value={practitionerFormData.description || ""}
                  onChange={(value) =>
                    setPractitionerFormData({
                      ...practitionerFormData,
                      description: value,
                    })
                  }
                />
              </Form.Group>
            </Col>
          </Row>

          {/* Profile Image */}
          <Row>
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label>Profile Image</Form.Label>

                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setPractitionerFormData({
                      ...practitionerFormData,
                      file: e.target.files[0],
                    })
                  }
                />
              </Form.Group>
            </Col>
          </Row>

        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowPractitionerModal(false)}
          >
            Cancel
          </Button>

          <Button
            variant="primary"
            onClick={savePractitioner}
          >
            Save Practitioner
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
