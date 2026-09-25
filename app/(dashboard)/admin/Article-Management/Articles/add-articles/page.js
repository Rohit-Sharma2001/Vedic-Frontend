"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Container, Row, Col, Form, Button, Card ,Spinner} from "react-bootstrap";
import Link from "next/link";
import { postApiWithFile } from "services/api";
import { config } from "services/config";
import dynamic from "next/dynamic";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";

export default function AddArticle() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    descriptions: "",
    article_content: "",
    auther_name: "",
    image: null,
    file: null,
  });

  const handleContentChange = (value) => {
    setFormData({ ...formData, article_content: value });
  };

  const [uploadStatus, setUploadStatus] = useState("");
const [formErrors, setFormErrors] = useState({});
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [successMessage, setSuccessMessage] = useState('');
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDescriptionChange = (value) => {
    setFormData({ ...formData, descriptions: value });
  };
const handleImageChange = (e) => {
   const file = e.target.files[0];
   if (file) {
     if (file.size > 10 * 1024 * 1024) {
       setFormErrors((prev) => ({ ...prev, image: "Image must be less than 10MB." }));
       return;
     }
     const allowedTypes = ["image/jpeg", "image/png"];
     if (!allowedTypes.includes(file.type)) {
       setFormErrors((prev) => ({ ...prev, image: "Only JPEG and PNG formats are allowed." }));
       return;
     }
     setFormData({ ...formData, image: file });
     setFormErrors((prev) => ({ ...prev, image: "" }));
   }
 };

 const handleFileChange = (e) => {
   const file = e.target.files[0];
   if (file) {
     if (file.size > 10 * 1024 * 1024) {
       setFormErrors((prev) => ({ ...prev, file: "File must be less than 10MB." }));
       return;
     }
     const allowedTypes = ["image/jpeg", "image/png"];
   if (!allowedTypes.includes(file.type)) {
     setFormErrors((prev) => ({ ...prev, file: "Only JPEG and PNG formats are allowed." }));
     return;
   }
   setFormData({ ...formData, file });
   setFormErrors((prev) => ({ ...prev, file: "" }));
   }
 };

const validateForm = () => {
   const errors = {};
   if (!formData.title.trim()) errors.title = "Title is required.";
   if (!formData.descriptions || formData.descriptions.trim() === "" || formData.descriptions === "<p><br></p>") {
     errors.descriptions = "Description is required.";
   }
   if (!formData.article_content || formData.article_content.trim() === "" || formData.article_content === "<p><br></p>") {
     errors.article_content = "Article content is required.";
   }
   if (!formData.auther_name.trim()) errors.auther_name = "Author Name is required.";
   if (!formData.image) errors.image = "Author image is required.";
   if (!formData.file) errors.file = "Article cover image is required.";

   setFormErrors(errors);
   return Object.keys(errors).length === 0;
 };

const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
  if (isSubmitting) return;

   setIsSubmitting(true);
   setSuccessMessage("");

    try {
      const endpoint = config.AddArticles;
      const { image, file, ...data } = formData;
      const files = {
        image,
        file,
      };

      const response = await postApiWithFile(endpoint, data, files);
      console.log(response);
      if (response.statusCode === 201) {
     setSuccessMessage("Article added successfully! ✅");
       setTimeout(() => {
         router.push("/admin/Article-Management/Articles");
       }, 1500);
      } else {
       setFormErrors({ general: "Failed to add article." });
      }
    
    } catch (error) {
      console.error("Error adding article:", error);
     setFormErrors({ general: error?.response?.data?.message || "Error occurred while adding article." });
    }
    finally {
     setIsSubmitting(false);
    }
  };

  return (
    <Container fluid>
      <Row>
        <Col>
          <Card className="p-4 mt-4">
            <Card.Body>
              <Row className="mb-3">
                <Col>
                  <h2>Add New Article</h2>
                </Col>
                <Col className="d-flex justify-content-end">
                  <Link href={"/admin/Article-Management/Articles"}>
                    <Button variant="danger">Back</Button>
                  </Link>
                </Col>
              </Row>
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        Title <span style={{ color: "red" }}>*</span>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                      />
                      {formErrors.title && <p className="text-danger">{formErrors.title}</p>}
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        Description <span style={{ color: "red" }}>*</span>
                      </Form.Label>
                      <ReactQuill
                        value={formData.descriptions}
                        onChange={handleDescriptionChange}
                      />
                      {formErrors.descriptions && <p className="text-danger">{formErrors.descriptions}</p>}
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        Article Content <span style={{ color: "red" }}>*</span>
                      </Form.Label>
                      <ReactQuill
                        value={formData.article_content}
                        onChange={handleContentChange}
                      />
                      {formErrors.article_content && <p className="text-danger">{formErrors.article_content}</p>}
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        Author Name <span style={{ color: "red" }}>*</span>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="auther_name"
                        value={formData.auther_name}
                        onChange={handleInputChange}
                        required
                      />
                      {formErrors.auther_name && <p className="text-danger">{formErrors.auther_name}</p>}
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        Upload Author Image <span style={{ color: "red" }}>*</span>
                     <small className="text-muted d-block">
          (Preffered Image 410×220px and less than 10MB of  Jpeg,Png type )
        </small> </Form.Label>
                      <Form.Control
                        type="file"
                        onChange={handleImageChange}
                        required
                      />
                  {formErrors.image && <p className="text-danger">{formErrors.image}</p>}
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        Upload Article Cover Image  <span style={{ color: "red" }}>*</span>
                      <small className="text-muted d-block">
          (Preffered Image 420×220px and less than 10MB of  Jpeg,Png type )
        </small></Form.Label>
                      <Form.Control
                        type="file"
                        onChange={handleFileChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

               <Button type="submit" variant="primary" disabled={isSubmitting}>
   {isSubmitting ? (
     <>
       <Spinner animation="border" size="sm" className="me-2" />
       Adding...
     </>
   ) : (
     "Add Article"
   )}
 </Button>

 {successMessage && <p className="text-success mt-3">{successMessage}</p>}
 {formErrors.general && <p className="text-danger mt-3">{formErrors.general}</p>}
              </Form>
              {uploadStatus && <p>{uploadStatus}</p>}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
