// filepath: /components/admin/EventList.js
"use client";
import { useState, useEffect } from "react";
import {
  Col,
  Row,
  Table,
  Button,
  Container,
  Pagination,
  Modal,
  Form
} from "react-bootstrap";

import { Eye, PencilSquare, Trash, CheckCircle, XCircle, FilePdf, ArrowUp, ArrowDown,Copy } from "react-bootstrap-icons";
import Link from "next/link";
import { config } from "services/config";
import { postApi, updateApiWithFile } from "services/api";
import Swal from "sweetalert2";

export default function EventList() {
  const [events, setEvents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState("");
  
  // ✅ Filter state
  const [eventFilter, setEventFilter] = useState("all"); // 'all', 'upcoming', 'ongoing', 'completed'
  const [allEvents, setAllEvents] = useState([]);

const fetchEvents = async (
  page = 1,
  sortBy = sortConfig.key,
  sortOrder = sortConfig.direction
) => {
  try {
    const response = await postApi(config.Allevents, {
      page,
      pageSize,
      eventname: search,
      eventFilter,
      sortBy,
      sortOrder,
    });

    setEvents(response.events || []);
    setTotalPages(response.totalPages || 1);
    setTotalCount(response.totalCount || 0);
  } catch (error) {
    console.error(error);
  }
};
  
  // ✅ Sorting state
  const [sortConfig, setSortConfig] = useState({
    key: 'date',
    direction: 'asc'
  });

  const DOCUMENT_ID = "68243b752897e78f4551679a";
  const [showHeaderModal, setShowHeaderModal] = useState(false);

  const [pageTitle, setPageTitle] = useState("Resources");
  const [pageSubtitle, setPageSubtitle] = useState("Resources");

  const [loadingHeader, setLoadingHeader] = useState(false);
  const [savingHeader, setSavingHeader] = useState(false);

  // ✅ Helper function to determine event status based on date
  const getEventStatusByDate = (eventDate) => {
    if (!eventDate) return "unknown";
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const eventDateObj = new Date(eventDate);
    eventDateObj.setHours(0, 0, 0, 0);
    
    if (eventDateObj.getTime() === today.getTime()) {
      return "ongoing";
    } else if (eventDateObj.getTime() > today.getTime()) {
      return "upcoming";
    } else {
      return "completed";
    }
  };

  // ✅ Helper function to convert time to 12-hour format
  const convertTo12HourFormat = (timeString) => {
    if (!timeString) return "N/A";
    
    if (timeString.match(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes} ${ampm}`;
    }
    
    if (timeString.includes('AM') || timeString.includes('PM')) {
      return timeString;
    }
    
    return timeString;
  };

  // ✅ Sorting function
  const sortEvents = (eventsArray, sortKey, sortDirection) => {
    const sorted = [...eventsArray];
    
    sorted.sort((a, b) => {
      let valueA = a[sortKey];
      let valueB = b[sortKey];
      
      if (sortKey === 'date') {
        valueA = valueA ? new Date(valueA) : new Date(0);
        valueB = valueB ? new Date(valueB) : new Date(0);
  //       const timeA = convertTimeToComparable(a.time || "00:00");
  // const timeB = convertTimeToComparable(b.time || "00:00");

  // valueA = new Date(`${a.date} ${timeA}`);
  // valueB = new Date(`${b.date} ${timeB}`);
      }
      
      if (sortKey === 'time') {
        valueA = convertTimeToComparable(valueA);
        valueB = convertTimeToComparable(valueB);
      }
      
      if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
      if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    
    return sorted;
  };
  
  // ✅ Helper to convert time to comparable format
  const convertTimeToComparable = (timeString) => {
    if (!timeString) return "00:00";
    
    if (timeString.match(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
      return timeString;
    }
    
    const match = timeString.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (match) {
      let hours = parseInt(match[1]);
      const minutes = match[2];
      const period = match[3].toUpperCase();
      
      if (period === 'PM' && hours !== 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
      
      return `${hours.toString().padStart(2, '0')}:${minutes}`;
    }
    
    return timeString;
  };
  
  // ✅ Handle sort request
  // const handleSort = (key) => {
  //   setSortConfig(prev => ({
  //     key,
  //     direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
  //   }));
  // };
  const handleSort = (key) => {
  const direction =
    sortConfig.key === key && sortConfig.direction === "asc"
      ? "desc"
      : "asc";

  setSortConfig({
    key,
    direction,
  });

  if (key === "date") {
    fetchEvents(1, key, direction);
  }
};
  
  // ✅ Get filtered and sorted events
  // const getFilteredAndSortedEvents = () => {
  //   if (!events.length) return [];
  //   const filtered = filterEventsByStatus(events);
  //   return sortEvents(filtered, sortConfig.key, sortConfig.direction);
  // };

  const getFilteredAndSortedEvents = () => {
  if (!allEvents.length) return [];

  const filtered = filterEventsByStatus(allEvents);

  const sorted = sortEvents(
    filtered,
    sortConfig.key,
    sortConfig.direction
  );

  return sorted;
};



  const fetchResourcesHeader = async () => {
    setLoadingHeader(true);
    try {
      const endpoint = config.GetBalancingDiet; // same api as your other component
      const payload = { type: "kapha" };

      const response = await postApi(endpoint, payload);

      const title = response?.data?.data?.[0]?.event_section_title;
      const subtitle = response?.data?.data?.[0]?.event_section_subtitle;

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
        event_section_title: pageTitle,
        event_section_subtitle: pageSubtitle,
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



  // useEffect(() => {
  //   fetchResourcesHeader();
  //   fetchEvents(currentPage);
  // }, [currentPage]);
 

  // const fetchEvents = async (page) => {
  //   try {
  //     const endpoint = config.Allevents;
  //     const data = { page, pageSize, eventname: search };
  //     const response = await postApi(endpoint, data);

  //     console.log(response.events);
  //     setEvents(response.events || []);
  //     setTotalPages(response.totalPages || 1);
  //     setTotalCount(response.totalCount || 0);
  //   } catch (error) {
  //     console.error("Error fetching events:", error);
  //   }
  // };


  const handleSearch = async () => {
    setCurrentPage(1);
    await fetchEvents();
  };

  const handleFilterChange = (filter) => {
    setEventFilter(filter);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const confirmDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This event will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteEvent(id);
        Swal.fire("Deleted!", "Event has been deleted.", "success");
      }
    });
  };

  const deleteEvent = async (id) => {
    try {
      const endpoint = config.DeleteEvent;
      const data = { id };
      await postApi(endpoint, data);
      fetchEvents();
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  const confirmUpdate = (id, currentStatus) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This will toggle the event's status.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, update it!",
    }).then((result) => {
      if (result.isConfirmed) {
        updateStatus(id, currentStatus);
        Swal.fire("Updated!", "Event status has been changed.", "success");
      }
    });
  };

  const updateStatus = async (id, currentStatus) => {
    try {
      const endpoint = config.UpdateEventStatus;
      const data = { id };
      console.log("Updating event status:", data);
      const response = await postApi(endpoint, data);
      if (response.statusCode === 200) {
        fetchEvents();
      } else {
        console.error("Failed to update event status.");
        Swal.fire("Error!", "Failed to update event status.", "error");
      }
    } catch (error) {
      console.error("Error updating event:", error);
      Swal.fire("Error!", "Something went wrong while updating status.", "error");
    }
  };

  // Get filtered and sorted events for display
  // const displayEvents = getFilteredAndSortedEvents();
  
  // // Calculate counts for each filter
  // const upcomingCount = events.filter(e => getEventStatusByDate(e.date) === "upcoming").length;
  // const ongoingCount = events.filter(e => getEventStatusByDate(e.date) === "ongoing").length;
  // const completedCount = events.filter(e => getEventStatusByDate(e.date) === "completed").length;

  const filteredAndSortedEvents = getFilteredAndSortedEvents();

const displayEvents =
  sortConfig.key === "time"
    ? sortEvents(events, "time", sortConfig.direction)
    : events;

  const upcomingCount = allEvents.filter(
  (e) => getEventStatusByDate(e.date) === "upcoming"
).length;

const ongoingCount = allEvents.filter(
  (e) => getEventStatusByDate(e.date) === "ongoing"
).length;

const completedCount = allEvents.filter(
  (e) => getEventStatusByDate(e.date) === "completed"
).length;

useEffect(() => {
  fetchResourcesHeader();
}, []);

useEffect(() => {
  fetchEvents(currentPage);
}, [currentPage, search, eventFilter]);

const createDuplicateEvent= async (id) => {
    const endpoint = config.createDuplicateEvent;
      const data = { id };
      const result = await postApi(endpoint, data);
      if(result.statusCode==200){
      fetchEvents();
      Swal.fire("Copied!", "Event has been copied. Please change date and time.", "success");
    }
}

  return (
    <>
      <Container fluid className="p-6">
        <Row className="align-items-center mb-4">
          <Col>
            <div className="d-flex align-items-center gap-2">
              <h2 className="mb-0">{pageTitle}</h2>
              <span
                role="button"
                title="Edit Title/SubTitle Landing Page"
                onClick={openHeaderModal}
                style={{ cursor: "pointer" }}
              >
                <PencilSquare size={18} />
              </span>
            </div>
            <small>{pageSubtitle}</small>
          </Col>
          <Col className="d-flex justify-content-end">
            <Link href="/admin/Event-Management/Events/add-events" passHref>
              <Button variant="success">Add New Event</Button>
            </Link>
          </Col>
        </Row>

        {/* Filter Buttons */}
        <Row className="mb-3">
          <Col md={12}>
            <div className="d-flex gap-2 flex-wrap">
              <Button
                variant={eventFilter === "all" ? "primary" : "outline-secondary"}
                onClick={() => handleFilterChange("all")}
              >
                All Events {/*({allEvents.length}) */}
              </Button>
              <Button
                variant={eventFilter === "upcoming" ? "primary" : "outline-secondary"}
                onClick={() => handleFilterChange("upcoming")}
              >
                Upcoming {/*({upcomingCount}) */}
              </Button>
              <Button
                variant={eventFilter === "ongoing" ? "primary" : "outline-secondary"}
                onClick={() => handleFilterChange("ongoing")}
              >
                Ongoing {/*({ongoingCount}) */}
              </Button>
              <Button
                variant={eventFilter === "completed" ? "primary" : "outline-secondary"}
                onClick={() => handleFilterChange("completed")}
              >
                Completed 
                {/* ({completedCount}) */}
              </Button>
            </div>
          </Col>
        </Row>

        {/* Search bar */}
        <Row className="mb-3">
          <Col md={4}>
            <input
              type="text"
              className="form-control"
              placeholder="Search by Event Name....
              "
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Col>
          <Col md="auto">
            <Button variant="primary" onClick={handleSearch}>
              Search
            </Button>
          </Col>
        </Row>

        <Row>
          <Col xl={12} lg={12} md={12} sm={12}>
            <Table hover responsive className="text-nowrap">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Event Name</th>
                  
                  {/* ✅ Date column with sort indicator */}
                  <th 
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleSort('date')}
                  >
                    <div className="d-flex align-items-center gap-1">
                      Date
                      {sortConfig.key === 'date' && (
                        sortConfig.direction === 'asc' ? 
                          <ArrowUp size={14} /> : 
                          <ArrowDown size={14} />
                      )}
                    </div>
                  </th>
                  
                  {/* ✅ Time column with sort indicator */}
                  <th 
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleSort('time')}
                  >
                    <div className="d-flex align-items-center gap-1">
                      Time
                      {sortConfig.key === 'time' && (
                        sortConfig.direction === 'asc' ? 
                          <ArrowUp size={14} /> : 
                          <ArrowDown size={14} />
                      )}
                    </div>
                  </th>
                  
                  <th>Format</th>
                  <th>Price ($)</th>
                  <th>Speaker</th>
                  <th>City</th>
                  <th>Event Status</th>
                  <th>Active Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayEvents.length > 0 ? (
                  displayEvents.map((event, index) => {
                    const eventStatus = getEventStatusByDate(event.date);
                    let statusBadgeColor = "";
                    let statusText = "";
                    
                    switch(eventStatus) {
                      case "upcoming":
                        statusBadgeColor = "text-primary";
                        statusText = "Upcoming";
                        break;
                      case "ongoing":
                        statusBadgeColor = "text-success";
                        statusText = "Ongoing";
                        break;
                      case "completed":
                        statusBadgeColor = "text-secondary";
                        statusText = "Completed";
                        break;
                      default:
                        statusBadgeColor = "text-muted";
                        statusText = "Unknown";
                    }
                    
                    return (
                      <tr key={event._id}>
                        <td>{(currentPage - 1) * pageSize + index + 1}</td>
                        <td>{event.eventname}</td>
                        <td>{event.date ? new Date(event.date).toLocaleDateString("en-US") : "N/A"}</td>
                        <td>{convertTo12HourFormat(event.time)}</td>
                        <td>{event.format}</td>
                        <td>{event.Price}</td>
                        <td>{event.speakername || "—"}</td>
                        <td>{event.city || "—"}</td>
                        <td className={statusBadgeColor}>
                          <strong>{statusText}</strong>
                        </td>
                        <td>
                          {event.status === 1 ? (
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
                          <Link href={`/admin/Event-Management/Events/view/${event._id}`}>
                            <Eye size={20} style={{ marginRight: "10px" }} />
                          </Link>
                          <Link href={`/admin/Event-Management/Events/edit/${event._id}`}>
                            <PencilSquare size={20} style={{ marginRight: "10px" }} />
                          </Link>
                          <Link href={`/admin/Event-Management/Events/summary/${event._id}`}>
                            <FilePdf size={20} style={{ marginRight: "10px" }} />
                          </Link>
                          <div onClick={()=>createDuplicateEvent(event._id)}>
                          <Link href={'#'}>
                          <Copy size={20} style={{ marginRight: "10px" }}/></Link></div>
                          <span
                            onClick={() => confirmDelete(event._id)}
                            style={{
                              cursor: "pointer",
                              color: "#624bff",
                              marginRight: "10px",
                            }}
                          >
                            <Trash size={20} />
                          </span>
                          <Button
                            size="sm"
                            variant={event.status === 1 ? "danger" : "success"}
                            onClick={() => confirmUpdate(event._id, event.status)}
                          >
                            {event.status === 1 ? "Deactivate" : "Activate"}
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="11" className="text-center">
                      No events found
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>

            {/* Pagination */}
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

      <Modal show={showHeaderModal} onHide={() => setShowHeaderModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Event Section Heading (Landing Page)</Modal.Title>
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