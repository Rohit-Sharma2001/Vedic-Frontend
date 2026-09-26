"use client";
import { useState } from "react";
import flatpickr from "flatpickr";
import Loader from "services/Loader/page";
import "flatpickr/dist/flatpickr.min.css";
import { useEffect, useRef } from "react";
import '../../../../../app/(landingpage)/LandingPage/public/css/style.css'
import { postApi } from "services/api";
import { config } from "services/config";
import "bootstrap/dist/css/bootstrap.min.css";
import Link from "node_modules/next/link";
import Swal from "sweetalert2";
import StarRating from "services/Reusable/StarRating";
export default function MyAppointments() {
  const [activeTab, setActiveTab] = useState("all");
  const [myAppointments, setMyAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [selectedService, setSelectedService] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [unavailableDates, setUnavailableDates] = useState([]);
  const [loadingUnavailable, setLoadingUnavailable] = useState(false);
  const [pickedDate, setPickedDate] = useState("");
  const [checkSlotResponse, setCheckSlotResponse] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [filterStatus, setFilterStatus] = useState("upcoming");
  const [adminData, setAdminData] = useState()
  const [filterMonth, setFilterMonth] = useState(''); // current month
  const [filterDate, setFilterDate] = useState("");
  const datePickerRef = useRef(null);
  const isSwitchingToSlotsModalRef = useRef(false);

  // Waitlist states
  const [waitlistService, setWaitlistService] = useState("");
  const [waitlistEmployees, setWaitlistEmployees] = useState([]);
  const [waitlistEmployee, setWaitlistEmployee] = useState("");
  const [waitlistEntries, setWaitlistEntries] = useState([
    { key: Date.now(), date: "", time: "" },
  ]);

  // Reviews modal states
  const [selectedEmployeeReview, setSelectedEmployeeReview] = useState(null);
  const [selectedEmployeeReviews, setSelectedEmployeeReviews] = useState([]);


  // Refs for dropdown initialization cleanup
  const dropdownIntervalRef = useRef(null);
  const dropdownTimeoutRef = useRef(null);

  // Re-initialize Bootstrap dropdowns when component mounts or appointments change
  useEffect(() => {
    if (typeof window === "undefined") return;

    const initializeDropdowns = () => {
      const Bootstrap =
        (typeof window !== "undefined" && window.bootstrap) ||
        (typeof bootstrap !== "undefined" ? bootstrap : null);

      if (!Bootstrap || !Bootstrap.Dropdown) return false;

      const dropdownToggles = document.querySelectorAll('[data-bs-toggle="dropdown"]');

      dropdownToggles.forEach((toggle) => {
        try {
          const existing = Bootstrap.Dropdown.getInstance(toggle);
          if (existing) existing.dispose();
          new Bootstrap.Dropdown(toggle);
        } catch (err) {
          console.debug("Dropdown init error:", err);
        }
      });

      return true;
    };

    // delayed init
    dropdownTimeoutRef.current = setTimeout(() => {
      if (!initializeDropdowns()) {
        let retry = 0;
        const max = 50;

        dropdownIntervalRef.current = setInterval(() => {
          retry++;
          if (initializeDropdowns() || retry >= max) {
            clearInterval(dropdownIntervalRef.current);
            dropdownIntervalRef.current = null;
          }
        }, 100);
      }
    }, 100);

    return () => {
      if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
      if (dropdownIntervalRef.current) clearInterval(dropdownIntervalRef.current);
    };
  }, [myAppointments, activeTab]);


  // Add a new date/time entry
  const handleAddWaitlistEntry = () => {
    setWaitlistEntries([...waitlistEntries, { key: Date.now(), date: "", time: "" }]);
  };

  // Remove a specific entry
  const handleRemoveWaitlistEntry = (keyToRemove) => {
    setWaitlistEntries(waitlistEntries.filter((entry) => entry.key !== keyToRemove));
  };

  useEffect(() => {
    const confirmBtn = document.getElementById("confirmCancelBtn");
    if (confirmBtn) {
      confirmBtn.onclick = () => {
        if (cancelTarget) handleCancelAppointment(cancelTarget);
      };
    }
  }, [cancelTarget]);

  // Simple dropdown handling to avoid Bootstrap JS lifecycle issues when navigating
  useEffect(() => {
    const closeOnOutsideClick = (e) => {
      if (!e.target.closest(".appt-more-dropdown")) {
        setOpenDropdownId(null);
      }
    };

    document.addEventListener("click", closeOnOutsideClick);
    return () => document.removeEventListener("click", closeOnOutsideClick);
  }, []);

  const toggleMoreDropdown = (id) => {
    setOpenDropdownId((prev) => (prev === id ? null : id));
  };


  // Update entry values
  const handleWaitlistChange = (key, field, value) => {
    if (field === "date") {
      const min = getTomorrowYMD();
      if (value && value < min) {
        alert("Please select a future date (from tomorrow).");
        return;
      }
    }

    setWaitlistEntries((prev) =>
      prev.map((entry) =>
        entry.key === key ? { ...entry, [field]: value } : entry
      )
    );
  };

  // When service changes → fetch employees
  const handleWaitlistServiceChange = async (serviceId) => {
    setWaitlistService(serviceId);
    try {
      const response = await postApi(config.ViewService, { id: serviceId });
      setWaitlistEmployees(response.data[0]?.employees || []);
    } catch (error) {
      console.error("Failed to fetch employees for waitlist", error);
    }
  };

  // Submit waitlist form
  const handleAddToWaitlist = async () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    if (!waitlistService || !waitlistEmployee || waitlistEntries.length === 0) {
      alert("Please fill all waitlist details");
      return;
    }

    try {
      const payload = {
        data: {
          waitlistData: waitlistEntries.map((entry) => ({
            serviceId: waitlistService,
            employeeId: waitlistEmployee,
            userId: user?._id,
            date: entry.date,
            time: entry.time,
          })),
        },
      };

      const response = await postApi(config.AddToWaitlist, payload);

      if (response.statusCode === 201) {
        alert("Successfully added to waitlist");
        const modal = bootstrap.Modal.getInstance(document.getElementById("addWaitlist"));
        modal?.hide();
      } else {
        alert(`Error: ${response.message}`);
      }
    } catch (error) {
      console.error("Error adding to waitlist:", error);
      alert("Failed to add to waitlist");
    }
  };


  useEffect(() => {
    const modal = document.getElementById("addWaitlist");

    const resetState = () => {
      setWaitlistService("");
      setWaitlistEmployees([]);
      setWaitlistEmployee("");
      setWaitlistEntries([{ key: Date.now(), date: "", time: "" }]);
    };

    modal?.addEventListener("hidden.bs.modal", resetState);

    return () => {
      modal?.removeEventListener("hidden.bs.modal", resetState);
    };
  }, []);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const fetchUnavailableDates = async (serviceId, employeeId, baseDate = null) => {
    if (!serviceId || !employeeId) return;
    try {
      setLoadingUnavailable(true);

      const emp = employees.find((e) => e._id === employeeId);
      if (!emp?.userId) {
        console.warn("Selected employee has no userId");
        return;
      }

      const dateToSend = baseDate || new Date().toISOString().split("T")[0];

      const payload = [
        {
          serviceId,
          employeeId,
          userId: emp.userId,
          date: dateToSend,
        },
      ];

      const res = await postApi(config.GetUnavailableDates, { slotsPayload: payload });

      if (res?.statusCode === 200 && Array.isArray(res.data)) {
        const allUnavailable = res.data.flatMap((emp) => emp.unavailableDates || []);
        const normalized = allUnavailable.map((dateStr) => {
          const d = new Date(dateStr);
          return d.toISOString().split("T")[0];
        });
        setUnavailableDates([...new Set(normalized)]);
      } else {
        setUnavailableDates([]);
      }
    } catch (err) {
      console.error("Error fetching unavailable dates:", err);
      setUnavailableDates([]);
    } finally {
      setLoadingUnavailable(false);
    }
  };


  useEffect(() => {
    if (selectedService && selectedEmployee) {
      fetchUnavailableDates(selectedService, selectedEmployee);
    }
  }, [selectedService, selectedEmployee]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await postApi(config.AllServices, {
          page: 1,
          pageSize: 50,
        });
        setServices(response.data || []);
      } catch (error) {
        console.error("Failed to fetch services:", error);
      }
    };

    fetchServices();
  }, []);

  const fetchEmployees = async (serviceId) => {
    try {
      const response = await postApi(config.ViewService, { id: serviceId });
      setEmployees(response.data[0]?.employees || []);
    } catch (error) {
      console.error("Failed to fetch employees:", error);
    }
  };


  const handleReschedule = async (apptId) => {
    try {
      const appt = myAppointments.find((a) => a._id === apptId);

      if (appt && !canReschedule(appt)) {
        await Swal.fire({
          icon: "info",
          title: "Too late to reschedule",
          text: "Reschedule is allowed only before 24 hours.",
          confirmButtonText: "Okay",
        });
        return;
      }

      setCheckSlotResponse(null);
      setSelectedSlot(null);
      const response = await postApi(config.findAppointment, { _id: apptId });

      if (response?.statusCode === 200 && response.data?.length > 0) {
        const appt = response.data[0];

        setSelectedAppointment(appt);

        setSelectedService(appt.serviceId);

        await fetchEmployees(appt.serviceId);
        setSelectedEmployee(appt.employeeId);

        setPickedDate("");


        fetchUnavailableDates(appt.serviceId, appt.employeeId);

        const booknowModalEl = document.getElementById("booknowModal");
        if (booknowModalEl) {
          const booknowModal =
            bootstrap.Modal.getInstance(booknowModalEl) ||
            new bootstrap.Modal(booknowModalEl);
          booknowModal.show();
        }

      } else {
        alert("Failed to fetch appointment details.");
      }
    } catch (error) {
      console.error("Error calling FindAppointment:", error);
      alert("Something went wrong while fetching appointment.");
    }
  };

  useEffect(() => {
    fetchMyAppointments("upcoming");
  }, []);


  const fetchMyAppointments = async (status) => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    if (!user?._id) {
      console.warn("User not found in localStorage");
      return;
    }
    const body = {
      _id: user._id
    }
    if (status) {
      body['status'] = status
    }
    try {
      const response = await postApi(config.FindAppointmentByUser, body);
      if (response?.data) {
        setMyAppointments(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch appointments for user:", error);
    }
  };
  // Local YYYY-MM-DD for tomorrow
  const getTomorrowYMD = (d = new Date()) => {
    const t = new Date(d);
    t.setDate(t.getDate() + 1);
    const y = t.getFullYear();
    const m = String(t.getMonth() + 1).padStart(2, "0");
    const day = String(t.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };


  // Local YYYY-MM-DD (avoids timezone issues from toISOString())
  const getLocalYMD = (d = new Date()) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  // Filters out past slots only if selected date is t oday
  const filterPastSlotsIfToday = (slots = [], selectedYMD, bufferMinutes = 0) => {
    if (!selectedYMD) return slots;

    const todayYMD = getLocalYMD();
    const isToday = selectedYMD === todayYMD;

    if (!isToday) return slots;

    const nowMs = Date.now() + bufferMinutes * 60 * 1000;

    return slots.filter((s) => {
      const t = new Date(s.startTime).getTime();
      return Number.isFinite(t) && t >= nowMs;
    });
  };

  const getInitials = (name = "") => {
    const words = name.trim().split(" ");
    if (words.length === 1) return words[0][0]?.toUpperCase() || "";
    return (words[0][0] + words[1][0]).toUpperCase();
  };

  // True if appointment date+time is before "now"
  const isPastAppointment = (appt) => {
    if (!appt?.date || !appt?.time) return false;

    // appt.time is "HH:mm"
    const dateYMD = getLocalYMD(new Date(appt.date)); // local yyyy-mm-dd
    const apptDt = new Date(`${dateYMD}T${appt.time}:00`);

    return Number.isFinite(apptDt.getTime()) && apptDt.getTime() < Date.now();
  };


  const canReschedule = (appt) => {
    if (!appt?.date || !appt?.time) return false;
    const dateYMD = appt.date.slice(0, 10); // "2026-06-13"
    const apptDt = new Date(`${dateYMD}T${appt.time}:00`);

    if (isNaN(apptDt.getTime())) return false;

    const diffMs = apptDt.getTime() - Date.now();

    return diffMs >= 24 * 60 * 60 * 1000;
  };


  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const data = { id: "67f4da7497d93651914eb2f7" }; // Replace with actual ID
      const endpoint = config.Viewcategory;
      const response = await postApi(endpoint, data);

      if (response.statusCode === 201) {
        setAdminData({
          icon: null,
          name: response.data.name || '',
          description: response.data.description || '',
          address: response.data.address || '',   // ✅
          email: response.data.email || '',       // ✅
          number: response.data.number || ''      // ✅
        });
      }

    } catch (error) {
      console.error('Error fetching footer data:', error);
    }
  };


  useEffect(() => {
    const dropdowns = document.querySelectorAll(".selectCustome");

    dropdowns.forEach((dropdown) => {
      const selectBtn = dropdown.querySelector(".select-btn");
      const options = dropdown.querySelectorAll(".option");
      const sBtnText = dropdown.querySelector(".sBtn-text");

      if (selectBtn && sBtnText) {
        // Toggle open/close
        selectBtn.addEventListener("click", () => {
          dropdown.classList.toggle("active");
        });

        // Handle option selection
        options.forEach((option) => {
          option.addEventListener("click", () => {
            const selectedText = option.querySelector(".option-text").innerHTML;
            sBtnText.innerHTML = selectedText;
            dropdown.classList.remove("active");
          });
        });
      }
    });
  }, []);

  const handleSearch = async () => {
    if (!selectedService || !selectedEmployee || !pickedDate) {
      alert("Please select service, employee, and date.");
      return;
    }

    try {
      const emp = employees.find((e) => e._id === selectedEmployee);
      if (!emp?.userId) {
        alert("Employee userId not found.");
        return;
      }

      // ✅ Build array payload
      const slotsPayload = [
        {
          serviceId: selectedService,
          employeeId: selectedEmployee,
          userId: emp.userId,
          date: pickedDate, // already fixed to local date in flatpickr onChange
        },
      ];

      const res = await postApi(config.CheckSlots, { slotsPayload });
      // console.log("CheckSlots result:", res);

      if (res?.slots?.length) {
        setCheckSlotResponse(res);
      } else {
        setCheckSlotResponse(null);
      }


      // Close booknow modal and open gotodate modal
      const booknowModalEl = document.getElementById("booknowModal");
      const gotodateModalEl = document.getElementById("gotodate");

      if (booknowModalEl && gotodateModalEl) {
        const booknowModal =
          bootstrap.Modal.getInstance(booknowModalEl) ||
          new bootstrap.Modal(booknowModalEl);
        isSwitchingToSlotsModalRef.current = true;
        booknowModal.hide();

        const gotodateModal =
          bootstrap.Modal.getInstance(gotodateModalEl) ||
          new bootstrap.Modal(gotodateModalEl);
        gotodateModal.show();
        // reset flag after gotodate is actually shown
        const onShown = () => {
          isSwitchingToSlotsModalRef.current = false;
          gotodateModalEl.removeEventListener("shown.bs.modal", onShown);
        };
        gotodateModalEl.addEventListener("shown.bs.modal", onShown);
      }
    } catch (error) {
      console.error("Error calling CheckSlots:", error);
      alert("Failed to check slots.");
    }
  };

  useEffect(() => {
    const gotodateModalEl = document.getElementById("gotodate");
    if (!gotodateModalEl) return;

    const onHidden = () => {
      setSelectedSlot(null);
      setCheckSlotResponse(null);
      // optional: keep pickedDate or clear it
      // setPickedDate("");
    };

    gotodateModalEl.addEventListener("hidden.bs.modal", onHidden);
    return () => gotodateModalEl.removeEventListener("hidden.bs.modal", onHidden);
  }, []);


  // 📍 Add this inside MyAppointments component, near other handler functions

  const handleCancelAppointment = async (apptId) => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (!user?._id) {
        alert("User not found. Please login again.");
        return;
      }

      const response = await postApi(config.cancelAppointment, {
        appointmentId: apptId,
        userId: user._id,
      });

      if (response?.statusCode === 200) {
        alert("Appointment cancelled successfully!");

        // ✅ Update appointment status locally
        setMyAppointments((prev) =>
          prev.map((appt) =>
            appt._id === apptId ? { ...appt, status: "cancelled" } : appt
          )
        );
      } else {
        alert(response?.message || "Unable to cancel appointment.");
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      alert("Something went wrong while cancelling appointment.");
    }
  };

  const handleFinalBooking = async () => {
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


  useEffect(() => {
    if (!datePickerRef.current) return;

    // Apply new disabled dates to existing instance
    datePickerRef.current.set("disable", unavailableDates);
    datePickerRef.current.redraw();
  }, [unavailableDates]);


  useEffect(() => {
    const modal = document.getElementById("booknowModal");
    if (!modal) return;

    const onHidden = () => {
      if (datePickerRef.current) {
        datePickerRef.current.destroy();
        datePickerRef.current = null;
      }
      // 🔥 IMPORTANT: when we close booknowModal because we are opening gotodate,
      // do NOT clear slots/date state (it will wipe gotodate UI).
      if (isSwitchingToSlotsModalRef.current) return;
      setPickedDate("");
      setCheckSlotResponse(null);
      setSelectedSlot(null);
    };

    modal.addEventListener("hidden.bs.modal", onHidden);
    return () => modal.removeEventListener("hidden.bs.modal", onHidden);
  }, []);


  useEffect(() => {
    const modal = document.getElementById("booknowModal");
    if (!modal) return;

    const handleShown = () => {
      setTimeout(() => {

        if (datePickerRef.current) {
          datePickerRef.current.destroy();
          datePickerRef.current = null;
        }

        // Re-init AFTER modal fully rendered
        datePickerRef.current = flatpickr("#datePicker", {
          dateFormat: "Y-m-d",
          inline: true,
          minDate: getTomorrowYMD(),
          disable: unavailableDates,

          onChange(selectedDates, dateStr, instance) {
            if (selectedDates.length > 0) {
              const localDate = instance.formatDate(selectedDates[0], "Y-m-d");
              setPickedDate(localDate);
            }
          },

          onMonthChange(selectedDates, dateStr, instance) {
            const firstDay = `${instance.currentYear}-${String(
              instance.currentMonth + 1
            ).padStart(2, "0")}-01`;
            fetchUnavailableDates(selectedService, selectedEmployee, firstDay);
          },

          onYearChange(selectedDates, dateStr, instance) {
            const firstDay = `${instance.currentYear}-${String(
              instance.currentMonth + 1
            ).padStart(2, "0")}-01`;
            fetchUnavailableDates(selectedService, selectedEmployee, firstDay);
          },
        });
      }, 150); // Important delay, ensures modal finished animating
    };

    modal.addEventListener("shown.bs.modal", handleShown);

    return () => {
      modal.removeEventListener("shown.bs.modal", handleShown);
    };
  }, [selectedService, selectedEmployee, unavailableDates]);

  // REPLACE the existing applyDateFilters function WITH:
  const applyDateFilters = (list) => {
    return list.filter((appt) => {
      if (!appt?.date) return true;

      const apptDate = new Date(appt.date);
      const apptMonth = apptDate.getUTCMonth() + 1;  // 1-12
      const apptDay = apptDate.getUTCDate();        // 1-31

      const monthMatch = filterMonth === "" || apptMonth === filterMonth;
      const dateMatch = filterDate === "" || apptDay === filterDate;

      return monthMatch && dateMatch;
    });
  };
  // Derived lists
  const filteredAll = applyDateFilters(myAppointments);
  const myOwnAppointments = applyDateFilters(myAppointments.filter((appt) => !appt.familyMemberId));
  const familyAppointments = applyDateFilters(myAppointments.filter((appt) => appt.familyMemberId));

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

  return (
    <>
      {loadingUnavailable && <Loader />}

      <div className="cardBox h-100">
        {/* <div className="d-md-flex gap-3 justify-content-between mb-4">
          <ul className="nav nav-tabs appointmentsTB mb-md-0 mb-3">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "all" ? "active" : ""}`}
                onClick={() => handleTabClick("all")}
              >
                All Appointments
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "mine" ? "active" : ""}`}
                onClick={() => handleTabClick("mine")}
              >
                My Appointments
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "family" ? "active" : ""}`}
                onClick={() => handleTabClick("family")}
              >
                Family & Friends Appointments
              </button>
            </li>
            <li className="nav-item d-flex align-items-center ms-2">
              <select
                className="form-select form-select-sm"
                style={{ minWidth: "130px" }}
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value === "" ? "" : Number(e.target.value))}
              >
                <option value="">All Months</option>
                {["January", "February", "March", "April", "May", "June",
                  "July", "August", "September", "October", "November", "December"
                ].map((m, i) => (
                  <option key={i + 1} value={i + 1}>{m}</option>
                ))}
              </select>
            </li>
            <li className="nav-item d-flex align-items-center ms-2">
              <select
                className="form-select form-select-sm"
                style={{ minWidth: "110px" }}
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value === "" ? "" : Number(e.target.value))}
              >
                <option value="">All Days</option>
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                  <option key={day} value={day}>Day {day}</option>
                ))}
              </select>
            </li>
          </ul>

    <div className="d-flex align-items-center gap-2">
  <select
    value={filterStatus}
    onChange={(e) => {
      const value = e.target.value;
      setFilterStatus(value);
      fetchMyAppointments(value);
    }}
    className="form-select"
    style={{
      width: "120px",
      height: "35px",
    }}
  >
    <option value="all">All</option>
    <option value="upcoming">Upcoming</option>
    <option value="cancelled">Cancelled</option>
    <option value="paid">Completed</option>
  </select>

  <button
    type="button"
    className="btn btn-outline-secondary"
    style={{
      width: "120px",
      height: "35px",
    }}
    onClick={() => {
      setFilterMonth(new Date().getMonth() + 1);
      setFilterDate(new Date().getUTCDate());
      setFilterStatus("all");
      fetchMyAppointments("all");
    }}
  >
    Clear
  </button>
</div>

        </div> */}
<div className="d-md-flex gap-3 justify-content-between align-items-center mb-4 flex-wrap">

  {/* Left Section */}
  <div className="d-flex flex-wrap align-items-center gap-2">

    {/* Tabs */}
    <ul className="nav nav-tabs appointmentsTB mb-0">
      <li className="nav-item">
        <button
          className={`nav-link ${activeTab === "all" ? "active" : ""}`}
          onClick={() => handleTabClick("all")}
        >
          All Appointments
        </button>
      </li>

      <li className="nav-item">
        <button
          className={`nav-link ${activeTab === "mine" ? "active" : ""}`}
          onClick={() => handleTabClick("mine")}
        >
          My Appointments
        </button>
      </li>

      <li className="nav-item">
        <button
          className={`nav-link ${activeTab === "family" ? "active" : ""}`}
          onClick={() => handleTabClick("family")}
        >
          Family & Friends Appointments
        </button>
      </li>
    </ul>

    {/* Month Filter */}
     <div className="d-flex gap-2 align-items-center">
    <select
      className="form-select"
      style={{ width: "86px", height: "38px"}}
      value={filterMonth}
      onChange={(e) =>
        setFilterMonth(
          e.target.value === "" ? "" : Number(e.target.value)
        )
      }
    >
      <option value="">All Months</option>
      {[
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ].map((m, i) => (
        <option key={i + 1} value={i + 1}>
          {m}
        </option>
      ))}
    </select>

    {/* Day Filter */}
     <select
      className="form-select"
      style={{  width: "93px", height: "38px" }}
      value={filterDate}
      onChange={(e) =>
        setFilterDate(
          e.target.value === "" ? "" : Number(e.target.value)
        )
      }
    >
      <option value="">All Days</option>
      {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
        <option key={day} value={day}>
          Day {day}
        </option>
      ))}
    </select>
  </div>
  {/* </div> */}

  {/* Right Section */}
  {/* <div className="d-flex align-items-center gap-2"> */}
    <select
      value={filterStatus}
      onChange={(e) => {
        const value = e.target.value;
        setFilterStatus(value);
        fetchMyAppointments(value);
      }}
      className="form-select form-select-sm"
      style={{  width: "86px", height: "38px"}}
    >
      <option value="all">All</option>
      <option value="upcoming">Upcoming</option>
      <option value="cancelled">Cancelled</option>
      <option value="paid">Completed</option>
    </select>

    <button
      type="button"
     style={{ border: "1px solid #0B2239",
    borderRadius: "5px",
    color: "#0B2239",
    width: "40px", height: "38px"}  }
      onClick={() => {
        setFilterMonth("");
        setFilterDate("");
        setFilterStatus("upcoming");
        fetchMyAppointments("all");
      }}
    >
      X
    </button>
  </div>

</div>

        <div className="tab-content">
          {activeTab === "all" && (
            <div className="tab-pane fade show active">

              {filteredAll.length === 0 ? (
                <div className="noAppointment text-center">
                  <lottie-player
                    src="/images/landingpage/not-available.json"
                    background="transparent"
                    speed="1"
                    style={{ width: "250px", height: "250px", margin: "auto" }}
                    loop
                    autoPlay
                  ></lottie-player>
                  <h3>No Appointments</h3>
                  <p>You do not have any appointments yet.</p>

                  <Link href="/Appointment/components/BookAppointment">
                    <button className="btn btn-primary mt-3">Book Now</button>
                  </Link>
                </div>
              ) : (
                <ul className="d-block">
                  { [...filteredAll].sort((a, b) => {
  const dateA = new Date(
    `${a.date?.slice(0, 10)}T${a.time || "00:00"}:00`
  );

  const dateB = new Date(
    `${b.date?.slice(0, 10)}T${b.time || "00:00"}:00`
  );

  return dateA - dateB; // ascending
}).map((appt) => (

                    <li key={appt._id} className="mb-3 d-block">
                      <div className="appointmentCntent d-md-flex justify-content-between align-items-center gap-3">
                        <div className="appointmentName d-flex gap-3 align-items-center mb-md-0 mb-3">
                          <figure className="mb-0">
                            {/* <div
                              className="d-flex justify-content-center align-items-center"
                              style={{
                                width: "100px",
                                height: "90px",
                                backgroundColor: "#E0E0E0",
                                fontSize: "34px",
                                fontWeight: "bold",
                                color: "#662A09",
                                borderRadius: "3px",
                              }}
                            >
                              {getInitials(
                                appt?.employee?.userDetails?.name
                              )}
                            </div> */}

                            <img src={`${process.env.NEXT_PUBLIC_API_URL}/${appt?.employee?.userDetails?.file}`} alt="" />
                          </figure>
                          <div className="appointmentprcetxt">
                            <strong>Vedic Yours Ayurveda</strong>
                            <p>{appt?.service?.name || "Service"}</p>
                            <strong>with {appt?.employee?.userDetails?.name || "Employee"}</strong>
                            {appt?.familyMemberId ?
                              <p className="text-muted fs-8">
                                For: <b>{appt?.familyMember?.firstName} {appt?.familyMember?.lastName}</b>
                              </p> : <p className="text-muted fs-8">
                                For: <b>{appt?.user?.name} </b>
                              </p>}


                            <strong className="pricestarting">
                              Price <b>${appt?.price}</b>
                            </strong>
                          </div>
                        </div>
                        <div className="appointmentStatus mb-md-0 mb-3">
                          <p className="mb-1 fs-8">
                            {new Date(appt.date).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              timeZone: "UTC"
                            })}{" "}
                            - {convertTo12HourFormat(appt.time)}
                          </p>
                          <span className={`badge ${appt?.status == 'cancelled' ? 'text-bg-danger' : appt?.status == 'notPaid' ? 'text-bg-warning' : appt?.status == 'unpaid' ? 'text-bg-warning' : 'text-bg-success'} rounded-1`}>{appt?.status}</span>
                        </div>
                        <div className="appointmentButton">

                          <button
                            type="button"
                            className="btn btn-primary d-block mb-2 w-100"

                            disabled={isPastAppointment(appt) || appt?.status === "cancelled"}


                            onClick={() => handleReschedule(appt._id)}
                          >
                            Reschedule
                          </button>

                          <div className="dropdown appt-more-dropdown mb-2">
                            <a
                              href=""
                              className="btn btn-orange d-block"
                              onClick={(e) => {
                                e.preventDefault();
                                toggleMoreDropdown(appt._id);
                              }}
                              aria-expanded={openDropdownId === appt._id}
                            >
                              More <i className="bi bi-chevron-down"></i>
                            </a>
                            <div className={`dropdown-menu ${openDropdownId === appt._id ? "show" : ""}`}>
                              <ul>
                                <li>
                                  <Link href={'/LandingPage/components/ContactUsPage'}>Get Directions</Link>
                                </li>
                                {/* <li>
                                  <a data-bs-toggle="modal" data-bs-target="#chatMdl">Chat</a>
                                </li> */}
                                <li>

                                  <Link href={`/Appointment/components/view-Business/${appt.serviceId} `} >
                                    View Business
                                  </Link>
                                </li>
                                {appt?.status !== "cancelled" && appt?.status !== "paid" && !isPastAppointment(appt) && <li>
                                  <a
                                    href="#cancelModal"
                                    data-bs-toggle="modal"
                                    onClick={() => setCancelTarget(appt._id)}
                                  >
                                    Cancel Appointment
                                  </a>
                                </li>}

                              </ul>
                            </div>
                          </div>
                          <span >Please call the office at {adminData ? adminData.number : ""}</span>
                        </div>
                      </div>
                    </li>
                  ))}

                </ul>
              )}

            </div>
          )}


          {activeTab === "mine" && (
            <div className="tab-pane fade show active">

              {myOwnAppointments.length === 0 ? (
                <div className="noAppointment text-center">
                  <lottie-player
                    src="/images/landingpage/not-available.json"
                    background="transparent"
                    speed="1"
                    style={{ width: "250px", height: "250px", margin: "auto" }}
                    loop
                    autoPlay
                  ></lottie-player>
                  <h3>No Appointments</h3>
                  <p>You do not have any personal appointments yet.</p>

                  <Link href="/Appointment/components/BookAppointment">
                    <button className="btn btn-primary mt-3">Book Now</button>
                  </Link>
                </div>
              ) : (
                <ul className="d-block">
                  {myOwnAppointments.map((appt) => (

                    <li key={appt._id} className="mb-3 d-block">
                      <div className="appointmentCntent d-md-flex justify-content-between align-items-center gap-3">
                        <div className="appointmentName d-flex gap-3 align-items-center mb-md-0 mb-3">
                          <figure className="mb-0">
                            {/* <div
                              className="d-flex justify-content-center align-items-center"
                              style={{
                                width: "100px",
                                height: "90px",
                                backgroundColor: "#E0E0E0",
                                fontSize: "34px",
                                fontWeight: "bold",
                                color: "#662A09",
                                borderRadius: "3px",
                              }}
                            >
                              {getInitials(
                                appt?.employee?.userDetails?.name
                              )}
                              
                            </div> */}


                            <img src={`${process.env.NEXT_PUBLIC_API_URL}/${appt?.employee?.userDetails?.file}`} alt="" />
                          </figure>
                          <div className="appointmentprcetxt">
                            <strong>Vedic Yours Ayurveda</strong>
                            <p>{appt?.service?.name || "Service"}</p>
                            <strong>with {appt?.employee?.userDetails?.name || "Employee"}</strong>
                            <p className="text-muted fs-8">
                              For: <b>{appt?.user?.name} </b>
                            </p>
                            <strong className="pricestarting">
                              Price <b>${appt?.price}</b>
                            </strong>
                          </div>
                        </div>
                        <div className="appointmentStatus mb-md-0 mb-3">
                          <p className="mb-1 fs-8">
                            {new Date(appt.date).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              timeZone: "UTC"
                            })}{" "}
                            - {appt.time}
                          </p>
                          <span className={`badge ${appt?.status == 'cancelled' ? 'text-bg-danger' : appt?.status == 'notPaid' ? 'text-bg-warning' : appt?.status == 'unpaid' ? 'text-bg-warning' : 'text-bg-success'} rounded-1`}>{appt?.status}</span>
                        </div>
                        <div className="appointmentButton">
                          <button
                            type="button"
                            className="btn btn-primary d-block mb-2"

                            disabled={isPastAppointment(appt) || appt?.status === "cancelled"}


                            onClick={() => handleReschedule(appt._id)}
                          >
                            Reschedule
                          </button>
                          <div className="dropdown appt-more-dropdown">
                            <a
                              href=""
                              className="btn btn-orange d-block"
                              onClick={(e) => {
                                e.preventDefault();
                                toggleMoreDropdown(appt._id);
                              }}
                              aria-expanded={openDropdownId === appt._id}
                            >
                              More <i className="bi bi-chevron-down"></i>
                            </a>
                            <div className={`dropdown-menu ${openDropdownId === appt._id ? "show" : ""}`}>
                              <ul>
                                <li>
                                  <Link href={'/LandingPage/components/ContactUsPage'}>Get Directions</Link>
                                </li>
                                {/* <li>

                                  <a data-bs-toggle="modal" data-bs-target="#chatMdl">Chat</a>
                                </li> */}
                                <li>
                                  <Link href={`/Appointment/components/view-Business/${appt.serviceId} `} >
                                    View Business
                                  </Link>
                                </li>
                                {appt?.status !== "cancelled" && !isPastAppointment(appt) && <li>
                                  <a
                                    href="#cancelModal"
                                    data-bs-toggle="modal"
                                    onClick={() => setCancelTarget(appt._id)}
                                  >
                                    Cancel Appointment
                                  </a>
                                </li>}

                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}

                </ul>
              )}

            </div>
          )}


          {activeTab === "family" && (
            <div className="tab-pane fade show active">
              {familyAppointments.length === 0 ? (<>
                <div className="noAppointment">
                  <lottie-player
                    src="/images/landingpage/not-available.json"
                    background="transparent"
                    speed="1"
                    style={{ width: "250px", height: "250px", margin: "auto" }}
                    loop
                    autoPlay
                  ></lottie-player>
                  <h3>No Appointments</h3>
                  <p>You do not have any family/friend appointments.</p>
                  <Link href="/Appointment/components/BookAppointment">
                    <button className="btn btn-primary mt-3">Book Now</button>
                  </Link>
                </div>
              </>
              ) : (
                <ul className="d-block">
                  {familyAppointments.map((appt) => (
                    <li key={appt._id} className="mb-3 d-block">
                      <div className="appointmentCntent d-md-flex justify-content-between align-items-center gap-3">
                        <div className="appointmentName d-flex gap-3 align-items-center mb-md-0 mb-3">
                          <figure className="mb-0">
                            {/* <div
                              className="d-flex justify-content-center align-items-center"
                              style={{
                                width: "100px",
                                height: "90px",
                                backgroundColor: "#E0E0E0",
                                fontSize: "34px",
                                fontWeight: "bold",
                                color: "#662A09",
                                borderRadius: "3px",
                              }}
                            >
                              {getInitials(appt?.employee?.userDetails?.name)}
                            </div> */}



                            <img src={`${process.env.NEXT_PUBLIC_API_URL}/${appt?.employee?.userDetails?.file}`} alt="" />
                          </figure>

                          <div className="appointmentprcetxt">
                            <strong>Vedic Yours Ayurveda</strong>

                            {/* SERVICE */}
                            <p>{appt?.service?.name}</p>

                            {/* PRACTITIONER */}
                            <strong>with {appt?.employee?.userDetails?.name}</strong>

                            {/* NAME OF FAMILY MEMBER */}
                            <p className="text-muted fs-8">
                              For: <b>{appt?.familyMember?.firstName} {appt?.familyMember?.lastName}</b>
                            </p>

                            <strong className="pricestarting">
                              Price <b>${appt?.price}</b>
                            </strong>
                          </div>
                        </div>

                        <div className="appointmentStatus mb-md-0 mb-3">
                          <p className="mb-1 fs-8">
                            {new Date(appt.date).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              timeZone: "UTC"
                            })}{" "}
                            - {appt.time}
                          </p>
                          <span className={`badge ${appt?.status == 'cancelled' ? 'text-bg-danger' : appt?.status == 'notPaid' ? 'text-bg-warning' : appt?.status == 'unpaid' ? 'text-bg-warning' : 'text-bg-success'} rounded-1`}>{appt?.status}</span>
                        </div>

                        <div className="appointmentButton">
                          <button
                            type="button"
                            className="btn btn-primary d-block mb-2"
                            disabled={isPastAppointment(appt) || appt?.status === "cancelled"}

                            onClick={() => handleReschedule(appt._id)}
                          >
                            Reschedule

                          </button>

                          <div className="dropdown appt-more-dropdown">
                            <a
                              href=""
                              className="btn btn-orange d-block"
                              onClick={(e) => {
                                e.preventDefault();
                                toggleMoreDropdown(appt._id);
                              }}
                              aria-expanded={openDropdownId === appt._id}
                            >
                              More <i className="bi bi-chevron-down"></i>
                            </a>
                            <div className={`dropdown-menu ${openDropdownId === appt._id ? "show" : ""}`}>
                              <ul>
                                <li>
                                  <Link href={'/LandingPage/components/ContactUsPage'}>
                                    Get Directions
                                  </Link>
                                </li>
                                {/* <li>
                                  <a data-bs-toggle="modal" data-bs-target="#chatMdl">
                                    Chat
                                  </a>
                                </li> */}
                                <li>
                                  <Link
                                    href={`/Appointment/components/view-Business/${appt.serviceId}`}
                                  >
                                    View Business
                                  </Link>
                                </li>


                                {appt?.status !== "cancelled" && !isPastAppointment(appt) && (
                                  <li>
                                    <a
                                      href="#cancelModal"
                                      data-bs-toggle="modal"
                                      onClick={() => setCancelTarget(appt._id)}
                                    >
                                      Cancel Appointment
                                    </a>
                                  </li>
                                )}

                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Reschedule Calendar Modal */}
      <div
        className="modal fade booknowModal"
        id="booknowModal"
        tabIndex={-1}
        aria-labelledby="booknowModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 rounded-1">
            <div className="modal-header border-0">
              <h1 className="modal-title fs-6">
                Appointment{" "}
                {selectedService && (
                  <span className="fs-7 fw-normal">
                    (
                    {services.find((s) => s._id === selectedService)?.name || "Select Service"}
                    )
                  </span>
                )}
              </h1>

              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <div className="border d-flex flex-wrap">
                <div className="detailsDiv border-end">
                  <h3 className="fs-7 mb-3 fw-semibold text-brown">Details</h3>

                  <div className="form-group mb-3">
                    <select
                      className="form-select"
                      value={selectedService}
                      onChange={(e) => {
                        const value = e.target.value;
                        setSelectedService(value);
                        if (value) fetchEmployees(value);
                      }}
                      disabled
                      readOnly
                    >
                      <option value="">Select Service</option>
                      {services.map((service) => (
                        <option key={service._id} value={service._id}>
                          {service.name}
                        </option>
                      ))}
                    </select>

                  </div>

                  <div className="form-group mb-3">
                    <select
                      className="form-select"
                      value={selectedEmployee}
                      onChange={(e) => setSelectedEmployee(e.target.value)}
                      disabled
                      readOnly
                    >
                      <option value="">Select Employee</option>
                      {employees.map((emp) => (
                        <option key={emp._id} value={emp._id}>
                          {emp.name}
                        </option>
                      ))}
                    </select>

                  </div>
                  <div className="form-group mb-3">
                    <input
                      type="date"
                      className="form-control"
                      value={pickedDate}
                      disabled // 🔒 disable manual typing
                      readOnly
                    />
                  </div>


                  <div className="searchBtn">
                    <button type="button" className="btn btn-primary fs-7 w-100" onClick={handleSearch}>
                      Search
                    </button>
                  </div>
                </div>
                <div className="selectDatDiv">
                  <div className="selectDateTitle" id="selectDate">
                    Select Date and Click Search Button
                  </div>

                  <div id="datePicker"></div>


                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Go to Date Modal */}
      <div className="modal fade booknowModal" id="gotodate" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 rounded-1">
            <div className="modal-header border-0">
              <h1 className="modal-title fs-6">
                Appointment{" "}
                {selectedService && (
                  <span className="fs-7 fw-normal">
                    (
                    {services.find((s) => s._id === selectedService)?.name || "Select Service"}
                    )
                  </span>
                )}
              </h1>

              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <div className="border d-flex flex-wrap">
                <div className="detailsDiv border-end">
                  <h3 className="fs-7 mb-3 fw-semibold text-brown">Details</h3>

                  <div className="form-group mb-3">
                    <select className="form-select" value={selectedService} disabled>
                      <option value="">Select Service</option>
                      {services.map((service) => (
                        <option key={service._id} value={service._id}>
                          {service.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group mb-3">
                    <select className="form-select" value={selectedEmployee} disabled>
                      <option value="">Select Employee</option>
                      {employees.map((emp) => (
                        <option key={emp._id} value={emp._id}>
                          {emp.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group mb-3">
                    <input
                      type="date"
                      className="form-control"
                      value={pickedDate}
                      disabled
                    />
                  </div>



                  <div className="searchBtn">
                    <button
                      type="button"
                      className="btn btn-primary fs-7 w-100"
                      disabled={!selectedSlot}
                      onClick={handleFinalBooking}
                    >
                      Book Appointment
                    </button>
                  </div>



                </div>
                <div className="selectDatDiv">
                  <div className="scrollBr">
                    {checkSlotResponse?.slots?.length > 0 ? (
                      checkSlotResponse.slots.map((empGroup, empIndex) => {
                        const visibleSlots = filterPastSlotsIfToday(empGroup.slots, pickedDate, 0);
                        return (
                          <div key={empGroup.employeeData?._id || empIndex} className="mb-4">
                            {/* Employee Info */}
                            <div className="textprfile d-md-flex justify-content-between flex-wrap">
                              <div
                                className="d-flex align-items-center gap-3"
                                data-bs-toggle="modal"
                                data-bs-target="#ratingModal"
                                style={{ cursor: "pointer" }}
                                onClick={() => {
                                  setSelectedEmployeeReview(empGroup?.employeeData);
                                  setSelectedEmployeeReviews(empGroup?.reviews || {});
                                }}
                              >
                                <figure className="m-0">
                                  {/* <div
                                  className="d-flex justify-content-center align-items-center rounded-circle"
                                  style={{
                                    width: "60px",
                                    height: "60px",
                                    backgroundColor: "#E0E0E0",
                                    fontSize: "26px",
                                    fontWeight: "bold",
                                    color: "#662A09",
                                  }}
                                >
                                  {getInitials(empGroup?.employeeData?.userDetails?.name)}
                                </div> */}


                                  <img src={`${process.env.NEXT_PUBLIC_API_URL}/${empGroup?.employeeData?.userDetails?.file}`} alt="" />
                                </figure>
                                <div>
                                  <span className="fw-semibold">
                                    {empGroup?.employeeData?.userDetails?.name}
                                  </span>
                                  <div className="my-1">
                                    <StarRating
                                      value={
                                        empGroup?.reviews?.average?.overall_review
                                      }
                                      size={16}
                                    />
                                    <strong className="ms-1">
                                      ({empGroup?.reviews?.data?.length || 0})
                                    </strong>
                                  </div>
                                </div>
                              </div>

                              <span>
                                OR{" "}
                                <button className="btn btn-primary ms-2" type="button" data-bs-toggle="modal" data-bs-target="#addWaitlist">
                                  Add to waitlist
                                </button>
                              </span>
                            </div>

                            {/* Date */}
                            <strong className="fw-semibold my-4 d-block">
                              {pickedDate &&
                                new Date(pickedDate).toLocaleDateString("en-US", {
                                  weekday: "short",
                                  month: "short",
                                  day: "2-digit",
                                  year: "numeric",
                                })}
                            </strong>

                            {/* Morning Slots */}
                            <span className="fw-medium">Morning</span>
                            <div className="d-flex flex-wrap gap-2 mt-2 mb-3">
                              {visibleSlots
                                .filter((slot) => new Date(slot.startTime).getHours() < 12)
                                .map((slot, i) => (
                                  <button
                                    type="button"
                                    key={`morning-${empIndex}-${i}`}
                                    className={`btn fs-9 rounded-5 px-4 serviceBtn overflow-hidden ${selectedSlot?.slot?.startTime === slot.startTime &&
                                      selectedSlot?.empGroup?.employeeData?._id === empGroup.employeeData?._id
                                      ? "btn-greenslot"
                                      : "btn-orange"
                                      }`}
                                    onClick={() => {
                                      // Toggle logic
                                      if (
                                        selectedSlot?.slot?.startTime === slot.startTime &&
                                        selectedSlot?.empGroup?.employeeData?._id === empGroup.employeeData?._id
                                      ) {
                                        // If already selected → deselect
                                        setSelectedSlot(null);
                                      } else {
                                        // Else select this slot
                                        setSelectedSlot({ slot, empGroup });
                                      }
                                    }}
                                  >
                                    {new Date(slot.startTime).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </button>


                                ))}
                            </div>

                            {/* Afternoon Slots */}
                            <span className="fw-medium">Afternoon</span>
                            <div className="d-flex flex-wrap gap-2 mt-2 mb-3">
                              {visibleSlots
                                .filter((slot) => new Date(slot.startTime).getHours() >= 12)
                                .map((slot, i) => (
                                  <button
                                    type="button"
                                    key={`morning-${empIndex}-${i}`}
                                    className={`btn fs-9 rounded-5 px-4 serviceBtn overflow-hidden ${selectedSlot?.slot?.startTime === slot.startTime &&
                                      selectedSlot?.empGroup?.employeeData?._id === empGroup.employeeData?._id
                                      ? "btn-greenslot"
                                      : "btn-orange"
                                      }`}
                                    onClick={() => {
                                      // Toggle logic
                                      if (
                                        selectedSlot?.slot?.startTime === slot.startTime &&
                                        selectedSlot?.empGroup?.employeeData?._id === empGroup.employeeData?._id
                                      ) {
                                        // If already selected → deselect
                                        setSelectedSlot(null);
                                      } else {
                                        // Else select this slot
                                        setSelectedSlot({ slot, empGroup });
                                      }
                                    }}
                                  >
                                    {new Date(slot.startTime).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </button>


                                ))}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="d-flex justify-content-center mt-5">
                        <b>No Slots Available</b>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add to Waitlist Modal */}
      <div className="modal fade booknowModal" id="addWaitlist" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 rounded-1">
            <div className="modal-header border-0">
              <h1 className="modal-title fs-6">Add to waitlist</h1>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <div className="detailsDiv w-100 p-0 pb-3">
                {/* Service */}
                <div className="form-group mb-3">
                  <label>Select Service</label>
                  <select
                    className="form-select"
                    value={waitlistService}
                    onChange={(e) => handleWaitlistServiceChange(e.target.value)}
                  >
                    <option value="">Select Service</option>
                    {services.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Employee */}
                <div className="form-group mb-3">
                  <label>Select Employee</label>
                  <select
                    className="form-select"
                    value={waitlistEmployee}
                    onChange={(e) => setWaitlistEmployee(e.target.value)}
                  >
                    <option value="">Select Employee</option>
                    {waitlistEmployees.map((emp) => (
                      <option key={emp._id} value={emp._id}>
                        {emp.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Entries (Date/Time rows) */}
                {waitlistEntries.map((entry) => (
                  <div className="row mb-3" key={entry.key}>
                    <div className="col-lg-5">
                      <input
                        type="date"
                        className="form-control"
                        value={entry.date}
                        min={getTomorrowYMD()} // ✅ blocks today & past dates
                        onChange={(e) =>
                          handleWaitlistChange(entry.key, "date", e.target.value)
                        }
                      />

                    </div>
                    <div className="col-lg-5">
                      <input
                        type="time"
                        className="form-control"
                        value={entry.time}
                        onChange={(e) =>
                          handleWaitlistChange(entry.key, "time", e.target.value)
                        }
                      />
                    </div>
                    <div className="col-lg-2">
                      <button
                        type="button"
                        className="btn btn-outline-danger"
                        onClick={() => handleRemoveWaitlistEntry(entry.key)}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}

                {/* Add Row */}
                <button
                  type="button"
                  className="btn btn-orange fs-9 rounded-5 serviceBtn overflow-hidden"
                  onClick={handleAddWaitlistEntry}
                >
                  + Add waitlist Date & Time
                </button>

                {/* Actions */}
                <div className="d-flex gap-2 justify-content-center mt-5">
                  <button
                    type="button"
                    className="btn btn-secondary fs-7 px-5"
                    data-bs-dismiss="modal"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary fs-7 px-4"
                    onClick={handleAddToWaitlist}
                  >
                    Add to waitlist
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Rating Modal */}
      <div className="modal fade" id="ratingModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered modal-sm">
          <div className="modal-content border-0 rounded-1">
            <div className="modal-header border-0">
              <h1 className="modal-title fs-6">Rating</h1>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              {selectedEmployeeReview && (
                <>
                  {/* Employee Info */}
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <figure className="m-0">
                      <div
                        className="d-flex justify-content-center align-items-center"
                        style={{
                          width: "55px",
                          height: "55px",
                          backgroundColor: "#E0E0E0",
                          fontSize: "22px",
                          fontWeight: "bold",
                          color: "#662A09",
                          borderRadius: "4px",
                        }}
                      >
                        {/* {getInitials(selectedEmployeeReview?.userDetails?.name)} */}
                        <img src={`${process.env.NEXT_PUBLIC_API_URL}/${selectedEmployeeReview?.userDetails?.file}`} alt="" />
                      </div>



                    </figure>
                    <div>
                      <span className="fw-semibold fs-7">
                        {selectedEmployeeReview?.userDetails?.name}
                      </span>
                      <div className="my-2">
                        <StarRating
                          value={selectedEmployeeReviews?.average?.overall_review}
                          size={16}
                        />
                        <strong>({selectedEmployeeReviews?.data?.length})</strong>
                      </div>
                    </div>
                  </div>

                  {/* Reviews List */}
                  <h6 className="fw-semibold fs-8">Reviews</h6>
                  <ul className="reviewsUl">
                    {selectedEmployeeReviews?.data?.length > 0 ? (
                      selectedEmployeeReviews.data.map((review, i) => (
                        <li key={i}>
                          <div className="d-flex align-items-center gap-2">
                            <figure className="m-0">
                              {getInitials(review.user_id?.name || "U")}
                            </figure>
                            <span>
                              {review.user_id?.name || "Unknown"}{" "}
                              <b>
                                Reviewed on{" "}
                                {new Date(review.created_at).toDateString()}
                              </b>
                            </span>
                          </div>
                          <p className="fs-9 text-black">{review.comment}</p>
                          <hr />
                        </li>
                      ))
                    ) : (
                      <p className="text-muted">No reviews available</p>
                    )}
                  </ul>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      <div className="modal fade" id="cancelModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 rounded-1">
            <div className="modal-header border-0">
              <h5 className="modal-title">Cancel Appointment</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body text-center">
              <p>Are you sure you want to cancel this appointment?</p>
              <div className="d-flex justify-content-center gap-3 mt-3">
                <button
                  type="button"
                  className="btn btn-secondary px-4"
                  data-bs-dismiss="modal"
                >
                  No
                </button>
                <button
                  type="button"
                  id="confirmCancelBtn"
                  className="btn btn-danger px-4"
                  data-bs-dismiss="modal"
                >
                  Yes, Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="modal fade" id="chatMdl">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0">
            <div className="modal-header border-0 py-2">
              <div className="d-flex align-items-center">
                <div className="chat-profile">
                  <img src="/images/landingpage/curz.png" alt="imagegirl" />
                </div>

                <div className="conntxt">
                  <strong>Amber</strong>
                </div>
              </div>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body text-center pt-2 pb-0">

              <div className="chatRight">
                <div className="chatModal">
                  <div className="chatbody">
                    <div className="chats">
                      <div className="msgContent message-in">
                        <div className="userimg">
                          <img src="/images/landingpage/curz.png" alt="" />
                        </div>
                        <div className="msgtextGroup">
                          <div className="msgTime"><span>Amber</span> 10:00 AM</div>
                          <div className="msgText">
                            <span> Hello</span>
                          </div>
                        </div>
                      </div>
                      <div className="msgContent message-out">
                        <div className="msgtextGroup">
                          <div className="msgTime">10:01 AM</div>
                          <div className="msgText">
                            <span> Hello</span>
                          </div>
                        </div>
                        <div className="userimg">
                          <img src="/images/landingpage/userIcon.png" alt="" />
                        </div>
                      </div>
                      <div className="msgContent message-in">
                        <div className="userimg">
                          <img src="/images/landingpage/curz.png" alt="" />
                        </div>
                        <div className="msgtextGroup">
                          <div className="msgTime"><span>Amber</span> 10:03 AM</div>
                          <div className="msgText">
                            <span> How do I disable click outside modal in Bootstrap
                              4?</span>
                          </div>
                        </div>
                      </div>
                      <div className="msgContent message-out">
                        <div className="msgtextGroup">
                          <div className="msgTime">10:05 AM</div>
                          <div className="msgText">
                            <span>Simply, when you are using the modal and want to
                              disable the “click outside modal area to
                              close</span>
                          </div>
                        </div>
                        <div className="userimg">
                          <img src="/images/landingpage/userIcon.png" alt="" />
                        </div>
                      </div>
                      <div className="msgContent message-in">
                        <div className="userimg">
                          <img src="/images/landingpage/curz.png" alt="" />
                        </div>
                        <div className="msgtextGroup">
                          <div className="msgTime"><span>Amber</span> 10:00 AM</div>
                          <div className="msgText">
                            <span> Hello</span>
                          </div>
                        </div>
                      </div>
                      <div className="msgtimer">
                        Yesterday 10:01 AM
                      </div>
                      <div className="msgContent message-out">
                        <div className="msgtextGroup">
                          <div className="msgTime"> 10:01 AM</div>
                          <div className="msgText">
                            <span> Hello</span>
                          </div>
                        </div>
                        <div className="userimg">
                          <img src="/images/landingpage/userIcon.png" alt="" />
                        </div>
                      </div>
                      <div className="msgContent message-in">
                        <div className="userimg">
                          <img src="/images/landingpage/curz.png" alt="" />
                        </div>
                        <div className="msgtextGroup">
                          <div className="msgTime"><span>Amber</span> 10:03 AM</div>
                          <div className="msgText">
                            <span> How do I disable click outside modal in Bootstrap
                              4?</span>
                          </div>
                        </div>
                      </div>
                      <div className="msgtimer">
                        Today 10:05 AM
                      </div>
                      <div className="msgContent message-out">
                        <div className="msgtextGroup">
                          <div className="msgTime">10:05 AM</div>
                          <div className="msgText">
                            <span>Simply, when you are using the modal and want to
                              disable the “click outside modal area to
                              close
                              it” functionality, you just need to set the backdrop
                              value (data-bs-backdrop attribute) of the
                              modal
                              element to “static” and you can disable that
                              functionality.</span>
                          </div>
                        </div>
                        <div className="userimg">
                          {/* <img src="/images/landingpage/userIcon.png" alt=""> */}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="chatFoot">
                <div className="msgInputgroup">
                  <div className="msgInput position-relative">
                    <button type="button" className="emojitoggle"><img src="/images/landingpage/emoji-icon.svg" alt=""
                      width="23" /></button>
                    <input className="form-control" id="msg-input" type="text" placeholder="Type a message" />
                  </div>
                  <button type="button" className="mstBtn addfileToggle"><img src="/images/landingpage/add-file.svg" alt=""
                    width="20" /></button>
                  <button type="button" className="mstBtn sendBtn"><img src="/images/landingpage/send-msg.svg" alt=""
                    width="25" /></button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

    </>
  );



}
