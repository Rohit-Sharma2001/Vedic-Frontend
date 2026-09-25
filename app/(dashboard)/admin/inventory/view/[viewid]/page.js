"use client";

import { useEffect, useState } from "react";
import { Container, Row, Col, Button, Table, Image } from "react-bootstrap";
import Link from "next/link";
import { config } from "services/config";
import { postApi } from "services/api";

export default function ProductDetails({ params }) {
  const { viewid } = params;
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (viewid) fetchProductDetails();
  }, [viewid]);

  const fetchProductDetails = async () => {
    try {
      const endpoint = config.Viewproduct;
      const data = { id: viewid };
      const response = await postApi(endpoint, data);
      if (response.statusCode === 201) {
        setOrder(response.product);
        console.log("Response:", response);
      }
    } catch (error) {
      console.error("Error fetching product:", error);
    }
  };

  if (!order) return <div>Loading...</div>;

  const parseCustomDate = (dateStr) => {
  if (!dateStr) return null;
  const [d, t] = dateStr.split(", ");
  const [day, month, year] = d.split("/");
  return new Date(`${year}-${month}-${day}T${t}`);
};

  return (
    <Container fluid className="p-6">
      <Link href={`/admin/inventory`}>
        <Button variant="secondary" style={{ float: "right" }} className="mb-3">
          Back
        </Button>
      </Link>

      <Row>
        <Col md={12}>
          <h2>Product Details</h2>
          <Table bordered className="mt-3">
            <tbody>
              <tr>
                <th>Sku Id</th>
                <td>{order?.sku_id}</td>
              </tr>
              <tr>
                <th>Product Name</th>
                <td>{order?.productName}</td>
              </tr>
              <tr>
                <th>Brand</th>
                <td>{order?.brandName}</td>
              </tr>
              <tr>
                <th>Category</th>
                <td>{order?.categoryName}</td>
              </tr>
              <tr>
                <th>Height</th>
                <td>{order?.height}</td>
              </tr>
              <tr>
                <th>Width</th>
                <td>{order?.width}</td>
              </tr>
              <tr>
                <th>Length</th>
                <td>{order?.length}</td>
              </tr>
              <tr>
                <th>Sub-Category</th>
                <td>{order?.subcategoryName}</td>
              </tr>
              <tr>
                <th>Maximum Order Quantity</th>
                <td>{order?.maxOrderQuantity}</td>
              </tr>
              <tr>
                <th>Minimum Order Quantity</th>
                <td>{order?.minOrderQuantity}</td>
              </tr>
              <tr>
                <th>Price</th>
                <td>{order?.mrp}</td>
              </tr>
              <tr>
                <th>Cost To Company</th>
                <td>{order?.cost}</td>
              </tr>
              <tr>
                <th>Displayed Price</th>
                <td>{order?.price}</td>
              </tr>
              <tr>
                <th>Stock</th>
                <td>{order?.stock}</td>
              </tr>
              <tr>
                <th>Inventory Status</th>
                <td>{order?.inventory_status == 1 ? "In Stock" : "Out of stock"}</td>
              </tr>
              <tr>
                <th>Product Type</th>
                <td>{order?.itemTypeName}</td>
              </tr>
              <tr>
                <th>Product Description</th>
                <td>{order?.product_description}</td>
              </tr>

              {/* Render Ingredients as List */}
              <tr>
                <th>Ingredients</th>
                <td>
                  {Array.isArray(order?.ingredients)
                    ? order.ingredients.map(
                        (ingredient, index) =>
                          `${ingredient?.name}${
                            index !== order.ingredients.length - 1 ? " / " : ""
                          }`
                      )
                    : order?.ingredients}
                </td>
              </tr>

              <tr>
                <th>Created Date</th>
                <td>
  {order?.created
    ? parseCustomDate(order.created).toLocaleString("en-US")
    : "N/A"}
</td>
              </tr>
                            <tr>
                <th>Last Modified</th>
               <td>
  {order?.modified
    ? parseCustomDate(order.modified).toLocaleString("en-US")
    : "N/A"}
</td>
              </tr>

              <tr>
                <th>Cover Image</th>
                <td>
                  <img
                    src={`${process.env.NEXT_PUBLIC_API_URL}/${order?.coverImage}`}
                    style={{ height: "100px", width: "100px" }}
                    alt="Cover"
                  />
                </td>
              </tr>

              {/* Render Additional Images */}
              <tr>
                <th>Additional Images</th>
                <td>
                  <Row>
                    {Array.isArray(order?.additionalImages) &&
                      order.additionalImages.map((img, idx) => (
                        <Col key={idx} xs={4} md={2} className="mb-2">
                          <img
                            src={`${process.env.NEXT_PUBLIC_API_URL}/${img}`}
                            thumbnail
                            alt={`Additional ${idx}`}
                            style={{ height: "100px", width: "100px" }}
                          />
                        </Col>
                      ))}
                  </Row>
                </td>
              </tr>
            </tbody>
          </Table>
        </Col>
      </Row>
    </Container>
  );
}
