"use client";
import { useState, useMemo, useEffect } from "react";
import { postApi, postApiWithFile } from "services/api";
import { config } from "services/config";

export default function WaitlistPage() {
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState(new Date().toISOString().split('T')[0]);
  const [toDate, setToDate] = useState();
  const [sortAsc, setSortAsc] = useState(true);
  const [items, setItems] = useState([])

  useEffect(() => {

    filter()
  }, [])

  const filter = async () => {
    const endpoint = config.fatchWaitlist;
    const data = { search, fromDate, toDate };

    const response = await postApi(endpoint, data);

    if (response.statusCode === 200) {
      const formatted = response.data.map((item) => ({
        _id: item._id,

        userName: `${item.user?.name || ""} ${item.user?.lastName || ""}`,

        forLabel: item.familyMember
          ? `${item.familyMember.firstName} ${item.familyMember.lastName || ""}`
          : "Me",

        serviceName: item.service?.name || "-",

        employeeName: item.employeeUser
          ? `${item.employeeUser.name} ${item.employeeUser.lastName || ""}`
          : "-",

        preferredDate: item.date,
        date: item.date,

        status: "Waitlisted",

        mobile: item.user?.mobileNo || "-",
        email: item.user?.email || "-",
      }));
      console.log("API DATA:", response.data);
      console.log("FORMATTED:", formatted);
      setItems(formatted);
    }
  };

  // ✅ DATE FORMAT
  const fmtDate = (d) =>
    new Date(d).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  // ✅ INITIALS
  const initials = (name = "") =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  const filtered = useMemo(() => {
    let data = [...items];

    if (search && search.trim() !== "") {
      const q = search.toLowerCase();

      data = data.filter((i) =>
        (i.userName || "").toLowerCase().includes(q) ||
        (i.serviceName || "").toLowerCase().includes(q) ||
        (i.employeeName || "").toLowerCase().includes(q) ||
        (i.email || "").toLowerCase().includes(q) ||      // ✅ FIX
        String(i.mobile || "").includes(q)                // ✅ FIX
      );
    }

    // 📅 DATE FILTER (SAFE VERSION)
    if (fromDate) {
      data = data.filter((i) => {
        if (!i.date) return false;

        const itemDate = new Date(i.date).setHours(0, 0, 0, 0);
        const from = new Date(fromDate).setHours(0, 0, 0, 0);

        return itemDate >= from;
      });
    }

    if (toDate) {
      data = data.filter((i) => {
        if (!i.date) return false;

        const itemDate = new Date(i.date).setHours(0, 0, 0, 0);
        const to = new Date(toDate).setHours(23, 59, 59, 999);

        return itemDate <= to;
      });
    }

    // 🔃 SORT
    data.sort((a, b) =>
      sortAsc
        ? new Date(a.date) - new Date(b.date)
        : new Date(b.date) - new Date(a.date)
    );

    return data;
  }, [items, search, fromDate, toDate, sortAsc]);

  // ✅ GROUP BY DATE
  // const grouped = useMemo(() => {
  //   return filtered.reduce((acc, item) => {
  //     const key = fmtDate(item.date);
  //     if (!acc[key]) acc[key] = [];
  //     acc[key].push(item);
  //     return acc;
  //   }, {});
  // }, [filtered]);
  const grouped = useMemo(() => {
    return filtered.reduce((acc, item) => {
      if (!item.date) return acc;

      const key = fmtDate(item.date);

      if (!acc[key]) acc[key] = [];
      acc[key].push(item);

      return acc;
    }, {});
  }, [filtered]);
  //   const [items,setItems] = useState([
  //     {
  //       _id: "1",
  //       userName: "Admin Vedic",
  //       forLabel: "Me",
  //       serviceName: "Knee Panchakarma",
  //       employeeName: "Dr. Nehil",
  //       preferredDate: "2025-11-26",
  //       status: "Waitlisted",
  //       mobile: "+1 (555) 100-0001",
  //       email: "admin.vedic@example.com",
  //     },
  //     {
  //       _id: "2",
  //       userName: "Sharma",
  //       forLabel: "Child",
  //       serviceName: "Knee Panchakarma",
  //       employeeName: "Dr. Kamakshi",
  //       preferredDate: "2025-12-29",
  //       status: "Waitlisted",
  //       mobile: "+1 (555) 200-0002",
  //       email: "sharma.k@example.com",
  //     },
  //   ]);

  //   // const filter = async () => {
  //   //   const endpoint = config.fatchWaitlist;
  //   //   const data = { search, fromDate, toDate };
  //   //   const response = await postApi(endpoint, data);
  //   //   if(response.statusCode==200){
  //   //     // for (const [ind,data of response.data])
  //   //     setItems(response.data)
  //   //   }
  //   // }

  //   const filter = async () => {
  //   const endpoint = config.fatchWaitlist;
  //   const data = { search, fromDate, toDate };

  //   const response = await postApi(endpoint, data);

  //   if (response.statusCode === 200) {
  //     const formatted = response.data.map((item) => ({
  //       _id: item._id,

  //       userName: `${item.user?.name || ""} ${item.user?.lastName || ""}`,

  //       forLabel: item.familyMember
  //         ? `${item.familyMember.firstName} ${item.familyMember.lastName || ""}`
  //         : "Me",

  //       serviceName: item.service?.name || "-",

  //       employeeName: item.employeeUser
  //         ? `${item.employeeUser.name} ${item.employeeUser.lastName || ""}`
  //         : "-",

  //       preferredDate: item.date,

  //       status: "Waitlisted",

  //       mobile: item.user?.mobileNo || "-",
  //       email: item.user?.email || "-",

  //       date: item.date, // 🔥 important for sorting/filtering
  //     }));
  // console.log(formatted,"formatted")
  //     setItems(formatted);
  //   }
  // };

  //   const fmtDate = (d) =>
  //     new Date(d).toLocaleDateString("en-US", {
  //       weekday: "short",
  //       month: "short",
  //       day: "numeric",
  //       year: "numeric",
  //     });

  //   const initials = (name) =>
  //     name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  //   const filtered = useMemo(() => {
  //     let data = items.filter((i) => {
  //       const q = search.toLowerCase();
  //       return (
  //         i.userName.toLowerCase().includes(q) ||
  //         i.serviceName.toLowerCase().includes(q) ||
  //         i.employeeName.toLowerCase().includes(q)
  //       );
  //     });

  //     // if (fromDate) data = data.filter((i) => i.date >= fromDate);
  //     // if (toDate) data = data.filter((i) => i.date <= toDate);
  //     if (fromDate)
  //   data = data.filter((i) => new Date(i.date) >= new Date(fromDate));

  // if (toDate)
  //   data = data.filter((i) => new Date(i.date) <= new Date(toDate));
  // console.log(data,"datadata")
  //     // data.sort((a, b) =>
  //     //   sortAsc
  //     //     ? a.date.localeCompare(b.date)
  //     //     : b.date.localeCompare(a.date)
  //     // );
  //     data.sort((a, b) =>
  //   sortAsc
  //     ? new Date(a.date) - new Date(b.date)
  //     : new Date(b.date) - new Date(a.date)
  // );

  //     return data;
  //   }, [items, search, fromDate, toDate, sortAsc]);

  //   const grouped = useMemo(() => {
  //     return filtered.reduce((acc, item) => {
  //       const key = fmtDate(item.date);
  //       if (!acc[key]) acc[key] = [];
  //       acc[key].push(item);
  //       return acc;
  //     }, {});
  //   }, [filtered]);

  return (
    <div className="page">
      {/* HEADER */}
      <div className="header">
        <div>
          <h1>
            Waitlist Requests
            {/* <span className="count">{items.length}</span> */}
          </h1>
          <p>All pending entries, sorted by preferred date</p>
        </div>

        {/* <button className="refresh" style={{ height: "40px" }}>↻ Refresh</button> */}
      </div>

      {/* CONTROLS */}
      <div className="controls">
        <input
          placeholder="Search by name, service, practitioner…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <span className="label">From</span>
        <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />

        <span className="label">To</span>
        <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />

        <button className="form-control" style={{ width: "140px" }} onClick={() => { filter() }}>
          Search
        </button>
        <button className="form-control" style={{ width: "140px" }} onClick={() => { setSearch(""), setFromDate(""); setToDate(""); }}>
          ✕ Clear
        </button>

        <button className="form-control" style={{ width: "140px" }} onClick={() => setSortAsc(!sortAsc)}>
          {sortAsc ? "↑ Earliest first" : "↓ Latest first"}
        </button>
      </div>

      {/* LIST */}
      <div className="main">
        {console.log(grouped, "grouped")}
        {Object.entries(grouped).map(([date, list]) => (
          <div key={date}>
            <div className="date-label">
              {date} <span>{list.length}</span>
            </div>

            {list.map((item) => (
              <div className="card" key={item._id}>
                <div className="avatar">{initials(item.userName)}</div>

                <div className="info">
                  <div className="center">{item?.service?.name}</div>

                  <div className="name">
                    {item.userName}
                    {item.forLabel && (
                      <span> · For: {item.forLabel}</span>
                    )}
                  </div>

                  <div className="service">{item.serviceName}</div>
                  <div className="emp">with {item.employeeName}</div>

                  <div className="divider"></div>

                  <div className="cust">
                    <div><b>Name:</b> {item.userName}</div>
                    <div><b>Mobile:</b> {item.mobile}</div>
                    <div><b>Email:</b> {item.email}</div>
                  </div>
                </div>

                <div className="meta">
                  <div className="date">{fmtDate(item.preferredDate)}</div>
                  <div className="badge">{item.status}</div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* STYLES */}
      <style jsx>{`
        .page {
          background: #f4f6f9;
          min-height: 100vh;
          font-family: Segoe UI;
        }

        .header {
          display: flex;
          justify-content: space-between;
          padding: 20px;
          background: #fff;
          border-bottom: 1px solid #eee;
        }

        h1 {
          font-size: 20px;
        }

        .count {
          background: #ede9fe;
          color: #6d28d9;
          margin-left: 8px;
          padding: 2px 10px;
          border-radius: 20px;
          font-size: 12px;
        }

        .refresh {
          border: 1px solid #7c3aed;
          color: #7c3aed;
          padding: 6px 14px;
          border-radius: 8px;
          background: #fff;
        }

        .controls {
          display: flex;
          gap: 10px;
          padding: 12px 20px;
          background: #fff;
          border-bottom: 1px solid #eee;
          flex-wrap: wrap;
        }

        input {
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 8px;
        }

        .main {
          padding: 20px;
        }

        .date-label {
          font-size: 12px;
          color: #9ca3af;
          margin-top: 20px;
        }

        .card {
          display: flex;
          gap: 12px;
          background: #fff;
          padding: 15px;
          border-radius: 12px;
          margin-top: 10px;
          border: 1px solid #eee;
        }

        .avatar {
          width: 40px;
          height: 40px;
          background: #facc15;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
        }

        .info {
          flex: 1;
        }

        .center {
          font-size: 11px;
          color: #7c3aed;
          font-weight: bold;
        }

        .name {
          font-weight: 600;
        }

        .service {
          font-size: 14px;
        }

        .emp {
          font-size: 12px;
          color: gray;
        }

        .divider {
          height: 1px;
          background: #eee;
          margin: 6px 0;
        }

        .meta {
          text-align: right;
        }

        .badge {
          background: #dcfce7;
          padding: 2px 10px;
          border-radius: 20px;
          font-size: 12px;
        }
      `}</style>
    </div>
  );
}

// "use client";
// import { useState, useMemo } from "react";
// import { postApi } from "services/api";
// import { config } from "services/config";

// export default function WaitlistPage() {
//   const [search, setSearch] = useState("");
//   const [fromDate, setFromDate] = useState("");
//   const [toDate, setToDate] = useState("");
//   const [sortAsc, setSortAsc] = useState(true);
//   const [items, setItems] = useState([]);

//   // ✅ API CALL + DATA TRANSFORM
//   const filter = async () => {
//     const endpoint = config.fatchWaitlist;
//     const data = { search, fromDate, toDate };

//     const response = await postApi(endpoint, data);

//     if (response.statusCode === 200) {
//       const formatted = response.data.map((item) => ({
//         _id: item._id,

//         userName: `${item.user?.name || ""} ${item.user?.lastName || ""}`,

//         forLabel: item.familyMember
//           ? `${item.familyMember.firstName} ${item.familyMember.lastName || ""}`
//           : "Me",

//         serviceName: item.service?.name || "-",

//         employeeName: item.employeeUser
//           ? `${item.employeeUser.name} ${item.employeeUser.lastName || ""}`
//           : "-",

//         preferredDate: item.date,
//         date: item.date,

//         status: "Waitlisted",

//         mobile: item.user?.mobileNo || "-",
//         email: item.user?.email || "-",
//       }));
//       console.log("API DATA:", response.data);
// console.log("FORMATTED:", formatted);
//       setItems(formatted);
//     }
//   };

//   // ✅ DATE FORMAT
//   const fmtDate = (d) =>
//     new Date(d).toLocaleDateString("en-US", {
//       weekday: "short",
//       month: "short",
//       day: "numeric",
//       year: "numeric",
//     });

//   // ✅ INITIALS
//   const initials = (name = "") =>
//     name
//       .split(" ")
//       .map((n) => n[0])
//       .join("")
//       .slice(0, 2)
//       .toUpperCase();

//   // ✅ FILTER + SORT
//   // const filtered = useMemo(() => {
//   //   let data = [...items];

//   //   // 🔍 search
//   //   if (search) {
//   //     const q = search.toLowerCase();
//   //     data = data.filter(
//   //       (i) =>
//   //         i.userName.toLowerCase().includes(q) ||
//   //         i.serviceName.toLowerCase().includes(q) ||
//   //         i.employeeName.toLowerCase().includes(q)
//   //     );
//   //   }

//   //   // 📅 date filter
//   //   if (fromDate)
//   //     data = data.filter((i) => new Date(i.date) >= new Date(fromDate));

//   //   if (toDate)
//   //     data = data.filter((i) => new Date(i.date) <= new Date(toDate));

//   //   // 🔃 sorting
//   //   data.sort((a, b) =>
//   //     sortAsc
//   //       ? new Date(a.date) - new Date(b.date)
//   //       : new Date(b.date) - new Date(a.date)
//   //   );

//   //   return data;
//   // }, [items, search, fromDate, toDate, sortAsc]);
//   const filtered = useMemo(() => {
//   let data = [...items];

//   // 🔍 SEARCH (safe)
//   // if (search && search.trim() !== "") {
//   //   const q = search.toLowerCase();

//   //   data = data.filter((i) =>
//   //     (i.userName || "").toLowerCase().includes(q) ||
//   //     (i.serviceName || "").toLowerCase().includes(q) ||
//   //     (i.employeeName || "").toLowerCase().includes(q)
//   //   );
//   // }
//   if (search && search.trim() !== "") {
//   const q = search.toLowerCase();

//   data = data.filter((i) =>
//     (i.userName || "").toLowerCase().includes(q) ||
//     (i.serviceName || "").toLowerCase().includes(q) ||
//     (i.employeeName || "").toLowerCase().includes(q) ||
//     (i.email || "").toLowerCase().includes(q) ||      // ✅ FIX
//     String(i.mobile || "").includes(q)                // ✅ FIX
//   );
// }

//   // 📅 DATE FILTER (SAFE VERSION)
//   if (fromDate) {
//     data = data.filter((i) => {
//       if (!i.date) return false;

//       const itemDate = new Date(i.date).setHours(0, 0, 0, 0);
//       const from = new Date(fromDate).setHours(0, 0, 0, 0);

//       return itemDate >= from;
//     });
//   }

//   if (toDate) {
//     data = data.filter((i) => {
//       if (!i.date) return false;

//       const itemDate = new Date(i.date).setHours(0, 0, 0, 0);
//       const to = new Date(toDate).setHours(23, 59, 59, 999);

//       return itemDate <= to;
//     });
//   }

//   // 🔃 SORT
//   data.sort((a, b) =>
//     sortAsc
//       ? new Date(a.date) - new Date(b.date)
//       : new Date(b.date) - new Date(a.date)
//   );

//   return data;
// }, [items, search, fromDate, toDate, sortAsc]);

//   // ✅ GROUP BY DATE
//   // const grouped = useMemo(() => {
//   //   return filtered.reduce((acc, item) => {
//   //     const key = fmtDate(item.date);
//   //     if (!acc[key]) acc[key] = [];
//   //     acc[key].push(item);
//   //     return acc;
//   //   }, {});
//   // }, [filtered]);
//   const grouped = useMemo(() => {
//   return filtered.reduce((acc, item) => {
//     if (!item.date) return acc;

//     const key = fmtDate(item.date);

//     if (!acc[key]) acc[key] = [];
//     acc[key].push(item);

//     return acc;
//   }, {});
// }, [filtered]);
// // console.log("API DATA:", response.data);

// console.log("ITEMS:", items);
// console.log("FILTERED:", filtered);
// console.log("items:", items);
// console.log("search:", search);
// console.log("fromDate:", fromDate);
// console.log("toDate:", toDate);

//   return (
//     <div className="page">
//       {/* HEADER */}
//       <div className="header">
//         <div>
//           <h1>
//             Waitlist Requests
//             <span className="count">{items.length}</span>
//           </h1>
//           <p>All pending entries, sorted by preferred date</p>
//         </div>

//         <button className="refresh" onClick={filter}>
//           ↻ Refresh
//         </button>
//       </div>

//       {/* CONTROLS */}
//       <div className="controls">
//         <input
//           placeholder="Search by name, service, practitioner…"
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//         />

//         <span className="label">From</span>
//         <input
//           type="date"
//           value={fromDate}
//           onChange={(e) => setFromDate(e.target.value)}
//         />

//         <span className="label">To</span>
//         <input
//           type="date"
//           value={toDate}
//           onChange={(e) => setToDate(e.target.value)}
//         />

//         <button onClick={filter}>Search</button>

//         <button
//           onClick={() => {
//             setFromDate("");
//             setToDate("");
//           }}
//         >
//           ✕ Clear dates
//         </button>

//         <button onClick={() => setSortAsc(!sortAsc)}>
//           {sortAsc ? "↑ Earliest first" : "↓ Latest first"}
//         </button>
//       </div>

//       {/* LIST */}
//       <div className="main">
//         {Object.entries(grouped).map(([date, list]) => (
//           <div key={date}>
//             <div className="date-label">
//               {date} <span>{list.length}</span>
//             </div>

//             {list.map((item) => (
//               <div className="card" key={item._id}>
//                 <div className="avatar">{initials(item.userName)}</div>

//                 <div className="info">
//                   <div className="center">{item.serviceName}</div>

//                   <div className="name">
//                     {item.userName}
//                     {item.forLabel && (
//                       <span> · For: {item.forLabel}</span>
//                     )}
//                   </div>

//                   <div className="emp">with {item.employeeName}</div>

//                   <div className="divider"></div>

//                   <div className="cust">
//                     <div><b>Name:</b> {item.userName}</div>
//                     <div><b>Mobile:</b> {item.mobile}</div>
//                     <div><b>Email:</b> {item.email}</div>
//                   </div>
//                 </div>

//                 <div className="meta">
//                   <div className="date">{fmtDate(item.date)}</div>
//                   <div className="badge">{item.status}</div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         ))}
//       </div>

//       {/* STYLES */}
//       <style jsx>{`
//         .page {
//           background: #f4f6f9;
//           min-height: 100vh;
//         }

//         .header {
//           display: flex;
//           justify-content: space-between;
//           padding: 20px;
//           background: #fff;
//           border-bottom: 1px solid #eee;
//         }

//         .count {
//           background: #ede9fe;
//           margin-left: 8px;
//           padding: 2px 10px;
//           border-radius: 20px;
//         }

//         .controls {
//           display: flex;
//           gap: 10px;
//           padding: 12px;
//           background: #fff;
//           flex-wrap: wrap;
//         }

//         input {
//           padding: 8px;
//           border: 1px solid #ddd;
//           border-radius: 8px;
//         }

//         .main {
//           padding: 20px;
//         }

//         .card {
//           display: flex;
//           gap: 12px;
//           background: #fff;
//           padding: 15px;
//           border-radius: 12px;
//           margin-top: 10px;
//         }

//         .avatar {
//           width: 40px;
//           height: 40px;
//           background: #facc15;
//           border-radius: 10px;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           font-weight: bold;
//         }

//         .meta {
//           text-align: right;
//         }

//         .badge {
//           background: #dcfce7;
//           padding: 2px 10px;
//           border-radius: 20px;
//         }
//       `}</style>
//     </div>
//   );
// }