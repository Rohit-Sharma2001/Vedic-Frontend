// src/app/admin/users/Practioners/ViewPractitioner.js
"use client";

import { useEffect, useState } from "react";
import { Container, Row, Col, Button, Table, Card } from "react-bootstrap";
import Link from "next/link";
import { config } from "services/config";
import { postApi } from "services/api";

export default function ViewPractitioner({ params }) {
  const { id } = params;
  const [employee, setEmployee] = useState(null);
  const [centersList, setCentersList] = useState([]);
  const [servicesList, setServicesList] = useState([]);

  useEffect(() => {
    if (id) {
      fetchCenters();
      fetchEmployeeDetails();
    }
  }, [id]);

  const fetchCenters = async () => {
    try {
      const res = await postApi(config.centers, { page: 1, pageSize: 100 });
      const centers = res?.centers || [];
      setCentersList(
        centers.map((c) => ({
          label: c.centerName,
          value: c._id,
        }))
      );
    } catch (err) {
      console.error("Failed to fetch centers:", err);
    }
  };

  const fetchAllServices = async (centerIds) => {
    try {
      const payload = {
        page: 1,
        pageSize: 100,
        centerId: centerIds,
      };
      const response = await postApi(config.AllServices, payload);
      const services =
        response?.data?.map((svc) => ({
          label: svc.name,
          value: svc._id,
        })) || [];
      setServicesList(services);
      return services;
    } catch (err) {
      console.error("Failed to fetch services:", err);
      return [];
    }
  };

  const fetchEmployeeDetails = async () => {
    try {
      const response = await postApi(config.viewEmployee, id);
      console.log(response)
      if (response.statusCode === 201) {
        const emp = response.data.employeeData[0];
        setEmployee(emp);

        // Fetch services for display names
        if (emp?.centerId?.length) {
          await fetchAllServices(emp.centerId);
        }
      }
    } catch (error) {
      console.error("Error fetching employee:", error);
    }
  };

  if (!employee) return <div>Loading...</div>;

  const getCenterNames = (centerIds) =>
    centersList
      .filter((c) => centerIds?.includes(c.value))
      .map((c) => c.label)
      .join(", ") || "—";

  const getServiceName = (serviceId) => {
    const svc = servicesList.find((s) => s.value === serviceId);
    return svc ? svc.label : serviceId;
  };

  const formatTo12Hour = (time) => {
  if (!time) return "—";
  const [hour, minute] = time.split(":");
  const date = new Date();
  date.setHours(hour, minute);
  return date.toLocaleString("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
};


  return (
    <Container fluid className="p-4">
      <Link href="/admin/users/Practioners">
        <Button variant="secondary" className="mb-3 float-end">
          Back
        </Button>
      </Link>

      <Card className="p-4 mt-4 shadow-sm">
        <Card.Body>
          <h2 className="mb-4">Practitioner Details</h2>

          <Table bordered responsive>
            <tbody>
              <tr>
                <th>Name</th>
                <td>{employee?.user?.name || "—"}</td>
              </tr>
              <tr>
                <th>Email</th>
                <td>{employee?.user?.email || "—"}</td>
              </tr>
              <tr>
                <th>Mobile No</th>
                <td>{employee?.user?.mobileNo || "—"}</td>
              </tr>
              <tr>
                <th>Centers</th>
                <td>{getCenterNames(employee?.centerId)}</td>
              </tr>
              <tr>
                <th>Services</th>
                <td>
                  {employee?.services?.length ? (
                    employee.services.map((sid, idx) => (
                      <span key={sid}>
                        {getServiceName(sid)}
                        {idx < employee.services.length - 1 && ", "}
                      </span>
                    ))
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
              <tr>
                <th>Working Days</th>
                <td>{employee?.working_days?.join(", ") || "—"}</td>
              </tr>
              <tr>
                <th>Working Time</th>
                <td>
              {formatTo12Hour(employee?.working_time_start)} - {formatTo12Hour(employee?.working_time_end)}

                </td>
              </tr>

               <tr>
  <th>Designation</th>
  <td>{employee?.designation || "—"}</td>
</tr>
<tr>
  <th>Profile Image </th>
  <td><img src={`${process.env.NEXT_PUBLIC_API_URL}/${employee?.user?.file}`} alt={employee?.user?.name} width={100} height={100}/></td>
</tr>

              <tr>
  <th>Expertise</th>
  <td>{employee?.expertise || "—"}</td>
</tr>

<tr>
  <th>Description</th>
  
   <td dangerouslySetInnerHTML={{ __html: employee?.description || "N/A" }}></td>
</tr>

              {/* <tr>
                <th>Skills</th>
                <td>{employee?.skills?.join(", ") || "—"}</td>
              </tr> */}
              <tr>
                <th>Status</th>
                <td>{employee?.is_deleted ? "Inactive" : "Active"}</td>
              </tr>
              <tr>
                <th>Created At</th>
                <td>
                 {employee?.created_at
  ? new Date(employee.created_at).toLocaleString("en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: true,
    })
  : "—"}

                </td>
              </tr>
            </tbody>
          </Table>

          {/* Payroll Section */}
          {employee?.salary?.length > 0 && (
            <>
              <h5 className="mt-4">Payroll Details</h5>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Service</th>
                    <th>Hourly Rate ($)</th>
                  </tr>
                </thead>
                <tbody>
                  {employee.salary.map((s) => (
                    <tr key={s._id}>
                      <td>{getServiceName(s.serviceId)}</td>
                      <td>{s.hourlyRate}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}
