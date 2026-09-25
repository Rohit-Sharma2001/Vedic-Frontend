// File path: app/center/[id]/page.js

'use client';

import { useEffect, useState } from 'react';
import { Container, Row, Col, Button, Table } from 'react-bootstrap';
import Link from 'next/link';
import { config } from 'services/config';
import { postApi } from 'services/api';

export default function StoreDetails({ params }) {
    const id = params.viewid;
    const [center, setCenter] = useState(null);

    useEffect(() => {
        if (id) {
            fetchCenterDetails();
        }
    }, [id]);

    const fetchCenterDetails = async () => {
        try {
            const endpoint = config.Viewcenter;
            const data = { id };
            const response = await postApi(endpoint, data);
            console.log(response.centerManagementData)
            if (response.statusCode === 201) {
                setCenter(response.centerManagementData);
            }
        } catch (error) {
            console.error('Error fetching center details:', error);
        }
    };

    if (!center) {
        return <div>Loading...</div>;
    }

    return (
        <Container fluid className="p-6">
            <Link href={`/admin/Store-Management`} passHref>
                <Button variant="secondary" style={{ float: 'right' }} className="mb-3">
                    Back
                </Button>
            </Link>
            <Row>
                <Col md={12}>
                    <h2>Center Details</h2>
                    <Table bordered className="mt-3">
                        <tbody>
                            <tr>
                                <th>Store Name</th>  {/* New Field */}
                                <td>{center.centerName}</td>
                            </tr>
                            <tr>
                                <th>Opening Time</th>  {/* New Field */}
                                <td>{center.openingTime}</td>
                            </tr>
                            <tr>
                                <th>Closing Time</th>  {/* New Field */}
                                <td>{center.closingTime}</td>
                            </tr>
                            <tr>
                                <th>Address</th>
                                <td>{center.address}</td>
                            </tr>
                            <tr>
                                <th>Phone Number</th>
                                <td>{center.phone_number}</td>
                            </tr>
                            <tr>
                                <th>Email</th>
                                <td>{center.email}</td>
                            </tr>
                            <tr>
                                <th>Details</th>
                                <td dangerouslySetInnerHTML={{ __html: center.details }}></td>
                            </tr>
                            <tr>
                                <th>Created Date</th>
                                {/* <td>{center.date}</td> */}
                                <td>{new Date(center.date).toLocaleDateString("en-US")}</td>
                            </tr>
                            {center.file && (
                                <tr>
                                    <th>Image</th>
                                    <td>
                                        <img
                                            src={`${process.env.NEXT_PUBLIC_API_URL}/${center.file}`}
                                            alt="Center"
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
