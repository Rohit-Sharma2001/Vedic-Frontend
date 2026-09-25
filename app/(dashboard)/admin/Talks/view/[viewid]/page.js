"use client";

import { useEffect, useState } from "react";
import { Container, Row, Col, Button, Table } from "react-bootstrap";
import Link from "next/link";
import { config } from "services/config";
import { postApi } from "services/api";

export default function TalkDetails({ params }) {
  const id = params.viewid;
  const [talk, setTalk] = useState(null);

  useEffect(() => {
    if (id) fetchTalkDetails();
  }, [id]);

  const fetchTalkDetails = async () => {
    try {
      const response = await postApi(config.ViewTalks, { id });
      if (response.statusCode === 201) {
        setTalk(response.result);
      }
    } catch (error) {
      console.error("Error fetching talk details:", error);
    }
  };

  if (!talk) return <div>Loading...</div>;

  return (
    <Container fluid className="p-6">
      <Link href="/admin/Talks" passHref>
        <Button variant="secondary" style={{ float: "right" }} className="mb-3">
          Back
        </Button>
      </Link>

      <Row>
        <Col md={12}>
          <h2>Talk Details</h2>
          <Table bordered className="mt-3">
            <tbody>
              <tr>
                <th>Title</th>
                <td>{talk.title}</td>
              </tr>
              <tr>
                <th>Video Link</th>
                <td>
                  <a href={talk.video_link} target="_blank" rel="noopener noreferrer">
                    {talk.video_link}
                  </a>
                </td>
              </tr>
              {talk.image && (
                <tr>
                  <th>Image</th>
                  <td>
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL}/${talk.image}`}
                      alt="Talk"
                      width={100}
                      height={100}
                      style={{ maxWidth: "100%", height: "auto" }}
                    />
                  </td>
                </tr>
              )}
              <tr>
                <th>Description</th>
                <td>
                  <div
                    dangerouslySetInnerHTML={{ __html: talk.description }}
                  />
                </td>
              </tr>
              <tr>
                <th>Status</th>
                <td
                  style={{
                    color: talk.status === 1 ? "green" : "red",
                  }}
                >
                  {talk.status === 1 ? "Active" : "Inactive"}
                </td>
              </tr>
              <tr>
                <th>Created Date</th>
                <td>
                  {new Date(talk.date || talk.created_at).toLocaleDateString("en-US")}
                </td>
              </tr>
            </tbody>
          </Table>
        </Col>
      </Row>
    </Container>
  );
}
