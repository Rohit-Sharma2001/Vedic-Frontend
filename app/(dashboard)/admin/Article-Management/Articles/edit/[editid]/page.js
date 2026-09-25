'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Row, Col, Form, Button, Card ,Spinner} from 'react-bootstrap';
import Link from 'next/link';
import { postApi, updateApiWithFile } from 'services/api';
import { config } from 'services/config';
import dynamic from 'next/dynamic';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

export default function EditArticle({ params }) {
    const router = useRouter();
    const editid = params.editid;
const [formErrors, setFormErrors] = useState({});
const [isSubmitting, setIsSubmitting] = useState(false);
const [successMessage, setSuccessMessage] = useState("");
    const [formData, setFormData] = useState({
        id: editid,
        title: '',
        descriptions: '',
        auther_name: '',
        article_content: '', 
        image: null,
        file: null
    });

    const [existingImage, setExistingImage] = useState(null);
    const [existingFile, setExistingFile] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);

    useEffect(() => {
        if (editid) fetchArticleDetails();
    }, [editid]);

    const fetchArticleDetails = async () => {
        try {
            const endpoint = config.ViewArticles;
            const data = { id: editid };
            const response = await postApi(endpoint, data);
            console.log(response)
            if (response.statusCode === 201) {
                const article = response.result;
               setFormData({
  ...article,
  image: null,
  file: null,
  article_content: article.article_content || ""  // ✅ include this
});

                setExistingImage(article.image);
                setExistingFile(article.file);
            }
        } catch (error) {
            console.error('Error fetching article details:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDescriptionChange = (value) => {
        setFormData(prev => ({ ...prev, descriptions: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
    if (file.size > 10 * 1024 * 1024) {
      setFormErrors(prev => ({ ...prev, image: "Image must be less than 10MB." }));
      return;
    }
    const allowedTypes = ["image/jpeg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      setFormErrors(prev => ({ ...prev, image: "Only JPEG and PNG formats are allowed." }));
      return;
    }
    setFormData(prev => ({ ...prev, image: file }));
    setPreviewImage(URL.createObjectURL(file));
    setFormErrors(prev => ({ ...prev, image: "" }));
  }
    };

    const validateForm = () => {
  const errors = {};
  if (!formData.title.trim()) errors.title = "Title is required.";
  if (!formData.descriptions || formData.descriptions.trim() === "" || formData.descriptions === "<p><br></p>")
    errors.descriptions = "Description is required.";
  if (!formData.auther_name.trim()) errors.auther_name = "Author Name is required.";
  if (!formData.image && !existingImage) errors.image = "Author image is required.";
  if (!formData.article_content || formData.article_content.trim() === "" || formData.article_content === "<p><br></p>")
  errors.article_content = "Article content is required.";
  if (!formData.file && !existingFile) errors.file = "Article cover image is required.";
  setFormErrors(errors);
  return Object.keys(errors).length === 0;
};


    const handleFileChange = (e) => {
        const file = e.target.files[0];
       setFormData(prev => ({ ...prev, file }));
  if (file) {
    if (file.size > 10 * 1024 * 1024) {
      setFormErrors(prev => ({ ...prev, file: "File must be less than 10MB." }));
      return;
    }
    const allowedTypes = ["image/jpeg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      setFormErrors(prev => ({ ...prev, file: "Only JPEG and PNG formats are allowed." }));
      return;
    }
    setFormData(prev => ({ ...prev, file }));
    setFormErrors(prev => ({ ...prev, file: "" }));
  }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
       if (!validateForm()) return;
   if (isSubmitting) return;

   setIsSubmitting(true);
   setSuccessMessage("");
   try {
            const endpoint = config.UpdateArticles;
            const { image, file, ...data } = formData;
            const files = {};
            if (image) files.image = image;
            if (file) files.file = file;

            const response = await updateApiWithFile(endpoint, editid, data, files);
           if (response.statusCode === 201) {
         setSuccessMessage("Article updated successfully! ✅");
         setTimeout(() => {
           router.push("/admin/Article-Management/Articles");
         }, 1500);
       } else {
         setFormErrors({ general: "Failed to update article." });
       }
        } catch (error) {
            console.error('Error updating article:', error);
              setFormErrors({ general: error?.response?.data?.message || "Unknown error" });
  } finally {
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
                                    <h2>Edit Article</h2>
                                </Col>
                                <Col className="d-flex justify-content-end">
                                    <Link href={'/admin/Article-Management/Articles'}>
                                        <Button variant="danger">Back</Button>
                                    </Link>
                                </Col>
                            </Row>
                            <Form onSubmit={handleSubmit}>
                                <Row>
                                    <Col md={12}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Title <span style={{ color: "red" }}>*</span></Form.Label>
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
                                            <Form.Label>Description <span style={{ color: "red" }}>*</span></Form.Label>
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
        onChange={(value) =>
          setFormData((prev) => ({ ...prev, article_content: value }))
        }
      />
      {formErrors.article_content && (
        <p className="text-danger">{formErrors.article_content}</p>
      )}
    </Form.Group>
  </Col>
</Row>

                                <Row>
                                    <Col md={12}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Author Name <span style={{ color: "red" }}>*</span></Form.Label>
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
                                            <Form.Label>Upload Author Image <span style={{ color: "red" }}>*</span>  <small className="text-muted d-block">
          (Preffered Image 410×220px and less than 10MB of  Jpeg,Png type )
        </small> </Form.Label>
                                            <Form.Control
                                                type="file"
                                                onChange={handleImageChange}
                                            />
                                            {formErrors.image && <p className="text-danger">{formErrors.image}</p>}
                                            <div className="mt-3">
                                                {previewImage ? (
                                                    <img src={previewImage} alt="Preview" style={{ maxHeight: '200px',maxWidth:'200px', objectFit: 'cover' }} />
                                                ) : existingImage ? (
                                                    <img src={`${process.env.NEXT_PUBLIC_API_URL}/${existingImage}`} alt="Existing" style={{ maxHeight: '200px', objectFit: 'cover' }} />
                                                ) : (
                                                    <p>No image available</p>
                                                )}
                                            </div>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Upload File <span style={{ color: "red" }}>*</span>  <small className="text-muted d-block">
          (Preffered Image 410×220px and less than 10MB of  Jpeg,Png type )
        </small> </Form.Label>
                                            <Form.Control
                                                type="file"
                                                onChange={handleFileChange}
                                            />
                                            {formErrors.file && <p className="text-danger">{formErrors.file}</p>}
                                            <div className="mt-3">
                                                {existingFile ? (
                                                    <a
                                                        href={`${process.env.NEXT_PUBLIC_API_URL}/${existingFile}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        View Existing File
                                                    </a>
                                                ) : (
                                                    <p>No file available</p>
                                                )}
                                            </div>
                                        </Form.Group>
                                    </Col>
                                </Row>
                              <Button type="submit" variant="primary" disabled={isSubmitting}>
  {isSubmitting ? (
    <>
      <Spinner animation="border" size="sm" className="me-2" />
      Updating...
    </>
  ) : (
    "Update Article"
  )}
</Button>

{successMessage && <p className="text-success mt-3">{successMessage}</p>}
{formErrors.general && <p className="text-danger mt-3">{formErrors.general}</p>}

                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}