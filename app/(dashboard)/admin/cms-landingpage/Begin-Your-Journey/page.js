"use client";

import { useState, useEffect } from "react";
import { Col, Row, Table, Button, Container, Modal, Form } from "react-bootstrap";
import Link from "next/link";
import { Eye, PencilSquare, Trash } from "react-bootstrap-icons";
import { config } from "services/config";
import { postApi, updateApiWithFile } from "services/api";
import Swal from "sweetalert2";

export default function BeginYourJourney() {
  const [dataItems, setDataItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // ===== NEW: header title/subtitle states + modal =====
  // Replace with your correct document id used by your update API
  const DOCUMENT_ID = "68243b752897e78f4551679a";
  const UPDATE_ENDPOINT = config.UpdateBalancingDiet;

  const [showHeaderModal, setShowHeaderModal] = useState(false);
  const [journeyTitle, setJourneyTitle] = useState("Begin Your Journey");
  const [journeySubtitle, setJourneySubtitle] = useState("Begin Your Journey");
  const [loadingHeader, setLoadingHeader] = useState(false);
  const [savingHeader, setSavingHeader] = useState(false);

  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage]);

  // ===== NEW: fetch title/subtitle (on mount or modal open) =====
  // IMPORTANT: adjust how you read response based on your backend.
  // If your backend returns these fields in some other endpoint, swap endpoint + parser.
  const fetchJourneyHeader = async () => {
    setLoadingHeader(true);
    try {
      // You said "submit also call the api to get the two fields"
      // Using the same GET pattern you already have; adjust if needed.
      const endpoint = config.GetBalancingDiet;
      const payload = { type: "kapha" };
      const response = await postApi(endpoint, payload);

      console.log("Header Details ", response)
      // ✅ Adjust these lines to your real response shape:
      // Option A (common): fields at top-level
      const title = response?.data.data[0].begin_journey_title;
      const subtitle = response?.data.data[0].begin_journey_subtitle;

      // Option B (if backend returns under "data" or similar):
      // const title = response?.data?.begin_journey_title;
      // const subtitle = response?.data?.begin_journey_subtitle;

      setJourneyTitle(title || "Begin Your Journey");
      setJourneySubtitle(subtitle || "Begin Your Journey");
    } catch (error) {
      console.error("Error fetching begin journey header:", error);
    } finally {
      setLoadingHeader(false);
    }
  };

  const fetchData = async (page) => {
    try {
      const endpoint = config.GetLandingPageCaraousalData;
      const data = { page, pageSize, type: "begin_your_journey" };
      const response = await postApi(endpoint, data);
      setDataItems(response.resultWithUrls || []);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const confirmDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        deletedata(id);
        Swal.fire("Deleted!", "Your data has been deleted.", "success");
      }
    });
  };

  const deletedata = async (id) => {
    try {
      const endpoint = config.DeleteLandingPageCaraousalData;
      await postApi(endpoint, { id });
      fetchData(currentPage);
    } catch (error) {
      console.error("Error deleting coupon:", error);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const truncateText = (text, maxLength) => {
    return text?.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
  };

  // ===== NEW: open modal + load current values =====
  const openHeaderModal = async () => {
    setShowHeaderModal(true);
    await fetchJourneyHeader();
  };

  // ===== NEW: save title/subtitle via SAME update API as banner text =====
  const saveHeader = async () => {
    setSavingHeader(true);
    try {
      const payload = {
        begin_journey_title: journeyTitle,
        begin_journey_subtitle: journeySubtitle,
      };

      const res = await updateApiWithFile(config.UpdateBalancingDiet, DOCUMENT_ID, payload, {});
      if (res?.statusCode === 200) {
        await fetchJourneyHeader();
        setShowHeaderModal(false);
      }
    } catch (error) {
      console.error("Error updating begin journey header:", error);
    } finally {
      setSavingHeader(false);
    }
  };

  // Optional: load current header once on mount (so UI shows real values without opening modal)
  useEffect(() => {
    fetchJourneyHeader();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Container fluid className="p-6">
      <Row className="align-items-center mb-4">
        <Col>
          {/* ===== CHANGED: show dynamic title/subtitle + edit icon ===== */}
          <div className="d-flex align-items-center gap-2">
            <h2 className="mb-0">{journeyTitle}</h2>
            <span
              role="button"
              title="Edit Title/SubTitle"
              onClick={openHeaderModal}
              style={{ cursor: "pointer" }}
            >
              <PencilSquare size={18} />
            </span>
          </div>
          <small>{journeySubtitle}</small>
        </Col>

        <Col className="d-flex justify-content-end">
          <Link href="Begin-Your-Journey/add-data" passHref>
            <Button variant="success">Add New Data</Button>
          </Link>
        </Col>
      </Row>

      <Row>
        <Col xl={12} lg={12} md={12} sm={12}>
          <Table hover responsive className="text-nowrap">
            <thead>
              <tr>
                <th>#</th>
                <th>Title</th>
                <th>Description</th>
                <th>Image</th>
                <th>Button Label</th>
                <th>Button Route</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {dataItems.map((item, index) => (
                <tr key={item.id ?? item._id ?? index}>
                  <td>{(currentPage - 1) * pageSize + index + 1}</td>
                  <td>{item.title}</td>
                  <td>{truncateText(item.descriptions, 17)}</td>
                  <td>
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL}/${item.file}`}
                      height={50}
                      width={100}
                      alt={item.title}
                    />
                  </td>
                  <td>{truncateText(item.button_label, 17)}</td>
                  <td>{truncateText(item.button_route, 17)}</td>

                  <td>
                    <Link href={`/admin/cms-landingpage/Begin-Your-Journey/view/${item._id}`}>
                      <Eye size={20} style={{ marginRight: "10px" }} />
                    </Link>
                    <Link href={`/admin/cms-landingpage/Begin-Your-Journey/edit/${item._id}`}>
                      <PencilSquare size={20} />
                    </Link>
                    <span
                      onClick={() => confirmDelete(item._id)}
                      style={{ cursor: "pointer", color: "#624bff", marginLeft: "8px" }}
                    >
                      <Trash size={20} />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          <Row className="justify-content-center mt-4">
            <Col xs="auto">
              <Button
                variant="secondary"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
            </Col>

            <Col xs="auto">
              Page {currentPage} of {totalPages}
            </Col>

            <Col xs="auto">
              <Button
                variant="secondary"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </Col>
          </Row>
        </Col>
      </Row>

      {/* ===== NEW: Modal for Title + Subtitle ===== */}
      <Modal show={showHeaderModal} onHide={() => setShowHeaderModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Begin Your Journey</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Title</Form.Label>
            <Form.Control
              value={journeyTitle}
              onChange={(e) => setJourneyTitle(e.target.value)}
              disabled={loadingHeader || savingHeader}
            />
          </Form.Group>

          <Form.Group>
            <Form.Label>Subtitle</Form.Label>
            <Form.Control
              value={journeySubtitle}
              onChange={(e) => setJourneySubtitle(e.target.value)}
              disabled={loadingHeader || savingHeader}
            />
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowHeaderModal(false)}
            disabled={savingHeader}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={saveHeader}
            disabled={loadingHeader || savingHeader}
          >
            {savingHeader ? "Saving..." : "Save"}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
