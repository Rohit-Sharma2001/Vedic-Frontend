"use client";
import { useState, useEffect } from "react";
import { Col, Row, Table, Button, Container, Modal, Form } from "react-bootstrap";
import Link from "next/link";
import { Eye, PencilSquare, Trash } from "react-bootstrap-icons";
import { config } from "services/config"; // Adjust the import path as needed
import { postApi ,updateApiWithFile } from "services/api"; // Adjust the import path as needed
import Swal from "sweetalert2";
export default function YogaClasses() {
  const DOCUMENT_ID = "68243b752897e78f4551679a";
const UPDATE_ENDPOINT = config.UpdateBalancingDiet; // same as Ayurvedic
const GET_ENDPOINT = config.GetBalancingDiet;       // same as Ayurvedic

const [showHeaderModal, setShowHeaderModal] = useState(false);
const [journeyTitle, setJourneyTitle] = useState("Yoga Classes");
const [journeySubtitle, setJourneySubtitle] = useState("Yoga Classes");
const [loadingHeader, setLoadingHeader] = useState(false);
const [savingHeader, setSavingHeader] = useState(false);

  const [dataItems, setDataItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    
    fetchData(currentPage);
  }, [currentPage]);

  useEffect(() => {
  fetchJourneyHeader();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);


  const fetchData = async (page) => {
    try {
      const endpoint = config.GetLandingPageCaraousalData;
      const data = { page, pageSize, type: "yoga_classes" };
      const response = await postApi(endpoint, data);
      console.log(response);
      setDataItems(response.resultWithUrls || []);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchJourneyHeader = async () => {
  setLoadingHeader(true);
  try {
    const payload = { type: "kapha" }; // keep same payload as Ayurvedic
    const response = await postApi(GET_ENDPOINT, payload);

    const title = response?.data?.data?.[0]?.yoga_classes_title;
    const subtitle = response?.data?.data?.[0]?.yoga_classes_subtitle;

    setJourneyTitle(title || "Yoga Classes");
    setJourneySubtitle(subtitle || "Yoga Classes");
  } catch (error) {
    console.error("Error fetching yoga classes header:", error);
  } finally {
    setLoadingHeader(false);
  }
};

const openHeaderModal = async () => {
  setShowHeaderModal(true);
  await fetchJourneyHeader();
};

const saveHeader = async () => {
  setSavingHeader(true);
  try {
    const payload = {
      yoga_classes_title: journeyTitle,
      yoga_classes_subtitle: journeySubtitle,
    };

    const res = await updateApiWithFile(UPDATE_ENDPOINT, DOCUMENT_ID, payload, {});
    if (res?.statusCode === 200) {
      await fetchJourneyHeader();
      setShowHeaderModal(false);
    }
  } catch (error) {
    console.error("Error updating yoga classes header:", error);
  } finally {
    setSavingHeader(false);
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
      const data = { id };
      await postApi(endpoint, data);
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

  return (<>
    <Container fluid className="p-6">
      <Row className="align-items-center mb-4">
        <Col>
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
          <Link href="Yoga-Classes/add-classes" passHref>
            <Button variant="success">Add New Classes</Button>
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
                <tr key={item.id}>
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
                    <Link
                      href={`/admin/cms-landingpage/Yoga-Classes/view/${item._id}`}
                    >
                      <Eye size={20} style={{ marginRight: "10px" }} />
                    </Link>
                    <Link
                      href={`/admin/cms-landingpage/Yoga-Classes/edit/${item._id}`}
                    >
                      <PencilSquare size={20} />
                    </Link>
                    <span
                      onClick={() => confirmDelete(item._id)}
                      style={{
                        cursor: "pointer",
                        color: "#624bff",
                        marginLeft: "8px",
                      }}
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
    </Container>
    <Modal show={showHeaderModal} onHide={() => setShowHeaderModal(false)} centered>
  <Modal.Header closeButton>
    <Modal.Title>Edit Yoga Classes Section</Modal.Title>
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
</>
  );
}
