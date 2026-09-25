// File path: app/events/[viewid]/page.js
"use client";

import { useEffect, useState } from "react";
import { Container, Row, Col, Button, Table, Image } from "react-bootstrap";
import Link from "next/link";
import { config } from "services/config";
import { postApi } from "services/api";

export default function EventDetails({ params }) {
  const id = params.viewid;
  const [event, setEvent] = useState(null);

  useEffect(() => {
    if (id) {
      fetchEventDetails();
    }
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      const endpoint = config.Viewevent;
      const data = { id };
      const response = await postApi(endpoint, data);

      console.log("Yoga Details:", response);
      
      if (response.statusCode === 201 || response.statusCode === 200) {
        setEvent(response.event);
      }
    } catch (error) {
      console.error("Error fetching yoga details:", error);
    }
  };

  if (!event) {
    return <div>Loading...</div>;
  }

  return (
    <Container fluid className="p-6">
      <Link href={`/admin/yoga_video/Yoga`} passHref>
        <Button variant="secondary" style={{ float: "right" }} className="mb-3">
          Back
        </Button>
      </Link>

      <Row>
        <Col md={12}>
          <h2>Event Details</h2>
          <Table bordered className="mt-3">
            <tbody>
              <tr>
                <th>Event Name</th>
                <td>{event.eventname}</td>
              </tr>
              <tr>
                <th>Date</th>
                <td>{event.date ? new Date(event.date).toLocaleDateString("en-US") : "N/A"}</td>
              </tr>
              <tr>
                <th>Time</th>
                <td>{event.time || "N/A"}</td>
              </tr>
              <tr>
                <th>Format</th>
                <td>{event.format}</td>
              </tr>
              <tr>
                <th>Price ($)</th>
                <td>{event.Price}</td>
              </tr>
              <tr>
                <th>Address</th>
                <td>{event.address}</td>
              </tr>
              <tr>
                <th>City</th>
                <td>{event.city}</td>
              </tr>
              <tr>
                <th>State</th>
                <td>{event.state}</td>
              </tr>
              <tr>
                <th>Country</th>
                <td>{event.country}</td>
              </tr>
              <tr>
                <th>Pin Code</th>
                <td>{event.pincode}</td>
              </tr>
              <tr>
                <th>Latitude</th>
                <td>{event.latitude}</td>
              </tr>
              <tr>
                <th>Longitude</th>
                <td>{event.longitude}</td>
              </tr>
              <tr>
                <th>Description</th>
                <td dangerouslySetInnerHTML={{ __html: event.description }}></td>
              </tr>
              <tr>
                <th>Speaker Name</th>
                <td>{event.speakername}</td>
              </tr>
              <tr>
                <th>Speaker Designation</th>
                <td>{event.speakerdesignation}</td>
              </tr>
              <tr>
                <th>Speaker Description</th>
                <td dangerouslySetInnerHTML={{ __html: event.speakerdescription }}></td>
              </tr>
              <tr>
                <th>Status</th>
                <td>
                  {event.status === 1 ? (
                    <span className="text-success">Active</span>
                  ) : (
                    <span className="text-danger">Inactive</span>
                  )}
                </td>
              </tr>
              <tr>
                <th>Created Date</th>
                <td>
                  {event.createdAt
                    ? new Date(event.createdAt).toLocaleString("en-US")
                    : "N/A"}
                </td>
              </tr>

              {/* Display Images */}
              {event.file && (
                <tr>
                  <th>Main Image</th>
                  <td>
                    <Image
                      src={`${process.env.NEXT_PUBLIC_API_URL}/${event.file}`.replace(/\\/g, "/")}
                      alt="Event"
                      fluid
                      width={50}
                      height={50}
                    />
                  </td>
                </tr>
              )}
              {event.icon_file && (
                <tr>
                  <th>Icon Image</th>
                  <td>
                    <Image
                      src={`${process.env.NEXT_PUBLIC_API_URL}/${event.icon_file}`.replace(/\\/g, "/")}
                      alt="Event Icon"
                      fluid
                       width={50}
                      height={50}
                    />
                  </td>
                </tr>
              )}
              {event.coverImage && (
                <tr>
                  <th>Cover Image</th>
                  <td>
                    <Image
                      src={`${process.env.NEXT_PUBLIC_API_URL}/${event.coverImage}`.replace(/\\/g, "/")}
                      alt="Event Cover"
                      fluid
                     width={50}
                      height={50}
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
