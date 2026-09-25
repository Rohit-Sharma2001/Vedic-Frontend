"use client";

import { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Badge,
  Card,
  Accordion,
  Spinner,
} from "react-bootstrap";
import Link from "next/link";
import { config } from "services/config";
import { postApi } from "services/api";
import Table from "react-bootstrap/Table";
export default function MembershipPlanView({ params }) {
  const { viewid } = params;
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (viewid) fetchPlanDetails();
  }, [viewid]);

  const fetchPlanDetails = async () => {
    try {
      const response = await postApi(config.ViewMembershipPlan, { id: viewid });
      console.log(response.result)
      if (response.statusCode === 200 || response.statusCode === 201) {
        setPlan(response.result);
      }
    } catch (error) {
      console.error("Error fetching plan:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" /> <p>Loading plan details...</p>
      </div>
    );

  if (!plan)
    return (
      <div className="text-center mt-5 text-danger">
        Failed to load plan details.
      </div>
    );

  return (
    <Container fluid className="p-5">
      <Row className="align-items-center mb-4">
        <Col>
          <h2 className="fw-bold text-secondary">{plan.plan_name}</h2>
        </Col>
        <Col className="text-end">
          <Link href="/admin/Membership-Management">
            <Button variant="outline-secondary">Back</Button>
          </Link>
        </Col>
      </Row>

      <Card className="shadow-sm p-3 mb-4">
        <Row>
          <Col md={3} className="d-flex justify-content-center align-items-center">
            {plan.image ? (
              <img
                src={`${process.env.NEXT_PUBLIC_API_URL}/${plan.image}`}
                alt={plan.plan_name}
                className="rounded"
                style={{
                  width: "100%",
                  maxWidth: "200px",
                  height: "200px",
                  objectFit: "cover",
                  border: "2px solid #f1f1f1",
                }}
              />
            ) : (
              <div className="text-muted text-center">No Image</div>
            )}
          </Col>
          <Col md={9}>
            <h4 className="mb-3">Plan Overview</h4>
           
            <div
              className="border rounded p-3 bg-light"
              dangerouslySetInnerHTML={{
                __html:
                  plan.plan_description || "<i>No description provided</i>",
              }}
            />
           <div className="bold mt-2">
  Price: ${plan.price ? plan.price : "N/A"}
</div>

{/* 🆕 Add this below Price */}
<div className="bold mt-2">
  Expiring In:{" "}
  {plan.expiring_in
    ? `${plan.expiring_in} day${plan.expiring_in > 1 ? "s" : ""}`
    : "N/A"}
</div>

            <div className="mt-3 d-flex flex-wrap gap-3">
                
              <Badge bg={plan.status === 1 ? "success" : "secondary"}>
                {plan.status === 1 ? "Active" : "Inactive"}
              </Badge>

              <Badge bg="info">
                Created:{" "}
                {plan.created_date
                  ? new Date(plan.created_date).toLocaleDateString('en-US')
                  : "N/A"}
              </Badge>
              <Badge bg="dark">
                Modified:{" "}
                {plan.modified_date
                  ? new Date(plan.modified_date).toLocaleDateString('en-US')
                  : "N/A"}
              </Badge>
            </div>
          </Col>
        </Row>
      </Card>

      <Card className="shadow-sm p-3">
        <h4 className="mb-4">Plan Details</h4>

       {Array.isArray(plan.plan_details) && plan.plan_details.length > 0 ? (
  <Table responsive bordered hover className="mb-0">
    <thead>
      <tr>
        <th style={{ width: 80 }}>#</th>
        <th>Title</th>
      </tr>
    </thead>
    <tbody>
      {plan.plan_details.map((detail, index) => (
        <tr key={detail?.id ?? index}>
          <td>{index + 1}</td>
          <td>{detail?.title?.trim() || "N/A"}</td>
        </tr>
      ))}
    </tbody>
  </Table>
) : (
  <div className="text-muted">
    No detailed information available for this plan.
  </div>
)}

      </Card>
    </Container>
  );
}
