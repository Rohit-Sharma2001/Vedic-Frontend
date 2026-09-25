"use client";

import { useState, useEffect } from "react";
import { Col, Row, Accordion, Container, Button, Modal, Form, Pagination } from "react-bootstrap";
// add to your imports
import { postApi, updateApiWithFile } from "services/api";
import { Trash, PencilSquare } from "react-bootstrap-icons";
import Swal from "sweetalert2";
import { config } from "services/config";
import dynamic from "next/dynamic";

// ✅ Dynamically import ReactQuill (to avoid SSR issues)
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css"; // ✅ Import ReactQuill styles

export default function Faqs() {
    const [faqs, setFaqs] = useState([]);
    const [newFaq, setNewFaq] = useState({ question: "", answer: "" });
    const [show, setShow] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
// edit/use modal states
const [isEditing, setIsEditing] = useState(false);
const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchInitialData();
    }, [currentPage]);

    const fetchInitialData = async () => {
        try {
            const endpoint = config.Faqs;
            const response = await postApi(endpoint, {});

            if (response.statusCode === 201) {
                setFaqs(response.FaqManagement || []);
                setTotalPages(response.totalPages || 1);
                setTotalCount(response.totalCount || 0);
            }
        } catch (error) {
            console.error("Error fetching FAQs:", error);
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleClose = () => {
        setShow(false);
        setNewFaq({ question: "", answer: "" });
    };

    // keep your existing handleClose; add:
const handleShowAdd = () => {
  setIsEditing(false);
  setEditingId(null);
  setNewFaq({ question: "", answer: "" });
  setShow(true);
};

const handleShowEdit = (faq) => {
  setIsEditing(true);
  setEditingId(faq._id);
  setNewFaq({ question: faq.question, answer: faq.answer });
  setShow(true);
};
// === frontend/components/Faqs.tsx ===
// *Only* replace your edit handler to call the correct endpoint
const handleUpdateFaq = async () => {
  if (!editingId || !newFaq.question || !newFaq.answer) {
    alert("Question and answer are required.");
    return;
  }
  try {
    const endpoint = `${config.UpdateFaq}/${editingId}`;
    // Plain JSON is fine; backend also supports base64 in Body('data') if you prefer
    const res = await postApi(endpoint, {
      question: newFaq.question,
      answer: newFaq.answer,
    });

    if (res?.statusCode === 200) {
      setShow(false);
      setIsEditing(false);
      setEditingId(null);
      fetchInitialData();
    } else {
      alert(res?.message || "Failed to update FAQ.");
    }
  } catch (err) {
    console.error("Error updating FAQ:", err);
    alert(err?.response?.data?.message || "An error occurred. Please try again.");
  }
};



    const handleShow = () => setShow(true);

    const handleAddFaq = async () => {
        if (!newFaq.question || !newFaq.answer) {
            alert("Both question and answer are required.");
            return;
        }

        try {
            const endpoint = config.AddFaq;
            const data = { question: newFaq.question, answer: newFaq.answer };
            const response = await postApi(endpoint, data);

            if (response.statusCode === 201) {
                handleClose();
                fetchInitialData();
            } else {
                alert("Failed to add FAQ.");
            }
        } catch (error) {
            console.error("Error adding FAQ:", error);
            alert("An error occurred. Please try again.");
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
                deletedata(id);
                Swal.fire("Deleted!", "Your data has been deleted.", "success");
            }
        });
    };

    const deletedata = async (id) => {
        try {
            const endpoint = config.DeleteFaq;
            await postApi(endpoint, { id });
            fetchInitialData();
        } catch (error) {
            console.error("Error deleting FAQ:", error);
        }
    };

    return (
        <Container fluid className="p-6">
            <Row>
                <Col lg={12} md={12} sm={12}>
                    <div className="border-bottom pb-4 mb-4 d-md-flex align-items-center justify-content-between">
                        <div className="mb-3 mb-md-0">
                            <h1 className="mb-1 h2 fw-bold">FAQs</h1>
                            <p className="mb-0">Find answers to common questions below.</p>
                        </div>
                      <Button variant="primary" onClick={handleShowAdd}>Add FAQ</Button>

                    </div>
                </Col>
            </Row>

            <Accordion defaultActiveKey="0">
                {faqs.map((faq, index) => (
                     <Accordion.Item eventKey={String(index)} key={faq._id}>  {/* ✅ use _id */}
                     <Accordion.Header>
  <div className="d-flex justify-content-between w-100">
    <span>{faq.question}</span>
    <span>
      <PencilSquare
        size={20}
        style={{ marginRight: 10, cursor: "pointer" }}
        onClick={(e) => {
          e.stopPropagation();
          handleShowEdit(faq);
        }}
      />
      <Trash
        size={20}
        style={{ marginRight: 5, cursor: "pointer" }}
        onClick={(e) => {
          e.stopPropagation();
          confirmDelete(faq._id);
        }}
      />
    </span>
  </div>
</Accordion.Header>

                        <Accordion.Body>
                            <div dangerouslySetInnerHTML={{ __html: faq.answer }} /> {/* ✅ Renders HTML answers properly */}
                        </Accordion.Body>
                    </Accordion.Item>
                ))}
            </Accordion>

            <Pagination className="justify-content-center mt-4">
                <Pagination.First onClick={() => handlePageChange(1)} disabled={currentPage === 1} />
                <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Pagination.Item key={page} active={page === currentPage} onClick={() => handlePageChange(page)}>
                        {page}
                    </Pagination.Item>
                ))}
                <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
                <Pagination.Last onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} />
            </Pagination>

           
{/* ✅ Larger Modal with ReactQuill */}
<Modal show={show} onHide={handleClose} size="lg">
  <Modal.Header closeButton>
    <Modal.Title>{isEditing ? "Edit FAQ" : "Add FAQ"}</Modal.Title>
  </Modal.Header>

  <Modal.Body>
    <Form>
      <Form.Group className="mb-3">
        <Form.Label>Question</Form.Label>
        <Form.Control
          type="text"
          value={newFaq.question}
          onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
          placeholder="Enter your question"
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Answer</Form.Label>
        {/* key forces re-mount when switching add/edit so the content shows */}
        <ReactQuill
          key={isEditing ? editingId : "new"}
          value={newFaq.answer}
          onChange={(val) => setNewFaq({ ...newFaq, answer: val })}
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
      </Form.Group>
    </Form>
  </Modal.Body>

  <Modal.Footer>
    <Button variant="secondary" onClick={handleClose}>Close</Button>
    <Button variant="primary" onClick={isEditing ? handleUpdateFaq : handleAddFaq}>
      {isEditing ? "Save Changes" : "Add FAQ"}
    </Button>
  </Modal.Footer>
</Modal>



        </Container>
    );
}
