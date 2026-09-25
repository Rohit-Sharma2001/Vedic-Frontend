'use client';

import { useState, useEffect } from 'react';
import { Col, Row, Form, Table, Button, Container, Modal, Pagination } from 'react-bootstrap';
import { Trash } from 'react-bootstrap-icons';
import Swal from 'sweetalert2';
import { config } from 'services/config';
import { postApi } from 'services/api';

export default function AddOnManagement() {
  const [addons, setAddons] = useState([]);
  const [showModal, setShowModal] = useState(false);
 const [formData, setFormData] = useState({
   name: '',
   description: '',
   duration: '',
   price: '',
   note: ''
 });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchAddOns(currentPage);
  }, [currentPage]);

  const fetchAddOns = async (page) => {
    try {
      const response = await postApi(config.AllAddOns, { page, pageSize });
      console.log("all addons",response)
      setAddons(response.data || []);
      // setTotalPages(response.totalPages || 1);
    } catch (error) {
      console.error('Error fetching addons:', error);
    }
  };

  const confirmDelete = (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "This will permanently delete the add-on.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        deleteAddOn(id);
        Swal.fire('Deleted!', 'Add-on has been deleted.', 'success');
      }
    });
  };

  const deleteAddOn = async (id) => {
    try {
      await postApi(config.DeleteAddOn, { id });
      fetchAddOns(currentPage);
    } catch (error) {
      console.error('Error deleting add-on:', error);
    }
  };

  const handleShow = () => setShowModal(true);
  const handleClose = () => {
    setShowModal(false);
setFormData({
   name: '',
   description: '',
   duration: '',
   price: '',
   note: ''
 });

  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddAddOn = async () => {
    try {
      await postApi(config.CreateAddOns, formData);
      handleClose();
      fetchAddOns(currentPage);
    } catch (error) {
      console.error('Error adding add-on:', error);
      alert(error.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <Container fluid className="p-4">
      <Row className="align-items-center mb-4">
        <Col><h2>Add-On Management</h2></Col>
        <Col className="d-flex justify-content-end">
          <Button variant="success" onClick={handleShow}>Add Add-On</Button>
        </Col>
      </Row>

      <Table hover responsive>
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            {/* <th>Description</th> */}
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {addons.map((item, index) => (
            <tr key={item._id}>
              <td>{(currentPage - 1) * pageSize + index + 1}</td>
              <td>{item.name}</td>
              {/* <td>{item.description}</td> */}
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
        <Modal.Header closeButton><Modal.Title>Add Add-On</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Add-On Name</Form.Label>
            <Form.Control type="text" name="name" value={formData.name} onChange={handleInputChange} />
          </Form.Group>

          <Form.Group className="mb-3">
   <Form.Label>Duration (in Mins)</Form.Label>
   <Form.Control
     type="text"
     name="duration"
     value={formData.duration}
     onChange={handleInputChange}
   />
 </Form.Group>

 <Form.Group className="mb-3">
   <Form.Label>price (in $)</Form.Label>
   <Form.Control
     type="number"
     name="price"
     value={formData.price}
     onChange={handleInputChange}
   />
 </Form.Group>

 <Form.Group className="mb-3">
   <Form.Label>Note</Form.Label>
   <Form.Control
     as="textarea"
     rows={3}
     name="note"
     value={formData.note}
     onChange={handleInputChange}
   />
 </Form.Group>
         
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>Close</Button>
          <Button variant="primary" onClick={handleAddAddOn}>Add</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
