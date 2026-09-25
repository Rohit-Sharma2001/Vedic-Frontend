'use client';

import { useState, useEffect } from 'react';
import { Col, Row, Form, Table, Button, Container, Pagination, Modal, Image } from 'react-bootstrap';
import { PencilSquare, Trash } from 'react-bootstrap-icons';
import Link from 'next/link';
import Swal from 'sweetalert2';
import { config } from 'services/config';
import { postApi, postApiWithFile ,updateApiWithFile} from 'services/api';

export default function Ingredients() {
    const [isEdit, setIsEdit] = useState(false);
const [editId, setEditId] = useState(null);

    const [ingredientList, setIngredientList] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);

    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        ingredientImage: null,
        ingredientIcon: null,
    });
    const [previewImages, setPreviewImages] = useState({
        imagePreview: null,
        iconPreview: null,
    });

    useEffect(() => {
        fetchIngredients(currentPage);
    }, [currentPage]);

    const fetchIngredients = async (page) => {
        try {
            const endpoint = config.category;
            const data = { dropdown_type:"ingredients",page: page, pageSize: pageSize }
            const response = await postApi(endpoint, data);
            console.log(response)
            setIngredientList(response.result || []);
            setTotalPages(response.totalPages || 1);
        } catch (error) {
            console.error('Error fetching ingredients:', error);
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
                deleteIngredient(id);
                Swal.fire('Deleted!', 'Ingredient has been deleted.', 'success');
            }
        });
    };

    const deleteIngredient = async (id) => {
        try {
            const endpoint = config.Deletecategory;
            await postApi(endpoint, { id });
            fetchIngredients(currentPage);
        } catch (error) {
            console.error('Error deleting ingredient:', error);
        }
    };

    const handleShow = () => setShowModal(true);
    const handleClose = () => {
  setShowModal(false);
  setIsEdit(false);
  setEditId(null);
  setFormData({ name: '', description: '', ingredientImage: null, ingredientIcon: null });
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

    const handleAddIngredient = async () => {
       

        const files = {
            file: formData.ingredientImage,
            icon_file: formData.ingredientIcon,
        };

        const data = {
            name: formData.name,
            description: formData.description,
            dropdown_type: 'ingredients',
        };

        try {
            await postApiWithFile(config.Addcategory, data, files);
            handleClose();
            fetchIngredients(currentPage);
        } catch (error) {
            console.error('Error adding ingredient:', error);
            alert(error.response.data.message)
        }
    };
    const handleEdit = (ingredient) => {
  setIsEdit(true);
  setEditId(ingredient._id);
  setFormData({
    name: ingredient.name,
    description: ingredient.description,
    ingredientImage: null,
    ingredientIcon: null,
  });
  setPreviewImages({
    imagePreview: ingredient.file ? `${process.env.NEXT_PUBLIC_API_URL}/${ingredient.file}` : null,
    iconPreview: ingredient.icon_file ? `${process.env.NEXT_PUBLIC_API_URL}/${ingredient.icon_file}` : null,
  });
  setShowModal(true);
};

const handleUpdateIngredient = async () => {
  const files = {
    file: formData.ingredientImage,
    icon_file: formData.ingredientIcon,
  };

  const data = {
   
    name: formData.name,
    description: formData.description,
    dropdown_type: 'ingredients',
  };

  try {
    await updateApiWithFile(config.Updatecategory, editId, data, files);
    handleClose();
    fetchIngredients(currentPage);
  } catch (error) {
    console.error('Error updating ingredient:', error);
    alert(error.response?.data?.message || 'Update failed');
  }
};


    return (
        <>
            <Container fluid className="p-6">
                <Row className="align-items-center mb-4">
                    <Col><h2>Ingredients List</h2></Col>
                    <Col className="d-flex justify-content-end">
                        <Button variant="success" onClick={handleShow}>Add New Ingredient</Button>
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
                        {ingredientList.map((ingredient, index) => (
                            <tr key={ingredient._id}>
                                <td>{(currentPage - 1) * pageSize + index + 1}</td>
                                {/* <td>{ingredient.name}</td> */}
                                <td title={ingredient.name}>
  {ingredient.name.length > 25
    ? ingredient.name.slice(0, 25) + "..."
    : ingredient.name}
</td>
                                <td>
                                    <img
                                        src={`${process.env.NEXT_PUBLIC_API_URL}/${ingredient.file}`}
                                        alt={ingredient.name.length > 25
    ? ingredient.name.slice(0, 25) + "..."
    : ingredient.name}
                                        width="50"
                                        height="50"
                                    />
                                </td>
                                <td>{ingredient.description}</td>
                                <td>
                                  <span 
  onClick={() => handleEdit(ingredient)} 
  style={{ cursor: 'pointer', color: '#198754', marginRight: '10px' }}
>
  <PencilSquare size={20} />
</span>
<span 
  onClick={() => confirmDelete(ingredient._id)} 
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
                        <Pagination.Item key={page} active={page === currentPage} onClick={() => setCurrentPage(page)}>
                            {page}
                        </Pagination.Item>
                    ))}
                    <Pagination.Next onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages} />
                    <Pagination.Last onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} />
                </Pagination>
            </Container>

            <Modal show={showModal} onHide={handleClose}>
                <Modal.Header closeButton>
                  <Modal.Title>{isEdit ? 'Edit Ingredient' : 'Add Ingredient'}</Modal.Title>

                </Modal.Header>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>Ingredient Name</Form.Label>
                        <Form.Control
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Ingredient Description  </Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={4}
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Ingredient Image <small>
                          (Preffered Image 200×200px and less than 10MB  of  Jpeg,Png type )
                        </small></Form.Label>
                        <Form.Control
                            type="file"
                            name="ingredientImage"
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                        {previewImages.ingredientImagePreview && (
                            <img src={previewImages.ingredientImagePreview} alt="Preview" width={100} height={100} fluid className="mt-2" />
                        )}
                    </Form.Group>

                    
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>Close</Button>
                   <Button 
  variant="primary" 
  onClick={isEdit ? handleUpdateIngredient : handleAddIngredient}
>
  {isEdit ? 'Update' : 'Add'}
</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}
