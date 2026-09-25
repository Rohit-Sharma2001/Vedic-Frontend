'use client';

import { useState, useEffect } from 'react';
import { Col, Row, Form, Table, Button, Container, Modal, Pagination, Image } from 'react-bootstrap';
import { Trash } from 'react-bootstrap-icons';
import Link from 'next/link';
import Swal from 'sweetalert2';
import { config } from 'services/config';
import { postApi, postApiWithFile } from 'services/api';

export default function ItemTypeList() {
    const [itemTypeList, setItemTypeList] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
       
    });
  
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(50);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => { fetchItemTypes(currentPage); }, [currentPage]);

    const fetchItemTypes = async (page) => {
        try {
            const endpoint = config.category;
            const data = { dropdown_type: "return_reasons", page, pageSize };
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
                Swal.fire('Deleted!', 'Return has been deleted.', 'success');
            }
        });
    };

    const deleteItemType = async (id) => {
        try {
            const endpoint = config.Deletecategory;
            await postApi(endpoint, { id });
            fetchItemTypes(currentPage);
        } catch (error) { console.error('Error deleting Return:', error); }
    };

    const handleShow = () => setShowModal(true);
    const handleClose = () => {
        setShowModal(false);
        setFormData({ name: '', description: ''});
      
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

  
    const handleAddItemType = async () => {
       

        

        const data = {
            name: formData.name,
            description: formData.description,
            dropdown_type: 'return_reasons',
        };
        const file ={}

        try {
         const result = await postApiWithFile(config.Addcategory, data,file);
        
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
                <Col><h2>Return Days</h2></Col>
                <Col className="d-flex justify-content-end">
                    {itemTypeList.length===0&&<Button variant="success" onClick={handleShow}>Add</Button>}
                </Col>
            </Row>

            <Table hover responsive>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Days</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {itemTypeList.map((type, index) => (
                        <tr key={type._id}>
                            <td>{(currentPage - 1) * pageSize + index + 1}</td>
                            <td>{type.name}</td>
                           
                            <td>
                               
                                <span onClick={() => confirmDelete(type._id)} style={{ cursor: 'pointer', color: '#624bff' }}>
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
                <Modal.Header closeButton><Modal.Title>Add Return Days</Modal.Title></Modal.Header>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>Return Days</Form.Label>
                        <Form.Control type="number" name="name" value={formData.name} onChange={handleInputChange} />
                    </Form.Group>
                  
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>Close</Button>
                    <Button variant="primary" onClick={handleAddItemType}>Add</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}
