"use client";
import { useEffect, useState } from "react";
import { postApi } from "services/api";
import { config } from "services/config";
import Swal from "sweetalert2";
import Loader from "services/Loader/page";

export default function MyWaitlist() {
  const [waitlist, setWaitlist] = useState([]);
  const [loader, setLoader] = useState(false)
  const [services, setServices] = useState([]);

   // Waitlist states
    const [waitlistService, setWaitlistService] = useState("");
    const [waitlistEmployees, setWaitlistEmployees] = useState([]);
    const [waitlistEmployee, setWaitlistEmployee] = useState("");
    const [waitlistEntries, setWaitlistEntries] = useState([
      { key: Date.now(), date: "", time: "" },
    ]);

  useEffect(() => {
    

    fetchWaitlist();
  }, []);
const fetchWaitlist = async () => {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (!user?._id) return;

      try {
        setLoader(true);
        const res = await postApi(config.FindWaitlistByUser, { id: user._id });
        console.log("Waitlist Entries ", res.data)
        setLoader(false);

        if (res?.data) {
          setWaitlist(res.data);
        } else {
          setWaitlist([]); // ensure array
        }

      } catch (error) {
        console.error("Failed to fetch waitlist:", error);
        setLoader(false);      // ✅ FIX: Stop loader on error
        setWaitlist([]);        // ✅ Fix: Otherwise UI has nothing to display
      }
    };

  const getInitials = (name = "") => {
    const words = name.trim().split(" ");
    return words.length === 1
      ? words[0][0]?.toUpperCase() || ""
      : (words[0][0] + words[1][0]||"").toUpperCase();
  };

  // ✅ who is this waitlist for?
  const getWaitlistPersonLabel = (item) => {
    console.log("For Full Name ", item)
    if (item?.familyMember) {
      const full = `${item.familyMember?.name || ""} ${item.familyMember?.lastName || ""}`.trim();
      const rel = item.familyMember?.relation ? ` (${item.familyMember.relation})` : "";
      return `${full}${rel}`.trim();
    }
    return `${item?.user?.name + " " + item?.user?.lastName || "Me"} (Me)`;
  };

  // ✅ date like: Thu, Nov 27, 2025
  const formatNiceDate = (dateStr) => {
    if (!dateStr) return "";
    console.log(dateStr, "dateStr")
    // const d = new Date(dateStr);
    // if (Number.isNaN(d.getTime())) return "";
    // return d.toLocaleDateString("en-US", {
    //   weekday: "short",
    //   month: "short",
    //   day: "numeric",
    //   year: "numeric",
    //   timeZone: "America/New_York",
    // });
    const [year, month, day] = dateStr.split("T")[0].split("-");

    const d = new Date(year, month - 1, day); // local date (no shift)

    return d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // ✅ time like: 11:00 AM
  const formatNiceTime = (timeStr) => {
    if (!timeStr) return "";
    const d = new Date(timeStr);

    // if ISO date-time string, this works
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      });
    }

    // fallback: if backend ever sends "HH:mm"
    if (/^\d{2}:\d{2}$/.test(timeStr)) return timeStr;

    return timeStr; // last fallback
  };


  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This will remove the waitlist entry.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!"
    });

    if (result.isConfirmed) {
      try {
        await postApi(config.DeleteWaitlistById, { id });
        setWaitlist((prev) => prev.filter((entry) => entry._id !== id));
        Swal.fire("Deleted!", "Waitlist entry has been removed.", "success");
      } catch (error) {
        Swal.fire("Error!", "Failed to delete waitlist entry.", "error");
      }
    }
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


    // Submit waitlist form
      const handleAddToWaitlist = async () => {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
    
        if (!waitlistService || !waitlistEmployee || waitlistEntries.length === 0) {
          alert("Please fill all waitlist details");
          return;
        }
    setLoader(true)
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
    setLoader(false)
          if (response.statusCode === 201) {
            alert("Successfully added to waitlist");
            const modal = bootstrap.Modal.getInstance(document.getElementById("addWaitlist"));
            modal?.hide();
            fetchWaitlist()
          } else {
            alert(`Error: ${response.message}`);
          }
        } catch (error) {
          console.error("Error adding to waitlist:", error);
          alert("Failed to add to waitlist");
        }
      };
       // Add a new date/time entry
  const handleAddWaitlistEntry = () => {
    setWaitlistEntries([...waitlistEntries, { key: Date.now(), date: "", time: "" }]);
  };

   // Remove a specific entry
  const handleRemoveWaitlistEntry = (keyToRemove) => {
    setWaitlistEntries(waitlistEntries.filter((entry) => entry.key !== keyToRemove));
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

        // Local YYYY-MM-DD for tomorrow
const getTomorrowYMD = (d = new Date()) => {
  const t = new Date(d);
  t.setDate(t.getDate() + 1);
  const y = t.getFullYear();
  const m = String(t.getMonth() + 1).padStart(2, "0");
  const day = String(t.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

 
  return (
    <>
     {loader && <Loader />}
    <div className="d-flex justify-content-end mb-1">
    </div>
      <div className="cardBox h-100">
       
        <h5 className="mb-4">My Waitlist</h5>

        <button className="btn btn-primary" type="button" onClick={() => {
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

        <ul className="d-block">
          {/* ✅ Empty State */}
          {!loader && waitlist.length === 0 && (
            <div className="noAppointment text-center mt-5">
              <lottie-player
                src="/images/landingpage/not-available.json"
                background="transparent"
                speed="1"
                style={{ width: "250px", height: "250px", margin: "auto" }}
                loop
                autoPlay
              ></lottie-player>
              <h3>No Waitlist Entries</h3>
              <p>You do not have any waitlist entries.</p>
            </div>
          )}


          {waitlist.map((item) => (
            <li key={item._id} className="mb-3 d-block">
              <div className="appointmentCntent d-md-flex justify-content-between align-items-center gap-3">
                <div className="appointmentName d-flex gap-3 align-items-center mb-md-0 mb-3">
                  <figure className="mb-0">
                    <div
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
                      {getInitials(getWaitlistPersonLabel(item))}

                    </div>
                  </figure>
                  <div className="appointmentprcetxt">
                    <strong>Vedic Yours Ayurveda</strong>

                    {/* ✅ ADD THIS */}
                    <p className="mb-1">
                      <b>For:</b> {getWaitlistPersonLabel(item)}
                    </p>

                    <p>{item?.service?.name || "Service"}</p>
                    <strong>with {item?.employee?.userDetails?.name || "Employee"}</strong>

                    {/* ✅ replace Preferred Time */}
                    <strong className="pricestarting">
                      {/* Preferred Time: <b>{formatNiceTime(item?.time)}</b> */}
                    </strong>
                  </div>

                </div>
                <div className="appointmentStatus mb-md-0 mb-3">
                  <p className="mb-1 fs-8">
                    {formatNiceDate(item?.date)}
                    {/* - {formatNiceTime(item?.time)} */}
                  </p>

                  <span className="badge text-bg-warning rounded-1">Waitlisted</span>
                </div>
                <div className="appointmentButton">
                  <button
                    className="btn btn-primary d-block mb-2"
                    onClick={() => handleDelete(item._id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
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
                    {/* <div className="col-lg-5">
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
                    </div> */}
                  </div>
                ))}

                {/* Add Row */}
                {/* <button
                  type="button"
                  className="btn btn-orange fs-9 rounded-5 serviceBtn overflow-hidden"
                  onClick={handleAddWaitlistEntry}
                >
                  + Add waitlist Date & Time
                </button> */}

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
      </>
  );
}
