"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
// import SubHeader from "app/(landingpage)/LandingPage/components/SubHeader/page";
import Loader from "services/Loader/page";
import Header from "app/(landingpage)/LandingPage/components/Header/page";
import FooterSection from "app/(landingpage)/LandingPage/components/Footer/page";
import "app/(landingpage)/LandingPage/public/css/style.css";
import "bootstrap/dist/css/bootstrap.min.css";
import LoginPopup from "services/Pop-ups/LoginPopup/page";
import flatpickr from "flatpickr";
import { useRouter } from "next/navigation";
import "flatpickr/dist/flatpickr.min.css";
import StarRating from "services/Reusable/StarRating";
import { useParams } from "next/navigation";
// import '../../../../../../app/(landingpage)/LandingPage/public/css/style.css'
import { useSearchParams } from "next/navigation";
import moment from 'moment'
import { config } from "services/config";
import { postApi, postApiWithFile, updateApiWithFile } from "services/api";

const AyurvedicInitialConsult = () => {

  const searchParams = useSearchParams();
  const centerId = searchParams.get("centerId");
  const waitlistDropdownRef = useRef(null);


  const router = useRouter();
  const [openLogin, setOpenLogin] = useState(false);

  const [additionalServices, setAdditionalServices] = useState([]);
  const [waitlistService, setWaitlistService] = useState("");
  const [waitlistEmployees, setWaitlistEmployees] = useState([]);
  const [waitlistEmployee, setWaitlistEmployee] = useState("");
  const [waitlistDateWiseSlots, setWaitlistDateWiseSlots] = useState([]);
  const [checkslotresponse, setCheckSlotResponse] = useState();
  const [prefillService, setPrefillService] = useState("");
  const [prefillEmployee, setPrefillEmployee] = useState("");
  const [prefillDate, setPrefillDate] = useState("");
  const [unavailableDates, setUnavailableDates] = useState([]);
  const [loadingUnavailable, setLoadingUnavailable] = useState(false);
  const [center, setCenter] = useState()
  const [waitlistEntries, setWaitlistEntries] = useState([
    { key: Date.now(), date: "", time: "" },
  ]);
  const { id } = useParams();
  const [selectedDate, setSelectedDate] = useState(null);
  const [employeesList, setEmployeesList] = useState([]);
  const [selectedModalService, setSelectedModalService] = useState("");
  const [selectedModalEmployee, setSelectedModalEmployee] = useState("");
  const [selectedModalEmployeeuserId, setSelectedModalEmployeeuserId] =
    useState("");
  const [userData, setUserData] = useState();
  const enableDatePicker = selectedModalService && selectedModalEmployee;
  const [serviceTypes, setServiceTypes] = useState([]);
  const [selectedServiceType, setSelectedServiceType] = useState(null);
  const [filteredServices, setFilteredServices] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedEmployeeReviews, setSelectedEmployeeReviews] = useState([]);
  // New state
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [preserveBookingState, setPreserveBookingState] = useState(false);
  const preserveBookingStateRef = useRef(false);
  const [showFieldErrors, setShowFieldErrors] = useState(false);
  const canPickDate = Boolean(selectedModalService && selectedModalEmployee);
  // errors + validity for waitlist modal
  const [showWaitlistErrors, setShowWaitlistErrors] = useState(false);
  const isWaitlistValid = Boolean(
    waitlistService &&
    waitlistEmployee &&
    waitlistEntries.some(e => e.date )
    // waitlistEntries.some(e => e.date && e.time)
  );

  const [userFamilyData, setUserFamilyData] = useState([]);
  const [waitlistPersonOpen, setWaitlistPersonOpen] = useState(false);

  // selected option for waitlist dropdown
  const [waitlistFor, setWaitlistFor] = useState({
    type: "self",      // "self" | "family"
    id: "",            // userId for self OR family member _id
    label: "",         // display label
  });

  // Local YYYY-MM-DD for tomorrow
  const getTomorrowYMD = (d = new Date()) => {
    const t = new Date(d);
    t.setDate(t.getDate() + 1);
    const y = t.getFullYear();
    const m = String(t.getMonth() + 1).padStart(2, "0");
    const day = String(t.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  useEffect(() => {
    if (!userData?._id) return;

    setWaitlistFor((prev) => {
      if (prev?.id) return prev; // don't override chosen family member
      return {
        type: "self",
        id: userData._id,
        label: `${userData?.name || "Me"} (Me)`,
      };
    });

    (async () => {
      try {
        const res = await postApi(config.findUserFamily, { userId: userData._id });
        if (res?.statusCode === 200 || res?.statusCode === 201) {
          setUserFamilyData(res?.data?.userFamilyData || []);
        } else setUserFamilyData([]);
      } catch (e) {
        console.error("findUserFamily error:", e);
        setUserFamilyData([]);
      }
    })();
  }, [userData?._id]);

  // clear error highlights once valid
  useEffect(() => {
    if (isWaitlistValid) setShowWaitlistErrors(false);
  }, [isWaitlistValid]);

  const errorStyle = {
    borderColor: '#dc3545',
    boxShadow: '0 0 0 .2rem rgba(220,53,69,.15)',
  };

  const handleDateAttemptBeforeReady = (e) => {
    if (!canPickDate) {
      if (e && e.preventDefault) e.preventDefault();
      if (e && e.stopPropagation) e.stopPropagation();
      alert('Please select Service and Employee first.');
      setShowFieldErrors(true);
    }
  };

  const closeWaitlistPersonIfOutside = (e) => {
    if (!waitlistPersonOpen) return;
    const dd = waitlistDropdownRef.current;
    if (dd && !dd.contains(e.target)) setWaitlistPersonOpen(false);
  };




  // clear highlight once both are selected
  useEffect(() => {
    if (selectedModalService && selectedModalEmployee) {
      setShowFieldErrors(false);
    }
  }, [selectedModalService, selectedModalEmployee]);
  useEffect(() => {
    preserveBookingStateRef.current = preserveBookingState;
  }, [preserveBookingState]);

  useEffect(() => {
    if (centerId) {
      fetchCenterDetails();
    }
  }, [centerId]);

  const fetchCenterDetails = async () => {
    try {
      const endpoint = config.Viewcenter;
      const data = { id: centerId };
      const response = await postApi(endpoint, data);
      if (response.statusCode === 201) {
        setCenter(response.centerManagementData);
      }
    } catch (error) {
      console.error('Error fetching center details:', error);
    }
  };

  useEffect(() => {
    if (!openLogin) {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      setUserData(user);
    }
  }, [openLogin]);


  useEffect(() => {
    if (
      selectedModalService &&
      selectedModalEmployee &&
      selectedModalEmployeeuserId
    ) {
      fetchUnavailableDates();
    }
  }, [
    selectedModalService,
    selectedModalEmployee,
    selectedModalEmployeeuserId,
  ]);

  const arrayheader = [
    { name: "Home", route: "/" },
    { name: "Book Online", route: "/Appointment/components/BookAppointment" },
    { name: "Order", route: "/profile?tab=orders" },
    { name: "Yoga ", route: "/YogaClasses/components/JoinYogaClasses" },
    { name: "Event", route: "/Events" },
    {
      name: "Resources",
      route: "/LandingPage/components/Quiz",
      children: [
        { name: "Dosha Quiz", route: "/LandingPage/components/Quiz" },
        { name: "Health Articles", route: "/LandingPage/components/BookArticles" },
        { name: "Gallery", route: "/LandingPage/components/Gallery" },

      ]
    },
  ];
  const additionalServicesRef = useRef([]);
  useEffect(() => {
    additionalServicesRef.current = additionalServices;
  }, [additionalServices]);


  // Local YYYY-MM-DD (avoids timezone issues from toISOString())
  const getLocalYMD = (d = new Date()) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  // Filters out past slots only if selectedDate is today
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

  const truncate = (str = "", max = 20) =>
    typeof str === "string" && str.length > max ? `${str.slice(0, max)}...` : str;
  const handleFinalBooking = async () => {
    if (selectedSlots.length === 0) return;
    console.log(selectedSlots, "selectedSlots")
    for (const slotA of selectedSlots) {
      const start1 = new Date(slotA.slot.startTime);
      const end1 = new Date(slotA.slot.endTime);

      for (const slotB of selectedSlots) {
        if (slotA === slotB) continue; // skip same slot

        const start2 = new Date(slotB.slot.startTime);
        const end2 = new Date(slotB.slot.endTime);

        if (start1 < end2 && end1 > start2) {
          console.log(slotA, slotB)
          alert("Selected slots are overlapping. Please choose different time slots.");
          return;
        }
      }
    }
    try {
      // Build array of payloads
      const payloadArray = selectedSlots.map(
        ({ slot, employeeData, serviceDetails }) => {
          const start = new Date(slot.startTime);

          return {
            serviceId: serviceDetails?.serviceId, // ✅ serviceId from API
            employeeId: employeeData._id,
            centerId: centerId,
            userId: userData?._id,
            note: "test",
            date: start.toISOString().split("T")[0],
            time: start.toTimeString().slice(0, 5),
            deposit: 0,
            repeat: "Off",
            file: "",
            duration: parseInt(serviceDetails?.duration || 30), // ✅ duration from API
            price: parseFloat(serviceDetails?.price || 0), // ✅ price from API
          };
        }
      );

      const res = await postApiWithFile(
        config.addAppointment,
        { appointments: payloadArray }, // ✅ send as array
        { file: null }
      );

      if (res.statusCode === 201) {
        // alert("Appointments booked successfully!");
        const modal = bootstrap.Modal.getInstance(
          document.getElementById("gotodate")
        );
        modal?.hide();
        // console.log(res.data, "res.data")
        // return
        // redirect if needed
        if (res?.data?.[0]?._id) {
          const ruuteIds = res.data.map(e => { return e._id })
          // console.log(ruuteIds, "ruuteIds")
          router.push(
            `/Appointment/components/AyurvedicInitialConsult/payment/${[...ruuteIds]}`
          );
        }
      } else {
        alert(`Booking failed: ${res.message}`);
      }
    } catch (error) {
      console.error("Booking error:", error);
      alert("Something went wrong while booking.");
    }
  };

  const fetchUnavailableDates = async (
    monthDate = null,
    services = additionalServices
  ) => {
    try {
      setLoadingUnavailable(true);
      const baseDate = monthDate || new Date().toISOString().split("T")[0];

      const safeServices = Array.isArray(services) ? services : []; // ✅ safeguard

      const slotsPayload = [
        {
          serviceId: selectedModalService,
          employeeId: selectedModalEmployee,
          userId: userData._id,
          date: baseDate,
        },
        ...safeServices.map((item) => ({
          serviceId: item.serviceId,
          employeeId: item.employeeId,
          userId: userData._id,
          date: baseDate,
        })),
      ];

      const res = await postApi(config.GetUnavailableDates, { slotsPayload });

      if (res?.statusCode === 200 && Array.isArray(res.data)) {
        const allUnavailable = res.data.flatMap(
          (emp) => emp.unavailableDates || []
        );
        const uniqueUnavailable = [...new Set(allUnavailable)];
        setUnavailableDates(uniqueUnavailable);
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
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchServiceTypes = async () => {
      try {
        const response = await postApi(config.AllServiceTypes, {
          page: 1,
          pageSize: 100,
        });
        const types = response.data || [];
        setServiceTypes(types);

        // ✅ Set the default selected type based on route param
        if (id) setSelectedServiceType(id);
      } catch (error) {
        console.error("Error fetching service types:", error);
      }
    };

    fetchServiceTypes();
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    setUserData(user);
  }, [id]);

  const fetchEmployees = async (serviceId) => {
    try {
      const response = await postApi(config.ViewService, {
        id: serviceId,
      });
      // console.log("employee list", response.data[0]?.employees)

      setEmployeesList(response.data[0]?.employees || []);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  useEffect(() => {
    const modal = document.getElementById("booknowModal");
    const handleShow = () => {
      if (selectedModalService) {
        fetchEmployees(selectedModalService);
      }
    };
    modal?.addEventListener("shown.bs.modal", handleShow);

    return () => {
      modal?.removeEventListener("shown.bs.modal", handleShow);
    };
  }, [selectedModalService]);

  useEffect(() => {
    if (selectedServiceType) fetchFilteredServices(selectedServiceType);
  }, [selectedServiceType]);

  const fetchFilteredServices = async (typeId) => {
    try {
      const response = await postApi(config.AllServices, {
        service_type: typeId,
        centerId: centerId,
        page: 1,
        pageSize: 20,
      });

      const activeServices = (response.data || []).filter(
        (service) => service.status === 1
      );

      setFilteredServices(activeServices);
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };



  useEffect(() => {
    let picker = flatpickr("#datePicker", {
      dateFormat: "Y-m-d",
      inline: true,
      defaultDate: selectedDate || new Date(),
      // minDate: "today",
      minDate: new Date().fp_incr(1),
      disable: unavailableDates,
      onChange: function (selectedDates, dateStr) {
        setSelectedDate(dateStr);
        setPrefillDate(dateStr);
        const selectedDateDiv = document.getElementById("selectedDate");
        const selectDateDiv = document.getElementById("selectDate");
        if (selectedDateDiv && selectDateDiv) {
          selectedDateDiv.style.display = "block";
          selectDateDiv.style.display = "none";
        }
      },
      onMonthChange: function (selectedDates, dateStr, instance) {
        const currentYear = instance.currentYear;
        const currentMonth = instance.currentMonth + 1;
        const firstDayOfMonth = `${currentYear}-${String(currentMonth).padStart(
          2,
          "0"
        )}-01`;

        if (selectedModalService && selectedModalEmployee) {
          fetchUnavailableDates(firstDayOfMonth, additionalServicesRef.current); // ✅ latest always
        }
      },

      onYearChange: function (selectedDates, dateStr, instance) {
        const currentYear = instance.currentYear;
        const currentMonth = instance.currentMonth + 1;
        const firstDayOfMonth = `${currentYear}-${String(currentMonth).padStart(
          2,
          "0"
        )}-01`;

        if (selectedModalService && selectedModalEmployee) {
          fetchUnavailableDates(firstDayOfMonth, additionalServicesRef.current);
        }
      },
    });

    return () => {
      picker.destroy();
    };
  }, [enableDatePicker]);

  useEffect(() => {
    const pickerEl = document.querySelector("#datePicker")?._flatpickr;
    if (pickerEl) {
      pickerEl.set("disable", unavailableDates);
    }
  }, [unavailableDates]);

  // Small guard to stop hide bubbling (like you did for ratingModal)
  useEffect(() => {
    const modal = document.getElementById("addWaitlist");
    if (!modal) return;
    const stop = (e) => e.stopPropagation();
    modal.addEventListener("hide.bs.modal", stop);
    modal.addEventListener("hidden.bs.modal", stop);
    return () => {
      modal.removeEventListener("hide.bs.modal", stop);
      modal.removeEventListener("hidden.bs.modal", stop);
    };
  }, []);


  const resetStateOnCloseModel = () => {
    setSelectedModalService("");
    setSelectedModalEmployee("");
    setSelectedModalEmployeeuserId("");
    setSelectedDate(null);
    setWaitlistService("");
    setWaitlistEmployees([]);
    setWaitlistEmployee("");
    setWaitlistEntries([{ key: Date.now(), date: "", time: "" }]);
    setSelectedSlots([]);
    setPreserveBookingState(false);

    // FIX: Always clear additional services too
    setAdditionalServices([]);
  };

  useEffect(() => {
    const modals = ["booknowModal", "gotodate", "addWaitlist"];

    const resetState = () => {
      // setSelectedModalService("");
      // setSelectedModalEmployee("");
      setSelectedModalEmployeeuserId("");
      // setSelectedDate(null);
      setWaitlistService("");
      setWaitlistEmployees([]);
      setWaitlistEmployee("");
      setWaitlistEntries([{ key: Date.now(), date: "", time: "" }]);
      setSelectedSlots([]);
      setPreserveBookingState(false);

      // FIX: Always clear additional services too
      // setAdditionalServices([]);
    };
    const handleHidden = (event) => {
      const modalId = event.target.id;


      if (modalId === "booknowModal" && preserveBookingStateRef.current) return;


      if (modalId === "addWaitlist") return;

      resetState();
    };


    modals.forEach((id) => {
      const modal = document.getElementById(id);
      modal?.addEventListener("hidden.bs.modal", handleHidden);
    });

    return () => {
      modals.forEach((id) => {
        const modal = document.getElementById(id);
        modal?.removeEventListener("hidden.bs.modal", handleHidden);
      });
    };
  }, []);


  const handleCheckAvailability = async () => {
    // 🧠 Step-by-step validation
    if (!selectedModalService) {
      alert("Please select a service first.");
      return;
    }
    console.log("lllllllllllll")

    if (!selectedModalEmployee) {
      alert("Please select an employee.");
      return;
    }

    if (!selectedDate) {
      alert("Please select a date.");
      return;
    }

    // ✅ Validate all additional services are complete
    const hasIncompleteAdditional = additionalServices.some(
      (item) => !item.serviceId || !item.employeeId
    );
    if (hasIncompleteAdditional) {
      alert("Please select both service and employee for all additional services.");
      return;
    }

    // ✅ Check for duplicate service+employee combinations
    if (checkDuplicateServiceEmployee()) {
      alert("You cannot select the same service and same employee combination. Please select different service or employee for additional bookings.");
      return;
    }

    // 🧩 Continue with normal flow
    const slotsPayload = [
      {
        serviceId: selectedModalService,
        employeeId: selectedModalEmployee,
        userId: userData?._id,
        date: selectedDate,
      },
      ...additionalServices.map((item) => ({
        serviceId: item.serviceId,
        employeeId: item.employeeId,
        userId: userData?._id,
        date: selectedDate,
      })),
    ];

    try {
      const res = await postApi(config.CheckSlots, { slotsPayload });


      if (res?.slots?.length) {
        setCheckSlotResponse(res);
        setPreserveBookingState(true);
        const booknowModal = bootstrap.Modal.getOrCreateInstance(
          document.getElementById("booknowModal")
        );
        booknowModal.hide();
        new bootstrap.Modal(document.getElementById("gotodate")).show();
      } else {
        setCheckSlotResponse(res);
        alert("No slots available for the selected date. Please try another date or join the waitlist.");
      }
    } catch (error) {
      console.error("Error checking slot:", error);
      alert("Something went wrong while checking availability.");
    }
  };


  const handleSlotBooking = async (slot) => {
    const start = new Date(slot.startTime);
    const end = new Date(start.getTime() + 30 * 60000);

    const payload = {
      serviceId: prefillService,
      employeeId: prefillEmployee,
      userId: userData?._id,
      note: "test",
      date: start.toISOString().split("T")[0],
      time: start.toTimeString().slice(0, 5),
      deposit: 0,
      repeat: "Off",
      file: "",
      duration: parseInt(checkslotresponse?.serviceDetails?.duration),
      price: parseFloat(checkslotresponse?.serviceDetails?.price) || 0,
    };

    try {
      const res = await postApiWithFile(config.addAppointment, payload, {
        file: null,
      });
      if (res.statusCode === 201) {
        alert("Appointment booked successfully!");
        const modal = bootstrap.Modal.getInstance(
          document.getElementById("gotodate")
        );
        modal?.hide();

        const appointmentId = res?.data?._id;
        if (appointmentId) {
          router.push(
            `/Appointment/components/AyurvedicInitialConsult/payment/${appointmentId}`
          );
        }
      } else {
        alert(`Booking failed: ${res.message}`);
      }
    } catch (error) {
      console.error("Booking error:", error);
      alert("Something went wrong while booking.");
    }
  };

  useEffect(() => {
    const el = document.getElementById("addWaitlist");
    if (!el) return;

    const onHidden = () => setWaitlistPersonOpen(false);
    el.addEventListener("hidden.bs.modal", onHidden);
    return () => el.removeEventListener("hidden.bs.modal", onHidden);
  }, []);


  const getInitials = (name = "") => {
    const words = name.trim().split(" ");
    if (words.length === 1) return words[0][0]?.toUpperCase() || "";
    return (words[0][0] + words[1][0]).toUpperCase();
  };

  const handleAddWaitlistEntry = () => {
    setWaitlistEntries(prev => [
      ...prev,
      { key: Date.now(), date: "", time: "" }
    ]);

    setWaitlistDateWiseSlots(prev => [...prev, []]); // ⬅ Add EMPTY slot list
  };


  const handleRemoveAdditionalService = (keyToRemove) => {
    setAdditionalServices((prev) => {
      const updated = prev.filter((service) => service.key !== keyToRemove);
      fetchUnavailableDates(null, updated);
      return updated;
    });
  };

  const handleRemoveWaitlistEntry = (keyToRemove) => {
    const index = waitlistEntries.findIndex(e => e.key === keyToRemove);

    setWaitlistEntries(prev => prev.filter(e => e.key !== keyToRemove));

    setWaitlistDateWiseSlots(prev => prev.filter((_, i) => i !== index));
  };


  const handleWaitlistChange = (key, field, value, ind) => {

    const min = getTomorrowYMD();
    if (value && value < min) {
      alert("Please select a future date (from tomorrow).");
      return; // ✅ don't update state
    }
    setWaitlistEntries((prev) =>
      prev.map((entry) =>
        entry.key === key ? { ...entry, [field]: value } : entry
      )
    );
    if (field === "date") {
      // Reset the time because new date must fetch new slots
      setWaitlistDateWiseSlots(prev => {
        const copy = [...prev];
        copy[ind] = [];   // ⬅ Clear previous slot options
        return copy;
      });

      handleWaitlistDateChange(value, ind);
    }

  };
  const handleWaitlistServiceChange = async (serviceId) => {
    setWaitlistService(serviceId);
    try {
      const response = await postApi(config.ViewService, { id: serviceId });
      setWaitlistEmployees(response.data[0]?.employees || []);
    } catch (error) {
      console.error("Failed to fetch employees for waitlist", error);
    }
  };
  const handleWaitlistDateChange = async (date, ind) => {
    if (!waitlistService) {
      console.warn("No waitlistService selected yet");
      return;
    }
    if (!waitlistEmployee) {
      console.warn("No waitlistEmployee selected yet");
      return;
    }

    const employee = waitlistEmployees.find(e => e._id === waitlistEmployee);
    if (!employee) {
      console.warn("Employee data not found for id", waitlistEmployee);
      return;
    }

    try {
      const payload = {
        slotsPayload: [
          {
            serviceId: waitlistService,
            employeeId: waitlistEmployee,
            userId: employee.userId,
            date,
          },
        ],
      };
      const response = await postApi(config.unAvailableSlotsInDate, payload);


      // adapt this depending on actual structure
      const slots = response?.slots?.[0]?.slots
        || response?.data?.slots?.[0]?.slots
        || [];


      setWaitlistDateWiseSlots(prev => {
        const copy = [...prev];
        copy[ind] = slots;
        return copy;
      });

    } catch (error) {
      console.error("Failed to fetch slots for waitlist date:", error);
    }
  };




  const handleAddToWaitlist = async () => {
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
            userId: userData?._id,
            ...(waitlistFor.type === "family" ? { familyMemberId: waitlistFor.id } : {}),
            date: entry.date,
            time: entry.time,
          })),
        },
      };


      const response = await postApi(config.AddToWaitlist, payload);

      if (response.statusCode === 201) {
        alert("Successfully added to waitlist");
        const modal = bootstrap.Modal.getInstance(
          document.getElementById("addWaitlist")
        );
        modal?.hide();
      } else {
        alert(`Error: ${response.message}`);
      }
    } catch (error) {
      console.error("Error adding to waitlist:", error);
      alert("Failed to add to waitlist");
    }
  };

  // ✅ Check for duplicate service+employee combinations
  const checkDuplicateServiceEmployee = () => {
    const allSelections = [
      { serviceId: selectedModalService, employeeId: selectedModalEmployee },
      ...additionalServices.map(s => ({ serviceId: s.serviceId, employeeId: s.employeeId }))
    ].filter(s => s.serviceId && s.employeeId); // Only check completed selections

    const seen = new Set();
    for (const selection of allSelections) {
      const key = `${selection.serviceId}-${selection.employeeId}`;
      if (seen.has(key)) {
        return true; // Duplicate found
      }
      seen.add(key);
    }
    return false; // No duplicates
  };


  console.log(filteredServices, "filteredServices")
  useEffect(() => {
    const modal = document.getElementById("ratingModal");
    if (!modal) return;

    const stop = (e) => e.stopPropagation();

    modal.addEventListener("hide.bs.modal", stop);
    modal.addEventListener("hidden.bs.modal", stop);

    return () => {
      modal.removeEventListener("hide.bs.modal", stop);
      modal.removeEventListener("hidden.bs.modal", stop);
    };
  }, []);

  // add alongside your existing ratingModal effect
  useEffect(() => {
    const el = document.getElementById("addWaitlist");
    if (!el) return;

    const onHidden = () => {
      const overlay = document.getElementById("ratingOverlay");
      if (overlay) overlay.style.display = "none";
    };

    el.addEventListener("hidden.bs.modal", onHidden);
    return () => el.removeEventListener("hidden.bs.modal", onHidden);
  }, []);

  useEffect(() => {
    const modalEl = document.getElementById("ratingModal");
    if (!modalEl) return;

    modalEl.addEventListener("hidden.bs.modal", () => {
      document.getElementById("ratingOverlay").style.display = "none";
    });

    return () => {
      modalEl.removeEventListener("hidden.bs.modal", () => {
        document.getElementById("ratingOverlay").style.display = "none";
      });
    };
  }, []);

  return (
    <>
      {loadingUnavailable && <Loader />}
      <Header arrayheader={arrayheader} />
      {/* <SubHeader /> */}

      <section className="ourServices">
        <div className="container-fluid">
          <div className="breadcrumbGroup mt-4">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <Link href={'/Appointment/components/BookAppointment'}>Booking</Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">

                Book Appointment{" "}
              </li>
            </ol>
          </div>
          <div className="row">
            <div className="col-lg-4 col-xl-3 mb-3">
              <div className="servicesSidebar">
                <h1>
                  Our Services <span>{center?.centerName} Center</span>
                </h1>
                <ul className="nav nav-tabs flex-column">
                  {console.log("lin 769", center, serviceTypes)}

                  {serviceTypes
                    ?.filter((type) => {
                      // only active types
                      if (type.status !== 1) return false;

                      // require a selected center
                      const selectedCenterId = center?._id?.toString();
                      if (!selectedCenterId) return false;

                      // normalize centerIds to strings and check membership
                      const ids = Array.isArray(type.centerIds)
                        ? type.centerIds.map((id) => id?.toString())
                        : [];

                      return ids.includes(selectedCenterId);
                    })
                    .map((type) => (
                      <li className="nav-item" key={type._id}>
                        <button
                          type="button"
                          className={`nav-link ${selectedServiceType === type._id ? "active" : ""}`}
                          onClick={() => setSelectedServiceType(type._id)}
                        >
                          {truncate(type.name, 25)} <i className="bi bi-arrow-right"></i>
                        </button>
                      </li>
                    ))}
                </ul>

              </div>
            </div>
            <div className="col-lg-8 col-xl-9">
              <div className="tab-content">
                <div className="tab-pane fade show active">
                  <div className="row px-md-1">

                    {filteredServices
                      .filter((service) => service.status === 1)   // ✅ Only ACTIVE services
                      .map((service) => (
                        <div
                          key={service._id}
                          className="col-md-6 col-lg-6 mb-4 px-md-3"
                        >
                          <div className="appointmentTxt h-100">
                            <div className="bg-light text-center p-3 mb-2">
                              <figure className="mx-auto">
                                <img
                                  src="/images/landingpage/layer9.png"
                                  alt=""
                                  width="30"
                                />
                              </figure>
                              <h3 className="fs-8">{service.name}</h3>
                              <strong className="fs-6">${service.price}</strong>
                            </div>
                            <p>{service.description}</p>

                            <a
                              href="#"
                              className="btn btn-orange rounded-1 w-auto py-2"
                              onClick={(e) => {
                                e.preventDefault();

                                if (!userData?._id) {
                                  setOpenLogin(true);
                                  return;
                                }

                                setSelectedModalService(service._id);
                                setPrefillService(service._id);
                                setSelectedModalEmployee("");
                                setSelectedModalEmployeeuserId("");
                                setSelectedDate(null);

                                const modal = new bootstrap.Modal(
                                  document.getElementById("booknowModal")
                                );
                                modal.show();
                              }}
                            >
                              BOOK NOW
                            </a>
                          </div>
                        </div>
                      ))}

                    {filteredServices.filter((s) => s.status === 1).length === 0 && (
                      <div>Currently no services available in this category</div>
                    )}

                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <FooterSection />

      <div
        className="modal fade booknowModal"
        id="booknowModal"
        tabIndex={-1}
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 rounded-1">
            <div className="modal-header border-0">
              <h1 className="modal-title fs-6">
                Appointment ,
                {selectedModalService && (
                  <span className="fs-7 fw-normal">
                    (
                    {filteredServices.find(
                      (s) => s._id === selectedModalService
                    )?.name || "Select Service"}
                    )
                  </span>
                )}
              </h1>

              <button
                onClick={() => resetStateOnCloseModel()}
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <div className="border d-flex flex-wrap">
                <div className="detailsDiv border-end">
                  <h3 className="fs-7 mb-3 fw-semibold text-brown">Details</h3>

                  <div className="form-group mb-3">
                    <select
                      className="form-select"
                      style={showFieldErrors && !selectedModalService ? errorStyle : undefined}
                      value={selectedModalService}
                      onChange={(e) => {
                        const value = e.target.value;
                        setSelectedModalService(value);
                        setPrefillService(value);
                        if (value) fetchEmployees(value); else setEmployeesList([]);
                      }}
                    >
                      <option value="">Select Service</option>
                      {filteredServices
                        .filter((service) => service.status === 1)
                        .map((service) => (
                          <option key={service._id} value={service._id}>{service.name}</option>
                        ))}
                    </select>
                  </div>
                  <div className="form-group mb-3">

                    <select
                      className="form-select"
                      style={showFieldErrors && !selectedModalEmployee ? errorStyle : undefined}
                      onChange={(e) => {
                        const value = e.target.value;

                        if (value === 'any') {
                          const activeEmployees = employeesList.filter(emp => emp.status === 1);
                          if (activeEmployees.length > 0) {
                            // const emp = activeEmployees[0]; // deterministic
                            const randomIndex = Math.floor(Math.random() * activeEmployees.length);
                            const emp = activeEmployees[randomIndex];
                            // setSelectedModalEmployee(emp._id);
                            // setSelectedModalEmployeeuserId(emp.userId);
                            // setPrefillEmployee(emp._id);
                            setSelectedModalEmployee('any');
                            setSelectedModalEmployeeuserId('any');
                            setPrefillEmployee('any');
                          }
                          return;
                        }

                        const emp = employeesList.find(emp => emp._id === value);
                        setSelectedModalEmployee(emp?._id || '');
                        setSelectedModalEmployeeuserId(emp?.userId || '');
                        setPrefillEmployee(emp?._id || '');
                      }}
                      value={selectedModalEmployee}
                    >
                      <option value="" disabled>Select Employee</option>
                      <option value="any">Any Employee</option>
                      {employeesList
                        .filter((emp) => emp.status === 1)
                        .map((emp) => (
                          <option key={emp._id} value={emp._id}>{emp.name}</option>
                        ))}
                    </select>

                  </div>

                  <div className="form-group mb-3">
                    <input
                      type="date"
                      className="form-control dateInput noCalendarIcon"
                      placeholder=""
                      value={selectedDate || ''}
                      readOnly
                      style={!canPickDate ? { cursor: 'not-allowed' } : undefined}
                      onKeyDown={(e) => e.preventDefault()}
                      onMouseDown={(e) => { if (!canPickDate) handleDateAttemptBeforeReady(e); }}
                      onFocus={(e) => {
                        if (!canPickDate) {
                          e.target.blur();
                          handleDateAttemptBeforeReady(e);
                        }
                      }}
                      onChange={(e) => {
                        // will only be usable when canPickDate === true
                        setSelectedDate(e.target.value);
                        setPrefillDate(e.target.value);
                      }}
                    />

                  </div>
                  {additionalServices.map((item, index) => (
                    <div key={item.key} className="border-top pt-3 mt-3">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h6 className="fw-semibold mb-0">
                          Additional Service {index + 1}
                        </h6>
                        <button
                          type="button"
                          className="btn btn-link text-danger fs-9 p-0"
                          onClick={() => handleRemoveAdditionalService(item.key)}
                        >
                          Remove
                        </button>
                      </div>
                      <div className="form-group mb-3">
                        <select
                          className="form-select"
                          value={item.serviceId || ""}
                          onChange={async (e) => {
                            const updated = [...additionalServices];
                            const serviceId = e.target.value;
                            updated[index].serviceId = serviceId;

                            if (serviceId) {
                              // Fetch employees for this service
                              const res = await postApi(config.ViewService, { id: serviceId });

                              updated[index].employees = res.data[0]?.employees || [];
                            } else {
                              updated[index].employees = [];
                            }

                            updated[index].employeeId = "";
                            updated[index].userId = "";
                            setAdditionalServices([...updated]); // ✅ force rerender
                          }}
                        >
                          <option value="">Select Service</option>
                          {filteredServices.map((service) => (
                            <option key={service._id} value={service._id}>
                              {service.name}
                            </option>
                          ))}
                        </select>

                      </div>

                      <div className="form-group mb-3">
                        <div className="form-group mb-3">
                          <select
                            className="form-select"
                            value={item.employeeId || ""}
                            onChange={(e) => {
                              const updated = [...additionalServices];
                              const emp = updated[index].employees.find(
                                (emp) => emp._id === e.target.value
                              );

                              updated[index] = {
                                ...updated[index],
                                employeeId: emp?._id || "",
                                userId: emp?.userId || "",
                              };

                              setAdditionalServices([...updated]); // ✅ force rerender
                              fetchUnavailableDates(null, updated);
                            }}
                          >
                            <option value="">Select Employee</option>
                            {item.employees.map((emp) => (
                              <option key={emp._id} value={emp._id}>
                                {emp.name}
                              </option>
                            ))}
                          </select>

                        </div>
                      </div>
                    </div>
                  ))}

                  {additionalServices.length <= 1 && <button
                    type="button"
                    className="btn btn-orange fs-9 rounded-5 serviceBtn overflow-hidden"
                    onClick={() =>
                      setAdditionalServices([
                        ...additionalServices,
                        {
                          serviceId: "",
                          employeeId: "",
                          userId: "",
                          employees: [],
                          key: Date.now(),
                        },
                      ])
                    }
                  >
                    +Add Services
                  </button>}
                  <div className="searchBtn">

                    <button
                      type="button"
                      className="btn btn-primary fs-7 w-100"
                      onClick={handleCheckAvailability}
                    >
                      Book
                    </button>
                  </div>
                </div>
                <div className="selectDatDiv" style={{ position: 'relative' }}>
                  {!canPickDate && (
                    <div
                      onClick={handleDateAttemptBeforeReady}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        zIndex: 10,
                        cursor: 'not-allowed',
                        background: 'transparent',
                      }}
                      aria-hidden="true"
                    />
                  )}
                  <div id="datePicker"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Go to Date Modal */}
      <div
        className="modal fade booknowModal"
        id="gotodate"
        tabIndex="-1"
        aria-hidden="true"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 rounded-1">
            <div className="modal-header border-0">
              <h1 className="modal-title fs-6">
                Appointment{" "}
                <span className="fs-7 fw-normal">
                  (
                  {filteredServices.find((s) => s._id === prefillService)
                    ?.name || "Select Service"}
                  )
                </span>
              </h1>
              <button
                onClick={resetStateOnCloseModel}
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <div className="border d-flex flex-wrap">
                <div className="detailsDiv border-end">
                  <h3 className="fs-7 mb-3 fw-semibold text-brown">Details</h3>

                  <div className="form-group mb-3">
                    <select
                      disabled
                      className="form-select"
                      value={prefillService}
                      onChange={(e) => {
                        const value = e.target.value;

                        setPrefillService(value);
                        if (value) fetchEmployees(value);
                        else setEmployeesList([]);
                      }}
                    >
                      <option value="">Select Service</option>
                      {filteredServices.map((s) => (
                        <option key={s._id} value={s._id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group mb-3">
                    <select
                      disabled
                      className="form-select"
                      value={prefillEmployee}
                      onChange={(e) => setPrefillEmployee(e.target.value)}
                    >
                      <option value="">Select Employee</option>
                      <option value="any">Any Employee</option>
                      {employeesList.map((emp) => (
                        <option key={emp._id} value={emp._id}>
                          {emp.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group mb-3">
                    <input
                      disabled
                      type="date"
                      className="form-control"
                      value={prefillDate || ""}
                      onKeyDown={(e) => e.preventDefault()} // 🧠 prevent typing even when enabled later
                      onChange={(e) => setPrefillDate(e.target.value)}
                    />

                  </div>

                  {/* Render additional services in gotodate modal */}
                  {additionalServices.map((item, index) => (
                    <div key={item.key} className="mb-3 border-top pt-3">
                      <h6 className="fw-semibold">
                        Additional Service {index + 1}
                      </h6>

                      <div className="form-group mb-2">
                        <select
                          disabled
                          className="form-select"
                          value={item.serviceId}
                        >
                          <option value="">Select Service</option>
                          <option value="any">Any Employee</option>
                          {filteredServices.map((s) => (
                            <option key={s._id} value={s._id}>
                              {s.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group mb-2">
                        <select
                          disabled
                          className="form-select"
                          value={item.employeeId}
                        >
                          <option value="">Select Employee</option>
                          {item.employees?.map((emp) => (
                            <option key={emp._id} value={emp._id}>
                              {emp.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}

                  <div id="moreService1" style={{ display: "none" }}>
                    <div className="form-group mb-3">
                      <select className="form-select">
                        <option>Select Service</option>
                      </select>
                    </div>
                    <div className="form-group mb-3">
                      <select className="form-select">
                        <option>Select Employee</option>
                      </select>
                    </div>
                  </div>
                  {/* <button className="btn btn-orange fs-9 rounded-5 serviceBtn overflow-hidden">
                    +Add Service
                  </button> */}
                  <div className="searchBtn d-flex justify-content-center">
                    <button
                      type="button"
                      className="btn btn-primary fs-7 m-1 w-50"
                      onClick={() => {
                        const bookModal = bootstrap.Modal.getInstance(
                          document.getElementById("gotodate")
                        );
                        bookModal?.hide();
                        const modal = new bootstrap.Modal(
                          document.getElementById("booknowModal")
                        );
                        modal.show();
                      }}
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary m-1 fs-7 w-50"
                      disabled={selectedSlots.length === 0}
                      onClick={handleFinalBooking}
                    >
                      Book
                    </button>
                  </div>
                </div>

                <div className="selectDatDiv">
                  <div className="scrollBr" style={{maxHeight:"500px", overflow:"hidden",overflowY:"auto"}}>
                    {checkslotresponse?.slots?.length > 0 ? (
                      checkslotresponse.slots.map((empGroup, empIndex) => {
                        const visibleSlots = filterPastSlotsIfToday(empGroup.slots, prefillDate, 0);
                        // you can change 0 -> 5 if you want a buffer

                        const employeeId = empGroup?.employeeData?._id;
                        const derivedServiceId =
                          empGroup?.serviceDetails?.serviceId ||
                          empGroup?.serviceDetails?._id ||
                          empGroup?.serviceId ||
                          empGroup?.service?._id ||
                          prefillService;

                        const isSlotSelected = (slot) =>
                          selectedSlots.some(
                            (s) =>
                              s.slot.startTime === slot.startTime &&
                              s.empId === employeeId &&
                              s.serviceId === derivedServiceId
                          );

                        const isSameTimeTakenForEmployee = (slot) =>
                          selectedSlots.some(
                            (s) =>
                              s.empId === employeeId &&
                              s.slot.startTime === slot.startTime &&
                              s.serviceId !== derivedServiceId // taken by another service
                          );


                        // const handleSlotSelection = (slot) => {
                        //   console.log(slot, "slotslot")
                        //   const newStart = new Date(slot.startTime);
                        //   const newEnd = new Date(slot.endTime);

                        //   for (const existing of selectedSlots) {

                        //     const existStart = new Date(existing.slot.startTime);
                        //     const existEnd = new Date(existing.slot.endTime);
                        //     // console.log(newStart, existEnd, newEnd, existStart, "newStart < existEnd && newEnd > existStart", newStart < existEnd, newEnd > existStart)
                        //     if (newStart < existEnd && newEnd > existStart) {
                        //       alert("This slot is already selected. Please select next available slot");
                        //       return;
                        //     }

                        //   }

                        //   setSelectedSlots((prev) => {
                        //     const timeAlreadyTaken = prev.some(
                        //       (s) =>
                        //         s.empId === employeeId &&
                        //         s.slot.startTime === slot.startTime &&
                        //         s.serviceId !== derivedServiceId
                        //     );

                        //     if (timeAlreadyTaken) {
                        //       alert("You can't select the same time for the same employee across different services.");
                        //       return prev; // ✅ block selection
                        //     }

                        //     const isSameSlot = (s) =>
                        //       s.slot.startTime === slot.startTime &&
                        //       s.empId === employeeId &&
                        //       s.serviceId === derivedServiceId;

                        //     if (prev.some(isSameSlot)) {
                        //       return prev.filter((s) => !isSameSlot(s)); // toggle off
                        //     }

                        //     const filtered = prev.filter(
                        //       (s) => !(s.empId === employeeId && s.serviceId === derivedServiceId)
                        //     );

                        //     return [
                        //       ...filtered,
                        //       {
                        //         slot,
                        //         empId: employeeId,
                        //         serviceId: derivedServiceId,
                        //         employeeData: empGroup.employeeData,
                        //         serviceDetails: empGroup.serviceDetails,
                        //       },
                        //     ];
                        //   });
                        // };

                        const handleSlotSelection = (slot) => {
  const newStart = new Date(slot.startTime);
  const newEnd = new Date(slot.endTime);

  // 🔴 STEP 1: Check overlap with OTHER SERVICES (BLOCK)
  for (const existing of selectedSlots) {
    if (existing.serviceId !== derivedServiceId) {
      const existStart = new Date(existing.slot.startTime);
      const existEnd = new Date(existing.slot.endTime);

      if (newStart < existEnd && newEnd > existStart) {
        alert("You cannot select same/overlapping time for different services");
        return; // ❌ STOP here (no change)
      }
    }
  }

  // ✅ STEP 2: Allow replace inside SAME SERVICE
  setSelectedSlots((prev) => {

    // 🔥 Remove all slots of SAME SERVICE (auto replace)
    let updated = prev.filter(
      (s) => s.serviceId !== derivedServiceId
    );

    // 🔁 Toggle same slot (optional)
    const isSameSlot = prev.some(
      (s) =>
        s.slot.startTime === slot.startTime &&
        s.empId === employeeId &&
        s.serviceId === derivedServiceId
    );

    if (isSameSlot) {
      return updated;
    }

    // ✅ Add new slot
    return [
      ...updated,
      {
        slot,
        empId: employeeId,
        serviceId: derivedServiceId,
        employeeData: empGroup.employeeData,
        serviceDetails: empGroup.serviceDetails,
      },
    ];
  });
};

                        return (
                          <>
                            <div className="textprfile d-md-flex justify-content-between flex-wrap">
                              <div
                                className="d-flex align-items-center gap-3"
                                style={{ cursor: "pointer" }}
                                onClick={() => {
                                  setSelectedEmployee(empGroup?.employeeData);
                                  setSelectedEmployeeReviews(empGroup?.reviews || {});

                                  // SHOW BLUR OVERLAY
                                  document.getElementById("ratingOverlay").style.display = "block";

                                  // OPEN RATING MODAL WITHOUT closing parent modal
                                  const modal = new bootstrap.Modal(document.getElementById("ratingModal"), {
                                    backdrop: false,
                                    keyboard: false
                                  });
                                  modal.show();
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
                                    {getInitials(
                                      empGroup?.employeeData?.userDetails?.name
                                    )}
                                  </div> */}
                                  <img src={`${process.env.NEXT_PUBLIC_API_URL}/${empGroup?.employeeData?.userDetails?.file}`} alt="" />
                                </figure>

                                <div className="">
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
                                <button
                                  className="btn btn-primary ms-2"
                                  type="button"
                                  onClick={() => {
                                    // show the shared blur overlay (reuse your ratingOverlay)
                                    const overlay = document.getElementById("ratingOverlay");
                                    if (overlay) overlay.style.display = "block";

                                    // open waitlist above current modal without closing it
                                    const modal = new bootstrap.Modal(
                                      document.getElementById("addWaitlist"),
                                      { backdrop: false, keyboard: false }
                                    );
                                    modal.show();
                                  }}
                                >
                                  Add to waitlist
                                </button>
                              </span>
                            </div>
                            <span className="textprfile fw-semibold">{empGroup.serviceDetails.service.name}</span>

                            <span className="d-flex ">Service Offering Time : {(new Date(visibleSlots[0]?.endTime) - new Date(visibleSlots[0]?.startTime)) / (1000 * 60)} Min.<span className="textprfile text-muted" style={{ fontSize: "9px" }}>(Including cleanup time) </span></span>
                            <strong className="fw-semibold my-4 d-block">
                              {prefillDate &&
                                new Date(prefillDate + "T00:00:00").toLocaleDateString(
                                  "en-US",
                                  {
                                    weekday: "short",
                                    month: "short",
                                    day: "2-digit",
                                    year: "numeric",
                                    timeZone: "America/New_York",
                                  }
                                )}
                            </strong>

                            <div
                              key={empGroup.employeeData?._id || empIndex}
                              className="mb-4 "
                            >
                              {/* Employee Info */}

                              {/* Morning Slots */}
                              <span className="fw-medium">Morning</span>
                              <div className="d-flex flex-wrap gap-2 mt-2 mb-3">
                                {visibleSlots
                                  .filter((slot) =>
                                    //  new Date(slot.startTime).getHours()
                                    Number(
                                      new Date(slot.startTime).toLocaleString("en-US", {
                                        hour: "numeric",
                                        hour12: false,
                                        timeZone: "America/New_York",
                                      })) < 12)
                                      .map((slot, i) => (
                                        <button
                                          type="button"
                                          key={`morning-${empIndex}-${i}`}
                                          className={`btn fs-9 rounded-5 px-4 serviceBtn overflow-hidden 
                                       ${isSlotSelected(slot)
                                              ? "btn-greenslot"
                                              : "btn-orange"
                                            }`}
                                          onClick={() => {
                                            handleSlotSelection(slot);
                                          }}
                                        >
                                          {/* {moment.utc(slot.startTime).format('hh:mm ')} */}
                                          {/* {new Date(
                                        slot.startTime
                                      )
                                      .toLocaleTimeString("en-US", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: true})} */}
                                          {new Date(
                                            slot.startTime
                                          ).toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            timeZone: "America/New_York",
                                          })}
                                        </button>
                                      ))}
                              </div>

                              {/* Afternoon Slots */}
                              <span className="fw-medium">Afternoon</span>
                              <div className="d-flex flex-wrap gap-2 mt-2 mb-3">
                                {visibleSlots
                                  .filter((slot) =>
                                    // new Date(slot.startTime).getHours()
                                    Number(
                                      new Date(slot.startTime).toLocaleString("en-US", {
                                        hour: "numeric",
                                        hour12: false,
                                        timeZone: "America/New_York",
                                      })) >= 12)
                                      .map((slot, i) => (
                                        <button
                                          type="button"
                                          key={`afternoon-${empIndex}-${i}`}
                                          className={`btn fs-9 rounded-5 px-4 serviceBtn overflow-hidden 
  ${isSlotSelected(slot)
                                              ? "btn-greenslot"
                                              : "btn-orange"
                                            }`}
                                          onClick={() => {
                                            handleSlotSelection(slot);
                                          }}
                                        >
                                          {/* {console.log(Intl.DateTimeFormat(slot.startTime).resolvedOptions().timeZone,"Intl.DateTimeFormat().resolvedOptions().timeZone;")} */}
                                          {/* {moment.utc(slot.startTime).format('hh:mm ')} */}
                                          {new Date(
                                            slot.startTime
                                          ).toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            timeZone: "America/New_York",
                                          })}
                                        </button>
                                      ))}
                              </div>
                            </div>
                          </>
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
      <div
        className="modal fade booknowModal"
        id="addWaitlist"
        tabIndex="-1"
        data-bs-backdrop="false"
        data-bs-keyboard="false"
        aria-hidden="true"
        style={{ zIndex: 2001 }}
      >

        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 rounded-1">
            <div className="modal-header border-0">
              <h1 className="modal-title fs-6">Add to waitlist</h1>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div
              className="modal-body"
              onMouseDownCapture={closeWaitlistPersonIfOutside}
              onFocusCapture={closeWaitlistPersonIfOutside}
            >


              <div className="">
                <div className="detailsDiv w-100 p-0 pb-3">
                  <div className="waitlistPersonWrap mb-3" ref={waitlistDropdownRef}>
                    <button
                      type="button"
                      className={`waitlistPersonTrigger ${waitlistPersonOpen ? "open" : ""}`}
                      onClick={() => setWaitlistPersonOpen((v) => !v)}
                    >
                      <span className="waitlistAvatar">
                        {getInitials(waitlistFor?.label || userData?.name || "U")}
                      </span>

                      <div className="waitlistPersonMeta">
                        <div className="waitlistPersonName">
                          {waitlistFor?.label || `${userData?.name || "Me"} (Me)`}
                        </div>
                      </div>

                      <i
                        className={`bi bi-chevron-down waitlistChevron ${waitlistPersonOpen ? "rot" : ""
                          }`}
                      />
                    </button>

                    {waitlistPersonOpen && (
                      <div className="waitlistMenu">
                        {/* Self */}
                        <button
                          type="button"
                          className={`waitlistMenuItem ${waitlistFor?.type === "self" ? "active" : ""
                            }`}
                          onClick={() => {
                            setWaitlistFor({
                              type: "self",
                              id: userData?._id,
                              label: `${userData?.name || "Me"} (Me)`,
                            });
                            setWaitlistPersonOpen(false);
                          }}
                        >
                          <span className="waitlistAvatar sm">
                            {getInitials(userData?.name || "Me")}
                          </span>
                          <span className="waitlistMenuLabel">
                            {userData?.name || "Me"} (Me)
                          </span>
                        </button>

                        {/* Family */}
                        {userFamilyData.map((m) => {
                          const label = `${m.firstName || ""} ${m.lastName || ""} (${m.relation || "Family"
                            })`;

                          return (
                            <button
                              key={m._id}
                              type="button"
                              className={`waitlistMenuItem ${waitlistFor?.type === "family" && waitlistFor?.id === m._id
                                ? "active"
                                : ""
                                }`}
                              onClick={() => {
                                setWaitlistFor({
                                  type: "family",
                                  id: m._id,
                                  label,
                                });
                                setWaitlistPersonOpen(false);
                              }}
                            >
                              <span className="waitlistAvatar sm">{getInitials(label)}</span>
                              <span className="waitlistMenuLabel">{label}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>






                  <div className="form-group mb-3">
                    <label>Select Service</label>
                    <select
                      className="form-select"
                      value={waitlistService}
                      style={showWaitlistErrors && !waitlistService ? errorStyle : undefined}
                      onChange={(e) => handleWaitlistServiceChange(e.target.value)}
                    >
                      <option value="">Select Service</option>
                      {filteredServices.filter(s => s.status === 1).map(s => (
                        <option key={s._id} value={s._id}>{s.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="row">
                    <div className="col-lg-6">
                      <div className="form-group mb-3">
                        <label>Select Employee</label>
                        <select
                          className="form-select"
                          value={waitlistEmployee}
                          style={showWaitlistErrors && !waitlistEmployee ? errorStyle : undefined}
                          onChange={(e) => setWaitlistEmployee(e.target.value)}
                        >
                          <option value="">Select Employee</option>
                          {waitlistEmployees.filter(emp => emp.status === 1).map(emp => (
                            <option key={emp._id} value={emp._id}>{emp.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                  {waitlistEntries.map((entry, ind) => {
                    const dateError = showWaitlistErrors && !entry.date;
                    const timeError = showWaitlistErrors && !entry.time;
                    return (
                      <div className="row" key={entry.key}>
                        <div className="col-lg-5">
                          <div className="form-group mb-3">
                            <label className="fw-semibold mb-2">Date</label>
                            <input
                              type="date"
                              className="form-control"
                              value={entry.date}
                              min={getTomorrowYMD()}                 // ✅ block today + past
                              style={dateError ? errorStyle : undefined}
                              onChange={(e) =>
                                handleWaitlistChange(entry.key, "date", e.target.value, ind)
                              }
                            />

                          </div>
                        </div>
                        {/* <div className="col-lg-5">
                          <div className="form-group mb-3">
                            <label className="fw-semibold mb-2">Time</label>
                            <select
                              className="form-control"
                              value={entry.time || ""}
                              style={timeError ? errorStyle : undefined}
                              onChange={(e) =>
                                handleWaitlistChange(entry.key, "time", e.target.value, ind)
                              }
                            >
                              <option value="">Select Time</option>
                              {Array.isArray(waitlistDateWiseSlots[ind]) && waitlistDateWiseSlots[ind].length > 0 ? (
                                waitlistDateWiseSlots[ind].map((slot, idx) => (
                                  <option key={slot._id || slot.startTime || idx} value={slot.startTime}>
                                    {new Date(slot.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                  </option>
                                ))
                              ) : (
                                <option disabled>No slots available</option>
                              )}
                            </select>
                          </div>
                        </div> */}
                        <div className="col-lg-2 d-flex align-items-center pt-2">
                          {waitlistEntries?.length > 1 &&
                            <button
                              type="button"
                              className="btn btn-outline-danger"
                              style={{ height: "38px" }}
                              onClick={() => handleRemoveWaitlistEntry(entry.key)}
                            >
                              ×
                            </button>}
                        </div>
                      </div>
                    );
                  })}


                  {/* <div className="">

                    <button
                      type="button"
                      className="btn btn-orange fs-9 rounded-5 serviceBtn overflow-hidden"
                      onClick={handleAddWaitlistEntry}
                    >
                      +Add waitlist Date & time
                    </button>

                  </div> */}
                  <div className="d-flex gap-2 justify-content-center mt-5">
                    <button
                      type="button"
                      className="btn btn-secondary fs-7 px-5"
                      data-bs-dismiss="modal"
                      aria-label="Close"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary fs-7 px-4"
                      disabled={!isWaitlistValid}
                      style={{
                        opacity: isWaitlistValid ? 1 : 0.65,
                        cursor: isWaitlistValid ? 'pointer' : 'not-allowed'
                      }}
                      onClick={(e) => {
                        if (!isWaitlistValid) {
                          e.preventDefault();
                          setShowWaitlistErrors(true);
                          alert('Please select Service, Employee, and at least one Date & Time.');
                          return;
                        }
                        handleAddToWaitlist();
                      }}
                    >
                      Add to waitlist
                    </button>

                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rating Model  */}

      <div
        className="modal fade"
        id="ratingModal"
        tabIndex="-1"
        data-bs-backdrop="false"
        data-bs-keyboard="false"
        aria-hidden="true"
        style={{ zIndex: 2001 }}
      >


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
              <div className="prflImage mb-3">
                <figure className="m-0">
                  <div
                    className="d-flex justify-content-center align-items-center "
                    style={{
                      width: "65px",
                      height: "55px",
                      backgroundColor: "#E0E0E0",
                      fontSize: "26px",
                      fontWeight: "bold",
                      color: "#662A09",
                      borderRadius: "4px",
                    }}
                  >


                    <img src={`${process.env.NEXT_PUBLIC_API_URL}/${selectedEmployee?.userDetails?.file}`} alt="" />
                    {/* {getInitials(selectedEmployee?.userDetails?.name)} */}
                  </div>
                </figure>
                <div>
                  <span className="fw-semibold fs-7">
                    {selectedEmployee?.userDetails?.name}
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
              <h6 className="fw-semibold fs-8">Reviews</h6>
              <ul className="reviewsUl">
                {selectedEmployeeReviews?.data?.map((review, i) => (
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

                    <div className="my-2">
                      <StarRating value={review.overall_review} size={16} />
                    </div>

                    <p className="fs-9 text-black">{review.comment}</p>
                    <hr />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <LoginPopup
        show={openLogin}
        onClose={() => setOpenLogin(false)}
        title="Login Required"
        heading="Please login"
        description="You must be logged in to book an appointment."
        buttonText="Continue"
        onButtonClick={() => setOpenLogin(false)}
      />

      <div
        id="ratingOverlay"
        style={{
          display: 'none',
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(5px)',
          zIndex: 1500,
          pointerEvents: 'none',   // ✅ add this
        }}
      ></div>


    </>
  );
};
export default AyurvedicInitialConsult;
