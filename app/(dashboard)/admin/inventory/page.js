'use client';
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Col, Row, Form, Table, Button, Container, Pagination } from 'react-bootstrap';
import { Eye, PencilSquare, Trash } from 'react-bootstrap-icons';
import Link from 'next/link';
import Swal from 'sweetalert2';
import { config } from 'services/config';
import { postApi } from 'services/api';

export default function Inventory() {
    const [productName, setProductName] = useState('');
    const [productType, setProductType] = useState('');
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    const searchTimeout = useRef(null);

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchProducts(undefined,currentPage);
    }, [currentPage]);

    const fetchCategories = useCallback(async () => {
        try {
            const response = await postApi(config.category, {
                dropdown_type: 'category',
                page: 1,
                pageSize: 1000,
            });
            setCategories(response.result || []);
        } catch (error) {
            console.error('Error fetching category list:', error);
        }
    }, []);

 const fetchProducts = useCallback(
  async (stockCount,page, { reset = false } = {}) => {
    try {
      const response = await postApi(config.product, { 
        page, 
        pageSize,
        title: reset ? "" : productName || "",
        sku_id: reset ? "" : productName || "",
        category: reset ? "" : productType || "",
        stockLesserThan:stockCount||stockCount==0?stockCount:undefined
      });
      console.log(response)
      setProducts(response.productsWithUrls || []);
      setTotalPages(response.totalPages || 1);
      setTotalCount(response.totalCount || 0);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  },
  [pageSize, productName, productType]
);
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
                deleteProduct(id);
                Swal.fire('Deleted!', 'Your Product has been deleted.', 'success');
            }
        });
    };

    const toggleShowStatus = useCallback(
  async (id, currentStatus) => {
    try {
      const result = await Swal.fire({
        title: currentStatus ? 'Hide this product?' : 'Show this product?',
        text: currentStatus
          ? 'This product will be hidden from the landing page.'
          : 'This product will become visible on the landing page.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: currentStatus ? 'Yes, hide it!' : 'Yes, show it!',
        cancelButtonText: 'Cancel',
        reverseButtons: true,
      });

      if (result.isConfirmed) {
        await postApi(config.toggleShowStatus, { id }); // 👈 call your new backend API

        Swal.fire({
          title: 'Success!',
          text: `Product is now ${currentStatus ? 'hidden' : 'visible'}.`,
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
        });

        fetchProducts(undefined, currentPage); // ✅ Refresh list
      }
    } catch (error) {
      console.error('Error toggling product visibility:', error);
      Swal.fire('Error!', 'Failed to update product visibility.', 'error');
    }
  },
  [fetchProducts, currentPage]
);

    const deleteProduct = useCallback(
        async (id) => {
            try {
                await postApi(config.Deleteproduct, { id });
                fetchProducts(undefined,currentPage); // Refresh product list after deletion
            } catch (error) {
                console.error('Error deleting product:', error);
            }
        },
        [fetchProducts, currentPage]
    );

    const handleSubmit = async (e) => {
  e.preventDefault(); // ✅ stops page refresh
  setCurrentPage(1);
  await fetchProducts(undefined, 1); // uses current productName/productType from state
};


    const handleSearch = (e) => {
        const value = e.target.value;
        setProductName(value);
        if (searchTimeout.current) clearTimeout(searchTimeout.current);

        searchTimeout.current = setTimeout(async () => {
            try {
                const response = await postApi(config.product, { 
       title: value, 
       sku_id: value    // 👈 send sku_id too
     });
                setProducts(response.productsWithUrls || []);
                setTotalPages(response.totalPages || 1);
                setTotalCount(response.totalCount || 0);
                setCurrentPage(1); // Reset to first page
            } catch (error) {
                console.error('Error searching products:', error);
            }
        }, 300); // Debounce delay
    };

    const handlePageChange = useCallback((page) => {
        setCurrentPage(page);
    }, []);

    const productTypes = useMemo(() => [...new Set(products.map((product) => product.productType))], [products]);

    return (
        <Container fluid className="p-6">
            <Row className="align-items-center mb-4">
                <Col>
                    <h2>Products</h2>
                </Col>
                <Col className="d-flex justify-content-end">
                    <Link href="inventory/add-product" passHref>
                        <Button variant="success">Add New Product</Button>
                    </Link>
                </Col>
                <Col className="d-flex justify-content-end">
                    
                        <Button variant="warning text-white" onClick={()=>fetchProducts(5,currentPage)}>Low Stock Products</Button>
                    
                </Col>
                <Col className="d-flex justify-content-end">
                    
                        <Button variant="danger text-white" onClick={()=>fetchProducts(0,currentPage)}>Out Of Stock</Button>
                    
                </Col>
            </Row>

            <Row>
                <Col xl={12} lg={12} md={12} sm={12}>
                    <div className="my-3">
                      <Form
  className="d-flex align-items-center gap-2"
  onSubmit={handleSubmit}   // ✅ Enter triggers this, no refresh
>
  <Form.Control
    type="text"
    placeholder="Search by Product Name, SkuId"
    value={productName}
    onChange={handleSearch}
  />

  <Form.Select
    value={productType}
    onChange={(e) => setProductType(e.target.value)}
  >
    <option value="">Select Category</option>
    {categories.map((type, index) => (
      <option key={index} value={type._id}>
        {type.name}
      </option>
    ))}
  </Form.Select>

  <Button variant="primary" type="submit">
    Search
  </Button>

  <Button
    variant="secondary"
    type="button"  // ✅ prevents submit
    onClick={() => {
      setProductName("");
      setProductType("");
      setCurrentPage(1);
      fetchProducts(undefined, 1, { reset: true });
    }}
  >
    Clear
  </Button>
</Form>

                  
                    </div>

                    <Table hover responsive className="text-nowrap mt-5">
                        <thead>
                            <tr>
                                <th>#</th>
                                 
                                <th>SKU-Id</th>
                                <th>Product Name</th>
                                <th>Brand</th>
                                <th>Category</th>
                                <th>Displayed Price</th>
                                 <th>Visible on Landing</th> {/* ✅ NEW COLUMN */}
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((product, index) => (
                                <tr key={product._id}>
                                    <td>{(currentPage - 1) * pageSize + index + 1}</td>
                            
                                    <td>{product.sku_id}</td>
                                    <td>{product.productName}</td>
                                    <td>{product.brandName}</td>
                                    <td>
                                         {product.categoryName?.length > 25
    ? product.categoryName.slice(0, 25) + "..."
    : product.categoryName}
                                    </td>
                                    <td>{product.price}</td>
                                      <td>
  <span
    onClick={() => toggleShowStatus(product._id, product.is_show)}
    style={{
      backgroundColor: product.is_show ? "#28a745" : "#6c757d",
      color: "white",
      padding: "4px 8px",
      borderRadius: "6px",
      fontSize: "0.85em",
      cursor: "pointer",
      userSelect: "none",
    }}
  >
    {product.is_show ? "Visible" : "Hidden"}
  </span>
</td>

                                    <td>
                                        <Link href={`/admin/inventory/view/${product._id}`}>
                                            <Eye size={20} style={{ marginRight: '10px' }} />
                                        </Link>
                                        <Link href={`/admin/inventory/edit/${product._id}`}>
                                            <PencilSquare size={20} style={{ marginRight: '10px' }} />
                                        </Link>
                                        <span
                                            onClick={() => confirmDelete(product._id)}
                                            style={{ cursor: 'pointer', color: '#624bff' }}
                                        >
                                            <Trash size={20} />
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
