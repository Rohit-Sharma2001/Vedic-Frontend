'use client';

import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { useState, useEffect } from 'react';

export default function Reviews() {
    const [activeTab, setActiveTab] = useState('google'); // Track which tab (Google or Anonymous) is active
    const [googleReviews, setGoogleReviews] = useState([]);
    const [anonymousReviews, setAnonymousReviews] = useState([]);

    const dummyGoogleReviews = [
        {
            id: 1,
            reviewer: "Michael Scott",
            rating: 5,
            review: "Fantastic service and great experience!",
        },
        {
            id: 2,
            reviewer: "Pam Beesly",
            rating: 4,
            review: "Helpful and friendly staff, would recommend.",
        },
        {
            id: 3,
            reviewer: "Jim Halpert",
            rating: 5,
            review: "Exceptional care and attention!",
        },
        {
            id: 4,
            reviewer: "Dwight Schrute",
            rating: 3,
            review: "Efficient but needs better communication.",
        },
    ];

    const dummyAnonymousReviews = [
        {
            id: 1,
            rating: 3,
            review: "Good service, but waiting times can be long.",
        },
        {
            id: 2,
            rating: 4,
            review: "Clean and well-maintained facility.",
        },
        {
            id: 3,
            rating: 5,
            review: "Outstanding experience, highly recommended!",
        },
        {
            id: 4,
            rating: 2,
            review: "Not satisfied with the level of care.",
        },
    ];

    useEffect(() => {
        // Initialize dummy data
        setGoogleReviews(dummyGoogleReviews);
        setAnonymousReviews(dummyAnonymousReviews);
    }, []);

    const renderStars = (rating) => {
        return Array.from({ length: 5 }, (_, index) => (
            <span key={index} style={{ color: index < rating ? "gold" : "lightgray" }}>★</span>
        ));
    };

    const handleApprove = (id, type) => {
        alert(`Review with ID ${id} from ${type} approved.`);
        // Logic to handle approval can be implemented here
    };



    return (
        <Container fluid className="p-6">
            <Row className="mb-4">
                <Col className="text-center">
                    <Button
                        variant={activeTab === 'google' ? "primary" : "outline-primary"}
                        className="mx-2"
                        onClick={() => setActiveTab('google')}
                    >
                        Google Reviews
                    </Button>
                    <Button
                        variant={activeTab === 'anonymous' ? "primary" : "outline-primary"}
                        className="mx-2"
                        onClick={() => setActiveTab('anonymous')}
                    >
                        Anonymous Reviews
                    </Button>
                </Col>
            </Row>

            <Row>
                <Col>
                    {activeTab === 'google' && (
                        <>
                            <h3>Google Reviews</h3>
                            <Row>
                                {googleReviews.map((review) => (
                                    <Col lg={4} md={6} sm={12} key={review.id} className="mb-4">
                                        <Card>
                                            <Card.Body>
                                                <Card.Title>{review.reviewer}</Card.Title>
                                                <Card.Text>{renderStars(review.rating)}</Card.Text>
                                                <Card.Text>{review.review}</Card.Text>
                                                <div className="d-flex justify-content-end gap-2">
                                                    <Button
                                                        variant="success"
                                                        onClick={() => handleApprove(review.id, 'Google')}
                                                    >
                                                        Approve
                                                    </Button>
                                                    
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        </>
                    )}

                    {activeTab === 'anonymous' && (
                        <>
                            <h3>Anonymous Reviews</h3>
                            <Row>
                                {anonymousReviews.map((review) => (
                                    <Col lg={4} md={6} sm={12} key={review.id} className="mb-4">
                                        <Card>
                                            <Card.Body>
                                                <Card.Text>{renderStars(review.rating)}</Card.Text>
                                                <Card.Text>{review.review}</Card.Text>
                                                <div className="d-flex justify-content-end gap-2">
                                                    <Button
                                                        variant="success"
                                                        onClick={() => handleApprove(review.id, 'Anonymous')}
                                                    >
                                                        Approve
                                                    </Button>
                                                  
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        </>
                    )}

                    {activeTab === '' && (
                        <div className="text-center">
                            <p>Select a tab to view reviews.</p>
                        </div>
                    )}
                </Col>
            </Row>
        </Container>
    );
}
