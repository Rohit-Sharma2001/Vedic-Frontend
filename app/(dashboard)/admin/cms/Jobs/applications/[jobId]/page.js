// app/admin/cms/Jobs/applications/[jobId]/page.jsx

'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Container, Row, Col, Table, Pagination, Badge, Button, Form, Modal
} from 'react-bootstrap';
import { Eye } from 'react-bootstrap-icons';            // ✅ Eye icon
import Swal from 'sweetalert2';                          // ✅ SweetAlert2
import { postApi } from 'services/api';
import { config } from 'services/config';

const ALLOWED_STATUSES = ['New', 'Contacted', 'Rejected', 'Selected'];

export default function JobApplicationsPage() {
  const params = useParams();
  const jobId = params?.jobId;

  const [applications, setApplications] = useState([]);
  const [jobTitle, setJobTitle] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // ✅ Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);

  useEffect(() => {
    if (jobId) fetchApplications(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  const fetchApplications = async (p) => {
    try {
      setLoading(true);
      const res = await postApi(config.JobApplications, {
        job_id: jobId,
        page: p,
        pageSize,
      });
      setApplications(res?.data || []);
      setTotalPages(res?.totalPages || 1);
      setTotalCount(res?.totalCount || 0);
      setPage(p);
      if (!jobTitle && res?.data?.length) setJobTitle(res.data[0]?.jobTitle || 'Job Applications');
    } catch (e) {
      console.error('Failed to fetch applications', e);
    } finally {
      setLoading(false);
    }
  };

  const fmt = (d) => {
    if (!d) return '-';
    const date = new Date(d);
    return isNaN(date.getTime()) ? '-' : date.toLocaleString();
  };

  const statusBadge = (status) => {
    const s = (status || '').toLowerCase();
    let variant = 'secondary';
    if (s === 'new') variant = 'info';
    else if (s === 'contacted') variant = 'primary';
    else if (s === 'rejected') variant = 'danger';
    else if (s === 'selected') variant = 'success';
    return <Badge bg={variant}>{status || 'New'}</Badge>;
  };

  // ✅ SweetAlert-driven status update
  const handleStatusChange = async (applicationId, nextStatus) => {
    setErrorMsg('');

    const app = applications.find(a => a._id === applicationId);
    const prevStatus = app?.status;

    const confirm = await Swal.fire({
      title: 'Update status?',
      html: `Change status from <b>${prevStatus}</b> to <b>${nextStatus}</b>?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, update',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#28a745'
    });
    if (!confirm.isConfirmed) return;

    setUpdating(applicationId);
    try {
      const res = await postApi(config.UpdateApplicationStatus, {
        application_id: applicationId,
        status: nextStatus,
      });

      if (res?.statusCode === 200) {
        const updated = res?.data;
        setApplications((prev) =>
          prev.map((a) =>
            a._id === applicationId
              ? { ...a, status: updated?.status || nextStatus, updatedAt: updated?.updatedAt }
              : a
          )
        );
        await Swal.fire({
          title: 'Updated',
          text: `Status set to ${updated?.status || nextStatus}`,
          icon: 'success',
          timer: 1400,
          showConfirmButton: false,
        });
      } else {
        setErrorMsg(res?.message || 'Failed to update status');
        await Swal.fire({
          title: 'Failed',
          text: res?.message || 'Failed to update status',
          icon: 'error',
        });
      }
    } catch (e) {
      console.error('Failed to update application status', e);
      setErrorMsg('Failed to update status');
      await Swal.fire({
        title: 'Error',
        text: 'Failed to update status',
        icon: 'error',
      });
    } finally {
      setUpdating(null);
    }
  };

  // ✅ Modal helpers
  const openDetails = (app) => {
    setSelectedApp(app);
    setShowModal(true);
  };
  const closeDetails = () => {
    setShowModal(false);
    setSelectedApp(null);
  };

  return (
    <Container fluid className="p-6">
      <Row className="align-items-center mb-4">
        <Col>
          <h3>Applications</h3>
          <div className="text-muted">Job ID: {jobId}</div>
          {errorMsg ? <div className="text-danger mt-2">{errorMsg}</div> : null}
        </Col>
        <Col className="d-flex justify-content-end gap-2">
          <Link href="/admin/cms/Jobs">
            <Button variant="outline-secondary">Back to Jobs</Button>
          </Link>
        </Col>
      </Row>

      <Row>
        <Col>
          <Table hover responsive className="text-nowrap">
            <thead>
              <tr>
                <th>#</th>
                <th>Applicant</th>
                {/* <th>Email</th> */}
                <th>Phone</th>
                <th>Available From</th>
                {/* <th>Resume</th> */}
                <th>Status</th>
                <th>Applied At</th>
                <th>Actions</th> {/* ✅ new */}
              </tr>
            </thead>
            <tbody>
              {applications.length === 0 && !loading && (
                <tr><td colSpan={9} className="text-center py-4">No applications yet.</td></tr>
              )}
              {applications.map((app, idx) => (
                <tr key={app._id || `${app.email}-${idx}`}>
                  <td>{(page - 1) * pageSize + idx + 1}</td>
                  <td>{app.firstName} {app.lastName}</td>
                  {/* <td>{app.email}</td> */}
                  <td>{app.phone || '-'}</td>
                  <td>{fmt(app.availableDate)}</td>
                  {/* <td>
                    {app.resumeLink
                      ? <a href={`${process.env.NEXT_PUBLIC_API_URL}${app.resumeLink}`} target="_blank" rel="noreferrer">Open</a>
                      : '-'}
                  </td> */}

                  <td style={{ minWidth: 200 }}>
                    <div className="d-flex align-items-center gap-2">
                      {/* {statusBadge(app.status)} */}
                      <Form.Select
                        size="sm"
                        value={app.status}
                        disabled={updating === app._id}
                        onChange={(e) => handleStatusChange(app._id, e.target.value)}
                      >
                        {ALLOWED_STATUSES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </Form.Select>
                    </div>
                  </td>

                  <td>{fmt(app.createdAt)}</td>

                  {/* ✅ Eye action */}
                  <td>
                    <span
                      role="button"
                      title="View details"
                      onClick={() => openDetails(app)}
                      style={{ color: '#624bff' }}
                    >
                      <Eye size={18} />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          <Pagination className="justify-content-center mt-4">
            <Pagination.First onClick={() => fetchApplications(1)} disabled={page === 1} />
            <Pagination.Prev onClick={() => fetchApplications(page - 1)} disabled={page === 1} />
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Pagination.Item key={p} active={p === page} onClick={() => fetchApplications(p)}>
                {p}
              </Pagination.Item>
            ))}
            <Pagination.Next onClick={() => fetchApplications(page + 1)} disabled={page === totalPages} />
            <Pagination.Last onClick={() => fetchApplications(totalPages)} disabled={page === totalPages} />
          </Pagination>
        </Col>
      </Row>

      {/* ✅ Details modal */}
      <Modal show={showModal} onHide={closeDetails} centered>
        <Modal.Header closeButton>
          <Modal.Title>Application Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedApp ? (
            <div className="table-responsive">
              <Table borderless size="sm" className="mb-0">
                <tbody>
                  <tr><th className="pe-3">Name</th><td>{selectedApp.firstName} {selectedApp.lastName}</td></tr>
                  <tr><th className="pe-3">Email</th><td>{selectedApp.email}</td></tr>
                  <tr><th className="pe-3">Phone</th><td>{selectedApp.phone || '-'}</td></tr>
                  <tr><th className="pe-3">Available From</th><td>{fmt(selectedApp.availableDate)}</td></tr>
                  <tr><th className="pe-3">Status</th><td>{statusBadge(selectedApp.status)}</td></tr>
                  <tr><th className="pe-3">Applied At</th><td>{fmt(selectedApp.createdAt)}</td></tr>
                  <tr>
                    <th className="pe-3">Resume</th>
                    <td>
                      {selectedApp.resumeLink
                        ? <a href={`${process.env.NEXT_PUBLIC_API_URL}${selectedApp.resumeLink}`} target="_blank" rel="noreferrer">Open Resume</a>
                        : '-'}
                    </td>
                  </tr>
                </tbody>
              </Table>
            </div>
          ) : null}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeDetails}>Close</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
