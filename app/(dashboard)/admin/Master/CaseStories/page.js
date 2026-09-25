"use client";
import { Badge, OverlayTrigger, Tooltip } from "react-bootstrap";
import { useState, useEffect } from "react";
import {
  Col,
  Row,
  Form,
  Table,
  Button,
  Container,
  Modal,
  Pagination,
  Image,
} from "react-bootstrap";
import { Trash, FileCheck ,PencilSquare} from "react-bootstrap-icons";
import Swal from "sweetalert2";
import { config } from "services/config";
import { postApi, postApiWithFile, updateApiWithFile } from "services/api";
import dynamic from "next/dynamic";

// Dynamically import ReactQuill (for SSR compatibility in Next.js)
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css"; // Import styles

export default function AddCaseStory() {
  const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

  const [caseStories, setCaseStories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
  title: "",
  type: "",
  description: "",
  image: null,
  author_name: "",
  author_designation: "",
  author_description: "",
  file: null,
});

  const [previewImage, setPreviewImage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [caseStoryList, setCaseStoryList] = useState([]);
const [editStory, setEditStory] = useState(null);
const [showEditModal, setShowEditModal] = useState(false);
const [previewEditImage, setPreviewEditImage] = useState(null);
const [previewAuthorImage, setPreviewAuthorImage] = useState(null);
const [previewEditAuthorImage, setPreviewEditAuthorImage] = useState(null);

  useEffect(() => {
    fetchCaseStoriestype(currentPage);
  }, [currentPage]);

  const fetchCaseStoriestype = async (page) => {
    try {
      const endpoint = config.GetDropdownCaseStoryType;
      const data = {};
      const response = await postApi(endpoint, data);
      console.log("drope", response);
      setCaseStoryList(response.result || []);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      console.error("Error fetching case stories:", error);
    }
  };

const handleAuthorImageChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  if (file.size > MAX_SIZE) {
    Swal.fire("Error", "Author image must be less than 10MB.", "warning");
    e.target.value = ""; 
    return;
  }

  const previewUrl = URL.createObjectURL(file);
  setPreviewAuthorImage(previewUrl);
  setFormData((prev) => ({ ...prev, file: file }));
};


  useEffect(() => {
    fetchCaseStories(currentPage);
  }, [currentPage]);

  const fetchCaseStories = async (page) => {
    try {
      const response = await postApi(config.GetCaseStories, { page, pageSize });
      console.log("cases", response);
      setCaseStories(response.result || []);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      console.error("Error fetching case stories:", error);
    }
  };

  const confirmDelete = (id) => {
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
        Swal.fire("Deleted!", "Case story has been deleted.", "success");
      }
    });
  };

  const deleteCaseStory = async (id) => {
    try {
      await postApi(config.DeleteCaseStory, { id });
      fetchCaseStories(currentPage);
    } catch (error) {
      console.error("Error deleting case story:", error);
    }
  };

 const handleShow = () => {
  // ensure clean state
  setFormData({
    title: "",
    type: "",
    description: "",
    image: null,
    author_name: "",
    author_designation: "",
    author_description: "",
    file: null,
  });

  setPreviewImage(null);
  setPreviewAuthorImage(null);

  setShowModal(true);
};

  const handleClose = () => {
  setShowModal(false);

  // Reset all form fields
  setFormData({
    title: "",
    type: "",
    description: "",
    image: null,
    author_name: "",
    author_designation: "",
    author_description: "",
    file: null,
  });

  // Reset ALL previews
  setPreviewImage(null);
  setPreviewAuthorImage(null);
};


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

const handleFileChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  if (file.size > MAX_SIZE) {
    Swal.fire("Error", "Image must be less than 10MB.", "warning");
    e.target.value = ""; 
    return;
  }

  const previewUrl = URL.createObjectURL(file);
  setPreviewImage(previewUrl);
  setFormData((prev) => ({ ...prev, image: file }));
};


 const handleAddCaseStory = async () => {
if (
  !formData.title ||
  !formData.type ||
  !formData.description ||
  !formData.image ||
  !formData.author_name ||
  !formData.author_designation ||
  !formData.author_description ||
  !formData.file
) {
  Swal.fire("Validation Error", "All fields are required.", "warning");
  return;
}

 const files = { 
  image: formData.image, 
  file: formData.file 
};
 const data = {
  title: formData.title,
  case_story_type_id: formData.type,
  descriptions: formData.description,
  author_name: formData.author_name,
  author_designation: formData.author_designation,
  author_description: formData.author_description,
};

  try {
    await postApiWithFile(config.AddCaseStory, data, files);
    handleClose();
    fetchCaseStories(currentPage);
  } catch (error) {
    console.error("Error adding case story:", error);
    Swal.fire("Error", error.response?.data?.message || "Failed to add.", "error");
  }
};

  const confirmFeature = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This change can be reverted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes!",
    }).then((result) => {
      if (result.isConfirmed) {
        featureblog(id);
        Swal.fire("Deleted!", "Your data has been Updated.", "success");
      }
    });
  };

  const featureblog = async (id) => {
    try {
      const endpoint = config.CaseStoryFeature; // Ensure API exists
      const data = { id };
      const files = {}; // No files needed

      const response = await postApi(endpoint, data);

      if (response.statusCode === 200) {
        fetchCaseStories(currentPage);
      } else {
        console.error("Failed to update status.");
      }
    } catch (error) {
      console.error("Error updating blog:", error);
    }
  };
const handleEditCaseStory = async () => {
  if (!editStory?.title || !editStory?.case_story_type_id || !editStory?.descriptions) {
    Swal.fire("Validation Error", "Title, Type, and Description are required.", "warning");
    return;
  }

  try {
    
    const files = {};
if (editStory.image instanceof File) files.image = editStory.image;
if (editStory.file instanceof File) files.file = editStory.file;

   const data = {
  title: editStory.title,
  case_story_type_id: editStory.case_story_type_id,
  descriptions: editStory.descriptions,
  author_name: editStory.author_name,
  author_designation: editStory.author_designation,
  author_description: editStory.author_description,
};

    await updateApiWithFile(config.EditCaseStory, editStory._id, data, files);

    setShowEditModal(false);
    setEditStory(null);
    setPreviewEditImage(null);
    setPreviewEditAuthorImage(null)
    fetchCaseStories(currentPage);

    Swal.fire("Updated!", "Case story has been updated.", "success");
  } catch (error) {
    console.error("Error updating case story:", error);
    Swal.fire("Error", "Failed to update case story.", "error");
  }
};




  return (
    <Container fluid className="p-6">
      <Row className="align-items-center mb-4">
        <Col>
          <h2>Case Studies</h2>
        </Col>
        <Col className="d-flex justify-content-end">
        <Button 
  variant="success" 
  onClick={handleShow}
>
  Add Case Study
</Button>


        </Col>
      </Row>

      <Table hover responsive>
        <thead>
          <tr>
            <th>#</th>
            <th>Title</th>
            <th>Type</th>
            {/* <th>Description</th> */}
            <th>Image</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {caseStories.map((story, index) => (
            <tr key={story._id}>
              <td>{(currentPage - 1) * pageSize + index + 1}</td>
              <td>{story.title}</td>
              <td>{story.case_story_type_name}</td>
          {/* <td>
  <div
    dangerouslySetInnerHTML={{
      __html:
        story.descriptions.length > 50
          ? story.descriptions.substring(0, 50) + "..."
          : story.descriptions,
    }}
  />
</td> */}

              {/* <td>{story.descriptions}</td> */}
              <td>
                {story.image && (
                  <img
                    src={`${process.env.NEXT_PUBLIC_API_URL}/${story?.image}`}
                    alt={story?.title}
                    width={50}
                    height={50}
                    fluid
                  />
                )}
              </td>
              <td>
  <div className="d-flex align-items-center">
    {/* Edit */}
    <span
      onClick={() => {
        console.log("story",story)
        setEditStory(story);
        setPreviewEditImage(
          story.image ? `${process.env.NEXT_PUBLIC_API_URL}/${story.image}` : null
        );
        setPreviewEditAuthorImage(
           story.file ? `${process.env.NEXT_PUBLIC_API_URL}/${story.file}` : null
        )
        setShowEditModal(true);
      }}
      style={{ cursor: "pointer", color: "#624bff", marginRight: "5px" }}
    >
      <PencilSquare size={20} />
    </span>

    {/* Delete */}
    <span
      onClick={() => confirmDelete(story._id)}
      style={{ cursor: "pointer", color: "#624bff", marginRight: "5px" }}
    >
      <Trash size={20} />
    </span>

    {/* Feature */}
    <OverlayTrigger
      placement="top"
      overlay={
        <Tooltip id={`tooltip-feature-${story._id}`}>
          This will make this case study as featured
        </Tooltip>
      }
    >
      <span
        onClick={() => confirmFeature(story?._id)}
        style={{
          cursor: "pointer",
          color: story.is_featured ? "green" : "#624bff", // Highlight if featured
        }}
      >
        <FileCheck size={20} style={{ marginRight: "10px" }} />
      </span>
    </OverlayTrigger>

    {/* Show badge if featured */}
    {story.is_featured ? (
      <Badge bg="success" className="ms-2">
        Featured
      </Badge>
    ) : null}
  </div>
</td>

            </tr>
          ))}
        </tbody>
      </Table>

      <Pagination className="justify-content-center mt-4">
        <Pagination.First
          onClick={() => setCurrentPage(1)}
          disabled={currentPage === 1}
        />
        <Pagination.Prev
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
        />
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <Pagination.Item
            key={page}
            active={page === currentPage}
            onClick={() => setCurrentPage(page)}
          >
            {page}
          </Pagination.Item>
        ))}
        <Pagination.Next
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage === totalPages}
        />
        <Pagination.Last
          onClick={() => setCurrentPage(totalPages)}
          disabled={currentPage === totalPages}
        />
      </Pagination>

      <Modal show={showModal} size="lg" onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Add Case Study</Modal.Title>
        </Modal.Header>
        <Modal.Body>
         <Form noValidate>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
    <Form.Label>Title</Form.Label>
    <Form.Control
      type="text"
      name="title"
      value={formData.title}
      onChange={handleInputChange}
      required
      isInvalid={!formData.title}
    />
    <Form.Control.Feedback type="invalid">
      Title is required
    </Form.Control.Feedback>
  </Form.Group>
            </Col>
          
<Col md={6}>
  <Form.Group className="mb-3">
    <Form.Label>Type</Form.Label>
    <Form.Select
      name="type"
      value={formData.type}
      onChange={handleInputChange}
      required
      isInvalid={!formData.type}
    >
      <option value="">Select Type</option>
      {caseStoryList.map((type) => (
        <option key={type._id} value={type._id}>
          {type.name}
        </option>
      ))}
    </Form.Select>
    <Form.Control.Feedback type="invalid">
      Type is required
    </Form.Control.Feedback>
  </Form.Group>
</Col>
</Row>

<Row>

  <Col md={6}>
    <Form.Group className="mb-3">
    <Form.Label>Description</Form.Label>
    <ReactQuill
      value={formData.description}
      onChange={(value) =>
        setFormData((prev) => ({ ...prev, description: value }))
      }
    />
    {!formData.description && (
      <div className="text-danger mt-1">Description is required</div>
    )}
  </Form.Group>


  </Col>

  <Col md={6}>
    <Form.Group className="mb-3">
    <Form.Label>Image File <small className="text-muted d-block">
          (Preffered Image 420×220px and less than 10MB of  Jpeg,Png type )
        </small></Form.Label>
    <Form.Control
      type="file"
      name="image"
      accept="image/*"
      onChange={handleFileChange}
      required
      isInvalid={!formData.image}
    />
    <Form.Control.Feedback type="invalid">
      Image is required
    </Form.Control.Feedback>
    {previewImage && (
      <img src={previewImage} height={50} width={50} alt="Preview" className="mt-2" />
    )}
  </Form.Group>
  </Col>
</Row>




<h3> Author Details </h3>
<Row>
  <Col md={6}>
    <Form.Group className="mb-3">
  <Form.Label>Author Name</Form.Label>
  <Form.Control
    type="text"
    name="author_name"
    value={formData.author_name}
    onChange={handleInputChange}
    required
    isInvalid={!formData.author_name}
  />
  <Form.Control.Feedback type="invalid">
    Author name is required
  </Form.Control.Feedback>
</Form.Group>
  </Col>

  <Col md={6}>
  <Form.Group className="mb-3">
  <Form.Label>Author Designation</Form.Label>
  <Form.Control
    type="text"
    name="author_designation"
    value={formData.author_designation}
    onChange={handleInputChange}
    required
    isInvalid={!formData.author_designation}
  />
  <Form.Control.Feedback type="invalid">
    Author designation is required
  </Form.Control.Feedback>
</Form.Group>
  </Col>
</Row>



<Row>
  <Col md={6}>
  <Form.Group className="mb-3">
  <Form.Label>Author Description</Form.Label>
  <ReactQuill
    value={formData.author_description}
    onChange={(value) =>
      setFormData((prev) => ({ ...prev, author_description: value }))
    }
  />
  {!formData.author_description && (
    <div className="text-danger mt-1">Author description is required</div>
  )}
</Form.Group>
  </Col>

   <Col md={6}>
   <Form.Group className="mb-3">
  <Form.Label>Author Image <small className="text-muted d-block">
          (Preffered Image 420×220px and less than 10MB of  Jpeg,Png type )
        </small></Form.Label>
  <Form.Control
    type="file"
    accept="image/*"
    onChange={handleAuthorImageChange}
    required
    isInvalid={!formData.file}
  />
  <Form.Control.Feedback type="invalid">
    Author image is required
  </Form.Control.Feedback>
  {previewAuthorImage && (
    <img src={previewAuthorImage} alt="Preview" height={50} width={50} className="mt-2" />
  )}
</Form.Group>
   </Col>
</Row>




</Form>

        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleAddCaseStory}>
            Add
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showEditModal} size="lg" onHide={() => setShowEditModal(false)}>
  <Modal.Header closeButton>
    <Modal.Title>Edit Case Study</Modal.Title>
  </Modal.Header>
  <Modal.Body>
 <Form noValidate>
  <Row>
    <Col md={6}>
      <Form.Group className="mb-3">
    <Form.Label>Title</Form.Label>
    <Form.Control
      type="text"
      value={editStory?.title || ""}
      onChange={(e) =>
        setEditStory((prev) => ({ ...prev, title: e.target.value }))
      }
      required
      isInvalid={!editStory?.title}
    />
    <Form.Control.Feedback type="invalid">
      Title is required
    </Form.Control.Feedback>
  </Form.Group>
    </Col>

     <Col md={6}>
       <Form.Group className="mb-3">
    <Form.Label>Type</Form.Label>
    <Form.Select
      value={editStory?.case_story_type_id || ""}
      onChange={(e) =>
        setEditStory((prev) => ({ ...prev, case_story_type_id: e.target.value }))
      }
      required
      isInvalid={!editStory?.case_story_type_id}
    >
      <option value="">Select Type</option>
      {caseStoryList.map((type) => (
        <option key={type._id} value={type._id}>
          {type.name}
        </option>
      ))}
    </Form.Select>
    <Form.Control.Feedback type="invalid">
      Type is required
    </Form.Control.Feedback>
  </Form.Group>
     </Col>
  </Row>



<Row>
  <Col md={6}>
   <Form.Group className="mb-3">
    <Form.Label>Description</Form.Label>
    <ReactQuill
      value={editStory?.descriptions || ""}
      onChange={(val) =>
        setEditStory((prev) => ({ ...prev, descriptions: val }))
      }
    />
    {!editStory?.descriptions && (
      <div className="text-danger mt-1">Description is required</div>
    )}
  </Form.Group>
  </Col>

  <Col md={6}>
  
  <Form.Group className="mb-3">
    <Form.Label>Image File <small className="text-muted d-block">
          (Preffered Image 420×220px and less than 10MB of  Jpeg,Png type )
        </small></Form.Label>
    <Form.Control
      type="file"
      accept="image/*"
      onChange={(e) => {
  const file = e.target.files[0];
  if (!file) return;

  if (file.size > MAX_SIZE) {
    Swal.fire("Error", "Image must be less than 10MB.", "warning");
    e.target.value = "";
    return;
  }

  setEditStory((prev) => ({ ...prev, image: file }));
  setPreviewEditImage(URL.createObjectURL(file));
}}

    />
    {previewEditImage && (
      <img src={previewEditImage} alt="Preview" height={50} width={50} className="mt-2"  />
    )}
  </Form.Group>
  </Col>
</Row>
 

<h3> Author Details</h3>
<Row>
  <Col md={6}>
   <Form.Group className="mb-3">
  <Form.Label>Author Name</Form.Label>
  <Form.Control
    type="text"
    value={editStory?.author_name || ""}
    onChange={(e) =>
      setEditStory((prev) => ({ ...prev, author_name: e.target.value }))
    }
  />
</Form.Group>
  </Col>

   <Col md={6}>
   <Form.Group className="mb-3">
  <Form.Label>Author Designation</Form.Label>
  <Form.Control
    type="text"
    value={editStory?.author_designation || ""}
    onChange={(e) =>
      setEditStory((prev) => ({ ...prev, author_designation: e.target.value }))
    }
  />
</Form.Group>
   </Col>
</Row>
 

<Row>
  <Col md={6}>
  <Form.Group className="mb-3">
  <Form.Label>Author Description</Form.Label>
  <ReactQuill
    value={editStory?.author_description || ""}
    onChange={(val) =>
      setEditStory((prev) => ({ ...prev, author_description: val }))
    }
  />
</Form.Group>
  </Col>

   <Col md={6}>
   
<Form.Group className="mb-3">
  <Form.Label>Author Image <small className="text-muted d-block">
          (Preffered Image 420×220px and less than 10MB of  Jpeg,Png type )
        </small></Form.Label>
  <Form.Control
    type="file"
    accept="image/*"
  onChange={(e) => {
  const file = e.target.files[0];
  if (!file) return;

  if (file.size > MAX_SIZE) {
    Swal.fire("Error", "Author image must be less than 10MB.", "warning");
    e.target.value = "";
    return;
  }

  setEditStory((prev) => ({ ...prev, file: file }));
  setPreviewEditAuthorImage(URL.createObjectURL(file));
}}

  />
  {previewEditAuthorImage && (
    <img
      src={previewEditAuthorImage}
      alt="Preview"
      className="mt-2"
      width="100"
    />
  )}
</Form.Group>
   </Col>
</Row>




</Form>

  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={() => setShowEditModal(false)}>
      Cancel
    </Button>
    <Button variant="primary" onClick={handleEditCaseStory}>
      Save Changes
    </Button>
  </Modal.Footer>
</Modal>

    </Container>
  );
}
