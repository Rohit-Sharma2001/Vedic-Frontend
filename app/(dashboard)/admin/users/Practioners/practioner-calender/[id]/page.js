"use client";

import { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Modal,
  Button,
  Form,
  Accordion,
} from "react-bootstrap";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import { DateTime } from "luxon";
import { postApi, postApiWithFile } from "services/api";
import { config } from "services/config";
import { useParams } from "next/navigation";
import { Tooltip, OverlayTrigger } from "react-bootstrap";
import Select from "react-select";

export default function PractitionerCalendar() {
  const [wasSubmitted, setWasSubmitted] = useState(false);
  const params = useParams();
  const employeeId = params?.id || "";
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [centerOptions, setCenterOptions] = useState([]);
  const [centerEmployees, setCenterEmployees] = useState([]);
  const [selectedAddon, setSelectedAddon] = useState("");
  const [unavailableDates, setUnavailableDates] = useState([]);
const [availableSlots, setAvailableSlots] = useState([]);
const [showEditBreakModal, setShowEditBreakModal] = useState(false);
const [editBreakForm, setEditBreakForm] = useState({
  _id: "",
  employeeId: "",
  userId: "",
  note: "",
  date: "",
  time: "",
  duration: "",
});

const [calendarRange, setCalendarRange] = useState({
  start: DateTime.now().startOf("month").toISODate(),
  end: DateTime.now().endOf("month").toISODate(),
});

  const [activeAddonIndex, setActiveAddonIndex] = useState(null); // track which appt opened modal

  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [customer, setCustomer] = useState("");
  const [services, setServices] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [employee, setEmployee] = useState(null);
  const [userId, setUserId] = useState("");

const [showChoiceModal, setShowChoiceModal] = useState(false);

  const [showAddonModal, setShowAddonModal] = useState(false);     
  const [addons, setAddons] = useState([]);
const [showTaskModal, setShowTaskModal] = useState(false);
const [taskForm, setTaskForm] = useState({
  centerId: "",
  serviceId: "",
  employeeId: "",
  userId: "",
  note: "",
  addonId: "",
  duration: "30",
  price: "0.00",
  time: "",
  availableSlots: [],
});

  const [appointments, setAppointments] = useState([
    {
      centerId: "",
      serviceId: "",
      employeeId: "",
      duration: "0",
      userId: "", // ✅ added here
      price: "0.00",
      note: "",
      addonId: "",
    },
  ]);

  const addAppointmentForm = () => {
    setAppointments((prev) => [
      ...prev,
      {
        centerId: "",
        serviceId: "",
        employeeId: "",
        userId: "", // ✅ added here
        duration: "30",
        price: "0.00",
        note: "",
        addonId: "",
      },
    ]);
  };

  const removeAppointmentForm = (index) => {
    setAppointments((prev) => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    const fetchDurations = async () => {
      const updated = await Promise.all(
        appointments.map(async (appt) => {
          if (appt.employeeId && appt.serviceId) {
            try {
              const res = await postApi(config.getServiceDuration, {
                employeeId: appt.employeeId,
                serviceId: appt.serviceId,
              });
              if (res?.statusCode === 200 && res?.data?.length > 0) {
                const details = res.data[0];
                return {
                  ...appt,
                  duration: String(details.duration || ""),
                  price: String(details.price || ""),
                };
              }
            } catch (err) {
              console.error("Error fetching service duration:", err);
            }
          }
          return appt; // unchanged if no data
        })
      );
      setAppointments(updated);
    };

    fetchDurations();
  }, [appointments.map((a) => `${a.employeeId}-${a.serviceId}`).join(",")]);

  useEffect(() => {
    const fetchCenters = async () => {
      try {
        const response = await postApi(config.centers, {
          page: 1,
          pageSize: 100,
        });
        const centers = response?.centers || [];
        setCenterOptions(
          centers.map((center) => ({
            label: center.centerName,
            value: center._id,
          }))
        );
      } catch (err) {
        console.error("Failed to load centers", err);
      }
    };

    fetchCenters();
  }, []);

  const fetchAddons = async () => {
    try {
      const res = await postApi(config.AllAddOns, { page: 1, pageSize: 100 });
      setAddons(res.data || []);
    } catch (err) {
      console.error("Failed to fetch addons", err);
    }
  };

const fetchAvailableSlots = async (serviceId, employeeId, date, apptIndex) => {
  try {
    const emp = centerEmployees.find((e) => e.value === employeeId);
    const payload = {
      slotsPayload: [
        {
          serviceId,
          employeeId,
          userId: emp?.userId || "", // ✅ send employee's userId
          date,
        },
      ],
    };

    const res = await postApi(config.CheckSlots, payload);

    if (res?.slots?.length) {
      const slotObjs = res.slots[0].slots; // keep full slot objects
      setAppointments((prev) =>
        prev.map((a, i) =>
          i === apptIndex ? { ...a, availableSlots: slotObjs } : a
        )
      );
    } else {
      setAppointments((prev) =>
        prev.map((a, i) =>
          i === apptIndex ? { ...a, availableSlots: [] } : a
        )
      );
    }
  } catch (error) {
    console.error("Failed to fetch available slots:", error);
  }
};




const fetchEmployeesByCenter = async (centerId) => {
  try {
    const response = await postApi(config.getDetailsForServiceCreate, {
      centerId,
    });
    const employees = response?.result?.employeeModel || [];
    setCenterEmployees(
      employees.map((emp) => ({
        label: emp.name,
        value: emp._id,       // employeeId
        userId: emp.userId,   // ✅ store employee's userId
          status:emp.status
      }))
    );
  } catch (error) {
    console.error("Failed to fetch employees for center", error);
  }
};



  const handleEventClick = (clickInfo) => {
    setSelectedEvent(clickInfo.event);
    setShowEventModal(true);
  };

  useEffect(() => {
    if (employeeId) fetchEmployeeDetails();
  }, [employeeId]);

  const fetchEmployeeDetails = async () => {
    try {
      const endpoint = config.viewEmployee;

      const response = await postApi(endpoint, employeeId);
      if (response.statusCode === 201) {
        setEmployee(response.data?.employeeData?.[0]);
        setUserId(response.data?.employeeData[0]?.user?._id);
      }
    } catch (error) {
      console.error("Error fetching employee:", error);
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await postApi(config.AllUsers, {});

        setUsers(res.data || []);
      } catch (error) {
        console.error("Failed to fetch users", error);
      }
    };

    fetchUsers();
  }, []);

  const fetchServices = async (centerId = "") => {
    try {
      const res = await postApi(config.AllServices, {
        page: 1,
        pageSize: 100,
        centerId: centerId || undefined, // only pass if selected
      });
      setServices(res.data || []);
    } catch (error) {
      console.error("Failed to fetch services", error);
    }
  };

  // fetch all services initially
  useEffect(() => {
    fetchServices();
  }, []);

useEffect(() => {
  if (employeeId) {
    fetchAppointments([employeeId], calendarRange.start, calendarRange.end);
  }
}, [employeeId, calendarRange]);

const fetchAppointments = async (practitionerIds, startDate, endDate) => {
  try {
    let combinedEvents = [];

    // 1. Unavailable dates
    const unavailableRes = await postApi(config.findUnavailableDates, {
      slotsPayload: practitionerIds.map((empId) => ({
        employeeId: empId,
        startDate,
        endDate,
      })),
    });

    if (unavailableRes?.statusCode === 200) {
  const allDates = [
  ...new Set(unavailableRes.data.flatMap((d) => d.unavailableDates)),
];
setUnavailableDates(allDates);
    }

    // 2. Booked appointments
    for (const empId of practitionerIds) {
      const res = await postApi(config.findAppointment, { employeeId: empId });

      if (res?.statusCode === 200 && res.data?.length > 0) {
        const appointments = res.data || [];

const mappedEvents = appointments.map((appt) => {
  const [hour, minute] = appt.time.split(":").map(Number);
  const start = DateTime.fromISO(appt.date).set({ hour, minute });
  const end = start.plus({ minutes: appt.duration || 30 });

  return {
    id: `${empId}-${appt._id}`,
    title: appt.type === "break" ? `Break — ${appt.note}` : `${appt.service?.name || "Service"} — ${appt.user?.name || "Client"}`,
    start: start.toISO(),
    end: end.toISO(),
    backgroundColor: appt.type === "break" ? "#ffc107" : (appt.status === "notPaid" ? "#dc3545" : "#198754"),
    borderColor: "#000",
    extendedProps: {
      ...appt,
      practitionerId: empId,
    },
  };
});



        combinedEvents = [...combinedEvents, ...mappedEvents];
      }
    }

    setEvents(combinedEvents);
  } catch (error) {
    console.error("Failed to fetch appointments:", error);
  }
};





const handleDateClick = (arg) => {
  const date = DateTime.fromISO(arg.dateStr).toISODate();
  const today = DateTime.now().toISODate();

  if (unavailableDates.includes(date) || date < today) {
    return;
  }

  const clickedTime = DateTime.fromISO(arg.dateStr);
  setSelectedSlot(clickedTime);

  // ✅ Open choice modal instead of appointment modal
  setShowChoiceModal(true);
};



  const handleClose = () => {
    setShowModal(false);
    setSelectedSlot(null);
  };


const isAppointmentValid = (appt) => {
  return (
    appt.centerId &&
    appt.serviceId &&
    appt.employeeId &&
    appt.userId &&
    appt.note &&
    appt.time &&
    appt.duration &&
    Number(appt.duration) > 0 &&
    selectedSlot // date must exist
  );
};

const allAppointmentsValid = appointments.every(isAppointmentValid);

  return (
    <Container fluid>
        <style jsx global>{`
 .unavailable-day {
  opacity: 0.4;
  background-color: #f8d7da !important;
}

.unavailable-slot {
  opacity: 0.4;
  background-color: #f8d7da !important;
}
.hover-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.hover-card:hover {
  transform: translateY(-5px);
  box-shadow: 0px 6px 16px rgba(0, 0, 0, 0.15);
}

/* Fix calendar event overflow in month view */
.fc-daygrid-event {
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  white-space: normal !important;
  word-wrap: break-word !important;
  max-width: 100% !important;
}

.fc-daygrid-event-frame {
  overflow: hidden !important;
  max-width: 100% !important;
}

.fc-event-title {
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  word-wrap: break-word !important;
  white-space: normal !important;
  max-width: 100% !important;
}

.fc-daygrid-day-events {
  overflow: hidden !important;
}

.fc-daygrid-day-frame {
  overflow: hidden !important;
}

/* Ensure event content stays within cell */
.fc-daygrid-day-events > .fc-daygrid-event {
  margin: 1px 0 !important;
  max-width: calc(100% - 2px) !important;
}

.fc-daygrid-event-harness {
  max-width: 100% !important;
}

/* Month view event styling */
.fc-daygrid-event .fc-event-main {
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  word-wrap: break-word !important;
  white-space: normal !important;
  padding: 2px 4px !important;
  box-sizing: border-box !important;
}

`}</style>
      <Row className="mt-4">
        <Col>
          <Card className="p-4">
            <Card.Body>
              <Row className="align-items-center">
                

                <Col md={6}>

                 <h4 className="mb-0">
  Practitioner Calendar
  {employee?.user?.name && (
    <span
      style={{
        marginLeft: "8px",
        fontSize: "1.1rem",
        fontWeight: "500",
        color: "#666",
      }}
    >
      — {employee.user.name}
    </span>
  )}
</h4>

                </Col>

                <Col md={6} className="text-end">
  <Button
    variant="primary"
    onClick={() => window.location.href = "/admin/users/Practioners"}
    style={{float:'right'}}
  >
    ← Back 
  </Button>
</Col>
               
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row className="mt-4 mb-5">
        <Col>
          <Card className="p-4">
            <Card.Body>
              <FullCalendar
                plugins={[
                  dayGridPlugin,
                  timeGridPlugin,
                  interactionPlugin,
                  listPlugin,
                ]}
                initialView="timeGridWeek"
                eventClick={handleEventClick}
                headerToolbar={{
                  left: "prev,next today",
                  center: "title",
                  right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
                }}
datesSet={(arg) => {
  const today = DateTime.now();
  let start, end;

  if (arg.view.type === "dayGridMonth") {
    // Use currentStart (first day of the actual month), not arg.start (which may be Aug 31)
    const currentMonth = DateTime.fromJSDate(arg.view.currentStart).month;
    const currentYear = DateTime.fromJSDate(arg.view.currentStart).year;

    const monthStart = DateTime.local(currentYear, currentMonth, 1);
    const monthEnd = monthStart.endOf("month");

    if (today.month === currentMonth && today.year === currentYear) {
      start = today.toISODate();       // start today if in current month
      end = monthEnd.toISODate();
    } else {
      start = monthStart.toISODate();  // navigated month
      end = monthEnd.toISODate();
    }
  } 
  else if (arg.view.type.includes("Week")) {
    const weekStart = DateTime.fromJSDate(arg.start).startOf("week");
    const weekEnd = weekStart.endOf("week");

    if (today >= weekStart && today <= weekEnd) {
      start = today.toISODate();
      end = weekEnd.toISODate();
    } else {
      start = weekStart.toISODate();
      end = weekEnd.toISODate();
    }
  } 
  else {
    // fallback (day or list)
    start = DateTime.fromJSDate(arg.start).toISODate();
    end = DateTime.fromJSDate(arg.end).minus({ days: 1 }).toISODate();
  }

  console.log("📅 Computed range:", { start, end });

  setCalendarRange({ start, end });
if (employeeId) {
  fetchAppointments([employeeId], start, end);
}

}}






eventContent={(arg) => {
  const viewType = arg.view.type; // dayGridMonth | timeGridWeek | timeGridDay | listWeek

  // BREAK EVENTS
  if (arg.event.extendedProps?.type === "break") {
    return {
      html: `
        <div style="font-size: 0.8rem; font-weight: bold; color: #d35400;">
          ${arg.event.extendedProps?.note || "Break"}
        </div>
      `
    };
  }

  const service = arg.event.extendedProps?.service?.name || "";
  const client = arg.event.extendedProps?.user?.name || "";

  // ✔ WEEK & DAY VIEWS → ONLY show service + client
  if (viewType === "timeGridWeek" || viewType === "timeGridDay") {
    return {
      html: `
        <div style="font-size: 0.75rem; font-weight: 600;">
          ${service}
        </div>
        <div style="font-size: 0.7rem;">
          ${client}
        </div>
      `
    };
  }

  // ✔ MONTH VIEW → return HTML string with proper constraints
  if (viewType === "dayGridMonth") {
    const employeeName = arg.event.extendedProps?.employee?.userDetails?.name || "N/A";
    const price = arg.event.extendedProps?.price || "0";
    const note = arg.event.extendedProps?.note || "";
    
    // Escape HTML for title attribute
    const escapeHtml = (text) => {
      if (!text) return "";
      return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    };
    
    // Truncate long text to prevent overflow
    const truncateText = (text, maxLength) => {
      if (!text) return "";
      return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
    };
    
    const serviceShort = truncateText(service, 12);
    const clientShort = truncateText(client, 12);
    const employeeShort = truncateText(employeeName, 12);
    
    // Build tooltip text
    const tooltipText = `${escapeHtml(service)} | ${escapeHtml(client)} | ${escapeHtml(employeeName)} | $${price}${note ? ' | ' + escapeHtml(note) : ''}`;
    
    return {
      html: `
        <div style="
          font-size: 0.7rem;
          line-height: 1.3;
          padding: 2px 4px;
          overflow: hidden;
          text-overflow: ellipsis;
          word-wrap: break-word;
          white-space: normal;
          max-width: 100%;
          box-sizing: border-box;
          cursor: pointer;
        " title="${tooltipText}">
          <div style="font-weight: 600; margin-bottom: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            ${escapeHtml(serviceShort)}
          </div>
          <div style="font-size: 0.65rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            ${escapeHtml(clientShort)}
          </div>
          <div style="font-size: 0.65rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            $${price}
          </div>
        </div>
      `
    };
  }

  // Default fallback for other views
  return {
    html: `
      <div style="font-size: 0.75rem; font-weight: 600;">
        ${service}
      </div>
      <div style="font-size: 0.7rem;">
        ${client}
      </div>
    `
  };
}}

                allDaySlot={false}
                slotMinTime="00:00:00"
                slotMaxTime="22:00:00"
                events={events}
                selectable={true}
                selectMirror={true}
               dateClick={handleDateClick}
selectAllow={(selectInfo) => {
  const date = DateTime.fromJSDate(selectInfo.start).toISODate();
  const today = DateTime.now().toISODate();
  // block if in unavailableDates OR in the past
  return !unavailableDates.includes(date) && date >= today;
}}

slotLaneClassNames={(arg) => {
  const date = DateTime.fromJSDate(arg.date).toISODate();
  const today = DateTime.now().toISODate();
  if (unavailableDates.includes(date) || date < today) {
    return ["unavailable-slot"];
  }
  return [];
}}


dayCellClassNames={(arg) => {
  const date = DateTime.fromJSDate(arg.date).toISODate();
  const today = DateTime.now().toISODate();
  if (unavailableDates.includes(date) || date < today) {
    return ["unavailable-day"];
  }
  return [];
}}

                height="auto"
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Modal
  show={showChoiceModal}
  onHide={() => setShowChoiceModal(false)}
  centered
>
  <Modal.Header closeButton>
    <Modal.Title>Select an Action</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <Row className="g-3">
      <Col md={6}>
        <Card
          className="text-center shadow-sm p-3 hover-card"
          onClick={() => {
            setShowChoiceModal(false);
            setShowModal(true); 
          }}
          style={{ cursor: "pointer" }}
        >
          <Card.Body>
            <i className="bi bi-calendar-plus" style={{ fontSize: "2rem", color: "#198754" }}></i>
            <h5 className="mt-2">Add Appointment</h5>
            <p className="text-muted small">Book a new appointment for a client</p>
          </Card.Body>
        </Card>
      </Col>

      <Col md={6}>
       <Card
  className="text-center shadow-sm p-3 hover-card"
  onClick={() => {
    setShowChoiceModal(false);
    setShowTaskModal(true); 
  }}
  style={{ cursor: "pointer" }}
>
  <Card.Body>
    <i className="bi bi-clipboard-check" style={{ fontSize: "2rem", color: "#0d6efd" }}></i>
    <h5 className="mt-2">Add Personal Task</h5>
    <p className="text-muted small">Create a reminder or personal note</p>
  </Card.Body>
</Card>

      </Col>
    </Row>
  </Modal.Body>
</Modal>


<Modal show={showTaskModal} onHide={() => setShowTaskModal(false)} size="lg" centered>
  <Modal.Header closeButton>
    <Modal.Title>Add Personal Task</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <Form>
      <Row className="mt-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>
              Center <span style={{ color: "red" }}>*</span>
            </Form.Label>
            <Form.Select
              required
              value={taskForm.centerId}
              onChange={(e) => {
                const val = e.target.value;
                setTaskForm((prev) => ({ ...prev, centerId: val, serviceId: "", employeeId: "" }));
                fetchEmployeesByCenter(val);
                fetchServices(val);
              }}
            >
              <option value="">Select Center</option>
              {centerOptions.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>

        <Col md={6}>
          <Form.Group>
            <Form.Label>
              Practitioner / Employee <span style={{ color: "red" }}>*</span>
            </Form.Label>
            <Form.Select
              required
              value={taskForm.employeeId}
              onChange={(e) => {
                const val = e.target.value;
                const emp = centerEmployees.find((emp) => emp.value === val);
                setTaskForm((prev) => ({
                  ...prev,
                  employeeId: val,
                  userId: emp?.userId || ""
                }));
              }}
            >
              <option value="">Select Employee</option>
            {centerEmployees
  .filter((emp) => emp.status === 1)
  .map((emp) => (
    <option key={emp.value} value={emp.value}>
      {emp.label}
    </option>
  ))}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      <Row className="mt-3">
        <Col md={12}>
          <Form.Group>
            <Form.Label>
              Note <span style={{ color: "red" }}>*</span>
            </Form.Label>
            <Form.Control
              as="textarea"
              required
              value={taskForm.note}
              onChange={(e) => setTaskForm((prev) => ({ ...prev, note: e.target.value }))}
            />
          </Form.Group>
        </Col>
      </Row>

      <Row className="mt-3">
        <Col md={4}>
          <Form.Group>
            <Form.Label>
              Date <span style={{ color: "red" }}>*</span>
            </Form.Label>
            <Form.Control type="text" value={selectedSlot?.toFormat("MMM d, yyyy") || ""} disabled />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <Form.Label>
              Time <span style={{ color: "red" }}>*</span>
            </Form.Label>
            <Form.Control
              type="time"
              required
              value={taskForm.time || ""}
              onChange={(e) => setTaskForm((prev) => ({ ...prev, time: e.target.value }))}
            />
          </Form.Group>
        </Col>
      </Row>

      <Row className="mt-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>
              Duration (mins) <span style={{ color: "red" }}>*</span>
            </Form.Label>
            <Form.Control
              type="number"
              min="1"
              required
              value={taskForm.duration}
              onChange={(e) => setTaskForm((prev) => ({ ...prev, duration: e.target.value }))}
            />
          </Form.Group>
        </Col>
      </Row>
    </Form>
  </Modal.Body>

  <Modal.Footer>
    <Button variant="secondary" onClick={() => setShowTaskModal(false)}>
      Cancel
    </Button>
    <Button
      variant="success"
      onClick={async () => {
        // Frontend validation
        if (!taskForm.centerId) return alert("Center is required.");
        if (!taskForm.employeeId) return alert("Employee is required.");
        if (!taskForm.note) return alert("Note is required.");
        if (!taskForm.time) return alert("Time is required.");
        if (!selectedSlot) return alert("Date is required.");
        if (!taskForm.duration) return alert("Duration is required.");

        const payload = {
          serviceId: taskForm.serviceId,
          employeeId: taskForm.employeeId,
          userId: taskForm.userId,
          note: taskForm.note,
          centerId: taskForm.centerId,
          addonId: taskForm.addonId,
          duration: parseInt(taskForm.duration),
          price: parseFloat(taskForm.price),
          date: selectedSlot ? selectedSlot.toISODate() : null,
          time: taskForm.time || null,
          deposit: 0,
          repeat: "Off",
        };

        try {
          const response = await postApi(config.addBreak, payload);
         if (response.statusCode === 201 || response.statusCode === 200) {
  alert("Task created successfully!");
  setShowTaskModal(false);

  // ✅ Refresh the calendar immediately
  if (employeeId) {
    await fetchAppointments([employeeId], calendarRange.start, calendarRange.end);
  }
}
 else {
            alert(`Task creation failed: ${response.message || "Unknown error"}`);
          }
        } catch (error) {
          console.error("Task creation failed:", error);
          alert("Error creating task. Please try again later.");
        }
      }}
    >
      Save Task
    </Button>
  </Modal.Footer>
</Modal>




      <Modal show={showModal} onHide={handleClose} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            Book Appointment with {employee?.user?.name},
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Accordion alwaysOpen>
              {appointments.map((appt, index) => (
                <Accordion.Item eventKey={index.toString()} key={index}>
                  <Accordion.Header>
                    Appointment {index + 1} —{" "}
                    {appt.serviceId
                      ? services.find((s) => s._id === appt.serviceId)?.name
                      : "Select Service"}
                  </Accordion.Header>
                  <Accordion.Body>
                    <Row>
                      {/* Center */}
                      <Col md={6}>
                     <Form.Group>
  <Form.Label>
    Center <span style={{ color: "red" }}>*</span>
  </Form.Label>
  <Form.Select
    required
    isInvalid={wasSubmitted && !appt.centerId}
    value={appt.centerId}
    onChange={(e) => {
      const val = e.target.value;
      setAppointments((prev) =>
        prev.map((a, i) =>
          i === index
            ? { ...a, centerId: val, serviceId: "", employeeId: "" }
            : a
        )
      );
      fetchEmployeesByCenter(val);
      fetchServices(val);
    }}
  >
    <option value="">Select Center</option>
    {centerOptions.map((c) => (
      <option key={c.value} value={c.value}>
        {c.label}
      </option>
    ))}
  </Form.Select>
  <Form.Control.Feedback type="invalid">
    Center is required
  </Form.Control.Feedback>
</Form.Group>

                      </Col>

                      {/* Service */}
                      <Col md={6}>
                    <Form.Group>
  <Form.Label>
    Service <span style={{ color: "red" }}>*</span>
  </Form.Label>
  <Form.Select
    required
    isInvalid={wasSubmitted && !appt.serviceId}
    value={appt.serviceId}
    onChange={async (e) => {
      const value = e.target.value;
      const selectedService = services.find((s) => s._id === value);
      setAppointments((prev) =>
        prev.map((a, i) =>
          i === index
            ? { ...a, serviceId: value, cleanupTime: selectedService?.cleanup_time || 0 }
            : a
        )
      );
      if (value && appt.employeeId && selectedSlot) {
        await fetchAvailableSlots(value, appt.employeeId, selectedSlot.toISODate(), index);
      }
    }}
    disabled={!appt.centerId}
  >
    <option value="">Select Service</option>
    {services.filter((emp)=>emp.status === 1).map((s) => (
      <option key={s._id} value={s._id}>
        {s.name}
      </option>
    ))}
  </Form.Select>
  <Form.Control.Feedback type="invalid">
    Service is required
  </Form.Control.Feedback>
</Form.Group>


                        <Button
                          variant="link"
                          onClick={() => {
                            fetchAddons();
                            setActiveAddonIndex(index);
                            setShowAddonModal(true);
                          }}
                        >
                          + Add Add-on
                        </Button>
                      </Col>
                    </Row>

                    <Row className="mt-3">
                      {/* Employee */}
                      <Col md={6}>
                    <Form.Group>
  <Form.Label>
    Practitioner / Employee <span style={{ color: "red" }}>*</span>
  </Form.Label>
  <Form.Select
    required
   isInvalid={wasSubmitted && !appt.employeeId}

    value={appt.employeeId}
    onChange={async (e) => {
      const val = e.target.value;
      const emp = centerEmployees.find((emp) => emp.value === val);
      setAppointments((prev) =>
        prev.map((a, i) =>
          i === index ? { ...a, employeeId: val, employeeUserId: emp?.userId || "" } : a
        )
      );
      if (appt.serviceId && val && selectedSlot) {
        await fetchAvailableSlots(appt.serviceId, val, selectedSlot.toISODate(), index);
      }
    }}
  >
    <option value="">Select Employee</option>
    {centerEmployees.filter((emp)=>emp.status===1).map((emp) => (
      <option key={emp.value} value={emp.value}>
        {emp.label}
      </option>
    ))}
  </Form.Select>
  <Form.Control.Feedback type="invalid">
    Employee is required
  </Form.Control.Feedback>
</Form.Group>

                      </Col>

                      {/* User */}
                      <Col md={6}>
                     <Form.Group>
  <Form.Label>
    Select User <span style={{ color: "red" }}>*</span>
  </Form.Label>
  <Form.Select
    required
    isInvalid={wasSubmitted && !appt.userId}

    value={appt.userId}
    onChange={(e) =>
      setAppointments((prev) =>
        prev.map((a, i) =>
          i === index ? { ...a, userId: e.target.value } : a
        )
      )
    }
  >
    <option value="">Select a user</option>
    {users.map((user) => (
      <option key={user._id} value={user._id}>
        {user.name || user.email}
      </option>
    ))}
  </Form.Select>
  <Form.Control.Feedback type="invalid">
    User is required
  </Form.Control.Feedback>
</Form.Group>

                      </Col>
                    </Row>

                    <Row className="mt-3">
                      {/* Note */}
                      <Col md={6}>
              <Form.Group>
  <Form.Label>
    Appointment Note <span style={{ color: "red" }}>*</span>
  </Form.Label>
  <Form.Control
    as="textarea"
    required
    isInvalid={wasSubmitted && !appt.note}
    value={appt.note}
    onChange={(e) =>
      setAppointments((prev) =>
        prev.map((a, i) =>
          i === index ? { ...a, note: e.target.value } : a
        )
      )
    }
  />
  <Form.Control.Feedback type="invalid">
    Note is required
  </Form.Control.Feedback>
</Form.Group>

                      </Col>

                      {/* Customer
                      // <Col md={6}>
                      //   <Form.Group>
                      //     <Form.Label>Customer</Form.Label>
                      //     <Form.Control
                      //       placeholder="Name, Phone, or Email"
                      //       value={customer}
                      //       onChange={(e) => setCustomer(e.target.value)}
                      //     />
                      //   </Form.Group>
                      // </Col> */}
                    </Row>

                    <Row className="mt-3">
                      {/* Date */}
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label>Date</Form.Label>
                          <Form.Control
                            type="text"
                            value={selectedSlot?.toFormat("MMM d, yyyy") || ""}
                            disabled
                          />
                        </Form.Group>
                      </Col>

                      {/* Time */}
                      <Col md={4}>
                       <Form.Group>
  <Form.Label>
    Time <span style={{ color: "red" }}>*</span>
  </Form.Label>
<Form.Select
  required
 isInvalid={wasSubmitted && !appt.time}
  value={appt.time || ""}
  onChange={(e) =>
    setAppointments((prev) =>
      prev.map((a, i) =>
        i === index ? { ...a, time: e.target.value } : a
      )
    )
  }
>
  {appt.availableSlots && appt.availableSlots.length > 0 ? (
    <>
      <option value="">Select Time</option>
      {appt.availableSlots.map((slot, i) => (
        <option key={i} value={slot.startTime}>
          {DateTime.fromISO(slot.startTime).toFormat("hh:mm a")}
        </option>
      ))}
    </>
  ) : (
    <option disabled>No slot is available for this practitioner</option>
  )}
</Form.Select>

  <Form.Control.Feedback type="invalid">
    Time is required
  </Form.Control.Feedback>
</Form.Group>

                      </Col>

                      {/* Deposit */}
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label>Deposit Due</Form.Label>
                          <Form.Control defaultValue="$0" />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row className="mt-3">
                      {/* Price */}
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Price</Form.Label>
                          <Form.Control
                            type="number"
                            value={appt.price}
                            onChange={(e) =>
                              setAppointments((prev) =>
                                prev.map((a, i) =>
                                  i === index
                                    ? { ...a, price: e.target.value }
                                    : a
                                )
                              )
                            }
                          />
                        </Form.Group>
                      </Col>

                      {/* Duration */}
                      <Col md={6}>
                    <Form.Group>
  <Form.Label>
    Duration (mins) <span style={{ color: "red" }}>*</span>
  </Form.Label>
<Form.Control
  type="number"
  min="1"
  required
  isInvalid={wasSubmitted && (!appt.duration || Number(appt.duration) <= 0)}
  value={appt.duration}
  onChange={(e) =>
    setAppointments((prev) =>
      prev.map((a, i) =>
        i === index ? { ...a, duration: e.target.value } : a
      )
    )
  }
/>

  <Form.Control.Feedback type="invalid">
    Duration must be greater than 0
  </Form.Control.Feedback>
</Form.Group>

                      </Col>
                    </Row>

                    {/* Attach Files */}
                    <Form.Group className="mt-3">
                      <Form.Label>Attach Files</Form.Label>
                      <Form.Control
                        type="file"
                        onChange={(e) =>
                          setSelectedFile(e.target.files?.[0] || null)
                        }
                      />
                    </Form.Group>

                    {/* Repeat */}
                    {/* <Form.Group className="mt-3">
                      <Form.Label>Repeat</Form.Label>
                      <div>
                        {["Off", "Daily", "Weekly", "Monthly", "Yearly"].map(
                          (freq) => (
                            <Form.Check
                              inline
                              name={`repeat-${index}`}
                              label={freq}
                              type="radio"
                              key={freq}
                              defaultChecked={freq === "Off"}
                            />
                          )
                        )}
                      </div>
                    </Form.Group> */}

                    <div className="d-flex justify-content-end mt-3">
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => removeAppointmentForm(index)}
                      >
                        Remove Appointment
                      </Button>
                    </div>
                  </Accordion.Body>
                </Accordion.Item>
              ))}
            </Accordion>

            <div className="mt-3">
              <Button variant="link" onClick={addAppointmentForm}>
                + Add Another Appointment
              </Button>
            </div>

            {/* Total price & duration */}
            <div className="mt-3">
              <h6>
                Total Duration:{" "}
                {appointments.reduce((sum, a) => {
                  const addon = addons.find((ad) => ad._id === a.addonId);
                  return (
   sum +
   Number(a.duration || 0) +
   Number(a.cleanupTime || 0) + 
   (addon ? Number(addon.duration || 0) : 0)
 );
                }, 0)}{" "}
                mins
              </h6>
              <h6>
                Total Price: $
                {appointments
                  .reduce((sum, a) => {
                    const addon = addons.find((ad) => ad._id === a.addonId);
                    return (
                      sum +
                      Number(a.price || 0) +
                      (addon ? Number(addon.price || 0) : 0)
                    );
                  }, 0)
                  .toFixed(2)}
              </h6>
            </div>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
<Button
  variant="success"
  disabled={!allAppointmentsValid}   // 🔥 disable until valid
  onClick={async () => {
    const start = selectedSlot;
    const totalDuration = appointments.reduce((sum, a) => {
      const addon = addons.find((ad) => ad._id === a.addonId);
      return (
        sum +
        Number(a.duration || 0) +
        (addon ? Number(addon.duration || 0) : 0)
      );
    }, 0);
    const end = start.plus({ minutes: totalDuration || 30 });

    const payload = {
      appointments: appointments.map((a) => {
        const slotDate = a.time ? DateTime.fromISO(a.time) : null;
        return {
          serviceId: a.serviceId,
          employeeId: a.employeeId,
          userId: a.userId,
          note: a.note,
          centerId: a.centerId,
          addonId: a.addonId,
          duration: parseInt(a.duration) + parseInt(a.cleanupTime || 0),
          price: parseFloat(a.price),
          date: slotDate ? slotDate.toISODate() : null,
          time: slotDate ? slotDate.toFormat("HH:mm") : null,
          deposit: 0,
          repeat: "Off",
        };
      }),
    };

    try {
      const response = await postApiWithFile(config.addAppointment, payload, {
        file: selectedFile,
      });
    if (response.statusCode === 201) {
  alert(response.message);
  setShowModal(false);
  setCustomer("");

  // ✅ Immediately refresh the calendar
  if (employeeId) {
    await fetchAppointments([employeeId], calendarRange.start, calendarRange.end);
  }
} else {
  alert("Booking failed: " + response.message);
}

    } catch (error) {
      console.error("Booking failed:", error);
      alert("Error booking appointment.");
    }
  }}
>
  Book
</Button>

        </Modal.Footer>
      </Modal>

      <Modal
        show={showEventModal}
        onHide={() => setShowEventModal(false)}
        size="md"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Appointment Details</Modal.Title>
        </Modal.Header>
    <Modal.Body>
  {selectedEvent && (
    <>
      {selectedEvent.extendedProps?.type === "break" ? (
        <>
          <p>
            <strong>Note:</strong> {selectedEvent.extendedProps?.note}
          </p>
           <p><strong>Employee:</strong> {selectedEvent.extendedProps?.employee?.userDetails?.name || "N/A"}</p>
          <p>
            <strong>Start:</strong>{" "}
            {DateTime.fromISO(selectedEvent.startStr).toFormat("fff")}
          </p>
          <p>
            <strong>End:</strong>{" "}
            {DateTime.fromISO(selectedEvent.endStr).toFormat("fff")}
          </p>
          <p>
            <strong>Duration:</strong> {selectedEvent.extendedProps?.duration} mins
          </p>
        </>
      ) : (
        <>
          <p><strong>Service:</strong> {selectedEvent.extendedProps?.service?.name}</p>
          <p><strong>Client:</strong> {selectedEvent.extendedProps?.user?.name} ({selectedEvent.extendedProps?.user?.email})</p>
          <p><strong>Employee:</strong> {selectedEvent.extendedProps?.employee?.userDetails?.name || "N/A"}</p>
          <p><strong>Start:</strong> {DateTime.fromISO(selectedEvent.startStr).toFormat("fff")}</p>
          <p><strong>End:</strong> {DateTime.fromISO(selectedEvent.endStr).toFormat("fff")}</p>
          <p><strong>Duration:</strong> {selectedEvent.extendedProps?.duration} mins</p>
          <p><strong>Price:</strong> ${selectedEvent.extendedProps?.price}</p>
          <p><strong>Status:</strong> {selectedEvent.extendedProps?.status}</p>
          {selectedEvent.extendedProps?.note && (
            <p><strong>Note:</strong> {selectedEvent.extendedProps.note}</p>
          )}
        </>
      )}
    </>
  )}
</Modal.Body>


       <Modal.Footer>
  <Button variant="secondary" onClick={() => setShowEventModal(false)}>
    Close
  </Button>

{selectedEvent?.extendedProps?.type === "break" && (
  <>
    <Button
      variant="warning"
      onClick={() => {
        const props = selectedEvent.extendedProps;
        setEditBreakForm({
          _id: props?._id,
          employeeId: props?.employee?._id || "",
          userId: props?.user?._id || "",
          note: props?.note || "",
          date: DateTime.fromISO(selectedEvent.startStr).toISODate(),
          time: DateTime.fromISO(selectedEvent.startStr).toFormat("HH:mm"),
          duration: props?.duration || 30,
        });
        setShowEventModal(false);
        setShowEditBreakModal(true);
      }}
    >
      Edit Break
    </Button>
    <Button
      variant="danger"
      onClick={async () => {
        try {
          const payload = { _id: selectedEvent.extendedProps?._id };
          const res = await postApi(config.deleteBreak, payload);
          if (res.statusCode === 200) {
            alert("Break deleted successfully!");
            setEvents((prev) =>
              prev.filter((e) => e.extendedProps?._id !== payload._id)
            );
            setShowEventModal(false);
          } else {
            alert(res.message || "Failed to delete break");
          }
        } catch (error) {
          console.error("Delete break error:", error);
          alert("Error deleting break. Please try again later.");
        }
      }}
    >
      Delete Break
    </Button>
  </>
)}

</Modal.Footer>

      </Modal>
      <Modal
        show={showAddonModal}
        onHide={() => setShowAddonModal(false)}
        centered
        backdrop="static"
        backdropClassName="blur-backdrop"
      >
        <Modal.Header closeButton>
          <Modal.Title>Select Add-on</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {addons.length === 0 ? (
            <p className="text-muted">No add-ons available</p>
          ) : (
            <div className="addon-list">
              {addons.map((addon) => (
                <div
                  key={addon._id}
                  className={`addon-row d-flex justify-content-between align-items-start p-3 mb-3 rounded shadow-sm ${
                    appointments[activeAddonIndex]?.addonId === addon._id
                      ? "selected-addon"
                      : ""
                  }`}
                  onClick={() => {
                    const updated = [...appointments];
                    updated[activeAddonIndex].addonId = addon._id;
                    setAppointments(updated);
                  }}
                  style={{ cursor: "pointer" }}
                >
                  {/* Left side */}
                  <div>
                    <h6 className="mb-1">{addon.name}</h6>
                    {addon.note && (
                      <p className="mb-0 text-muted small">{addon.note}</p>
                    )}
                  </div>

                  {/* Right side */}
                  <div className="text-end">
                    <p className="mb-1">
                      <strong>{addon.duration} mins</strong>
                    </p>
                    <p className="mb-0 text-success">
                      <strong>${addon.price}</strong>
                    </p>
                  </div>

                  {/* Radio */}
                  <div className="ms-3">
                    <Form.Check
                      type="radio"
                      name="addon"
                      checked={
                        appointments[activeAddonIndex]?.addonId === addon._id
                      }
                      onChange={() => {
                        const updated = [...appointments];
                        updated[activeAddonIndex].addonId = addon._id;
                        setAppointments(updated);
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddonModal(false)}>
            Cancel
          </Button>
          <Button
            variant="success"
            onClick={() => setShowAddonModal(false)}
            disabled={!appointments[activeAddonIndex]?.addonId}
          >
            Select Add-on
          </Button>
        </Modal.Footer>
      </Modal>

<Modal show={showEditBreakModal} onHide={() => setShowEditBreakModal(false)} centered>
  <Modal.Header closeButton>
    <Modal.Title>Edit Break</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <Form>
      {/* Note */}
      <Form.Group className="mb-3">
        <Form.Label>
          Note <span style={{ color: "red" }}>*</span>
        </Form.Label>
        <Form.Control
          type="text"
          value={editBreakForm.note}
          isInvalid={!editBreakForm.note}
          onChange={(e) => setEditBreakForm({ ...editBreakForm, note: e.target.value })}
        />
        <Form.Control.Feedback type="invalid">Note is required</Form.Control.Feedback>
      </Form.Group>

      {/* Date */}
      <Form.Group className="mb-3">
        <Form.Label>
          Date <span style={{ color: "red" }}>*</span>
        </Form.Label>
        <Form.Control
          type="date"
          value={editBreakForm.date}
          isInvalid={!editBreakForm.date}
          onChange={(e) => setEditBreakForm({ ...editBreakForm, date: e.target.value })}
        />
        <Form.Control.Feedback type="invalid">Date is required</Form.Control.Feedback>
      </Form.Group>

      {/* Time */}
      <Form.Group className="mb-3">
        <Form.Label>
          Time <span style={{ color: "red" }}>*</span>
        </Form.Label>
        <Form.Control
          type="time"
          value={editBreakForm.time}
          isInvalid={!editBreakForm.time}
          onChange={(e) => setEditBreakForm({ ...editBreakForm, time: e.target.value })}
        />
        <Form.Control.Feedback type="invalid">Time is required</Form.Control.Feedback>
      </Form.Group>

      {/* Duration */}
      <Form.Group className="mb-3">
        <Form.Label>
          Duration (mins) <span style={{ color: "red" }}>*</span>
        </Form.Label>
        <Form.Control
          type="number"
          min="1"
          value={editBreakForm.duration}
          isInvalid={!editBreakForm.duration || Number(editBreakForm.duration) <= 0}
          onChange={(e) => setEditBreakForm({ ...editBreakForm, duration: e.target.value })}
        />
        <Form.Control.Feedback type="invalid">
          Duration must be greater than 0
        </Form.Control.Feedback>
      </Form.Group>
    </Form>
  </Modal.Body>

  <Modal.Footer>
    <Button variant="secondary" onClick={() => setShowEditBreakModal(false)}>
      Cancel
    </Button>
    <Button
      variant="success"
      onClick={async () => {
        // 🚨 Frontend validation
        if (
          !editBreakForm.note ||
          !editBreakForm.date ||
          !editBreakForm.time ||
          !editBreakForm.duration ||
          Number(editBreakForm.duration) <= 0
        ) {
          alert("All fields are required. Please fill them before saving.");
          return;
        }

        try {
          const res = await postApi(config.editBreak, editBreakForm);
          if (res.statusCode === 200) {
            alert("Break updated successfully!");
            // Refresh calendar
         if (employeeId) {
  fetchAppointments([employeeId], calendarRange.start, calendarRange.end);
}

            setShowEditBreakModal(false);
          } else {
            alert(res.message || "Failed to update break");
          }
        } catch (error) {
          console.error("Edit break error:", error);
          alert("Error updating break. Please try again later.");
        }
      }}
    >
      Save Changes
    </Button>
  </Modal.Footer>
</Modal>


    </Container>
  );
}
