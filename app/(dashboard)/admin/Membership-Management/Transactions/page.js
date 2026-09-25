"use client";
import { useEffect, useState } from "react";
import { postApi } from "services/api";
import { config } from "services/config";
import Swal from "sweetalert2";
import Select from "react-select";
import * as XLSX from "xlsx";
import { useSearchParams } from "next/navigation";
import {
  Col,
  Row,
  Table,
  Button,
  Container,
  Pagination,
  Modal,
  Form
} from "react-bootstrap";

export default function MembershipHistoryTable() {
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedMembership, setSelectedMembership] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState();
  const [total, setTotal] = useState(0);
  const [users, setUsers] = useState([]);
  const [currentFilterUserId, setCurrentFilterUserId] = useState(); // Track current filter
const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
const searchParams = useSearchParams();
const membershipId = searchParams.get("openModal");
const [currentMemberships,setCurrentMemberships] = useState()
const [filteredMembership,setFilteredMembership]=useState('all')

useEffect(() => {
  if (!membershipId || memberships.length === 0) return;

  const membership = memberships.find(m => m._id === membershipId);

  if (membership) {
    setSelectedMembership(membership);

    const modal = new bootstrap.Modal(
      document.getElementById("membershipDetailModal")
    );
    modal.show();
  }
}, [membershipId, memberships]);
  const fetchUsers = async () => {
    try {
      const res = await postApi(config.AllUsers, {});
      setUsers(res.data || []);
    } catch (error) {
      console.error("Failed to fetch users", error);
    }
  };

  const handleSort = (key) => {
  setSortConfig((prev) => ({
    key,
    direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
  }));
};

const getSortArrow = (key) => {
  if (sortConfig.key !== key) return " ↕";
  return sortConfig.direction === "asc" ? " ↑" : " ↓";
};

const sortedMemberships = [...memberships].sort((a, b) => {
  const { key, direction } = sortConfig;
  if (!key) return 0;

  let valA = "";
  let valB = "";

  if (key === "buyDate") {
    valA = new Date(a.date).getTime() || 0;
    valB = new Date(b.date).getTime() || 0;
  } else if (key === "renewalDate") {
    valA = new Date(a.renewal_date).getTime() || 0;
    valB = new Date(b.renewal_date).getTime() || 0;
  } else if (key === "paymentStatus") {
    // alphabetical: "notPaid" < "paid"
    valA = (a.status || "").toLowerCase();
    valB = (b.status || "").toLowerCase();
  } else if (key === "membershipStatus") {
    // alphabetical: "active" < "cancelled" < "inactive"
    valA = a.is_expired === true
      ? "cancelled"
      : a.is_expired === false && a.status === "paid"
      ? "active"
      : "inactive";
    valB = b.is_expired === true
      ? "cancelled"
      : b.is_expired === false && b.status === "paid"
      ? "active"
      : "inactive";
  }

  if (valA < valB) return direction === "asc" ? -1 : 1;
  if (valA > valB) return direction === "asc" ? 1 : -1;
  return 0;
});

  useEffect(() => {
    fetchUsers();
    fetchCurrentMemberships()
  }, []);

  useEffect(() => {
    fetchMemberships(page, currentFilterUserId);
  }, [page, currentFilterUserId]);

  async function fetchMemberships(currentPage = 1, user_id,membership_id) {
    try {
      setLoading(true);
      const payload = {
        page: Number(currentPage),
        pageSize: Number(pageSize)
      };

      if (user_id) {
        payload["user_id"] = user_id;
      }
      if(membership_id||filteredMembership!=='all'){
        payload['membership_id'] =membership_id||filteredMembership
      }

      const response = await postApi(config.membership_transactions, payload);
      console.log("Memberships Response:", response);

      const ok = response?.statusCode === 200 || response?.statusCode === 201;

      const membershipData =
        response?.membershipData ??
        response?.data?.membershipData ??
        response?.data?.data?.membershipData;

      const pagination =
        response?.pagination ??
        response?.data?.pagination ??
        response?.data?.data?.pagination;

      if (ok && Array.isArray(membershipData)) {
        setMemberships(membershipData);

        const nextTotalPages = Number(pagination?.totalPages || 1);
        setTotalPages(nextTotalPages);
        setTotal(Number(pagination?.total || 0));

        if (currentPage > nextTotalPages) {
          setPage(nextTotalPages || 1);
        }
      } else {
        Swal.fire("Error", response?.message || "Failed to fetch memberships", "error");
      }
    } catch (error) {
      console.error("Error fetching memberships:", error);
      Swal.fire("Error", "Failed to load membership history", "error");
    } finally {
      setLoading(false);
    }
  }

  async function fetchCurrentMemberships(currentPage = 1, user_id) {
    try {
      setLoading(true);
      const payload = {
        page: 1,
        pageSize: 10
      };
      const response = await postApi(config.GetMembershipPlans, payload);
      console.log("Memberships Response:", response);

      const ok = response?.statusCode === 200 || response?.statusCode === 201;

      const membershipData =response?.result

      if (ok && Array.isArray(membershipData)) {
        setCurrentMemberships(membershipData)
    }
   } catch (error) {
      console.error("Error fetching memberships:", error);
      Swal.fire("Error", "Failed to load membership history", "error");
    } finally {
      setLoading(false);
    }
  }

  const cleanUpModal = () => {
    document.body.classList.remove("modal-open");
    const backdrops = document.getElementsByClassName("modal-backdrop");
    while (backdrops.length > 0) {
      backdrops[0].parentNode.removeChild(backdrops[0]);
    }
  };

  const cancelMembership = async (membership) => {
    console.log(membership, "membership");

    const result = await Swal.fire({
      title: "Cancel Membership?",
      text: `Are you sure you want to cancel "${membership.membership?.plan_name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, Cancel Membership",
      cancelButtonText: "No, Keep It"
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);

        const response = await postApi(config.cancelMembership, {
          plan_id: membership._id,
          user_id: membership.user_id
        });

        if (response?.statusCode === 200 || response?.statusCode === 201) {
          Swal.fire({
            title: "Cancelled!",
            text: "Your membership has been cancelled successfully.",
            icon: "success"
          });

          await fetchMemberships(page, currentFilterUserId);

          const modal = bootstrap.Modal.getInstance(document.getElementById("membershipDetailModal"));
          if (modal) modal.hide();
          cleanUpModal();
        } else {
          Swal.fire("Error", response?.message || "Failed to cancel membership", "error");
        }
      } catch (error) {
        console.error("Error cancelling membership:", error);
        Swal.fire("Error", "Failed to cancel membership. Please try again.", "error");
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    const modalEl = document.getElementById("membershipDetailModal");
    if (modalEl) {
      modalEl.addEventListener("hidden.bs.modal", cleanUpModal);
    }
    return () => {
      if (modalEl) {
        modalEl.removeEventListener("hidden.bs.modal", cleanUpModal);
      }
    };
  }, []);

  const nextPage = () => {
    if (page < totalPages) {
      setPage((p) => p + 1);
    }
  };

  const prevPage = () => {
    if (page > 1) {
      setPage((p) => p - 1);
    }
  };

  const openModal = (membership) => {
    setSelectedMembership(membership);
    const modal = new bootstrap.Modal(document.getElementById("membershipDetailModal"));
    modal.show();
  };

  // Helper function to determine payment status display
  const getPaymentStatus = (membership) => {
    if (membership.status === "paid") {
      return { text: "Paid", className: "bg-success" };
    } else if (membership.status === "notPaid") {
      return { text: "Not Paid", className: "bg-warning text-dark" };
    }
    return { text: membership.status || "Unknown", className: "bg-secondary" };
  };

  // Helper function to determine membership status (Active/Cancelled)
  const getMembershipStatus = (membership) => {
    // If is_expired is true, membership is cancelled
    if (membership.is_expired === true) {
      return { text: "Cancelled", className: "bg-danger" };
    }
    // If is_expired is false and status is paid, membership is active
    if (membership.is_expired === false && membership.status === "paid") {
      return { text: "Active", className: "bg-success" };
    }
    // For other cases (like pending payments)
    return { text: "Inactive", className: "bg-secondary" };
  };

  // Check if cancel button should be shown (only for active memberships)
  const shouldShowCancelButton = (membership) => {
    return membership.status === "paid" && membership.is_expired !== true;
  };

  // Download Excel Report
  const downloadExcelReport = async () => {
    try {
      setLoading(true);

      // Fetch all data without pagination
      const payload = {
        page: 1,
        pageSize: 999999 // Get all records
      };

      if (currentFilterUserId) {
        payload["user_id"] = currentFilterUserId;
      }

      const response = await postApi(config.membership_transactions, payload);

      const membershipData =
        response?.membershipData ??
        response?.data?.membershipData ??
        response?.data?.data?.membershipData;

      if (Array.isArray(membershipData) && membershipData.length > 0) {
        // Prepare data for Excel
        const excelData = membershipData.map((m, index) => ({
          "#": index + 1,
          "Plan Name": m.membership?.plan_name || "—",
          "User Name": m.user?.name || "—",
          "User Email": m.user?.email || "—",
          "Price ($)": m.membership?.price || 0,
          "Buy Date": new Date(m.date).toLocaleDateString('en-US'),
          "Renewal Date": new Date(m.renewal_date).toLocaleDateString('en-US'),
          "Payment Status": m.status === "paid" ? "Paid" : m.status === "notPaid" ? "Not Paid" : m.status,
          "Membership Status": m.is_expired === true ? "Cancelled" : "Active",
          "Expiry Status": m.is_expired === true ? "Expired/Cancelled" : `Expires in ${m.expire_in} days`
        }));

        // Create worksheet
        const ws = XLSX.utils.json_to_sheet(excelData);

        // Set column widths
        const colWidths = [
          { wch: 5 },   // #
          { wch: 20 },  // Plan Name
          { wch: 20 },  // User Name
          { wch: 25 },  // User Email
          { wch: 10 },  // Price
          { wch: 12 },  // Buy Date
          { wch: 12 },  // Renewal Date
          { wch: 15 },  // Payment Status
          { wch: 15 },  // Membership Status
          { wch: 20 }   // Expiry Status
        ];
        ws['!cols'] = colWidths;

        // Create workbook
        const wb = XLSX.utils.book_new();
        const fileName = `membership_report_${new Date().toISOString().split('T')[0]}.xlsx`;

        XLSX.utils.book_append_sheet(wb, ws, "Membership History");

        // Download file
        XLSX.writeFile(wb, fileName);

        Swal.fire({
          title: "Success!",
          text: `Report downloaded successfully with ${excelData.length} records.`,
          icon: "success",
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        Swal.fire("Info", "No data available to download", "info");
      }
    } catch (error) {
      console.error("Error downloading report:", error);
      Swal.fire("Error", "Failed to download report", "error");
    } finally {
      setLoading(false);
    }
  };

  const userOptions = users.map((u) => ({
    value: u._id,
    label: `${u.name} ${u.lastName || ""}`,
    name: u.name,
    lastName: u.lastName,
    email: u.email,
    mobileNo: String(u.mobileNo)
  }));

  if (loading && memberships.length === 0) {
    return <div className="p-4 text-center">Loading membership history...</div>;
  }

  return (
    <div className="container my-5">
      <h2 className="fw-bold mb-4 text-center">Membership Booking History</h2>
     <Row className="mb-3">
              <Col md={12}>
                <div className="d-flex gap-2 flex-wrap">
                  {currentMemberships?.map((e,index)=>{
                    return(<Button key={index}
                    variant={filteredMembership === e._id ? "primary" : "outline-secondary"}
                    onClick={() =>{ setFilteredMembership(e._id) ; fetchMemberships(page, currentFilterUserId,e._id)}}
                  >
                    {e.plan_name} {/*({allEvents.length}) */}
                  </Button>)
                  })}
                  
                </div>
              </Col>
            </Row>
      {/* Search and Download Section */}
      <div className="row mb-4">
        <div className="col-md-8">
          <div className="d-flex align-items-center gap-2">
            <div style={{ flex: 1 }}>
              <Select
                options={userOptions}
                value={
                  userOptions?.length
                    ? userOptions.find((u) => u.value === selectedUserId) || null
                    : null
                }
                filterOption={(option, inputValue) => {
                  const search = inputValue.toLowerCase().replace(/\s+/g, "");
                  const name = (option.data.name || "").toLowerCase();
                  const lastName = (option.data.lastName || "").toLowerCase();
                  const fullName = (name + lastName).replace(/\s+/g, "");
                  const email = (option.data.email || "").toLowerCase();
                  const mobile = String(option.data.mobileNo || "").replace(/\D/g, "");
                  return (
                    name.includes(search) ||
                    lastName.includes(search) ||
                    fullName.includes(search) ||
                    email.includes(search) ||
                    mobile.includes(search)
                  );
                }}
                onChange={(selected) => {
                  const nextUserId = selected?.value;
                  setSelectedUserId(nextUserId);
                  setCurrentFilterUserId(nextUserId);
                  setPage(1); // Reset to first page when filtering
                }}
                isSearchable
                placeholder="Search by name, email, or mobile"
              />
            </div>
            <button
              className="btn btn-secondary fs-8 py-2 px-3"
              onClick={() => {
                setSelectedUserId(null);
                setCurrentFilterUserId(undefined);
                setPage(1); // Reset to first page when clearing
              }}
            >
              Clear
            </button>
          </div>
        </div>
        <div className="col-md-4 text-end">
          <button
            className="btn btn-success fs-8 py-2 px-3"
            onClick={downloadExcelReport}
            disabled={loading}
          >
            <i className="bi bi-file-excel me-2"></i>
            Download Excel Report
          </button>
        </div>
      </div>

      <div className="table-responsive shadow-sm rounded">
        <table className="table align-middle">
          <thead className="table-light">
            <tr>
              <th>#</th>
              <th>Plan Name</th>
              <th>User</th>
              <th>Price ($)</th>
              {/* <th>Buy Date</th>
              <th>Renewal Date</th>
              <th>Payment Status</th>
              <th>Membership Status</th> */}
              <th
  style={{ cursor: "pointer", userSelect: "none" }}
  onClick={() => handleSort("buyDate")}
>
  Buy Date{getSortArrow("buyDate")}
</th>
<th
  style={{ cursor: "pointer", userSelect: "none" }}
  onClick={() => handleSort("renewalDate")}
>
  Renewal Date{getSortArrow("renewalDate")}
</th>
<th
  style={{ cursor: "pointer", userSelect: "none" }}
  onClick={() => handleSort("paymentStatus")}
>
  Payment Status{getSortArrow("paymentStatus")}
</th>
<th
  style={{ cursor: "pointer", userSelect: "none" }}
  onClick={() => handleSort("membershipStatus")}
>
  Membership Status{getSortArrow("membershipStatus")}
</th>
              <th className="text-center">Action</th>
            </tr>
          </thead>
          <tbody>
           {sortedMemberships.length > 0 ? (
  sortedMemberships.map((m, i) => {
                const paymentStatusInfo = getPaymentStatus(m);
                const membershipStatusInfo = getMembershipStatus(m);
                return (
                  <tr key={m._id}>
                    <td>{(page - 1) * pageSize + i + 1}</td>
                    <td className="fw-semibold">{m.membership?.plan_name || "—"}</td>
                    <td>{m.user?.name || "—"}</td>
                    
                    <td>${m.membership?.price || 0}</td>
                    <td>{new Date(m.date).toLocaleDateString('en-US')}</td>
                    <td>{new Date(m.renewal_date).toLocaleDateString('en-US')}</td>
                    <td>
                      <span className={`badge ${paymentStatusInfo.className}`}>
                        {paymentStatusInfo.text}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${membershipStatusInfo.className}`}>
                        {membershipStatusInfo.text}
                      </span>
                    </td>
                    <td className="text-center">
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => openModal(m)}
                        title="View Details"
                      >
                        <i className="bi bi-eye"></i>
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="9" className="text-center py-4">
                  No membership history found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-3">
          <button
            className="btn btn-outline-secondary btn-sm"
            disabled={page === 1 || loading}
            onClick={prevPage}
          >
            ← Previous
          </button>
          <span>
            Page {page} of {totalPages} • Total {total} records
          </span>
          <button
            className="btn btn-outline-secondary btn-sm"
            disabled={page === totalPages || loading}
            onClick={nextPage}
          >
            Next →
          </button>
        </div>
      )}

      {/* Modal for Details */}
      <div className="modal fade" id="membershipDetailModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content border-0 shadow">
            <div className="modal-header bg-light">
              <h5 className="modal-title fw-semibold">Membership Details</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body">
              {selectedMembership ? (
                <>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <strong>Plan Name:</strong>
                      <p className="mb-0">{selectedMembership.membership?.plan_name}</p>
                    </div>
                    <div className="col-md-6">
                      <strong>Price:</strong>
                      <p className="mb-0">${selectedMembership.membership?.price}</p>
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-6">
                      <strong>User Name:</strong>
                      <p className="mb-0">{selectedMembership.user?.name}</p>
                    </div>
                    <div className="col-md-6">
                      <strong>Email:</strong>
                      <p className="mb-0">{selectedMembership.user?.email}</p>
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-6">
                      <strong>Payment Status:</strong>
                      <span
                        className={`badge ms-2 ${
                          selectedMembership.status === "paid"
                            ? "bg-success"
                            : "bg-warning text-dark"
                          }`}
                      >
                        {selectedMembership.status === "paid" ? "Paid" : selectedMembership.status}
                      </span>
                    </div>
                    {/* <div className="col-md-4">
                      <strong>Membership Status:</strong>
                      <span
                        className={`badge ms-2 ${
                          selectedMembership.is_expired === true
                            ? "bg-danger"
                            : "bg-success"
                        }`}
                      >
                        {selectedMembership.is_expired === true ? "Cancelled" : "Active"}
                      </span>
                    </div> */}
                    <div className="col-md-6">
                      <strong>Renewal Date:</strong>
                      <p className="mb-0">
                        {new Date(selectedMembership.renewal_date).toLocaleDateString('en-US')}
                      </p>
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-12">
                      <strong>Expiry Status:</strong>
                      <p className="mb-0">
                        {selectedMembership.is_expired === true
                          ? "⚠️ Membership has expired/cancelled"
                          : `Active - Expires in ${selectedMembership.expire_in} days`}
                      </p>
                    </div>
                  </div>

                  {/* Show expiry message if expired */}
                  {selectedMembership.is_expired === true && (
                    <div className="alert alert-danger mb-3">
                      <strong>Note:</strong> This membership has been cancelled/expired.
                    </div>
                  )}

                  <div className="row">
                    <div className="col-md-12">
                      <strong>Plan Description:</strong>
                      <div
                        className="border p-2 rounded"
                        dangerouslySetInnerHTML={{
                          __html: selectedMembership.membership?.plan_description || "—",
                        }}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <p>No membership selected.</p>
              )}
            </div>
            <div className="modal-footer">
              {/* Cancel Membership button - only show for active memberships */}
              {selectedMembership && shouldShowCancelButton(selectedMembership) && (
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => cancelMembership(selectedMembership)}
                >
                  <i className="bi bi-x-circle me-2"></i>
                  Cancel Membership
                </button>
              )}
              
              {/* Show message for cancelled memberships */}
              {/* {selectedMembership?.is_expired === true && (
                <div className="text-danger me-auto">
                  <i className="bi bi-info-circle me-1"></i>
                  Membership has been cancelled
                </div>
              )} */}
              
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