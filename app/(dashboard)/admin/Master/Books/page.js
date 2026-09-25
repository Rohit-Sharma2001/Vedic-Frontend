'use client';

import { useState, useEffect } from 'react';
import { Col, Row, Form, Table, Button, Container, Modal, Pagination, Image } from 'react-bootstrap';
import { PencilSquare, Trash } from 'react-bootstrap-icons';
import Link from 'next/link';
import Swal from 'sweetalert2';
import { config } from 'services/config';
import { postApi, postApiWithFile ,updateApiWithFile } from 'services/api';

export default function ItemTypeList() {
    const [editBook, setEditBook] = useState(null);
const [showEditModal, setShowEditModal] = useState(false);
const [previewEditImages, setPreviewEditImages] = useState({
  imagePreview: null,
  iconPreview: null,
});

    const [itemTypeList, setItemTypeList] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        address:'',
        instructor_title:'',
        itemTypeImage: null,
        itemTypeIcon: null,
    });
    const [previewImages, setPreviewImages] = useState({
        imagePreview: null,
        iconPreview: null,
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => { fetchItemTypes(currentPage); }, [currentPage]);

    const handleEditBook = async () => {
  try {
    const files = {
      file: editBook.itemTypeImage instanceof File ? editBook.itemTypeImage : null,
      icon_file: editBook.itemTypeIcon instanceof File ? editBook.itemTypeIcon : null,
    };

    const data = {
    name :editBook.name,
      description: editBook.description,
      dropdown_type: "book",
      address:editBook.address,
      instructor_title:editBook?.instructor_title||""
    };
   
      await updateApiWithFile(
          config.Updatecategory,
          editBook._id,
          data,
          files
        );
    setShowEditModal(false);
    setEditBook(null);
    setPreviewEditImages({ imagePreview: null, iconPreview: null });
    fetchItemTypes(currentPage);

    Swal.fire("Updated!", "Book has been updated successfully.", "success");
  } catch (error) {
    console.error("Error updating book:", error);
    Swal.fire("Error", "Failed to update book.", "error");
  }
};

    const fetchItemTypes = async (page) => {
        try {
            const endpoint = config.category;
            const data = { dropdown_type: "book", page, pageSize };
            const response = await postApi(endpoint, data);
            console.log(response)
            setItemTypeList(response.result || []);
            setTotalPages(response.totalPages || 1);
        } catch (error) { console.error('Error fetching product types:', error); }
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
                deleteItemType(id);
                Swal.fire('Deleted!', 'Product Type has been deleted.', 'success');
            }
        });
    };

    const deleteItemType = async (id) => {
        try {
            const endpoint = config.Deletecategory;
            await postApi(endpoint, { id });
            fetchItemTypes(currentPage);
        } catch (error) { console.error('Error deleting product type:', error); }
    };

    const handleShow = () => setShowModal(true);
    const handleClose = () => {
        setShowModal(false);
        setFormData({ name: '', description: '', itemTypeImage: null, itemTypeIcon: null });
        setPreviewImages({ imagePreview: null, iconPreview: null });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        const file = files[0];
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            setPreviewImages((prev) => ({
                ...prev,
                [`${name}Preview`]: previewUrl,
            }));
            setFormData((prev) => ({
                ...prev,
                [name]: file,
            }));
        }
    };

    const handleAddItemType = async () => {
       

        const files = {
            file: formData.itemTypeImage,
            icon_file: formData.itemTypeIcon,
        };

        const data = {
            name: formData.name,
            description: formData.description,
            address:formData.address||"",
            instructor_title:formData?.instructor_title||"",
            dropdown_type: 'book',
        };

        try {
            await postApiWithFile(config.Addcategory, data, files);
            handleClose();
            fetchItemTypes(currentPage);
        } catch (error) {
            console.error('Error adding product type:', error);
            alert(error.response.data.message)
        }
    };

    return (
        <Container fluid className="p-6">
            <Row className="align-items-center mb-4">
                <Col><h2>Books List</h2></Col>
                <Col className="d-flex justify-content-end">
                    <Button variant="success" onClick={handleShow}>Add Book </Button>
                </Col>
            </Row>

            <Table hover responsive>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Title</th>
                        <th>Image</th>
                        <th>Published By</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {itemTypeList.map((type, index) => (
                        <tr key={type._id}>
                            <td>{(currentPage - 1) * pageSize + index + 1}</td>
                            <td>{type.name}</td>
                            <td>
                                <img
                                    src={`${process.env.NEXT_PUBLIC_API_URL}/${type.file}`}
                                    alt={type.name}
                                    width="50"
                                    height="50"
                                />
                            </td>
                            <td>{type.description}</td>
                            <td>
                               
                               <span
  onClick={() => {
    setEditBook(type);
    setPreviewEditImages({
      imagePreview: type.file ? `${process.env.NEXT_PUBLIC_API_URL}/${type.file}` : null,
      iconPreview: type.icon_file ? `${process.env.NEXT_PUBLIC_API_URL}/${type.icon_file}` : null,
    });
    setShowEditModal(true);
  }}
  style={{ cursor: "pointer", color: "#624bff", marginRight: "10px" }}
>
  <PencilSquare size={20} />
</span>

<span
  onClick={() => confirmDelete(type._id)}
  style={{ cursor: "pointer", color: "#624bff" }}
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

            {/* Add Product Type Modal */}
            <Modal show={showModal} onHide={handleClose}>
                <Modal.Header closeButton><Modal.Title>Add Product Type</Modal.Title></Modal.Header>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>Book Title</Form.Label>
                        <Form.Control type="text" name="name" value={formData.name} onChange={handleInputChange} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Published By</Form.Label>
                        <Form.Control type="text" rows={4} name="description" value={formData.description} onChange={handleInputChange} />
                    </Form.Group>
                    {/* <Form.Group className="mb-3">
                        <Form.Label>Book Details</Form.Label>
                        <Form.Control as="textarea" rows={3}  name="instructor_title" value={formData.instructor_title} onChange={handleInputChange} />
                    </Form.Group> */}
                    <Form.Group className="mb-3">
  <Form.Label>Book Detail</Form.Label>
  <Form.Control
    as="textarea"
    rows={3}
    value={formData?.instructor_title || ""}
    onChange={(e) => {
      const value = e.target.value;
      const words = value.trim().split(/\s+/).filter(Boolean);

      if (words.length <= 30) {
        setFormData((prev) => ({
          ...prev,
          instructor_title: value,
        }));
      }
    }}
  />
  <small className="text-muted">
    {(formData?.instructor_title || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean).length}
    /30 words
  </small>
</Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Book URL</Form.Label>
                        <Form.Control type="text"  name="address" value={formData.address} onChange={handleInputChange} />
                    </Form.Group>                    
                    <Form.Group className="mb-3">
                        <Form.Label>Book Image</Form.Label>
                        <Form.Control type="file" name="itemTypeImage" accept="image/*" onChange={handleFileChange} />
                        {previewImages.itemTypeImagePreview && (
                            <img src={previewImages.itemTypeImagePreview} alt="Preview" fluid className="mt-2" width={100} height={100} />
                        )}
                    </Form.Group>
                    {/* <Form.Group className="mb-3">
                        <Form.Label>Product Type Icon</Form.Label>
                        <Form.Control type="file" name="itemTypeIcon" accept="image/*" onChange={handleFileChange} />
                        {previewImages.itemTypeIconPreview && (
                            <img src={previewImages.itemTypeIconPreview} alt="Icon Preview" fluid className="mt-2" />
                        )}
                    </Form.Group> */}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>Close</Button>
                    <Button variant="primary" onClick={handleAddItemType}>Add</Button>
                </Modal.Footer>
            </Modal>
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
  <Modal.Header closeButton>
    <Modal.Title>Edit Book</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <Form.Group className="mb-3">
      <Form.Label>Book Title</Form.Label>
      <Form.Control
        type="text"
        value={editBook?.name || ""}
        onChange={(e) => setEditBook((prev) => ({ ...prev, name: e.target.value }))}
      />
    </Form.Group>
    <Form.Group className="mb-3">
      <Form.Label>Published By</Form.Label>
      <Form.Control
        type='text'
        value={editBook?.description || ""}
        onChange={(e) =>
          setEditBook((prev) => ({ ...prev, description: e.target.value }))
        }
      />
    </Form.Group>
     <Form.Group className="mb-3">
  <Form.Label>Book Detail</Form.Label>
  <Form.Control
    as="textarea"
    rows={3}
    value={editBook?.instructor_title || ""}
    onChange={(e) => {
      const value = e.target.value;
      const words = value.trim().split(/\s+/).filter(Boolean);

      if (words.length <= 30) {
        setEditBook((prev) => ({
          ...prev,
          instructor_title: value,
        }));
      }
    }}
  />
  <small className="text-muted">
    {(editBook?.instructor_title || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean).length}
    /30 words
  </small>
</Form.Group>
    <Form.Group className="mb-3">
      <Form.Label>Book URL</Form.Label>
      <Form.Control
        type="text"
        value={editBook?.address || ""}
        onChange={(e) => setEditBook((prev) => ({ ...prev, address: e.target.value }))}
      />
    </Form.Group>
    <Form.Group className="mb-3">
      <Form.Label>Book Image</Form.Label>
      <Form.Control
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files[0];
          if (file) {
            setEditBook((prev) => ({ ...prev, itemTypeImage: file }));
            setPreviewEditImages((prev) => ({
              ...prev,
              imagePreview: URL.createObjectURL(file),
            }));
          }
        }}
      />
      {previewEditImages.imagePreview && (
        <img
          src={previewEditImages.imagePreview}
          alt="Preview"
          className="mt-2"
          width={100}
          height={100}
        />
      )}
    </Form.Group>
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={() => setShowEditModal(false)}>
      Cancel
    </Button>
    <Button variant="primary" onClick={handleEditBook}>
      Save Changes
    </Button>
  </Modal.Footer>
</Modal>

        </Container>
    );
}
