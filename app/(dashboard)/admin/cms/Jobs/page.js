'use client';

import { Col, Row, Form, Table, Button, Container, Pagination, Badge } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import { config } from 'services/config';
import { postApi } from 'services/api';
import { Eye, PencilSquare, Trash, PersonLinesFill } from 'react-bootstrap-icons';
import Swal from 'sweetalert2';
import Link from 'next/link';
import { Modal } from 'react-bootstrap';

export default function JobsSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [togglingId, setTogglingId] = useState(null); // prevent double toggle

  useEffect(() => {
    fetchJobs(1);
  }, []);

  const fetchJobs = async (page) => {
    try {
      const endpoint = config.allJobs;
      const data = { page, pageSize, jobTitle: searchQuery?.trim() || undefined };
      const response = await postApi(endpoint, data);
      setJobs(response.JobManagement || []);
      setFilteredJobs([]);
      setTotalPages(response.totalPages || 1);
      setTotalCount(response.totalCount || 0);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    fetchJobs(page);
  };

  const handleSearch = () => {
    const results = jobs.filter((job) =>
      (job.jobTitle || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredJobs(results);
  };

  const handleView = (job) => {
    setSelectedJob(job);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedJob(null);
  };

  const confirmDelete = (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        deleteJobs(id);
        Swal.fire('Deleted!', 'The job has been deleted.', 'success');
      }
    });
  };

  const deleteJobs = async (id) => {
    try {
      const endpoint = config.DeleteJobs;
      const data = { id };
      await postApi(endpoint, data);
      fetchJobs(currentPage);
    } catch (error) {
      console.error('Error deleting job:', error);
    }
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);

  // Status badge helper
  const renderStatusBadge = (status) => {
    const isActive = Number(status) === 1;
    return <Badge bg={isActive ? 'success' : 'secondary'}>{isActive ? 'Active' : 'Inactive'}</Badge>;
  };

  // Toggle status with SweetAlert confirmation
  const handleToggleStatus = async (job) => {
    const isActive = Number(job.status) === 1;

    const confirm = await Swal.fire({
      title: isActive ? 'Deactivate this job?' : 'Activate this job?',
      text: `Current status: ${isActive ? 'Active' : 'Inactive'}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: isActive ? 'Yes, deactivate' : 'Yes, activate',
      cancelButtonText: 'Cancel',
      confirmButtonColor: isActive ? '#d33' : '#28a745',
    });
    if (!confirm.isConfirmed) return;

    try {
      setTogglingId(job._id);
      const res = await postApi(config.ToggleJobStatus, { job_id: job._id });

      if (res?.statusCode === 200 && res?.data) {
        const newStatus = Number(res.data.status) === 1 ? 'Active' : 'Inactive';
        setJobs((prev) =>
          prev.map((j) => (j._id === job._id ? { ...j, status: res.data.status, modified: res.data.modified } : j))
        );
        await Swal.fire({
          title: 'Updated',
          text: `Job is now ${newStatus}`,
          icon: 'success',
          timer: 1400,
          showConfirmButton: false,
        });
      } else {
        await Swal.fire({
          title: 'Failed',
          text: res?.message || 'Failed to toggle status',
          icon: 'error',
        });
      }
    } catch (err) {
      console.error('Toggle status failed', err);
      await Swal.fire({
        title: 'Error',
        text: 'Failed to toggle status',
        icon: 'error',
      });
    } finally {
      setTogglingId(null);
    }
  };

  const list = filteredJobs.length > 0 ? filteredJobs : jobs;

  return (
    <>
      <Container fluid className="p-6">
        <Row className="align-items-center mb-4">
          <Col>
            <h2>Jobs Management</h2>
          </Col>
          <Col className="d-flex justify-content-end">
            <Link href="/admin/cms/Jobs/add-jobs">
              <Button variant="primary">Add Job</Button>
            </Link>
          </Col>
        </Row>

        <Row>
          <Col xl={12} lg={12} md={12} sm={12}>
            {/* Optional search:
            <div className="my-3">
              <Form className="d-flex align-items-center gap-2">
                <Form.Control
                  type="text"
                  placeholder="Search by Title"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button variant="primary" onClick={() => fetchJobs(1)}>Search</Button>
              </Form>
            </div> */}

            <Table hover responsive className="text-nowrap">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Job Title</th>
                  <th>Location</th>
                  <th>Type</th>
                  <th>Status</th> {/* NEW */}
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {list.map((job, index) => (
                  <tr key={job._id || `${job.jobTitle}-${index}`}>
                    <td>{(currentPage - 1) * pageSize + index + 1}</td>
                    <td>{job.jobTitle}</td>
                    <td>{job.jobLocation}</td>
                    <td>{job.jobType}</td>

                    {/* Status badge + toggle switch */}
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        {renderStatusBadge(job.status)}
                        <Form.Check
                          type="switch"
                          id={`toggle-${job._id}`}
                          checked={Number(job.status) === 1}
                          style={{cursor:'pointer'}}
                          disabled={togglingId === job._id}
                          onChange={() => handleToggleStatus(job)}
                          label={Number(job.status) === 1 ? 'On' : 'Off'}
                        />
                      </div>
                    </td>

                    <td className="d-flex align-items-center">
                      <span
                        onClick={() => handleView(job)}
                        style={{ cursor: 'pointer', color: '#624bff' }}
                        title="View details"
                        className="me-3"
                      >
                        <Eye size={20} />
                      </span>

                      <Link href={`/admin/cms/Jobs/edit/${job._id}`} className="me-3" title="Edit job">
                        <PencilSquare size={20} />
                      </Link>

                      <span
                        onClick={() => confirmDelete(job._id)}
                        style={{ cursor: 'pointer', color: '#624bff' }}
                        title="Delete job"
                        className="me-3"
                      >
                        <Trash size={20} />
                      </span>

                      <Link href={`/admin/cms/Jobs/applications/${job._id}`} title="View applications">
                        <PersonLinesFill size={20} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>

            <Pagination className="justify-content-center mt-4">
              <Pagination.First onClick={() => handlePageChange(1)} disabled={currentPage === 1} />
              <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Pagination.Item key={page} active={page === currentPage} onClick={() => handlePageChange(page)}>
                  {page}
                </Pagination.Item>
              ))}
              <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
              <Pagination.Last onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} />
            </Pagination>
          </Col>
        </Row>
      </Container>

      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Job Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedJob && (
            <>
              <p><strong>Job Title:</strong> {selectedJob.jobTitle}</p>
              <p><strong>Description:</strong> {selectedJob.jobDescription}</p>
              <p><strong>Location:</strong> {selectedJob.jobLocation}</p>
              <p><strong>Job Type:</strong> {selectedJob.jobType}</p>
              <p>
                <strong>Salary:</strong>{' '}
                {selectedJob.jobType === 'Paid' ? formatCurrency(selectedJob.salary) : 'Not Applicable'}
              </p>
              <p>
                <strong>Payment Type:</strong>{' '}
                {selectedJob.jobType === 'Paid' ? selectedJob.paymentType : 'Not Applicable'}
              </p>
              <p>
                <strong>Status:</strong>{' '}
                {Number(selectedJob.status) === 1 ? 'Active' : 'Inactive'}
              </p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}