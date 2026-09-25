"use client";
import { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Table,
  Button,
  Pagination,
  OverlayTrigger,
  Tooltip,
  Badge,
} from "react-bootstrap";
import { Gear } from "react-bootstrap-icons";
import { Dropdown, Modal, Form } from "react-bootstrap";
import { PencilSquare, Trash, Eye, FileCheck } from "react-bootstrap-icons";
import Swal from "sweetalert2";
import { config } from "services/config";
import { postApi, updateApiWithFile } from "services/api";
import Link from "next/link";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

export default function MembershipPlans() {
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [plans, setPlans] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [showCourseModal, setShowCourseModal] = useState(false);
  const [courses, setCourses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // 🔹 Yoga Videos management state
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [videos, setVideos] = useState([]);
  const [selectedVideos, setSelectedVideos] = useState([]);
  const [selectAllVideos, setSelectAllVideos] = useState(false);


  // 🔹 Product categories management state
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [productCategories, setProductCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  // now [{ category_id: string, discount: number }]

  const [selectAllCategories, setSelectAllCategories] = useState(false);

  const [showServiceModal, setShowServiceModal] = useState(false);
  const [serviceTypeList, setServiceTypeList] = useState([])
  const [selectedServices, setSelectedServices] = useState([]);
  // now [{ category_id: string, discount: number }]

  const [selectAllServices, setSelectAllServices] = useState(false);
  // 🔹 Fetch all product categories
  const fetchProductCategories = async () => {
    try {
      const response = await postApi(config.category, {
        dropdown_type: "category",
        page: 1,
        pageSize: 100,
      });
      if (response.result) {
        setProductCategories(response.result);
      } else {
        setProductCategories([]);
      }
    } catch (error) {
      console.error("Error fetching product categories:", error);
    }
  };

  const fetchServiceTypes = async (page) => {
    try {
      const endpoint = config.AllServiceTypes;
      // const data = { page, pageSize };
      const response = await postApi(endpoint);
      console.log(response, "kkkkkkkkk")
      if (response?.data.length > 0) {
        setServiceTypeList(response.data || []);
      }
      // setTotalPages(response.totalPages || 1);
    } catch (error) { console.error('Error fetching service types:', error); }
  };

  // 🔹 Toggle category selection
  const handleSelectCategory = (categoryId) => {
    setSelectedCategories((prev) => {
      const exists = prev.find((c) => c.category_id === categoryId);
      if (exists) {
        return prev.filter((c) => c.category_id !== categoryId);
      } else {
        return [...prev, { category_id: categoryId, discount: 0 }]; // default 0%
      }
    });
  };

  const handleSelectService = (categoryId) => {
    setSelectedServices((prev) => {
      console.log(prev,"jjj")
      const exists = prev.find((c) => c.ServiceType_id === categoryId);
      if (exists) {
        return prev.filter((c) => c.ServiceType_id !== categoryId);
      } else {
        return [...prev, { ServiceType_id: categoryId, discount: 0 }]; // default 0%
      }
    });
  };
  // 🔹 Update discount value for a selected category
  const handleDiscountChange = (categoryId, value) => {
    const percentage = Math.max(0, Math.min(100, Number(value) || 0)); // clamp 0–100%
    setSelectedCategories((prev) =>
      prev.map((c) =>
        c.category_id === categoryId ? { ...c, discount: percentage } : c
      )
    );
  };

    const handleServiceDiscountChange = (categoryId, value) => {
    const percentage = Math.max(0, Math.min(100, Number(value) || 0)); // clamp 0–100%
    setSelectedServices((prev) =>
      prev.map((c) =>
        c.ServiceType_id === categoryId ? { ...c, discount: percentage } : c
      )
    );
  };


  // 🔹 Select/Deselect all categories
  const handleSelectAllCategories = () => {
    if (selectAllCategories) {
      setSelectedCategories([]);
    } else {
      const all = productCategories.map((c) => ({
        category_id: c._id,
        discount: 0, // default
      }));
      setSelectedCategories(all);
    }
    setSelectAllCategories(!selectAllCategories);
  };

  const handleSelectAllServices = () => {
    if (selectAllServices) {
      setSelectedServices([]);
    } else {
      const all = serviceTypeList.map((c) => ({
        ServiceType_id: c._id,
        discount: 0, // default
      }));
      console.log(all,"allall")
      setSelectedServices(all);
    }
    setSelectAllServices(!selectAllServices);
  };


  // 🔹 Save selected categories to membership plan
  const saveSelectedCategories = async () => {
    if (!selectedPlanId) {
      Swal.fire("Error", "No membership plan selected.", "error");
      return;
    }

    try {
      const payload = {
        membership_id: selectedPlanId,
        product_categories: selectedCategories, // now array of objects
      };
      const files = {};

      const response = await updateApiWithFile(
        config.EditMembershipPlan,
        selectedPlanId,
        payload,
        files
      );

      if (response.statusCode === 200) {
        Swal.fire("Success", "Categories & discounts saved!", "success");
        setShowCategoryModal(false);
        setSelectedCategories([]);
        fetchPlans(currentPage);
      } else {
        Swal.fire("Error", response.message || "Failed to assign categories.", "error");
      }
    } catch (error) {
      console.error("Error saving categories:", error);
      Swal.fire("Error", "Something went wrong while saving categories.", "error");
    }
  };

 const saveSelectedServices = async () => {
    if (!selectedPlanId) {
      Swal.fire("Error", "No membership plan selected.", "error");
      return;
    }

    try {
      const payload = {
        membership_id: selectedPlanId,
        serviceType_categories: selectedServices, // now array of objects
      };
      const files = {};

      const response = await updateApiWithFile(
        config.EditMembershipPlan,
        selectedPlanId,
        payload,
        files
      );

      if (response.statusCode === 200) {
        Swal.fire("Success", "Categories & discounts saved!", "success");
        setShowServiceModal(false);
        setSelectedServices([]);
        fetchPlans(currentPage);
      } else {
        Swal.fire("Error", response.message || "Failed to assign categories.", "error");
      }
    } catch (error) {
      console.error("Error saving categories:", error);
      Swal.fire("Error", "Something went wrong while saving categories.", "error");
    }
  };

  // 🔹 Open modal to manage product categories for a plan
  // 🔹 Open modal to manage product categories for a plan
  const openCategoryModal = async (planId) => {
    setSelectedPlanId(planId);
    const plan = plans.find((p) => p._id === planId);

    await fetchProductCategories();

    // ✅ Pre-fill selected categories + discounts
    if (plan && Array.isArray(plan.serviceType_categories)) {
      const formattedCategories = plan.serviceType_categories.map((item) => ({
        category_id:
          typeof item.category_id === "object"
            ? item.category_id._id
            : item.category_id,
        discount: item.discount || 0,
      }));
      setSelectedCategories(formattedCategories);
    } else {
      setSelectedCategories([]);
    }

    setSelectAllCategories(false);
    setShowCategoryModal(true);
  };

  const openServiceModal = async (planId) => {
    setSelectedPlanId(planId);
    const plan = plans.find((p) => p._id === planId);

    await fetchServiceTypes();

    // ✅ Pre-fill selected categories + discounts
    if (plan && Array.isArray(plan.serviceType_categories)) {
      console.log(plan.serviceType_categories,"plan.serviceType_categories")
      const formattedCategories = plan.serviceType_categories.map((item) => ({
        category_id:
          typeof item.category_id === "object"
            ? item.category_id._id
            : item.category_id,
        discount: item.discount || 0,
      }));
      setSelectedCategories(formattedCategories);
    } else {
      setSelectedCategories([]);
    }

    setSelectAllCategories(false);
    setShowServiceModal(true);
  };

  // 🔹 Fetch all Yoga Videos (flatten nested videos)
  const fetchVideos = async () => {
    try {
      const response = await postApi(config.getAllYogaVideo, { page: 1, pageSize: 100 });
      console.log("Yoga videos response:", response);

      if (response.statusCode === 200 || response.statusCode === 201) {
        // Flatten all nested videos into a single array
        const allVideos = response.result?.flatMap((category) =>
          category.videos.map((video) => ({
            ...video,
            categoryName: category.name, // keep track of which category it belongs to
          }))
        );

        setVideos(allVideos || []);
      }
    } catch (error) {
      console.error("Error fetching yoga videos:", error);
    }
  };


  // 🔹 Handle individual video selection
  const handleSelectVideo = (videoId) => {
    setSelectedVideos((prev) =>
      prev.includes(videoId)
        ? prev.filter((id) => id !== videoId)
        : [...prev, videoId]
    );
  };

  // 🔹 Select all videos
  const handleSelectAllVideos = () => {
    if (selectAllVideos) {
      setSelectedVideos([]);
    } else {
      setSelectedVideos(videos.map((v) => v._id));
    }
    setSelectAllVideos(!selectAllVideos);
  };


  // 🔹 Save selected videos to membership plan
  const saveSelectedVideos = async () => {
    if (!selectedPlanId) {
      Swal.fire("Error", "No membership plan selected.", "error");
      return;
    }

    try {
      const payload = {
        membership_id: selectedPlanId,
        yoga_videos: selectedVideos,
      };
      const files = {};

      const response = await updateApiWithFile(
        config.EditMembershipPlan, // 🔹 using same endpoint as courses
        selectedPlanId,
        payload,
        files
      );

      if (response.statusCode === 200) {
        Swal.fire("Success", "Yoga videos assigned successfully!", "success");
        setShowVideoModal(false);
        setSelectedVideos([]);
        fetchPlans(currentPage);
      } else {
        Swal.fire("Error", response.message || "Failed to assign videos.", "error");
      }
    } catch (error) {
      console.error("Error assigning videos:", error);
      Swal.fire("Error", "Something went wrong while saving videos.", "error");
    }
  };

  useEffect(() => {
    fetchPlans(currentPage);
  }, [currentPage]);

  const fetchPlans = async (page) => {
    try {
      const response = await postApi(config.GetMembershipPlans, { page, pageSize });
      console.log("Plans ", response)
      setPlans(response.result || []);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      console.error("Error fetching plans:", error);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await postApi(config.getAllCourses, { page: 1, pageSize: 100 });
      if (response.statusCode === 200) {
        setCourses(response.result || []);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };



  const handleSelectCourse = (courseId) => {
    setSelectedCourses((prev) =>
      prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId]
    );
  };
  const saveSelectedCourses = async () => {
    if (!selectedPlanId) {
      Swal.fire("Error", "No membership plan selected.", "error");
      return;
    }

    try {
      const payload = {
        membership_id: selectedPlanId,
        courses: selectedCourses,
      };
      const files = {};
      // const response = await postApi(config.EditMembershipPlan, payload);
      const response = await updateApiWithFile(
        config.EditMembershipPlan,
        selectedPlanId,
        payload,
        files
      );

      if (response.statusCode === 200) {
        Swal.fire("Success", "Courses assigned successfully!", "success");
        setShowCourseModal(false);
        setSelectedCourses([]);
        fetchPlans(currentPage); // Optional refresh
      } else {
        Swal.fire("Error", response.message || "Failed to assign courses.", "error");
      }
    } catch (error) {
      console.error("Error assigning courses:", error);
      Swal.fire("Error", "Something went wrong while saving courses.", "error");
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedCourses([]);
    } else {
      setSelectedCourses(courses.map((c) => c._id));
    }
    setSelectAll(!selectAll);
  };

  const openCourseModal = async (planId) => {
    setSelectedPlanId(planId);

    // Find the plan being edited
    const plan = plans.find((p) => p._id === planId);

    await fetchCourses();


    if (plan && Array.isArray(plan.courses)) {
      setSelectedCourses(plan.courses);
    } else {
      setSelectedCourses([]);
    }

    setSelectAll(false);
    setShowCourseModal(true);
  };

  // 🔹 Open modal to manage yoga videos for a plan
  // 🔹 Open modal to manage yoga videos for a plan
  const openVideoModal = async (planId) => {
    setSelectedPlanId(planId);

    // Find selected plan
    const plan = plans.find((p) => p._id === planId);

    await fetchVideos(); // fetches all available videos

    // ✅ Get preselected video IDs from membership plan
    if (plan && Array.isArray(plan.yoga_videos)) {
      setSelectedVideos(plan.yoga_videos.map((v) => v._id || v)); // handle if array contains objects or just IDs
    } else {
      setSelectedVideos([]);
    }

    setSelectAllVideos(false);
    setShowVideoModal(true);
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
        deletePlan(id);
      }
    });
  };

  const deletePlan = async (id) => {
    try {
      await postApi(config.DeleteMembershipPlan, { id });
      Swal.fire("Deleted!", "Membership plan deleted.", "success");
      fetchPlans(currentPage);
    } catch (error) {
      console.error("Error deleting plan:", error);
      Swal.fire("Error", "Failed to delete membership plan.", "error");
    }
  };

  const confirmToggleStatus = (id, currentStatus) => {
    const action = currentStatus === 1 ? "deactivate" : "activate";
    Swal.fire({
      title: `Are you sure you want to ${action} this plan?`,
      text: `This will ${action} the plan immediately.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: `Yes, ${action} it!`,
    }).then(async (result) => {
      if (result.isConfirmed) {
        await togglePlanStatus(id);
      }
    });
  };

  const togglePlanStatus = async (id) => {
    try {
      const res = await postApi(config.ToggleMembershipStatus, { id: id });
      console.log(res)
      if (res.statusCode === 200) {
        Swal.fire("Success", "Plan status updated successfully!", "success");
        fetchPlans(currentPage);
      } else {
        Swal.fire("Error", "Failed to update status.", "error");
      }
    } catch (error) {
      console.error("Error toggling plan status:", error);
      Swal.fire("Error", "Something went wrong while updating status.", "error");
    }
  };

  const confirmBestValue = (id) => {
    Swal.fire({
      title: "Make this the Best Value plan?",
      text: "This will replace the current Best Value plan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, make it Best Value!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        await setBestValue(id);
      }
    });
  };


  const setBestValue = async (id) => {
    try {
      const response = await postApi(config.SetBestValuePlan, { id });
      if (response.statusCode === 200) {
        Swal.fire("Success", "Best Value plan updated successfully!", "success");
        fetchPlans(currentPage);
      } else {
        Swal.fire("Error", response.message || "Failed to update Best Value.", "error");
      }
    } catch (error) {
      console.error("Error setting Best Value:", error);
      Swal.fire("Error", "Something went wrong while updating Best Value.", "error");
    }
  };


  return (
    <Container fluid className="p-6">
      <Row className="align-items-center mb-4">
        <Col>
          <h2>Membership Plans</h2>
        </Col>
        <Col className="d-flex justify-content-end align-items-center gap-2">


          {plans.length < 3 ? (
            <Link href="/admin/Membership-Management/add-plans">
              <Button variant="success">Add Membership Plan</Button>
            </Link>
          ) : (
            <OverlayTrigger
              placement="top"
              overlay={<Tooltip>You can add up to 3 plans only.</Tooltip>}
            >
              <span>
                <Button variant="secondary" disabled>
                  Maximum 3 Plans Allowed
                </Button>
              </span>
            </OverlayTrigger>
          )}
        </Col>


      </Row>

      <Table hover responsive bordered>
        <thead>
          <tr>
            <th>#</th>
            <th>Plan Name</th>
            <th>Image</th>
            <th>Price</th>
            <th>Status</th>
            <th>Created Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {plans.length === 0 && (
            <tr>
              <td colSpan={7} className="text-center text-muted">
                No membership plans found.
              </td>
            </tr>
          )}

          {plans.map((plan, index) => (
            <tr key={plan._id}>
              <td>{(currentPage - 1) * pageSize + index + 1}</td>
              <td>{plan.plan_name}</td>
              <td>
                {plan.image ? (
                  <img
                    src={`${process.env.NEXT_PUBLIC_API_URL}/${plan.image}`}
                    alt={plan.plan_name}
                    width={50}
                    height={50}
                    style={{ borderRadius: "4px" }}
                  />
                ) : (
                  <span className="text-muted">No Image</span>
                )}
              </td>
              <td>
                ${plan?.price || 'N/A'}
              </td>
              <td>
                {plan.status === 1 ? (
                  <Badge bg="success">Active</Badge>
                ) : (
                  <Badge bg="secondary">Inactive</Badge>
                )}
              </td>
              <td>
                {plan.created_date
                  ? new Date(plan.created_date).toLocaleDateString('en-US')
                  : "—"}
              </td>
              <td>
                <div className="d-flex align-items-center">
                  <OverlayTrigger placement="top" overlay={<Tooltip>View Plan</Tooltip>}>
                    <Link href={`/admin/Membership-Management/view/${plan._id}`}>
                      <Eye size={20} style={{ marginRight: '10px' }} />
                    </Link>
                  </OverlayTrigger>

                  <OverlayTrigger placement="top" overlay={<Tooltip>Edit Plan</Tooltip>}>
                    <Link href={`/admin/Membership-Management/edit/${plan._id}`}>
                      <PencilSquare size={20} style={{ marginRight: '10px' }} />
                    </Link>
                  </OverlayTrigger>


                  {/* <OverlayTrigger placement="top" overlay={<Tooltip>Delete Plan</Tooltip>}>
      <span
        style={{ cursor: "pointer", color: "#dc3545" ,marginRight: '10px'}}
        onClick={() => confirmDelete(plan._id)}
      >
        <Trash size={20} />
      </span>
    </OverlayTrigger> */}

                  <OverlayTrigger
                    placement="top"
                    overlay={
                      <Tooltip>
                        {plan.status === 1 ? "Deactivate Plan" : "Activate Plan"}
                      </Tooltip>
                    }
                  >
                    <Button
                      variant={plan.status === 1 ? "outline-danger" : "outline-success"}
                      size="sm"
                      className="me-2"
                      onClick={() => confirmToggleStatus(plan._id, plan.status)}
                    >
                      {plan.status === 1 ? "Deactivate" : "Activate"}
                    </Button>
                  </OverlayTrigger>

                  {/* 🟣 Best Value Feature */}
                  {plan.is_bestvalue === 1 ? (
                    <Badge bg="warning" text="dark" className="me-2">
                      Best Value
                    </Badge>
                  ) : (
                    <OverlayTrigger
                      placement="top"
                      overlay={<Tooltip>Mark this plan as Best Value</Tooltip>}
                    >
                      <span
                        style={{ cursor: "pointer", color: "#624bff", marginRight: "10px" }}
                        onClick={() => confirmBestValue(plan._id)}
                      >
                        <FileCheck size={20} style={{ marginRight: '10px' }} />
                      </span>
                    </OverlayTrigger>
                  )}

                  <Dropdown align="end" className="ms-2 settings-dropdown">
                    <Dropdown.Toggle
                      id={`settings-${plan._id}`}
                      variant="outline-primary"
                      size="sm"
                      className="settings-btn"
                    >
                      Settings
                    </Dropdown.Toggle>

                    <Dropdown.Menu className="shadow-sm rounded-3 py-2">
                      <Dropdown.Item
                        onClick={() => openCourseModal(plan._id)}
                        className="d-flex align-items-center gap-2"
                      >
                        <Gear size={14} /> Manage Courses
                      </Dropdown.Item>

                      <Dropdown.Item
                        onClick={() => openVideoModal(plan._id)}
                        className="d-flex align-items-center gap-2"
                      >
                        <Gear size={14} /> Manage Yoga Videos
                      </Dropdown.Item>

                      <Dropdown.Item
                        onClick={() => openCategoryModal(plan._id)}
                        className="d-flex align-items-center gap-2"
                      >
                        <Gear size={14} /> Manage Product Categories
                      </Dropdown.Item>
                      <Dropdown.Item
                        onClick={() => openServiceModal(plan._id)}
                        className="d-flex align-items-center gap-2"
                      >
                        <Gear size={14} /> Manage Service Categories
                      </Dropdown.Item>

                    </Dropdown.Menu>

                  </Dropdown>






                </div>
              </td>

            </tr>
          ))}
        </tbody>
      </Table>

      <Pagination className="justify-content-center mt-4">
        <Pagination.First
          onClick={() => setCurrentPage(1)}
          disabled={currentPage === 1}
        />
        <Pagination.Prev
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
        />
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <Pagination.Item
            key={page}
            active={page === currentPage}
            onClick={() => setCurrentPage(page)}
          >
            {page}
          </Pagination.Item>
        ))}
        <Pagination.Next
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage === totalPages}
        />
        <Pagination.Last
          onClick={() => setCurrentPage(totalPages)}
          disabled={currentPage === totalPages}
        />
      </Pagination>

      <Modal
        show={showCourseModal}
        onHide={() => {
          setShowCourseModal(false);
          setSelectedCourses([]);
          setSelectAll(false);
        }}
        size="lg"
        centered
      >

        <Modal.Header closeButton>
          <Modal.Title>Manage Courses</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {courses.length > 0 ? (
            <>
              <div className="d-flex justify-content-between mb-3">
                <Form.Check
                  type="checkbox"
                  label={selectAll ? "Deselect All" : "Select All"}
                  checked={selectAll}
                  onChange={handleSelectAll}
                />
                <span className="text-muted">
                  Selected: {selectedCourses.length}/{courses.length}
                </span>
              </div>

              <Table hover responsive bordered>
                <thead>
                  <tr>
                    <th></th>
                    <th>Course Name</th>
                    <th>Category</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course) => (
                    <tr key={course._id}>
                      <td>
                        <Form.Check
                          type="checkbox"
                          checked={selectedCourses.includes(course._id)}
                          onChange={() => handleSelectCourse(course._id)}
                        />
                      </td>
                      <td>{course.courseName}</td>
                      <td>{course.categoryId?.name || "Uncategorized"}</td>
                      <td>
                        <Badge bg={course.status === 1 ? "success" : "danger"}>
                          {course.status === 1 ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </>
          ) : (
            <div className="text-center text-muted py-4">
              No courses found.
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCourseModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={saveSelectedCourses}>
            Save Selection
          </Button>

        </Modal.Footer>
      </Modal>

      {/* 🔹 Manage Yoga Videos Modal */}
      <Modal
        show={showVideoModal}
        onHide={() => {
          setShowVideoModal(false);
          setSelectedVideos([]);
          setSelectAllVideos(false);
        }}
        size="xl"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Manage Yoga Videos</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {videos.length > 0 ? (
            <>
              <div className="d-flex justify-content-between mb-3">
                <Form.Check
                  type="checkbox"
                  label={selectAllVideos ? "Deselect All" : "Select All"}
                  checked={selectAllVideos}
                  onChange={handleSelectAllVideos}
                />
                <span className="text-muted">
                  Selected: {selectedVideos.length}/{videos.length}
                </span>
              </div>

              <Table hover responsive bordered>
                <thead>
                  <tr>
                    <th></th>
                    <th>Thumbnail</th>
                    <th>Video Title</th>
                    <th>Category</th>
                    {/* <th>Status</th> */}
                  </tr>
                </thead>
                <tbody>
                  {videos.map((video) => (
                    <tr key={video._id}>
                      <td>
                        <Form.Check
                          type="checkbox"
                          checked={selectedVideos.includes(video._id)}
                          onChange={() => handleSelectVideo(video._id)}
                        />
                      </td>
                      <td>
                        {video.coverImage ? (
                          <img
                            src={`${process.env.NEXT_PUBLIC_API_URL}/${video.coverImage}`.replace(/\\/g, "/")}
                            alt={video.name}
                            width="60"
                            height="40"
                            style={{ borderRadius: "4px", objectFit: "cover" }}
                          />
                        ) : (
                          <span className="text-muted">No Image</span>
                        )}
                      </td>
                      <td>{video.name}</td>
                      <td>{video.categoryName || "Uncategorized"}</td>
                      {/* <td>
                        <Badge bg={video.status === 1 ? "success" : "danger"}>
                          {video.status === 1 ? "Listed" : "Inactive"}
                        </Badge>
                      </td> */}
                    </tr>
                  ))}
                </tbody>


              </Table>
            </>
          ) : (
            <div className="text-center text-muted py-4">No videos found.</div>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowVideoModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={saveSelectedVideos}>
            Save Selection
          </Button>
        </Modal.Footer>
      </Modal>


      {/* 🔹 Manage Product Categories Modal */}
      <Modal
        show={showCategoryModal}
        onHide={() => {
          setShowCategoryModal(false);
          setSelectedCategories([]);
          setSelectAllCategories(false);
        }}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Manage Product Categories</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {productCategories.length > 0 ? (
            <>
              <div className="d-flex justify-content-between mb-3">
                <Form.Check
                  type="checkbox"
                  label={selectAllCategories ? "Deselect All" : "Select All"}
                  checked={selectAllCategories}
                  onChange={handleSelectAllCategories}
                />
                <span className="text-muted">
                  Selected: {selectedCategories.length}/{productCategories.length}
                </span>
              </div>

              <Table hover responsive bordered>
                <thead>
                  <tr>
                    <th></th>
                    <th>Category Name</th>
                    <th>Status</th>
                    <th>Discount (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {productCategories.map((category) => {
                    const selected = selectedCategories.find(
                      (c) => c.category_id === category._id
                    );
                    return (
                      <tr key={category._id}>
                        <td>
                          <Form.Check
                            type="checkbox"
                            checked={!!selected}
                            onChange={() => handleSelectCategory(category._id)}
                          />
                        </td>
                        <td>{category.name}</td>
                        <td>
                          <Badge bg={category.status === 1 ? "success" : "danger"}>
                            {category.status === 1 ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td>
                          {selected ? (
                            <Form.Control
                              type="number"
                              min="0"
                              max="100"
                              step="1"
                              value={selected.discount}
                              onChange={(e) =>
                                handleDiscountChange(category._id, e.target.value)
                              }
                              style={{ width: "90px" }}
                            />
                          ) : (
                            <span className="text-muted">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>

            </>
          ) : (
            <div className="text-center text-muted py-4">No categories found.</div>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCategoryModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={saveSelectedCategories}>
            Save Selection
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showServiceModal}
        onHide={() => {
          setShowServiceModal(false);
          setSelectedServices([]);
          setSelectAllServices(false);
        }}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Manage Service Types</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {serviceTypeList.length > 0 ? (
            <>
              <div className="d-flex justify-content-between mb-3">
                <Form.Check
                  type="checkbox"
                  label={selectAllServices? "Deselect All" : "Select All"}
                  checked={selectAllServices}
                  onChange={handleSelectAllServices}
                />
                <span className="text-muted">
                  Selected: {selectedServices.length}/{productCategories.length}
                </span>
              </div>

              <Table hover responsive bordered>
                <thead>
                  <tr>
                    <th></th>
                    <th>Services Type Name</th>
                    <th>Status</th>
                    <th>Discount (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {serviceTypeList.map((serviceType) => {
                    console.log(selectedServices,"category")
                    const selected = selectedServices.find(
                      (c) => c.ServiceType_id === serviceType._id
                    );
                    return (
                      <tr key={serviceType._id}>
                        <td>
                          <Form.Check
                            type="checkbox"
                            checked={!!selected}
                            onChange={() => handleSelectService(serviceType._id)}
                          />
                        </td>
                        <td>{serviceType.name}</td>
                        <td>
                          <Badge bg={serviceType.status === 1 ? "success" : "danger"}>
                            {serviceType.status === 1 ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td>
                          {selected ? (
                            <Form.Control
                              type="number"
                              min="0"
                              max="100"
                              step="1"
                              value={selected.discount}
                              onChange={(e) =>
                                handleServiceDiscountChange(serviceType._id, e.target.value)
                              }
                              style={{ width: "90px" }}
                            />
                          ) : (
                            <span className="text-muted">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>

            </>
          ) : (
            <div className="text-center text-muted py-4">No categories found.</div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowServiceModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={saveSelectedServices}>
            Save Selection
          </Button>
        </Modal.Footer>
      </Modal>
      <style jsx>{`
  .settings-dropdown .dropdown-toggle::after {
    margin-left: 0.35rem;
  }

  .settings-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    border-radius: 6px;
    font-size: 0.85rem;
    padding: 4px 10px;
    transition: all 0.2s ease-in-out;
  }

  .settings-btn:hover {
    background-color: #624bff !important;
    color: #fff !important;
    border-color: #624bff !important;
  }

  .settings-dropdown .dropdown-menu {
    min-width: 180px;
    margin-top: 6px !important;
    border: 1px solid #e8e7ff;
  }

  .settings-dropdown .dropdown-item {
    padding: 8px 14px;
    font-size: 0.9rem;
    color: #333;
    transition: background-color 0.2s ease;
  }

  .settings-dropdown .dropdown-item:hover {
    background-color: #f4f1ff !important;
    color: #624bff !important;
  }
`}</style>




    </Container>
  );
}
