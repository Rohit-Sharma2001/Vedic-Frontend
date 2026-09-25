'use client';

import { useState, useEffect } from 'react';
import { Col, Row, Form, Table, Button, Container, Modal, Pagination, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Trash,Power, PencilSquare} from 'react-bootstrap-icons';
import Swal from 'sweetalert2';
import { config } from 'services/config';
import { postApi } from 'services/api';

export default function ServiceTypeList() {
    const [serviceTypeList, setServiceTypeList] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [search, setSearch] = useState("");

const [editId, setEditId] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);

    // keep display at 20 characters with ellipsis
  const truncate = (str = '', max = 20) =>
    typeof str === 'string' && str.length > max ? `${str.slice(0, max)}...` : str;
    useEffect(() => { fetchServiceTypes(currentPage); }, [currentPage]);

   const fetchServiceTypes = async (page, searchValue = search) => {
  try {
    const endpoint = config.AllServiceTypes;
    const data = { page, pageSize, search: searchValue };  // <-- ADDED
    const response = await postApi(endpoint, data);

    setServiceTypeList(response.data || []);
    setTotalPages(response.totalPages || 1);
  } catch (error) {
    console.error("Error fetching service types:", error);
  }
};


    const confirmDelete = (id) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                deleteServiceType(id);
                Swal.fire('Deleted!', 'Service Type has been deleted.', 'success');
            }
        });
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
        const endpoint = config.ToggleServiceTypeStatus; // <-- NEW CONFIG
        await postApi(endpoint, { id });

        fetchServiceTypes(currentPage);

        Swal.fire("Updated!", "Status has been updated.", "success");
    } catch (error) {
        console.error("Error toggling status:", error);
        Swal.fire("Error", "Failed to update status.", "error");
    }
};

    const deleteServiceType = async (id) => {
        try {
            const endpoint = config.DeleteServiceType;
            await postApi(endpoint, { id });
            fetchServiceTypes(currentPage);
        } catch (error) { console.error('Error deleting service type:', error); }
    };

    const handleEdit = (type) => {
  setIsEdit(true);
  setEditId(type._id);
  setFormData({
    name: type.name,
    description: type.description,
  });
  setShowModal(true);
};

const handleUpdateServiceType = async () => {
  const data = {
    name: formData.name,
    description: formData.description,
  };

  try {
    await postApi(`${config.UpdateServicesType}/${editId}`, data);

    Swal.fire({
      icon: "success",
      title: "Updated!",
      text: "Service Type updated successfully.",
      timer: 1500,
      showConfirmButton: false,
    });

    handleClose();
    fetchServiceTypes(currentPage);
  } catch (error) {
    console.error("Error updating service type:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: error.response?.data?.message || "Update failed!",
    });
  }
};



 const handleShow = () => {
  setShowModal(true);
  setIsEdit(false);
  setEditId(null);
};

const handleClose = () => {
  setShowModal(false);
  setIsEdit(false);
  setEditId(null);
  setFormData({ name: '', description: '' });
};


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleAddServiceType = async () => {
        const data = {
            name: formData.name,
            description: formData.description,
           };

        try {
            await postApi(config.AddServiceType, data);
            handleClose();
            fetchServiceTypes(currentPage);
        } catch (error) {
            console.error('Error adding service type:', error);
            alert(error.response?.data?.message || 'Error occurred');
        }
    };

    return (
        <Container fluid className="p-6">
            <Row className="align-items-center mb-4">
                <Col><h2>Service Types</h2></Col>
                <Col className="d-flex justify-content-end">
                    <Button variant="success" onClick={handleShow}>Add Service Type</Button>
                </Col>
            </Row>

<Row className="mb-3">
  <Col md={4}>
    <Form.Control
      type="text"
      placeholder="Search by name..."
      value={search}
      onChange={(e) => {
        setSearch(e.target.value);
        fetchServiceTypes(1, e.target.value);  // live search
      }}
    />
  </Col>

 

  <Col md="auto">
    <Button
      variant="secondary"
      onClick={() => {
        setSearch("");
        fetchServiceTypes(1, "");
      }}
    >
      Reset
    </Button>
  </Col>
</Row>

            <Table hover responsive>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {serviceTypeList.map((type, index) => (
                        <tr key={type._id}>
                            <td>{(currentPage - 1) * pageSize + index + 1}</td>
                          <td>
                              <OverlayTrigger
                                placement="top"
                                overlay={<Tooltip id={`tip-name-${type._id}`}>{type.name}</Tooltip>}
                              >
                                {/* title attr = native fallback if JS/Overlay fails */}
                                <span title={type.name}>
                                  {truncate(type.name, 20)}
                                </span>
                              </OverlayTrigger>
                            </td>
                            <td>{type.description}</td>
                            <td style={{ color: type.status === 1 ? "green" : "red" }}>
    {type.status === 1 ? "Active" : "Inactive"}
</td>

                            <td>
                                <div className='d-flex'> 
    {/* Toggle Status */}
    <span
        onClick={() => confirmToggleStatus(type._id, type.status)}
        style={{ cursor: "pointer", marginRight: "10px" }}
    >
        <Power size={20} color={type.status === 1 ? "green" : "red"} />
    </span>

    <span
  onClick={() => handleEdit(type)}
  style={{ cursor: "pointer", marginRight: "10px", color: "#198754" }}
>
  
   <PencilSquare size={20}  />
</span>

    {/* Delete */}
    {/* <span onClick={() => confirmDelete(type._id)} style={{ cursor: 'pointer', color: '#624bff' }}>
        <Trash size={20} />
    </span> */}
    </div>
</td>

                        </tr>
                    ))}
                </tbody>
            </Table>

            <Pagination className="justify-content-center mt-4">
                <Pagination.First  onClick={() => {
    setCurrentPage(1);
    fetchServiceTypes(1, search);  // <-- send search
  }} disabled={currentPage === 1} />
                <Pagination.Prev 
                 onClick={() => {
    setCurrentPage(currentPage - 1);
    fetchServiceTypes(currentPage - 1, search);  // <-- send search
  }} disabled={currentPage === 1} />
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Pagination.Item
                        key={page}
                        active={page === currentPage}
                       onClick={() => {
    setCurrentPage(page);
    fetchServiceTypes(page, search);  // <-- send search
  }}
                    >{page}</Pagination.Item>
                ))}
                <Pagination.Next 
                 onClick={() => {
    setCurrentPage(currentPage + 1);
    fetchServiceTypes(currentPage + 1, search);  // <-- send search
  }}disabled={currentPage === totalPages} />
                <Pagination.Last  onClick={() => {
    setCurrentPage(totalPages);
    fetchServiceTypes(totalPages, search);  // <-- send search
  }} disabled={currentPage === totalPages} />
            </Pagination>

            <Modal show={showModal} onHide={handleClose}>
                <Modal.Header closeButton><Modal.Title>{isEdit ? "Edit Service Type" : "Add Service Type"}</Modal.Title>
</Modal.Header>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>Name</Form.Label>
                        <Form.Control type="text" name="name" value={formData.name} onChange={handleInputChange} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Description</Form.Label>
                        <Form.Control as="textarea" rows={4} name="description" value={formData.description} onChange={handleInputChange} />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>Close</Button>

<Button
  variant="primary"
  onClick={isEdit ? handleUpdateServiceType : handleAddServiceType}
>
  {isEdit ? "Update" : "Add"}
</Button>

                </Modal.Footer>
            </Modal>
        </Container>
    );
}
