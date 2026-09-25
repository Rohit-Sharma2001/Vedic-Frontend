'use client';
import { useState, useEffect } from 'react';
import { Col, Row, Table, Button, Container } from 'react-bootstrap';
import Link from 'next/link';
import { Eye, PencilSquare } from 'react-bootstrap-icons';
import { config } from 'services/config'; // Adjust the import path as needed
import { postApi } from 'services/api'; // Adjust the import path as needed

export default function Blogs() {
    const [dataItems, setDataItems] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchData(currentPage);
    }, [currentPage]);

    const fetchData = async (page) => {
        try {
            const endpoint = config.GetLandingPageCaraousalData; 
            const data = { page, pageSize,type : "blogs" };
            const response = await postApi(endpoint, data);
            console.log(response)
            setDataItems(response.resultWithUrls || []);
            setTotalPages(response.totalPages || 1);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const truncateText = (text, maxLength) => {
        return text?.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
    };

    return (
        <Container fluid className="p-6">
            <Row className="align-items-center mb-4">
                <Col>
                    <h2>Blogs</h2>
                </Col>
                <Col className="d-flex justify-content-end">
                    <Link href="Blog-Management/add-blogs" passHref>
                        <Button variant="success">Add New Blogs</Button>
                    </Link>
                </Col>
            </Row>

            <Row>
                <Col xl={12} lg={12} md={12} sm={12}>
                    <Table hover responsive className="text-nowrap">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Title</th>
                                <th>Description</th>
                                <th>Image</th>
                                <th>Button Label</th>
                                <th>Button Route</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dataItems.map((item, index) => (
                                <tr key={item.id}>
                                    <td>{(currentPage - 1) * pageSize + index + 1}</td>
                                    <td>{item.title}</td>
                                    <td>{truncateText(item.descriptions, 17)}</td>
                                    <td><img src={item.imageUrl} height={50} width={100} alt={item.title} /></td>
                                    <td>{truncateText(item.button_label, 17)}</td>
                                    <td>{truncateText(item.button_route, 17)}</td>
                                  
                                    <td>
                                        <Link href={`/admin/cms-landingpage/Blog-Management/view/${item._id}`}>
                                            <Eye size={20} style={{ marginRight: '10px' }} />
                                        </Link>
                                        <Link href={`/admin/cms-landingpage/Blog-Management/edit/${item._id}`}>
                                            <PencilSquare size={20} />
                                        </Link>
                                    </td>
                                    
                                </tr>
                            ))}
                        </tbody>
                    </Table>

                    <Row className="justify-content-center mt-4">
                        <Col xs="auto">
                            <Button
                                variant="secondary"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </Button>
                        </Col>
                        <Col xs="auto">
                            Page {currentPage} of {totalPages}
                        </Col>
                        <Col xs="auto">
                            <Button
                                variant="secondary"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </Button>
                        </Col>
                    </Row>
                </Col>
            </Row>
        </Container>
    );
}
