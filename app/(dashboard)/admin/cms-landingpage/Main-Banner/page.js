"use client";
import { useState, useEffect } from "react";
import { Col, Row, Table, Button, Container } from "react-bootstrap";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { Eye, PencilSquare, Trash } from "react-bootstrap-icons";
import { config } from "services/config"; 
import { postApi } from "services/api"; 

import Swal from "sweetalert2";
export default function MainBanner() {
   const router = useRouter();
  const [dataItems, setDataItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('loggedIn') === 'false';
    if (isLoggedIn) {
        router.push('/Log-in');
    }
    fetchData(currentPage);
  }, [currentPage]);

   

  const fetchData = async (page) => {
    try {
      const endpoint = config.GetMainBannerData;
      const data = { type: "main_banner" };
      const response = await postApi(endpoint, data);
      console.log(response);
      setDataItems(response.resultWithUrls || []);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const truncateText = (text, maxLength) => {
    return text?.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
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
        Swal.fire("Deleted!", "Your Data has been deleted.", "success");
      }
    });
  };
  const deletedata = async (id) => {
    try {
      const endpoint = config.DeleteMainBannerData;
      const data = { id: id };
      const response = await postApi(endpoint, data);
      console.log(response);
      fetchData();
    } catch (error) {
      console.error("Error fetching categorylist:", error);
    }
  };

  return (
    <Container fluid className="p-6">
      <Row className="align-items-center mb-4">
        <Col>
          <h2>Main Banner</h2>
        </Col>
        <Col className="d-flex justify-content-end">
          <Link href="Main-Banner/add-banner" passHref>
            <Button variant="success">Add New Banner</Button>
          </Link>
        </Col>
      </Row>

      <Row>
        <Col xl={12} lg={12} md={12} sm={12}>
          <Table hover responsive className="text-nowrap">
            <thead>
              <tr>
                <th>#</th>
                <th>Organization Title</th>
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
                <tr key={item._id}>
                  <td>{(currentPage - 1) * pageSize + index + 1}</td>
                  <td>{item?.org_title}</td>
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
                      href={`/admin/cms-landingpage/Main-Banner/view/${item._id}`}
                    >
                      <Eye size={20} style={{ marginRight: "10px" }} />
                    </Link>
                    <Link
                      href={`/admin/cms-landingpage/Main-Banner/edit/${item._id}`}
                    >
                      <PencilSquare size={20} style={{ marginRight: "10px" }} />
                    </Link>
                   
                    <span onClick={() => confirmDelete(item._id)} style={{ cursor: 'pointer' ,color:'#624bff'}}>
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
  );
}
