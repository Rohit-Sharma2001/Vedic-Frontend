'use client';
import { useState, useEffect, useRef } from 'react';
import { Col, Row, Form, Table, Button, Container, Pagination } from 'react-bootstrap';
import { Eye, PencilSquare, Trash } from 'react-bootstrap-icons';
import Link from 'next/link';
import Swal from 'sweetalert2';
import { config } from 'services/config';
import { postApi } from 'services/api';

export default function BrandsList() {
    const [brandName, setBrandName] = useState('');
    const [brandsList, setBrandsList] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    const hasFetched = useRef(false);

    useEffect(() => {
        fetchBrands(currentPage);
    }, [currentPage]);

    const fetchBrands = async (page) => {
        try {
            const endpoint = config.category; // Assuming `brands` is the endpoint for fetching brands
            const data = { dropdown_type: "brand", page: page, pageSize: pageSize };
            const response = await postApi(endpoint, data);
            console.log(response)
            setBrandsList(response.result || []);
            setTotalPages(response.totalPages || 1);
            setTotalCount(response.totalCount || 0);
        } catch (error) {
            console.error('Error fetching brands list:', error);
        }
    };
const confirmDelete = (id) => {
  Swal.fire({
    title: 'Are you sure?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, delete it!'
  }).then((result) => {
    if (result.isConfirmed) {
      deleteBrand(id); // ✅ only show feedback after API response
    }
  });
};

const deleteBrand = async (id) => {
  try {
    const endpoint = config.Deletecategory; // Assuming this deletes brands
    const response = await postApi(endpoint, { id });

    if (response.statusCode === 200) {
      Swal.fire(
        'Deleted!',
        response.message || 'Brand deleted successfully',
        'success'
      );
      fetchBrands(currentPage);
    } else if (response.statusCode === 204) {
      Swal.fire(
        'Warning!',
        response.message || 'This brand cannot be deleted.',
        'warning'
      );
    } else {
      Swal.fire(
        'Cannot Delete',
        response.message || 'Failed to delete brand',
        'error'
      );
    }
  } catch (error) {
    console.error('Error deleting brand:', error);
    Swal.fire('Error!', 'Something went wrong while deleting.', 'error');
  }
};


    const handleSearch = async () => {
        try {
            const endpoint = config.brands; // Assuming `brands` is the endpoint for searching brands
            const data = { name: brandName };
            const response = await postApi(endpoint, data);
            console.log(response)
            setBrandsList(response.result || []);
            setTotalPages(response.totalPages || 1);
            setTotalCount(response.totalCount || 0);
            setCurrentPage(1); // Reset to first page on new search
        } catch (error) {
            console.error('Error searching brands:', error);
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    return (
        <Container fluid className="p-6">
            <Row className="align-items-center mb-4">
                <Col>
                    <h2>Brands List</h2>
                </Col>
                <Col className="d-flex justify-content-end">
                    <Link href="Brands/add-brands" passHref>
                        <Button variant="success">Add New Brand</Button>
                    </Link>
                </Col>
            </Row>

            <Row>
                <Col xl={12} lg={12} md={12} sm={12}>
               

                    <Table hover responsive className="text-nowrap">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Name</th>
                                {/* <th>Logo</th> */}
                                <th>Description</th>
                                {/* <th>Image</th> */}
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {brandsList.map((brand, index) => (
                                <tr key={brand._id}>
                                    <td>{(currentPage - 1) * pageSize + index + 1}</td>
                                
                                  <td title={brand.name}>
  {brand.name.length > 25
    ? brand.name.slice(0, 25) + "..."
    : brand.name}
</td>
                                    {/* <td><img src={`${process.env.NEXT_PUBLIC_API_URL}/${brand.file}`} height={100} width={100} alt={brand.file}/></td> */}
                                    {/* <td>{brand.description}</td> */}
                                     <td>
  {brand?.description
    ? brand.description.length > 50
      ? brand.description.substring(0, 50) + "..."
      : brand.description
    : "N/A"}
</td>
                                    {/* <td><img src={`${process.env.NEXT_PUBLIC_API_URL}/${brand.icon_file}`} height={100} width={100} alt={brand.icon_file}/></td> */}
                                  
                                    <td>
                                        <Link href={`/admin/Master/Brands/edit/${brand._id}`} passHref>
                                            <PencilSquare size={20} style={{ marginRight: '10px' }} />
                                        </Link>
                                        <span onClick={() => confirmDelete(brand._id)} style={{ cursor: 'pointer',color:'#624bff' }}>
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
