// File path: app/data/[id]/page.js

'use client';

import { useEffect, useState } from 'react';
import { Container, Row, Col, Button, Table } from 'react-bootstrap';
import Link from 'next/link';
import { config } from 'services/config';
import { postApi } from 'services/api';

export default function ViewBanner({ params }) {
    const id = params.viewid; // Extract the data item id from route parameters
    const [dataItem, setDataItem] = useState(null);

    useEffect(() => {
        if (id) {
            fetchDataItemDetails();
        }
    }, [id]);

    const fetchDataItemDetails = async () => {
        try {
            const endpoint = config.ViewProjectSections; // Endpoint for fetching data item details
            const data = { id };
            const response = await postApi(endpoint, data);
            if (response.statusCode === 201) {
                console.log(response)
                setDataItem(response.result);
            }
        } catch (error) {
            console.error('Error fetching data item details:', error);
        }
    };

    if (!dataItem) {
        return <div>Loading...</div>;
    }

    return (
        <Container fluid className="p-6">
            <Link href={`/admin/Master/ProjectSection`} passHref>
                <Button variant="secondary" style={{ float: 'right' }} className="mb-3">
                    Back
                </Button>
            </Link>
            <Row>
                <Col md={12}>
                    <h2>Banner Details</h2>
                    <Table bordered className="mt-3">
                        <tbody>
                            <tr>
                                <th>Text</th>
                                <td>{dataItem?.text}</td>
                            </tr>
                            <tr>
                                <th>Heading</th>
                                <td>{dataItem.heading}</td>
                            </tr>
                            <tr>
                                <th>Description</th>
                                <td>{dataItem.description}</td>
                            </tr>
                           
                            <tr>
                                <th>Created Date</th>
                               
                                <td> {new Date(dataItem.date).toLocaleDateString("en-US")}</td>
                            </tr>
                            {dataItem.image && (
                                <tr>
                                    <th>Image</th>
                                    <td>
                                        <img
                                            src={`${process.env.NEXT_PUBLIC_API_URL}/${dataItem.image}`}
                                            alt="Data Item"
                                            style={{ maxWidth: '100%', height: 'auto' }}
                                        />
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </Col>
            </Row>
        </Container>
    );
}
