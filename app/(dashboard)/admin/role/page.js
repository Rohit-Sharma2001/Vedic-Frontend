'use client'
import { useEffect, useState, useCallback } from 'react';
import { postApi } from 'services/api';
import { config } from 'services/config';
import Swal from 'sweetalert2';

export default function RoleManagement() {
    const [roles, setRoles] = useState([]);
    // parentModules: array of { moduleId, moduleName, children: [...] }
    const [parentModules, setParentModules] = useState([]);
    const [permissions, setPermissions] = useState({});
    const [originalPermissions, setOriginalPermissions] = useState({});
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [showRolePopup, setShowRolePopup] = useState(false);
    const [newRoleName, setNewRoleName] = useState('');
    const [showManageRoles, setShowManageRoles] = useState(false);
// const [newRoleName, setNewRoleName] = useState('');
const [editingRoleId, setEditingRoleId] = useState(null);
const [editingRoleName, setEditingRoleName] = useState('');

    // ── Load data ─────────────────────────────────────────────────────────────
    // ── Load data ─────────────────────────────────────────────────────────────
const loadAll = useCallback(async () => {

    setLoading(true);
    setError(null);

    try {

        // Base64 Payload
        const payload = {
            data: btoa(JSON.stringify({}))
        };

        const [rolesRes, modulesRes] = await Promise.all([

            postApi(
                config.roleNameList,
                payload
            ),

            postApi(
                config.getAllModules,
                payload
            ),

        ]);

        const rolesData =
            rolesRes?.data || [];

        const modulesData =
            modulesRes?.data || [];

        setRoles(rolesData);

        setParentModules(modulesData);

        // Permissions Map
        const permsMap = {};

        rolesData.forEach(role => {

            permsMap[role._id] =
                new Set(
                    role.roleModuleIds || []
                );

        });

        setPermissions(permsMap);

        // Original Permissions
        const orig = {};

        rolesData.forEach(role => {

            orig[role._id] =
                new Set(
                    role.roleModuleIds || []
                );

        });

        setOriginalPermissions(orig);

    } catch (err) {

        setError(
            err.message ||
            'Failed to load data.'
        );

    } finally {

        setLoading(false);

    }

}, []);

    useEffect(() => { loadAll(); }, [loadAll]);

    // ── Helpers: flat ordered column list ─────────────────────────────────────
    // Each entry: { moduleId, moduleName, isParent, hasChildren }
    const orderedColumns = [];
    parentModules.forEach(p => {
        const hasChildren = p.children && p.children.length > 0;
        orderedColumns.push({ moduleId: p.moduleId, moduleName: p.moduleName, isParent: true, hasChildren });
        if (hasChildren) {
            p.children.forEach(c => {
                orderedColumns.push({ moduleId: c.moduleId, moduleName: c.moduleName, isParent: false, hasChildren: false });
            });
        }
    });

    const allColumnIds = orderedColumns.map(m => m.moduleId);

    // ── Toggle single permission ──────────────────────────────────────────────
    const togglePermission = (roleId, moduleId) => {
        setPermissions(prev => {
            const next = { ...prev };
            const set = new Set(next[roleId]);
            set.has(moduleId) ? set.delete(moduleId) : set.add(moduleId);
            next[roleId] = set;
            return next;
        });
    };

    // ── Toggle all modules for a role (row) ───────────────────────────────────
    const toggleRow = (roleId) => {
        setPermissions(prev => {
            const next = { ...prev };
            const set = new Set(next[roleId]);
            const allChecked = allColumnIds.every(id => set.has(id));
            if (allChecked) {
                allColumnIds.forEach(id => set.delete(id));
            } else {
                allColumnIds.forEach(id => set.add(id));
            }
            next[roleId] = set;
            return next;
        });
    };

    // ── Toggle one module column across all roles ─────────────────────────────
    const toggleColumn = (moduleId) => {
        setPermissions(prev => {
            const next = { ...prev };
            const allChecked = roles.every(r => next[r._id]?.has(moduleId));
            roles.forEach(r => {
                const set = new Set(next[r._id]);
                allChecked ? set.delete(moduleId) : set.add(moduleId);
                next[r._id] = set;
            });
            return next;
        });
    };

    // ── Toggle all children of a parent (+ the parent itself) ─────────────────
    const toggleParentGroup = (roleId, parent) => {
        setPermissions(prev => {
            const next = { ...prev };
            const set = new Set(next[roleId]);
            const ids = [parent.moduleId, ...(parent.children || []).map(c => c.moduleId)];
            const allChecked = ids.every(id => set.has(id));
            if (allChecked) {
                ids.forEach(id => set.delete(id));
            } else {
                ids.forEach(id => set.add(id));
            }
            next[roleId] = set;
            return next;
        });
    };

    // ── Save ──────────────────────────────────────────────────────────────────
    const handleSave = async () => {
        setSaving(true);
        try {
            const payload = roles.map(role => ({
                roleId: role._id,
                roleModuleIds: Array.from(permissions[role._id] || []),
            }));

            const response = await postApi(config.assignRoleModule, { data: payload });

            if (response?.statusCode === 200 || response?.statusCode === 201) {
                const orig = {};
                roles.forEach(r => { orig[r._id] = new Set(permissions[r._id]); });
                setOriginalPermissions(orig);
                Swal.fire({ icon: 'success', title: 'Saved!', text: 'Role permissions updated.', confirmButtonColor: '#374151' });
            } else {
                throw new Error(response?.message || 'Save failed');
            }
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Error', text: err.message, confirmButtonColor: '#dc2626' });
        } finally {
            setSaving(false);
        }
    };

    // ── Add new role ──────────────────────────────────────────────────────────
    const saveNewRole = async () => {
        if (!newRoleName.trim()) return;
        setSaving(true);
        try {
            const response = await postApi(config.addRole, { roleName: newRoleName });
            if (response?.statusCode === 200 || response?.statusCode === 201) {
                setShowRolePopup(false);
                setNewRoleName('');
                loadAll();
            } else {
                throw new Error(response?.message || 'Save failed');
            }
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Error', text: err.message, confirmButtonColor: '#dc2626' });
        } finally {
            setSaving(false);
        }
    };

    // ── Discard ───────────────────────────────────────────────────────────────
    const handleDiscard = () => {
        const restored = {};
        roles.forEach(r => { restored[r._id] = new Set(originalPermissions[r._id]); });
        setPermissions(restored);
    };

    // ── Dirty check ───────────────────────────────────────────────────────────
    const isDirty = roles.some(r => {
        const curr = permissions[r._id] || new Set();
        const orig = originalPermissions[r._id] || new Set();
        if (curr.size !== orig.size) return true;
        for (const id of curr) if (!orig.has(id)) return true;
        return false;
    });

    // ── Stat helpers ──────────────────────────────────────────────────────────
    const isChecked = (roleId, moduleId) => !!(permissions[roleId]?.has(moduleId));
    const checkedCountForRole = (roleId) => permissions[roleId]?.size || 0;
    const checkedCountForModule = (moduleId) => roles.filter(r => permissions[r._id]?.has(moduleId)).length;
    const totalChecked = roles.reduce((sum, r) => sum + (permissions[r._id]?.size || 0), 0);

    // ── Column span per parent ────────────────────────────────────────────────
    // A lone parent (no children) spans 1; a parent with children spans children.length
    const colSpanFor = (parent) => {
        const n = parent.children?.length || 0;
        return n > 0 ? n : 1;
    };

    const deleteRole = async (roleId) => {
    const confirm = window?.confirm("Are you sure to delete this role")
    if (!confirm) return;
    setSaving(true);
    try {
        // const response = await postApi(config.deleteRole, { data: btoa(JSON.stringify({ roleId })) });
        const response = await postApi(`${config.deleteRole}/${roleId}`);
        if (response?.statusCode === 200 || response?.statusCode === 201) loadAll();
        else throw new Error(response?.message || 'Delete failed');
    } catch (err) {
        // Swal.fire({ icon: 'error', title: 'Error', text: err.message, confirmButtonColor: '#dc2626' });
        window.alert(err.message || "Something went wrong")
    } finally { setSaving(false); }
};

const saveEditRole = async (roleId) => {
    if (!editingRoleName.trim()) return;
    setSaving(true);
    try {
        // const response = await postApi(config.updateRole, { roleId, roleName: editingRoleName });
        const response = await postApi(`${config.updateRole}/${roleId}`,{roleName: editingRoleName});
        if (response?.statusCode === 200 || response?.statusCode === 201) {
            setEditingRoleId(null);
            loadAll();
        } else throw new Error(response?.message || 'Update failed');
    } catch (err) {
        // Swal.fire({ icon: 'error', title: 'Error', text: err.message, confirmButtonColor: '#dc2626' });
        window.alert(err.message || "Soemthing went wrong")
    } finally { setSaving(false); }
};

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');

        .rm-root {
          min-height: 100vh;
          background: #f7f8fc;
          font-family: 'Plus Jakarta Sans', sans-serif;
          color: #111827;
          padding: 28px 24px;
        }

        /* ── Header ─────────────────────────────── */
        .rm-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 14px;
          margin-bottom: 22px;
        }
        .rm-title { font-size: 1.35rem; font-weight: 700; color: #111827; letter-spacing: -0.01em; }
        .rm-actions { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }

        /* ── Buttons ─────────────────────────────── */
        .btn {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 0.82rem;
          font-weight: 600;
          padding: 8px 16px;
          border-radius: 7px;
          border: none;
          cursor: pointer;
          transition: all 0.14s;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .btn:disabled { opacity: 0.38; cursor: not-allowed; }
        .btn-primary { background: #111827; color: #fff; }
        .btn-primary:hover:not(:disabled) { background: #1f2937; }
        .btn-success { background: #111827; color: #fff; }
        .btn-success:hover:not(:disabled) { background: #1f2937; }
        .btn-discard { background: #fff; color: #374151; border: 1px solid #d1d5db; }
        .btn-discard:hover:not(:disabled) { background: #f9fafb; }

        .unsaved-badge {
          font-size: 0.73rem; font-weight: 600;
          color: #92400e; background: #fef3c7; border: 1px solid #fcd34d;
          padding: 4px 11px; border-radius: 20px;
        }

        /* ── Stat pills ──────────────────────────── */
        .rm-stats { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 20px; }
        .stat-pill {
          background: #fff; border: 1px solid #e5e7eb;
          border-radius: 8px; padding: 9px 16px;
          display: flex; align-items: center; gap: 8px;
        }
        .stat-dot { width: 7px; height: 7px; border-radius: 50%; }
        .dot-dark { background: #374151; }
        .dot-green { background: #10b981; }
        .stat-text { font-size: 0.8rem; color: #374151; font-weight: 500; }
        .stat-num { font-weight: 700; color: #111827; }

        /* ── Card + scroll ───────────────────────── */
        .rm-card {
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          overflow: hidden;
        }
        .rm-scroll { overflow-x: auto; max-height: calc(100vh - 240px); overflow-y: auto; }

        /* ── Table ───────────────────────────────── */
        .rm-table { width: 100%; border-collapse: collapse; font-size: 0.8rem; }
        .rm-table thead { position: sticky; top: 0; z-index: 20; }

        /* ── ROW 1: Role label corner + parent group headers ─── */
        .rm-table thead tr.group-row { background: #f9fafb; }

        .th-corner-role {
          position: sticky; left: 0; z-index: 30;
          background: #f9fafb;
          border-right: 2px solid #e5e7eb;
          border-bottom: 1px solid #e5e7eb;
          min-width: 220px; padding: 10px 16px;
          font-size: 0.7rem; font-weight: 700; color: #6b7280;
          text-transform: uppercase; letter-spacing: 0.07em;
          vertical-align: middle;
        }

        /* Parent header with children → indigo tint */
        .th-parent-group {
          background: #eef2ff;
          border-left: 1px solid #c7d2fe;
          border-right: 1px solid #c7d2fe;
          border-bottom: 2px solid #6366f1;
          padding: 8px 6px 6px;
          text-align: center;
          font-size: 0.72rem; font-weight: 700; color: #4338ca;
          letter-spacing: 0.01em;
          white-space: nowrap;
        }
        /* Lone parent (no children) → neutral */
        .th-parent-lone {
          background: #f9fafb;
          border-left: 1px solid #e5e7eb;
          border-right: 1px solid #e5e7eb;
          border-bottom: 1px solid #e5e7eb;
          padding: 8px 4px 6px;
          text-align: center;
          font-size: 0.7rem; font-weight: 600; color: #6b7280;
          white-space: nowrap;
        }

        /* ── ROW 2: Module name sub-headers ─────── */
        .rm-table thead tr.mod-row {
          background: #fff;
          border-bottom: 2px solid #e5e7eb;
        }

        .th-corner-mod {
          position: sticky; left: 0; z-index: 30;
          background: #fff;
          border-right: 2px solid #e5e7eb;
          border-bottom: 2px solid #e5e7eb;
          padding: 8px 16px;
          font-size: 0.7rem; font-weight: 700; color: #6b7280;
          text-transform: uppercase; letter-spacing: 0.07em;
          vertical-align: middle;
        }

        .th-mod-cell {
          min-width: 100px;
          border-right: 1px solid #f3f4f6;
          border-bottom: 2px solid #e5e7eb;
          padding: 0;
          vertical-align: top;
        }
        /* child column inside a parent group */
        .th-mod-cell.is-child {
          border-right: 1px solid #e0e7ff;
        }
        .th-mod-cell.is-child:last-of-type {
          border-right: 1px solid #c7d2fe;
        }
        /* lone parent column */
        .th-mod-cell.is-lone {
          border-right: 1px solid #e5e7eb;
        }

        .th-mod-btn {
          width: 100%; background: none; border: none; cursor: pointer;
          display: flex; flex-direction: column; align-items: center; gap: 4px;
          padding: 8px 4px 6px; transition: background 0.13s;
        }
        .th-mod-btn:hover { background: #f9fafb; }

        .th-mod-name {
          font-size: 0.7rem; font-weight: 600; color: #374151;
          text-align: center; line-height: 1.35; word-break: break-word;
          max-width: 88px;
        }
        /* child module name */
        .th-mod-name.child-name { color: #4338ca; font-weight: 500; }
        /* lone parent module name */
        .th-mod-name.lone-name { color: #374151; }

        .th-mod-count {
          font-size: 0.65rem; color: #9ca3af;
          background: #f3f4f6; padding: 1px 7px; border-radius: 10px; font-weight: 500;
        }

        /* ── Body rows ───────────────────────────── */
        .rm-table tbody tr {
          border-bottom: 1px solid #f3f4f6;
          transition: background 0.11s;
        }
        .rm-table tbody tr:last-child { border-bottom: none; }
        .rm-table tbody tr:hover { background: #fafafa; }

        /* Sticky role column */
        .td-role {
          position: sticky; left: 0; z-index: 5;
          background: #fff;
          border-right: 2px solid #e5e7eb;
          padding: 0;
        }
        .rm-table tbody tr:hover .td-role { background: #fafafa; }

        .role-btn {
          width: 100%; background: none; border: none; cursor: pointer;
          display: flex; align-items: center; gap: 10px;
          padding: 10px 16px; text-align: left; transition: background 0.12s;
        }
        .role-btn:hover { background: #f3f4f6; }

        .role-avatar {
          width: 32px; height: 32px; border-radius: 8px;
          background: #f3f4f6; border: 1px solid #e5e7eb;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.75rem; font-weight: 700; color: #374151; flex-shrink: 0;
        }
        .role-name { font-size: 0.83rem; font-weight: 600; color: #111827; white-space: nowrap; }
        .role-sub { font-size: 0.7rem; color: #9ca3af; margin-top: 1px; }
        .role-bar { width: 72px; height: 3px; background: #f3f4f6; border-radius: 10px; margin-top: 3px; overflow: hidden; }
        .role-bar-fill { height: 100%; background: #10b981; border-radius: 10px; transition: width 0.25s; }

        /* Perm cells */
        .td-perm {
          text-align: center;
          padding: 10px 6px;
          border-right: 1px solid #f3f4f6;
          vertical-align: middle;
        }
        .td-perm.td-child { background: rgba(238,242,255,0.25); border-right: 1px solid #e0e7ff; }
        .td-perm.td-lone { border-right: 1px solid #f3f4f6; }

        /* Checkbox */
        .perm-cb {
          appearance: none; -webkit-appearance: none;
          width: 16px; height: 16px; border-radius: 4px;
          border: 1.5px solid #d1d5db; background: #fff;
          cursor: pointer; position: relative; transition: all 0.13s;
          display: inline-block; vertical-align: middle;
        }
        .perm-cb:checked { background: #4338ca; border-color: #4338ca; }
        .perm-cb:checked::after {
          content: ''; position: absolute;
          top: 1px; left: 5px;
          width: 4px; height: 8px;
          border: 1.5px solid #fff; border-top: none; border-left: none;
          transform: rotate(45deg);
        }
        .perm-cb:hover:not(:checked) { border-color: #9ca3af; background: #f9fafb; }

        /* ── Loader / Error ──────────────────────── */
        .rm-center {
          display: flex; flex-direction: column; align-items: center;
          justify-content: center; min-height: 50vh; gap: 12px;
        }
        .spinner {
          width: 32px; height: 32px;
          border: 3px solid #e5e7eb; border-top-color: #4338ca;
          border-radius: 50%; animation: spin 0.75s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin-lbl { font-size: 0.83rem; color: #6b7280; font-weight: 500; }
        .err-box {
          background: #fff; border: 1px solid #fecaca; border-radius: 12px;
          padding: 28px 36px; text-align: center; max-width: 340px;
        }
        .err-msg { font-size: 0.83rem; color: #6b7280; margin-bottom: 14px; }
        .rm-empty { padding: 60px; text-align: center; color: #9ca3af; font-size: 0.83rem; }

        /* Saving overlay */
        .saving-overlay {
          position: fixed; inset: 0;
          background: rgba(255,255,255,0.72); backdrop-filter: blur(3px);
          display: flex; align-items: center; justify-content: center; z-index: 9999;
        }
        .saving-card {
          background: #fff; border: 1px solid #e5e7eb; border-radius: 12px;
          padding: 26px 40px; display: flex; flex-direction: column;
          align-items: center; gap: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        }
        .saving-lbl { font-size: 0.85rem; font-weight: 600; color: #374151; }

        /* ── Popup ───────────────────────────────── */
        .popup-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.35);
          display: flex; align-items: center; justify-content: center;
          z-index: 99999; backdrop-filter: blur(2px);
        }
        .popup-card {
          width: 400px; background: #fff; border-radius: 12px;
          padding: 22px; border: 1px solid #e5e7eb;
          box-shadow: 0 10px 30px rgba(0,0,0,0.12);
          animation: popupShow 0.18s ease;
        }
        @keyframes popupShow {
          from { opacity: 0; transform: scale(0.95); }
          to   { opacity: 1; transform: scale(1); }
        }
        .popup-title { font-size: 1rem; font-weight: 700; margin-bottom: 14px; color: #111827; }
        .popup-input {
          width: 100%; padding: 10px 12px;
          border: 1px solid #d1d5db; border-radius: 8px;
          outline: none; font-size: 0.84rem;
          font-family: 'Plus Jakarta Sans', sans-serif;
          margin-bottom: 16px; box-sizing: border-box;
        }
        .popup-input:focus { border-color: #4338ca; }
        .popup-actions { display: flex; justify-content: flex-end; gap: 10px; }
      `}</style>

            <div className="rm-root">

                {saving && (
                    <div className="saving-overlay">
                        <div className="saving-card">
                            <div className="spinner" />
                            <span className="saving-lbl">Saving…</span>
                        </div>
                    </div>
                )}

                {/* ── Header ───────────────────────────────────────────────── */}
                <div className="rm-header">
                    <div>
                        <h1 className="rm-title">Role Management</h1>
                    </div>
                    <div className="rm-actions">
                        <button className="btn btn-primary" onClick={() => {  setShowManageRoles(true);
    setNewRoleName('');
    setEditingRoleId(null);
    setEditingRoleName('')}}>
    <i className="ti ti-settings" /> Manage Roles
</button>
                        {isDirty && <span className="unsaved-badge">● Unsaved changes</span>}
                        <button className="btn btn-discard" onClick={handleDiscard} disabled={!isDirty || saving}>
                            Discard
                        </button>
                        <button className="btn btn-success" onClick={handleSave} disabled={!isDirty || saving}>
                            Save Changes
                        </button>
                    </div>
                </div>

                {/* ── Loading ───────────────────────────────────────────────── */}
                {loading && (
                    <div className="rm-center">
                        <div className="spinner" />
                        <span className="spin-lbl">Loading roles &amp; modules…</span>
                    </div>
                )}

                {/* ── Error ─────────────────────────────────────────────────── */}
                {!loading && error && (
                    <div className="rm-center">
                        <div className="err-box">
                            <p style={{ fontSize: '1.6rem', marginBottom: 8 }}>⚠️</p>
                            <p className="err-msg">{error}</p>
                            <button className="btn btn-primary" onClick={loadAll}>Retry</button>
                        </div>
                    </div>
                )}

                {/* ── Main content ──────────────────────────────────────────── */}
                {!loading && !error && (
                    <>
                        {/* Stats */}
                        <div className="rm-stats">
                            <div className="stat-pill">
                                <div className="stat-dot dot-dark" />
                                <span className="stat-text"><span className="stat-num">{roles.length}</span> Roles</span>
                            </div>
                            <div className="stat-pill">
                                <div className="stat-dot dot-dark" />
                                <span className="stat-text"><span className="stat-num">{parentModules.length}</span> Module Groups</span>
                            </div>
                            <div className="stat-pill">
                                <div className="stat-dot dot-dark" />
                                <span className="stat-text"><span className="stat-num">{orderedColumns.length}</span> Total Columns</span>
                            </div>
                            <div className="stat-pill">
                                <div className="stat-dot dot-green" />
                                <span className="stat-text"><span className="stat-num">{totalChecked}</span> Active Permissions</span>
                            </div>
                        </div>

                        <div className="rm-card">
                            {roles.length === 0 || parentModules.length === 0 ? (
                                <div className="rm-empty">No roles or modules found.</div>
                            ) : (
                                <div className="rm-scroll">
                                    <table className="rm-table">
                                        <thead>
                                            {/* ── ROW 1: Parent group headers ───────────────── */}
                                            <tr className="group-row">
                                                <th className="th-corner-role" rowSpan={2}>
                                                    Role / Module
                                                </th>
                                                {parentModules.map(parent => {
                                                    const hasChildren = parent.children?.length > 0;
                                                    const span = hasChildren ? parent.children.length : 1;
                                                    return (
                                                        <th
                                                            key={`grp-${parent.moduleId}`}
                                                            colSpan={span}
                                                            className={hasChildren ? 'th-parent-group' : 'th-parent-lone'}
                                                        >
                                                            {parent.moduleName}
                                                        </th>
                                                    );
                                                })}
                                            </tr>

                                            {/* ── ROW 2: Individual module (child) names ────── */}
                                            <tr className="mod-row">
                                                {/* th-corner-role already occupies this cell via rowSpan=2 */}
                                                {parentModules.map(parent => {
                                                    const hasChildren = parent.children?.length > 0;

                                                    if (hasChildren) {
                                                        // Render child columns only
                                                        return parent.children.map((child, idx) => (
                                                            <th
                                                                key={child.moduleId}
                                                                className="th-mod-cell is-child"
                                                                style={idx === parent.children.length - 1 ? { borderRight: '1px solid #c7d2fe' } : {}}
                                                            >
                                                                <button
                                                                    className="th-mod-btn"
                                                                    onClick={() => toggleColumn(child.moduleId)}
                                                                    title={`Toggle all roles for: ${child.moduleName}`}
                                                                >
                                                                    <span className="th-mod-name child-name">{child.moduleName}</span>
                                                                    <span className="th-mod-count">
                                                                        {checkedCountForModule(child.moduleId)}/{roles.length}
                                                                    </span>
                                                                </button>
                                                            </th>
                                                        ));
                                                    } else {
                                                        // Lone parent: render its own cell
                                                        return (
                                                            <th
                                                                key={parent.moduleId}
                                                                className="th-mod-cell is-lone"
                                                            >
                                                                <button
                                                                    className="th-mod-btn"
                                                                    onClick={() => toggleColumn(parent.moduleId)}
                                                                    title={`Toggle all roles for: ${parent.moduleName}`}
                                                                >
                                                                    <span className="th-mod-name lone-name">—</span>
                                                                    <span className="th-mod-count">
                                                                        {checkedCountForModule(parent.moduleId)}/{roles.length}
                                                                    </span>
                                                                </button>
                                                            </th>
                                                        );
                                                    }
                                                })}
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {roles.map(role => {
                                                const checked = checkedCountForRole(role._id);
                                                const pct = orderedColumns.length > 0
                                                    ? (checked / orderedColumns.length) * 100
                                                    : 0;
                                                return (
                                                    <tr key={role._id}>
                                                        {/* Role label cell */}
                                                        <td className="td-role">
                                                            <button
                                                                className="role-btn"
                                                                onClick={() => toggleRow(role._id)}
                                                                title={`Toggle all modules for: ${role.roleName}`}
                                                            >
                                                                <div className="role-avatar">
                                                                    {role.roleName?.[0]?.toUpperCase() || 'R'}
                                                                </div>
                                                                <div>
                                                                    <div className="role-name">{role.roleName}</div>
                                                                    <div className="role-sub">{checked} / {orderedColumns.length} permissions</div>
                                                                    <div className="role-bar">
                                                                        <div className="role-bar-fill" style={{ width: `${pct}%` }} />
                                                                    </div>
                                                                </div>
                                                            </button>
                                                        </td>

                                                        {/* Checkbox cells — iterate parents → children */}
                                                        {parentModules.map(parent => {
                                                            const hasChildren = parent.children?.length > 0;

                                                            if (hasChildren) {
                                                                return parent.children.map((child, idx) => (
                                                                    <td
                                                                        key={child.moduleId}
                                                                        className="td-perm td-child"
                                                                        style={idx === parent.children.length - 1 ? { borderRight: '1px solid #c7d2fe' } : {}}
                                                                    >
                                                                        <input
                                                                            type="checkbox"
                                                                            className="perm-cb"
                                                                            checked={isChecked(role._id, child.moduleId)}
                                                                            onChange={() => togglePermission(role._id, child.moduleId)}
                                                                            aria-label={`${role.roleName} — ${child.moduleName}`}
                                                                        />
                                                                    </td>
                                                                ));
                                                            } else {
                                                                return (
                                                                    <td
                                                                        key={parent.moduleId}
                                                                        className="td-perm td-lone"
                                                                    >
                                                                        <input
                                                                            type="checkbox"
                                                                            className="perm-cb"
                                                                            checked={isChecked(role._id, parent.moduleId)}
                                                                            onChange={() => togglePermission(role._id, parent.moduleId)}
                                                                            aria-label={`${role.roleName} — ${parent.moduleName}`}
                                                                        />
                                                                    </td>
                                                                );
                                                            }
                                                        })}
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* ── Add Role Popup ────────────────────────────────────────── */}
                {showManageRoles && (
                    <div className="popup-overlay" onClick={(e) => e.target === e.currentTarget && setShowManageRoles(false)}>
                        <div className="popup-card" style={{ width: 480 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                                <h3 className="popup-title" style={{ margin: 0 }}>Manage roles</h3>
                                <button className="btn btn-discard" style={{ padding: '4px 10px' }}
                                    onClick={() => {
                                        setShowManageRoles(false);
                                        setNewRoleName('');
                                        setEditingRoleId(null);
                                        setEditingRoleName('');
                                    }}
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Add new role */}
                            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                                <input
                                    type="text"
                                    placeholder="New role name…"
                                    value={newRoleName}
                                    onChange={(e) => setNewRoleName(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && saveNewRole()}
                                    className="popup-input"
                                    style={{ margin: 0, flex: 1 }}
                                />
                                <button className="btn btn-success" onClick={saveNewRole}
                                    disabled={!newRoleName.trim() || saving}>
                                    + Add
                                </button>
                            </div>

                            {/* Role list */}
                            <div style={{ maxHeight: 340, overflowY: 'auto', border: '1px solid #e5e7eb', borderRadius: 8 }}>
                                {roles.length === 0 && (
                                    <div style={{ padding: 24, textAlign: 'center', color: '#9ca3af', fontSize: '0.83rem' }}>
                                        No roles found.
                                    </div>
                                )}
                                {roles.map((role, idx) => (
                                    <div key={role._id} style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        padding: '10px 14px',
                                        borderBottom: idx < roles.length - 1 ? '1px solid #f3f4f6' : 'none',
                                        background: editingRoleId === role._id ? '#f9fafb' : '#fff'
                                    }}>
                                        {editingRoleId === role._id ? (
                                            <>
                                                <input
                                                    type="text"
                                                    value={editingRoleName}
                                                    onChange={(e) => setEditingRoleName(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && saveEditRole(role._id)}
                                                    className="popup-input"
                                                    style={{ margin: 0, flex: 1, marginRight: 8 }}
                                                    autoFocus
                                                />
                                                <div style={{ display: 'flex', gap: 6 }}>
                                                    <button className="btn btn-success" style={{ padding: '5px 12px', fontSize: '0.78rem' }}
                                                        onClick={() => saveEditRole(role._id)} disabled={!editingRoleName.trim() || saving}>
                                                        Save
                                                    </button>
                                                    <button className="btn btn-discard" style={{ padding: '5px 12px', fontSize: '0.78rem' }}
                                                        onClick={() => setEditingRoleId(null)}>
                                                        Cancel
                                                    </button>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                    <div className="role-avatar">{idx+1|| 0}</div>
                                                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#111827' }}>
                                                        {role.roleName}
                                                    </span>
                                                </div>
                                                <div style={{ display: 'flex', gap: 6 }}>
                                                    <button className="btn btn-discard" style={{ padding: '5px 12px', fontSize: '0.78rem' }}
                                                        onClick={() => { setEditingRoleId(role._id); setEditingRoleName(role.roleName); }}>
                                                        ✏ Edit
                                                    </button>
                                                    <button className="btn" style={{
                                                        padding: '5px 12px', fontSize: '0.78rem',
                                                        background: '#fff', color: '#dc2626',
                                                        border: '1px solid #fca5a5'
                                                    }} onClick={() => deleteRole(role._id)}>
                                                        🗑 Delete
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}