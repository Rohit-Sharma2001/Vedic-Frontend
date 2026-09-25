'use client';

import { useState, useEffect } from 'react';
import { Col, Row, Form, Table, Button, Container, Modal, Pagination, Image } from 'react-bootstrap';
import { PencilSquare, Trash } from 'react-bootstrap-icons';
import Link from 'next/link';
import Swal from 'sweetalert2';
import { config } from 'services/config';
import { postApi, postApiWithFile ,updateApiWithFile} from 'services/api';

export default function AddImagesToGallery() {
  // ===== NEW: header title/subtitle states + modal =====
const DOCUMENT_ID = "68243b752897e78f4551679a"; // same idea as BeginYourJourney.tsx
const [showHeaderModal, setShowHeaderModal] = useState(false);

const [pageTitle, setPageTitle] = useState("Images From Gallery");
const [pageSubtitle, setPageSubtitle] = useState("Images From Gallery");

const [loadingHeader, setLoadingHeader] = useState(false);
const [savingHeader, setSavingHeader] = useState(false);

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

    const handleInputChange = (e) => {
  const { name, value } = e.target;
  setFormData((prev) => ({ ...prev, [name]: value }));
};
// ===== NEW: fetch title/subtitle (adjust parsing if backend shape differs) =====
const fetchGalleryHeader = async () => {
  setLoadingHeader(true);
  try {
    const endpoint = config.GetBalancingDiet; // same as BeginYourJourney.tsx
    const payload = { type: "kapha" };
    const response = await postApi(endpoint, payload);

    const title = response?.data?.data?.[0]?.gallery_image_title;
    const subtitle = response?.data?.data?.[0]?.gallery_image_subtitle;

    setPageTitle(title || "Images From Gallery");
    setPageSubtitle(subtitle || "Images From Gallery");
  } catch (error) {
    console.error("Error fetching gallery header:", error);
  } finally {
    setLoadingHeader(false);
  }
};


// ===== NEW: open modal + load values =====
const openHeaderModal = async () => {
  setShowHeaderModal(true);
  await fetchGalleryHeader();
};

// ===== NEW: save title/subtitle via update API =====
const saveHeader = async () => {
  setSavingHeader(true);
  try {
    const payload = {
      gallery_image_title: pageTitle,
      gallery_image_subtitle: pageSubtitle,
    };

    const res = await updateApiWithFile(config.UpdateBalancingDiet, DOCUMENT_ID, payload, {});
    if (res?.statusCode === 200) {
      await fetchGalleryHeader();
      setShowHeaderModal(false);
    }
  } catch (error) {
    console.error("Error updating gallery header:", error);
  } finally {
    setSavingHeader(false);
  }
};

// Optional: load current header once on mount
useEffect(() => {
  fetchGalleryHeader();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

    const fetchItemTypes = async (page) => {
        try {
            const endpoint = config.category;
            const data = { dropdown_type: "gallery_images", page, pageSize };
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
    dropdown_type: 'gallery_images',
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
  dropdown_type: 'gallery_images',
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
  <Col>
    <div className="d-flex align-items-center gap-2">
      <h2 className="mb-0">{pageTitle}</h2>

      <span
        role="button"
        title="Edit Title/SubTitle"
        onClick={openHeaderModal}
        style={{ cursor: "pointer" }}
      >
        <PencilSquare size={18} />
      </span>
    </div>

    <small>{pageSubtitle}</small>
  </Col>

  <Col className="d-flex justify-content-end">
    <Button variant="success" onClick={handleShow}>Add Image</Button>
  </Col>
</Row>


            <Table hover responsive>
                <thead>
                    <tr>
                        <th>#</th>

                         <th>Image Text </th>
                        
                        <th>Image</th>
                       
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {itemTypeList.map((type, index) => (
                        <tr key={type._id}>
                            <td>{(currentPage - 1) * pageSize + index + 1}</td>
                           
                           <td>{type?.name ||  "N/A"}</td>
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

          <Modal show={showModal} onHide={handleClose}>
  <Modal.Header closeButton>
    <Modal.Title>{isEdit ? 'Edit Gallery Image' : 'Add Gallery Image'}</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <Form.Group className="mb-3">
      <Form.Label>Image Text</Form.Label>
      
       <Form.Control
                            as="textarea"
                            rows={4}
                             placeholder="Enter image Text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                        />
    </Form.Group>

    <Form.Group className="mb-3">
      <Form.Label>
        Image <small>(Preferred 540×350px, less than 10MB, JPG/PNG)</small>
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

{/* ===== NEW: Modal for Title + Subtitle ===== */}
<Modal show={showHeaderModal} onHide={() => setShowHeaderModal(false)} centered>
  <Modal.Header closeButton>
    <Modal.Title>Edit Gallery Heading</Modal.Title>
  </Modal.Header>

  <Modal.Body>
    <Form.Group className="mb-3">
      <Form.Label>Title</Form.Label>
      <Form.Control
        value={pageTitle}
        onChange={(e) => setPageTitle(e.target.value)}
        disabled={loadingHeader || savingHeader}
      />
    </Form.Group>

    <Form.Group>
      <Form.Label>Subtitle</Form.Label>
      <Form.Control
        value={pageSubtitle}
        onChange={(e) => setPageSubtitle(e.target.value)}
        disabled={loadingHeader || savingHeader}
      />
    </Form.Group>
  </Modal.Body>

  <Modal.Footer>
    <Button
      variant="secondary"
      onClick={() => setShowHeaderModal(false)}
      disabled={savingHeader}
    >
      Cancel
    </Button>

    <Button
      variant="primary"
      onClick={saveHeader}
      disabled={loadingHeader || savingHeader}
    >
      {savingHeader ? "Saving..." : "Save"}
    </Button>
  </Modal.Footer>
</Modal>


        </Container>
    );
}
