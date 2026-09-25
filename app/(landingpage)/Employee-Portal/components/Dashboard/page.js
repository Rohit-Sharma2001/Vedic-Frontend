'use client'
import { useEffect, useRef, useState } from 'react';
import { useRouter } from "next/navigation";
import { useLanguage } from "context/languageContext";
import { config } from 'services/config';
import { postApi } from 'services/api';
import Link from 'node_modules/next/link';
import HeaderWithDropdown from 'app/(landingpage)/LandingPage/components/HeaderWithDropdown/page';
import FooterSection from 'app/(landingpage)/LandingPage/components/Footer/page';
import 'app/(landingpage)/LandingPage/public/css/style.css'
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import { DateTime } from "luxon";
import Swal from "sweetalert2";
import PractitionerHeader from '../PractionerHeader/page';
import moment from 'moment'


export default function EmployeeDashboard() {
  const { logout } = useLanguage();

  const [availableSlots, setAvailableSlots] = useState([]);
  const [employee, setEmployee] = useState(null);
  const [summary, setSummary] = useState(null);
  const [nextAppointments, setNextAppointments] = useState([]);
  const [services, setServices] = useState([]);
  // --- Add inside your EmployeeDashboard component ---
  const [selectedDate, setSelectedDate] = useState(moment().format("YYYY-MM-DD"));
  const isToday = selectedDate === DateTime.now().toISODate();
  const [selectedTimes, setSelectedTimes] = useState([]);
  const [applyToMonth, setApplyToMonth] = useState(false);
  const [unavailableDates, setUnavailableDates] = useState([]);
  const [unavailableSlots, setUnavailableSlots] = useState()
  const calendarInstanceRef = useRef(null);
  const [todayAvailableSlots, setTodayAvailableSlots] = useState(0)

  console.log(selectedDate, "unavailableDatesunavailableDates")
  const handleToggleTime = (timeLabel) => {
    if (!selectedDate) {
      alert("Please select a date first.");
      return;
    }

    setSelectedTimes((prev) =>
      prev.includes(timeLabel)
        ? prev.filter((t) => t !== timeLabel)
        : [...prev, timeLabel]
    );
  };


  const handleLogout = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out of your account.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, logout",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
    }).then((result) => {
      if (result.isConfirmed) {
        logout();               // clear user data
        Swal.fire({
          title: "Logged Out",
          text: "You have been successfully logged out.",
          icon: "success",
          timer: 500,
          showConfirmButton: false,
        });
        setTimeout(() => {
          router.push("/Log-in"); // redirect to login page
        }, 500);
      }
    });
  };


  const removePastTimesForToday = (slotList, date) => {
    // setSelectedDate(moment().format("YYYY-MM-DD"))
    if (isToday) return slotList;
    if (unavailableDates.includes(date || moment().format("YYYY-MM-DD"))) {
      console.log(moment().format("YYYY-MM-DD"), "oment().format()")
      return []
    }

    const now = DateTime.now();
    console.log(slotList, "slotListslotList")
    return slotList.filter((t) => {
      const slotTime = DateTime.fromFormat(t, "hh:mm a");
      return slotTime > now; // keep only future times
    });
  };

  const handleAddTask = async () => {
    if (!employee?._id || !employee?.user?._id) {
      Swal.fire("Error", "Employee not loaded yet.", "error");
      return;
    }

    if (!selectedDate) {
      Swal.fire("Error", "Please select a date from the calendar.", "warning");
      return;
    }

    if (selectedTimes.length === 0) {
      Swal.fire("Error", "Please select at least one time slot.", "warning");
      return;
    }

    try {
      for (const timeLabel of selectedTimes) {
        const time24 = DateTime.fromFormat(timeLabel, "hh:mm a").toFormat("HH:mm");

        const payload = {
          serviceId: "",
          centerId: employee.centerId,
          employeeId: employee._id,
          userId: employee.user._id,
          note: "Personal Task",
          addonId: "",
          duration: 60,
          price: 0,
          date: selectedDate,
          time: time24,
          deposit: 0,
          repeat: "Off",
        };

        const response = await postApi(config.addBreak, payload);

        // 🔥 HANDLE FAILURE
        if (response.statusCode !== 200) {
          Swal.fire("Unavailable", response.message || "This time slot is not available.", "error");
          return; // stop further slot processing
        }
      }

      // 🔥 SUCCESS AFTER ALL SLOTS
      Swal.fire({
        title: "Success!",
        text: "Task(s) added successfully.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });

      setSelectedTimes([]);

    } catch (err) {
      console.error("Error adding task:", err);
      Swal.fire("Error", "Something went wrong. Try again later.", "error");
    }
  };


  const router = useRouter();

  const generateTimeSlots = (start, end) => {
    const slots = [];
    let cursor = DateTime.fromFormat(start, "HH:mm");
    const endTime = DateTime.fromFormat(end, "HH:mm");

    while (cursor < endTime) {
      slots.push(cursor.toFormat("hh:mm a"));
      cursor = cursor.plus({ minutes: 60 });
    }



    return slots;
  };
  // const employeeAvailableSlot = async ( date) => {
  //   try {
  //     console.log("llllllllllll")
  //    // ✅ get that specific appointment
  //     const payload = {
  //       slotsPayload: [
  //         {

  //           employeeId: JSON.parse(localStorage.getItem("user"))?._id ,
  //         //  userId: userId || "", // ✅ send the client's userId
  //           date,
  //         },
  //       ],
  //     };

  //     const res = await postApi(config.employeeAvailableSlot, payload);

  //     // if (res?.slots?.length) {
  //       const slotObjs = res.slots[0].slots;
  //     //   setAppointments((prev) =>
  //     //     prev.map((a, i) =>
  //     //       i === apptIndex ? { ...a, availableSlots: slotObjs } : a
  //     //     )
  //     //   );
  //     // } else {
  //     //   setAppointments((prev) =>
  //     //     prev.map((a, i) =>
  //     //       i === apptIndex ? { ...a, availableSlots: [] } : a
  //     //     )
  //     //   );
  //     // }
  //   } catch (error) {
  //     console.error("Failed to fetch available slots:", error);
  //   }
  // };
  const employeeAvailableSlot = async (date, today) => {
    try {
      const payload = {
        slotsPayload: [
          {
            employeeId: JSON.parse(localStorage.getItem("user"))?._id,
            date,
          },
        ],
      };

      const res = await postApi(config.employeeAvailableSlot, payload);

      if (res?.slots?.length) {
        const slotObjs = res.slots[0].slots || [];

        // 🔥 Convert API slots → UI format
        const formattedSlots = slotObjs.map((slot) =>
          DateTime
            .fromISO(slot.startTime, { zone: "utc" })   // 👈 parse as UTC
            .setZone(DateTime.local().zoneName)          // 👈 convert to local (IST)
            .toFormat("hh:mm a")
        );

        // 🔥 Remove past times if today
        const finalSlots = removePastTimesForToday(formattedSlots, date);


        console.log(formattedSlots, slotObjs, finalSlots, "formattedSlots")
        setTodayAvailableSlots(finalSlots?.length || 0)
        setAvailableSlots(finalSlots);
      } else {
        setAvailableSlots([]);
      }
    } catch (error) {
      console.error("Failed to fetch available slots:", error);
      setAvailableSlots([]);
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    const calendarElement = document.getElementById("datePicker");
    if (!calendarElement) return;

    if (calendarInstanceRef.current) {
      calendarInstanceRef.current.destroy();
      calendarInstanceRef.current = null;
    }

    calendarInstanceRef.current = flatpickr(calendarElement, {
      dateFormat: "Y-m-d",
      inline: true,
      disableMobile: true,
      defaultDate: new Date(),
      minDate: "today",
      disable: [
        (date) => {
          const dateStr = DateTime.fromJSDate(date).toISODate();
          const today = DateTime.now().toISODate();
          return dateStr < today || unavailableDates.includes(dateStr);
        },
      ],
      onChange: (selectedDates, dateStr) => {
        employeeAvailableSlot(dateStr)
        setSelectedDate(dateStr); // ✅ capture selected date
      },
    });

    return () => {
      if (calendarInstanceRef.current) {
        calendarInstanceRef.current.destroy();
        calendarInstanceRef.current = null;
      }
    };
  }, [unavailableDates]);


  useEffect(() => {
    const isLoggedIn = localStorage.getItem("loggedIn") === "true";
    const role = localStorage.getItem("userRole");

    if (!isLoggedIn || role !== "practitioner") {
      router.push("/Log-in");
    }
  }, []);


  useEffect(() => {
    fetchEmployeeDetails();
    employeeAvailableSlot(moment().format("YYYY-MM-DD"), "toady")
  }, []);



  const fetchEmployeeDetails = async () => {
    try {

      const employeeId = JSON.parse(localStorage.getItem("user") || JSON.stringify({}));;
      const endpoint = config.viewEmployeeByUserId;
      const data = {
        userId: employeeId?._id
      }

      const response = await postApi(endpoint, data);

      console.log('employee', response.data?.employee)
      if (response.statusCode === 201 || response.statusCode === 200) {
        //   console.log("Employee Response:",response.data?.employee)
        setEmployee(response.data?.employee);
        fetchDashboardData(response.data?.employee);
        fetchNextAppointements(response.data?.employee);
        fetchServicesfor(response.data?.employee)



      }
    } catch (error) {
      console.error("Error fetching employee:", error);
    }
  };

  useEffect(() => {
    console.log("aa gya is me ", employee)
    if (employee?._id) {
      fetchUnavailableDates(employee._id);
    }
  }, [employee?._id]);


  const getInitials = (name = "") => {
    const words = name.trim().split(" ");
    if (words.length === 1) return words[0][0]?.toUpperCase() || "";
    return (words[0][0] + words[1][0]).toUpperCase();
  };

  const fetchDashboardData = async (employee) => {
    try {
      const data = { employeeId: employee?._id };
      const response = await postApi(config.summary, data);

      if (response.statusCode === 200 || response.statusCode === 201) {
        //   console.log("Dashboard Data:", response.data);
        setSummary(response.data);
      }
    } catch (error) {
      console.error("Error fetching summary:", error);
    }
  };

  const fetchNextAppointements = async (employee) => {
    try {
      const data = { employeeId: employee?._id };
      const response = await postApi(config.nextAppointments, data);

      if (response.statusCode === 200 || response.statusCode === 201) {
        // console.log("Next Appointment Data:", response.data);
        setNextAppointments(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching next appointments:", error);
    }
  };

  const fetchServicesfor = async (employee) => {
    try {
      const data = { employeeId: employee?._id };
      const response = await postApi(config.employeeServices, data);

      if (response.statusCode === 200 || response.statusCode === 201) {
        console.log("Services Data:", response.data);
        setServices(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  const fetchUnavailableDates = async (employeeId) => {
    try {
      const today = DateTime.now().startOf("day").toISODate();
      const endDate = DateTime.now().plus({ months: 6 }).toISODate();

      const payload = {
        slotsPayload: [
          {
            employeeId,
            startDate: today,
            endDate,
          },
        ],
      };

      const response = await postApi(config.findUnavailableDates, payload);

      if (response?.statusCode === 200 && Array.isArray(response.data)) {
        const dates = [
          ...new Set(
            response.data.flatMap((entry) => entry.unavailableDates || [])
          ),
        ];
        setUnavailableDates(dates);
      } else {
        setUnavailableDates([]);
      }
    } catch (error) {
      console.error("Error fetching unavailable dates:", error);
      setUnavailableDates([]);
    }
  };
  // let availableSlots = [];

  // if (employee?.working_time_start && employee?.working_time_end) {
  //   const slots = generateTimeSlots(employee.working_time_start, employee.working_time_end);
  //   availableSlots=removePastTimesForToday(slots);
  // }


  // const morningSlots = availableSlots?.filter(t => {
  //   const hour = DateTime.fromFormat(t, "hh:mm a").hour;
  //   return hour >= 5 && hour < 12;
  // });

  // const afternoonSlots = availableSlots?.filter(t => {
  //   const hour = DateTime.fromFormat(t, "hh:mm a").hour;
  //   return hour >= 12 && hour < 16;
  // });

  // const eveningSlots = availableSlots?.filter(t => {
  //   const hour = DateTime.fromFormat(t, "hh:mm a").hour;
  //   return hour >= 16;
  // });
  const morningSlots = availableSlots?.filter((t) => {
    const estHour = DateTime.fromFormat(t, "hh:mm a", {
      zone: "America/New_York",
    }).hour;

    return estHour >= 5 && estHour < 12;
  });

  const afternoonSlots = availableSlots?.filter((t) => {
    const estHour = DateTime.fromFormat(t, "hh:mm a", {
      zone: "America/New_York",
    }).hour;

    return estHour >= 12 && estHour < 16;
  });

  const eveningSlots = availableSlots?.filter((t) => {
    const estHour = DateTime.fromFormat(t, "hh:mm a", {
      zone: "America/New_York",
    }).hour;

    return estHour >= 16;
  });

  return (
    <>
      {/* <div className="mainHeaderchat d-flex flex-wrap justify-content-between align-items-center">
        <div className="logoLeft">
          <img src="/images/landingpage/vedic-health.png" alt="" width="160" />
        </div>
        
        <div className="profileMain">
          <a href="javascript:void(0)" className="profile-image">
            <img src={`${process.env.NEXT_PUBLIC_API_URL}/${employee?.user?.file}`} alt="" />
          </a>

        </div>

      </div> */}

      <PractitionerHeader />



      <div className="profilesection " style={{ paddingTop: '40px' }}>
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-4 col-lg-3">
              <div className="sidebarBx">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h2 className="fs-7 fw-semibold m-0">My Account</h2>
                  <button type="button" className="closeSide d-lg-none"><img src="/images/landingpage/close-icon.svg" alt=""
                    width="24px" /></button>
                </div>
                <ul className="sidebar">
                  <li><Link href={`/Employee-Portal/components/Dashboard`} className="active">
                    <figure> <img src="/images/landingpage/my-profile-icon.svg" alt="" width="20" /></figure> Dashboard
                  </Link></li>
                  <li><Link href={`/Employee-Portal/components/Calender`}>
                    <figure> <img src="/images/landingpage/calender-icon.svg" alt="" width="20" /></figure>
                    Calender
                  </Link></li>
                  <li><Link href={`/Employee-Portal/components/Earnings`}>
                    <figure> <img src="/images/landingpage/earnings-icon.svg" alt="" width="16" /></figure>Earnings
                  </Link></li>
                  <li><Link href={`/Employee-Portal/components/Product`}>
                    <figure> <img src="/images/landingpage/product-icon.svg" alt="" width="21" /></figure>Product
                  </Link></li>
                  <li>
                    <Link
                      href={`/`}
                      className="d-flex align-items-center gap-2"
                    >
                      <figure>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <line x1="2" y1="12" x2="22" y2="12" />
                          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                        </svg>
                      </figure>
                      Move To Website
                    </Link>
                  </li>
                  <li>
                    <a
                      className="text-danger bg-transparent border-0 d-flex align-items-center gap-2"
                      onClick={handleLogout}
                      style={{ cursor: "pointer" }}
                    >
                      <figure>
                        <img src="/images/landingpage/logout-icon.svg" alt="" width="16" />
                      </figure>
                      Log out
                    </a>
                  </li>

                </ul>
              </div>
            </div>
            <div className="col-md-12 col-lg-9 ps-md-2 mb-3">
              <div
                className="myaccoutToggle d-flex d-lg-none align-items-center gap-3 mb-3 w-100 justify-content-between">
                <h3 className="fs-7 fw-semibold m-0">My Account</h3>
                <button type="button" className="accToggle"><img src="/images/landingpage/toggle-icon.svg" alt=""
                  width="24" /></button>
              </div>
              <div className="mb-3">
                <h2 className="fs-5 fw-semibold mb-1">Welcome Back, {employee?.user?.name}</h2>
                <p className="fs-8 text-secondary fw-medium">Here is your wellness practice overview</p>



                <div className="row g-3 mb-4">
                  {/* ✅ Today Appointment */}
                  <div className="col-md-6 col-xl-3">
                    <div className="card-stats">
                      <figure><img src="/images/landingpage/today-appointment.svg" alt="" /></figure>
                      <div>
                        <h3>Today Appointment</h3>
                        <strong>{summary ? summary.todayAppointments : 0}</strong>
                        <small className={summary && summary.todayChange >= 0 ? "text-success" : "text-danger"}>
                          {summary
                            ? `${summary.todayChange >= 0 ? "+" : ""}${summary.todayChange} from yesterday`
                            : ""}
                        </small>
                      </div>
                    </div>
                  </div>

                  {/* ✅ This Month */}
                  <div className="col-md-6 col-xl-3">
                    <div className="card-stats">
                      <figure><img src="/images/landingpage/today-appointment.svg" alt="" /></figure>
                      <div>
                        <h3>This Month</h3>
                        <strong>{summary ? summary.monthAppointments : 0}</strong>
                        <small className={summary && summary.monthChange >= 0 ? "text-success" : "text-danger"}>
                          {summary
                            ? `${summary.monthChange >= 0 ? "+" : ""}${summary.monthChange} from last month`
                            : ""}
                        </small>
                      </div>
                    </div>
                  </div>

                  {/* ✅ Earnings */}
                  <div className="col-md-6 col-xl-3">
                    <div className="card-stats">
                      <figure><img src="/images/landingpage/earnings-icon2.svg" alt="" /></figure>
                      <div>
                        <h3>Earnings</h3>
                        <strong>${summary ? summary?.earnings?.toLocaleString() : 0}</strong>
                        <small className={summary && summary?.earningsChange >= 0 ? "text-success" : "text-danger"}>
                          {summary
                            ? `${summary?.earningsChange >= 0 ? "+" : ""}${summary?.earningsChange} from last month`
                            : ""}
                        </small>
                      </div>
                    </div>
                  </div>

                  {/* ✅ Available Slots Today */}
                  <div className="col-md-6 col-xl-3">
                    <div className="card-stats">
                      <figure><img src="/images/landingpage/available-slot-today.svg" alt="" /></figure>
                      <div>
                        <h3>Available Slot Today</h3>
                        <strong>{todayAvailableSlots ? todayAvailableSlots : 0}</strong>
                      </div>
                    </div>
                  </div>
                </div>


                <div className="row px-lg-1">

                  <div className="col-xl-6 px-xl-2 mb-4 mb-xl-0">
                    <h3 className="fs-7 fw-semibold mb-3">Next Appointment</h3>
                    <div className="grayCard">
                      {nextAppointments.length > 0 ? (
                        <>
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <h4 className="text-secondary fs-8 mb-0">
                              {nextAppointments[0].date}
                            </h4>
                            <button
                              onClick={() => router.push("/Employee-Portal/components/Calender")}

                              className="btn btn-sm btn-orange py-2 fs-8 px-3"
                            >
                              View Calendar
                            </button>
                          </div>

                          {nextAppointments.map((appt, index) => (
                            <div key={index} className="appointment-item">
                              <div className="appointment-info">
                                <figure className="m-0">
                                  <div
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
                                      appt.name
                                    )}
                                  </div>
                                </figure>
                                <div className="appointment-text">
                                  <h6>{appt.name}</h6>
                                  <small>{appt.service}</small>
                                </div>
                              </div>

                              <div className="appointment-time d-flex align-items-center gap-3">
                                <span>
                                  <i className="bi bi-clock me-1"></i>
                                  {appt.timeRange}
                                </span>
                                {/* <span
              className={`badge-status ${
                appt.status === "cancelled"
                  ? "badge-cancel"
                  : appt.status === "reschedule"
                  ? "badge-reschedule"
                  : appt.status === "notPaid"
                  ? "badge-warning"
                  : "badge-confirmed"
              }`}
            >
              {appt.status === "notPaid"
                ? "Pending Payment"
                : appt.status?.charAt(0).toUpperCase() + appt.status?.slice(1)}
            </span> */}

                                <span
                                  className={`badge-status ${appt.status === "cancelled"
                                    ? "badge-cancel"
                                    : appt.status === "reschedule"
                                      ? "badge-reschedule"
                                      : "badge-confirmed"
                                    }`}
                                >
                                  {appt.status || "Confirmed"}
                                </span>

                              </div>
                            </div>
                          ))}
                        </>
                      ) : (
                        <p className="text-muted text-center mb-0">No upcoming appointments</p>
                      )}
                    </div>

                  </div>


                  <div className="col-xl-6 px-xl-2">
                    <h3 className="fs-7 fw-semibold mb-3">Services Provided</h3>
                    <div className="grayCard">
                      {services && services.length > 0 ? (
                        <div className="serviceTableContainer p-3">
                          <table className="customServiceTable w-100">
                            <thead>
                              <tr>
                                <th className="text-start">Service Name</th>
                                <th className="text-center">Duration (min)</th>
                                <th className="text-center">Price ($)</th>
                                {/* <th className="text-start">Description</th> */}
                              </tr>
                            </thead>
                            <tbody>
                              {services.map((service, index) => (
                                <tr key={index}>
                                  <td className="text-start fw-semibold">{service.serviceName}</td>
                                  <td className="text-center">{service.duration}</td>
                                  <td className="text-center">{service.price}</td>
                                  {/* <td className="text-start text-muted">{service.description}</td> */}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-muted text-center py-3 mb-0">No services found</p>
                      )}
                    </div>

                  </div>
                </div>


                <div className="mt-4">
                  <h3 className="fs-7 fw-semibold mb-3">Add Personal Task</h3>
                  <div className="grayCard">
                    <div className="row">
                      {/* Left Calendar */}
                      <div className="col-xl-5 mb-4 mb-xl-0">
                        <div className="calendarDiv">
                          <div id="datePicker"></div>
                        </div>
                      </div>

                      {/* Right Time Slot Section */}
                      <div className="col-xl-7">
                        {/* <div className="mb-3">
          <label className="d-flex fs-8 gap-2 align-items-center">
            If you would like to apply this shift for the entire month
            <input
              className="d-inline-block"
              type="checkbox"
              checked={applyToMonth}
              onChange={(e) => setApplyToMonth(e.target.checked)}
            />
          </label>
        </div> */}


                        {/* 🌞 Morning */}
                        <div className="mb-3">
                          <div className="shift-title">
                            <img src="/images/landingpage/morning-icon.svg" width="17" />
                            Morning
                          </div>
                          <div className="time-slots">
                            {morningSlots.length === 0 ? <p>No morning slots</p> : (
                              morningSlots.map(t => (
                                <label
                                  key={t}
                                  className={`slot-toggle ${selectedTimes.includes(t) ? "slot-selected" : ""}`}
                                >

                                  {t}
                                  <label className="switch">
                                    <input
                                      type="checkbox"
                                      checked={selectedTimes.includes(t)}
                                      onChange={() => handleToggleTime(t)}
                                    />
                                    <span className="slider"></span>
                                  </label>
                                </label>
                              ))
                            )}
                          </div>
                        </div>

                        {/* 🌞 Afternoon */}
                        <div className="mb-3">
                          <div className="shift-title">
                            <img src="/images/landingpage/afternoon-icon.svg" width="17" />
                            Afternoon
                          </div>
                          <div className="time-slots">
                            {afternoonSlots.length === 0 ? <p>No afternoon slots</p> : (
                              afternoonSlots.map(t => (
                                <label
                                  key={t}
                                  className={`slot-toggle ${selectedTimes.includes(t) ? "slot-selected" : ""}`}
                                >

                                  {t}
                                  <label className="switch">
                                    <input
                                      type="checkbox"
                                      checked={selectedTimes.includes(t)}
                                      onChange={() => handleToggleTime(t)}
                                    />
                                    <span className="slider"></span>
                                  </label>
                                </label>
                              ))
                            )}
                          </div>
                        </div>

                        {/* 🌙 Evening */}
                        <div className="mb-3">
                          <div className="shift-title">
                            <img src="/images/landingpage/evening-icon.svg" width="17" />
                            Evening
                          </div>
                          <div className="time-slots">
                            {eveningSlots.length === 0 ? <p>No evening slots</p> : (
                              eveningSlots.map(t => (
                                <label
                                  key={t}
                                  className={`slot-toggle ${selectedTimes.includes(t) ? "slot-selected" : ""}`}
                                >

                                  {t}
                                  <label className="switch">
                                    <input
                                      type="checkbox"
                                      checked={selectedTimes.includes(t)}
                                      onChange={() => handleToggleTime(t)}
                                    />
                                    <span className="slider"></span>
                                  </label>
                                </label>
                              ))
                            )}
                          </div>
                        </div>


                        {/* ✅ Save Task Button */}
                        <div className="mt-4 text-end">
                          <button className="btn btn-success px-4 py-2" onClick={handleAddTask}>
                            Save Task
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>



              </div>
            </div>
          </div>
        </div>
      </div>
      <FooterSection />
    </>
  );
}
