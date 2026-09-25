"use client";
import { useState, useEffect, useMemo } from 'react';
import { Pagination } from 'react-bootstrap';
import Header from "app/(landingpage)/LandingPage/components/Header/page";
import FooterSection from "app/(landingpage)/LandingPage/components/Footer/page";
import "app/(landingpage)/LandingPage/public/css/style.css";
import { postApi } from 'services/api';
import { config } from 'services/config';
import Link from 'node_modules/next/link';

const PAGE_SIZE = 10;

// ── Static arrays — identical on server AND client ────────────────────────────
const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEKDAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const EventsPage = () => {
  const [allEvents, setAllEvents] = useState([]);
  const [itemTypeList, setItemTypeList] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming');

  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showAllDates, setShowAllDates] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => { fetchItemTypes(); fetchEvents(); }, []);
  useEffect(() => { setCurrentPage(1); }, [activeTab, selectedMonth, selectedYear, selectedDate]);

  const toLocalDateOnly = (d) => {
    const date = new Date(d);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  };

  const todayOnly = toLocalDateOnly(new Date());

  // Locale-safe: DD/MM/YYYY
  const formatDate = (d) => {
    const date = new Date(d);
    return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
  };

  const stripHtmlToText = (html = "") => {
    if (!html) return "";
    return html
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
      .replace(/<\/?[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<").replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
      .replace(/\s+/g, " ").trim();
  };

  const getDescriptionPreview = (html, n = 50) => {
    const words = stripHtmlToText(html).trim().split(/\s+/).filter(Boolean);
    return words.length <= n ? words.join(" ") : `${words.slice(0, n).join(" ")}...`;
  };

  const sortByCreatedDesc = (a, b) =>
    new Date(b?.date_created || b?.createdAt || 0).getTime() -
    new Date(a?.date_created || a?.createdAt || 0).getTime();

  const fetchEvents = async () => {
    try {
      const response = await postApi(config.Allevents, { page: 1, pageSize: 9999 });
      const active = (response.events || [])
        .filter((e) => Number(e.status) === 1)
        .filter((e) => e.date && toLocalDateOnly(e.date) >= todayOnly)
        .sort(sortByCreatedDesc);
      setAllEvents(active);
    } catch (err) { console.error("Error fetching events:", err); }
  };

  const fetchItemTypes = async () => {
    try {
      const response = await postApi(config.category, { dropdown_type: "event_banner", page: 1, pageSize: 50 });
      setItemTypeList(response.result || []);
      const url = `${process.env.NEXT_PUBLIC_API_URL}/${response.result[0]?.file}`.replace(/\\/g, '/');
      setImagePreview(url);
    } catch (err) { console.error('Error fetching banner:', err); }
  };

  // Uses MONTH_SHORT — no toLocaleString
  const months = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 12 }, (_, i) => {
      const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
      return {
        month: d.getMonth(),
        year: d.getFullYear(),
        short: MONTH_SHORT[d.getMonth()],
      };
    });
  }, []);

  const upcomingEvents = useMemo(() =>
    [...allEvents].sort((a, b) => new Date(a.date) - new Date(b.date)),
    [allEvents]
  );

  const filteredEvents = useMemo(() => {
    const base = activeTab === 'upcoming' ? upcomingEvents : allEvents;
    return base.filter((event) => {
      if (!event.date) return false;
      const d = new Date(event.date);
      // if (d.getMonth() !== selectedMonth || d.getFullYear() !== selectedYear) return false;
      if (selectedMonth !== null && selectedYear !== null && (d.getMonth() !== selectedMonth || d.getFullYear() !== selectedYear)
      ) {
        return false;
      }
      if (selectedDate && d.getDate() !== selectedDate) return false;
      return true;
    });
  }, [activeTab, allEvents, upcomingEvents, selectedMonth, selectedYear, selectedDate]);

  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / PAGE_SIZE));

  const pageEvents = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredEvents.slice(start, start + PAGE_SIZE);
  }, [filteredEvents, currentPage]);

  const arrayheader = [
    { name: "Home", route: "/" },
    { name: "Book Online", route: "/Appointment/components/BookAppointment" },
    { name: "Order", route: "/profile?tab=orders" },
    { name: "Yoga", route: "/YogaClasses/components/JoinYogaClasses" },
    { name: "Event", route: "/Events" },
    {
      name: "Resources", route: "/LandingPage/components/Quiz",
      children: [
        { name: "Dosha Quiz", route: "/LandingPage/components/Quiz" },
        { name: "Health Articles", route: "/LandingPage/components/BookArticles" },
        { name: "Gallery", route: "/LandingPage/components/Gallery" },
      ],
    },
  ];
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

  const EventCard = ({ event }) => (
    <div className="eventcontent mb-3">
      <Link href={`/Events/Event-Details/${event?._id}`}>
        <figure className="mx-auto">
          <img
            src={`${process.env.NEXT_PUBLIC_API_URL}/${event.icon_file}`.replace(/\\/g, '/')}
            alt={event.eventname}
          />
        </figure>
      </Link>
      <div className="eventtxt">
        <h3>{event.eventname}</h3>
        <p>{getDescriptionPreview(event.description, 50)}</p>
        <p className="d-flex gap-3 m-0 p-0">
          {console.log(event.date,",m,")}
          <span> <b>Date: - </b> {event.date ? new Date(event.date).toLocaleDateString("en-US") : "Date TBD"} </span>
          <span> <b>Time: - </b> {event?.time ? convertTo12HourFormat(event?.time) : "N/A"} </span>
        </p>
        {activeTab === 'upcoming' && !event.isFullyBooked && (
          <p style={{ color: "green", fontWeight: "600", marginTop: "6px" }}>
            {event.availableTickets} Tickets Available
          </p>
        )}
        {event.isFullyBooked ? (
          <>
            <button className="btn btn-secondary disabled mt-0" disabled>Fully Booked</button>
            <p style={{ color: "red", marginTop: "8px", fontWeight: "bold" }}>No tickets available</p>
          </>
        ) : (
          <Link href={`/Events/Event-Details/${event?._id}`} className="btn btn-primary mt-0">
            {event.is_rsvp ? "RSVP" : "Join Event"}
          </Link>
        )}
      </div>
    </div>
  );

  return (
    <>
      <Header arrayheader={arrayheader} />
      <div className="innerBanner" style={{ backgroundImage: `url(${imagePreview})` }}>
        <div className="container-fluid">
          <div className="innerBannertxt">
            <h1>{itemTypeList[0]?.name || 'Upcoming Events'}</h1>
            <p>{itemTypeList[0]?.description || 'Lorem Ipsum Simply dummy text here'}</p>
          </div>
        </div>
      </div>

      <div className="programSection mt-4">
        <div className="container-fluid">

          <div className="breadcrumbGroup my-4 mb-md-4">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <Link href="/Appointment/components/BookAppointment">Booking Page</Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">Events</li>
            </ol>
          </div>

          {/* Tabs */}
          <ul className="nav nav-tabs ordersTabs mb-3">
            {[
              { id: 'upcoming', label: 'Upcoming Events' },
              { id: 'all', label: 'All Events' },
            ].map(({ id, label }) => (
              <li className="nav-item" key={id}>
                <button
                  className={`nav-link${activeTab === id ? ' active' : ''}`}
                  onClick={() => setActiveTab(id)}
                  type="button"
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>


          {/* Month pills */}
          <div
            style={{
              display: "flex",
              gap: "8px",
              overflowX: "auto",
              paddingBottom: "6px",
              marginBottom: "14px",
              scrollbarWidth: "none",
            }}
          >
            <button
              onClick={() => {
                setSelectedMonth(null);
                setSelectedYear(null);
                setSelectedDate(null);
              }}
              style={{
                flexShrink: 0,
                padding: "6px 18px",
                borderRadius: "20px",
                border:
                  selectedMonth === null && selectedYear === null
                    ? "2px solid #7d5a50"
                    : "1.5px solid #ddd",
                background:
                  selectedMonth === null && selectedYear === null
                    ? "#7d5a50"
                    : "#fff",
                color:
                  selectedMonth === null && selectedYear === null
                    ? "#fff"
                    : "#555",
                fontSize: "13px",
                fontWeight:
                  selectedMonth === null && selectedYear === null
                    ? "600"
                    : "400",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              All
            </button>

            {months.map((m) => {
              const isActive =
                m.month === selectedMonth &&
                m.year === selectedYear;

              return (
                <button
                  key={`${m.month}-${m.year}`}
                  onClick={() => {
                    setSelectedMonth(m.month);
                    setSelectedYear(m.year);
                    setSelectedDate(null);
                  }}
                  style={{
                    flexShrink: 0,
                    padding: "6px 18px",
                    borderRadius: "20px",
                    border: isActive
                      ? "2px solid #7d5a50"
                      : "1.5px solid #ddd",
                    background: isActive ? "#7d5a50" : "#fff",
                    color: isActive ? "#fff" : "#555",
                    fontSize: "13px",
                    fontWeight: isActive ? "600" : "400",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  {m.short} {m.year}
                </button>
              );
            })}
          </div>

          {/* Date pills */}
          {selectedMonth !== null &&
 selectedYear !== null &&
 (() => {
            const today = new Date();
            const isCurrentMonth = selectedMonth === today.getMonth() && selectedYear === today.getFullYear();
            const startDay = isCurrentMonth ? today.getDate() : 1;
            const totalDays = new Date(selectedYear, selectedMonth + 1, 0).getDate();

            const allDatePills = Array.from({ length: totalDays - startDay + 1 }, (_, i) => {
              const d = new Date(selectedYear, selectedMonth, startDay + i);
              return {
                day: d.getDate(),
                weekday: WEEKDAY_SHORT[d.getDay()],   // ← static, no toLocaleString
                dateStr: toLocalDateOnly(d),
              };
            });

            const visiblePills = showAllDates ? allDatePills : allDatePills.slice(0, 15);
            const hasMore = allDatePills.length > 15;

            return (
              <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "8px", marginBottom: "20px", scrollbarWidth: "none", flexWrap: showAllDates ? "wrap" : "nowrap" }}>

                {/* All pill */}
                <button
                  onClick={() => setSelectedDate(null)}
                  style={{
                    flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    width: "58px", padding: "8px 6px", borderRadius: "12px",
                    border: selectedDate === null ? "2px solid #7d5a50" : "1.5px solid #ddd",
                    background: selectedDate === null ? "#7d5a50" : "#fff",
                    color: selectedDate === null ? "#fff" : "#555",
                    fontSize: "12px", fontWeight: "600", cursor: "pointer", transition: "all 0.2s",
                  }}
                >
                  <span style={{ fontSize: "18px", lineHeight: 1 }}>☰</span>
                  <span style={{ marginTop: "4px" }}>All</span>
                </button>

                {visiblePills.map(({ day, weekday, dateStr }) => {
                  const isActive = selectedDate === day;
                  const isToday = dateStr === todayOnly;
                  return (
                    <button
                      key={dateStr}
                      onClick={() => setSelectedDate(isActive ? null : day)}
                      style={{
                        flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                        width: "58px", padding: "8px 6px", borderRadius: "12px",
                        border: isActive ? "2px solid #7d5a50" : isToday ? "1.5px solid #c4a090" : "1.5px solid #eee",
                        background: isActive ? "#7d5a50" : isToday ? "#fdf5f2" : "#fff",
                        color: isActive ? "#fff" : isToday ? "#7d5a50" : "#444",
                        cursor: "pointer", transition: "all 0.2s",
                      }}
                    >
                      <span style={{ fontSize: "11px", fontWeight: "500", opacity: isActive ? 0.85 : 0.7, textTransform: "uppercase" }}>
                        {weekday}
                      </span>
                      <span style={{ fontSize: "18px", fontWeight: "700", lineHeight: 1.3 }}>
                        {day}
                      </span>
                      {isToday && (
                        <span style={{ fontSize: "9px", fontWeight: "600", marginTop: "2px", opacity: 0.8 }}>
                          TODAY
                        </span>
                      )}
                    </button>
                  );
                })}

                {hasMore && (
                  <button
                    onClick={() => setShowAllDates((prev) => !prev)}
                    style={{
                      flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                      width: "58px", padding: "8px 6px", borderRadius: "12px",
                      border: "1.5px solid #ddd",
                      background: showAllDates ? "#f8f4f2" : "#fff",
                      color: "#7d5a50", cursor: "pointer", transition: "all 0.2s",
                    }}
                  >
                    {showAllDates ? (
                      <>
                        <span style={{ fontSize: "16px", lineHeight: 1 }}>↩</span>
                        <span style={{ fontSize: "10px", fontWeight: "600", marginTop: "4px" }}>Less</span>
                      </>
                    ) : (
                      <>
                        <span style={{ fontSize: "20px", lineHeight: 1, letterSpacing: "1px" }}>•••</span>
                        <span style={{ fontSize: "10px", fontWeight: "600", marginTop: "2px" }}>More</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            );
          })()}

          {/* Event list */}
          {pageEvents.length > 0 ? (
            pageEvents.map((event) => <EventCard key={event._id} event={event} />)
          ) : (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#aaa" }}>
              <div style={{ fontSize: "32px", marginBottom: "8px" }}>📭</div>
              <p style={{ margin: 0 }}>No events available for this date.</p>
            </div>
          )}

          {/* Pagination */}
          <Pagination className="justify-content-center mt-4">
            <Pagination.First onClick={() => setCurrentPage(1)} disabled={currentPage === 1} />
            <Pagination.Prev onClick={() => setCurrentPage((p) => p - 1)} disabled={currentPage === 1} />
            {(() => {
              const maxVisible = 10;
              const startPage = Math.floor((currentPage - 1) / maxVisible) * maxVisible + 1;
              const endPage = Math.min(startPage + maxVisible - 1, totalPages);
              return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map((n) => (
                <Pagination.Item key={n} active={n === currentPage} onClick={() => setCurrentPage(n)}>{n}</Pagination.Item>
              ));
            })()}
            <Pagination.Next onClick={() => setCurrentPage((p) => p + 1)} disabled={currentPage === totalPages} />
            <Pagination.Last onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} />
          </Pagination>
        </div>
      </div>
      <FooterSection />
    </>
  );
};

export default EventsPage;