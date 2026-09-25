// File: app/events/[viewid]/page.js
"use client";

import { useEffect, useState } from "react";
import { Container, Row, Col, Button, Table, Image, Badge, Card } from "react-bootstrap";
import Link from "next/link";
import { config } from "services/config";
import { postApi } from "services/api";
import { useRouter } from "next/navigation";
export default function EventDetails({ params }) {
  const id = params.viewid;
  const [event, setEvent] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (id) fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      const endpoint = config.ViewYogaClass;
      const data = { id };
      const response = await postApi(endpoint, data);
      console.log("Class Details:", response);

      if (response.statusCode === 200 || response.statusCode === 201) {
        setEvent(response.class);
      }
    } catch (error) {
      console.error("Error fetching Class details:", error);
    }
  };

  if (!event) return <div className="text-center mt-5">Loading Class Details...</div>;

  return (
    <Container fluid className="p-4">
      <Row className="mb-4">
        <Col>
          <h2 className="fw-bold mb-3">Yoga Class Details</h2>
        </Col>
        <Col className="text-end">
            <Button variant="secondary" onClick={()=>{router.back();}}>Back</Button>
          {/* </Link> */}
        </Col>
      </Row>

      {/* Class Overview */}
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <Row>
            <Col md={4}>
              {event.coverImage ? (
                <img src={`${process.env.NEXT_PUBLIC_API_URL}/${event.coverImage}`} width={200} height={200} alt="Cover" fluid rounded className="mb-3" />
              ) : (
                <div className="bg-light text-center p-5 border rounded">No Cover Image</div>
              )}
            </Col>
            <Col md={8}>
              <h3 className="fw-semibold">{event.classname}</h3>
              <p>
                <Badge bg={event.status === 1 ? "success" : "danger"}>
                  {event.status === 1 ? "Active" : "Inactive"}
                </Badge>
                {event.is_exclusive && (
                  <Badge bg="warning" text="dark" className="ms-2">
                    Exclusive
                  </Badge>
                )}
                {event.is_rsvp && (
                  <Badge bg="info" text="dark" className="ms-2">
                    RSVP Class
                  </Badge>
                )}
              </p>
              <p className="mb-1">
                <strong>Date:</strong>{" "}
                {event?.date ? new Date(`${new Date(event.date).toISOString().split("T")[0]}T${event.time}`).toLocaleDateString("en-US") : "N/A"} 
              </p>
              <p className="mb-1">
                <strong>Time:</strong>
                  {new Date(`1970-01-01T${event.time}`).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
              </p>
              <p className="mb-1">
                <strong>Format:</strong> {event.format}
              </p>
              {event.format === "Online" && (
                <p className="mb-1">
                  <strong>Meeting Link:</strong>{" "}
                  <a href={event.meeting_link} target="_blank" rel="noopener noreferrer">
                    {event.meeting_link}
                  </a>
                </p>
              )}
              <p className="mb-1">
                <strong>Host:</strong> {event.host_name || "N/A"}
              </p>
              <p className="mb-1">
                <strong>Class For:</strong> {event.event_type || "N/A"}
              </p>
              <p className="mb-0">
                <strong>Price:</strong> ${event.Price}
              </p>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Location Details */}
      <Card className="shadow-sm mb-4">
        <Card.Header className="fw-semibold bg-light">Location Details</Card.Header>
        <Card.Body>
          <Table borderless>
            <tbody>
              <tr><th>Address</th><td>{event.address}</td></tr>
              <tr><th>City</th><td>{event.city}</td></tr>
              <tr><th>State</th><td>{event.state}</td></tr>
              <tr><th>Country</th><td>{event.country}</td></tr>
              <tr><th>Pin Code</th><td>{event.pincode}</td></tr>
              <tr><th>Latitude</th><td>{event.latitude}</td></tr>
              <tr><th>Longitude</th><td>{event.longitude}</td></tr>
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Description */}
      <Card className="shadow-sm mb-4">
        <Card.Header className="fw-semibold bg-light">Description</Card.Header>
        <Card.Body>
          <div dangerouslySetInnerHTML={{ __html: event.description || "<p>No description</p>" }} />
        </Card.Body>
      </Card>

      {/* Speaker Info */}
      <Card className="shadow-sm mb-4">
        <Card.Header className="fw-semibold bg-light">Teacher Information</Card.Header>
        <Card.Body>
          <Row>
            <Col md={3}>
              {event.file ? (
                <Image src={`${process.env.NEXT_PUBLIC_API_URL}/${event.file}`} alt="Speaker" fluid rounded />
              ) : (
                <div className="bg-light text-center p-5 border rounded">No Teacher Image</div>
              )}
            </Col>
            <Col md={9}>
              <p><strong>Name:</strong> {event.speakername}</p>
              <p><strong>Designation:</strong> {event.speakerdesignation}</p>
              <div>
                <strong>Description:</strong>
                <div
                  dangerouslySetInnerHTML={{
                    __html: event.speakerdescription || "<p>No Teacher description</p>",
                  }}
                />
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Membership Pricing (Exclusive Events Only) */}
      {event.is_exclusive && event.membership_pricing?.length > 0 && (
        <Card className="shadow-sm mb-4">
          <Card.Header className="fw-semibold bg-light">Membership-Specific Pricing</Card.Header>
          <Card.Body>
            <Table bordered>
              <thead>
                <tr>
                  <th>Membership</th>
                  <th>Price ($)</th>
                </tr>
              </thead>
              <tbody>
                {event.membership_pricing.map((m) => (
                  <tr key={m._id}>
                    <td>{m.membership_name}</td>
                    <td>{m.price}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      {/* Extra Images */}
      <Card className="shadow-sm mb-4">
        <Card.Header className="fw-semibold bg-light">Class Images</Card.Header>
        <Card.Body>
          <Row>
            {event.icon_file && (
              <Col md={3} className="text-center mb-3">
                <img src={`${process.env.NEXT_PUBLIC_API_URL}/${event.icon_file}`} width={100}height={100} alt="Icon" fluid rounded />
                <p className="mt-2 small text-muted">Class Image</p>
              </Col>
            )}
            {event.coverImage && (
              <Col md={3} className="text-center mb-3">
                 <img src={`${process.env.NEXT_PUBLIC_API_URL}/${event.coverImage}`} width={100}height={100} alt="Icon" fluid rounded />
                <p className="mt-2 small text-muted">Cover Image</p>
              </Col>
            )}
            {event.file && (
              <Col md={3} className="text-center mb-3">
                 <img src={`${process.env.NEXT_PUBLIC_API_URL}/${event.file}`} width={100}height={100} alt="Icon" fluid rounded />
                <p className="mt-2 small text-muted">Teacher Image</p>
              </Col>
            )}
          </Row>
        </Card.Body>
      </Card>

      {/* Metadata */}
      <Card className="shadow-sm">
        <Card.Header className="fw-semibold bg-light">Metadata</Card.Header>
        <Card.Body>
          <p>
            <strong>Created On:</strong>{" "}
            {event.date_created ? new Date(event.date_created).toLocaleString() : "N/A"}
          </p>
          <p>
            <strong>Last Modified:</strong>{" "}
            {event.modified ? new Date(event.modified).toLocaleString() : "N/A"}
          </p>
          <p>
            <strong>Max Tickets:</strong> {event.max_tickets || "N/A"}
          </p>
          <p>
            <strong>Max Ticket Limit Per User:</strong> {event.maxTicketsPerUser || "N/A"}
          </p>
        </Card.Body>
      </Card>
    </Container>
  );
}
