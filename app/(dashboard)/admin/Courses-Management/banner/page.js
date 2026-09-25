'use client';

import { useState, useEffect } from 'react';
import { Col, Row, Form, Table, Button, Container, Modal, Pagination, Image } from 'react-bootstrap';
import { PencilSquare, Trash } from 'react-bootstrap-icons';
import Link from 'next/link';
import Swal from 'sweetalert2';
import { config } from 'services/config';
import { postApi, postApiWithFile ,updateApiWithFile} from 'services/api';

export default function EventBanner() {
    const [isEdit, setIsEdit] = useState(false);
const [editId, setEditId] = useState(null);

    const [itemTypeList, setItemTypeList] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        itemTypeImage: null,
        itemTypeIcon: null,
        instructor_title: '',
        instructor_subtitle: '',
        all_courses_title: '',
        all_courses_subtitle: '',
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
            const data = { dropdown_type: "courses_banner", page, pageSize };
            const response = await postApi(endpoint, data);
            setItemTypeList(response.result || []);
            setTotalPages(response.totalPages || 1);
        } catch (error) { console.error('Error fetching product types:', error); }
    };

   

    

    const handleShow = () => setShowModal(true);
    const handleClose = () => {
        setShowModal(false);
       setFormData({
   name: '',
   description: '',
   itemTypeImage: null,
   itemTypeIcon: null,
   instructor_title: '',
   instructor_subtitle: '',
   all_courses_title: '',
   all_courses_subtitle: '',
 });
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
    itemTypeImage: null,
    itemTypeIcon: null,
    instructor_title: image.instructor_title || '',
   instructor_subtitle: image.instructor_subtitle || '',
   all_courses_title: image.all_courses_title || '',
   all_courses_subtitle: image.all_courses_subtitle || '',
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
    dropdown_type: 'courses_banner',
    instructor_title: formData.instructor_title,
   instructor_subtitle: formData.instructor_subtitle,
   all_courses_title: formData.all_courses_title,
   all_courses_subtitle: formData.all_courses_subtitle,
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
  dropdown_type: 'courses_banner',
  name: formData.name,
  description: formData.description,  // ✅ added this line
  instructor_title: formData.instructor_title,
   instructor_subtitle: formData.instructor_subtitle,
   all_courses_title: formData.all_courses_title,
   all_courses_subtitle: formData.all_courses_subtitle,
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
                <Col><h2>Update Yoga Courses Banner Details</h2></Col>
                <Col className="d-flex justify-content-end">
  {itemTypeList.length === 0 && (
    <Button variant="success" onClick={handleShow}>Add Image</Button>
  )}
</Col>

            </Row>

            <Table hover responsive>
                <thead>
                    <tr>
                        <th>#</th>

                         <th>Heading </th>
                         <th>Text</th>
                        
                        <th>Image</th>
                       
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {itemTypeList.map((type, index) => (
                        <tr key={type._id}>
                            <td>{(currentPage - 1) * pageSize + index + 1}</td>
                           
                           <td>{type?.name ||  "N/A"}</td>
                           <td>{type?.description || "N/A"}</td>
                            <td>
                                <img
                                    src={`${process.env.NEXT_PUBLIC_API_URL}/${type.file}`}
                                    alt={type.name}
                                    width="50"
                                    height="50"
                                />
                            </td>
                           
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
  <Modal.Header closeButton>
    <Modal.Title>{isEdit ? 'Edit Banner Details' : 'Add Banner Details'}</Modal.Title>
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

  <Form.Group className="mb-3">
    <Form.Label>Text</Form.Label>
    <Form.Control
      as="textarea"
      rows={3}
      placeholder="Enter text"
      name="description"
      value={formData.description}
      onChange={handleInputChange}
    />
  </Form.Group>

  <Form.Group className="mb-3">
    <Form.Label>
      Image <small>(Preferred 1275×450px, less than 10MB, JPG/PNG)</small>
    </Form.Label>
    <Form.Control
      type="file"
      name="itemTypeImage"
      accept="image/*"
      onChange={handleFileChange}
    />
    {previewImages.imagePreview && (
      <img
        src={previewImages.imagePreview}
        alt="Preview"
        width={100}
        height={100}
        className="mt-2"
      />
    )}
  </Form.Group>

  <hr />

<h5 className="mb-3">Instructor Details</h5>
<Row>
  <Col md={6}>
<Form.Group className="mb-3">
  <Form.Label>Title</Form.Label>
  <Form.Control
    type="text"
    placeholder="Enter instructor title"
    name="instructor_title"
    value={formData.instructor_title}
    onChange={handleInputChange}
  />
</Form.Group>
</Col>

  <Col md={6}>
<Form.Group className="mb-3">
  <Form.Label>Sub Title</Form.Label>
  <Form.Control
    type="text"
    placeholder="Enter instructor sub title"
    name="instructor_subtitle"
    value={formData.instructor_subtitle}
    onChange={handleInputChange}
  />
</Form.Group>
</Col>
</Row>
<hr />

<h5 className="mb-3">All Courses Details</h5>

<Row>
  <Col md={6}>
  <Form.Group className="mb-3">
  <Form.Label>Title</Form.Label>
  <Form.Control
    type="text"
    placeholder="Enter courses title"
    name="all_courses_title"
    value={formData.all_courses_title}
    onChange={handleInputChange}
  />
</Form.Group>
  </Col>

  <Col>
  <Form.Group className="mb-3">
  <Form.Label>Sub Title</Form.Label>
  <Form.Control
    type="text"
    placeholder="Enter courses sub title"
    name="all_courses_subtitle"
    value={formData.all_courses_subtitle}
    onChange={handleInputChange}
  />
</Form.Group>
  </Col>
</Row>




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
