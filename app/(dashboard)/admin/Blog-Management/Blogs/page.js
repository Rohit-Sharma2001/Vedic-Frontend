"use client";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { useState, useEffect, useRef } from "react";
import {
  Col,
  Row,
  Form,
  Table,
  Button,
  Container,
  Pagination,
} from "react-bootstrap";
import {
  Eye,
  PencilSquare,
  Trash,
  CheckCircle,
  XCircle,
  FileCheck
} from "react-bootstrap-icons";
import Link from "next/link";
import { config } from "services/config";
import { postApi, updateApiWithFile ,updateApiWithFileinBody} from "services/api";
import Swal from "sweetalert2";

export default function Blogs() {
  const [blogTitle, setBlogTitle] = useState("");
  const [blogs, setBlogs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const hasFetched = useRef(false);

  useEffect(() => {
    fetchBlogs(currentPage);
  }, [currentPage]);

  const fetchBlogs = async (page) => {
    try {
      const endpoint = config.Blogs;
      const data = {page, pageSize};
      const response = await postApi(endpoint, data);
      console.log(response);
      setBlogs(response.CenterManagementWithUrls || []);
      setTotalPages(response.totalPages || 1);
      setTotalCount(response.totalCount || 0);
    } catch (error) {
      console.error("Error fetching blogs:", error);
    }
  };

  const handleSearch = async () => {
    try {
      setCurrentPage(1);
      await fetchBlogs(1);
    } catch (error) {
      console.error("Error during search:", error);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
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
      const endpoint = config.Deleteblog;
      const data = { id };
      await postApi(endpoint, data);
      fetchBlogs(currentPage);
    } catch (error) {
      console.error("Error deleting coupon:", error);
    }
  };
  const confirmUpdate = (id, currentStatus) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This status change can be reverted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, update it!",
    }).then((result) => {
      if (result.isConfirmed) {
        updateStatus(id, currentStatus);
        Swal.fire("Updated!", "Blog status has been changed.", "success");
      }
    });
  };

  const updateStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === "Active" ? "Inactive" : "Active"; // Toggle status

      const endpoint = config.Updateblog; // Ensure API exists
      const data = { id, status: newStatus };
      const files = {}; // No files needed

      console.log("Updating status:", data);
      const response = await updateApiWithFile(endpoint, id, data, files);

      if (response.statusCode === 200) {
        fetchBlogs(currentPage);
      } else {
        console.error("Failed to update status.");
      }
    } catch (error) {
      console.error("Error updating blog:", error);
    }
  };

  const confirmFeature = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This change can be reverted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes!",
    }).then((result) => {
      if (result.isConfirmed) {
        featureblog(id);
        Swal.fire("Deleted!", "Your data has been Updated.", "success");
      }
    });
  };

  const featureblog = async (id) => {
    try {
     
      const endpoint = config.Featureblog; // Ensure API exists
      const data = { id };
      const files = {}; // No files needed

     
      const response = await updateApiWithFileinBody(endpoint, id, data, files);

      if (response.statusCode === 200) {
        fetchBlogs(currentPage);
      } else {
        console.error("Failed to update status.");
      }
    } catch (error) {
      console.error("Error updating blog:", error);
    }
  };

  return (
    <Container fluid className="p-6">
      <Row className="align-items-center mb-4">
        <Col>
          <h2>Blogs</h2>
        </Col>
        <Col className="d-flex justify-content-end">
          <Link href="Blogs/add-blogs" passHref>
            <Button variant="success">Add New Blog</Button>
          </Link>
        </Col>
      </Row>

      <Row>
        <Col xl={12} lg={12} md={12} sm={12}>
          {/* <div className="my-3">
            <Form className="d-flex align-items-center gap-2">
              <Form.Control
                type="text"
                placeholder="Search by Blog Title"
                value={blogTitle}
                onChange={(e) => setBlogTitle(e.target.value)}
              />
              <Button variant="primary" onClick={handleSearch}>
                Search
              </Button>
            </Form>
          </div> */}

          <Table hover responsive className="text-nowrap">
            <thead>
              <tr>
                <th>#</th>
                <th>Title</th>
                <th>Type</th>
                <th>Featued Status</th>
                <th>Image</th>
                {/* <th>Description</th> */}
                <th>Views</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {blogs.map((blog, index) => (
                <tr key={blog._id}>
                  <td>{(currentPage - 1) * pageSize + index + 1}</td>
                  <td>{blog.title}</td>
                  <td>{blog.type}</td>
                 <td style={{ cursor: "default" }}>
  {blog.isFeaturedPost === 1 ? (
    <span style={{ color: "green" }}>
      <CheckCircle size={20} /> Active
    </span>
  ) : (
    <span style={{ color: "red" }}>
      <XCircle size={20} /> Inactive
    </span>
  )}
</td>

                  <td>
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL}/${blog.file}`}
                      height={50}
                      width={100}
                      alt={`${process.env.NEXT_PUBLIC_API_URL}/${blog.file}`}
                    />
                  </td>
                  {/* <td>
                 
                    <div
                      dangerouslySetInnerHTML={{
                        __html: blog.description,
                      }}
                      style={{
                        maxWidth: "300px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    />
                  </td> */}
                  <td>{blog.viewCount}</td>
                  <td
                    style={{
                      cursor: "pointer",
                      color: blog.status === "Active" ? "green" : "red",
                    }}
                  >
                    {blog.status}
                  </td>
             <td>
  {/* View */}
  <OverlayTrigger placement="top" overlay={<Tooltip>View Blog</Tooltip>}>
    <Link href={`/admin/Blog-Management/Blogs/view/${blog._id}`}>
      <Eye size={20} style={{ marginRight: "10px" }} />
    </Link>
  </OverlayTrigger>

  {/* Edit */}
  <OverlayTrigger placement="top" overlay={<Tooltip>Edit Blog</Tooltip>}>
    <Link href={`/admin/Blog-Management/Blogs/edit/${blog._id}`}>
      <PencilSquare size={20} style={{ marginRight: "10px" }} />
    </Link>
  </OverlayTrigger>

  {/* Delete */}
  <OverlayTrigger placement="top" overlay={<Tooltip>Delete Blog</Tooltip>}>
    <span
      onClick={() => confirmDelete(blog._id)}
      style={{ cursor: "pointer", color: "#624bff" }}
    >
      <Trash size={20} style={{ marginRight: "10px" }} />
    </span>
  </OverlayTrigger>

  {/* Feature */}
  <OverlayTrigger placement="top" overlay={<Tooltip>Mark as Featured</Tooltip>}>
    <span
      onClick={() => confirmFeature(blog._id)}
      style={{ cursor: "pointer", color: "#624bff" }}
    >
      <FileCheck size={20} style={{ marginRight: "10px" }} />
    </span>
  </OverlayTrigger>

  {/* Status Toggle */}
  <OverlayTrigger
    placement="top"
    overlay={
      <Tooltip>
        {blog.status === "Active"
          ? "Deactivate Blog"
          : "Activate Blog"}
      </Tooltip>
    }
  >
    <span
      onClick={() => confirmUpdate(blog._id, blog.status)}
      style={{
        cursor: "pointer",
        color: blog.status === "Active" ? "green" : "red",
      }}
    >
      {blog.status === "Active" ? (
        <CheckCircle size={20} />
      ) : (
        <XCircle size={20} />
      )}
    </span>
  </OverlayTrigger>
</td>

                </tr>
              ))}
            </tbody>
          </Table>

          {/* <Pagination className="justify-content-center mt-4">
            <Pagination.First
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
            />
            <Pagination.Prev
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            />
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Pagination.Item
                key={page}
                active={page === currentPage}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </Pagination.Item>
            ))}
            <Pagination.Next
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            />
            <Pagination.Last
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
            />
          </Pagination> */}
          <Pagination className="justify-content-center mt-4">
        <Pagination.First
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
        />
        <Pagination.Prev
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        />
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <Pagination.Item
            key={page}
            active={page === currentPage}
            onClick={() => handlePageChange(page)}
          >
            {page}
          </Pagination.Item>
        ))}
        <Pagination.Next
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        />
        <Pagination.Last
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
        />
      </Pagination>
        </Col>
      </Row>
    </Container>
  );
}
