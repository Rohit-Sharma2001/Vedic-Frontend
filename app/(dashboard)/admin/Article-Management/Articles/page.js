"use client";

import { useState, useEffect, useRef } from "react";
import {
  Col,
  Row,
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
import Swal from "sweetalert2";
import { config } from "services/config";
import { postApi } from "services/api";

export default function Articles() {
  const [articles, setArticles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const hasFetched = useRef(false);

  useEffect(() => {
    fetchArticles(currentPage);
  }, [currentPage]);

  const fetchArticles = async (page) => {
    try {
      const endpoint = config.Articles;
      const data = { page, pageSize };
      const response = await postApi(endpoint, data);
      console.log(response);
      setArticles(response.resultWithUrls || []);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      console.error("Error fetching articles:", error);
    }
  };
    const confirmFeature = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Only one article can be featured at a time!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, set as Featured!",
    }).then((result) => {
      if (result.isConfirmed) {
        featureArticle(id);
        Swal.fire("Updated!", "Featured article has been updated.", "success");
      }
    });
  };

  const featureArticle = async (id) => {
    try {
      const endpoint = config.FeatureArticle; // <-- must point to /article_management/set-featured
      const data = { id };
      const response = await postApi(endpoint, data);

      if (response.statusCode === 200) {
        fetchArticles(currentPage);
      } else {
        console.error("Failed to update featured article.");
      }
    } catch (error) {
      console.error("Error updating featured article:", error);
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
        deleteArticle(id);
        Swal.fire("Deleted!", "Article has been deleted.", "success");
      }
    });
  };

  const deleteArticle = async (id) => {
    try {
      const endpoint = config.DeleteArticles;
      const data = { id };
      await postApi(endpoint, data);
      fetchArticles(currentPage);
    } catch (error) {
      console.error("Error deleting article:", error);
    }
  };

  const handlePageChange = (page) => setCurrentPage(page);

  return (
    <Container fluid className="p-6">
      <Row className="align-items-center mb-4">
        <Col>
          <h2>Articles</h2>
        </Col>
        <Col className="d-flex justify-content-end">
          <Link href="/admin/Article-Management/Articles/add-articles" passHref>
            <Button variant="success">Add New Article</Button>
          </Link>
        </Col>
      </Row>

      <Row>
        <Col xl={12} lg={12} md={12} sm={12}>
          <Table hover responsive className="text-nowrap">
            <thead>
              <tr>
                <th>#</th>
                <th>title</th>
                <th>Image</th>
                <th>Author</th>
                 <th>Author Image</th>
                <th>Featured Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article, index) => (
                <tr key={article._id}>
                  <td>{(currentPage - 1) * pageSize + index + 1}</td>
                  <td>{article.title}</td>
                  <td><img src={`${process.env.NEXT_PUBLIC_API_URL}/${article.file}`} width={50} height={50}></img></td>
                  <td>{article.auther_name}</td>
                   <td><img src={`${process.env.NEXT_PUBLIC_API_URL}/${article.image}`}width={50} height={50}></img></td>
                
                  <td style={{ cursor: "default" }}>
  {article.is_featured_article === 1 ? (
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
  <Link href={`/admin/Article-Management/Articles/view/${article._id}`}>
    <Eye size={20} style={{ marginRight: "10px" }} />
  </Link>

  <Link href={`/admin/Article-Management/Articles/edit/${article._id}`}>
    <PencilSquare size={20} style={{ marginRight: "10px" }} />
  </Link>

  <span
    onClick={() => confirmDelete(article._id)}
    style={{ cursor: "pointer", color: "#624bff", marginRight: "10px" }}
  >
    <Trash size={20} />
  </span>

  <span
    onClick={() => confirmFeature(article._id)}
    style={{ cursor: "pointer", color: "#624bff" }}
  >
    <FileCheck size={20} />
  </span>
</td>

                </tr>
              ))}
            </tbody>
          </Table>

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