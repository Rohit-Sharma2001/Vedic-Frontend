'use client';

import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import { postApi } from 'services/api';
import { config } from 'services/config';
import Swal from 'sweetalert2';

export default function ViewNotes() {
    const [googleReviews, setGoogleReviews] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [notes , setNotes] = useState([])
   

      useEffect(() => {
        fetchNotes(currentPage);
      }, [currentPage]);
    
      const fetchNotes = async (page) => {
        try {
          const endpoint = config.GetAllNotes;
          const data = {
            page,
            pageSize,
           
          };
          const response = await postApi(endpoint, data);
          console.log(response.FaqManagement);
          setNotes(response.FaqManagement || []);
          setTotalPages(response.totalPages || 1);
          setTotalCount(response.totalCount || 0);
        } catch (error) {
          console.error("Error fetching centers:", error);
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
         const endpoint = config.DeleteNotes;
         const data = { id };
         await postApi(endpoint, data);
         fetchNotes(currentPage);
       } catch (error) {
         console.error("Error deleting coupon:", error);
       }
     };

    return (
        <Container fluid className="p-6">
            <Row>
                <Col>
                    <h3>Notes By Visiters</h3>
                    <Row>
                        {notes.map((notes) => (
                            <Col lg={4} md={6} sm={12} key={notes?._id} className="mb-4">
                                <Card>
                                    <Card.Body>
                                        <Card.Title><b>Name</b> : {notes?.firstName} {notes?.lastName}</Card.Title>
                                        {/* <Card.Text>{renderStars(review.rating)}</Card.Text> */}
                                        <Card.Text><b>Email</b> : {notes?.email}</Card.Text>
                                        <Card.Text><b>Note</b> : {notes?.message}</Card.Text>
                                        
                                        <Card.Text><b>Date</b> : {new Date(notes.createdAt).toLocaleDateString("en-US")}</Card.Text>
                                      
                                        <div className="d-flex justify-content-end gap-2">
                                            <Button
                                                variant="danger"
                                                onClick={() => confirmDelete(notes._id)}
                                            >
                                                Delete
                                            </Button>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </Col>
            </Row>
        </Container>
    );
}
