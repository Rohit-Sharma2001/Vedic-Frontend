'use client';

import { useState, useEffect } from 'react';
import { Col, Row, Form, Table, Button, Container, Modal, Pagination, Image } from 'react-bootstrap';
import { PencilSquare, Trash } from 'react-bootstrap-icons';
import Link from 'next/link';
import Swal from 'sweetalert2';
import { config } from 'services/config';
import { postApi, postApiWithFile, updateApiWithFile } from 'services/api';

export default function YogaVideoBanner() {
    const [isEdit, setIsEdit] = useState(false);
    const [editId, setEditId] = useState(null);

    const [itemTypeList, setItemTypeList] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        status: 0,
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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const fetchItemTypes = async (page) => {
        try {
            const endpoint = config.category;
            const data = { dropdown_type: "appointment_accept_card", page, pageSize };
            const response = await postApi(endpoint, data);
            setItemTypeList(response.result || []);
            setTotalPages(response.totalPages || 1);
        } catch (error) { console.error('Error fetching product types:', error); }
    };





    const handleShow = () => setShowModal(true);
    const handleClose = () => {
        setShowModal(false);
        setFormData({ name: '', description: '', itemTypeImage: null, itemTypeIcon: null });
        setPreviewImages({ imagePreview: null, iconPreview: null });
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

    const handleEdit = (image) => {
        setIsEdit(true);
        setEditId(image._id);
        setFormData({
            name: image.name || '',
            description: image.description || '',
            status: image.status,
            itemTypeImage: null,
            itemTypeIcon: null,
        });
        setPreviewImages({
            imagePreview: image.file ? `${process.env.NEXT_PUBLIC_API_URL}/${image.file}` : null,
            iconPreview: image.icon_file ? `${process.env.NEXT_PUBLIC_API_URL}/${image.icon_file}` : null,
        });
        setShowModal(true);
    };

    const handleUpdateItemType = async () => {
        const files = {
            file: formData.itemTypeImage,
        };

        const data = {
            name: formData.name,
            description: formData.description,
            dropdown_type: 'appointment_accept_card',
            status: formData.status
        };

        try {
            await updateApiWithFile(config.Updatecategory, editId, data, files);
            handleClose();
            fetchItemTypes(currentPage);
        } catch (error) {
            console.error('Error updating gallery image:', error);
            alert(error.response?.data?.message || 'Update failed');
        }
    };


    const handleAddItemType = async () => {


        const files = {
            file: formData.itemTypeImage,
        };

        const data = {
            dropdown_type: 'appointment_accept_card',
            description: formData.description,
            name: formData.name,
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
                <Col><h2>Allow Card Details</h2></Col>
                <Col className="d-flex justify-content-end">
                    {itemTypeList.length === 0 && (
                    <Button variant="success" onClick={handleShow}>Accept Card</Button>
                     )} 
                </Col>

            </Row>

            <Table hover responsive>
                <thead>
                    <tr>
                        <th>#</th>

                        <th>Heading </th>
                        {/* <th>Text</th> */}
                        <th>Status</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {itemTypeList.map((type, index) => (
                        <tr key={type._id}>
                            <td>{(currentPage - 1) * pageSize + index + 1}</td>

                            <td>{type?.name || "N/A"}</td>
                            <td>{type?.status == 1 ? 'Accept' : 'Not Accept' || "N/A"}</td>

                            <td>
                                <span
                                    onClick={() => handleEdit(type)}
                                    style={{ cursor: 'pointer', color: '#198754', marginRight: '10px' }}
                                >
                                    <PencilSquare size={20} />
                                </span>

                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            {/* <Pagination className="justify-content-center mt-4">
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
      </Pagination> */}

            <Modal show={showModal} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>{isEdit ? 'Edit Card Accept/Not' : 'Add Card Accept/Not'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>Heading</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter heading "
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                        />
                    </Form.Group>

                    {/* <Form.Group className="mb-3">
            <Form.Label>Text</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Enter text"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
            />
          </Form.Group> */}

                    <Form.Group className="mb-3">
                        <Form.Label>
                            Accept Card
                        </Form.Label>
                        <Form.Check
                            type="switch"
                            id="accept-card-switch"
                            label={formData.status ? "Enabled" : "Disabled"}
                            checked={formData.status || false}
                            onChange={(e) =>
                                handleInputChange({
                                    target: {
                                        name: "status",
                                        value: e.target.checked,
                                    },
                                })
                            }
                        />
                    </Form.Group>
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
