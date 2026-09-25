"use client";

import React, { useEffect, useState, useRef, useImperativeHandle } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Modal,
  Button,
  Form,
  Accordion,
  Spinner
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
import Link from "node_modules/next/link";
import Swal from "sweetalert2";
import {
  Elements,
  CardElement,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useLanguage } from "context/languageContext";
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
export default function PractitionerCalendar() {
  const { setCartCount } = useLanguage();
  const params = useParams();
  const employeeId = params?.id || "";
  const [Loader, setLoader] = useState(false)
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
  const [cardDetails, setCardDetails] = useState({
    nameOnCard: "",
    cardNumber: "",
    expiry: "",
    cvc: ""
  });
  const [cardValidation, setCardValidation] = useState({
    cardNumberComplete: false,
    expiryComplete: false,
    cvcComplete: false,
    cardNumberEmpty: true,
    expiryEmpty: true,
    cvcEmpty: true,
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
  const [allPractitioners, setAllPractitioners] = useState([]);
  const [selectedPractitioners, setSelectedPractitioners] = useState([]);
  const [showChoiceModal, setShowChoiceModal] = useState(false);

  const [showAddonModal, setShowAddonModal] = useState(false);
  const [addons, setAddons] = useState([]);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editAppointments, setEditAppointments] = useState(false);
  const [activeAppointmentKey, setActiveAppointmentKey] = useState("0");
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
    endTime: "",
    availableSlots: [],
  });
  const [searchValue, setSearchValue] = useState("");
  const cardRef = useRef(null);
  const [appointments, setAppointments] = useState([
    {
      centerId: "",
      serviceId: "",
      employeeId: "",
      availableSlots: [],
      duration: "0",
      userId: "", // ✅ added here
      price: "0.00",
      note: "",
      addonId: "",
    },
  ]);
  const [workingHours, setWorkingHours] = useState({
    start: "00:00:00",
    end: "23:59:59",
  });

  const [appointmentTypeSelectionModel, setAppointmentTypeSelectionModel] = useState(false)
  const [afterWorkingBookModel, setAafterWorkingBookModel] = useState(false)
  const [appointmentAfterWorking, setAppointmentAfterWorking] = useState([
    {
      centerId: "",
      serviceId: "",
      employeeId: "",
      availableSlots: [],
      duration: "0",
      userId: "", // ✅ added here
      price: "0.00",
      note: "",
      addonId: "",
    },
  ]);

  const addAppointmentForm = () => {
    setAppointments((prev) => {
      const nextIndex = String(prev.length);
      setActiveAppointmentKey(nextIndex);
      return [
        ...prev,
        {
          centerId: "",
          serviceId: "",
          employeeId: "",
          availableSlots: [],
          userId: "", // ✅ added here
          duration: "30",
          price: "0.00",
          note: "",
          addonId: "",
        },
      ];
    });
  };

  const handleCardSetup = async () => {
    // setFormError("");
    const cardNewRef = cardRef.current
    const stripe = await stripePromise;

    if (!stripe || !cardNewRef) {
      alert("Stripe not ready yet");
      return;
    }

    const elements = stripe.elements();
    const cardElement = cardNewRef.getCardNumberElement();
    if (!cardDetails.nameOnCard) {
      alert("Name on card is required.");
      return;
    }
    // if (!acceptPolicy) {
    //   alert("Please accept cancellation Policy.");
    //   return;
    // }

    try {
      // Call backend to create PaymentIntent or SetupIntent
      const response = await postApi(config.sendKey, {
        _id: appointments[0].userId
      });
      const data = response.data;

      if (!data.client_secret) {
        alert(data.message || "Payment setup failed");
        return;
      }

      const result = await stripe.confirmCardSetup(data.client_secret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: cardDetails.nameOnCard,
            address: {
              line1: "billingAddress.addressLine1",
              line2: "billingAddress.addressLine2",
            },
          },
        },
      });

      if (result.error) {
        alert(result.error.message);
      } else {
        console.log("Card setup successful:", result.setupIntent.payment_method);
        return result.setupIntent.payment_method
      }
    } catch (err) {
      console.log(err);
      alert("Something went wrong with card setup.");
    }
  };

  const removeAppointmentForm = (index) => {
    setAppointments((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      if (String(index) === activeAppointmentKey) {
        setActiveAppointmentKey(updated.length ? "0" : null);
      }
      return updated;
    });
  };
  console.log(appointments, "appointmentsappointmentsappointmentsappointments")
  useEffect(() => {
    const fetchDurations = async () => {
      // if (editAppointments) return;
      const updated = await Promise.all(
        appointments.map(async (appt) => {
          if (appt.employeeId && appt.serviceId) {
            try {
              console.log(editAppointments, "editAppointments0")
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
  }, [editAppointments, appointments.length && appointments?.map((a) => `${a.employeeId}-${a.serviceId}`).join(",")]);

  useEffect(() => {
    const fetchDurations = async () => {
      if (editAppointments) return;

      const updated = await Promise.all(
        appointmentAfterWorking.map(async (appt) => {
          if (appt.employeeId && appt.serviceId) {
            try {
              console.log(editAppointments, "editAppointments0")
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
      setAppointmentAfterWorking(updated);
    };

    fetchDurations();
  }, [editAppointments, appointmentAfterWorking.length && appointmentAfterWorking?.map((a) => `${a.employeeId}-${a.serviceId}`).join(",")]);

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

  const fetchAvailableSlots = async (serviceId, employeeId, date, apptIndex, userId) => {
    try {
      setLoader(true)
      // ✅ get that specific appointment
      const payload = {
        slotsPayload: [
          {
            serviceId,
            employeeId,
            userId: userId || "", // ✅ send the client's userId
            date,
          },
        ],
      };

      const res = await postApi(config.CheckSlots, payload);
      setLoader(false)
      if (res?.slots?.length) {
        const slotObjs = res.slots[0].slots;
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

  const checkAvailableNonWorkingHourSlot = async (serviceId, employeeId, date, apptIndex, userId) => {
    try {
      // ✅ get that specific appointment
      const payload = {
        slotsPayload: [
          {
            serviceId,
            employeeId,
            userId: userId || "", // ✅ send the client's userId
            date,
          },
        ],
      };

      const res = await postApi(config.checkAvailableNonWorkingHourSlot, payload);

      if (res?.slots?.length) {
        const slotObjs = res.slots[0].slots;
        setAppointmentAfterWorking((prev) =>
          prev.map((a, i) =>
            i === apptIndex ? { ...a, availableSlots: slotObjs } : a
          )
        );

      } else {
        setAppointmentAfterWorking((prev) =>
          prev.map((a, i) =>
            i === apptIndex ? { ...a, availableSlots: [] } : a
          )
        );
      }
    } catch (error) {
      console.error("Failed to fetch available slots:", error);
    }
  };



  const fetchEmployeesByCenter = async (serviceId) => {
    try {
      const response = await postApi(config.getDetailsForServiceEmployee, {
        serviceId,
      });
      const employees = response?.result?.employeeModel || [];
      setCenterEmployees(
        employees.map((emp) => ({
          label: emp.name,
          value: emp._id,       // employeeId
          userId: emp.userId,   // ✅ store employee's userId
          status: emp.status
        }))
      );
    } catch (error) {
      console.error("Failed to fetch employees for center", error);
    }
  };


  useEffect(() => {
    const fetchPractitioners = async () => {
      try {
        const res = await postApi(config.GetEmployee, {});
        const employees = res?.data?.employeeData || [];

        const options = employees
          .filter((emp) => emp.status === 1)
          .map((emp) => ({
            value: emp._id,
            label: emp.user?.name || "N/A",
          }));


        setAllPractitioners(options);

        // Default: no practitioners selected
        setSelectedPractitioners([]);
      } catch (err) {
        console.error("Failed to fetch practitioners:", err);
      }
    };

    fetchPractitioners();
  }, [employeeId]);

  const handleEventClick = (clickInfo) => {
    setSelectedEvent(clickInfo.event);
    setShowEventModal(true);
  };

  const fetchCenterWisePractitioners = async (centerId) => {
    try {
      const res = await postApi(config.getCenterWiseEmployee, { centerId: centerId });
      const employees = res?.data?.employeeData || [];
      console.log(employees, "employees")
      const options = employees
        .filter((emp) => emp.status === 1)
        .map((emp) => ({
          value: emp._id,
          label: emp.user?.name || "N/A",
          userId: emp.userId
        }));


      setAllPractitioners(options);

      // Default: no practitioners selected
      setSelectedPractitioners([]);
    } catch (err) {
      console.error("Failed to fetch practitioners:", err);
    }
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
    if (selectedPractitioners.length > 0) {
      const ids = selectedPractitioners.map((p) => p.value);
      fetchAppointments(ids, calendarRange.start, calendarRange.end);
    } else {
      setEvents([]);
      // refreshCalendar
    }
  }, [selectedPractitioners, calendarRange]);

  console.log(workingHours, "wwwwwwwwwwwwwww")
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
      if (unavailableRes.data.length > 0) {

        let minStart = "23:59";
        let maxEnd = "00:00";

        unavailableRes.data.forEach((item) => {
          const startTime = item?.employeeData?.working_time_start || "00:00";
          const endTime = item?.employeeData?.working_time_end || "23:59";

          // ✅ take earliest start
          if (startTime < minStart) {
            minStart = startTime;
          }

          // ✅ take latest end
          if (endTime > maxEnd) {
            maxEnd = endTime;
          }
        });

        // ✅ ensure seconds format
        setWorkingHours({
          start: minStart.length === 5 ? `${minStart}:00` : minStart,
          end: maxEnd.length === 5 ? `${maxEnd}:00` : maxEnd,
        });
      }
      // 2. Booked appointments
      for (const empId of practitionerIds) {
        const res = await postApi(config.findAppointment, {
          employeeId: empId, $or: [
            { type: { $ne: "appointment" } },
            {
              $and: [
                { type: "appointment" },
                { status: { $ne: "notPaid" } }
              ]
            }
          ]
        });

        if (res?.statusCode === 200 && res.data?.length > 0) {
          const appointments = res.data || [];


          const mappedEvents = appointments.map((appt) => {
            // const [hour, minute] = appt.time.split(":").map(Number);
            // const start = DateTime.fromISO(appt.date).set({ hour, minute });
            // const end = start.plus({ minutes: appt.duration || 30 });

            const dateOnly = appt.date.includes("T")
              ? appt.date.split("T")[0] // remove timezone part
              : appt.date;

            const time = appt.time.padStart(5, "0");

            const start = DateTime.fromFormat(
              `${dateOnly} ${time}`,
              "yyyy-MM-dd HH:mm",
              { zone: "America/New_York" }
            );

            const end = start.plus({ minutes: appt.duration || 30 });
            console.log(start.toISO(), end.toISO(), "kkkkkkkkkk")

            return {
              id: `${empId}-${appt._id}`,
              title: appt.type === "break" ? `Break — ${appt.note}` : `${appt.service?.name || "Service"} — ${appt.user?.name || "Client"}`,
              start: start.toISO(),
              end: end.toISO(),
              backgroundColor: appt.type === "break" ? "#ffc107" : (appt.status === "unpaid" ? "#dc3545" : "#dc3545"),
              borderColor: "#000",
              extendedProps: {
                ...appt,
                practitionerId: empId,
              },
            };

            // const start = DateTime.fromFormat(
            //   `${appt.date} ${appt.time}`,
            //   "yyyy-MM-dd HH:mm",
            //   { zone: "America/New_York" }
            // );

            // const end = start.plus({ minutes: Number(appt.duration) || 30 });

            // return {
            //   id: `${empId}-${appt._id}`,
            //   title: appt.type === "break" ? `Break — ${appt.note}` : `${appt.service?.name || "Service"} — ${appt.user?.name || "Client"}`,
            //   // ✅ IMPORTANT: send ISO in UTC (calendar safe)
            //   start: start.toUTC().toISO(),
            //   end: end.toUTC().toISO(),
            //   backgroundColor:
            //     appt.type === "break"
            //       ? "#ffc107"
            //       : appt.status === "unpaid"
            //         ? "#dc3545"
            //         : "#28a745",
            //   borderColor: "#000",
            //   extendedProps: {
            //     ...appt,
            //     practitionerId: empId,
            //   },
            // };
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

  const handleDateChange = (arg) => {
    const date = DateTime.fromISO(arg).toISODate();
    const today = DateTime.now().toISODate();

    if (unavailableDates.includes(date) || date < today) {
      return;
    }

    const clickedTime = DateTime.fromISO(arg);
    setSelectedSlot(clickedTime);

  };


  const refreshCalendar = async () => {
    const ids = selectedPractitioners.map((p) => p.value);
    if (ids.length > 0) {
      await fetchAppointments(ids, calendarRange.start, calendarRange.end);
    } else if (employeeId) {
      await fetchAppointments([employeeId], calendarRange.start, calendarRange.end);
    }
  };


  const handleClose = () => {
    setEditAppointments(false)
    setShowModal(false);
    setSelectedSlot(null);
    setAppointments([{
      centerId: centerOptions[0].value,
      serviceId: "",
      employeeId: "",
      availableSlots: [],
      duration: "0",
      userId: "", // ✅ added here
      price: "0.00",
      note: "",
      addonId: "",
    }])
  };


  const isAppointmentValid = (appt) => {
    return (
      appt.centerId &&
      appt.serviceId &&
      appt.employeeId &&
      appt.userId &&
      // appt.note &&
      appt.time &&
      appt.duration &&
      Number(appt.duration) > 0 &&
      selectedSlot // date must exist
    );
  };

  const allAppointmentsValid = appointments.length && appointments?.every(isAppointmentValid);

  const allAppointmentsValidForAfterWorking = appointmentAfterWorking.length && appointmentAfterWorking?.every(isAppointmentValid);
  const getSelectedServices = (excludeIndex = null) =>
    appointments
      .filter((_, i) => i !== excludeIndex)
      .map((a) => a.serviceId)
      .filter(Boolean);


  const getSelectedEmployees = (excludeIndex = null) =>
    appointments
      .filter((_, i) => i !== excludeIndex)
      .map((a) => a.employeeId)
      .filter(Boolean);
  // .unavailable-day {
  //   opacity: 0.4;
  //   background-color: #ff2c2c !important;9
  // }

  // .unavailable-slot {
  //   opacity: 0.4;
  //   background-color: #f8d7da !important;
  // }
  // 2c3e50ad
  // #198754

  const userOptions = users.map((u) => ({
    value: u._id,
    label: `${u.name} ${u.lastName || ""}`,   // what shows in dropdown
    name: u.name,
    lastName: u.lastName,
    email: u.email,
    mobileNo: String(u.mobileNo)
  }));

  const checkSlotInEmployeeWorkingTime = (appointment) => {
    const dateOnly = appointment.date.substring(0, 10);

    const workingStart = DateTime.fromFormat(
      `${dateOnly} ${appointment.employee.working_time_start}`,
      "yyyy-MM-dd HH:mm",
      { zone: "America/New_York" }
    ).toMillis();

    const workingEnd = DateTime.fromFormat(
      `${dateOnly} ${appointment.employee.working_time_end}`,
      "yyyy-MM-dd HH:mm",
      { zone: "America/New_York" }
    ).toMillis();

    const slotStart = DateTime.fromFormat(
      `${dateOnly} ${appointment.time}`,
      "yyyy-MM-dd HH:mm",
      { zone: "America/New_York" }
    ).toMillis();

    const slotEnd =
      slotStart + Number(appointment.duration || 0) * 60 * 1000;

    return (
      slotStart >= workingStart &&
      slotEnd <= workingEnd
    );
  };

  const takePayment = async (paymentIntent) => {
    try {
      setLoader(true)
      const endpoint = config.takePayment;
      const data = {
        appointmentId: paymentIntent,
        paymentBy: "admin"
      }

      const response = await postApi(endpoint, data);
      setLoader(false)
      if (response.statusCode === 201 || response.statusCode === 200) {
        if (response.paymentUrl) {
          window.open(response.paymentUrl)
        } else {
          Swal.fire("Success", "Payment received successfully through the saved hold card!", "success").then((result) => {
            if (result.isConfirmed) {
              const ids = selectedPractitioners.map((p) => p.value);
              fetchAppointments(ids, calendarRange.start, calendarRange.end);
              // fetchAppointmentsByMonth(employee._id, calendarDate);
              // const modal = bootstrap.Modal.getInstance(document.getElementById("viewDetails"));
              // modal.hide();
              setShowEventModal(false)
            }
          });
        }

        // alert('Payment Done')
      } else {
        // alert(response.message||response.error)
      }
    } catch (error) {
      console.error("Error fetching employee:", error);
    }
  }
  const deleteBooking = async () => {
    if (!selectedSlot) return;

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      const start = new Date(selectedSlot.slot.startTime);

      const payload = {
        _id: selectedAppointment?._id, // 🔑 include appointment id
        serviceId: selectedService,
        employeeId: selectedSlot.empGroup?.employeeData?._id,
        userId: user?._id,
        note: "Rescheduled via MyAppointments",
        date: start.toISOString().split("T")[0],
        time: start.toTimeString().slice(0, 5),
        deposit: 0,
        repeat: "Off",
        file: "",
        duration: parseInt(selectedSlot.empGroup?.serviceDetails?.duration || 30),
        price: parseFloat(selectedSlot.empGroup?.serviceDetails?.price || 0),
      };


      const res = await postApi(config.editAppointments, payload);

      if (res.statusCode === 201 || res.statusCode === 200) {
        alert("Appointment booked successfully!");

        // 🔥 REFRESH LIST SO UI SHOWS NEW DATE/TIME
        fetchMyAppointments(filterStatus);

        const modal = bootstrap.Modal.getInstance(
          document.getElementById("gotodate")
        );
        modal?.hide();
      }
      else {
        alert(`Booking failed: ${res.message}`);
      }
    } catch (error) {
      console.error("Booking error:", error);
      alert("Something went wrong while booking.");
    }
  };

  const filteredPractitioners = [
    { value: "ALL", label: "Select All / Deselect All" },
    ...allPractitioners.filter((option) => {
      const searchText = searchValue.toLowerCase().trim();
      const searchNumber = searchValue.replace(/\D/g, "");
      const name = String(option.name || "").toLowerCase();
      const email = String(option.email || "").toLowerCase();
      const mobileNo = String(option.mobileNo || "").replace(/\D/g, "");

      return (
        name.includes(searchText) ||
        email.includes(searchText) ||
        mobileNo.includes(searchNumber)
      );
    }),
  ];
  console.log(allPractitioners, "vvallPractitioners")
  const singleSelectPractitioners = allPractitioners.filter((option) => {
    const searchText = searchValue.toLowerCase().trim();
    const searchNumber = searchValue.replace(/\D/g, "");

    const name = String(option.name || "").toLowerCase();
    const email = String(option.email || "").toLowerCase();
    const mobileNo = String(option.mobileNo || "").replace(/\D/g, "");

    return (
      name.includes(searchText) ||
      email.includes(searchText) ||
      mobileNo.includes(searchNumber)
    );
  });

  // if (Loader)
  //   return (
  //     <div className="text-center mt-5">
  //       <Spinner animation="border" />
  //     </div>
  //   );



  const appointmentAddToCart = async (selectedEvent) => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const props = selectedEvent.extendedProps;
      const payload = {
        appointmentId: props?._id,
        // employeeId: props?.employee?._id || "",
        userId: user?._id || "",
        // status: 'notPaid'
      };
      const res = await postApi(config.appointmentAddToCart, payload);
      if (res.statusCode === 200) {
        alert("Appointment added to cart successfully!");
        // await refreshCalendar();  // ✅ refresh here
        setShowEventModal(false);
        setCartCount(res?.cartCount)
      }
      else {
        alert(res.message || "Failed to add appt. to cart");
      }
    } catch (error) {
      console.error("add to cart appointment error:", error);
      alert("Error add to cart appointment. Please try again later.");
    }
  }

  const convertToMinutes = (time) => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };
  return (
    <Container fluid>
      {Loader && <><div className="text-center mt-5">
        <Spinner animation="border" />
      </div>
        Loading...  </>}
      <style jsx global>{`
.unavailable-day {
  background-color:#808080a6  !important;
}

.unavailable-slot {
  background-color: #808080a6  !important;
}
.available-slot {
  background-color: white !important;
}

.fc-timegrid-slot.available-slot {
  background-color: white !important;
}
.past-date{
background-color: #DBDBDB !important;
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
              <div className="align-items-center justify-content-between mb-2">
                <div className="text-end">

                  <Link className="btn btn-primary" href="/admin/Practitioner-Dashboard/waitlist">Waitlist Requests</Link>
                </div>
              </div>
              <Row className="align-items-center">
                <Col md={6}>
                  <h4 className="mb-0">
                    Practitioner Calendar
                    {selectedPractitioners.length > 0 && (
                      <span
                        style={{
                          marginLeft: "8px",
                          fontSize: "1.1rem",
                          fontWeight: "500",
                          color: "#666",
                        }}
                      >
                        — {selectedPractitioners.map((p) => p.label).join(", ")}
                      </span>
                    )}
                  </h4>
                </Col>
                <Col md={6} className="d-flex justify-content-end gap-2">
                  {/* <Col md={6}> */}
                  {/* <Form.Group > */}
                  {/* <Form.Label>
                    Center <span style={{ color: "red" }}>*</span>
                  </Form.Label> */}
                  <Form.Select style={{ minWidth: "300px" }}
                    placeholder='Select Center'
                    value={taskForm.centerId}
                    onChange={(e) => {
                      const val = e.target.value;
                      setTaskForm((prev) => ({ ...prev, centerId: val, serviceId: "", employeeId: "" }));
                      // fetchEmployeesByCenter(val);
                      fetchCenterWisePractitioners(val)
                      fetchServices(val);
                    }}
                  >
                    <option value="" hidden>Select Center</option>
                    {centerOptions.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </Form.Select>
                  {/* </Form.Group> */}
                  {/* </Col> */}
                  <div style={{ minWidth: "300px" }}>
                    {/* <Select
                      isMulti
                      options={[
                        { value: "ALL", label: "Select All / Deselect All" },
                        ...allPractitioners,
                      ]}
                      value={selectedPractitioners}
                      onChange={(selected) => {
                        console.log("kkkkkkkkj")
                        if (!selected) {
                          setSelectedPractitioners([]);
                        } else if (selected.some((s) => s.value === "ALL")) {
                          // If ALL is clicked and not all are selected -> select all
                          if (
                            selectedPractitioners.length !==
                            allPractitioners.length
                          ) {
                            setSelectedPractitioners(allPractitioners);
                          } else {
                            // If already all selected -> deselect all
                            setSelectedPractitioners([]);
                          }
                        } else {
                          setSelectedPractitioners(selected);
                        }
                        setUnavailableDates([])
                      }}
                      styles={{
                        menu: (provided) => ({ ...provided, zIndex: 9999 }),
                      }}
                      placeholder="Select Practitioners..."
                    /> */}
                    <Select
                      isMulti
                      options={filteredPractitioners}
                      value={selectedPractitioners}

                      onInputChange={(val) => {
                        console.log("SEARCH 👉", val);
                        setSearchValue(val);
                      }}

                      onChange={(selected) => {
                        if (!selected) {
                          setSelectedPractitioners([]);
                        } else if (selected.some((s) => s.value === "ALL")) {
                          if (selectedPractitioners.length !== allPractitioners.length) {
                            setSelectedPractitioners(allPractitioners);
                          } else {
                            setSelectedPractitioners([]);
                          }
                        } else {
                          setSelectedPractitioners(selected);
                        }

                        setUnavailableDates([]);
                      }}

                      styles={{
                        menu: (provided) => ({ ...provided, zIndex: 9999 }),
                      }}

                      isSearchable
                      placeholder="Search by name, email, or mobile"
                    />
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row className="mt-4 mb-5">
        <Col>
          {console.log(calendarRange, unavailableDates, "jjjjjjjjjjjjj")}
          <Card className="p-4">
            <Card.Body>
              <FullCalendar
                plugins={[
                  dayGridPlugin,
                  timeGridPlugin,
                  interactionPlugin,
                  listPlugin,
                ]}
                initialView="dayGridMonth"
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


                  setCalendarRange({ start, end });

                  if (selectedPractitioners.length > 0) {
                    const ids = selectedPractitioners.map((p) => p.value);
                    fetchAppointments(ids, start, end);
                  }
                }}






                //             eventContent={(arg) => {
                //               const viewType = arg.view.type; // dayGridMonth | timeGridWeek | timeGridDay | listWeek

                //               // BREAK EVENTS
                //               if (arg.event.extendedProps?.type === "break") {
                //                 return {
                //                   html: `
                //     <div style="font-size: 0.8rem; font-weight: bold;width:100%; background-color: #ffc107 ;color: white; padding:5px;">
                //       ${arg.event.extendedProps?.note || "Break"}
                //     </div>
                //   `
                //                 };
                //               }

                //               const service = arg.event.extendedProps?.service?.name || "";
                //               const client = arg.event.extendedProps?.user?.name || "";

                //               // ✔ WEEK & DAY VIEWS → ONLY show service + client
                //               if (viewType === "timeGridWeek" || viewType === "timeGridDay") {
                //                 return {
                //                   html: `
                //     <div style="font-size: 0.75rem; font-weight: 600;">
                //       ${service}
                //     </div>
                //     <div style="font-size: 0.7rem;">
                //       ${client}
                //     </div>
                //   `
                //                 };
                //               }

                //               // ✔ MONTH VIEW → return HTML string with proper constraints
                //               if (viewType === "dayGridMonth") {
                //                 const employeeName = arg.event.extendedProps?.employee?.userDetails?.name || "N/A";
                //                 const price = arg.event.extendedProps?.price || "0";
                //                 const note = arg.event.extendedProps?.note || "";

                //                 // Escape HTML for title attribute
                //                 const escapeHtml = (text) => {
                //                   if (!text) return "";
                //                   return String(text)
                //                     .replace(/&/g, "&amp;")
                //                     .replace(/</g, "&lt;")
                //                     .replace(/>/g, "&gt;")
                //                     .replace(/"/g, "&quot;")
                //                     .replace(/'/g, "&#039;");
                //                 };

                //                 // Truncate long text to prevent overflow
                //                 const truncateText = (text, maxLength) => {
                //                   if (!text) return "";
                //                   return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
                //                 };

                //                 const serviceShort = truncateText(service, 22);
                //                 const clientShort = truncateText(client, 22);
                //                 const employeeShort = truncateText(employeeName, 22);

                //                 // Build tooltip text
                //                 const tooltipText = `${escapeHtml(service)} | ${escapeHtml(client)} | ${escapeHtml(employeeName)} | $${price}${note ? ' | ' + escapeHtml(note) : ''}`;

                //                 return {
                //                   html: `
                //     <div style="
                //       font-size: 0.7rem;
                //       line-height: 1.3;
                //       padding: 6px 4px 6px;
                //       overflow: hidden !important;
                //       text-overflow: ellipsis !important;
                //       word-wrap: break-word;
                //       white-space: normal;
                //       width: 100%;
                //       box-sizing: border-box;
                //       background-color:#ff0000;
                //       color:white;
                //       cursor: pointer;
                //     " title="${tooltipText}">
                //       <div style="font-weight: 1000; margin-bottom: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                //         ${escapeHtml(serviceShort)}
                //       </div>
                //       <div style="font-size: 0.65rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                //         ${escapeHtml(clientShort)}
                //       </div>
                //       <div style="font-size: 0.65rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color:white">
                //         $${price}
                //       </div>
                //     </div>
                //   `
                //                 };
                //               }

                //               // Default fallback for other views
                //               return {
                //                 html: `
                //   <div style="font-size: 0.75rem; font-weight: 600;">
                //     ${service}
                //   </div>
                //   <div style="font-size: 0.7rem;">
                //     ${client}
                //   </div>
                // `
                //               };
                //             }}
                eventContent={(arg) => {

                  const viewType = arg.view.type;

                  const props = arg.event.extendedProps;



                  const escapeHtml = (text) => {

                    if (!text) return "";

                    return String(text)

                      .replace(/&/g, "&amp;").replace(/</g, "&lt;")

                      .replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");

                  };

                  const truncate = (text, max) =>

                    text && text.length > max ? text.slice(0, max) + "..." : text || "";



                  // BREAK / PERSONAL TASK 

                  if (props?.type === "break") {

                    if (viewType === "listWeek") {

                      return {

                        html: `

          <div style="width:100%; padding:8px 12px; background:#fffbea; border-left:3px solid #ffc107; border-radius:3px;">

            <div style="font-size:0.82rem; font-weight:700; color:#92660a; margin-bottom:4px;">Personal Task</div>

            <table style="font-size:0.78rem; color:#444; border-collapse:collapse; width:100%;">

              <tr><td style="width:90px; padding:1px 0; color:#666;">Note</td><td style="padding:1px 0;">${escapeHtml(props?.note || "—")}</td></tr>

              <tr><td style="padding:1px 0; color:#666;">Employee</td><td style="padding:1px 0;">${escapeHtml(props?.employee?.userDetails?.name || "N/A")}</td></tr>

              <tr><td style="padding:1px 0; color:#666;">Duration</td><td style="padding:1px 0;">${props?.duration || "—"} mins</td></tr>

            </table>

          </div>

        `

                      };

                    }

                    if (viewType === "timeGridWeek" || viewType === "timeGridDay") {

                      return {

                        html: `

          <div style="font-size:0.72rem; padding:4px 6px; height:100%; box-sizing:border-box; line-height:1.6; overflow:hidden;">

            <div style="font-weight:700; color:#fff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">Personal Task</div>

            <div style="color:#fff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHtml(props?.note || "—")}</div>

            <div style="color:#fff;">${props?.duration || "—"} mins</div>

          </div>

        `

                      };

                    }

                    // month view

                    return {

                      html: `

        <div style="font-size:0.72rem; font-weight:700; width:100%; background:#ffc107; color:#fff; padding:3px 6px; border-radius:3px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">

          ${escapeHtml(truncate(props?.note || "Personal Task", 22))}

        </div>

      `

                    };

                  }



                  // COMMON VARIABLES 

                  const service = props?.service?.name || "";

                  const client = props?.user?.name || "";

                  const email = props?.user?.email || "";

                  const employee = props?.employee?.userDetails?.name || "N/A";

                  const price = props?.price || "0";

                  const duration = props?.duration || "—";

                  const center = centerOptions.find(c => c.value === props?.centerId)?.label || "N/A";

                  const status = props?.status || "";

                  const isPending = status === "unpaid" && new Date(arg.event.startStr) < new Date();

                  const paymentStatus = status === "paid" ? "Paid" : "Un Paid";

                  const apptStatus = isPending ? "Payment Pending" : status === "paid" ? "Completed" : "Booked Successfully";

                  const statusColor = isPending ? "#e65100" : status === "paid" ? "#2e7d32" : "#1565c0";



                  // LIST VIEW 

                  if (viewType === "listWeek") {

                    return {

                      html: `

        <div style="width:100%; padding:10px 14px; background:#fff5f5; border-left:3px solid #dc3545; border-radius:3px;">

          <div style="font-size:0.85rem; font-weight:700; color:#dc3545; margin-bottom:6px;">${escapeHtml(service)}</div>

          <table style="font-size:0.78rem; color:#444; border-collapse:collapse; width:100%;">

            <tr>

              <td style="width:120px; padding:2px 0; color:#666;">Client</td>

              <td style="padding:2px 0;">${escapeHtml(client)} &nbsp;<span style="color:#888;">(${escapeHtml(email)})</span></td>

            </tr>

            <tr>

              <td style="padding:2px 0; color:#666;">Employee</td>

              <td style="padding:2px 0;">${escapeHtml(employee)}</td>

            </tr>

            <tr>

              <td style="padding:2px 0; color:#666;">Duration</td>

              <td style="padding:2px 0;">${duration} mins</td>

            </tr>

            <tr>

              <td style="padding:2px 0; color:#666;">Price</td>

              <td style="padding:2px 0;">$${price}</td>

            </tr>

            <tr>

              <td style="padding:2px 0; color:#666;">Center</td>

              <td style="padding:2px 0;">${escapeHtml(center)}</td>

            </tr>

            <tr>

              <td style="padding:2px 0; color:#666;">Payment</td>

              <td style="padding:2px 0; font-weight:600; color:${status === "paid" ? "#2e7d32" : "#c62828"};">${paymentStatus}</td>

            </tr>

            <tr>

              <td style="padding:2px 0; color:#666;">Status</td>

              <td style="padding:2px 0; font-weight:600; color:${statusColor};">${apptStatus}</td>

            </tr>

          </table>

        </div>

      `

                    };

                  }



                  // WEEK & DAY VIEWS 

                  if (viewType === "timeGridDay") {

                    return {

                      html:

                        // <div style="font-size:0.72rem; line-height:1.6; padding:4px 6px; overflow:hidden; height:100%; box-sizing:border-box;">

                        //   <div style="font-weight:700; font-size:0.75rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; color:#fff;">

                        //     ${escapeHtml(service)}

                        //   </div>
                        //   <span style="opacity:0.8;">Client:</span> ${escapeHtml(client)}

                        //   <div style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; color:#fff;">

                        //     <span style="opacity:0.8;">Client:</span> ${escapeHtml(client)}

                        //   </div>

                        //   <div style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; color:#fff;">

                        //     <span style="opacity:0.8;">Emp:</span> ${escapeHtml(employee)}

                        //   </div>

                        //   <div style="color:#fff;"><span style="opacity:0.8;">Price:</span> $${price}</div>

                        //   <div style="font-weight:600; color:#ffe082;">${apptStatus}</div>

                        // </div>
                        `
        <div style="font-size:0.72rem; line-height:1.6; padding:4px 6px; overflow:hidden; height:100%; box-sizing:border-box; white-space:nowrap; text-overflow:ellipsis; color:#fff;">

  <span style="font-weight:700; font-size:0.75rem; margin-right:15px;">
    ${escapeHtml(service)}
  </span>

  <span style="margin-right:15px;">
    <span style="opacity:0.8;">Client:</span> ${escapeHtml(client)}
  </span>

  <span style="margin-right:15px;">
    <span style="opacity:0.8;">Emp:</span> ${escapeHtml(employee)}
  </span>

  <span style="margin-right:15px;">
    Price: $${price}
  </span>

  <span style="font-weight:600; color:#ffe082;">
    ${apptStatus}
  </span>

</div>

      `

                    };

                  }
                  if (viewType === "timeGridWeek") {

                    return {

                      html: `
        <div style="font-size:0.72rem; line-height:1.6; padding:4px 6px; overflow:hidden; height:100%; box-sizing:border-box;">

          <div style="font-weight:700; font-size:0.75rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; color:#fff;">

            ${escapeHtml(service)}

          </div>

          <div style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; color:#fff;">

            <span style="opacity:0.8;">Client:</span> ${escapeHtml(client)}

          </div>

          <div style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; color:#fff;">

            <span style="opacity:0.8;">Emp:</span> ${escapeHtml(employee)}

          </div>

          <div style="color:#fff;"><span style="opacity:0.8;">Price:</span> $${price}</div>

          <div style="font-weight:600; color:#ffe082;">${apptStatus}</div>

        </div>`}

                  }

                  // MONTH VIEW 

                  if (viewType === "dayGridMonth") {

                    const tooltipText = `${escapeHtml(service)} | ${escapeHtml(client)} | ${escapeHtml(employee)} | $${price}`;

                    const apptBadge = isPending ? "Pending" : status === "paid" ? "Paid" : "Booked";

                    const badgeBg = isPending ? "rgba(230,81,0,0.3)" : status === "paid" ? "rgba(46,125,50,0.3)" : "rgba(21,101,192,0.3)";



                    return {

                      html: `

        <div style="

          font-size:0.68rem; line-height:1.45; padding:4px 6px;

          overflow:hidden; width:100%; box-sizing:border-box;

          background:#dc3545; color:#fff; cursor:pointer; border-radius:3px;

        " title="${tooltipText}">

          <div style="font-weight:700; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">

            ${escapeHtml(truncate(service, 20))}

          </div>

          <div style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap; opacity:0.9;">

            ${escapeHtml(truncate(client, 18))}

          </div>

          <div style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap; opacity:0.85;">

            ${escapeHtml(truncate(employee, 18))}

          </div>

          <div style="opacity:0.9;">$${price}</div>

          <div style="margin-top:2px; font-size:0.62rem; background:${badgeBg}; border-radius:2px; padding:1px 4px; display:inline-block;">

            ${apptBadge}

          </div>

        </div>

      `

                    };

                  }
                  return {

                    html: `
      <div style="font-size:0.75rem; font-weight:600; color:#fff;">${escapeHtml(service)}</div>

      <div style="font-size:0.7rem; color:#fff;">${escapeHtml(client)}</div>    `

                  };

                }}

                allDaySlot={false}
                // slotMinTime="00:00:00"
                // slotMaxTime="22:00:00"
                slotMinTime={workingHours.start}
                slotMaxTime={workingHours.end}
                events={events}
                selectable={true}
                selectMirror={true}
                dateClick={handleDateClick}

                selectAllow={(selectInfo) => {
                  const date = DateTime.fromJSDate(selectInfo.start).toISODate();
                  const today = DateTime.now().toISODate();
                  const now = new Date();
                  // return selectInfo.start >= now;
                  // block if in unavailableDates OR in the past
                  return !unavailableDates.includes(date) && date >= today && selectInfo.start >= now;
                }}

                // slotLaneClassNames={(arg) => {
                //   const date = DateTime.fromJSDate(arg.view.currentStart).toISODate();
                //   const today = DateTime.now().toISODate();
                //   console.log(date, today ,arg.view.currentStart, "date < today")
                //   if (unavailableDates.includes(date) || date < today) {
                //     return ["unavailable-slot"];
                //   } 
                //   // else if (date < today) {
                //   //   return ["past-date"]
                //   // }
                //   // return [];
                //   return ["available-slot"];   
                // }}


                dayCellClassNames={(arg) => {
                  const date = DateTime.fromJSDate(arg.date).toISODate();
                  const today = DateTime.now().toISODate();
                  if (unavailableDates.includes(date) || date < today) {
                    return ["unavailable-day"];
                  }
                  // else if (date < today) {
                  //   return ["past-date"]
                  // }
                  return ["available-slot"];
                  // return [];
                }}

                height="auto"
              />
              <div className="d-flex mt-2">
                < >
                  <div
                    style={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      backgroundColor: "#808080a6",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontWeight: "bold",
                      fontSize: "14px",
                      textAlign: "center",
                      boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
                      marginRight: "6px"
                    }}
                  >

                  </div>
                  <span >Non working day and past dates</span>
                </>
                <>
                  <div
                    style={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      backgroundColor: "red",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontWeight: "bold",
                      fontSize: "14px",
                      textAlign: "center",
                      boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
                      marginRight: "6px",
                      marginLeft: "6px"
                    }}
                  >

                  </div>
                  <span>Booked slot</span>
                </>
                <>
                  <div
                    style={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      backgroundColor: "#ffc107",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontWeight: "bold",
                      fontSize: "14px",
                      textAlign: "center",
                      boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
                      marginRight: "6px",
                      marginLeft: "6px"
                    }}
                  >

                  </div>
                  <span className="">Personal Task</span>
                </>
                <>
                  <div
                    style={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      backgroundColor: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontWeight: "bold",
                      fontSize: "14px",
                      textAlign: "center",
                      boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
                      marginRight: "6px",
                      marginLeft: "6px"
                    }}
                  >

                  </div>
                  <span className="">Practitioner Available</span>
                </>
              </div>
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
                  setAppointmentTypeSelectionModel(true);
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
                  setTaskForm((prev) => ({
                    centerId: "",
                    serviceId: "",
                    employeeId: "",
                    userId: "",
                    note: "",
                    addonId: "",
                    duration: "30",
                    price: "0.00",
                    time: "",
                    availableSlots: []
                  }));

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


      {/* <Modal show={showTaskModal} onHide={() => setShowTaskModal(false)} size="lg" centered>
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
                      // fetchEmployeesByCenter(val);
                      fetchCenterWisePractitioners(val)
                      fetchServices(val);
                    }}
                  >
                    <option value="" hidden>Select Center</option>
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
                  
                  <Select
                    options={singleSelectPractitioners}
                    value={singleSelectPractitioners.find(
                      (option) => option.value === taskForm.employeeId
                    )}
                    onInputChange={(val) => {
                      setSearchValue(val);
                    }}
                    onChange={(selected) => {
                      const val = selected.value;

                      const emp = allPractitioners.find(
                        (emp) => emp.value === val
                      );

                      setTaskForm((prev) => ({
                        ...prev,
                        employeeId: val,
                        userId: emp?.userId || "",
                      }));
                    }}
                    styles={{
                      menu: (provided) => ({
                        ...provided,
                        zIndex: 9999,
                      }),
                    }}
                    isSearchable
                    placeholder="Search by name, email, or mobile"
                  />
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

                  // 🔁 Refresh the calendar immediately
                  await refreshCalendar();
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
      </Modal> */}

      <Modal
        show={showTaskModal}
        onHide={() => setShowTaskModal(false)}
        size="lg"
        centered
      >
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

                      setTaskForm((prev) => ({
                        ...prev,
                        centerId: val,
                        serviceId: "",
                        employeeId: "",
                      }));

                      fetchCenterWisePractitioners(val);
                      fetchServices(val);
                    }}
                  >
                    <option value="" hidden>
                      Select Center
                    </option>

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
                    Practitioner / Employee{" "}
                    <span style={{ color: "red" }}>*</span>
                  </Form.Label>

                  <Select
                    options={singleSelectPractitioners}
                    value={singleSelectPractitioners.find(
                      (option) => option.value === taskForm.employeeId
                    )}
                    onInputChange={(val) => {
                      setSearchValue(val);
                    }}
                    onChange={(selected) => {
                      const val = selected.value;

                      const emp = allPractitioners.find(
                        (emp) => emp.value === val
                      );

                      setTaskForm((prev) => ({
                        ...prev,
                        employeeId: val,
                        userId: emp?.userId || "",
                      }));
                    }}
                    styles={{
                      menu: (provided) => ({
                        ...provided,
                        zIndex: 9999,
                      }),
                    }}
                    isSearchable
                    placeholder="Search by name, email, or mobile"
                  />
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
                    rows={3}
                    required
                    value={taskForm.note}
                    onChange={(e) =>
                      setTaskForm((prev) => ({
                        ...prev,
                        note: e.target.value,
                      }))
                    }
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mt-3">
              <Col md={5}>
                <Form.Group>
                  <Form.Label>
                    Start Date <span style={{ color: "red" }}>*</span>
                  </Form.Label>

                  <Form.Control
                    type="date"
                    required
                    value={taskForm.startDate || ""}
                    onChange={(e) =>
                      setTaskForm((prev) => ({
                        ...prev,
                        startDate: e.target.value,
                      }))
                    }
                  />
                </Form.Group>
              </Col>

              <Col md={5}>
                <Form.Group>
                  <Form.Label>
                    End Date <span style={{ color: "red" }}>*</span>
                  </Form.Label>

                  <Form.Control
                    type="date"
                    required
                    min={taskForm.startDate}
                    value={taskForm.endDate || ""}
                    onChange={(e) =>
                      setTaskForm((prev) => ({
                        ...prev,
                        endDate: e.target.value,
                      }))
                    }
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mt-3">
              <Col md={5}>
                <Form.Group>
                  <Form.Label>
                    Start Time <span style={{ color: "red" }}>*</span>
                  </Form.Label>

                  <Form.Control
                    type="time"
                    required
                    value={taskForm.time || ""}
                    onChange={(e) =>
                      setTaskForm((prev) => ({
                        ...prev,
                        time: e.target.value,
                      }))
                    }
                  />
                </Form.Group>
              </Col>



              <Col md={5}>
                <Form.Group>
                  <Form.Label>
                    {/* Duration (mins) <span style={{ color: "red" }}>*</span> */}
                    End Time <span style={{ color: "red" }}>*</span>
                  </Form.Label>
                  <Form.Control
                    type="time"
                    required
                    min={taskForm.time}
                    value={taskForm.endTime || ""}
                    onChange={(e) =>
                      setTaskForm((prev) => ({
                        ...prev,
                        endTime: e.target.value,
                      }))
                    }
                  />
                  {/* <Form.Control
                    type="number"
                    min="1"
                    required
                    value={taskForm.duration}
                    onChange={(e) =>
                      setTaskForm((prev) => ({
                        ...prev,
                        duration: e.target.value,
                      }))
                    }
                  /> */}
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowTaskModal(false)}
          >
            Cancel
          </Button>

          <Button
            variant="success"
            onClick={async () => {
              if (!taskForm.centerId)
                return alert("Center is required.");

              if (!taskForm.employeeId)
                return alert("Employee is required.");

              if (!taskForm.note)
                return alert("Note is required.");

              if (!taskForm.startDate)
                return alert("Start date is required.");

              if (!taskForm.endDate)
                return alert("End date is required.");

              if (!taskForm.time)
                return alert("Time is required.");

              // if (!taskForm.duration)
              //   return alert("Duration is required.");

              if (!taskForm.endTime)
                return alert("End Time is required.");

              if (
                new Date(taskForm.endDate) <
                new Date(taskForm.startDate)
              ) {
                return alert(
                  "End date cannot be earlier than start date."
                );
              }
              const { time, endTime } = taskForm;

              const startMinutes = convertToMinutes(time);
              const endMinutes = convertToMinutes(endTime);

              if (endMinutes <= startMinutes) {
                alert("End Time must be greater than Start Time.");
                return;
              }
              const duration = endMinutes - startMinutes;
              const payload = {
                serviceId: taskForm.serviceId,
                employeeId: taskForm.employeeId,
                userId: taskForm.userId,
                note: taskForm.note,
                centerId: taskForm.centerId,
                addonId: taskForm.addonId,
                duration: Number(duration),
                price: Number(taskForm.price || 0),

                startDate: taskForm.startDate,
                endDate: taskForm.endDate,

                time: taskForm.time,

                deposit: 0,
                repeat: "Off",
              };

              try {
                const response = await postApi(
                  config.addBreakFromAdmin,
                  payload
                );

                if (
                  response.statusCode === 200 ||
                  response.statusCode === 201
                ) {
                  alert("Task created successfully!");

                  setShowTaskModal(false)

                  await refreshCalendar();
                } else {
                  alert(
                    response.message ||
                    "Task creation failed."
                  );
                }
              } catch (error) {
                console.error(error);

                alert(
                  "Error creating task. Please try again later."
                );
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
            {editAppointments ? "Edit Appointment " : "Book Appointment "}
            {/* with {employee?.user?.name}, */}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Accordion activeKey={activeAppointmentKey} onSelect={(key) => setActiveAppointmentKey(key)}>
              {appointments.length && appointments.map((appt, index) => (
                <Accordion.Item eventKey={index.toString()} key={index}>
                  {console.log(appt, "for check payment intent")}
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
                            isInvalid={!appt.centerId}
                            value={appt.centerId}
                            onChange={(e) => {
                              const val = e.target.value;
                              setAppointments((prev) =>
                                prev.map((a, i) =>
                                  i === index
                                    ? { ...a, centerId: val, serviceId: "", employeeId: "", time: "", availableSlots: [] }
                                    : a
                                )
                              );
                              // fetchEmployeesByCenter(val);
                              fetchServices(val);
                            }}
                            disabled={editAppointments}
                          >
                            <option value="" hidden>Select Center</option>
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
                            isInvalid={!appt.serviceId}
                            value={appt.serviceId}
                            onChange={async (e) => {
                              const value = e.target.value;
                              const selectedService = services.find((s) => s._id === value);
                              fetchEmployeesByCenter(value)
                              setAppointments((prev) =>
                                prev.map((a, i) =>
                                  i === index
                                    ? {
                                      ...a,
                                      serviceId: value,
                                      cleanupTime: selectedService?.cleanup_time || 0,
                                      time: "",                 // ✅ reset stale time
                                      availableSlots: [],       // ✅ reset stale slots
                                    }
                                    : a
                                )
                              );

                              // ✅ require userId as well for first-time fetch
                              if (value && appt.employeeId && appt.userId && selectedSlot) {
                                await fetchAvailableSlots(
                                  value,
                                  appt.employeeId,
                                  selectedSlot.toISODate(),
                                  index,
                                  appt.userId
                                );
                              }
                            }}
                            disabled={!appt.centerId || (appt.paymentIntent)}
                          >
                            <option value="" hidden>Select Service</option>

                            {services
                              .filter((s) => s.status === 1) // ✅ only services with status 1
                              .filter(
                                (s) =>
                                  !getSelectedServices(index).includes(s._id) ||
                                  s._id === appt.serviceId // allow selected item
                              )
                              .map((s) => (
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
                      {/* <Col md={6}>
                        <Form.Group>
                          <Form.Label>
                            Practitioner / Employee <span style={{ color: "red" }}>*</span>
                          </Form.Label>
                          <Form.Select
                            required
                            isInvalid={!appt.employeeId}
                            value={appt.employeeId}
                            onChange={async (e) => {
                              const val = e.target.value;
                              const emp = centerEmployees.find((emp) => emp.value === val);
                              setAppointments((prev) =>
                                prev.map((a, i) =>
                                  i === index
                                    ? {
                                      ...a,
                                      employeeId: val,
                                      employeeUserId: emp?.userId || "",
                                      time: "",               // ✅ reset stale time
                                      availableSlots: [],     // ✅ reset stale slots
                                    } : a
                                )
                              );
                              // ✅ require userId as well for first-time fetch
                              if (appt.serviceId && val && appt.userId && selectedSlot) {
                                await fetchAvailableSlots(
                                  appt.serviceId,
                                  val,
                                  selectedSlot.toISODate(),
                                  index,
                                  appt.userId
                                );
                              }
                            }}
                          >
                            <option value="">Select Employee</option>
                            {centerEmployees
                              .filter((s) => s.status === 1)
                              .filter(
                                (emp) =>
                                  !getSelectedEmployees(index).includes(emp.value) ||
                                  emp.value === appt.employeeId // ✅ keep current value visible
                              )
                              .map((emp) => (
                                <option key={emp.value} value={emp.value}>
                                  {emp.label}
                                </option>
                              ))}

                          </Form.Select>
                          <Form.Control.Feedback type="invalid">
                            Employee is required
                          </Form.Control.Feedback>
                        </Form.Group>

                      </Col> */}
                      {/* 
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>
                            Practitioner / Employee <span style={{ color: "red" }}>*</span>
                          </Form.Label>

                          <Select
                            options={centerEmployees
                              .filter((s) => s.status === 1)
                              .filter(
                                (emp) =>
                                  !getSelectedEmployees(index).includes(emp.value) ||
                                  emp.value === appt.employeeId
                              )
                              .map((emp) => ({
                                value: emp.value,
                                label: emp.label,
                                userId: emp.userId,
                              }))}

                            value={
                              centerEmployees
                                .map((emp) => ({
                                  value: emp.value,
                                  label: emp.label,
                                  userId: emp.userId,
                                }))
                                .find((e) => e.value === appt.employeeId) || null
                            }

                            onChange={async (selected) => {
                              const val = selected?.value;
                              const emp = centerEmployees.find((e) => e.value === val);

                              setAppointments((prev) =>
                                prev.map((a, i) =>
                                  i === index
                                    ? {
                                      ...a,
                                      employeeId: val,
                                      employeeUserId: emp?.userId || "",
                                      time: "",
                                      availableSlots: [],
                                    }
                                    : a
                                )
                              );

                              if (appt.serviceId && val && appt.userId && selectedSlot) {
                                await fetchAvailableSlots(
                                  appt.serviceId,
                                  val,
                                  selectedSlot.toISODate(),
                                  index,
                                  appt.userId
                                );
                              }
                            }}

                            isSearchable
                            placeholder="Search Employee..."

                            filterOption={(option, inputValue) => {
                              const search = inputValue.toLowerCase();

                              return (
                                option.label.toLowerCase().includes(search)
                              );
                            }}
                          />

                          {!appt.employeeId && (
                            <div style={{ color: "red", fontSize: "12px" }}>
                              Employee is required
                            </div>
                          )}
                        </Form.Group>
                      </Col> */}

                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>
                            Practitioner / Employee <span style={{ color: "red" }}>*</span>
                          </Form.Label>

                          <Select
                            options={centerEmployees
                              .filter((s) => s.status === 1)
                              .filter(
                                (emp) =>
                                  !getSelectedEmployees(index).includes(emp.value) ||
                                  emp.value === appt.employeeId
                              )
                              .map((emp) => ({
                                value: emp.value,
                                label: emp.label,
                                userId: emp.userId,
                              }))}
                            isDisabled={!appt.centerId || (appt.paymentIntent)}
                            value={
                              centerEmployees
                                .map((emp) => ({
                                  value: emp.value,
                                  label: emp.label,
                                  userId: emp.userId,
                                }))
                                .find((e) => e.value === appt.employeeId) || null
                            }

                            onChange={async (selected) => {
                              const val = selected?.value;
                              const emp = centerEmployees.find((e) => e.value === val);

                              setAppointments((prev) =>
                                prev.map((a, i) =>
                                  i === index
                                    ? {
                                      ...a,
                                      employeeId: val,
                                      employeeUserId: emp?.userId || "",
                                      time: "",
                                      availableSlots: [],
                                    }
                                    : a
                                )
                              );

                              if (appt.serviceId && val && appt.userId && selectedSlot) {
                                await fetchAvailableSlots(
                                  appt.serviceId,
                                  val,
                                  selectedSlot.toISODate(),
                                  index,
                                  appt.userId
                                );
                              }
                            }}

                            isSearchable
                            placeholder="Search Employee..."

                            filterOption={(option, inputValue) => {
                              const search = inputValue.toLowerCase();

                              return (
                                option.label.toLowerCase().includes(search)
                              );
                            }}
                          />

                          {!appt.employeeId && (
                            <div style={{ color: "red", fontSize: "12px" }}>
                              Employee is required
                            </div>
                          )}
                        </Form.Group>
                      </Col>

                      {/* User */}
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>
                            Select User <span style={{ color: "red" }}>*</span>
                          </Form.Label>
                          {/* <Form.Select
                            required
                            isInvalid={!appt.userId}
                            value={appt.userId}
                            onChange={async (e) => {
                              const nextUserId = e.target.value;

                              // reset time/slots and set userId (avoid stale options)
                              setAppointments((prev) =>
                                prev.map((a, i) =>
                                  i === index ? { ...a, userId: nextUserId, time: "", availableSlots: [] } : a
                                )
                              );

                              // fetch with the new userId passed explicitly (no stale read)
                              const svcId = appt.serviceId;
                              const empId = appt.employeeId;
                              if (svcId && empId && nextUserId && selectedSlot) {
                                await fetchAvailableSlots(
                                  svcId,
                                  empId,
                                  selectedSlot.toISODate(),
                                  index,
                                  nextUserId
                                );
                              }
                            }}
                          >
                            <option value="">Select a user</option>

                            {users
                              .filter((user) => user.role === "member") // 🆕 show only members
                              .map((user) => (
                                <option key={user._id} value={user._id}>
                                  {user.name || user.email}
                                </option>
                              ))}

                          </Form.Select> */}
                          {console.log("appt.userId:", appt.userId)}
                          {console.log("userOptions:", userOptions)}

                          <Select
                            options={userOptions}
                            // isDisabled={editAppointments}
                            value={userOptions?.length
                              ? userOptions.find((u) => String(u.value) === String(appt.userId)) || null
                              : null}

                            // filterOption={(option, inputValue) => {
                            //   const search = inputValue.toLowerCase();

                            //   return (
                            //     option.data.name?.toLowerCase().includes(search) ||
                            //     option.data?.lastName?.toLowerCase().includes(search) ||
                            //     option.data?.email?.toLowerCase().includes(search) ||
                            //     String(option.data.mobileNo).includes(search)
                            //   );
                            // }}
                            // filterOption={(option, inputValue) => {
                            //   const search = inputValue.toLowerCase().replace(/\s+/g, "");

                            //   const name = option.data.name?.toLowerCase() || "";
                            //   const lastName = option.data.lastName?.toLowerCase() || "";
                            //   const email = option.data.email?.toLowerCase() || "";

                            //   const mobile = String(option.data.mobileNo || "")
                            //     .replace(/\D/g, ""); // remove +, space, etc

                            //   return (
                            //     name.includes(search) ||
                            //     lastName.includes(search) ||
                            //     email.includes(search) ||
                            //     mobile.includes(search)
                            //   );
                            // }}
                            filterOption={(option, inputValue) => {
                              const search = inputValue.toLowerCase().replace(/\s+/g, "");

                              const name = (option.data.name || "").toLowerCase();
                              const lastName = (option.data.lastName || "").toLowerCase();
                              const fullName = (name + lastName).replace(/\s+/g, "");

                              const email = (option.data.email || "").toLowerCase();

                              const mobile = String(option.data.mobileNo || "")
                                .replace(/\D/g, ""); // keep only numbers


                              return (
                                name.includes(search) ||
                                lastName.includes(search) ||
                                fullName.includes(search) ||
                                email.includes(search) ||
                                mobile.includes(search)
                              );
                            }}

                            onChange={async (selected) => {
                              const nextUserId = selected?.value;

                              setAppointments((prev) =>
                                prev.map((a, i) =>
                                  i === index
                                    ? { ...a, userId: nextUserId, time: "", availableSlots: [] }
                                    : a
                                )
                              );

                              const svcId = appt.serviceId;
                              const empId = appt.employeeId;

                              if (svcId && empId && nextUserId && selectedSlot) {
                                await fetchAvailableSlots(
                                  svcId,
                                  empId,
                                  selectedSlot.toISODate(),
                                  index,
                                  nextUserId
                                );
                              }
                            }}

                            isSearchable
                            placeholder="Search by name, email, or mobile"
                          />
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
                            Appointment Note
                          </Form.Label>
                          <Form.Control
                            as="textarea"
                            // required
                            // isInvalid={!appt.note}
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
                      {console.log(selectedSlot, "selectedSlot")}
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Date</Form.Label>
                          {/* <Form.Control
                            type="date"
                            onChange={async (e) => {
                              const val = e.target.value;
                              const date = DateTime.fromISO(val).toISODate();
                               const today = DateTime.now().toISODate();

                                if (unavailableDates.includes(date) || date < today) {
                                  // return;
                                  setAppointments((prev) =>
                                    prev.map((a, i) =>
                                      i === index ? { ...a, availableSlots: [] } : a
                                    )
                                  );
                                }

                                const clickedTime = DateTime.fromISO(val);
                                setSelectedSlot(clickedTime);
                              // handleDateChange(val)
                              // const emp = centerEmployees.find((emp) => emp.value === val);
                              // setAppointments((prev) =>
                              //   prev.map((a, i) =>
                              //     i === index
                              //       ? {
                              //         ...a,
                              //         employeeId: val,
                              //         employeeUserId: emp?.userId || "",
                              //         time: "",               // ✅ reset stale time
                              //         availableSlots: [],     // ✅ reset stale slots
                              //       } : a
                              //   )
                              // );
                              // serviceId, employeeId, date, apptIndex, userId
                              // ✅ require userId as well for first-time fetch
                              if (appt.serviceId && val && appt.userId && clickedTime) {
                                await fetchAvailableSlots(
                                  appt.serviceId,
                                  appt.employeeId,
                                  new Date(clickedTime).toISOString().split("T")[0],
                                  index,
                                  appt.userId
                                );
                              }}}
                            value={new Date(selectedSlot).toISOString().split("T")[0]}
                            // value={selectedSlot?.toFormat("MMM d, yyyy") || ""}
                            min={new Date().toISOString().split("T")[0]}
                            disabled={editAppointments}
                          /> */}
                          <Form.Control
                            type="date"
                            onChange={async (e) => {
                              const val = e.target.value;

                              const clickedTime = DateTime.fromISO(val);
                              const date = clickedTime.toISODate();
                              const today = DateTime.now().toISODate();

                              // if (unavailableDates.includes(date) || date < today) {
                              setAppointments((prev) =>
                                prev.map((a, i) =>
                                  i === index ? { ...a, availableSlots: [] } : a
                                )
                              );
                              //   return;
                              // }

                              setSelectedSlot(clickedTime);

                              if (appt.serviceId && val && appt.userId && clickedTime) {
                                await fetchAvailableSlots(
                                  appt.serviceId,
                                  appt.employeeId,
                                  clickedTime.toISODate(), // ✅ FIXED
                                  index,
                                  appt.userId
                                );
                              }
                            }}
                            value={selectedSlot ? selectedSlot.toISODate() : ""} // ✅ FIXED
                            min={DateTime.now().toISODate()} // optional improvement
                            disabled={!editAppointments}
                          />
                        </Form.Group>
                      </Col>

                      {/* Time */}
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>
                            Time <span style={{ color: "red" }}>*</span>
                          </Form.Label>
                          <Form.Select
                            required
                            isInvalid={!appt.time}
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
                                <option value="" hidden>Select Time</option>
                                {appt.availableSlots
                                  .filter((slot) => {
                                    const now = DateTime.now().setZone("America/New_York");

                                    const slotTime = DateTime.fromISO(slot.startTime, {
                                      zone: "utc", // 🔥 force parse as UTC
                                    }).setZone("America/New_York");

                                    console.log(slotTime.toISO(), "slotTime");
                                    console.log(now.toISO(), "now");

                                    return slotTime.toMillis() > now.toMillis(); // ✅ safest comparison
                                  })
                                  .map((slot, i) => (
                                    <option key={i} value={slot.startTime}>
                                      {DateTime.fromISO(slot.startTime, { zone: "utc" })
                                        .setZone("America/New_York")
                                        .toFormat("hh:mm a")}
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
                      {/* <Col md={4}>
                        <Form.Group>
                          <Form.Label>Deposit Due</Form.Label>
                          <Form.Control defaultValue="$0" />
                        </Form.Group>
                      </Col> */}
                    </Row>

                    <Row className="mt-3">
                      {/* Price */}
                      {console.log(appt, "lklklkkjk")}
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
                            isInvalid={!appt.duration || Number(appt.duration) <= 0}
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

                    {!editAppointments &&
                      <>
                        <div className="inputMain mt-md-3 mt-xl-0 mb-3">
                          <h6 className="fw-semibold mb-2">Payment Information</h6>
                          <p className="fs-8 text-orange fst-italic">A card is required to hold your appointment slot. You will not be charged.</p>
                        </div>
                        <Elements stripe={stripePromise}>
                          <StripePaymentForm
                            cardDetails={cardDetails}
                            setCardDetails={setCardDetails}

                            handleCardSetup={handleCardSetup}
                            cardValidation={cardValidation}
                            setCardValidation={setCardValidation}
                            ref={cardRef}
                          />
                        </Elements>
                      </>
                    }

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
                      {console.log(appointments, "appointmentsappointmentsappointments")}
                      {appointments.length > 1 && <Button
                        variant="danger"
                        size="sm"
                        onClick={() => removeAppointmentForm(index)}
                      >
                        Remove Appointment
                      </Button>}
                    </div>
                  </Accordion.Body>
                </Accordion.Item>
              ))}
            </Accordion>

            <div className="mt-3">
              {!editAppointments && <Button variant="link" onClick={addAppointmentForm}>
                + Add Another Appointment
              </Button>}
            </div>

            {/* Total price & duration */}
            <div className="mt-3">
              <h6>
                Total Duration:{" "}
                {appointments.length && appointments.reduce((sum, a) => {
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
                {appointments.length && appointments
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
        {/* {console.log(appointments, "vvvvvvvvvvvvvvvvvvvvvvvv")} */}
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant="success"
            disabled={!allAppointmentsValid}   // 🔥 disable until valid
            onClick={async () => {
              try {
                setLoader(true)
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
                let response
                if (editAppointments) {
                  console.log(appointments, start.toISODate(), "appointmentsappointments1")
                  const slotDate = appointments[0].time ? DateTime.fromISO(appointments[0].time) : null;
                  const payload1 = {
                    _id: appointments[0]?._id, // 🔑 include appointment id
                    serviceId: appointments[0].serviceId,
                    employeeId: appointments[0].employeeId,
                    userId: appointments[0].userId,
                    note: "Rescheduled via admin",
                    // date: start.toISOString().split("T")[0],
                    // time: start.toTimeString().slice(0, 5),
                    date: selectedSlot ? start.toISODate() : null,
                    time: slotDate ? slotDate.toFormat("HH:mm") : null,
                    deposit: 0,
                    repeat: "Off",
                    file: "",
                    duration: parseInt(appointments[0].duration || 30),
                    price: parseFloat(appointments[0].price || 0),
                  };


                  response = await postApi(config.editAppointments, payload1);
                } else {
                  let paymentIntent
                  if (!cardDetails?.nameOnCard &&
                    cardValidation.cardNumberEmpty &&
                    cardValidation.expiryEmpty &&
                    cardValidation.cvcEmpty) {

                  } else if (cardDetails?.nameOnCard?.trim() &&
                    cardValidation.cardNumberComplete &&
                    cardValidation.expiryComplete &&
                    cardValidation.cvcComplete) {

                    paymentIntent = await handleCardSetup()

                    if (!paymentIntent) {
                      // return
                    }
                  }
                  // const paymentIntent = await handleCardSetup()

                  //       if (!paymentIntent) {
                  //         return
                  //       }
                  // data.paymentIntent = paymentIntent
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
                        status: 'unpaid',
                        repeat: "Off",
                        paymentIntent: paymentIntent ? paymentIntent : undefined
                        // paymentIntent
                      };
                    }),
                  };


                  response = await postApiWithFile(config.addAppointment, payload, {
                    file: selectedFile,
                  });
                }
                setLoader(false)
                if (response.statusCode === 201 || response.statusCode === 200) {
                  alert(response.message);
                  setCardDetails({
                    nameOnCard: "",
                    cardNumber: "",
                    expiry: "",
                    cvc: ""
                  })
                  setShowModal(false);
                  setCustomer("");
                  handleClose()
                  setShowEventModal(false)
                  // 🔁 Refresh the calendar immediately
                  await refreshCalendar();
                } else {
                  setLoader(false)
                  alert("Booking failed: " + response.message);
                }

              } catch (error) {
                setLoader(false)
                console.error("Booking failed:", error);
                alert("Error booking appointment.");
              }
            }}
          >
            {!editAppointments ? "Book" : "Edit"}
          </Button>

        </Modal.Footer>
      </Modal>

      <Modal
        show={showEventModal}
        onHide={() => setShowEventModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Appointment Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {console.log(selectedEvent, "selectedEvent")}
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
                  <p><strong>Start:</strong> {DateTime.fromISO(selectedEvent.startStr).toFormat("MMMM d, yyyy 'at' h:mm a")}</p>
                  <p><strong>End:</strong> {DateTime.fromISO(selectedEvent.endStr).toFormat("MMMM d, yyyy 'at' h:mm a")}</p>
                  <p><strong>Duration:</strong> {selectedEvent.extendedProps?.duration} mins</p>
                  <p><strong>Price:</strong> $ {selectedEvent.extendedProps?.price}</p>
                  <p><strong>Center Name:</strong> {selectedEvent.extendedProps?.centerData?.centerName}</p>
                  <p><strong>Payment Status:</strong> {selectedEvent.extendedProps?.status == 'unpaid' ? 'Un Paid' : selectedEvent.extendedProps?.status}</p>
                  <p><strong>Appt. Status:</strong> {selectedEvent.extendedProps?.apptStatus}{/*{selectedEvent.extendedProps?.status == 'unpaid' && new Date(selectedEvent.startStr) < new Date() ? 'Payment Pending' : selectedEvent.extendedProps?.status == 'paid' ? 'Completed' : selectedEvent.extendedProps?.status == 'unpaid' ? 'Booked Successfully' : selectedEvent.extendedProps?.status} */}
                  </p>

                  {selectedEvent.extendedProps?.note && (
                    <p><strong>Note:</strong> {selectedEvent.extendedProps.note}</p>
                  )}
                </>
              )}
            </>
          )}
        </Modal.Body>


        <Modal.Footer>
          {selectedEvent?.extendedProps?.status == 'unpaid' && <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button className="btn btn-primary m-2" onClick={() => takePayment(selectedEvent?.extendedProps?._id)}>Process Payment</button>
            <button className="btn btn-primary m-2" onClick={() => appointmentAddToCart(selectedEvent)}>Add To Cart</button>
            {//selectedEvent.extendedProps.employee.working_time_start
              checkSlotInEmployeeWorkingTime(selectedEvent?.extendedProps, selectedEvent?.extendedProps?.time, selectedEvent?.extendedProps?.duration) &&
              <Button
                className="m-2"
                variant="warning"
                // onClick={() => {
                //   const props = selectedEvent.extendedProps;
                //   console.log(props,"props")
                //   setAppointments([
                //     // _id: props?._id,
                //     // employeeId: props?.employee?._id || "",
                //     // userId: props?.user?._id || "",
                //     // note: props?.note || "",
                //     // date: DateTime.fromISO(selectedEvent.startStr).toISODate(),
                //     // time: DateTime.fromISO(selectedEvent.startStr).toFormat("HH:mm"),
                //     // duration: props?.duration || 30,
                //     props
                //   ]);
                //   {
                //               const value = e.target.value;
                //               const selectedService = services.find((s) => s._id === value);
                //                fetchEmployeesByCenter(value)
                //               setAppointments((prev) =>
                //                 prev.map((a, i) =>
                //                   i === index
                //                     ? {
                //                       ...a,
                //                       serviceId: value,
                //                       cleanupTime: selectedService?.cleanup_time || 0,
                //                       time: "",                 // ✅ reset stale time
                //                       availableSlots: [],       // ✅ reset stale slots
                //                     }
                //                     : a
                //                 )
                //               );

                //               // ✅ require userId as well for first-time fetch
                //               if (value && appt.employeeId && appt.userId && selectedSlot) {
                //                 await fetchAvailableSlots(
                //                   value,
                //                   appt.employeeId,
                //                   selectedSlot.toISODate(),
                //                   index,
                //                   appt.userId
                //                 );
                //               }
                //             }
                //   setShowModal(true);
                //   // setShowEventModal(false);
                //   // setShowEditBreakModal(true);
                // }}
                onClick={async () => {
                  const props = selectedEvent.extendedProps;
                  console.log(props, "props")
                  setEditAppointments(true)
                  setAppointments([
                    // _id: props?._id,
                    // employeeId: props?.employee?._id || "",
                    // userId: props?.user?._id || "",
                    // note: props?.note || "",
                    // date: DateTime.fromISO(selectedEvent.startStr).toISODate(),
                    // time: DateTime.fromISO(selectedEvent.startStr).toFormat("HH:mm"),
                    // duration: props?.duration || 30,
                    props
                  ]);
                  setSelectedSlot(DateTime.fromISO(selectedEvent.startStr))
                  console.log(DateTime.fromISO(selectedEvent.startStr), "DateTime.fromISO(selectedEvent.startStr)")
                  const value = props.serviceId;
                  const selectedService = services.find((s) => s._id === value);
                  fetchEmployeesByCenter(value)
                  // setAppointments((prev) =>
                  //   prev.map((a, i) =>
                  //     i === index
                  //       ? {
                  //         ...a,
                  //         serviceId: value,
                  //         cleanupTime: selectedService?.cleanup_time || 0,
                  //         time: "",                 // ✅ reset stale time
                  //         availableSlots: [],       // ✅ reset stale slots
                  //       }
                  //       : a
                  //   )
                  // );

                  // ✅ require userId as well for first-time fetch
                  if (value) {
                    await fetchAvailableSlots(
                      value,
                      props.employeeId,
                      DateTime.fromISO(selectedEvent.startStr).toISODate(),
                      0,
                      props.userId
                    );
                  }
                  setShowModal(true);

                }}
              >
                Edit Appt
              </Button>}
            <Button
              className="m-2"
              variant="danger"
              onClick={async () => {
                try {
                  const props = selectedEvent.extendedProps;
                  const payload = {
                    _id: props?._id,
                    employeeId: props?.employee?._id || "",
                    userId: props?.user?._id || "",
                    status: 'notPaid'
                  };
                  const res = await postApi(config.editAppointments, payload);
                  if (res.statusCode === 200) {
                    alert("Appointment deleted successfully!");
                    await refreshCalendar();  // ✅ refresh here
                    setShowEventModal(false);

                  }
                  else {
                    alert(res.message || "Failed to delete break");
                  }
                } catch (error) {
                  console.error("Delete appointment error:", error);
                  alert("Error deleting appointment. Please try again later.");
                }
              }}
            >
              Delete Appt
            </Button>
          </div>}
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
                      await refreshCalendar();  // ✅ refresh here
                      setShowEventModal(false);

                    }
                    else {
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
                  className={`addon-row d-flex justify-content-between align-items-start p-3 mb-3 rounded shadow-sm ${appointments[activeAddonIndex]?.addonId === addon._id
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
                const payload1 = {
                  _id: editBreakForm?._id,
                  employeeId: editBreakForm.employeeId,
                  note: editBreakForm.note,
                  date: editBreakForm.date,
                  time: editBreakForm.time,
                  duration: parseInt(editBreakForm.duration),
                };
                const res = await postApi(config.editBreakFromAdmin, payload1);
                if (res.statusCode === 200) {
                  alert("Break updated successfully!");
                  await refreshCalendar();  // ✅ refresh here
                  setShowEditBreakModal(false);
                }
                else {
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

      <Modal
        show={appointmentTypeSelectionModel}
        onHide={() => setAppointmentTypeSelectionModel(false)}
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
                  setAppointmentTypeSelectionModel(false);
                  setShowModal(true);
                }}
                style={{ cursor: "pointer" }}
              >
                <Card.Body>
                  <i className="bi bi-calendar-plus" style={{ fontSize: "2rem", color: "#198754" }}></i>
                  <h5 className="mt-2">Add Appointment In Working Hours</h5>
                  <p className="text-muted small">Book a new appointment for a client</p>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6}>
              <Card
                className="text-center shadow-sm p-3 hover-card"
                onClick={() => {
                  setAppointmentTypeSelectionModel(false);
                  setAafterWorkingBookModel(true);

                }}
                style={{ cursor: "pointer" }}
              >
                <Card.Body>
                  <i className="bi bi-clipboard-check" style={{ fontSize: "2rem", color: "#0d6efd" }}></i>
                  <h5 className="mt-2">Add Appointment After Working Hours</h5>
                  <p className="text-muted small">Book a new appointment for a client</p>
                </Card.Body>
              </Card>

            </Col>
          </Row>
        </Modal.Body>
      </Modal>

      <Modal
        show={afterWorkingBookModel}
        onHide={() => setAafterWorkingBookModel(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Add Appointment Beyond Working Hours</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            <Accordion activeKey={activeAppointmentKey} onSelect={(key) => setActiveAppointmentKey(key)}>
              {appointmentAfterWorking.length && appointmentAfterWorking.map((appt, index) => (
                <Accordion.Item eventKey={index.toString()} key={index}>
                  {console.log(appt, "for check payment intent")}
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
                            isInvalid={!appt.centerId}
                            value={appt.centerId}
                            onChange={(e) => {
                              const val = e.target.value;
                              setAppointmentAfterWorking((prev) =>
                                prev.map((a, i) =>
                                  i === index
                                    ? { ...a, centerId: val, serviceId: "", employeeId: "", time: "", availableSlots: [] }
                                    : a
                                )
                              );
                              // fetchEmployeesByCenter(val);
                              fetchServices(val);
                            }}
                            disabled={editAppointments}
                          >
                            <option value="" hidden>Select Center</option>
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
                            isInvalid={!appt.serviceId}
                            value={appt.serviceId}
                            onChange={async (e) => {
                              const value = e.target.value;
                              const selectedService = services.find((s) => s._id === value);
                              fetchEmployeesByCenter(value)
                              setAppointmentAfterWorking((prev) =>
                                prev.map((a, i) =>
                                  i === index
                                    ? {
                                      ...a,
                                      serviceId: value,
                                      cleanupTime: selectedService?.cleanup_time || 0,
                                      time: "",                 // ✅ reset stale time
                                      availableSlots: [],       // ✅ reset stale slots
                                    }
                                    : a
                                )
                              );

                              // ✅ require userId as well for first-time fetch
                              if (value && appt.employeeId && appt.userId && selectedSlot) {
                                await checkAvailableNonWorkingHourSlot(
                                  value,
                                  appt.employeeId,
                                  selectedSlot.toISODate(),
                                  index,
                                  appt.userId
                                );
                              }
                            }}
                            disabled={!appt.centerId || (editAppointments && appt.paymentIntent)}
                          >
                            <option value="">Select Service</option>

                            {services
                              .filter((s) => s.status === 1) // ✅ only services with status 1
                              .filter(
                                (s) =>
                                  !getSelectedServices(index).includes(s._id) ||
                                  s._id === appt.serviceId // allow selected item
                              )
                              .map((s) => (
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

                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>
                            Practitioner / Employee <span style={{ color: "red" }}>*</span>
                          </Form.Label>

                          <Select
                            options={centerEmployees
                              .filter((s) => s.status === 1)
                              .filter(
                                (emp) =>
                                  !getSelectedEmployees(index).includes(emp.value) ||
                                  emp.value === appt.employeeId
                              )
                              .map((emp) => ({
                                value: emp.value,
                                label: emp.label,
                                userId: emp.userId,
                              }))}

                            value={
                              centerEmployees
                                .map((emp) => ({
                                  value: emp.value,
                                  label: emp.label,
                                  userId: emp.userId,
                                }))
                                .find((e) => e.value === appt.employeeId) || null
                            }

                            onChange={async (selected) => {
                              const val = selected?.value;
                              const emp = centerEmployees.find((e) => e.value === val);

                              setAppointmentAfterWorking((prev) =>
                                prev.map((a, i) =>
                                  i === index
                                    ? {
                                      ...a,
                                      employeeId: val,
                                      employeeUserId: emp?.userId || "",
                                      time: "",
                                      availableSlots: [],
                                    }
                                    : a
                                )
                              );

                              if (appt.serviceId && val && appt.userId && selectedSlot) {
                                await checkAvailableNonWorkingHourSlot(
                                  appt.serviceId,
                                  val,
                                  selectedSlot.toISODate(),
                                  index,
                                  appt.userId
                                );
                              }
                            }}

                            isSearchable
                            placeholder="Search Employee..."

                            filterOption={(option, inputValue) => {
                              const search = inputValue.toLowerCase();

                              return (
                                option.label.toLowerCase().includes(search)
                              );
                            }}
                          />

                          {!appt.employeeId && (
                            <div style={{ color: "red", fontSize: "12px" }}>
                              Employee is required
                            </div>
                          )}
                        </Form.Group>
                      </Col>

                      {/* User */}
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>
                            Select User <span style={{ color: "red" }}>*</span>
                          </Form.Label>

                          {console.log("appt.userId:", appt.userId)}
                          {console.log("userOptions:", userOptions)}

                          <Select
                            options={userOptions}
                            isDisabled={editAppointments}
                            value={userOptions?.length
                              ? userOptions.find((u) => String(u.value) === String(appt.userId)) || null
                              : null}


                            filterOption={(option, inputValue) => {
                              const search = inputValue.toLowerCase().replace(/\s+/g, "");

                              const name = (option.data.name || "").toLowerCase();
                              const lastName = (option.data.lastName || "").toLowerCase();
                              const fullName = (name + lastName).replace(/\s+/g, "");

                              const email = (option.data.email || "").toLowerCase();

                              const mobile = String(option.data.mobileNo || "")
                                .replace(/\D/g, ""); // keep only numbers


                              return (
                                name.includes(search) ||
                                lastName.includes(search) ||
                                fullName.includes(search) ||
                                email.includes(search) ||
                                mobile.includes(search)
                              );
                            }}

                            onChange={async (selected) => {
                              const nextUserId = selected?.value;

                              setAppointmentAfterWorking((prev) =>
                                prev.map((a, i) =>
                                  i === index
                                    ? { ...a, userId: nextUserId, time: "", availableSlots: [] }
                                    : a
                                )
                              );

                              const svcId = appt.serviceId;
                              const empId = appt.employeeId;

                              if (svcId && empId && nextUserId && selectedSlot) {
                                await checkAvailableNonWorkingHourSlot(
                                  svcId,
                                  empId,
                                  selectedSlot.toISODate(),
                                  index,
                                  nextUserId
                                );
                              }
                            }}

                            isSearchable
                            placeholder="Search by name, email, or mobile"
                          />
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
                            Appointment Note
                          </Form.Label>
                          <Form.Control
                            as="textarea"
                            // required
                            // isInvalid={!appt.note}
                            value={appt.note}
                            onChange={(e) =>
                              setAppointmentAfterWorking((prev) =>
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

                    </Row>

                    <Row className="mt-3">
                      {/* Date */}
                      {console.log(selectedSlot, "selectedSlot")}
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Date</Form.Label>

                          <Form.Control
                            type="date"
                            onChange={async (e) => {
                              const val = e.target.value;

                              const clickedTime = DateTime.fromISO(val);
                              const date = clickedTime.toISODate();
                              const today = DateTime.now().toISODate();

                              if (unavailableDates.includes(date) || date < today) {
                                setAppointmentAfterWorking((prev) =>
                                  prev.map((a, i) =>
                                    i === index ? { ...a, availableSlots: [] } : a
                                  )
                                );
                                return;
                              }

                              setSelectedSlot(clickedTime);

                              if (appt.serviceId && val && appt.userId && clickedTime) {
                                await checkAvailableNonWorkingHourSlot(
                                  appt.serviceId,
                                  appt.employeeId,
                                  clickedTime.toISODate(), // ✅ FIXED
                                  index,
                                  appt.userId
                                );
                              }
                            }}
                            value={selectedSlot ? selectedSlot.toISODate() : ""} // ✅ FIXED
                            min={DateTime.now().toISODate()} // optional improvement
                            disabled={!editAppointments}
                          />
                        </Form.Group>
                      </Col>

                      {/* Time */}
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>
                            Time <span style={{ color: "red" }}>*</span>
                          </Form.Label>
                          <Form.Select
                            required
                            isInvalid={!appt.time}
                            value={appt.time || ""}
                            onChange={(e) =>
                              setAppointmentAfterWorking((prev) =>
                                prev.map((a, i) =>
                                  i === index ? { ...a, time: e.target.value } : a
                                )
                              )
                            }
                          >

                            {appt.availableSlots && appt.availableSlots.length > 0 ? (
                              <>
                                <option value="" hidden>Select Time</option>
                                {appt.availableSlots
                                  .filter((slot) => {
                                    const now = DateTime.now().setZone("America/New_York");

                                    const slotTime = DateTime.fromISO(slot.startTime, {
                                      zone: "utc", // 🔥 force parse as UTC
                                    }).setZone("America/New_York");

                                    console.log(slotTime.toISO(), "slotTime");
                                    console.log(now.toISO(), "now");

                                    return slotTime.toMillis() > now.toMillis(); // ✅ safest comparison
                                  })
                                  .map((slot, i) => (
                                    <option key={i} value={slot.startTime}>
                                      {DateTime.fromISO(slot.startTime, { zone: "utc" })
                                        .setZone("America/New_York")
                                        .toFormat("hh:mm a")}
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
                    </Row>

                    <Row className="mt-3">
                      {/* Price */}
                      {console.log(appt, "lklklkkjk")}
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Price</Form.Label>
                          <Form.Control
                            type="number"
                            value={appt.price}
                            onChange={(e) =>
                              setAppointmentAfterWorking((prev) =>
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
                            isInvalid={!appt.duration || Number(appt.duration) <= 0}
                            value={appt.duration}
                            onChange={(e) =>
                              setAppointmentAfterWorking((prev) =>
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

                  </Accordion.Body>
                </Accordion.Item>
              ))}
            </Accordion>

            <div className="mt-3">
              <h6>
                Total Duration:{" "}
                {appointmentAfterWorking.length && appointmentAfterWorking.reduce((sum, a) => {
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
                {appointmentAfterWorking.length && appointmentAfterWorking
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
        {/* {console.log(appointments, "vvvvvvvvvvvvvvvvvvvvvvvv")} */}
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant="success"
            disabled={!allAppointmentsValidForAfterWorking}   // 🔥 disable until valid
            onClick={async () => {
              try {
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
                let response
                let paymentIntent
                if (editAppointments) {
                  console.log(appointments, start.toISODate(), "appointmentsappointments1")
                  const slotDate = appointments[0].time ? DateTime.fromISO(appointments[0].time) : null;
                  const payload1 = {
                    _id: appointments[0]?._id, // 🔑 include appointment id
                    serviceId: appointments[0].serviceId,
                    employeeId: appointments[0].employeeId,
                    userId: appointments[0].userId,
                    note: "Rescheduled via admin",
                    // date: start.toISOString().split("T")[0],
                    // time: start.toTimeString().slice(0, 5),
                    date: selectedSlot ? start.toISODate() : null,
                    time: slotDate ? slotDate.toFormat("HH:mm") : null,
                    deposit: 0,
                    repeat: "Off",
                    file: "",
                    duration: parseInt(appointments[0].duration || 30),
                    price: parseFloat(appointments[0].price || 0),
                  };


                  response = await postApi(config.editAppointments, payload1);
                } else {
                  if (!cardDetails?.nameOnCard &&
                    cardValidation.cardNumberEmpty &&
                    cardValidation.expiryEmpty &&
                    cardValidation.cvcEmpty) {

                  } else if (cardDetails?.nameOnCard?.trim() &&
                    cardValidation.cardNumberComplete &&
                    cardValidation.expiryComplete &&
                    cardValidation.cvcComplete) {

                    paymentIntent = await handleCardSetup()

                    if (!paymentIntent) {
                      return
                    }
                  }
                  // data.paymentIntent = paymentIntent
                  const payload = {
                    appointments: appointmentAfterWorking.map((a) => {
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
                        status: 'unpaid',
                        repeat: "Off",
                        if(paymentIntent) { paymentIntent }
                      };
                    }),
                  };


                  response = await postApiWithFile(config.addAppointment, payload, {
                    file: selectedFile,
                  });
                }
                if (response.statusCode === 201 || response.statusCode === 200) {
                  alert(response.message);
                  setShowModal(false);
                  setCustomer("");
                  handleClose()
                  setShowEventModal(false)
                  setAafterWorkingBookModel(false)
                  // 🔁 Refresh the calendar immediately
                  await refreshCalendar();
                } else {
                  alert("Booking failed: " + response.message);
                }

              } catch (error) {
                console.error("Booking failed:", error);
                alert("Error booking appointment.");
              }
            }}
          >
            {!editAppointments ? "Book" : "Edit"}
          </Button>

        </Modal.Footer>
      </Modal>
      <style>{`
.fc-daygrid-day-number {
  color: #242121 !important;
  font-weight: 600;
}
`}
      </style>
    </Container >
  );
}

const StripePaymentForm = React.forwardRef(function StripePaymentForm(
  {
    cardDetails,
    setCardDetails,
    handleCardSetup,
    cardValidation,
    setCardValidation
  },
  ref
) {
  const stripe = useStripe();
  const elements = useElements();

  useImperativeHandle(ref, () => ({
    getCardNumberElement: () => elements.getElement(CardNumberElement),
  }));

  return (
    <div className="creditMain mb-4">
      <h6 className="fs-7 mb-md-3 mb-sm-2">Card Details</h6>
      <b>Enter your name as it’s written on your card.</b>

      <div className="inputMain mt-md-3 mt-xl-0 mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Name On Card"
          value={cardDetails.nameOnCard}
          onChange={(e) =>
            setCardDetails({ ...cardDetails, nameOnCard: e.target.value })
          }
        />
      </div>

      <div className="form-control" style={{ padding: "10px" }}>
        <CardNumberElement
          options={{
            disableLink: true,
            style: {
              base: {
                fontSize: "13px", color: "#637381", fontWeight: 400, '::placeholder': { color: '#cec9d5', },
              }
            },
          }}
          onChange={(event) => {
            setCardValidation((prev) => ({
              ...cardValidation,
              cardNumberComplete: event.complete,
              cardNumberEmpty: event.empty,
            }));
          }}
        />
      </div>

      <div className="row mt-3">
        <div className="col-md-6 mb-3">
          <CardExpiryElement className="form-control" options={{
            style: { base: { fontSize: "13px", color: "#637381", fontWeight: 400, '::placeholder': { color: '#cec9d5', }, } },
          }} onChange={(event) => {
            setCardValidation((prev) => ({
              ...cardValidation,
              expiryComplete: event.complete,
              expiryEmpty: event.empty,
            }));
          }} />
        </div>
        <div className="col-md-6">
          <CardCvcElement className="form-control" options={{
            style: { base: { fontSize: "13px", color: "#637381", fontWeight: 400, '::placeholder': { color: '#cec9d5', }, } },
          }} onChange={(event) => {
            setCardValidation((prev) => ({
              ...cardValidation,
              cvcComplete: event.complete,
              cvcEmpty: event.empty,
            }));
          }} />
        </div>
      </div>
    </div>
  );
});
