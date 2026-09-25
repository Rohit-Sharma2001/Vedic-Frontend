'use client';

import { useEffect, useState } from 'react';
import { Container, Row, Col, Button, Table } from 'react-bootstrap';
import Link from 'next/link';
import { config } from 'services/config';
import { postApi } from 'services/api';

export default function BlogDetails({ params }) {
    const id = params.viewid;
    const [blog, setBlog] = useState(null);

    useEffect(() => {
        if (id) {
            fetchBlogDetails();
        }
    }, [id]);

    const fetchBlogDetails = async () => {
        try {
            const endpoint = config.Viewblog;
            const data = { id };
            const response = await postApi(endpoint, data);
            console.log(response);
            if (response.statusCode === 201) {
                setBlog(response.blogManagementData);
            }
        } catch (error) {
            console.error('Error fetching blog details:', error);
        }
    };

    if (!blog) {
        return <div>Loading...</div>;
    }

    return (
        <Container fluid className="p-6">
            <Link href={`/admin/Blog-Management/Blogs`} passHref>
                <Button variant="secondary" style={{ float: 'right' }} className="mb-3">
                    Back
                </Button>
            </Link>
            <Row>
                <Col md={12}>
                    <h2>Blog Details</h2>
                    <Table bordered className="mt-3">
                        <tbody>
                            <tr>
                                <th>Title</th>
                                <td>{blog.title}</td>
                            </tr>
                            <tr>
                                <th>Description</th>
                                <td>
                                    {/* Render rich text with dangerouslySetInnerHTML */}
                                    <div
                                        dangerouslySetInnerHTML={{ __html: blog.description }}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <th>Type</th>
                                <td>{blog.type}</td>
                            </tr>
                            <tr>
                                <th>Views </th>
                                <td>{blog.viewCount}</td>
                            </tr>
                            <tr>
                                <th>Created Date</th>
                                <td>{new Date(blog.created_at).toLocaleDateString("en-US")}</td>

                            </tr>
                            <tr>
                                <th>Status </th>
                                <td  style={{
                        cursor: "pointer",
                        color: blog.status === "Active" ? "green" : "red",
                      }}
                      >{blog.status}</td>
                            </tr>
                            {blog.file && (
                                <tr>
                                    <th>Image</th>
                                    <td>
                                        <img
                                            src={`${process.env.NEXT_PUBLIC_API_URL}/${blog.file}`}
                                            alt="Blog"
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
