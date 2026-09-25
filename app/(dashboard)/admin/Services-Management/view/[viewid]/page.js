'use client';

import { useEffect, useState } from 'react';
import { Container, Row, Col, Button, Table } from 'react-bootstrap';
import Link from 'next/link';
import { config } from 'services/config';
import { postApi } from 'services/api';

export default function ServicesDetails({ params }) {
    const id = params.viewid;
    const [blog, setBlog] = useState(null);

    useEffect(() => {
        if (id) {
            fetchBlogDetails();
        }
    }, [id]);

    const fetchBlogDetails = async () => {
        try {
            const endpoint = config.ViewService;
            const data = { id };
            const response = await postApi(endpoint, data);
            console.log(response);
            if (response.statusCode === 201 || response.statusCode === 200) {
                setBlog(response.data[0]);
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
            <Link href={`/admin/Services-Management`} passHref>
                <Button variant="secondary" style={{ float: 'right' }} className="mb-3">
                    Back
                </Button>
            </Link>
            <Row>
                <Col md={12}>
                    <h2>Services Details</h2>
                    <Table bordered className="mt-3">
                        <tbody>
                            <tr>   
                                <th>Name</th>
                                <td>{blog.name}</td>
                            </tr>
                        
                            <tr>
                                <th>Description</th>
                                <td>{blog.description}</td>
                            </tr>

                            <tr>
                                <th>Type </th>
                                <td>{blog.service_type?.name}</td>
                            </tr>
                             <tr>
                                <th>Price </th>
                                <td>{blog.price}$</td>
                            </tr>
                            
                            <tr>
                                <th>Center </th>
                                <td> {Array.isArray(blog.centers)
      ? blog.centers.map((r) => r.centerName).join(", ")
      : "-"}</td>
                            </tr>
                            <tr>
  <th>Resource</th>
  <td>
    {Array.isArray(blog.resource)
      ? blog.resource.map((r) => r.name).join(", ")
      : "-"}
  </td>
</tr>

<tr>
  <th>Add-ons</th>
  <td>
    {Array.isArray(blog.add_ons)
      ? blog.add_ons.map((a) => a.name).join(", ")
      : "-"}
  </td>
</tr>

<tr>
  <th>Live Stream</th>
  <td>{blog.live_stream ? "Yes" : "No"}</td>
</tr>

<tr>
  <th>Mobile Service</th>
  <td>{blog.mobile_service ? "Yes" : "No"}</td>
</tr>

<tr>
  <th>Cleanup Time</th>
  <td>{blog.cleanup_time} min</td>
</tr>

<tr>
  <th>Show Online</th>
  <td>{blog.show_online}</td>
</tr>

<tr>
  <th>Employees</th>
  <td>
    {Array.isArray(blog.employees)
      ? blog.employees.map((e) => e.name).join(", ")
      : "-"}
  </td>
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
                            {/* {blog.file && (
                                <tr>
                                    <th>Image</th>
                                    <td>
                                        <img
                                            src={`${process.env.NEXT_PUBLIC_API_URL}/${blog.file}`}
                                            alt="Blog"
                                            width={100} height={100}
                                            style={{ maxWidth: '100%', height: 'auto' }}
                                        />
                                    </td>
                                </tr>
                            )} */}
                        </tbody>
                    </Table>
                </Col>
            </Row>
        </Container>
    );  
}
