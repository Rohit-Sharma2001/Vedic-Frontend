// File path: app/data/[id]/page.js

'use client';

import { useEffect, useState } from 'react';
import { Container, Row, Col, Button, Table } from 'react-bootstrap';
import Link from 'next/link';
import { config } from 'services/config';
import { postApi } from 'services/api';

export default function DataDetails({ params }) {
    const id = params.viewid; // Extract the data item id from route parameters
    const [dataItem, setDataItem] = useState(null);

    useEffect(() => {
        if (id) {
            fetchDataItemDetails();
        }
    }, [id]);

    const fetchDataItemDetails = async () => {
        try {
            const endpoint = config.ViewLandingPageCaraousalDatabyid; // Endpoint for fetching data item details
            const data = { id };
            const response = await postApi(endpoint, data);
            if (response.statusCode === 201) {
                // console.log(response)
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
            <Link href={`/admin/cms-landingpage/healing-believing`} passHref>
                <Button variant="secondary" style={{ float: 'right' }} className="mb-3">
                    Back
                </Button>
            </Link>
            <Row>
                <Col md={12}>
                    <h2>Data Item Details</h2>
                    <Table bordered className="mt-3">
                        <tbody>
                            <tr>
                                <th>Title</th>
                                <td>{dataItem.title}</td>
                            </tr>
                            <tr>
                                <th>Description</th>
                                <td>{dataItem.descriptions}</td>
                            </tr>
                            {/* <tr>
                                <th>Button Label</th>
                                <td>{dataItem.button_label}</td>
                            </tr>
                            <tr>
                                <th>Button Route</th>
                                <td>{dataItem.button_route}</td>
                            </tr> */}
                            <tr>
                                <th>Created Date</th>
                                <td>{new Date(dataItem.date).toLocaleDateString("en-US")}</td>
                            </tr>
                           {dataItem.file && (
    <tr>
        <th>File</th>
        <td>
            {dataItem.file.endsWith(".mp4") ? (
                <a
                    href={`${process.env.NEXT_PUBLIC_API_URL}/${dataItem.file}`}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <video
                        src={`${process.env.NEXT_PUBLIC_API_URL}/${dataItem.file}`}
                        style={{ maxWidth: "300px", height: "auto", cursor: "pointer" }}
                        muted
                    />
                </a>
            ) : (
                <a
                    href={`${process.env.NEXT_PUBLIC_API_URL}/${dataItem.file}`}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <img
                        src={`${process.env.NEXT_PUBLIC_API_URL}/${dataItem.file}`}
                        alt="Data Item"
                        style={{ maxWidth: "300px", height: "auto", cursor: "pointer" }}
                    />
                </a>
            )}
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
