'use client';

import { useState, useEffect } from 'react';
import { Col, Row, Form, Table, Button, Container, Modal, Pagination } from 'react-bootstrap';
import { Trash } from 'react-bootstrap-icons';
import Swal from 'sweetalert2';
import { config } from 'services/config';
import { postApi, postApiWithFile } from 'services/api';
import Select from 'react-select';

export default function ResourceManagement() {
  const [resources, setResources] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedCenter, setSelectedCenter] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    centerId: '',


  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

const [centers, setCenters] = useState([]);


useEffect(() => {
  fetchCenters();
}, []);


const fetchResources = async (page, centerId = null) => {
  try {
    const payload = {};
    if (centerId) payload.centerId = centerId; // only include when truthy

    const response = await postApi(config.AllResources, payload);
    setResources(response.data || []);
    setTotalPages(response.totalPages || 1);
  } catch (error) {
    console.error('Error fetching resources:', error);
  }
};


const fetchCenters = async () => {
  try {
    const response = await postApi(config.centers, { page: 1, pageSize: 100 });
    const centerList = response?.centers || [];
    const mappedCenters = centerList.map((center) => ({
      label: center.centerName,
      value: center._id,
    }));
    
    setCenters(mappedCenters);

    // ✅ Set default center and fetch its resources
    if (mappedCenters.length > 0) {
      const defaultCenterId = mappedCenters[0].value;
      setSelectedCenter(defaultCenterId);
      fetchResources(1, defaultCenterId);
    }
  } catch (err) {
    console.error("Failed to load centers", err);
  }
};

// add this effect (replaces ad-hoc fetchResources calls for paging/filter)
useEffect(() => {
  if (selectedCenter) {
    fetchResources(currentPage, selectedCenter);
  } else {
    fetchResources(currentPage, null); // fetch all if your API supports it
  }
}, [currentPage, selectedCenter]);


  const confirmDelete = (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "This will permanently delete the resource.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        deleteResource(id);
        Swal.fire('Deleted!', 'Resource has been deleted.', 'success');
      }
    });
  };

 
const deleteResource = async (id) => {
  try {
    await postApi(config.DeleteResource, { id });
    fetchResources(currentPage, selectedCenter); // <-- keep filter
  } catch (error) {
    console.error('Error deleting resource:', error);
  }
};


 // replace handleShow
const handleShow = () => {
  setFormData((prev) => ({ ...prev, centerId: selectedCenter || '' }));
  setShowModal(true);
};

  const handleClose = () => {
    setShowModal(false);
    setFormData({ name: '', description: '', centerId: '' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };


const handleAddResource = async () => {
  try {
    // if your endpoint is different, keep it; ideally: config.CreateResource
    await postApi(config.CreateResource || config.CreateCenters, formData);
    handleClose();
    setCurrentPage(1);
    fetchResources(1, selectedCenter); // <-- keep filter
  } catch (error) {
    console.error('Error adding resource:', error);
    alert(error.response?.data?.message || 'Something went wrong');
  }
};


  return (
    <Container fluid className="p-4">
      <Row className="align-items-center mb-4">
        <Col><h2>Resources List</h2></Col>
        <Col className="d-flex justify-content-end">
          <Button variant="success" onClick={handleShow}>Add Resource</Button>
        </Col>
      </Row>

<Row className="mb-3">
  <Col md={4}>
    <Form.Group>
      <Form.Label>Filter by Center</Form.Label>
      <Select
  isClearable
  name="selectedCenter"
  options={centers}
  value={centers.find(c => c.value === selectedCenter) || null}
  onChange={(selected) => {
    const centerId = selected ? selected.value : null;
    setSelectedCenter(centerId);
    setCurrentPage(1); // paging reset; effect will re-fetch
  }}
/>

    </Form.Group>
  </Col>
</Row>

      <Table hover responsive>
        <thead>
          <tr>
            <th>#</th>
            <th>Title</th>
            {/* <th>Description</th> */}
            <th>Center</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {resources.map((item, index) => (
            <tr key={item._id}>
              <td>{(currentPage - 1) * pageSize + index + 1}</td>
              <td>{item.name}</td>
              {/* <td>{item.description}</td> */}
              <td>{item.centerId}</td>
              <td>
                <span onClick={() => confirmDelete(item._id)} style={{ cursor: 'pointer', color: '#624bff' }}>
                  <Trash size={20} />
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Pagination className="justify-content-center mt-4">
        <Pagination.First onClick={() => setCurrentPage(1)} disabled={currentPage === 1} />
        <Pagination.Prev onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1} />
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <Pagination.Item key={page} active={page === currentPage} onClick={() => setCurrentPage(page)}>
            {page}
          </Pagination.Item>
        ))}
        <Pagination.Next onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages} />
        <Pagination.Last onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} />
      </Pagination>

      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton><Modal.Title>Add Resource</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Resource Name</Form.Label>
            <Form.Control type="text" name="name" value={formData.name} onChange={handleInputChange} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control as="textarea" rows={3} name="description" value={formData.description} onChange={handleInputChange} />
          </Form.Group>
       <Form.Group className="mb-3">
  <Form.Label>Centers</Form.Label>
<Select
  isClearable
  name="centerId"
  options={centers}
  value={centers.find(c => c.value === formData.centerId) || null}
  onChange={(selected) =>
    setFormData((prev) => ({
      ...prev,
      centerId: selected ? selected.value : '',
    }))
  }
/>

</Form.Group>

        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>Close</Button>
          <Button variant="primary" onClick={handleAddResource}>Add</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
