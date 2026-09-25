"use client";
import { useState, useEffect } from "react";
import { Col, Row, Table, Button, Container, Modal, Form } from "react-bootstrap";
import Link from "next/link";
import { Eye, PencilSquare, Trash } from "react-bootstrap-icons";
import { config } from "services/config"; // Adjust the import path as needed
import { postApi, updateApiWithFile } from "services/api"; // Adjust the import path as needed
import Swal from "sweetalert2";
export default function Resources() {
  const [dataItems, setDataItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
// ===== Header/Subheader (Resources) =====
const DOCUMENT_ID = "68243b752897e78f4551679a"; // same as your other page (keep same if backend is same doc)
const [showHeaderModal, setShowHeaderModal] = useState(false);

const [pageTitle, setPageTitle] = useState("Resources");
const [pageSubtitle, setPageSubtitle] = useState("Resources");

const [loadingHeader, setLoadingHeader] = useState(false);
const [savingHeader, setSavingHeader] = useState(false);

const fetchResourcesHeader = async () => {
  setLoadingHeader(true);
  try {
    const endpoint = config.GetBalancingDiet; // same api as your other component
    const payload = { type: "kapha" };

    const response = await postApi(endpoint, payload);

    const title = response?.data?.data?.[0]?.resource_title;
    const subtitle = response?.data?.data?.[0]?.resource_subtitle;

    setPageTitle(title || "Resources");
    setPageSubtitle(subtitle || "Resources");
  } catch (error) {
    console.error("Error fetching resources header:", error);
  } finally {
    setLoadingHeader(false);
  }
};

const openHeaderModal = async () => {
  setShowHeaderModal(true);
  await fetchResourcesHeader();
};

const saveHeader = async () => {
  setSavingHeader(true);
  try {
    const payload = {
      resource_title: pageTitle,
      resource_subtitle: pageSubtitle,
    };

    const res = await updateApiWithFile(
      config.UpdateBalancingDiet, // same update api as your other component
      DOCUMENT_ID,
      payload,
      {}
    );

    if (res?.statusCode === 200) {
      await fetchResourcesHeader();
      setShowHeaderModal(false);
    }
  } catch (error) {
    console.error("Error updating resources header:", error);
  } finally {
    setSavingHeader(false);
  }
};

useEffect(() => {
  fetchResourcesHeader();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);


  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage]);

  const fetchData = async (page) => {
    try {
      const endpoint = config.GetLandingPageCaraousalData;
      const data = { page, pageSize, type: "resources" };
      const response = await postApi(endpoint, data);
      console.log(response);
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
    <h2 className="mb-0">{pageTitle}</h2>

    <span
      role="button"
      title="Edit Title/SubTitle"
      onClick={openHeaderModal}
      style={{ cursor: "pointer" }}
    >
      <PencilSquare size={18} />
    </span>
  </div>

  <small>{pageSubtitle}</small>
</Col>

        <Col className="d-flex justify-content-end">
          <Link href="Resources/add-resources" passHref>
            <Button variant="success">Add New Resources</Button>
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
                      href={`/admin/cms-landingpage/Resources/view/${item._id}`}
                    >
                      <Eye size={20} style={{ marginRight: "10px" }} />
                    </Link>
                    <Link
                      href={`/admin/cms-landingpage/Resources/edit/${item._id}`}
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
    <Modal.Title>Edit Resources Heading</Modal.Title>
  </Modal.Header>

  <Modal.Body>
    <Form.Group className="mb-3">
      <Form.Label>Title</Form.Label>
      <Form.Control
        value={pageTitle}
        onChange={(e) => setPageTitle(e.target.value)}
        disabled={loadingHeader || savingHeader}
      />
    </Form.Group>

    <Form.Group>
      <Form.Label>Subtitle</Form.Label>
      <Form.Control
        value={pageSubtitle}
        onChange={(e) => setPageSubtitle(e.target.value)}
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
