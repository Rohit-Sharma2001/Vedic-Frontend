'use client'
import { useEffect, useState } from 'react';
import { useRouter } from "next/navigation";
import { useLanguage } from 'context/languageContext';
import flatpickr from "flatpickr";
import FooterSection from 'app/(landingpage)/LandingPage/components/Footer/page';
import Link from 'node_modules/next/link';
import 'app/(landingpage)/LandingPage/public/css/style.css'
import { postApi } from "services/api";
import { config } from "services/config";
import { DateTime } from "luxon";
import "flatpickr/dist/flatpickr.min.css";
import moment from 'moment'
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import PaymentForm from "./payment";
import Swal from "sweetalert2";
import PractitionerHeader from '../PractionerHeader/page';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function EmployeeCalender() {
  const router = useRouter();
  const colorClasses = ["yellowColor", "blueColor", "greenColor", "purpleColor", "orangeColor"];
  // const { logout, getFileType } = useLanguage();
  const { logout } = useLanguage();

  const [calendarDate, setCalendarDate] = useState(DateTime.now().toISODate());
  const [appointments, setAppointments] = useState([]);
  const [calendarData, setCalendarData] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [appointmentDetails, setAppointmentDetails] = useState()
  const monthStart = DateTime.fromISO(calendarDate).startOf("month");
  const weekStart = monthStart.startOf("week");
  const [showFileModal, setShowFileModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState("");



  useEffect(() => {
    // Initialize Flatpickr
    const calendarInput = document.getElementById("dateCalender");
    if (calendarInput) {
      flatpickr(calendarInput, {
        dateFormat: "Y-m-d",
        defaultDate: calendarDate || DateTime.now().toISODate(),

        disableMobile: true,
        onChange: (selectedDates) => {
          const selected = selectedDates[0];
          if (selected) {
            setCalendarDate(DateTime.fromJSDate(selected).toISODate());
          }
        },
      });
    }
  }, [calendarDate]);

  useEffect(() => {
    fetchEmployeeDetails();
  }, []);


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


  const fetchEmployeeDetails = async () => {
    try {

      const employeeId = JSON.parse(localStorage.getItem("user") || JSON.stringify({}));;
      const endpoint = config.viewEmployeeByUserId;
      const data = {
        userId: employeeId?._id
      }

      const response = await postApi(endpoint, data);

      if (response.statusCode === 201 || response.statusCode === 200) {
        // console.log("Employee Response:",response.data?.employee)
        setEmployee(response.data?.employee);
      }
    } catch (error) {
      console.error("Error fetching employee:", error);
    }
  };
  // ✅ 1. Define the function FIRST
  const fetchAppointmentsByMonth = async (employeeId, currentDate) => {
    try {
      const startOfMonth = DateTime.fromISO(currentDate).startOf("month").toISODate();
      const endOfMonth = DateTime.fromISO(currentDate).endOf("month").toISODate();

      const res = await postApi(config.findAppointment, {
        employeeId, $or: [
          { type: { $ne: "appointment" } },
          {
            $and: [
              { type: "appointment" },
              { status: { $ne: "notPaid" } }
            ]
          }
        ]
      });

      if (res?.statusCode === 200) {
        const colorClasses = ["yellowColor", "blueColor", "greenColor", "purpleColor", "orangeColor"];

        const appts = res.data
          .filter((a) => {
            const apptDate = DateTime.fromISO(a.date).toISODate();
            return apptDate >= startOfMonth && apptDate <= endOfMonth;
          })
          .map((a) => {
            const randomColor = colorClasses[Math.floor(Math.random() * colorClasses.length)];
            // const dateOnly = appt.date.includes("T")
            //               ? appt.date.split("T")[0] // remove timezone part
            //               : appt.date;

            //             const time = appt.time.padStart(5, "0");

            //             const start = DateTime.fromFormat(
            //               `${dateOnly} ${time}`,
            //               "yyyy-MM-dd HH:mm",
            //               { zone: "America/New_York" }
            //             );

            //             const end = start.plus({ minutes: appt.duration || 30 });
            //             console.log(start.toISO(), end.toISO(), "kkkkkkkkkk")
            console.log(DateTime.fromISO(a.date).toISODate(), "DateTime.fromISO(a.date).toISODate()")
            return {
              ...a,
              id: a._id,
              title: a.service?.name || a.note || "Service",
              client: `${a.user?.name} ${a.user?.lastName || ""}` || "Client",
              start: a.time,
              end: DateTime.fromFormat(a.time, "HH:mm")
                .plus({ minutes: a.duration || 30 })
                .toFormat("HH:mm"),
              date: DateTime.fromISO(a.date, { zone: "utc" }).toISODate(),
              // date:a.date,
              status: a.status,
              type: a.type,
              note: a.note,
              color: randomColor,
            };
          });

        const grouped = appts.reduce((acc, appt) => {
          acc[appt.date] = acc[appt.date] ? [...acc[appt.date], appt] : [appt];
          return acc;
        }, {});
        const fullData = res.data
          .filter((a) => {
            const apptDate = DateTime.fromISO(a.date).toISODate();
            return apptDate >= startOfMonth && apptDate <= endOfMonth;
          })
        console.log(grouped, "kkkkkkkkkk")
        setCalendarData(grouped);
        setAppointments(appts);
      }
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
    }
  };

  // ✅ 2. Run once employee is loaded
  useEffect(() => {
    if (employee?._id) {
      fetchAppointmentsByMonth(employee._id, calendarDate);
    }
  }, [employee]);

  // ✅ 3. Re-run when user changes month/year
  useEffect(() => {
    if (employee?._id) {
      fetchAppointmentsByMonth(employee._id, calendarDate);
    }
  }, [calendarDate]);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("loggedIn") === "true";
    const role = localStorage.getItem("userRole");

    if (!isLoggedIn || role !== "practitioner") {
      router.push("/Log-in");
    }
  }, []);

  const getInitials = (name = "") => {
    const words = name.trim().split(" ");
    if (words.length === 1) return words[0][0]?.toUpperCase() || "";
    return (words[0][0] + words[1][0]).toUpperCase();
  };
  const setDateFormat = (oldDate) => {
    {/* Mon ,01 September 2025 */ }
    return DateTime.fromISO(oldDate).toFormat("ccc , dd LLLL yyyy")
    // return moment(oldDate).format("ddd , DD MMMM YYYY");
  }
  const apptCompleted = (paymentIntent) => {
    Swal.fire("Success", "Is This Appointment is Complete!", "success").then(async (result) => {
      if (result.isConfirmed) {
        const editAppointments = await postApi(config.editAppointments, { _id: paymentIntent, apptStatus: "Completed" })
        if (editAppointments.statusCode === 201 || editAppointments.statusCode === 200) {
          setAppointmentDetails({ ...appointmentDetails, apptStatus: "Completed" })
        }
      }
    })
  }

  const takePayment = async (paymentIntent) => {
    try {
      const endpoint = config.takePayment;
      const data = {
        appointmentId: paymentIntent
      }

      const response = await postApi(endpoint, data);

      if (response.statusCode === 201 || response.statusCode === 200) {
        if (response.paymentUrl) {
          window.open(response.paymentUrl)
        } else {
          Swal.fire("Success", "Payment received successfully through the saved hold card!", "success").then((result) => {
            if (result.isConfirmed) {
              fetchAppointmentsByMonth(employee._id, calendarDate);
              const modal = bootstrap.Modal.getInstance(document.getElementById("viewDetails"));
              modal.hide();
            }
          });
        }

        // alert('Payment Done')
      } else {
        // alert(response.message||response.error)
      }
      // }
      // }
      // ;
    } catch (error) {
      console.error("Error fetching employee:", error);
    }
  }

  const getFileType = (url) => {
    const extension = url.split('.').pop().toLowerCase();

    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
      return 'image';
    }

    if (['mp4', 'mov', 'avi'].includes(extension)) {
      return 'video';
    }

    if (extension === 'pdf') {
      return 'pdf';
    }

    if (['doc', 'docx'].includes(extension)) {
      return 'word';
    }

    if (['xls', 'xlsx'].includes(extension)) {
      return 'excel';
    }

    if (['ppt', 'pptx'].includes(extension)) {
      return 'ppt';
    }

    if (extension === 'txt') {
      return 'text';
    }

    return 'other';
  };
  // }
  return (
    <>
      <div className="fixed-header"
        style={{
          "position": "fixed",
          "top": 0,
          "left": 0,
          "width": "100%",
          "z-index": "1050",
          "background": "#fff",
          "box-shadow": "0 2px 10px rgba(0,0,0,0.08)"
        }}>
        <PractitionerHeader />
      </div>

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
                  <li><Link href={`/Employee-Portal/components/Dashboard`}>
                    <figure> <img src="/images/landingpage/my-profile-icon.svg" alt="" width="20" /></figure> Dashboard
                  </Link></li>
                  <li><Link href={`/Employee-Portal/components/Calender`} className="active">
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
            <div className="col-md-12 col-lg-9 ps-md-2 mb-3 mt-8">
              <div className="border p-2 p-md-3 rounded-2">
                <div className="headerCalender mb-3">
                  <div className="d-flex align-items-center gap-3 ">
                    <div className="d-flex align-items-center gap-2 ">
                      <a
                        onClick={() =>
                          setCalendarDate((prev) =>
                            DateTime.fromISO(prev).minus({ months: 1 }).toISODate()
                          )
                        }
                        style={{ cursor: "pointer" }}
                      >
                        <img src="../images/landingpage/prew-class-icon.svg" alt="" width="30" />
                      </a>

                      <a
                        onClick={() =>
                          setCalendarDate((prev) =>
                            DateTime.fromISO(prev).plus({ months: 1 }).toISODate()
                          )
                        }
                        style={{ cursor: "pointer" }}
                      >
                        <img src="../images/landingpage/next-class-icon.svg" alt="" width="30" />
                      </a>

                    </div>
                    <input
                      type="text"
                      className="calenderDte"
                      id="dateCalender"
                      value={calendarDate}
                      readOnly
                    />

                  </div>
                  {/* <div className="dropdown dropCalendr">
                                <button className="" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                    Month
                                </button>
                                <ul className="dropdown-menu">
                                    <li><a className="dropdown-item" href="#">Month</a></li>
                                    <li><a className="dropdown-item" href="#">Week</a></li>
                                </ul>
                            </div> */}
                </div>
                <div className="table-responsive calenderTbl">
                  <table className="table m-0">
                    <thead>
                      <tr>
                        <th><b><strong>Mon</strong></b></th>
                        <th><b><strong>Tue</strong></b></th>
                        <th><b><strong>Wed</strong></b></th>
                        <th><b><strong>Thu</strong></b></th>
                        <th><b><strong>Fri</strong></b></th>
                        <th><b><strong>Sat</strong></b></th>
                        <th><b><strong>Sun</strong></b> </th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from({ length: 5 }).map((_, weekIndex) => (
                        <tr key={weekIndex}>
                          {Array.from({ length: 7 }).map((_, dayIndex) => {
                            const currentDate = weekStart
                              .plus({ days: weekIndex * 7 + dayIndex })
                              .toISODate();

                            const dayAppointments = calendarData[currentDate] || [];

                            return (
                              <td key={dayIndex} className="brdrtop">
                                <strong>
                                  {DateTime.fromISO(currentDate).toFormat("dd")}
                                </strong>

                                <div className="shiftGroup">
                                  {dayAppointments.slice(0, 2).map((appt, i) => (
                                    <a
                                      key={i}
                                      href="#viewDetails"
                                      data-bs-toggle="modal"
                                      className={`shiftBox ${appt.color} mt-2`}
                                      onClick={() => setAppointmentDetails(appt)}
                                    >
                                      <span>{appt.title}</span>
                                      <p>{appt.start} - {appt.end}</p>
                                    </a>
                                  ))}

                                  {dayAppointments.length > 2 && (
                                    <a
                                      href="#scheduledMdlView"
                                      data-bs-toggle="modal"
                                      onClick={() => setSelectedDate(currentDate)}
                                      className="viewallBtn"
                                    >
                                      View All
                                    </a>
                                  )}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>


                  </table>
                </div>
                <div className="table-responsive calenderTbl weekwiseTbl d-none">
                  <table className="table m-0">
                    <thead>
                      <tr>
                        <th></th>
                        <th> <b><strong>Sunday</strong>25 </b></th>
                        <th> <b><strong>Monday</strong> 26</b></th>
                        <th> <b><strong>Tuesday</strong> 27</b></th>
                        <th> <b><strong>Wednesday</strong> 28</b></th>
                        <th> <b><strong>Thursday</strong> 29</b></th>
                        <th> <b><strong>Friday</strong> 30</b></th>
                        <th> <b><strong>Saturday</strong>31</b> </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>01 am</td>
                        <td> <a href="" className="shiftBox blueColor">
                          <span>Pranayama & Meditation</span> </a>
                        </td>
                        <td></td>
                        <td></td>
                        <td> <a href="" className="shiftBox blueColor">
                          <span>Pranayama & Meditation</span> </a>
                        </td>
                        <td></td>
                        <td></td>
                        <td></td>
                      </tr>
                      <tr>
                        <td>02 am</td>
                        <td> </td>
                        <td><a href="" className="shiftBox blueColor">
                          <span>Pranayama & Meditation</span> </a></td>
                        <td></td>
                        <td>
                        </td>
                        <td></td>
                        <td></td>
                        <td><a href="" className="shiftBox blueColor">
                          <span>Pranayama & Meditation</span> </a></td>
                      </tr>
                      <tr>
                        <td>03 am</td>
                        <td> </td>
                        <td></td>
                        <td></td>
                        <td> <a href="" className="shiftBox blueColor">
                          <span>Pranayama & Meditation</span> </a>
                        </td>
                        <td></td>
                        <td></td>
                        <td></td>
                      </tr>
                      <tr>
                        <td>04 am</td>
                        <td> </td>
                        <td><a href="" className="shiftBox blueColor">
                          <span>Pranayama & Meditation</span> </a></td>
                        <td></td>
                        <td>
                        </td>
                        <td><a href="" className="shiftBox blueColor">
                          <span>Pranayama & Meditation</span> </a></td>
                        <td></td>
                        <td><a href="" className="shiftBox blueColor">
                          <span>Pranayama & Meditation</span> </a></td>
                      </tr>
                      <tr>
                        <td>05 am</td>
                        <td> <a href="" className="shiftBox blueColor">
                          <span>Pranayama & Meditation</span> </a>
                        </td>
                        <td></td>
                        <td></td>
                        <td> <a href="" className="shiftBox blueColor">
                          <span>Pranayama & Meditation</span> </a>
                        </td>
                        <td></td>
                        <td></td>
                        <td></td>
                      </tr>
                      <tr>
                        <td>06 am</td>
                        <td> </td>
                        <td><a href="" className="shiftBox blueColor">
                          <span>Pranayama & Meditation</span> </a></td>
                        <td></td>
                        <td>
                        </td>
                        <td></td>
                        <td></td>
                        <td><a href="" className="shiftBox blueColor">
                          <span>Pranayama & Meditation</span> </a></td>
                      </tr>
                      <tr>
                        <td>07 am</td>
                        <td> </td>
                        <td></td>
                        <td></td>
                        <td> <a href="" className="shiftBox blueColor">
                          <span>Pranayama & Meditation</span> </a>
                        </td>
                        <td></td>
                        <td></td>
                        <td></td>
                      </tr>
                      <tr>
                        <td>08 am</td>
                        <td> </td>
                        <td><a href="" className="shiftBox blueColor">
                          <span>Pranayama & Meditation</span> </a></td>
                        <td></td>
                        <td>
                        </td>
                        <td></td>
                        <td></td>
                        <td><a href="" className="shiftBox blueColor">
                          <span>Pranayama & Meditation</span> </a></td>
                      </tr>
                      <tr>
                        <td>09 am</td>
                        <td> </td>
                        <td></td>
                        <td></td>
                        <td>
                        </td>
                        <td><a href="" className="shiftBox blueColor">
                          <span>Pranayama & Meditation</span> </a></td>
                        <td></td>
                        <td><a href="" className="shiftBox blueColor">
                          <span>Pranayama & Meditation</span> </a></td>
                      </tr>
                      <tr>
                        <td>10 am</td>
                        <td><a href="" className="shiftBox blueColor">
                          <span>Pranayama & Meditation</span> </a>
                        </td>
                        <td></td>
                        <td></td>
                        <td> <a href="" className="shiftBox blueColor">
                          <span>Pranayama & Meditation</span> </a>
                        </td>
                        <td></td>
                        <td></td>
                        <td></td>
                      </tr>
                      <tr>
                        <td>11 am</td>
                        <td> </td>
                        <td><a href="" className="shiftBox blueColor">
                          <span>Pranayama & Meditation</span> </a></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td><a href="" className="shiftBox blueColor">
                          <span>Pranayama & Meditation</span> </a></td>
                      </tr>
                      <tr>
                        <td>12 pm</td>
                        <td> <a href="" className="shiftBox blueColor">
                          <span>Pranayama & Meditation</span> </a>
                        </td>
                        <td></td>
                        <td></td>
                        <td> <a href="" className="shiftBox blueColor">
                          <span>Pranayama & Meditation</span> </a>
                        </td>
                        <td></td>
                        <td></td>
                        <td></td>
                      </tr>
                      <tr>
                        <td>01 pm</td>
                        <td> <a href="" className="shiftBox blueColor">
                          <span>Pranayama & Meditation</span> </a>
                        </td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                      </tr>
                      <tr>
                        <td>02 pm</td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td><a href="" className="shiftBox blueColor">
                          <span>Pranayama & Meditation</span> </a></td>
                      </tr>
                      <tr>
                        <td>03 pm</td>
                        <td> </td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                      </tr>
                      <tr>
                        <td>04 pm</td>
                        <td> </td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                      </tr>
                      <tr>
                        <td>05 pm</td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                      </tr>
                      <tr>
                        <td>06 pm</td>
                        <td> </td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                      </tr>
                      <tr>
                        <td>07 pm</td>
                        <td> </td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                      </tr>
                      <tr>
                        <td>08 pm</td>
                        <td> </td>
                        <td></td>
                        <td></td>
                        <td>
                        </td>
                        <td></td>
                        <td></td>
                        <td></td>
                      </tr>
                      <tr>
                        <td>09 pm</td>
                        <td> </td>
                        <td></td>
                        <td></td>
                        <td>
                        </td>
                        <td></td>
                        <td></td>
                        <td></td>
                      </tr>
                      <tr>
                        <td>10 pm</td>
                        <td>
                        </td>
                        <td></td>
                        <td></td>
                        <td>
                        </td>
                        <td></td>
                        <td></td>
                        <td></td>
                      </tr>
                      <tr>
                        <td>11 pm</td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="modal fade cancelModal" id="scheduledMdlView">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0" style={{ minWidth: '600px' }}>
            <div className="modal-header border-0">
              <h1 className="modal-title fs-6">
                {setDateFormat(selectedDate)}
                {/* Mon ,01 September 2025 */}
              </h1>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">

              {(calendarData[selectedDate] || []).map((appt) => (
                <div key={appt.id} className="appointment-item" href="#viewDetails"
                  data-bs-toggle="modal" onClick={() => setAppointmentDetails(appt)}>
                  <div className="appointment-info">
                    {/* <img src="/images/landingpage/default-avatar.jpg" alt={appt.client} /> */}
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
                          appt.client
                        )}
                      </div>
                    </figure>
                    <div className="appointment-text">
                      <h6>{appt.client}</h6>
                      <small>{appt.title}</small>
                    </div>
                  </div>
                  <div className="appointment-time d-flex align-items-center gap-3">
                    <span>
                      <i className="bi bi-clock me-1"></i>
                      {appt.start} - {appt.end}
                    </span>
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
            </div>


          </div>
        </div>
      </div>


      <div className="modal fade cancelModal" id="viewDetails" >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0" style={{ minWidth: '600px' }}>
            <div className="modal-header border-0">
              <h1 className="modal-title fs-6">
                {appointmentDetails?.date ? setDateFormat(appointmentDetails?.date) : ""}{` , (${appointmentDetails?.title || ''})`}
                {/* Mon ,01 September 2025 */}
              </h1>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body" style={{
              display: 'grid',
              gap: '8px',
              // padding: '10px 0'
            }}>


              <div className="detail-row" style={{
                display: 'flex',
                color: '#333',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span className="label" style={{
                  fontWeight: 600,
                  color: '#555',
                  width: '130px'
                }}>Service:</span>
                <span className="value" style={{
                  flex: 1,
                  color: '#000',
                  textAlign: 'right',
                  wordBreak: 'break-word'
                }}>{appointmentDetails?.type == 'appointment' ? appointmentDetails?.title : appointmentDetails?.type || ''}</span>
              </div>
              <div className="detail-row" style={{
                display: 'flex',
                color: '#333',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span className="label" style={{
                  fontWeight: 600,
                  color: '#555',
                  width: '130px'
                }}>Client Name:</span>
                <span className="value" style={{
                  flex: 1,
                  color: '#000',
                  textAlign: 'right',
                  wordBreak: 'break-word'
                }}>{appointmentDetails?.client}</span>
              </div>
              <div className="detail-row" style={{
                display: 'flex',
                color: '#333',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span className="label" style={{
                  fontWeight: 600,
                  color: '#555',
                  width: '130px'
                }}>Start Time:</span>
                <span className="value" style={{
                  flex: 1,
                  color: '#000',
                  textAlign: 'right',
                  wordBreak: 'break-word'
                }}>{appointmentDetails?.start}</span>
              </div>
              <div className="detail-row" style={{
                display: 'flex',
                color: '#333',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span className="label" style={{
                  fontWeight: 600,
                  color: '#555',
                  width: '130px'
                }}>End Time:</span>
                <span className="value" style={{
                  flex: 1,
                  color: '#000',
                  textAlign: 'right',
                  wordBreak: 'break-word'
                }}>{appointmentDetails?.end}</span>
              </div>
              <div className="detail-row" style={{
                display: 'flex',
                color: '#333',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span className="label" style={{
                  fontWeight: 600,
                  color: '#555',
                  width: '130px'
                }}>Book For:</span>
                <span className="value" style={{
                  flex: 1,
                  color: '#000',
                  textAlign: 'right',
                  wordBreak: 'break-word'
                }}>{appointmentDetails?.userfamily ? appointmentDetails.userfamily.relation : "Self"}</span>
              </div>
              {appointmentDetails?.userfamily && (
                <div className="detail-row" style={{
                  display: 'flex',
                  color: '#333',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span className="label" style={{
                    fontWeight: 600,
                    color: '#555',
                    width: '130px'
                  }}>Family Member:</span>
                  <span className="value" style={{
                    flex: 1,
                    color: '#000',
                    textAlign: 'right',
                    wordBreak: 'break-word'
                  }}>
                    {appointmentDetails.userfamily.firstName} {appointmentDetails.userfamily.lastName}
                  </span>
                </div>
              )}
              <div className="detail-row" style={{
                display: 'flex',
                color: '#333',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span className="label" style={{
                  fontWeight: 600,
                  color: '#555',
                  width: '130px'
                }}>Payment Status:</span>
                <span className="value" style={{
                  flex: 1,
                  color: '#000',
                  textAlign: 'right',
                  wordBreak: 'break-word'
                }}>{appointmentDetails?.status}</span>
              </div>
              <div className="detail-row" style={{
                display: 'flex',
                color: '#333',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span className="label" style={{
                  fontWeight: 600,
                  color: '#555',
                  width: '130px'
                }}>Appt. Status:</span>
                <span className="value" style={{
                  flex: 1,
                  color: '#000',
                  textAlign: 'right',
                  wordBreak: 'break-word'
                }}>{appointmentDetails?.apptStatus}</span>
              </div>
              <div className="detail-row" style={{
                display: 'flex',
                color: '#333',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span className="label" style={{
                  fontWeight: 600,
                  color: '#555',
                  width: '130px'
                }}>Note:</span>
                <span className="value" style={{
                  flex: 1,
                  color: '#000',
                  textAlign: 'right',
                  wordBreak: 'break-word'
                }}>{appointmentDetails?.note}</span>
              </div>
              {appointmentDetails?.file && (
                <div
                  className="detail-row"
                  style={{
                    display: 'flex',
                    color: '#333',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <span
                    className="label"
                    style={{
                      fontWeight: 600,
                      color: '#555',
                      width: '130px'
                    }}
                  >
                    File:
                  </span>

                  <span
                    className="value"
                    style={{
                      flex: 1,
                      color: '#000',
                      textAlign: 'right',
                      wordBreak: 'break-word'
                    }}
                  >

                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => {

                        const fileUrl =
                          `${process.env.NEXT_PUBLIC_API_URL}/${appointmentDetails?.file.replace(/\\/g, '/')}`;

                        setSelectedFile(fileUrl);

                        const modal = new bootstrap.Modal(
                          document.getElementById("filePreviewModal")
                        );

                        modal.show();
                      }}
                    >
                      View {getFileType(appointmentDetails?.file)}
                    </button>

                  </span>
                </div>
              )}

              {/* <Elements stripe={stripePromise}>
                <PaymentForm paymentIntent={appointmentDetails?.paymentIntent} />
              </Elements> */}
              {appointmentDetails?.apptStatus == 'Visit Pending' && <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                <button className="btn btn-primary w-50" onClick={() => apptCompleted(appointmentDetails?._id)}>Mark As Completed</button></div>}

              {appointmentDetails?.status == 'unpaid' && appointmentDetails?.apptStatus !== 'Visit Pending' && <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                <button className="btn btn-primary w-50" onClick={() => takePayment(appointmentDetails?._id)}>Proceed To Payment</button></div>}
            </div>


          </div>
        </div>
      </div>

      <div className="modal fade" id="filePreviewModal" tabIndex="-1" aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered "

          style={{
            maxWidth: '80vw',
            width: '80vw'
          }}>
          <div className="modal-content">

            <div className="modal-header">
              <h5 className="modal-title">File Preview</h5>

              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
              ></button>
            </div>

            <div className="modal-body text-center">

              {/* IMAGE */}
              {selectedFile && getFileType(selectedFile) === "image" && (
                <img
                  src={selectedFile}
                  alt="preview"
                  className="img-fluid rounded"
                />
              )}

              {/* VIDEO */}
              {selectedFile && getFileType(selectedFile) === "video" && (
                <video width="100%" controls>
                  <source src={selectedFile} />
                </video>
              )}

              {/* PDF */}
              {selectedFile && getFileType(selectedFile) === "pdf" && (
                <iframe
                  src={selectedFile}
                  width="100%"
                  height="600px"
                  title="PDF Preview"
                />
              )}

              {/* WORD / EXCEL / PPT */}
              {selectedFile &&
                ["word", "excel", "ppt"].includes(
                  getFileType(selectedFile)
                ) && (
                  <iframe
                    src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(selectedFile)}`}
                    width="100%"
                    height="600px"
                    title="Office Preview"
                  />
                )}

              {/* TEXT */}
              {selectedFile && getFileType(selectedFile) === "text" && (
                <iframe
                  src={selectedFile}
                  width="100%"
                  height="600px"
                  title="Text Preview"
                />
              )}

              {/* OTHER */}
              {selectedFile &&
                getFileType(selectedFile) === "other" && (
                  <a
                    href={selectedFile}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-primary"
                  >
                    Download File
                  </a>
                )}

            </div>
          </div>
        </div>
      </div>

      <FooterSection />
    </>
  );
}
