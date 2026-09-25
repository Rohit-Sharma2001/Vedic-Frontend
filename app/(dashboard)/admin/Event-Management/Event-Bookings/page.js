"use client";
import { useEffect, useState } from "react";
import { postApi } from "services/api";
import { config } from "services/config";
import Swal from "sweetalert2";

export default function EventBookingsTable() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedBooking, setSelectedBooking] = useState(null);

 useEffect(() => {
  (async () => {
    await fetchBookings(page);
  })();
}, [page]);


  async function fetchBookings(currentPage = 1) {
    try {
      setLoading(true);
      const payload = { page: currentPage, pageSize };
      const encoded = btoa(JSON.stringify(payload));

      const response = await postApi(config.getAllEventBookings, payload);
   if (response.statusCode === 200) {
  setBookings(response.data || []);
  setTotalPages(response.pagination?.totalPages || 1); // ✅ FIXED
}
else {
        Swal.fire("Error", response.message || "Failed to fetch bookings", "error");
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      Swal.fire("Error", "Failed to load event bookings", "error");
    } finally {
      setLoading(false);
    }
  }

  const nextPage = () => page < totalPages && setPage((p) => p + 1);
  const prevPage = () => page > 1 && setPage((p) => p - 1);

  const openModal = (booking) => {
    setSelectedBooking(booking);
    const modal = new bootstrap.Modal(document.getElementById("bookingDetailModal"));
    modal.show();
  };

  if (loading) return <div className="p-4 text-center">Loading bookings...</div>;

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

  return (
    <div className="container my-5">
      <h2 className="fw-bold mb-4 text-center">Event Bookings</h2>

      <div className="table-responsive shadow-sm rounded">
        <table className="table align-middle">
          <thead className="table-light">
            <tr>
              <th>#</th>
              <th>Event</th>
              <th>User</th>
              <th>Status</th>
              <th>Amount ($)</th>
              <th>Date</th>
              <th className="text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length > 0 ? (
              bookings.map((b, i) => (
                <tr key={b._id}>
                  <td>{(page - 1) * pageSize + i + 1}</td>
                  <td className="fw-semibold">{b.event?.eventname || "—"}</td>
                  <td>{b.user?.name || "—"}</td>
                  <td>
                    <span
                      className={`badge ${
                        b.status === "paid"
                          ? "bg-success"
                          : b.status === "pending"
                          ? "bg-warning text-dark"
                          : "bg-secondary"
                      }`}
                    >
                      {b.status}
                    </span>
                  </td>
                  <td>${(b?.grandTotal||0).toFixed(2)}</td>
                  <td>{new Date(b.created_at).toLocaleDateString('en-US')}</td>
                  <td className="text-center">
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => openModal(b)}
                      title="View Details"
                    >
                      <i className="bi bi-eye"></i>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center py-4">
                  No bookings found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="d-flex justify-content-between align-items-center mt-3">
        <button
          className="btn btn-outline-secondary btn-sm"
          disabled={page === 1}
          onClick={prevPage}
        >
          ← Previous
        </button>
        <span>Page {page} of {totalPages}</span>
        <button
          className="btn btn-outline-secondary btn-sm"
          disabled={page === totalPages}
          onClick={nextPage}
        >
          Next →
        </button>
      </div>

      {/* -------- Modal for Details -------- */}
      <div className="modal fade" id="bookingDetailModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content border-0 shadow">
            <div className="modal-header bg-light">
              <h5 className="modal-title fw-semibold">Booking Details</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body">
              {selectedBooking ? (
                <>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <strong>Event Name:</strong>
                      <p className="mb-0">{selectedBooking.event?.eventname}</p>
                    </div>
                    <div className="col-md-6">
                      <strong>Ticket Number:</strong>
                      <p className="mb-0">{selectedBooking.ticketNumber || "—"}</p>
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-6">
                      <strong>User Name:</strong>
                      <p className="mb-0">{selectedBooking.user?.name}</p>
                    </div>
                    <div className="col-md-6">
                      <strong>Email:</strong>
                      <p className="mb-0">{selectedBooking.user?.email}</p>
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-4">
                      <strong>Quantity:</strong>
                      <p className="mb-0">{selectedBooking.quantity}</p>
                    </div>
                    <div className="col-md-4">
                      <strong>Amount:</strong>
                      <p className="mb-0">${(selectedBooking?.grandTotal.toFixed(2))}</p>
                    </div>
                    <div className="col-md-4">
                      <strong>Status:</strong>
                      <span
                        className={`badge ms-2 ${
                          selectedBooking.status === "paid"
                            ? "bg-success"
                            : "bg-warning text-dark"
                        }`}
                      >
                        {selectedBooking.status}
                      </span>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <strong>Event Date:</strong>
                      <p className="mb-0">
                        {new Date(selectedBooking.event?.date).toLocaleDateString('en-US')}{" "}
                        {convertTo12HourFormat(selectedBooking.event?.time)}
                      </p>
                    </div>
                    <div className="col-md-6">
                      <strong>Booking Created:</strong>
                      <p className="mb-0">
                        {new Date(selectedBooking.created_at).toLocaleString('en-US',{
  year: 'numeric',   // e.g., 2026
  month: '2-digit',  // e.g., 06
  day: '2-digit',    // e.g., 22
  hour: '2-digit',   // e.g., 05
  minute: '2-digit', // e.g., 21
  hour12: true      // Use 24-hour time
})}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <p>No booking selected.</p>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
