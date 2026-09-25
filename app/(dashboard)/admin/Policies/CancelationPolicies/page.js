'use client';

import { useState, useEffect } from 'react';
import { Col, Row, Table, Button, Container, Modal } from 'react-bootstrap';
import { PencilSquare } from 'react-bootstrap-icons';

import dynamic from 'next/dynamic';
import { config } from 'services/config';
import { postApi, postApiWithFile, updateApiWithFile } from 'services/api';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

export default function CancelationPolicy() {
  const [policyList, setPolicyList] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState({
    description: '',
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchPolicy(currentPage);
  }, [currentPage]);

  const fetchPolicy = async (page) => {
    try {
      const data = { dropdown_type: 'cancelation_policy', page, pageSize };
      const response = await postApi(config.category, data);

      setPolicyList(response.result || []);
      setTotalPages(response.totalPages || 1);
    } catch (err) {
      console.error('Fetch Error:', err);
    }
  };

  const handleShow = () => setShowModal(true);

  const handleClose = () => {
    setShowModal(false);
    setIsEdit(false);
    setEditId(null);
    setFormData({ description: '' });
  };

  const handleEdit = (item) => {
    setIsEdit(true);
    setEditId(item._id);
    setFormData({
      description: item.description || '',
    });
    setShowModal(true);
  };

  const handleAddPolicy = async () => {
    try{
      const data = {
        dropdown_type: 'cancelation_policy',
        description: formData.description,
      };

      await postApiWithFile(config.Addcategory, data, {});
      handleClose();
      fetchPolicy(currentPage);
    } catch (err) {
      console.error('Add Error:', err);
      alert(err.response?.data?.message || 'Add failed');
    }
  };

  const handleUpdatePolicy = async () => {
    try {
      const data = {
        dropdown_type: 'cancelation_policy',
        description: formData.description,
      };

      await updateApiWithFile(config.Updatecategory, editId, data, {});
      handleClose();
      fetchPolicy(currentPage);
    } catch (err) {
      console.error('Update Error:', err);
      alert(err.response?.data?.message || 'Update failed');
    }
  };

  return (
    <Container fluid className="p-6">
      <Row className="align-items-center mb-4">
        <Col><h2>Cancelation Policy</h2></Col>

        <Col className="d-flex justify-content-end">
          {policyList.length === 0 && (
            <Button variant="success" onClick={handleShow}>
              Add Policy
            </Button>
          )}
        </Col>
      </Row>

      <Table hover responsive>
        <thead>
          <tr>
            <th>#</th>
            <th>Policy Details</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {policyList.map((item, index) => (
            <tr key={item._id}>
              <td>{(currentPage - 1) * pageSize + index + 1}</td>

              <td>
                <div dangerouslySetInnerHTML={{ __html: item.description }} />
              </td>

              <td>
                <span
                  role="button"
                  onClick={() => handleEdit(item)}
                  style={{ cursor: 'pointer', color: '#198754' }}
                >
                  <PencilSquare size={20} />
                </span>
              </td>
            </tr>
          ))}

          {policyList.length === 0 && (
            <tr>
              <td colSpan="3" className="text-center text-muted">
                No policy added yet.
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={handleClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {isEdit ? 'Edit Privacy Policy' : 'Add Privacy Policy'}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <div className="mb-3">
            <label className="fw-bold mb-2">Policy Details</label>

            <ReactQuill
              theme="snow"
              value={formData.description}
              onChange={(value) =>
                setFormData({ ...formData, description: value })
              }
              style={{ height: '200px', marginBottom: '60px' }}
            />
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>Close</Button>

          <Button
            variant="primary"
            onClick={isEdit ? handleUpdatePolicy : handleAddPolicy}
          >
            {isEdit ? 'Update' : 'Add'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
