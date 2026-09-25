// /app/.../AddVideosToGallery.jsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Col, Row, Form, Table, Button, Container, Modal, Pagination } from 'react-bootstrap';
import { PencilSquare, Trash } from 'react-bootstrap-icons';
import Swal from 'sweetalert2';
import { config } from 'services/config';
import { postApi, postApiWithFile, updateApiWithFile } from 'services/api';

// ✅ Constants
const MAX_MB = 10;
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime']; // mp4, mov/qt

function isValidVideo(file) {
  if (!file) {
    Swal.fire('No file', 'Please choose a video file.', 'warning'); // why: avoid empty submit
    return false;
  }
  if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
    Swal.fire('Invalid file', 'Only MP4 or QuickTime (MOV) videos are allowed.', 'error');
    return false;
  }
  if (file.size > MAX_MB * 1024 * 1024) {
    Swal.fire('File too large', `Video must be ≤ ${MAX_MB} MB.`, 'error');
    return false;
  }
  return true;
}

const isNonEmpty = (v) => typeof v === 'string' && v.trim().length > 0; // why: consistent text validation

export default function AddVideosToGallery() {
    // ===== NEW: header title/subtitle states + modal =====
const DOCUMENT_ID = "68243b752897e78f4551679a"; // same idea as BeginYourJourney.tsx
const [showHeaderModal, setShowHeaderModal] = useState(false);

const [pageTitle, setPageTitle] = useState("Images From Gallery");
const [pageSubtitle, setPageSubtitle] = useState("Images From Gallery");

const [loadingHeader, setLoadingHeader] = useState(false);
const [savingHeader, setSavingHeader] = useState(false);


// ===== NEW: fetch title/subtitle (adjust parsing if backend shape differs) =====
const fetchGalleryHeader = async () => {
  setLoadingHeader(true);
  try {
    const endpoint = config.GetBalancingDiet; // same as BeginYourJourney.tsx
    const payload = { type: "kapha" };
    const response = await postApi(endpoint, payload);

    const title = response?.data?.data?.[0]?.gallery_video_title;
    const subtitle = response?.data?.data?.[0]?.gallery_video_subtitle;

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
      gallery_video_title: pageTitle,
      gallery_video_subtitle: pageSubtitle,
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

  const [itemTypeList, setItemTypeList] = useState([]);
  const [editVideo, setEditVideo] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [previewEditVideo, setPreviewEditVideo] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    itemTypeImage: null, // video file
    itemTypeIcon: null,
  });
  const [previewImages, setPreviewImages] = useState({
    imagePreview: null,
    iconPreview: null,
    itemTypeImagePreview: null,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => { fetchItemTypes(currentPage); }, [currentPage]);

  const fetchItemTypes = async (page) => {
    try {
      const endpoint = config.category;
      const data = { dropdown_type: 'gallery_videos', page, pageSize };
      const response = await postApi(endpoint, data);
      setItemTypeList(response.result || []);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      console.error('Error fetching product types:', error);
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
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        deleteItemType(id);
        Swal.fire('Deleted!', 'Video has been deleted.', 'success');
      }
    });
  };

  const deleteItemType = async (id) => {
    try {
      const endpoint = config.Deletecategory;
      await postApi(endpoint, { id });
      fetchItemTypes(currentPage);
    } catch (error) {
      console.error('Error deleting product type:', error);
    }
  };

  const handleShow = () => setShowModal(true);
  const handleClose = () => {
    setShowModal(false);
    setFormData({ name: '', description: '', itemTypeImage: null, itemTypeIcon: null });
    setPreviewImages({ imagePreview: null, iconPreview: null, itemTypeImagePreview: null });
  };

  // ✅ Replace your handleFileChange to only accept valid videos and use Swal
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files?.[0];
    if (!file) return;

    if (!isValidVideo(file)) {
      e.target.value = ''; // why: clear invalid selection
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setPreviewImages((prev) => ({
      ...prev,
      [`${name}Preview`]: previewUrl,
    }));
    setFormData((prev) => ({
      ...prev,
      [name]: file,
    }));
  };

  // ✅ Derived guards
  const canSubmitAdd = useMemo(
    () => isNonEmpty(formData.name) && !!formData.itemTypeImage,
    [formData.name, formData.itemTypeImage]
  );

  const hasEditVideoFile = useMemo(
    () =>
      !!(
        (editVideo && editVideo.itemTypeImage instanceof File) || // newly chosen file
        (editVideo && editVideo.file) // existing file from API
      ),
    [editVideo]
  );

  const canSaveEdit = useMemo(
    () => isNonEmpty(editVideo?.name || '') && hasEditVideoFile,
    [editVideo?.name, hasEditVideoFile]
  );

  // ✅ Guard add submit too
  const handleAddItemType = async () => {
    if (!isNonEmpty(formData.name)) {
      Swal.fire('Missing title', 'Please enter a title.', 'warning');
      return;
    }
    if (!formData.itemTypeImage) {
      Swal.fire('Missing video', 'Please upload a video.', 'warning');
      return;
    }
    if (!isValidVideo(formData.itemTypeImage)) return;

    const files = { file: formData.itemTypeImage };
    const data = { dropdown_type: 'gallery_videos', name: formData.name };

    try {
      await postApiWithFile(config.Addcategory, data, files);
      handleClose();
      fetchItemTypes(currentPage);
      Swal.fire('Added!', 'Video has been added successfully.', 'success');
    } catch (error) {
      console.error('Error adding product type:', error);
      Swal.fire('Error', error?.response?.data?.message || 'Failed to add video.', 'error');
    }
  };

  // ✅ Validate on EDIT submit (now also require name + some video (existing or new))
  const handleEditVideo = async () => {
    if (!isNonEmpty(editVideo?.name || '')) {
      Swal.fire('Missing title', 'Please enter a title.', 'warning');
      return;
    }
    if (!hasEditVideoFile) {
      Swal.fire('Missing video', 'Please upload a video.', 'warning'); // why: force presence
      return;
    }
    if (editVideo?.itemTypeImage && !isValidVideo(editVideo.itemTypeImage)) {
      return; // why: block invalid upload
    }

    const files = {
      file: editVideo?.itemTypeImage instanceof File ? editVideo.itemTypeImage : null,
    };

    const data = {
      name: editVideo.name,
      dropdown_type: 'gallery_videos',
    };

    try {
      await updateApiWithFile(config.Updatecategory, editVideo._id, data, files);
      setShowEditModal(false);
      setEditVideo(null);
      setPreviewEditVideo(null);
      fetchItemTypes(currentPage);
      Swal.fire('Updated!', 'Video has been updated successfully.', 'success');
    } catch (error) {
      console.error('Error updating video:', error);
      Swal.fire('Error', 'Failed to update video.', 'error');
    }
  };

  const isVideoByPath = (p = '') => /\.(mp4|mov|qt)$/i.test(p); // ✅ handles QuickTime/MOV

  return (
    <Container fluid className="p-6">
      {/* <Row className="align-items-center mb-4">
        <Col><h2>Videos From Gallery</h2></Col>
        <Col className="d-flex justify-content-end">
          <Button variant="success" onClick={handleShow}>Add Videos</Button>
        </Col>
      </Row> */}

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
          <Button variant="success" onClick={handleShow}>Add Videos</Button>
        </Col>
</Row>

      

      <Table hover responsive>
        <thead>
          <tr>
            <th>#</th>
            <th>Video</th>
            <th>Name</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {itemTypeList.map((type, index) => (
            <tr key={type._id}>
              <td>{(currentPage - 1) * pageSize + index + 1}</td>

              <td>
                {isVideoByPath(type.file) ? (
                  <a
                    href={`${process.env.NEXT_PUBLIC_API_URL}/${type.file}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <video
                      src={`${process.env.NEXT_PUBLIC_API_URL}/${type.file}`}
                      width="100"
                      height="80"
                      style={{ objectFit: 'cover', cursor: 'pointer' }}
                      muted
                    />
                  </a>
                ) : (
                  <span>Not a video</span>
                )}
              </td>

              <td>{type.name || 'Untitled'}</td>

              <td>
                <span
                  onClick={() => {
                    setEditVideo(type);
                    setPreviewEditVideo(
                      type.file ? `${process.env.NEXT_PUBLIC_API_URL}/${type.file}` : null
                    );
                    setShowEditModal(true);
                  }}
                  style={{ cursor: 'pointer', color: '#624bff', marginRight: '10px' }}
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

      {/* Add Video Modal */}
      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton><Modal.Title>Add Video To Gallery</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Video Title *</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter video title"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>
              Upload Video *
              <small className="d-block">(Allowed: MP4, QuickTime/MOV · Max: {MAX_MB}MB)</small>
            </Form.Label>
            <Form.Control
              type="file"
              name="itemTypeImage"
              accept="video/mp4,video/quicktime"
              onChange={handleFileChange}
              required
            />
            {previewImages.itemTypeImagePreview && (
              <div className="mt-2">
                <video
                  src={previewImages.itemTypeImagePreview}
                  controls
                  style={{ width: '100%', maxHeight: '220px', objectFit: 'contain' }}
                />
              </div>
            )}
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>Close</Button>
          <Button
            variant="primary"
            onClick={handleAddItemType}
            disabled={!canSubmitAdd} // ✅ block until mandatory filled
          >
            Add
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Video Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Video</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Video Title *</Form.Label>
            <Form.Control
              type="text"
              value={editVideo?.name || ''}
              onChange={(e) =>
                setEditVideo((prev) => ({ ...prev, name: e.target.value }))
              }
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label> Upload Video * <small className="d-block">(Allowed: MP4, QuickTime/MOV · Max: {MAX_MB}MB)</small></Form.Label>
            <Form.Control
              type="file"
              accept="video/mp4,video/quicktime"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                if (!isValidVideo(file)) {
                  e.target.value = '';
                  return;
                }
                setEditVideo((prev) => ({ ...prev, itemTypeImage: file }));
                setPreviewEditVideo(URL.createObjectURL(file));
              }}
            />
            {previewEditVideo && (
              <div className="mt-2">
                <video
                  src={previewEditVideo}
                  controls
                  style={{ width: '100%', maxHeight: '220px', objectFit: 'contain' }}
                />
              </div>
            )}
            {!hasEditVideoFile && (
              <small className="text-danger">A video file is required (existing or new).</small>
            )}
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>Cancel</Button>
          <Button
            variant="primary"
            onClick={handleEditVideo}
            disabled={!canSaveEdit} // ✅ block until mandatory filled
          >
            Save Changes
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
