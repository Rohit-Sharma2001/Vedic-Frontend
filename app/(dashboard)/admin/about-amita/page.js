"use client";
import { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Card } from "react-bootstrap";
import dynamic from "next/dynamic";
import { updateApiWithFile, postApi } from "services/api";
import { config } from "services/config";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";

export default function AddAmita() {
  const [formData, setFormData] = useState({
    bannerImage: null,
    bannerQuote: '',
    description: '',
    quote: '',
    writerName: '',
    quote_image: null,

    // Updated structure: Each array now holds objects with title & text
    career: {
        info: [{ title: "Default Info 1", text: "Default text 1" }],
        degrees: [{ title: "Default Degree 1", text: "Default degree description" }],
        organizations: [{ title: "Default Org 1", text: "Default organization details" }],
    }
});


  const [imagePreview, setImagePreview] = useState(null); // For dynamic image preview
  const [quoteImagePreview, setQuoteImagePreview] = useState(null);
  const [careerImagePreview, setCareerImagePreview] = useState(null); // NEW PREVIEW STATE
  const [errors, setErrors] = useState({});
  const [uploadStatus, setUploadStatus] = useState("");

  useEffect(() => {
    fetchInitialData();
  }, []);



  const fetchInitialData = async () => {
    try {
        const endpoint = config.AboutAmita;
        const response = await postApi(endpoint, {});

        console.log(response)
        setFormData({
            bannerImage: null,
            bannerQuote: response.coupon?.bannerQuote || '',
            description: response.coupon?.description || '',
            quote: response.coupon?.quote || '',
            writerName: response.coupon?.writerName || '',
            quote_image: null,
            career: {
              info: response.coupon?.career?.info || [{ title: "", text: "" }],
              degrees: response.coupon?.career?.degrees || [{ title: "", text: "" }],
              organizations: response.coupon?.career?.organizations || [{ title: "", text: "" }],
          }
          
          
        });
        setImagePreview(response.coupon.file ? `${process.env.NEXT_PUBLIC_API_URL}/${response.coupon.file}` : null);
        setQuoteImagePreview(response.coupon.quote_image ? `${process.env.NEXT_PUBLIC_API_URL}/${response.coupon.quote_image}` : null);
        setCareerImagePreview(response.coupon.career_image ? `${process.env.NEXT_PUBLIC_API_URL}/${response.coupon.career_image}` : null);

    } catch (error) {
        console.error('Error fetching initial data:', error);

        setFormData({
            bannerImage: null,
            bannerQuote: '',
            description: '',
            quote: '',
            writerName: '',
            quote_image: null,

            career: {
                info: [{ title: "", text: "" }],
                degrees: [{ title: "", text: "" }],
                organizations: [{ title: "", text: "" }],
            }
        });
    }
};




  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleImageUpload = (e, fieldName, setPreview) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        [fieldName]: file,
      });
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleDescriptionChange = (value) => {
    setFormData({
      ...formData,
      description: value,
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.bannerQuote)
      newErrors.bannerQuote = "Banner Quote is required.";
    if (!formData.description)
      newErrors.description = "Description is required.";
    if (!formData.quote) newErrors.quote = "Quote is required.";
    if (!formData.writerName) newErrors.writerName = "Writer Name is required.";
    if (!formData.bannerImage && !imagePreview)
      newErrors.bannerImage = "Banner Image is required.";
    if (!formData.quote_image && !quoteImagePreview)
      newErrors.quote_image = "Quote Image is required."; // NEW VALIDATION
    if (!formData.career_image && !careerImagePreview)
        newErrors.career_image = "Quote Image is required."; // NEW VALIDATION
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const endpoint = config.Updateaboutamita;

      const files = {
        file: formData.bannerImage,
        quote_image: formData.quote_image,
        career_image:formData.career_image,
      };
      const data = {
        bannerQuote: formData.bannerQuote,
        description: formData.description,
        quote: formData.quote,
        writerName: formData.writerName,
        career: formData.career, 
      };
      const id = "674834fc5b2cc04e91d2e442";
      console.log(data)
      const response = await updateApiWithFile(endpoint, id, data, files);
     console.log(response)
      if (response.statusCode == 200) {
        fetchInitialData();
        setUploadStatus("Page updated successfully!");
        console.log("Response:", response);
      }
    } catch (error) {
      setUploadStatus("Error updating page.");
      alert(error.response.data.message)
      console.error("Error:", error);
    }
  };

  const handleCareerInputChange = (e, field, index, key) => {
    const updatedArray = [...formData.career[field]];
    updatedArray[index][key] = e.target.value;

    setFormData({
        ...formData,
        career: {
            ...formData.career,
            [field]: updatedArray
        }
    });
};


const addCareerItem = (field) => {
  setFormData({
      ...formData,
      career: {
          ...formData.career,
          [field]: [...formData.career[field], { title: "", text: "" }]
      }
  });
};

const removeCareerItem = (field, index) => {
  const updatedArray = formData.career[field].filter((_, i) => i !== index);

  setFormData({
      ...formData,
      career: {
          ...formData.career,
          [field]: updatedArray
      }
  });
};


  return (
    <Container fluid>
      <Row>
        <Col>
          <Card className="p-4 mt-4">
            <Card.Body>
              <h2>Update Details</h2>
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <strong>Banner Quote</strong>{" "}
                        <b style={{ color: "red" }}>*</b>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="bannerQuote"
                        value={formData.bannerQuote}
                        onChange={handleInputChange}
                      />
                      {errors.bannerQuote && (
                        <p className="text-danger">{errors.bannerQuote}</p>
                      )}
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <strong>Banner Image</strong>{" "}
                        <b style={{ color: "red" }}>*</b>
                      </Form.Label>
                      <Form.Control
                        type="file"
                        name="bannerImage"
                        onChange={(e) =>
                          handleImageUpload(e, "bannerImage", setImagePreview)
                        }
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <strong>Preview Banner Image</strong>
                      </Form.Label>
                      {imagePreview && (
                        <div className="mt-2">
                          <img
                            src={imagePreview}
                            alt="Selected Banner"
                            style={{
                              width: "100%",
                              maxHeight: "150px",
                              objectFit: "contain",
                            }}
                          />
                        </div>
                      )}
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <strong>Description</strong>{" "}
                        <b style={{ color: "red" }}>*</b>
                      </Form.Label>
                      <ReactQuill
                        value={formData.description}
                        onChange={handleDescriptionChange}
                        theme="snow"
                        modules={{
                          toolbar: [
                            [{ header: [1, 2, false] }],
                            ["bold", "italic", "underline"],
                            [{ list: "ordered" }, { list: "bullet" }],
                            ["link"],
                          ],
                        }}
                      />
                      {errors.description && (
                        <p className="text-danger">{errors.description}</p>
                      )}
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <strong>Bottom Quote</strong>{" "}
                        <b style={{ color: "red" }}>*</b>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="quote"
                        value={formData.quote}
                        onChange={handleInputChange}
                      />
                      {errors.quote && (
                        <p className="text-danger">{errors.quote}</p>
                      )}
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <strong>Writer Name</strong>{" "}
                        <b style={{ color: "red" }}>*</b>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="writerName"
                        value={formData.writerName}
                        onChange={handleInputChange}
                      />
                      {errors.writerName && (
                        <p className="text-danger">{errors.writerName}</p>
                      )}
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <strong>Quote Image</strong>{" "}
                        <b style={{ color: "red" }}>*</b>
                      </Form.Label>
                      <Form.Control
                        type="file"
                        name="quote_image"
                        onChange={(e) =>
                          handleImageUpload(
                            e,
                            "quote_image",
                            setQuoteImagePreview
                          )
                        }
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <strong>Preview Quote Image</strong>
                      </Form.Label>
                      {quoteImagePreview && (
                        <div className="mt-2">
                          <img
                            src={quoteImagePreview}
                            alt="Selected Banner"
                            style={{
                              width: "100%",
                              maxHeight: "150px",
                              objectFit: "contain",
                            }}
                          />
                        </div>
                      )}
                    </Form.Group>
                  </Col>
              
                 
                </Row>

                       {/* Amita Jain's Career Section */}
<Card className="mt-4 p-3">
    <h3>Amita Jain s Career</h3>

    {/* Info Section */}
    <Form.Group className="mb-3">
      
        <Row>    <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <strong>Career Image</strong>{" "}
                        <b style={{ color: "red" }}>*</b>
                      </Form.Label>
                      <Form.Control
                        type="file"
                        name="career_image"
                        onChange={(e) =>
                          handleImageUpload(
                            e,
                            "career_image",
                            setCareerImagePreview
                          )
                        }
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <strong>Preview Career Image</strong>
                      </Form.Label>
                      {careerImagePreview && (
                        <div className="mt-2">
                          <img
                            src={careerImagePreview}
                            alt="Selected Banner"
                            style={{
                              width: "100%",
                              maxHeight: "150px",
                              objectFit: "contain",
                            }}
                          />
                        </div>
                      )}
                    </Form.Group>
                  </Col></Row>
                  <Form.Label><strong>Amita Jain Info</strong></Form.Label>
        {formData.career.info.map((item, index) => (
            <div key={index} className="d-flex gap-2 align-items-center mb-2">
                <Form.Control
                    type="text"
                    placeholder="Title"
                    value={item.title}
                    onChange={(e) => handleCareerInputChange(e, "info", index, "title")}
                    className="w-40"
                />
                {/* <Form.Control
                    type="text"
                    placeholder="Text"
                    value={item.text}
                    onChange={(e) => handleCareerInputChange(e, "info", index, "text")}
                    className="w-50"
                /> */}
                <Button variant="danger" onClick={() => removeCareerItem("info", index)}>❌</Button>
            </div>
        ))}
        <div className="d-flex justify-content-end">
            <Button variant="success" onClick={() => addCareerItem("info")}> Add Info</Button>
        </div>
    </Form.Group>

    {/* Degrees Section */}
    <Form.Group className="mb-3">
        <Form.Label><strong>Degrees</strong></Form.Label>
        {formData.career.degrees.map((item, index) => (
            <div key={index} className="d-flex gap-2 align-items-center mb-2">
                <Form.Control
                    type="text"
                    placeholder="Title"
                    value={item.title}
                    onChange={(e) => handleCareerInputChange(e, "degrees", index, "title")}
                    className="w-40"
                />
                <Form.Control
                    type="text"
                    placeholder="Text"
                    value={item.text}
                    onChange={(e) => handleCareerInputChange(e, "degrees", index, "text")}
                    className="w-50"
                />
                <Button variant="danger" onClick={() => removeCareerItem("degrees", index)}>❌</Button>
            </div>
        ))}
        <div className="d-flex justify-content-end">
            <Button variant="success" onClick={() => addCareerItem("degrees")}> Add Degree</Button>
        </div>
    </Form.Group>

    {/* Organizations Section */}
    <Form.Group className="mb-3">
        <Form.Label><strong>Organizations</strong></Form.Label>
        {formData.career.organizations.map((item, index) => (
            <div key={index} className="d-flex gap-2 align-items-center mb-2">
                <Form.Control
                    type="text"
                    placeholder="Title"
                    value={item.title}
                    onChange={(e) => handleCareerInputChange(e, "organizations", index, "title")}
                    className="w-40"
                />
                <Form.Control
                    type="text"
                    placeholder="Text"
                    value={item.text}
                    onChange={(e) => handleCareerInputChange(e, "organizations", index, "text")}
                    className="w-50"
                />
                <Button variant="danger" onClick={() => removeCareerItem("organizations", index)}>❌</Button>
            </div>
        ))}
        <div className="d-flex justify-content-end">
            <Button variant="success" onClick={() => addCareerItem("organizations")}> Add Organization</Button>
        </div>
    </Form.Group>
</Card>


                <Button type="submit" className="mt-3" variant="primary">
                  Update Page
                </Button>
              </Form>
        
              {uploadStatus && <p className="mt-3">{uploadStatus}</p>}
            </Card.Body>
          </Card>

      
        </Col>
      </Row>
    </Container>
  );
}
