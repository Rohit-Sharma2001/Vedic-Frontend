'use client';

import { useState, useEffect } from 'react';
import { Col, Row, Form, Table, Button, Container, Modal, Pagination } from 'react-bootstrap';
import { Trash ,PencilSquare} from 'react-bootstrap-icons';
import Swal from 'sweetalert2';
import { config } from 'services/config';
import { postApi ,updateApiWithFile } from 'services/api';

export default function CaseStoryTypeList() {
    const [editStoryType, setEditStoryType] = useState(null);
const [showEditModal, setShowEditModal] = useState(false);

    const [caseStoryList, setCaseStoryList] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => { fetchCaseStoriesType(currentPage);fetchCaseStories(currentPage) }, [currentPage]);


const handleEditCaseStoryType = async () => {
  if (!editStoryType?.name || !editStoryType?.description) {
    Swal.fire("Validation Error", "All fields are required.", "warning");
    return;
  }
  try {
    await updateApiWithFile(
      config.UpdateCaseStoryType,
      editStoryType._id,
      {
        name: editStoryType.name,
        description: editStoryType.description,
      },
      {}
    );
    setShowEditModal(false);
    setEditStoryType(null);
    fetchCaseStories(currentPage);
    fetchCaseStoriesType(currentPage)
    Swal.fire("Updated!", "Case Story Type has been updated.", "success");
  } catch (error) {
    console.error("Error updating case story type:", error);
    Swal.fire("Error", "Failed to update case story type.", "error");
  }
};

  const fetchCaseStories = async (page) => {
    try {
      const response = await postApi(config.GetCaseStories, { page, pageSize });
      console.log("cases", response);
    
    } catch (error) {
      console.error("Error fetching case stories:", error);
    }
  };

    const fetchCaseStoriesType = async (page) => {
        try {
            const endpoint = config.GetCaseStoryType;
            const data = { };
            const response = await postApi(endpoint, data);
            console.log(response)
            setCaseStoryList(response.result || []);
            setTotalPages(response.totalPages || 1);
        } catch (error) {
            console.error('Error fetching case stories:', error);
        }
    };

 const confirmDelete = async (id) => {
  try {
    // Fetch case stories to check associations
    const response = await postApi(config.GetCaseStories, { page: 1, pageSize: 1000 });
    const associatedStories = response?.result?.filter(
      (story) => story.case_story_type_id === id
    );

    if (associatedStories && associatedStories.length > 0) {
      Swal.fire(
        "Cannot Delete",
        "This Case Story Type has case stories associated with it. Please remove them first.",
        "warning"
      );
      return;
    }

    // Proceed with delete confirmation if no associations
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
        deleteCaseStory(id);
        Swal.fire("Deleted!", "Case Story Type has been deleted.", "success");
      }
    });
  } catch (error) {
    console.error("Error checking associated case stories:", error);
    Swal.fire("Error", "Failed to check associations.", "error");
  }
};


   const deleteCaseStory = async (id) => {
  try {
    const endpoint = config.DeleteCaseStoryType;
    await postApi(endpoint, { id });
    fetchCaseStoriesType(currentPage);
  } catch (error) {
    console.error("Error deleting case story:", error);
  }
};


    const handleShow = () => setShowModal(true);
    const handleClose = () => {
        setShowModal(false);
        setFormData({ name: '', description: '' });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

 const handleAddCaseStory = async () => {
  if (!formData.name || !formData.description) {
    Swal.fire("Validation Error", "All fields are required.", "warning");
    return;
  }
  try {
    await postApi(config.AddCaseStoryType, formData);
    handleClose();
    fetchCaseStoriesType(currentPage);
  } catch (error) {
    console.error("Error adding case story:", error);
    Swal.fire("Error", error.response?.data?.message || "Failed to add.", "error");
  }
};


    return (
        <Container fluid className="p-6">
            <Row className="align-items-center mb-4">
                <Col><h2>Case Study Types List</h2></Col>
                <Col className="d-flex justify-content-end">
                    <Button variant="success" onClick={handleShow}>Add Case Study</Button>
                </Col>
            </Row>

            <Table hover responsive>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {caseStoryList.map((story, index) => (
                        <tr key={story._id}>
                            <td>{(currentPage - 1) * pageSize + index + 1}</td>
                            <td>{story.name}</td>
                            <td>{story.description}</td>
                           <td>
  <span
    onClick={() => {
      setEditStoryType(story);
      setShowEditModal(true);
    }}
    style={{ cursor: 'pointer', color: '#624bff', marginRight: '10px' }}
  >
    <PencilSquare size={20} />
  </span>
  <span
    onClick={() => confirmDelete(story._id)}
    style={{ cursor: 'pointer', color: '#624bff' }}
  >
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
                    <Pagination.Item
                        key={page}
                        active={page === currentPage}
                        onClick={() => setCurrentPage(page)}
                    >{page}</Pagination.Item>
                ))}
                <Pagination.Next onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages} />
                <Pagination.Last onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} />
            </Pagination>

            <Modal show={showModal} onHide={handleClose}>
                <Modal.Header closeButton><Modal.Title>Add Case Study</Modal.Title></Modal.Header>
                <Modal.Body>
                 <Form noValidate>
  <Form.Group className="mb-3">
    <Form.Label>Case Study Name</Form.Label>
    <Form.Control
      type="text"
      name="name"
      value={formData.name}
      onChange={handleInputChange}
      required
      isInvalid={!formData.name}
    />
    <Form.Control.Feedback type="invalid">
      Name is required
    </Form.Control.Feedback>
  </Form.Group>
  <Form.Group className="mb-3">
    <Form.Label>Case Study Description</Form.Label>
    <Form.Control
      as="textarea"
      rows={4}
      name="description"
      value={formData.description}
      onChange={handleInputChange}
      required
      isInvalid={!formData.description}
    />
    <Form.Control.Feedback type="invalid">
      Description is required
    </Form.Control.Feedback>
  </Form.Group>
</Form>

                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>Close</Button>
                    <Button variant="primary" onClick={handleAddCaseStory}>Add</Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
  <Modal.Header closeButton>
    <Modal.Title>Edit Case Study Type</Modal.Title>
  </Modal.Header>
  <Modal.Body>
  <Form noValidate>
  <Form.Group className="mb-3">
    <Form.Label>Case Study Name</Form.Label>
    <Form.Control
      type="text"
      value={editStoryType?.name || ""}
      onChange={(e) =>
        setEditStoryType((prev) => ({ ...prev, name: e.target.value }))
      }
      required
      isInvalid={!editStoryType?.name}
    />
    <Form.Control.Feedback type="invalid">
      Name is required
    </Form.Control.Feedback>
  </Form.Group>
  <Form.Group className="mb-3">
    <Form.Label>Case Study Description</Form.Label>
    <Form.Control
      as="textarea"
      rows={4}
      value={editStoryType?.description || ""}
      onChange={(e) =>
        setEditStoryType((prev) => ({ ...prev, description: e.target.value }))
      }
      required
      isInvalid={!editStoryType?.description}
    />
    <Form.Control.Feedback type="invalid">
      Description is required
    </Form.Control.Feedback>
  </Form.Group>
</Form>

  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={() => setShowEditModal(false)}>
      Cancel
    </Button>
    <Button variant="primary" onClick={handleEditCaseStoryType}>
      Save Changes
    </Button>
  </Modal.Footer>
</Modal>

        </Container>
    );
}
