"use client";

import { useEffect, useState } from "react";
import { Container, Row, Col, Button, Table } from "react-bootstrap";
import Link from "next/link";
import { config } from "services/config";
import { postApi } from "services/api";

export default function YogaClassDetails({ params }) {
  const id = params.viewid;
  const [yogaClass, setYogaClass] = useState(null);

  useEffect(() => {
    if (id) fetchYogaClassDetails();
  }, [id]);

  const fetchYogaClassDetails = async () => {
    try {
      const response = await postApi(config.ViewYogaClasses, { id });
      if (response.statusCode === 201) {
        setYogaClass(response.result);
      }
    } catch (error) {
      console.error("Error fetching yoga class details:", error);
    }
  };

  if (!yogaClass) return <div>Loading...</div>;

  return (
    <Container fluid className="p-6">
      <Link href={`/admin/Yoga-Classes`} passHref>
        <Button variant="secondary" style={{ float: "right" }} className="mb-3">
          Back
        </Button>
      </Link>
      <Row>
        <Col md={12}>
          <h2>Yoga Class Details</h2>
          <Table bordered className="mt-3">
            <tbody>
              <tr>
                <th>Title</th>
                <td>{yogaClass.title}</td>
              </tr>
              <tr>
                <th>Description</th>
                <td>
                  <div
                    dangerouslySetInnerHTML={{ __html: yogaClass.description }}
                  />
                </td>
              </tr>
              {yogaClass.image && (
                <tr>
                  <th>Image</th>
                  <td>
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL}/${yogaClass.image}`}
                      alt="Yoga Class"
                      width={150}
                      height={150}
                      style={{ objectFit: "cover" }}
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
