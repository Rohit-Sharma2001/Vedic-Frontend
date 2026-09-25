'use client';
import { useState, useEffect } from 'react';
import Select from 'react-select';
import { Container, Row, Col, Form, Table, Image, Badge } from 'react-bootstrap';
import { StarFill } from 'react-bootstrap-icons';
import { postApi } from 'services/api';
import { config } from 'services/config';
export default function ProductReviews() {
 const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);
const [reviews, setReviews] = useState([]);
const [reviewsAvg, setReviewsAvg] = useState({});
const [loading, setLoading] = useState(false);
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await postApi(config.product, { page: 1, pageSize: 500 });
        const productOptions = (response.productsWithUrls || []).map((p) => ({
          value: p._id,
          label: p.productName,
        }));
        setProducts(productOptions);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, []);

useEffect(() => {
  if (!selectedProduct) return;

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const reviewsResponse = await postApi(config.getReviews, {
        product_id: selectedProduct,
        limit: 10,
        page: 1,
      });
      if (reviewsResponse.statusCode === 200 || reviewsResponse.statusCode === 201) {
        setReviews(reviewsResponse.data || []);
      } else {
        setReviews([]);
      }

      const avgResponse = await postApi(config.GetReviewsRating, {
        product_id: selectedProduct,
      });
      if (avgResponse.statusCode === 200 || avgResponse.statusCode === 201) {
        setReviewsAvg(avgResponse.data || {});
      } else {
        setReviewsAvg({});
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  fetchReviews();
}, [selectedProduct]);


 const getProductName = (productId) => {
    const product = products.find((p) => p.value === productId);
    return product ? product.label : 'Unknown Product';
  };

  return (
    <Container fluid className="p-5">
      <Row className="mb-4 align-items-center">
        <Col><h2>Product Reviews</h2></Col>
        <Col className="d-flex justify-content-end">
          <Select
        
   options={products}
   isClearable
   placeholder="Filter by Product"
   value={products.find((p) => p.value === selectedProduct) || null}
 onChange={(option) => {
  const value = option ? option.value : null;
  setSelectedProduct(value);
  if (!value) {
    setReviews([]);
    setReviewsAvg({});
  }
}}

   className="w-50"
 />
        </Col>
      </Row>

   {!selectedProduct ? (
  <h5 className="text-center text-muted">Please select a product to view reviews.</h5>
) : loading ? (
  <h5 className="text-center">Loading reviews...</h5>
) : reviews.length === 0 ? (
  <h5 className="text-center">No reviews found for this product.</h5>
) : (
  <>
{selectedProduct && reviewsAvg?.averageRating !== undefined && (

  <div className="mb-4 p-3 border rounded bg-light">
    <h5 className="mb-3">Rating Summary</h5>
    <div className="d-flex align-items-center mb-3">
      <span className="fs-3 fw-bold text-warning me-2">
        {reviewsAvg?.averageRating || 0} 
      </span>
      <div>
        <div className="text-warning">
          {Array.from({ length: 5 }, (_, i) => (
            <StarFill
              key={i}
              size={18}
              color={i < Math.round(reviewsAvg?.averageRating || 0) ? "#f5c518" : "#e4e5e9"}
            />
          ))}
        </div>
        <small className="text-muted">
          ({reviewsAvg?.totalReviews || 0} reviews)
        </small>
      </div>
    </div>

    {[5,4,3,2,1].map(star => {
      const starMap = ["one","two","three","four","five"];
      const percentage = reviewsAvg?.[`${starMap[5-star]}StarPercentage`] || 0;
      return (
        <div key={star} className="d-flex align-items-center mb-2">
          <span style={{ width: "40px" }}>{star}★</span>
          <div className="progress flex-grow-1 mx-2" style={{ height: "8px" }}>
            <div
              className="progress-bar bg-success"
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
          <span className="text-muted">{percentage}%</span>
        </div>
      );
    })}
  </div>
)}

<Table striped bordered hover responsive className="reviews-table">
  <thead>
    <tr>
      <th>#</th>
      <th>Reviewer</th>
      <th>Rating</th>
      <th>Review</th>
      <th>Images</th>
      <th>Date</th>
    </tr>
  </thead>
  <tbody>
    {reviews.map((rev, index) => (
      <tr key={index}>
        <td>{index + 1}</td>
        <td>
          <div className="d-flex align-items-center gap-2">
            <div className="reviewer-avatar">
              {rev.userName?.charAt(0).toUpperCase()}
            </div>
            <span className="fw-semibold">{rev.userName}</span>
          </div>
        </td>
        <td>
          <div className="d-flex align-items-center gap-1">
            {Array.from({ length: 5 }, (_, i) => (
              <StarFill
                key={i}
                size={18}
                color={i < rev.rating ? "#f5c518" : "#e4e5e9"}
              />
            ))}
            <Badge bg="warning" text="dark" className="ms-2">
              {rev.rating}★
            </Badge>
          </div>
        </td>
        <td style={{ maxWidth: "350px", whiteSpace: "pre-line" }}>
          {rev.review}
        </td>
        <td>
          {rev.additionalImages && rev.additionalImages.length > 0 ? (
            <div className="review-images">
              {rev.additionalImages.map((img, i) => (
                <img
                  key={i}
                  // src={img}
                  src={`${process.env.NEXT_PUBLIC_API_URL}/${img}`}
                  alt={`review-img-${i}`}
                  className="review-thumb"
                />
              ))}
            </div>
          ) : (
            <span className="text-muted">—</span>
          )}
        </td>
        <td>{rev.date}</td>
      </tr>
    ))}
  </tbody>
</Table>

{/* ✅ Inline Styles */}
<style jsx>{`
  .reviews-table th {
    background: #f8f9fa;
    text-align: center;
  }

  .reviewer-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #6c757d;
    color: white;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .review-images {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .review-thumb {
    width: 60px;
    height: 60px;
    object-fit: cover;
    border-radius: 8px;
    border: 1px solid #ddd;
    transition: transform 0.2s ease;
    cursor: pointer;
  }

  .review-thumb:hover {
    transform: scale(1.1);
    border-color: #aaa;
  }
`}</style>
 </>)}
    </Container>
  );
}