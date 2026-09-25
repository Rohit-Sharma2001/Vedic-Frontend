'use client';

import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, ProgressBar, Badge } from 'react-bootstrap';
import Link from 'next/link';
import { postApi } from 'services/api';
import axios from 'axios';
import { config } from 'services/config';

export default function EventSummary({ params }) {
  const [data, setData] = useState(null);
  const eventId = params.eventid;

  useEffect(() => {
    if (eventId) fetchEventSummary();
  }, [eventId]);

  const fetchEventSummary = async () => {
    try {
      const endpoint = config.getTicketsBookedForYogaClass;
      const response = await postApi(endpoint, { classId : eventId });

      if (response.statusCode === 200 || response.statusCode === 201) {
        setData(response);
      }
    } catch (error) {
      console.error('Error fetching Class summary:', error);
    }
  };
    // ✅ Helper function to convert time to 12-hour format
  const convertTo12HourFormat = (timeString) => {
    if (!timeString) return "N/A";
    
    if (timeString.match(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes} ${ampm}`;
    }
    
    if (timeString.includes('AM') || timeString.includes('PM')) {
      return timeString;
    }
    
    return timeString;
  };

  if (!data) return <div className="text-center mt-5">Loading Class summary...</div>;

  const { YogaClassInfo, tickets, summary } = data;
  const totalRevenue = tickets.reduce((sum, t) => sum + t.grandTotal, 0);
  const paidTickets = tickets.filter((t) => t.status === 'paid').length;
  const rsvpTickets = tickets.filter((t) => t.status === 'rsvp').length;
  const bookingPercentage = Math.round((YogaClassInfo.currentBookings / YogaClassInfo.maxTickets) * 100);
  const downloadExcel = async () => {
    try {
      const payload = btoa(JSON.stringify({ id: eventId }));
      const endpoint = config.downloadTicketsYoga;

      const response = await axios.post(
        endpoint,
        { data: payload },
        {
          responseType: "blob" // 🔥 REQUIRED
        }
      );

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      });

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "Yoga-Class-Bookings.xlsx";
      link.click();

      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error("Download error:", error);
    }
  };
  return (
    <Container fluid className="p-4">
      {/* Header */}
      <Row className="align-items-center mb-4">
        <Col>
          <h2 className="fw-bold text-primary mb-0">🎟️ Yoga Class Summary</h2>
          <p className="text-muted mb-0">{YogaClassInfo.classname}</p>
        </Col>
        <Col className="text-end">
          <Link href="/admin/Yoga-Class-Management/Yoga-Classes" passHref>
            <Button variant="secondary">← Back</Button>
          </Link>
        </Col>
      </Row>

      <Row className="g-3 mb-4">
        <Col md={3}>
          <Card className="shadow-sm text-center p-3">
            <h6 className="text-muted">📅 Date (Time)</h6>
            <h5>{new Date(YogaClassInfo.ClassDate).toLocaleDateString('en-US')} - ({convertTo12HourFormat(YogaClassInfo.ClassTime)})</h5>
   
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm text-center p-3">
            <h6 className="text-muted">🎫 Total Tickets</h6>
            <h5>{YogaClassInfo.maxTickets}</h5>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm text-center p-3">
            <h6 className="text-muted">✅ Booked Tickets</h6>
            <h5 className="text-success">{YogaClassInfo.currentBookings}</h5>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm text-center p-3">
            <h6 className="text-muted">🪙 Total Revenue</h6>
            <h5 className="text-primary">${totalRevenue}</h5>
          </Card>
        </Col>
      </Row>

      {/* Analytics Overview */}
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <h5 className="text-secondary mb-3 fw-semibold">📊 Analytics Overview</h5>
          <Row>
            <Col md={6}>
              <p className="mb-2">
                <strong>Booking Progress:</strong> {bookingPercentage}%
              </p>
              <ProgressBar
                now={bookingPercentage}
                label={`${bookingPercentage}%`}
                variant={bookingPercentage >= 80 ? 'success' : bookingPercentage >= 50 ? 'warning' : 'danger'}
                className="mb-3"
              />
              <p className="mb-1">
                <strong>Available Tickets:</strong>{' '}
                <Badge bg={YogaClassInfo.availableTickets === 0 ? 'danger' : 'success'}>
                  {YogaClassInfo.availableTickets}
                </Badge>
              </p>
              <p className="mb-1">
                <strong>Remaining Tickets:</strong> {summary.remainingTickets}
              </p>
            </Col>

            <Col md={6}>
              <p className="mb-1">
                <strong>Paid Tickets:</strong> {paidTickets}
              </p>
              <p className="mb-1">
                <strong>RSVP (Free) Tickets:</strong> {rsvpTickets}
              </p>
              <p className="mb-1">
                <strong>Average Ticket Value:</strong>{' '}
                ${paidTickets > 0 ? (totalRevenue / paidTickets).toFixed(2) : 0}
              </p>
              <p className="mb-0">
                <strong>Status:</strong>{' '}
                {summary.isFullyBooked ? (
                  <Badge bg="danger">Fully Booked</Badge>
                ) : (
                  <Badge bg="success">Available</Badge>
                )}
              </p>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Tickets Table */}
      <Card className="shadow-sm">
        <Card.Body>
          <div className='d-flex justify-content-between align-items-center'>
            <h5 className="text-secondary fw-semibold mb-3">🎟️ Booked Tickets</h5>
            <button className='btn btn-primary' style={{ width: "180px" }} onClick={downloadExcel}> Download Bookings</button>
          </div>
          <div className="table-responsive">
            <table className="table align-middle table-striped">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Booking Number</th>
                  <th>Buyer</th>
                  <th>Email</th>
                  <th>Mobile</th>
                  <th>Quantity</th>
                  <th>Status</th>
                  <th>Total ($)</th>
                  <th>Booked On</th>
                  <th>Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {tickets.length > 0 ? (
                  tickets.map((t, index) => (
                    <tr key={t._id}>
                      <td>{index + 1}</td>
                      <td className="fw-semibold">{t.ticketNumber}</td>
                      <td>{t.user.name}</td>
                      <td>{t.user.email}</td>
                      <td>{t.user.mobileNo}</td>
                      <td>{t.quantity}</td>
                      <td>
                        <Badge bg={t.status === 'paid' ? 'success' : 'info'}>
                          {t.status.toUpperCase()}
                        </Badge>
                      </td>
                      <td>${(t.grandTotal||0).toFixed(2)}</td>
                      <td>
                        {t.created_at
                          ? new Date(t.created_at).toLocaleString("en-US", {
                            timeZone: "America/New_York",
                            year: "numeric",
                            month: "short",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                            hour12: true
                          })
                          : "-"}
                      </td>

                      <td>
                        {t.modified
                          ? new Date(t.modified).toLocaleString("en-US", {
                            timeZone: "America/New_York",
                            year: "numeric",
                            month: "short",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                            hour12: true
                          })
                          : "-"}
                      </td>
                      {/* <td>{new Date(t.created_at).toLocaleString()}</td>
                      <td>{new Date(t.modified).toLocaleString()}</td> */}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="text-center text-muted">
                      No tickets booked yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card.Body>
      </Card>

      {/* Summary Footer */}
      <Card className="shadow-sm mt-4">
        <Card.Body className="text-center">
          <h6 className="text-muted mb-2">Yoga Class Booking Summary</h6>
          <p className="mb-0">
            <strong>{summary.totalTicketsBooked}</strong> of{' '}
            <strong>{summary.totalTicketsAvailable}</strong> tickets booked (
            <strong>{summary.remainingTickets}</strong> remaining)
          </p>
        </Card.Body>
      </Card>
    </Container>
  );
}
