import { useState, useEffect, useRef } from "react";
import { config } from "services/config";
import { postApi } from "services/api";

export default function GroupEmailModal({ onClose, onAddEmails }) {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editSaving, setEditSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [selected, setSelected] = useState(new Set());

  // ── View/Delete Users Popup ───────────────────────────────────────────────
  const [viewGroup, setViewGroup] = useState(null);
  const [usersLoading, setUsersLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [bulkRemoving, setBulkRemoving] = useState(false);

  // ── Add Users Popup ───────────────────────────────────────────────────────
  const [addGroup, setAddGroup] = useState(null);           // group being added to
  const [addUsersLoading, setAddUsersLoading] = useState(false);
  const [allUsersList, setAllUsersList] = useState([]);     // ALL users from API
  const [selectedAddUsers, setSelectedAddUsers] = useState(new Set());
  const [addSubmitting, setAddSubmitting] = useState(false);
  const [addSearch, setAddSearch] = useState("");

  const newInputRef = useRef(null);
  const editInputRef = useRef(null);

  useEffect(() => { load(); }, []);
  useEffect(() => { if (creating) newInputRef.current?.focus(); }, [creating]);
  useEffect(() => { if (editingId) editInputRef.current?.focus(); }, [editingId]);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(config.getAllGroups);
      const result = await response.json();
      setGroups(result?.data || []);
    } catch (error) {
      console.error("Failed to load groups:", error);
      setError("Failed to load groups.");
    } finally {
      setLoading(false);
    }
  }
  async function openViewPopup(group) {
    setViewGroup(group);
    setSelectedUsers(new Set());
    setUsersLoading(true);
    try {
      const response = await postApi(config.getAllUsersForDropdown, {});
      const allUsers = response?.data || [];

      // Filter to this group, then deduplicate
      const inGroup = allUsers.filter(u => u.groupId === group._id);
      const seen = new Set();
      const unique = inGroup.filter(u => {
        if (seen.has(u._id)) return false;
        seen.add(u._id);
        return true;
      });
      setUsers(unique);
    } catch (err) {
      console.error("Failed to load users:", err);
      setUsers([]);
    } finally {
      setUsersLoading(false);
    }
  }

  function closeViewPopup() {
    setViewGroup(null);
    setUsers([]);
    setSelectedUsers(new Set());
    setSubmitting(false);
    setBulkRemoving(false);
  }

  function toggleAllUsers() {
    const allSelected = users.every(u => selectedUsers.has(u._id));
    if (allSelected) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(users.map(u => u._id)));
    }
  }

  function toggleUser(id) {
    setSelectedUsers(prev => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  }

 async function handleBulkRemove() {
  const chosenUsers = users.filter(u => selectedUsers.has(u._id));
  const label = chosenUsers.length === 1
    ? `"${chosenUsers[0].name || chosenUsers[0].email}"`
    : `${chosenUsers.length} users`;

  if (!window.confirm(`Remove ${label} from "${viewGroup.groupName}"?`)) return;

  try {
    setBulkRemoving(true);
    const results = await Promise.allSettled(
      chosenUsers.map(u =>
        // ✅ was missing return — arrow function with block body needs explicit return
        postApi(config.removeUserFromGroup, {
          data: {
            group: viewGroup._id,
            userId: u._id,
          }
        })
      )
    );

    const removedIds = new Set(
      chosenUsers
        .filter((_, i) =>
          results[i].status === "fulfilled" &&
          (results[i].value?.statusCode === 200 || results[i].value?.statusCode === 201)
        )
        .map(u => u._id)
    );

    if (removedIds.size > 0) {
      // ✅ Update local list immediately
      setUsers(prev => prev.filter(u => !removedIds.has(u._id)));
      setSelectedUsers(prev => {
        const s = new Set(prev);
        removedIds.forEach(id => s.delete(id));
        return s;
      });
    }

    const failed = results.filter(r =>
      r.status === "rejected" ||
      (r.status === "fulfilled" &&
        r.value?.statusCode !== 200 &&
        r.value?.statusCode !== 201)
    ).length;

    if (failed > 0) {
      alert(`${failed} user(s) could not be removed. Please try again.`);
    } else if (removedIds.size > 0) {
      // ✅ Optional: show success feedback
      // You can replace this with a toast if you have one
      console.log(`${removedIds.size} user(s) removed successfully.`);
    }

  } catch (err) {
    console.error("Bulk remove error:", err);
    alert("Something went wrong. Please try again.");
  } finally {
    setBulkRemoving(false);
  }
}

  async function openAddPopup(group) {
    setAddGroup(group);
    setSelectedAddUsers(new Set());
    setAddSearch("");
    setAddUsersLoading(true);
    try {
      const response = await postApi(config.getAllUsersForDropdown, {});
      const raw = response?.data || [];

      const groupMap = {};
      raw.forEach(u => {
        if (u.groupId) {
          if (!groupMap[u._id]) groupMap[u._id] = [];
          if (!groupMap[u._id].includes(u.groupName)) {
            groupMap[u._id].push(u.groupName);
          }
        }
      });

      const seen = new Set();
      const unique = raw
        .filter(u => {
          if (seen.has(u._id)) return false;
          seen.add(u._id);
          return true;
        })
        .map(u => ({ ...u, allGroupNames: groupMap[u._id] || [] }));

      setAllUsersList(unique);
    } catch (err) {
      console.error("Failed to load users for add:", err);
      setAllUsersList([]);
    } finally {
      setAddUsersLoading(false);
    }
  }


  function closeAddPopup() {
    setAddGroup(null);
    setAllUsersList([]);
    setSelectedAddUsers(new Set());
    setAddSubmitting(false);
    setAddSearch("");
  }

  // Filtered list based on search
  const filteredAddUsers = allUsersList.filter(u => {
    const q = addSearch.toLowerCase();
    const name = `${u.name || ""} ${u.lastName || ""}`.toLowerCase();
    return name.includes(q) || (u.email || "").toLowerCase().includes(q);
  });

  const allAddSelected = filteredAddUsers.length > 0 &&
    filteredAddUsers.every(u => selectedAddUsers.has(u._id));

  function toggleAllAddUsers() {
    if (allAddSelected) {
      // Deselect only the filtered ones
      setSelectedAddUsers(prev => {
        const s = new Set(prev);
        filteredAddUsers.forEach(u => s.delete(u._id));
        return s;
      });
    } else {
      // Select all filtered
      setSelectedAddUsers(prev => {
        const s = new Set(prev);
        filteredAddUsers.forEach(u => s.add(u._id));
        return s;
      });
    }
  }

  function toggleAddUser(id) {
    setSelectedAddUsers(prev => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  }

  async function handleAddUsersSubmit() {
    const chosenUsers = allUsersList.filter(u => selectedAddUsers.has(u._id));
    const usersPayload = chosenUsers
      .filter(u => u.email)
      .map(u => ({ userId: u._id, email: u.email }));
    if (usersPayload.length === 0) return;

    try {
      setAddSubmitting(true);
      const response = await postApi(config.addBulkEmailInGroup, {
        group: addGroup._id,
        users: usersPayload,
      });
      if (response?.statusCode === 200 || response?.statusCode === 201) {
        closeAddPopup();
        onAddEmails?.(usersPayload.map(u => u.email));
      } else {
        throw new Error(response?.message || "Submit failed");
      }
    } catch (err) {
      console.error("Error adding users to group:", err);
      alert("Failed to add users. Please try again.");
    } finally {
      setAddSubmitting(false);
    }
  }

  const saveNewRole = async () => {
    setSaving(true);
    try {
      const response = await postApi(config.addGroup, { groupName: newName });
      if (response?.statusCode === 200 || response?.statusCode === 201) {
        setNewName(""); setCreating(false); load();
      } else throw new Error(response?.message || "Save failed");
    } catch (err) {
      console.error("Error saving new role:", err);
    } finally { setSaving(false); }
  };

  const updateRole = async (id) => {
    const groupName = editName.trim();
    if (!groupName) return;
    try {
      setEditSaving(true);
      await postApi(config.updateGroup, { id, groupName });
      load(); setEditingId(null);
    } catch (err) {
      console.error("Error updating group:", err);
    } finally { setEditSaving(false); setEditingId(null); load(); }
  };

  const deleteRole = async (id) => {
    if (!window.confirm("Are you sure you want to delete this group?")) return;
    try {
      setDeletingId(id);
      await postApi(config.deleteGroup, { id });
      load();
    } catch (err) {
      console.error("Error deleting group:", err);
    } finally { load(); setDeletingId(null); }
  };

  function onNewKey(e) {
    if (e.key === "Enter") saveNewRole();
    if (e.key === "Escape") { setCreating(false); setNewName(""); }
  }
  function onEditKey(e, id) {
    if (e.key === "Enter") updateRole(id);
    if (e.key === "Escape") setEditingId(null);
  }

  const allUsersSelected = users.length > 0 && users.every(u => selectedUsers.has(u._id));

  return (
    <>
      <style>{`
        .gm-overlay{position:fixed;inset:0;background:rgba(0,0,0,.65);z-index:999999;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px);}
        .gm-modal{width:600px;height:70vh;background:#fff;border-radius:18px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 28px 80px rgba(0,0,0,.45);}
        .gm-header{padding:16px 20px;background:#0f172a;color:#fff;display:flex;justify-content:space-between;align-items:center;flex-shrink:0;}
        .gm-title{font-size:16px;font-weight:800;letter-spacing:-.2px;}
        .gm-close{border:none;width:30px;height:30px;border-radius:7px;background:rgba(255,255,255,.12);color:#fff;cursor:pointer;font-size:18px;display:flex;align-items:center;justify-content:center;}
        .gm-close:hover{background:rgba(255,255,255,.22);}
        .gm-toolbar{padding:12px 16px;border-bottom:1px solid #f1f5f9;display:flex;gap:8px;align-items:center;background:#f8fafc;flex-shrink:0;}
        .gm-add-btn{border:none;background:#0f172a;color:#fff;padding:8px 14px;border-radius:9px;font-size:13px;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:6px;transition:opacity .15s;}
        .gm-add-btn:hover{opacity:.85;}
        .gm-count{margin-left:auto;font-size:12px;color:#94a3b8;font-weight:600;}
        .gm-new-row{padding:10px 16px;background:#eff6ff;border-bottom:1px solid #dbeafe;display:flex;gap:8px;align-items:center;flex-shrink:0;}
        .gm-new-input{flex:1;border:1.5px solid #93c5fd;border-radius:8px;padding:8px 12px;font-size:14px;outline:none;}
        .gm-new-input:focus{border-color:#3b82f6;box-shadow:0 0 0 3px rgba(59,130,246,.12);}
        .gm-save-btn{border:none;background:#3b82f6;color:#fff;padding:8px 14px;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;}
        .gm-save-btn:disabled{opacity:.5;cursor:not-allowed;}
        .gm-cancel-btn{border:none;background:#e2e8f0;color:#475569;padding:8px 12px;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;}
        .gm-list{flex:1;overflow-y:auto;padding:8px 0;}
        .gm-empty{text-align:center;padding:48px 24px;color:#94a3b8;font-size:14px;}
        .gm-error{text-align:center;padding:32px;color:#ef4444;font-size:13px;display:flex;flex-direction:column;align-items:center;gap:10px;}
        .gm-retry{border:1px solid #fca5a5;background:#fff;color:#ef4444;padding:7px 16px;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;}
        .gm-row{display:flex;align-items:center;padding:10px 16px;gap:10px;border-bottom:1px solid #f8fafc;transition:background .12s;}
        .gm-row:hover{background:#f8fafc;}
        .gm-row.selected{background:#eff6ff;}
        .gm-name{flex:1;font-size:14px;font-weight:600;color:#1e293b;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
        .gm-edit-input{flex:1;border:1.5px solid #93c5fd;border-radius:7px;padding:5px 10px;font-size:14px;font-weight:600;outline:none;min-width:0;}
        .gm-edit-input:focus{border-color:#3b82f6;}
        .gm-actions{display:flex;gap:4px;flex-shrink:0;}
        .gm-icon-btn{border:none;background:transparent;width:30px;height:30px;border-radius:7px;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;transition:background .12s;color:#64748b;}
        .gm-icon-btn:hover{background:#f1f5f9;}
        .gm-icon-btn.danger:hover{background:#fee2e2;color:#ef4444;}
        .gm-icon-btn:disabled{opacity:.4;cursor:not-allowed;}
        @keyframes gm-spin{to{transform:rotate(360deg)}}
        .gm-spinner{width:32px;height:32px;border:3px solid #e2e8f0;border-top-color:#0f172a;border-radius:50%;animation:gm-spin .7s linear infinite;margin:48px auto;}
        .gm-del-confirm{display:flex;align-items:center;gap:6px;font-size:12px;color:#ef4444;font-weight:700;}

        /* ── Shared popup base ── */
        .vu-overlay{position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:1000000;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(3px);}
        .vu-modal{width:900px;height:78vh;background:#fff;border-radius:18px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 28px 80px rgba(0,0,0,.4);}
        .vu-header{padding:15px 20px;background:#0f172a;color:#fff;display:flex;justify-content:space-between;align-items:center;flex-shrink:0;}
        .vu-title{font-size:15px;font-weight:800;}
        .vu-subtitle{font-size:11px;color:#94a3b8;margin-top:2px;}
        .vu-close{border:none;width:30px;height:30px;border-radius:7px;background:rgba(255,255,255,.12);color:#fff;cursor:pointer;font-size:18px;display:flex;align-items:center;justify-content:center;}
        .vu-close:hover{background:rgba(255,255,255,.22);}
        .vu-select-all{padding:10px 16px;background:#f8fafc;border-bottom:1px solid #e2e8f0;display:flex;align-items:center;gap:10px;flex-shrink:0;}
        .vu-select-all label{font-size:13px;font-weight:700;color:#1e293b;cursor:pointer;display:flex;align-items:center;gap:8px;}
        .vu-sel-count{font-size:12px;color:#64748b;font-weight:600;}
        .vu-list{flex:1;overflow-y:auto;}
        .vu-empty{text-align:center;padding:48px 24px;color:#94a3b8;font-size:14px;}
        .vu-footer{padding:14px 16px;border-top:1px solid #e2e8f0;display:flex;justify-content:flex-end;gap:8px;background:#fff;flex-shrink:0;}
        .vu-cancel-btn{border:1px solid #e2e8f0;background:#fff;color:#475569;padding:10px 18px;border-radius:10px;font-weight:700;font-size:13px;cursor:pointer;}
        .vu-submit-btn{border:none;background:#0f172a;color:#fff;padding:10px 22px;border-radius:10px;font-weight:700;font-size:13px;cursor:pointer;transition:opacity .15s;}
        .vu-submit-btn:hover:not(:disabled){opacity:.85;}
        .vu-submit-btn:disabled{opacity:.4;cursor:not-allowed;}

        /* table grid */
        .vu-thead{display:grid;grid-template-columns:48px 40px 1fr 1.4fr 1fr;padding:10px 16px;background:#f1f5f9;border-bottom:2px solid #e2e8f0;font-weight:700;font-size:12px;color:#475569;text-transform:uppercase;letter-spacing:.4px;flex-shrink:0;}
        .vu-row{display:grid;grid-template-columns:48px 40px 1fr 1.4fr 1fr;align-items:center;padding:10px 16px;border-bottom:1px solid #f1f5f9;cursor:pointer;transition:background .12s;font-size:14px;}
        .vu-row:hover{background:#f8fafc;}
        .vu-row.checked{background:#eff6ff;}
        .vu-cell{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}

        /* add popup table (no group col) */
        .au-thead{display:grid;grid-template-columns:48px 40px 1fr 1.4fr;padding:10px 16px;background:#f1f5f9;border-bottom:2px solid #e2e8f0;font-weight:700;font-size:12px;color:#475569;text-transform:uppercase;letter-spacing:.4px;flex-shrink:0;}
        .au-row{display:grid;grid-template-columns:48px 40px 1fr 1.4fr;align-items:center;padding:10px 16px;border-bottom:1px solid #f1f5f9;cursor:pointer;transition:background .12s;font-size:14px;}
        .au-row:hover{background:#f8fafc;}
        .au-row.checked{background:#f0fdf4;}

        /* search bar */
        .au-search{padding:10px 16px;border-bottom:1px solid #e2e8f0;background:#fff;flex-shrink:0;}
        .au-search input{width:100%;border:1.5px solid #e2e8f0;border-radius:9px;padding:8px 12px;font-size:13px;outline:none;box-sizing:border-box;}
        .au-search input:focus{border-color:#3b82f6;box-shadow:0 0 0 3px rgba(59,130,246,.1);}

        /* green submit */
        .au-submit-btn{border:none;background:#16a34a;color:#fff;padding:10px 22px;border-radius:10px;font-weight:700;font-size:13px;cursor:pointer;transition:opacity .15s;}
        .au-submit-btn:hover:not(:disabled){opacity:.85;}
        .au-submit-btn:disabled{opacity:.4;cursor:not-allowed;}
      `}</style>

      {/* ── Main Groups Modal ── */}
      <div className="gm-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="gm-modal">
          <div className="gm-header">
            <span className="gm-title">👥 Manage Groups</span>
            <button className="gm-close" onClick={onClose}>×</button>
          </div>
          <div className="gm-toolbar">
            <button className="gm-add-btn" onClick={() => { setCreating(true); setNewName(""); }}>
              + New Group
            </button>
            <span className="gm-count">{groups.length} group{groups.length !== 1 ? "s" : ""}</span>
          </div>
          {creating && (
            <div className="gm-new-row">
              <input ref={newInputRef} className="gm-new-input" placeholder="Group name…"
                value={newName} onChange={e => setNewName(e.target.value)}
                onKeyDown={onNewKey} maxLength={80} />
              <button className="gm-save-btn" onClick={saveNewRole} disabled={saving || !newName.trim()}>
                {saving ? "…" : "Save"}
              </button>
              <button className="gm-cancel-btn" onClick={() => { setCreating(false); setNewName(""); }}>Cancel</button>
            </div>
          )}
          <div className="gm-list">
            {loading && <div className="gm-spinner" />}
            {!loading && error && (
              <div className="gm-error">{error}
                <button className="gm-retry" onClick={load}>↻ Retry</button>
              </div>
            )}
            {!loading && !error && groups.length === 0 && (
              <div className="gm-empty">No groups yet. Create one above.</div>
            )}
            {!loading && !error && groups.map((group, ind) => (
              <div key={group._id} className={`gm-row${selected.has(group._id) ? " selected" : ""}`}>
                <span style={{ color: "#000" }}>{ind + 1}.</span>
                {editingId === group._id ? (
                  <input ref={editInputRef} className="gm-edit-input" value={editName}
                    onChange={e => setEditName(e.target.value)}
                    onKeyDown={e => onEditKey(e, group._id)} maxLength={80} />
                ) : (
                  <span className="gm-name" title={group.groupName}>{group.groupName}</span>
                )}
                <div className="gm-actions">
                  {editingId === group._id ? (
                    <>
                      <button className="gm-icon-btn" title="Save"
                        onClick={() => updateRole(group._id)} disabled={editSaving || !editName.trim()}>
                        {editSaving ? "…" : "✓"}
                      </button>
                      <button className="gm-icon-btn" title="Cancel" onClick={() => setEditingId(null)}>✕</button>
                    </>
                  ) : deletingId === group._id ? (
                    <span className="gm-del-confirm">⏳</span>
                  ) : (
                    <>
                      {group.status_d === "active" && (
                        <>
                          <button style={{ fontSize: "20px" }} className="gm-icon-btn"
                            title="Add Users to Group" onClick={() => openAddPopup(group)}>
                              ➕
                            </button>

                          <button style={{ fontSize: "12px" }} className="gm-icon-btn"
                            title="Remove Users to group" onClick={() => openViewPopup(group)}>
                              ❌
                              </button>
                        </>
                      )}
                      <button style={{ fontSize: "20px" }} className="gm-icon-btn"
                        title="Rename" onClick={() => { setEditingId(group._id); setEditName(group.groupName); }}>✏️</button>
                      {group.status_d === "active" && (
                        <button style={{ fontSize: "20px" }} className="gm-icon-btn danger"
                          title="Delete" onClick={() => deleteRole(group._id)}>
                          <i className="bi bi-trash text-danger"></i>
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── View / Delete Users Popup ── */}
      {viewGroup && (
        <div className="vu-overlay" onClick={(e) => e.target === e.currentTarget && closeViewPopup()}>
          <div className="vu-modal">
            <div className="vu-header">
              <div>
                <div className="vu-title">👤 Users in {viewGroup.groupName}</div>
                <div className="vu-subtitle">Select users to remove from this group</div>
              </div>
              <button className="vu-close" onClick={closeViewPopup}>×</button>
            </div>

            {!usersLoading && users.length > 0 && (
              <div style={{ flexShrink: 0 }}>
                <div className="vu-select-all">
                  <label>
                    <input type="checkbox" checked={allUsersSelected} onChange={toggleAllUsers}
                      style={{ width: 17, height: 17, accentColor: "#0f172a", cursor: "pointer" }} />
                    Select All
                  </label>
                  <span className="vu-sel-count">{selectedUsers.size} / {users.length} selected</span>
                </div>
                <div className="vu-thead">
                  <span>#</span>
                  <span></span>
                  <span>Name</span>
                  <span>Email</span>
                  <span>Group Name</span>
                </div>
              </div>
            )}

            <div className="vu-list">
              {usersLoading && <div className="gm-spinner" />}
              {!usersLoading && users.length === 0 && (
                <div className="vu-empty">No users in this group.</div>
              )}
              {!usersLoading && users.map((user, idx) => {
                const isChecked = selectedUsers.has(user._id);
                return (
                  <div key={user._id} className={`vu-row${isChecked ? " checked" : ""}`}
                    onClick={() => toggleUser(user._id)}>
                    <span className="vu-cell" style={{ color: "#94a3b8", fontWeight: 600, fontSize: 13 }}>{idx + 1}</span>
                    <input type="checkbox" checked={isChecked} onChange={() => toggleUser(user._id)}
                      onClick={e => e.stopPropagation()}
                      style={{ width: 17, height: 17, accentColor: "#0f172a", cursor: "pointer" }} />
                    <span className="vu-cell" style={{ fontWeight: 600, color: "#1e293b" }}>
                      {`${user.name || ""} ${user.lastName || ""}`.trim() || "—"}
                    </span>
                    <span className="vu-cell" style={{ color: "#64748b" }}>{user.email || "—"}</span>
                    <span className="vu-cell" style={{ color: "#64748b" }}>{user.groupName || "—"}</span>
                  </div>
                );
              })}
            </div>

            <div className="vu-footer">
              <button className="vu-cancel-btn" onClick={closeViewPopup}>Cancel</button>
              {selectedUsers.size > 0 && (
                <button onClick={handleBulkRemove} disabled={bulkRemoving}
                  style={{
                    border: "none", background: "#ef4444", color: "#fff",
                    padding: "10px 18px", borderRadius: "10px", fontSize: 13,
                    fontWeight: 700, cursor: "pointer", display: "flex",
                    alignItems: "center", gap: 6, opacity: bulkRemoving ? 0.5 : 1,
                  }}>
                  <i className="bi bi-trash"></i>
                  {bulkRemoving ? "Removing…" : `Remove (${selectedUsers.size}) from ${viewGroup.groupName}`}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {addGroup && (
        <div className="vu-overlay" onClick={(e) => e.target === e.currentTarget && closeAddPopup()}>
          <div className="vu-modal">
            <div className="vu-header" style={{ background: "#15803d" }}>
              <div>
                <div className="vu-title">➕ Add Users to {addGroup.groupName}</div>
                <div className="vu-subtitle">Select users to add to this group</div>
              </div>
              <button className="vu-close" onClick={closeAddPopup}>×</button>
            </div>
            <div className="au-search">
              <input
                placeholder="🔍 Search by name or email…"
                value={addSearch}
                onChange={e => setAddSearch(e.target.value)}
              />
            </div>
            {!addUsersLoading && filteredAddUsers.length > 0 && (
              <div style={{ flexShrink: 0 }}>
                <div className="vu-select-all">
                  <label>
                    <input type="checkbox" checked={allAddSelected} onChange={toggleAllAddUsers}
                      style={{ width: 17, height: 17, accentColor: "#15803d", cursor: "pointer" }} />
                    Select All
                  </label>
                  <span className="vu-sel-count">
                    {selectedAddUsers.size} / {allUsersList.length} selected
                  </span>
                </div>
                <div className="au-thead" style={{ gridTemplateColumns: "48px 40px 1fr 1.4fr 1fr" }}>
                  <span>#</span>
                  <span></span>
                  <span>Name</span>
                  <span>Email</span>
                  <span>In Groups</span>
                </div>
              </div>
            )}
            <div className="vu-list">
              {addUsersLoading && <div className="gm-spinner" />}
              {!addUsersLoading && filteredAddUsers.length === 0 && (
                <div className="vu-empty">
                  {addSearch ? "No users match your search." : "No users available."}
                </div>
              )}
              {!addUsersLoading && filteredAddUsers.map((user, idx) => {
                const isChecked = selectedAddUsers.has(user._id);
                const alreadyInThisGroup =
                  user.allGroupNames?.some(n => n === addGroup.groupName) ||
                  user.groupId === addGroup._id;
                const fullName = `${user.name || ""} ${user.lastName || ""}`.trim() || "—";

                return (
                  <div
                    key={user._id}
                    className={`au-row${isChecked ? " checked" : ""}`}
                    style={{
                      gridTemplateColumns: "48px 40px 1fr 1.4fr 1fr",
                      opacity: alreadyInThisGroup ? 0.5 : 1,
                      cursor: alreadyInThisGroup ? "default" : "pointer",
                    }}
                    onClick={() => !alreadyInThisGroup && toggleAddUser(user._id)}
                  >
                    <span style={{ color: "#94a3b8", fontWeight: 600, fontSize: 13 }}>{idx + 1}</span>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      disabled={alreadyInThisGroup}
                      onChange={() => toggleAddUser(user._id)}
                      onClick={e => e.stopPropagation()}
                      style={{
                        width: 17, height: 17,
                        accentColor: "#15803d",
                        cursor: alreadyInThisGroup ? "not-allowed" : "pointer",
                      }}
                    />
                    <span style={{ fontWeight: 600, color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {fullName}
                    </span>
                    <span style={{ color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {user.email || "—"}
                    </span>
                    <span style={{ fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {user.allGroupNames?.length > 0
                        ? user.allGroupNames.map((g, i) => (
                          <span key={i} style={{
                            background: "#e0f2fe", color: "#0369a1",
                            borderRadius: 4, padding: "1px 6px", marginRight: 3, fontSize: 11,
                          }}>{g}</span>
                        ))
                        : <span style={{ color: "#cbd5e1" }}>—</span>
                      }
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="vu-footer">
              <button className="vu-cancel-btn" onClick={closeAddPopup}>Cancel</button>
              <button
                className="au-submit-btn"
                disabled={selectedAddUsers.size === 0 || addSubmitting}
                onClick={handleAddUsersSubmit}
              >
                {addSubmitting
                  ? "Adding…"
                  : `Add ${selectedAddUsers.size} user${selectedAddUsers.size !== 1 ? "s" : ""} to "${addGroup.groupName}"`}
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}