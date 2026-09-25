"use client";
import { useEffect, useState } from "react";
import { postApi } from "services/api";
import { config } from "services/config";
import Swal from "sweetalert2";

export default function DonationTransactionsTable() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedDonation, setSelectedDonation] = useState(null);

  useEffect(() => {
    (async () => {
      await fetchDonations(page);
    })();
  }, [page]);

  async function fetchDonations(currentPage = 1) {
    try {
      setLoading(true);
      // Don't filter by user_id to get all donations (admin view)
      const payload = { 
        page: currentPage, 
        pageSize: pageSize 
      };

      const response = await postApi(config.donationTransactions, payload);
      
      if (response?.statusCode === 200) {
        const donationData = response?.data?.donationData || [];
        setDonations(donationData);
        setTotalPages(response?.data?.totalPages || 1);
        setTotalCount(response?.data?.totalCount || 0);
      } else {
        Swal.fire("Error", response?.message || "Failed to fetch donations", "error");
      }
    } catch (error) {
      console.error("Error fetching donations:", error);
      Swal.fire("Error", "Failed to load donation transactions", "error");
    } finally {
      setLoading(false);
    }
  }

  const nextPage = () => page < totalPages && setPage((p) => p + 1);
  const prevPage = () => page > 1 && setPage((p) => p - 1);

  const openModal = (donation) => {
    setSelectedDonation(donation);
    const modal = new bootstrap.Modal(document.getElementById("donationDetailModal"));
    modal.show();
  };

  if (loading) return <div className="p-4 text-center">Loading donations...</div>;

  return (
    <div className="container my-5">
      <h2 className="fw-bold mb-4 text-center">Donation Transactions</h2>

      <div className="table-responsive shadow-sm rounded">
        <table className="table align-middle">
          <thead className="table-light">
            <tr>
              <th>#</th>
              <th>User</th>
              <th>Email</th>
              <th>Amount ($)</th>
              <th>Status</th>
              <th>Description</th>
              <th>Date</th>
              <th className="text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {donations.length > 0 ? (
              donations.map((d, i) => (
                <tr key={d._id}>
                  <td>{(page - 1) * pageSize + i + 1}</td>
                  <td className="fw-semibold">{d.user?.name || "—"}</td>
                  <td>{d.user?.email || "—"}</td>
                  <td>${d.amount?.toFixed(2) || "0.00"}</td>
                  <td>
                    <span
                      className={`badge ${
                        d.status === "paid"
                          ? "bg-success"
                          : d.status === "notPaid"
                          ? "bg-warning text-dark"
                          : "bg-secondary"
                      }`}
                    >
                      {d.status || "—"}
                    </span>
                  </td>
                  <td>{d.description || "—"}</td>
                  <td>
                    {d.date 
                      ? new Date(d.date).toLocaleDateString() 
                      : d.created_date 
                      ? new Date(d.created_date).toLocaleDateString() 
                      : "—"}
                  </td>
                  <td className="text-center">
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => openModal(d)}
                      title="View Details"
                    >
                      <i className="bi bi-eye"></i>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center py-4">
                  No donations found.
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
        <span>
          Page {page} of {totalPages} (Total: {totalCount} donations)
        </span>
        <button
          className="btn btn-outline-secondary btn-sm"
          disabled={page === totalPages}
          onClick={nextPage}
        >
          Next →
        </button>
      </div>

      {/* -------- Modal for Details -------- */}
      <div className="modal fade" id="donationDetailModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content border-0 shadow">
            <div className="modal-header bg-light">
              <h5 className="modal-title fw-semibold">Donation Details</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body">
              {selectedDonation ? (
                <>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <strong>Donation ID:</strong>
                      <p className="mb-0">{selectedDonation._id}</p>
                    </div>
                    <div className="col-md-6">
                      <strong>Status:</strong>
                      <p className="mb-0">
                        <span
                          className={`badge ${
                            selectedDonation.status === "paid"
                              ? "bg-success"
                              : selectedDonation.status === "notPaid"
                              ? "bg-warning text-dark"
                              : "bg-secondary"
                          }`}
                        >
                          {selectedDonation.status || "—"}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-6">
                      <strong>User Name:</strong>
                      <p className="mb-0">{selectedDonation.user?.name || "—"}</p>
                    </div>
                    <div className="col-md-6">
                      <strong>Email:</strong>
                      <p className="mb-0">{selectedDonation.user?.email || "—"}</p>
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-6">
                      <strong>Mobile:</strong>
                      <p className="mb-0">{selectedDonation.user?.mobileNo || "—"}</p>
                    </div>
                    <div className="col-md-6">
                      <strong>Amount:</strong>
                      <p className="mb-0">${selectedDonation.amount?.toFixed(2) || "0.00"}</p>
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-12">
                      <strong>Description:</strong>
                      <p className="mb-0">{selectedDonation.description || "—"}</p>
                    </div>
                  </div>

                  {selectedDonation.message && (
                    <div className="row mb-3">
                      <div className="col-md-12">
                        <strong>Message:</strong>
                        <p className="mb-0">{selectedDonation.message}</p>
                      </div>
                    </div>
                  )}

                  <div className="row mb-3">
                    <div className="col-md-6">
                      <strong>Payment Session ID:</strong>
                      <p className="mb-0 text-break small">
                        {selectedDonation.paymentSessionId || "—"}
                      </p>
                    </div>
                    <div className="col-md-6">
                      <strong>Donation Date:</strong>
                      <p className="mb-0">
                        {selectedDonation.date 
                          ? new Date(selectedDonation.date).toLocaleString() 
                          : selectedDonation.created_date 
                          ? new Date(selectedDonation.created_date).toLocaleString() 
                          : "—"}
                      </p>
                    </div>
                  </div>

                  {selectedDonation.modified_date && (
                    <div className="row">
                      <div className="col-md-12">
                        <strong>Last Modified:</strong>
                        <p className="mb-0">
                          {new Date(selectedDonation.modified_date).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p>No donation selected.</p>
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



