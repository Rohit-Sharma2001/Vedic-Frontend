"use client";
import { useEffect, useState } from "react";
import { postApi } from "services/api";
import { config } from "services/config";
import Swal from "sweetalert2";

export default function CoursesTransactionHistory() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  useEffect(() => {
    (async () => {
      await fetchTransactions(page);
    })();
  }, [page]);

  async function fetchTransactions(currentPage = 1) {
    try {
      setLoading(true);
      const payload = { page: currentPage, pageSize };
      const response = await postApi(config.courses_transactions, payload);
      console.log("Courses Transactions Response:", response);

      if (response.statusCode === 200 && Array.isArray(response.result)) {
        const data = response.result;
        setTransactions(data);
        setTotalPages(1); // Update if API adds pagination later
      } else {
        Swal.fire("Error", response.message || "Failed to fetch course transactions", "error");
      }
    } catch (error) {
      console.error("Error fetching course transactions:", error);
      Swal.fire("Error", "Failed to load course transaction history", "error");
    } finally {
      setLoading(false);
    }
  }

  const nextPage = () => page < totalPages && setPage((p) => p + 1);
  const prevPage = () => page > 1 && setPage((p) => p - 1);

  const openModal = (transaction) => {
    setSelectedTransaction(transaction);
    const modal = new bootstrap.Modal(document.getElementById("courseTransactionDetailModal"));
    modal.show();
  };

  if (loading) return <div className="p-4 text-center">Loading course transaction history...</div>;

  return (
    <div className="container my-5">
      <h2 className="fw-bold mb-4 text-center">Course Transactions History</h2>

      <div className="table-responsive shadow-sm rounded">
        <table className="table align-middle">
          <thead className="table-light">
            <tr>
              <th>#</th>
              <th>Transaction ID</th>
              <th>Course</th>
              <th>User</th>
              <th>Status</th>
              <th>Payment Session ID</th>
              <th>Date</th>
              <th className="text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length > 0 ? (
              transactions.map((t, i) => (
                <tr key={t.transactionId}>
                  <td>{(page - 1) * pageSize + i + 1}</td>
                  <td className="fw-semibold">{t.transactionId || "—"}</td>
                  <td>{t.course?.name  || "—"}</td>
                  <td>{t.user?.name || "—"}</td>
                  <td>
                    <span
                      className={`badge ${
                        t.paymentStatus === "paid"
                          ? "bg-success"
                          : t.paymentStatus === "notPaid"
                          ? "bg-warning text-dark"
                          : "bg-secondary"
                      }`}
                    >
                      {t.paymentStatus || "unknown"}
                    </span>
                  </td>
                  <td className="text-truncate" style={{ maxWidth: "180px" }}>
                    {t.paymentSessionId || "—"}
                  </td>
                  <td>{t.createdAt ? new Date(t.createdAt).toLocaleDateString('en-US') : "—"}</td>
                  <td className="text-center">
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => openModal(t)}
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
                  No course transaction history found.
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
          Page {page} of {totalPages}
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
      <div className="modal fade" id="courseTransactionDetailModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content border-0 shadow">
            <div className="modal-header bg-light">
              <h5 className="modal-title fw-semibold">Course Transaction Details</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body">
              {selectedTransaction ? (
                <>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <strong>Transaction ID:</strong>
                      <p className="mb-0">{selectedTransaction.transactionId}</p>
                    </div>
                    <div className="col-md-6">
                      <strong>Payment Status:</strong>
                      <span
                        className={`badge ms-2 ${
                          selectedTransaction.paymentStatus === "paid"
                            ? "bg-success"
                            : "bg-warning text-dark"
                        }`}
                      >
                        {selectedTransaction.paymentStatus}
                      </span>
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-6">
                      <strong>User Name:</strong>
                      <p className="mb-0">{selectedTransaction.user?.name || "—"}</p>
                    </div>
                    <div className="col-md-6">
                      <strong>User Email:</strong>
                      <p className="mb-0">{selectedTransaction.user?.email || "—"}</p>
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-6">
                      <strong>Course Title:</strong>
                      <p className="mb-0">{selectedTransaction.course?.name || "—"}</p>
                    </div>
                    <div className="col-md-6">
                      <strong>Created At:</strong>
                      <p className="mb-0">
                        {selectedTransaction.createdAt
                          ? new Date(selectedTransaction.createdAt).toLocaleString()
                          : "—"}
                      </p>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-12">
                      <strong>Payment Session ID:</strong>
                      <div className="border p-2 rounded">
                        <p className="mb-0 text-break">{selectedTransaction.paymentSessionId}</p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <p>No transaction selected.</p>
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
