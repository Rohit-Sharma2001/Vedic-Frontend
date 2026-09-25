'use client'
import { Col, Row, Table, Container, Button, Pagination,Spinner } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import { config } from 'services/config';
import { Badge, OverlayTrigger, Tooltip } from "react-bootstrap";
import {CheckCircle, XCircle } from "react-bootstrap-icons";
import { postApi } from 'services/api';
import Swal from 'sweetalert2';
import Link from 'next/link';
import { Eye, PencilSquare, Trash, Calendar2, Power } from 'react-bootstrap-icons';

export default function VedicUsers() {

  const [users, setUsers] = useState([]);
  const [allDeletedUsers, setAllDeletedUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [showDeletedUsers, setShowDeletedUsers] = useState(false);
  const [loading, setLoading] = useState(false);
const [selectedRole, setSelectedRole] = useState('');
const [roles, setRoles] = useState([]);

useEffect(() => {
    const fetchRoles = async () => {
        try {
            const response = await postApi(
                config.roleNameList,
                { data: btoa(JSON.stringify({})) }
            );

            if (response?.data) {
                setRoles(response.data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    fetchRoles();
}, []);

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
      const endpoint = config.getVedicAllUsers;

      const response = await postApi(`${endpoint}/${page - 1}`, {
        search: search,
         roleId: selectedRole
      });

      if (response.statusCode === 201) {
        setUsers(response.data);
        setTotalCount(response.total);
        setTotalPages(Math.ceil(response.total / pageSize));
        setLoading(false);
      }
      else{
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
      const endpoint = config.getAllDeletedUsersVedic;

      const response = await postApi(`${endpoint}/${page - 1}`, {
        search: search,
         roleId: selectedRole
      });

      if (response.statusCode === 201) {
        setUsers(response.data);
        setTotalCount(response.total);
        setTotalPages(Math.ceil(response.total / pageSize));
        setLoading(false);
      }
      else{
        setLoading(false);
      }
    } catch (error) {
        setLoading(false);
      console.error("Error fetching users:", error);
    }
  };


  useEffect(() => {
    
    if(showDeletedUsers) {fetchDeletedUsers(currentPage);
    }
    else{
      fetchUsers(currentPage);
    }
  }, [currentPage, search, showDeletedUsers, selectedRole]);

  const handleSearch = () => {
    setCurrentPage(1);
   
    if(showDeletedUsers) {fetchDeletedUsers(1);
    }else{
       fetchUsers(1);
    }
  };

  const handleReset = () => {
    setSearch("");
    setSelectedRole("");
    setCurrentPage(1);
    if(showDeletedUsers) {fetchDeletedUsers(1);
    }else{
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
    {/* {!showDeletedUsers && (
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
    )} */}
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
      <Col md={2}>
    <select
        className="form-select"
        value={selectedRole}
        onChange={(e) => setSelectedRole(e.target.value)}
    >
        <option value="">All</option>

        {roles?.map((role) => (
            <option key={role._id} value={role._id}>
                {role.roleName}
            </option>
        ))}
    </select>
</Col>
        <Col md="auto">
          <Button variant="secondary" onClick={handleReset}>Reset</Button>
        </Col>
        <Col className="d-flex justify-content-end">
          {!showDeletedUsers && <Link href="/admin/role/user/add" passHref>
            <Button  style={{marginRight:"10px"}} variant="success">Add New User</Button>
          </Link>}
           {/* <Link href="Blogs/add-blogs" passHref> */}
            <Button variant= {showDeletedUsers ? "success" : "danger"} onClick={()=>{showDeletedUsers ? setShowDeletedUsers(false) : setShowDeletedUsers(true);}}>{showDeletedUsers ? "Active Users" : "Deleted User"}</Button>
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
            <th>Role</th>
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
                <td>{ele.name || "N/A"}</td>
                <td>{ele?.lastName || "N/A"}</td>
                <td>{ele.email || "N/A"}</td>
                <td>{ele.mobileNo || "N/A"}</td>
                <td>{ele.role_name || "N/A"}</td>
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
                <td>{ele.name || "N/A"}</td>
                <td>{ele?.lastName || "N/A"}</td>
                <td>{ele.email || "N/A"}</td>
                <td>{ele.mobileNo || "N/A"}</td>
                <td>{ele.role_name || "N/A"}</td>
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
                        fontSize:"20px",
                        marginRight: "10px",
                      }}
                    >
                   {/* <Link href={`/admin/role/user/view/${ele._id}`}>
                    <Eye size={20} style={{ marginRight: '10px' }} />
                  </Link>  */}
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
                        fontSize:"20px",
                        marginRight: "10px",
                      }}
                    >
                    <Link href={`/admin/role/user/edit/${ele._id}`}>
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
                        fontSize:"20px",
                        marginRight: "10px",
                      }}
                    >
                      {/* {<XCircle />} */}
                      <Trash />
                    </span>
                  </OverlayTrigger>
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
    </Container>
  );
}
