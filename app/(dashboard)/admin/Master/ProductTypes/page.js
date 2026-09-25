'use client';

import { useState, useEffect } from 'react';
import { Col, Row, Form, Table, Button, Container, Modal, Pagination, Image } from 'react-bootstrap';
import { PencilSquare, Trash } from 'react-bootstrap-icons';
import Link from 'next/link';
import Swal from 'sweetalert2';
import { config } from 'services/config';
import { postApi, postApiWithFile, updateApiWithFile } from 'services/api';

export default function ItemTypeList() {
    const [isEdit, setIsEdit] = useState(false);
const [editId, setEditId] = useState(null);

    const [itemTypeList, setItemTypeList] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
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

    const fetchItemTypes = async (page) => {
        try {
            const endpoint = config.category;
            const data = { dropdown_type: "product_type", page, pageSize };
            const response = await postApi(endpoint, data);
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
  setIsEdit(false);
  setEditId(null);
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
            dropdown_type: 'product_type',
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

    const handleEdit = (type) => {
  setIsEdit(true);
  setEditId(type._id);
  setFormData({
    name: type.name,
    description: type.description,
    itemTypeImage: null,
    itemTypeIcon: null,
  });
  setPreviewImages({
    imagePreview: type.file ? `${process.env.NEXT_PUBLIC_API_URL}/${type.file}` : null,
    iconPreview: type.icon_file ? `${process.env.NEXT_PUBLIC_API_URL}/${type.icon_file}` : null,
  });
  setShowModal(true);
};

const handleUpdateItemType = async () => {
  const files = {
    file: formData.itemTypeImage,
    icon_file: formData.itemTypeIcon,
  };

  const data = {
    
    name: formData.name,
    description: formData.description,
    dropdown_type: 'product_type',
  };

  try {
    await updateApiWithFile(config.Updatecategory,editId, data, files);
    handleClose();
    fetchItemTypes(currentPage);
  } catch (error) {
    console.error('Error updating product type:', error);
    alert(error.response?.data?.message || 'Update failed');
  }
};


    return (
        <Container fluid className="p-6">
            <Row className="align-items-center mb-4">
                <Col><h2>Product Types List</h2></Col>
                <Col className="d-flex justify-content-end">
                    <Button variant="success" onClick={handleShow}>Add Product Type</Button>
                </Col>
            </Row>

            <Table hover responsive>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>Image</th>
                        <th>Description</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {itemTypeList.map((type, index) => (
                        <tr key={type._id}>
                            <td>{(currentPage - 1) * pageSize + index + 1}</td>
                            <td>{type.name}</td>
                            {type.name.length > 25
    ? type.name.slice(0, 25) + "..."
    : type.name}
                            <td>
                                <img
                                    src={`${process.env.NEXT_PUBLIC_API_URL}/${type.file}`}
                                    alt={type.name.length > 25
    ? type.name.slice(0, 25) + "..."
    : type.name}
                                    width="50"
                                    height="50"
                                />
                            </td>
                            <td>{type.description}</td>
                            <td>
                             <span 
  onClick={() => handleEdit(type)} 
  style={{ cursor: 'pointer', color: '#198754', marginRight: '10px' }}
>
  <PencilSquare size={20} />
</span>
<span 
  onClick={() => confirmDelete(type._id)} 
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

            {/* Add Product Type Modal */}
            <Modal show={showModal} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>{isEdit ? 'Edit Product Type' : 'Add Product Type'}</Modal.Title>
</Modal.Header>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>Product Type Name</Form.Label>
                        <Form.Control type="text" name="name" value={formData.name} onChange={handleInputChange} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Product Type Description</Form.Label>
                        <Form.Control as="textarea" rows={4} name="description" value={formData.description} onChange={handleInputChange} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Product Type Image  <small>
                          (Preffered Image 200×200px and less than 10MB  of  Jpeg,Png type )
                        </small></Form.Label>
                        <Form.Control type="file" name="itemTypeImage" accept="image/*" onChange={handleFileChange} />
                        {previewImages.itemTypeImagePreview && (
                            <img src={previewImages.itemTypeImagePreview} alt="Preview" width={100} height={100} fluid className="mt-2" />
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
<Button 
  variant="primary" 
  onClick={isEdit ? handleUpdateItemType : handleAddItemType}
>
  {isEdit ? 'Update' : 'Add'}
</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}
