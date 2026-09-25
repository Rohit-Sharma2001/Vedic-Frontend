'use client';
import { useState, useEffect, useRef } from 'react';
import { Col, Row, Form, Table, Button, Container, Pagination } from 'react-bootstrap';
import { Eye, FilterLeft, PencilSquare, Trash ,CheckCircle ,XCircle} from 'react-bootstrap-icons';
import Link from 'next/link';
import Swal from 'sweetalert2';
import { config } from 'services/config';
import { postApi } from 'services/api';

export default function Inventory() {
    const [productName, setProductName] = useState('');
    const [productType, setProductType] = useState('');
    const [categorylist, setCategoryList] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    const hasFetched = useRef(false);

    useEffect(() => {

        fetchCategories(currentPage);
    }, [currentPage]);

    const fetchCategories = async (page) => {
        try {
            const endpoint = config.category;
            const data = { dropdown_type:"category",page: page, pageSize: pageSize }
            const response = await postApi(endpoint, data);
            console.log(response)
            setCategoryList(response.result || []);
            setTotalPages(response.totalPages || 1);
            setTotalCount(response.totalCount || 0);

        } catch (error) {
            console.error('Error fetching categorylist:', error);
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
      deleteCategory(id); // ✅ handle messages inside function
    }
  });
};


const deleteCategory = async (id) => {
  try {
    const endpoint = config.Deletecategory;
    const response = await postApi(endpoint, { id });

    if (response.statusCode === 200) {
      Swal.fire(
        'Deleted!',
        response.message || 'Category deleted successfully',
        'success'
      );
      fetchCategories(currentPage);
    } else if (response.statusCode === 204) {
      Swal.fire(
        'Warning!',
        response.message || 'Category has sub-categories. Delete them first.',
        'warning'
      );
    } else {
      Swal.fire(
        'Cannot Delete',
        response.message || 'Failed to delete category',
        'error'
      );
    }
  } catch (error) {
    console.error('Error deleting category:', error);
    Swal.fire('Error!', 'Something went wrong while deleting.', 'error');
  }
};



    const productTypes = [...new Set(categorylist.map((product) => product.productType))];

    const handleSearch = async () => {
        const endpoint = config.product;
const data ={title:productName}
        try {
            const response = await postApi(endpoint,data);
            console.log("Filter",response)
            setCategory(response.result || []);
            setTotalPages(response.totalPages || 1);
            setTotalCount(response.totalCount || 0);
            setCurrentPage(1); // Reset to first page on new search
        } catch (error) {

        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };
    const confirmUpdate = (id, currentStatus) => {
      Swal.fire({
        title: "Are you sure?",
        text: "This will toggle the category's status.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, update it!",
      }).then((result) => {
        if (result.isConfirmed) {
          updateStatus(id, currentStatus);
          Swal.fire("Updated!", "Cateogry status has been changed.", "success");
        }
      });
    };
    
    // Toggle event status
    const updateStatus = async (id, currentStatus) => {
      try {
        const endpoint = config.Updatecategorystatus; // Ensure your API path exists
        const data = { id};
    
        console.log("Updating event status:", data);
    
        const response =  await postApi(endpoint, data);
    
        if (response.statusCode === 200 || response.statusCode === 201) {
        //   fetchEvents(currentPage);
          fetchCategories(currentPage)
        } else {
          console.error("Failed to update category status.");
          Swal.fire("Error!", "Failed to update category status.", "error");
        }
      } catch (error) {
        console.error("Error updating category:", error);
        Swal.fire("Error!", "Something went wrong while updating status.", "error");
      }
    };

    return (
        <Container fluid className="p-6">
            <Row className="align-items-center mb-4">
                <Col>
                    <h2>Categories List</h2>
                </Col>
                <Col className="d-flex justify-content-end">
                    <Link href="category/add-category" passHref>
                        <Button variant="success">Add New Category</Button>
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
                                <th>Image</th>
                                <th>Description</th>
                                {/* <th>Order</th> */}
                                {/* <th>Icon</th> */}
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categorylist.map((category, index) => (
                                <tr key={category._id}>
                                    {/* Adjust the index to account for current page */}
                                    <td>{(currentPage - 1) * pageSize + index + 1}</td>
                                  <td title={category.name}>
  {category.name.length > 25
    ? category.name.slice(0, 25) + "..."
    : category.name}
</td>

                                    
                                    <td><img src={`${process.env.NEXT_PUBLIC_API_URL}/${category.file}`} height={100} width={100} alt={category.file}/></td>
                                    <td>
  {category?.description
    ? category.description.length > 50
      ? category.description.substring(0, 50) + "..."
      : category.description
    : "N/A"}
</td>

                                    {/* <td>{category?.order || "N/A"}</td> */}
                                    {/* <td><img src={`${process.env.NEXT_PUBLIC_API_URL}/${category.icon_file}`} height={100} width={100} alt={category.icon_file}/></td> */}
                                  
                                   <td>
                                     {category.status === 1 ? (
                                       <span className="text-success">
                                         <CheckCircle size={20} /> Active
                                       </span>
                                     ) : (
                                       <span className="text-danger">
                                         <XCircle size={20} /> Inactive
                                       </span>
                                     )}
                                   </td>
                                    <td>
                                       
                                        <Link href={`/admin/Master/category/edit/${category._id}`}>
                                            <PencilSquare size={20} style={{ marginRight: '10px' }} />
                                        </Link>
                                        <span onClick={() => confirmDelete(category._id)} style={{ cursor: 'pointer' ,color:'#624bff'}}>
                                            <Trash size={20} />
                                        </span>

                                         {/* ✅ New Update Status Button */}
  <Button
  className='ml-3'
    size="sm"
    variant={category.status === 1 ? "danger" : "success"}
    onClick={() => confirmUpdate(category._id, category.status)}
  >
    {category.status === 1 ? "Deactivate" : "Activate"}
  </Button>

                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>

                    {/* Pagination Component */}
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
