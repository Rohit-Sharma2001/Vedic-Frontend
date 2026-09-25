"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { postApi, postApiWithFile } from "services/api";
import { config } from "services/config";
import GroupEmailModal11 from "./GroupEmailModal";
import { Container, Row, Col, Card, Table, Button, Spinner, Form } from "react-bootstrap";
import { Trash, PencilSquare } from "react-bootstrap-icons";
import Swal from "sweetalert2";


// ═══════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════

// const EMAIL_GROUPS = [
//   { id: "marketing", label: "Marketing" },
//   { id: "member_user", label: "Member User" },
//   { id: "non_member_user", label: "Non-Member User" },
//   { id: "subscribed_user", label: "Subscribed User" },
//   { id: "promotional_user", label: "Promotional User" },
// ];

// ═══════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════

function useDebouncedValue(value, delay = 400) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

function formatDate(d) {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return "—";
  }
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// ═══════════════════════════════════════════════════
// TOAST
// ═══════════════════════════════════════════════════

function Toast({ msg, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  const bg =
    type === "success" ? "#166534" : type === "error" ? "#991b1b" : "#1e293b";

  return (
    <div
      style={{
        position: "fixed",
        bottom: 28,
        right: 28,
        zIndex: 999999,
        background: bg,
        color: "#fff",
        padding: "14px 20px",
        borderRadius: 12,
        boxShadow: "0 8px 30px rgba(0,0,0,.3)",
        fontSize: 14,
        fontWeight: 600,
        maxWidth: 340,
      }}
    >
      {msg}
    </div>
  );
}

// ═══════════════════════════════════════════════════
// GROUP DROPDOWN (per row in table)
// ═══════════════════════════════════════════════════

function GroupDropdown({ email, groupId, groupName, onToast, onRefresh, id }) {
  const [open, setOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const [alignRight, setAlignRight] = useState(false);
  const [loading, setLoading] = useState(false);
  const [assigned, setAssigned] = useState(groupName || null);
  const [groups, setGroups] = useState([]);
  const ref = useRef(null);

  useEffect(() => {
    // sync if parent data changes (e.g. after refresh)
    setAssigned(groupName || null);
  }, [groupName]);

  useEffect(() => {
    getAllGroups();
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  async function getAllGroups() {
    try {
      const response = await fetch(config.getAllGroups);
      const result = await response.json();
      setGroups(result?.data || []);
    } catch (error) {
      console.error("Failed to load groups:", error);
    }
  }

  const handleSelect = async (group) => {
    setOpen(false);
    setLoading(true);
    try {
      const res = await postApi(config.addEmailInGroup, {
        id: id,
        email,
        group: group.id,
      });
      if (res?.statusCode === 200 || res?.statusCode === 201) {
        setAssigned(group.label);
        onToast({ msg: `"${email}" added to ${group.label}`, type: "success" });
        onRefresh?.(); // ← refresh table data
      } else {
        onToast({ msg: `Failed to add to ${group.label}`, type: "error" });
      }
    } catch {
      onToast({ msg: "API error. Please try again.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      <button
        // onClick={() => setOpen((p) => !p)}
        onClick={() => {
          if (!open && ref.current) {

            const rect = ref.current.getBoundingClientRect();

            const dropdownWidth = 220;
            const dropdownHeight = 220;

            const spaceBelow = window.innerHeight - rect.bottom;
            const spaceAbove = rect.top;

            const spaceRight = window.innerWidth - rect.left;

            // vertical
            setOpenUpward(
              spaceBelow < dropdownHeight && spaceAbove > dropdownHeight
            );

            // horizontal
            setAlignRight(spaceRight < dropdownWidth);

          }

          setOpen((p) => !p);
        }}
        disabled={loading}
        style={{
          border: assigned ? "1px solid #bbf7d0" : "1px solid #e2e8f0",
          background: assigned ? "#f0fdf4" : "#f8fafc",
          color: assigned ? "#166534" : "#475569",
          padding: "5px 12px",
          borderRadius: 8,
          cursor: loading ? "not-allowed" : "pointer",
          fontSize: 12,
          width: 130,
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          gap: 5,
          whiteSpace: "nowrap",
          transition: "all .15s",
        }}
      >
        {loading ? "Saving…" : assigned ? <>✓ {assigned}</> : <>＋ Add to Group ▾</>}
      </button>

      {open && groups.length > 0 && (
        <div
          style={{
            position: "absolute",

            top: openUpward ? "auto" : "calc(100% + 4px)",
            bottom: openUpward ? "calc(100% + 4px)" : "auto",

            left: alignRight ? "auto" : 0,
            right: alignRight ? 0 : "auto",

            zIndex: 999999,
            background: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: 10,
            boxShadow: "0 8px 24px rgba(0,0,0,.12)",

            minWidth: 220,
            maxHeight: 260,

            overflowY: "auto",
            overflowX: "hidden",
          }}
        >
          {groups.map((g) => {
            const isActive = assigned === g.groupName;
            return (
              <div
                key={g._id}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect({ id: g._id, label: g.groupName });
                }}
                style={{
                  padding: "9px 14px",
                  fontSize: 13,
                  fontWeight: 600,
                  color: isActive ? "#166534" : "#334155",
                  background: isActive ? "#f0fdf4" : "transparent",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  transition: "background .1s",
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "#f1f5f9"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = isActive ? "#f0fdf4" : "transparent"; }}
              >
                <span style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: isActive ? "#16a34a" : "#0f172a",
                  flexShrink: 0,
                }} />
                {g.groupName}
                {isActive && <span style={{ marginLeft: "auto", color: "#16a34a", fontSize: 12 }}>✓</span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════
// TEMPLATES — 5 original + 2 per group (10 new)
// ═══════════════════════════════════════════════════

const TEMPLATES = [
  // ─── GENERAL ───────────────────────────────────
  {
    id: "blank",
    label: "Blank",
    thumb: "📄",
    category: "general",
    html: `
  <style>
    .editable-placeholder:empty::before {
      content: attr(data-placeholder);
      color: #94a3b8;
    }
  </style>

  <div style="font-family:Arial,sans-serif;padding:40px;color:#1e293b;">
    <p 
      class="editable-placeholder"
      contenteditable="true"
      data-placeholder="Write your message here..."
      style="min-height:20px;outline:none;"
    ></p>
  </div>`,
  },
  {
    id: "promo",
    label: "Promo",
    thumb: "🎁",
    category: "general",
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;">
  <div style="background:linear-gradient(135deg,#7c3aed,#2563eb);padding:48px 40px;text-align:center;">
    <h1 style="color:#fff;font-size:32px;margin:0 0 8px;">🎁 Special Offer</h1>
    <p style="color:rgba(255,255,255,.85);font-size:16px;margin:0;">Exclusive deal just for you</p>
  </div>
  <div style="padding:40px;">
    <p style="font-size:16px;color:#334155;line-height:1.7;">Hi there,</p>
    <p style="font-size:16px;color:#334155;line-height:1.7;">We have an exclusive offer that we think you'll love. Don't miss out!</p>
    <div style="text-align:center;margin:32px 0;">
      <a href="https://example.com" style="background:#7c3aed;color:#fff;padding:16px 36px;border-radius:999px;text-decoration:none;font-weight:700;font-size:16px;display:inline-block;">Claim Offer</a>
    </div>
  </div>
  <div style="background:#f8fafc;padding:24px 40px;text-align:center;color:#94a3b8;font-size:13px;">
    © 2025 Your Company · <a href="#" style="color:#94a3b8;">Unsubscribe</a>
  </div>
</div>`,
  },
  {
    id: "newsletter",
    label: "Newsletter",
    thumb: "📰",
    category: "general",
    html: `<div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;background:#fffbf5;">
  <div style="border-bottom:3px solid #0f172a;padding:24px 40px;display:flex;justify-content:space-between;align-items:center;">
    <div style="font-size:28px;font-weight:900;color:#0f172a;letter-spacing:-1px;">THE WEEKLY</div>
    <div style="font-size:13px;color:#64748b;">Issue #42 · May 2025</div>
  </div>
  <div style="padding:40px;">
    <h2 style="font-size:26px;font-weight:900;color:#0f172a;line-height:1.2;margin:0 0 16px;">This week in review</h2>
    <p style="font-size:16px;color:#475569;line-height:1.8;">Welcome back! Here's what's been happening this week.</p>
    <hr style="border:none;border-top:1px solid #e2e8f0;margin:28px 0;"/>
    <h3 style="font-size:18px;color:#0f172a;margin:0 0 10px;">📌 Top Story</h3>
    <p style="font-size:15px;color:#475569;line-height:1.8;">Your main story content goes here.</p>
  </div>
  <div style="background:#0f172a;padding:24px 40px;text-align:center;color:#64748b;font-size:13px;">
    You're receiving this because you subscribed · <a href="https://example.com" style="color:#94a3b8;">Unsubscribe</a>
  </div>
</div>`,
  },
  {
    id: "welcome",
    label: "Welcome",
    thumb: "👋",
    category: "general",
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;">
  <div style="background:#0f172a;padding:48px 40px;text-align:center;">
    <div style="font-size:48px;margin-bottom:16px;">👋</div>
    <h1 style="color:#fff;font-size:28px;font-weight:800;margin:0 0 8px;">Welcome aboard!</h1>
    <p style="color:#94a3b8;font-size:16px;margin:0;">We're glad you're here</p>
  </div>
  <div style="padding:48px 40px;">
    <p style="font-size:16px;color:#334155;line-height:1.8;">Hi,</p>
    <p style="font-size:16px;color:#334155;line-height:1.8;">Thank you for joining us. We're excited to have you as part of our community.</p>
    <div style="background:#f8fafc;border-left:4px solid #0f172a;padding:20px 24px;border-radius:0 12px 12px 0;margin:28px 0;">
      <p style="margin:0;font-size:15px;color:#334155;">💡 <strong>Getting Started:</strong> Check your dashboard to explore all features.</p>
    </div>
    <div style="text-align:center;margin:32px 0;">
      <a href="https://example.com" style="background:#0f172a;color:#fff;padding:16px 36px;border-radius:12px;text-decoration:none;font-weight:700;font-size:15px;">Get Started</a>
    </div>
  </div>
  <div style="background:#f8fafc;padding:24px 40px;text-align:center;color:#94a3b8;font-size:13px;">
    © 2025 Your Company · <a href="#" style="color:#94a3b8;">Unsubscribe</a>
  </div>
</div>`,
  },
  {
    id: "announcement",
    label: "Announcement",
    thumb: "📢",
    category: "general",
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;">
  <div style="background:linear-gradient(135deg,#059669,#0d9488);padding:40px;text-align:center;">
    <div style="display:inline-block;background:rgba(255,255,255,.2);border-radius:999px;padding:10px 20px;color:#fff;font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:20px;">📢 Announcement</div>
    <h1 style="color:#fff;font-size:30px;font-weight:800;margin:0;">Big News!</h1>
  </div>
  <div style="padding:48px 40px;">
    <p style="font-size:17px;color:#334155;line-height:1.8;">We have some exciting news to share with you today.</p>
    <div style="text-align:center;margin:36px 0;">
      <a href="https://example.com" style="background:#059669;color:#fff;padding:16px 36px;border-radius:12px;text-decoration:none;font-weight:700;font-size:15px;">Learn More →</a>
    </div>
  </div>
  <div style="background:#f8fafc;padding:24px 40px;text-align:center;color:#94a3b8;font-size:13px;">
    © 2025 Your Company · <a href="#" style="color:#94a3b8;">Unsubscribe</a>
  </div>
</div>`,
  },
  {
    id: "sub_confirm",
    label: "Sub Confirm",
    thumb: "✅",
    category: "subscription",
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;">
  <div style="background:#0f172a;padding:24px 40px;display:flex;align-items:center;justify-content:space-between;">
    <div style="color:#fff;font-size:22px;font-weight:900;letter-spacing:-1px;">YourBrand</div>
    <div style="color:#64748b;font-size:12px;letter-spacing:.5px;text-transform:uppercase;">Subscription</div>
  </div>
  <div style="background:#dcfce7;border-left:5px solid #16a34a;padding:20px 40px;display:flex;align-items:center;gap:14px;">
    <div style="width:40px;height:40px;background:#16a34a;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
      <span style="color:#fff;font-size:20px;font-weight:900;">✓</span>
    </div>
    <div>
      <div style="font-size:16px;font-weight:800;color:#166534;">You're now subscribed!</div>
      <div style="font-size:13px;color:#16a34a;margin-top:2px;">Subscription confirmed successfully.</div>
    </div>
  </div>
  <div style="padding:40px;">
    <h2 style="font-size:24px;font-weight:800;color:#0f172a;margin:0 0 16px;">Thank you for subscribing 🎉</h2>
    <p style="font-size:15px;color:#475569;line-height:1.8;">Hi <strong>[Subscriber Name]</strong>, you've successfully subscribed to our mailing list.</p>
    <div style="text-align:center;margin:32px 0;">
      <a href="https://example.com" style="background:#16a34a;color:#fff;padding:14px 36px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;">Explore Now →</a>
    </div>
  </div>
  <div style="background:#0f172a;padding:28px 40px;text-align:center;">
    <div style="color:#94a3b8;font-size:12px;line-height:1.8;">
      You received this because you subscribed at <strong style="color:#cbd5e1;">yoursite.com</strong><br/>
      <a href="#" style="color:#64748b;">Unsubscribe</a> · <a href="#" style="color:#64748b;">Privacy Policy</a>
    </div>
  </div>
</div>`,
  },
  {
    id: "sub_thankyou",
    label: "Sub Thank You",
    thumb: "💌",
    category: "subscription",
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;">
  <div style="background:linear-gradient(135deg,#ec4899,#8b5cf6);padding:48px 40px;text-align:center;">
    <div style="font-size:52px;margin-bottom:12px;">💌</div>
    <h1 style="color:#fff;font-size:30px;font-weight:900;margin:0 0 10px;">Thank You for Joining!</h1>
    <p style="color:rgba(255,255,255,.85);font-size:16px;margin:0;">We're thrilled to have you with us</p>
  </div>
  <div style="padding:44px 40px;">
    <p style="font-size:16px;color:#334155;line-height:1.8;">Hi <strong>[Subscriber Name]</strong>,</p>
    <p style="font-size:15px;color:#475569;line-height:1.8;">As a token of appreciation, here's a special welcome gift. Use the code below:</p>
    <div style="border:2px dashed #e879f9;border-radius:14px;padding:28px;text-align:center;background:#fdf4ff;margin:24px 0;">
      <div style="font-size:12px;font-weight:700;color:#a21caf;letter-spacing:2px;text-transform:uppercase;margin-bottom:10px;">Your Welcome Code</div>
      <div style="font-size:34px;font-weight:900;color:#7c3aed;letter-spacing:6px;font-family:monospace;">WELCOME20</div>
      <div style="font-size:13px;color:#94a3b8;margin-top:10px;">20% off · Valid for 30 days</div>
    </div>
    <div style="text-align:center;">
      <a href="https://example.com" style="background:linear-gradient(135deg,#ec4899,#8b5cf6);color:#fff;padding:15px 40px;border-radius:999px;text-decoration:none;font-weight:800;font-size:15px;display:inline-block;">Claim Your 20% Off →</a>
    </div>
  </div>
  <div style="background:#fdf4ff;border-top:1px solid #f3e8ff;padding:24px 40px;text-align:center;">
    <div style="color:#a78bfa;font-size:12px;">© 2025 Your Company · <a href="#" style="color:#c084fc;">Unsubscribe</a></div>
  </div>
</div>`,
  },

  // ─── MARKETING (2 templates) ──────────────────────
  {
    id: "marketing_campaign",
    label: "Marketing Campaign",
    thumb: "📣",
    category: "marketing",
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;">
  <!-- Header -->
  <div style="background:linear-gradient(135deg,#f59e0b,#ef4444);padding:50px 40px;text-align:center;position:relative;overflow:hidden;">
    <div style="position:absolute;top:-20px;right:-20px;width:120px;height:120px;background:rgba(255,255,255,.1);border-radius:50%;"></div>
    <div style="position:absolute;bottom:-30px;left:-10px;width:80px;height:80px;background:rgba(255,255,255,.08);border-radius:50%;"></div>
    <div style="font-size:40px;margin-bottom:10px;">📣</div>
    <h1 style="color:#fff;font-size:32px;font-weight:900;margin:0 0 10px;line-height:1.2;">Your Campaign Is Live!</h1>
    <p style="color:rgba(255,255,255,.9);font-size:15px;margin:0;">Reach more customers. Grow your brand.</p>
  </div>

  <!-- Stats Banner -->
  <div style="background:#fffbeb;border-bottom:1px solid #fde68a;padding:20px 40px;display:flex;justify-content:space-around;text-align:center;">
    <div>
      <div style="font-size:26px;font-weight:900;color:#b45309;">10K+</div>
      <div style="font-size:12px;color:#92400e;font-weight:600;">Impressions</div>
    </div>
    <div style="border-left:1px solid #fde68a;"></div>
    <div>
      <div style="font-size:26px;font-weight:900;color:#b45309;">2.4%</div>
      <div style="font-size:12px;color:#92400e;font-weight:600;">Avg. CTR</div>
    </div>
    <div style="border-left:1px solid #fde68a;"></div>
    <div>
      <div style="font-size:26px;font-weight:900;color:#b45309;">₹0</div>
      <div style="font-size:12px;color:#92400e;font-weight:600;">Spent Today</div>
    </div>
  </div>

  <!-- Body -->
  <div style="padding:44px 40px;">
    <h2 style="font-size:22px;font-weight:800;color:#0f172a;margin:0 0 14px;">Hi [First Name],</h2>
    <p style="font-size:15px;color:#475569;line-height:1.8;margin:0 0 20px;">
      Your latest marketing campaign has been launched! Our team has crafted the perfect message to reach your target audience and maximize conversions.
    </p>
    <div style="background:#fff7ed;border-left:4px solid #f59e0b;padding:16px 20px;border-radius:0 10px 10px 0;margin:0 0 28px;">
      <strong style="color:#92400e;font-size:14px;">📊 Campaign Tip:</strong>
      <p style="color:#78350f;font-size:13px;margin:6px 0 0;line-height:1.7;">Track your open rates and click-through rates daily. Campaigns with personalised subject lines get 26% higher open rates.</p>
    </div>
    <div style="text-align:center;margin:0 0 0;">
      <a href="https://example.com" style="background:linear-gradient(135deg,#f59e0b,#ef4444);color:#fff;padding:15px 40px;border-radius:999px;text-decoration:none;font-weight:800;font-size:15px;">View Campaign Dashboard →</a>
    </div>
  </div>

  <!-- Footer -->
  <div style="background:#0f172a;padding:24px 40px;text-align:center;">
    <div style="color:#64748b;font-size:12px;">© 2025 Your Company · <a href="#" style="color:#94a3b8;">Unsubscribe</a> · <a href="#" style="color:#94a3b8;">Manage Preferences</a></div>
  </div>
</div>`,
  },
  {
    id: "marketing_product_launch",
    label: "Marketing: Product Launch",
    thumb: "🚀",
    category: "marketing",
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0f172a;">
  <!-- Dark hero -->
  <div style="padding:56px 40px;text-align:center;border-bottom:1px solid #1e293b;">
    <div style="display:inline-block;background:linear-gradient(135deg,#f59e0b,#ef4444);border-radius:999px;padding:6px 16px;color:#fff;font-size:11px;font-weight:800;letter-spacing:2px;text-transform:uppercase;margin-bottom:20px;">🚀 NEW LAUNCH</div>
    <h1 style="color:#fff;font-size:36px;font-weight:900;margin:0 0 16px;line-height:1.15;">Introducing<br/><span style="background:linear-gradient(90deg,#f59e0b,#ef4444);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">[Product Name]</span></h1>
    <p style="color:#94a3b8;font-size:16px;line-height:1.7;margin:0 0 32px;">The product your customers have been waiting for. Reimagined from the ground up.</p>
    <a href="https://example.com" style="background:linear-gradient(135deg,#f59e0b,#ef4444);color:#fff;padding:16px 40px;border-radius:999px;text-decoration:none;font-weight:800;font-size:15px;">Be the First to Get It →</a>
  </div>

  <!-- Features -->
  <div style="padding:40px;">
    <div style="color:#64748b;font-size:11px;font-weight:800;letter-spacing:2px;text-transform:uppercase;margin-bottom:20px;">WHY IT'S DIFFERENT</div>
    <div style="margin-bottom:18px;display:flex;gap:14px;align-items:flex-start;">
      <div style="width:36px;height:36px;background:linear-gradient(135deg,#f59e0b22,#ef444422);border-radius:9px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:16px;">⚡</div>
      <div>
        <div style="color:#fff;font-size:15px;font-weight:700;margin-bottom:4px;">Lightning Fast</div>
        <div style="color:#64748b;font-size:13px;line-height:1.6;">Built with performance-first architecture for instant results.</div>
      </div>
    </div>
    <div style="margin-bottom:18px;display:flex;gap:14px;align-items:flex-start;">
      <div style="width:36px;height:36px;background:linear-gradient(135deg,#f59e0b22,#ef444422);border-radius:9px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:16px;">🎯</div>
      <div>
        <div style="color:#fff;font-size:15px;font-weight:700;margin-bottom:4px;">Laser Targeted</div>
        <div style="color:#64748b;font-size:13px;line-height:1.6;">Precision tools to reach exactly the right audience every time.</div>
      </div>
    </div>
    <div style="display:flex;gap:14px;align-items:flex-start;">
      <div style="width:36px;height:36px;background:linear-gradient(135deg,#f59e0b22,#ef444422);border-radius:9px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:16px;">📈</div>
      <div>
        <div style="color:#fff;font-size:15px;font-weight:700;margin-bottom:4px;">ROI Maximiser</div>
        <div style="color:#64748b;font-size:13px;line-height:1.6;">Our customers see 3× return on average in the first month.</div>
      </div>
    </div>
  </div>

  <div style="padding:0 40px 44px;text-align:center;">
    <a href="https://example.com" style="display:inline-block;border:1px solid #334155;color:#94a3b8;padding:13px 32px;border-radius:10px;text-decoration:none;font-size:13px;font-weight:600;">Learn More About the Launch</a>
  </div>

  <div style="border-top:1px solid #1e293b;padding:22px 40px;text-align:center;">
    <div style="color:#334155;font-size:12px;">© 2025 Your Company · <a href="#" style="color:#475569;">Unsubscribe</a></div>
  </div>
</div>`,
  },

  // ─── MEMBER USER (2 templates) ───────────────────
  {
    id: "member_welcome",
    label: "Member: Welcome",
    thumb: "🏅",
    category: "member_user",
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;">
  <div style="background:linear-gradient(135deg,#1d4ed8,#0ea5e9);padding:52px 40px;text-align:center;position:relative;overflow:hidden;">
    <div style="position:absolute;top:0;left:0;right:0;bottom:0;background:url('data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><circle cx=%2220%22 cy=%2220%22 r=%2215%22 fill=%22rgba(255,255,255,0.05)%22/><circle cx=%2280%22 cy=%2270%22 r=%2220%22 fill=%22rgba(255,255,255,0.04)%22/></svg>');"></div>
    <div style="position:relative;">
      <div style="font-size:56px;margin-bottom:12px;">🏅</div>
      <h1 style="color:#fff;font-size:30px;font-weight:900;margin:0 0 10px;">Welcome, Member!</h1>
      <p style="color:rgba(255,255,255,.8);font-size:15px;margin:0;">Your exclusive access starts now</p>
    </div>
  </div>

  <!-- Member card -->
  <div style="margin:28px 40px;background:linear-gradient(135deg,#1d4ed8,#0ea5e9);border-radius:16px;padding:24px 28px;color:#fff;">
    <div style="font-size:11px;font-weight:800;letter-spacing:2px;opacity:.7;margin-bottom:8px;">MEMBER CARD</div>
    <div style="font-size:20px;font-weight:900;margin-bottom:4px;">[Member Name]</div>
    <div style="font-size:13px;opacity:.7;">Member since May 2025</div>
    <div style="margin-top:16px;display:flex;gap:8px;">
      <div style="background:rgba(255,255,255,.2);border-radius:6px;padding:5px 12px;font-size:11px;font-weight:700;">VERIFIED ✓</div>
      <div style="background:rgba(255,255,255,.2);border-radius:6px;padding:5px 12px;font-size:11px;font-weight:700;">PREMIUM</div>
    </div>
  </div>

  <div style="padding:8px 40px 44px;">
    <h2 style="font-size:20px;font-weight:800;color:#0f172a;margin:0 0 16px;">What You Unlock as a Member</h2>
    <div style="display:flex;flex-direction:column;gap:12px;">
      <div style="display:flex;align-items:center;gap:12px;padding:14px 16px;background:#eff6ff;border-radius:10px;">
        <span style="font-size:20px;">🔓</span>
        <div>
          <div style="font-weight:700;color:#1d4ed8;font-size:14px;">Full Content Access</div>
          <div style="color:#64748b;font-size:12px;">All premium articles, guides & resources</div>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:12px;padding:14px 16px;background:#eff6ff;border-radius:10px;">
        <span style="font-size:20px;">🎟</span>
        <div>
          <div style="font-weight:700;color:#1d4ed8;font-size:14px;">Member-Only Events</div>
          <div style="color:#64748b;font-size:12px;">Webinars, workshops & live sessions</div>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:12px;padding:14px 16px;background:#eff6ff;border-radius:10px;">
        <span style="font-size:20px;">💬</span>
        <div>
          <div style="font-weight:700;color:#1d4ed8;font-size:14px;">Priority Support</div>
          <div style="color:#64748b;font-size:12px;">Get help within 2 hours, guaranteed</div>
        </div>
      </div>
    </div>
    <div style="text-align:center;margin-top:32px;">
      <a href="https://example.com" style="background:linear-gradient(135deg,#1d4ed8,#0ea5e9);color:#fff;padding:15px 40px;border-radius:999px;text-decoration:none;font-weight:800;font-size:15px;">Access Your Dashboard →</a>
    </div>
  </div>

  <div style="background:#0f172a;padding:24px 40px;text-align:center;">
    <div style="color:#64748b;font-size:12px;">© 2025 Your Company · Member Portal · <a href="#" style="color:#94a3b8;">Unsubscribe</a></div>
  </div>
</div>`,
  },
  {
    id: "member_renewal",
    label: "Member: Renewal",
    thumb: "🔄",
    category: "member_user",
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;">
  <div style="background:#0f172a;padding:28px 40px;display:flex;justify-content:space-between;align-items:center;">
    <div style="color:#fff;font-size:20px;font-weight:900;">YourBrand</div>
    <div style="background:#fef3c7;color:#92400e;font-size:11px;font-weight:800;padding:6px 12px;border-radius:999px;letter-spacing:.5px;">⏰ ACTION REQUIRED</div>
  </div>

  <div style="background:linear-gradient(135deg,#fef3c7,#fff7ed);padding:36px 40px;border-bottom:1px solid #fde68a;">
    <div style="font-size:42px;margin-bottom:12px;text-align:center;">🔄</div>
    <h1 style="font-size:26px;font-weight:900;color:#0f172a;text-align:center;margin:0 0 10px;">Your Membership is Expiring Soon</h1>
    <p style="color:#78350f;font-size:14px;text-align:center;margin:0;">Renew before <strong>[Date]</strong> to keep all your benefits without interruption</p>
  </div>

  <div style="padding:40px;">
    <p style="font-size:15px;color:#475569;line-height:1.8;margin:0 0 24px;">Hi <strong>[Member Name]</strong>, your membership expires on <strong>[Date]</strong>. Renew now and continue enjoying everything you love about being a member.</p>

    <!-- Renewal box -->
    <div style="border:2px solid #1d4ed8;border-radius:14px;padding:28px;text-align:center;margin:0 0 28px;">
      <div style="font-size:13px;color:#64748b;margin-bottom:8px;">Renew at the special rate of</div>
      <div style="font-size:42px;font-weight:900;color:#1d4ed8;margin-bottom:4px;">₹999<span style="font-size:18px;font-weight:600;color:#94a3b8;">/year</span></div>
      <div style="font-size:12px;color:#10b981;font-weight:700;margin-bottom:20px;">✓ Same price, even better benefits</div>
      <a href="https://example.com" style="background:#1d4ed8;color:#fff;padding:13px 36px;border-radius:10px;text-decoration:none;font-weight:800;font-size:14px;">Renew My Membership →</a>
    </div>

    <p style="font-size:13px;color:#94a3b8;text-align:center;line-height:1.7;">If you have any questions, reply to this email. We're here to help!</p>
  </div>

  <div style="background:#f8fafc;padding:22px 40px;text-align:center;">
    <div style="color:#94a3b8;font-size:12px;">© 2025 Your Company · <a href="#" style="color:#94a3b8;">Unsubscribe</a></div>
  </div>
</div>`,
  },

  // ─── NON-MEMBER USER (2 templates) ───────────────
  {
    id: "non_member_invite",
    label: "Non-Member: Join Now",
    thumb: "🌟",
    category: "non_member_user",
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;">
  <div style="background:linear-gradient(135deg,#7c3aed,#4f46e5);padding:56px 40px;text-align:center;">
    <div style="font-size:52px;margin-bottom:16px;">🌟</div>
    <h1 style="color:#fff;font-size:32px;font-weight:900;margin:0 0 12px;line-height:1.2;">You're Missing Out!</h1>
    <p style="color:rgba(255,255,255,.85);font-size:16px;margin:0 0 28px;">Join thousands of members already enjoying exclusive perks</p>
    <a href="https://example.com" style="background:#fff;color:#7c3aed;padding:15px 40px;border-radius:999px;text-decoration:none;font-weight:800;font-size:15px;">Join for Free →</a>
  </div>

  <div style="padding:44px 40px;">
    <h2 style="font-size:21px;font-weight:800;color:#0f172a;margin:0 0 8px;">Hi,</h2>
    <p style="font-size:15px;color:#475569;line-height:1.8;margin:0 0 28px;">You're currently browsing as a guest. Upgrade to a free membership and unlock a whole new experience.</p>

    <!-- Comparison table -->
    <div style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;margin:0 0 32px;">
      <div style="display:flex;background:#f8fafc;border-bottom:1px solid #e2e8f0;">
        <div style="flex:1;padding:12px 16px;font-size:12px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:.5px;">Feature</div>
        <div style="width:100px;padding:12px 16px;text-align:center;font-size:12px;font-weight:800;color:#94a3b8;text-transform:uppercase;">Guest</div>
        <div style="width:100px;padding:12px 16px;text-align:center;background:#7c3aed;color:#fff;font-size:12px;font-weight:800;text-transform:uppercase;">Member</div>
      </div>
      <div style="display:flex;border-bottom:1px solid #f1f5f9;">
        <div style="flex:1;padding:12px 16px;font-size:13px;color:#334155;">Premium Content</div>
        <div style="width:100px;padding:12px 16px;text-align:center;font-size:14px;color:#ef4444;">✗</div>
        <div style="width:100px;padding:12px 16px;text-align:center;background:#faf5ff;font-size:14px;color:#7c3aed;">✓</div>
      </div>
      <div style="display:flex;border-bottom:1px solid #f1f5f9;">
        <div style="flex:1;padding:12px 16px;font-size:13px;color:#334155;">Exclusive Discounts</div>
        <div style="width:100px;padding:12px 16px;text-align:center;font-size:14px;color:#ef4444;">✗</div>
        <div style="width:100px;padding:12px 16px;text-align:center;background:#faf5ff;font-size:14px;color:#7c3aed;">✓</div>
      </div>
      <div style="display:flex;">
        <div style="flex:1;padding:12px 16px;font-size:13px;color:#334155;">Priority Support</div>
        <div style="width:100px;padding:12px 16px;text-align:center;font-size:14px;color:#ef4444;">✗</div>
        <div style="width:100px;padding:12px 16px;text-align:center;background:#faf5ff;font-size:14px;color:#7c3aed;">✓</div>
      </div>
    </div>

    <div style="text-align:center;">
      <a href="https://example.com" style="background:linear-gradient(135deg,#7c3aed,#4f46e5);color:#fff;padding:15px 44px;border-radius:999px;text-decoration:none;font-weight:800;font-size:15px;">Create Free Account →</a>
    </div>
  </div>

  <div style="background:#0f172a;padding:22px 40px;text-align:center;">
    <div style="color:#64748b;font-size:12px;">© 2025 Your Company · <a href="#" style="color:#94a3b8;">Unsubscribe</a></div>
  </div>
</div>`,
  },
  {
    id: "non_member_offer",
    label: "Non-Member: Special Offer",
    thumb: "💎",
    category: "non_member_user",
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;">
  <div style="background:#0f172a;padding:24px 40px;text-align:center;">
    <div style="display:inline-block;background:linear-gradient(135deg,#f59e0b,#f97316);border-radius:999px;padding:7px 18px;color:#fff;font-size:11px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;">💎 EXCLUSIVE ONE-TIME OFFER</div>
  </div>

  <div style="padding:48px 40px;text-align:center;border-bottom:1px solid #f1f5f9;">
    <h1 style="font-size:36px;font-weight:900;color:#0f172a;margin:0 0 14px;line-height:1.15;">Get 50% Off<br/>Your First Month</h1>
    <p style="font-size:16px;color:#64748b;margin:0 0 32px;line-height:1.7;">This offer is exclusively for you and expires in 48 hours.</p>
    <div style="background:#fef3c7;border:2px dashed #f59e0b;border-radius:14px;padding:24px;display:inline-block;margin:0 0 32px;">
      <div style="font-size:11px;font-weight:800;color:#92400e;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;">Use Code</div>
      <div style="font-size:32px;font-weight:900;color:#b45309;letter-spacing:5px;font-family:monospace;">HALF50</div>
    </div>
    <br/>
    <a href="https://example.com" style="background:linear-gradient(135deg,#f59e0b,#f97316);color:#fff;padding:16px 48px;border-radius:999px;text-decoration:none;font-weight:800;font-size:16px;display:inline-block;">Claim 50% Discount →</a>
  </div>

  <div style="padding:36px 40px;text-align:center;">
    <p style="font-size:14px;color:#94a3b8;line-height:1.7;margin:0;">This offer expires in <strong style="color:#ef4444;">48 hours</strong>. After that, you'll pay full price. Don't miss it!</p>
  </div>

  <div style="background:#f8fafc;padding:20px 40px;text-align:center;">
    <div style="color:#94a3b8;font-size:12px;">© 2025 Your Company · <a href="#" style="color:#94a3b8;">Unsubscribe</a></div>
  </div>
</div>`,
  },

  // ─── SUBSCRIBED USER (2 templates) ───────────────
  {
    id: "subscribed_update",
    label: "Subscribed: Monthly Update",
    thumb: "📊",
    category: "subscribed_user",
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;">
  <div style="background:#059669;padding:28px 40px;display:flex;justify-content:space-between;align-items:center;">
    <div style="color:#fff;font-size:20px;font-weight:900;">YourBrand</div>
    <div style="background:rgba(255,255,255,.2);color:#fff;font-size:12px;font-weight:700;padding:6px 14px;border-radius:999px;">📊 Monthly Update</div>
  </div>

  <div style="background:linear-gradient(135deg,#ecfdf5,#f0fdf4);padding:36px 40px;border-bottom:1px solid #bbf7d0;">
    <h1 style="font-size:26px;font-weight:900;color:#064e3b;margin:0 0 8px;">Your May 2025 Summary</h1>
    <p style="color:#065f46;font-size:14px;margin:0;">Here's everything that happened this month</p>
  </div>

  <div style="padding:40px;">
    <!-- Stats grid -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:32px;">
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px;text-align:center;">
        <div style="font-size:30px;font-weight:900;color:#059669;">142</div>
        <div style="font-size:12px;color:#065f46;font-weight:600;margin-top:4px;">Emails Sent</div>
      </div>
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px;text-align:center;">
        <div style="font-size:30px;font-weight:900;color:#059669;">89%</div>
        <div style="font-size:12px;color:#065f46;font-weight:600;margin-top:4px;">Open Rate</div>
      </div>
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px;text-align:center;">
        <div style="font-size:30px;font-weight:900;color:#059669;">24</div>
        <div style="font-size:12px;color:#065f46;font-weight:600;margin-top:4px;">New Subscribers</div>
      </div>
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px;text-align:center;">
        <div style="font-size:30px;font-weight:900;color:#059669;">4.2%</div>
        <div style="font-size:12px;color:#065f46;font-weight:600;margin-top:4px;">Click Rate</div>
      </div>
    </div>

    <p style="font-size:15px;color:#475569;line-height:1.8;margin:0 0 24px;">Hi, great month! Your subscription has been active and delivering results. Here's what's coming next month...</p>

    <div style="background:#f8fafc;border-radius:12px;padding:20px 24px;margin:0 0 28px;">
      <div style="font-size:13px;font-weight:800;color:#0f172a;margin-bottom:10px;">🗓 Coming Next Month</div>
      <ul style="margin:0;padding-left:18px;color:#475569;font-size:14px;line-height:2;">
        <li>New campaign templates launching June 5</li>
        <li>A/B testing feature goes live</li>
        <li>Analytics dashboard redesign</li>
      </ul>
    </div>

    <div style="text-align:center;">
      <a href="https://example.com" style="background:#059669;color:#fff;padding:14px 36px;border-radius:10px;text-decoration:none;font-weight:800;font-size:14px;">View Full Report →</a>
    </div>
  </div>

  <div style="background:#0f172a;padding:22px 40px;text-align:center;">
    <div style="color:#64748b;font-size:12px;">© 2025 Your Company · <a href="#" style="color:#94a3b8;">Unsubscribe</a></div>
  </div>
</div>`,
  },
  {
    id: "subscribed_exclusive",
    label: "Subscribed: Exclusive Content",
    thumb: "🔐",
    category: "subscribed_user",
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;">
  <div style="background:linear-gradient(135deg,#0ea5e9,#059669);padding:48px 40px;text-align:center;">
    <div style="display:inline-block;background:rgba(255,255,255,.2);border-radius:999px;padding:7px 18px;color:#fff;font-size:11px;font-weight:800;letter-spacing:2px;text-transform:uppercase;margin-bottom:20px;">🔐 SUBSCRIBERS ONLY</div>
    <h1 style="color:#fff;font-size:30px;font-weight:900;margin:0 0 10px;">Your Exclusive Content Drop</h1>
    <p style="color:rgba(255,255,255,.85);font-size:15px;margin:0;">Handpicked just for our most valued subscribers</p>
  </div>

  <div style="padding:44px 40px;">
    <p style="font-size:15px;color:#475569;line-height:1.8;margin:0 0 28px;">Hi <strong>[Subscriber Name]</strong>, as a valued subscriber you get first access to our newest exclusive content before anyone else.</p>

    <!-- Content cards -->
    <div style="display:flex;flex-direction:column;gap:16px;margin:0 0 32px;">
      <div style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;display:flex;">
        <div style="width:6px;background:linear-gradient(180deg,#0ea5e9,#059669);flex-shrink:0;"></div>
        <div style="padding:16px 18px;">
          <div style="font-size:11px;font-weight:800;color:#0ea5e9;text-transform:uppercase;letter-spacing:.5px;margin-bottom:5px;">GUIDE</div>
          <div style="font-size:15px;font-weight:700;color:#0f172a;margin-bottom:4px;">The Ultimate Growth Playbook 2025</div>
          <div style="font-size:13px;color:#64748b;">25-page comprehensive guide to scaling your business this year.</div>
        </div>
      </div>
      <div style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;display:flex;">
        <div style="width:6px;background:linear-gradient(180deg,#f59e0b,#ef4444);flex-shrink:0;"></div>
        <div style="padding:16px 18px;">
          <div style="font-size:11px;font-weight:800;color:#f59e0b;text-transform:uppercase;letter-spacing:.5px;margin-bottom:5px;">WEBINAR REPLAY</div>
          <div style="font-size:15px;font-weight:700;color:#0f172a;margin-bottom:4px;">Email Marketing Masterclass</div>
          <div style="font-size:13px;color:#64748b;">90-minute in-depth session with industry experts. Now on demand.</div>
        </div>
      </div>
      <div style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;display:flex;">
        <div style="width:6px;background:linear-gradient(180deg,#8b5cf6,#ec4899);flex-shrink:0;"></div>
        <div style="padding:16px 18px;">
          <div style="font-size:11px;font-weight:800;color:#8b5cf6;text-transform:uppercase;letter-spacing:.5px;margin-bottom:5px;">TEMPLATE PACK</div>
          <div style="font-size:15px;font-weight:700;color:#0f172a;margin-bottom:4px;">50 Email Templates Bundle</div>
          <div style="font-size:13px;color:#64748b;">Professionally designed, conversion-tested, ready to use.</div>
        </div>
      </div>
    </div>

    <div style="text-align:center;">
      <a href="https://example.com" style="background:linear-gradient(135deg,#0ea5e9,#059669);color:#fff;padding:15px 44px;border-radius:999px;text-decoration:none;font-weight:800;font-size:15px;">Access Exclusive Content →</a>
    </div>
  </div>

  <div style="background:#0f172a;padding:22px 40px;text-align:center;">
    <div style="color:#64748b;font-size:12px;">© 2025 · Subscribers Only Content · <a href="#" style="color:#94a3b8;">Unsubscribe</a></div>
  </div>
</div>`,
  },

  // ─── PROMOTIONAL USER (2 templates) ──────────────
  {
    id: "promo_flash_sale",
    label: "Promo: Flash Sale",
    thumb: "⚡",
    category: "promotional_user",
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0f172a;">
  <!-- Countdown banner -->
  <div style="background:linear-gradient(135deg,#ef4444,#f97316);padding:14px 40px;text-align:center;">
    <div style="color:#fff;font-size:13px;font-weight:800;letter-spacing:1px;">⚡ FLASH SALE · ENDS IN 24 HOURS · ⚡</div>
  </div>

  <div style="padding:52px 40px;text-align:center;border-bottom:1px solid #1e293b;">
    <div style="font-size:56px;margin-bottom:14px;">⚡</div>
    <h1 style="color:#fff;font-size:38px;font-weight:900;margin:0 0 10px;line-height:1.1;">Flash Sale<br/><span style="background:linear-gradient(90deg,#ef4444,#f97316);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">Up to 70% Off</span></h1>
    <p style="color:#94a3b8;font-size:16px;margin:0 0 32px;">Limited time. Limited stock. Unlimited regret if you miss it.</p>
    <a href="https://example.com" style="background:linear-gradient(135deg,#ef4444,#f97316);color:#fff;padding:17px 48px;border-radius:999px;text-decoration:none;font-weight:900;font-size:16px;display:inline-block;letter-spacing:.3px;">Shop the Sale Now →</a>
  </div>

  <!-- Product cards -->
  <div style="padding:36px 40px;">
    <div style="color:#64748b;font-size:11px;font-weight:800;letter-spacing:2px;text-transform:uppercase;margin-bottom:20px;">FEATURED DEALS</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:28px;">
      <div style="background:#1e293b;border-radius:12px;padding:20px;text-align:center;">
        <div style="font-size:32px;margin-bottom:8px;">📦</div>
        <div style="color:#fff;font-size:13px;font-weight:700;margin-bottom:6px;">Starter Pack</div>
        <div style="color:#94a3b8;font-size:12px;text-decoration:line-through;margin-bottom:2px;">₹1,999</div>
        <div style="color:#ef4444;font-size:20px;font-weight:900;">₹599</div>
        <div style="background:#ef444422;color:#ef4444;font-size:10px;font-weight:800;border-radius:5px;padding:3px 8px;display:inline-block;margin-top:6px;">70% OFF</div>
      </div>
      <div style="background:#1e293b;border-radius:12px;padding:20px;text-align:center;">
        <div style="font-size:32px;margin-bottom:8px;">💼</div>
        <div style="color:#fff;font-size:13px;font-weight:700;margin-bottom:6px;">Pro Bundle</div>
        <div style="color:#94a3b8;font-size:12px;text-decoration:line-through;margin-bottom:2px;">₹4,999</div>
        <div style="color:#ef4444;font-size:20px;font-weight:900;">₹1,999</div>
        <div style="background:#ef444422;color:#ef4444;font-size:10px;font-weight:800;border-radius:5px;padding:3px 8px;display:inline-block;margin-top:6px;">60% OFF</div>
      </div>
    </div>
    <div style="text-align:center;">
      <a href="https://example.com" style="display:inline-block;border:1px solid #334155;color:#94a3b8;padding:12px 32px;border-radius:10px;text-decoration:none;font-size:13px;font-weight:600;">View All Deals</a>
    </div>
  </div>

  <div style="border-top:1px solid #1e293b;padding:20px 40px;text-align:center;">
    <div style="color:#334155;font-size:12px;">© 2025 Your Company · <a href="#" style="color:#475569;">Unsubscribe</a></div>
  </div>
</div>`,
  },
  {
    id: "promo_referral",
    label: "Promo: Refer & Earn",
    thumb: "🤝",
    category: "promotional_user",
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;">
  <div style="background:linear-gradient(135deg,#8b5cf6,#6366f1);padding:52px 40px;text-align:center;">
    <div style="font-size:52px;margin-bottom:14px;">🤝</div>
    <h1 style="color:#fff;font-size:32px;font-weight:900;margin:0 0 10px;line-height:1.2;">Share & Both Save!</h1>
    <p style="color:rgba(255,255,255,.85);font-size:16px;margin:0;">Refer a friend and you both get ₹500 off</p>
  </div>

  <!-- How it works -->
  <div style="padding:44px 40px;">
    <h2 style="font-size:20px;font-weight:800;color:#0f172a;text-align:center;margin:0 0 28px;">How It Works</h2>
    <div style="display:flex;flex-direction:column;gap:0;">
      <div style="display:flex;gap:16px;align-items:flex-start;padding-bottom:20px;position:relative;">
        <div style="position:absolute;left:19px;top:36px;bottom:0;width:2px;background:#e2e8f0;"></div>
        <div style="width:40px;height:40px;background:linear-gradient(135deg,#8b5cf6,#6366f1);border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900;font-size:16px;flex-shrink:0;z-index:1;">1</div>
        <div style="padding-top:8px;">
          <div style="font-weight:700;color:#0f172a;font-size:15px;margin-bottom:4px;">Share Your Link</div>
          <div style="color:#64748b;font-size:13px;line-height:1.6;">Send your unique referral link to friends, family, or colleagues.</div>
        </div>
      </div>
      <div style="display:flex;gap:16px;align-items:flex-start;padding-bottom:20px;position:relative;">
        <div style="position:absolute;left:19px;top:36px;bottom:0;width:2px;background:#e2e8f0;"></div>
        <div style="width:40px;height:40px;background:linear-gradient(135deg,#8b5cf6,#6366f1);border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900;font-size:16px;flex-shrink:0;z-index:1;">2</div>
        <div style="padding-top:8px;">
          <div style="font-weight:700;color:#0f172a;font-size:15px;margin-bottom:4px;">They Sign Up</div>
          <div style="color:#64748b;font-size:13px;line-height:1.6;">Your friend creates an account using your referral link.</div>
        </div>
      </div>
      <div style="display:flex;gap:16px;align-items:flex-start;">
        <div style="width:40px;height:40px;background:linear-gradient(135deg,#8b5cf6,#6366f1);border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900;font-size:16px;flex-shrink:0;">3</div>
        <div style="padding-top:8px;">
          <div style="font-weight:700;color:#0f172a;font-size:15px;margin-bottom:4px;">Both of You Save ₹500</div>
          <div style="color:#64748b;font-size:13px;line-height:1.6;">Discount applied instantly to both accounts. No limits!</div>
        </div>
      </div>
    </div>

    <!-- Referral code box -->
    <div style="background:#f5f3ff;border:2px dashed #8b5cf6;border-radius:14px;padding:24px;text-align:center;margin:28px 0;">
      <div style="font-size:12px;font-weight:800;color:#6d28d9;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;">Your Referral Code</div>
      <div style="font-size:28px;font-weight:900;color:#7c3aed;letter-spacing:5px;font-family:monospace;">[CODE]</div>
    </div>

    <div style="text-align:center;">
      <a href="https://example.com" style="background:linear-gradient(135deg,#8b5cf6,#6366f1);color:#fff;padding:15px 44px;border-radius:999px;text-decoration:none;font-weight:800;font-size:15px;display:inline-block;">Share Your Link Now →</a>
    </div>
  </div>

  <div style="background:#f8fafc;padding:20px 40px;text-align:center;">
    <div style="color:#94a3b8;font-size:12px;">© 2025 Your Company · <a href="#" style="color:#94a3b8;">Unsubscribe</a></div>
  </div>
</div>`,
  },
];

// ═══════════════════════════════════════════════════
// GROUP MODAL (in EmailComposer) — fetch group emails
// ═══════════════════════════════════════════════════

function GroupEmailModal({ onClose, onAddEmails, onRemoveEmails, selectedGroups, onSelectedGroupsChange }) {
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [groups, setGroups] = useState([]);
  const [loadingEmails, setLoadingEmails] = useState({});
  const [groupEmailsMap, setGroupEmailsMap] = useState({});

  useEffect(() => {
    const fetchGroups = async () => {
      setLoadingGroups(true);
      try {
        const response = await fetch(config.getAllGroups);
        const result = await response.json();
        setGroups(result?.data || []);
      } catch (err) {
        console.error("Failed to load groups:", err);
      } finally {
        setLoadingGroups(false);
      }
    };
    fetchGroups();
  }, []);

  // ── Fetch emails based on sendMail key ──────────────────────────────────
  const fetchEmailsForGroup = async (group) => {
    console.log(group, "aaaaaaaaaaaaaaaaaaaaaasss")
    const sendMail = group.send_email;
    console.log(sendMail, "sendMailsendMail")
    try {
      // ── Active or Inactive → getAllUsersForDropdown ──
      if (sendMail === "active" || sendMail === "inactive") {
        const response = await postApi(config.getAllUsersForDropdown, {});
        const raw = response?.data || [];

        // Deduplicate by _id first (user can appear multiple times across groups)
        const seen = new Set();
        const unique = raw.filter(u => {
          if (seen.has(u._id)) return false;
          seen.add(u._id);
          return true;
        });

        const filtered = unique.filter(u =>
          sendMail === "active" ? u.is_deleted === 0 : u.is_deleted === 1
        );

        return filtered.map(u => u.email).filter(Boolean);
      }

      // ── Subscribe → getAllSubscribe ──
      if (sendMail === "subscription") {
        // Fetch all pages
        let allEmails = [];
        let currentPage = 1;
        let totalPages = 1;

        do {
          const res = await postApi(config.getAllSuscribe, {
            page: currentPage,
            pageSize: 1000,
          });
          if (res?.statusCode === 200 || res?.statusCode === 201) {
            const results = res.result ?? [];
            const emails = results.map(item => item.email).filter(Boolean);
            allEmails = [...allEmails, ...emails];
            totalPages = res.totalPages ?? 1;
            currentPage++;
          } else {
            break;
          }
        } while (currentPage <= totalPages);

        return allEmails;
      }

      // ── Custom group (null / blank) → getEmailsByGroup ──
      const res = await postApi(config.getEmailsByGroup, { groupId: group._id });
      if (res?.statusCode === 200 || res?.statusCode === 201) {
        const rawList = res.data ?? res.result ?? [];
        return rawList
          .map(item => item?.userId?.email ?? item?.email ?? item)
          .filter(Boolean);
      }

      return [];
    } catch (err) {
      console.error("Failed to fetch emails for group:", err);
      return [];
    }
  };

  const handleGroupSelect = async (group) => {
    const next = new Set(selectedGroups);

    if (next.has(group._id)) {
      // ── DESELECT: remove this group's emails from toList ──
      next.delete(group._id);
      onSelectedGroupsChange(next);

      const emailsToRemove = groupEmailsMap[group._id] || [];
      if (emailsToRemove.length > 0) {
        onRemoveEmails(emailsToRemove); // ← new callback
      }
      return;
    }

    // ── SELECT: fetch + add emails ──
    next.add(group._id);
    onSelectedGroupsChange(next);

    setLoadingEmails(prev => ({ ...prev, [group._id]: true }));
    try {
      const emails = await fetchEmailsForGroup(group);
      if (emails.length > 0) {
        // Store mapping so we can remove later
        setGroupEmailsMap(prev => ({ ...prev, [group._id]: emails }));
        onAddEmails(emails);
      }
    } finally {
      setLoadingEmails(prev => ({ ...prev, [group._id]: false }));
    }
  };
  const getDotColor = (idx) => {
    const palette = ["#f59e0b", "#3b82f6", "#10b981", "#ec4899", "#8b5cf6", "#ef4444"];
    return palette[idx % palette.length];
  };

  // ── Badge label for sendMail type ──────────────────────────────────────
  const getSendMailBadge = (sendMail) => {
    if (sendMail === "active") return { label: "Active Users", bg: "#dcfce7", color: "#166534" };
    if (sendMail === "inactive") return { label: "Inactive Users", bg: "#fee2e2", color: "#991b1b" };
    if (sendMail === "subscribe") return { label: "Subscribers", bg: "#dbeafe", color: "#1d4ed8" };
    return null;
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,.6)",
      zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{
        background: "#fff", borderRadius: 18, overflow: "hidden",
        width: 480, maxHeight: "82vh", display: "flex", flexDirection: "column",
        boxShadow: "0 24px 60px rgba(0,0,0,.4)",
      }}>
        {/* Header */}
        <div style={{
          padding: "18px 22px", background: "#0f172a", color: "#fff",
          display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12,
        }}>
          <div style={{ fontSize: 17, fontWeight: 800 }}>👥 Select by Group</div>
          {selectedGroups.size > 0 && (
            <span style={{
              background: "#dbeafe", color: "#1d4ed8", fontSize: 11,
              fontWeight: 700, padding: "3px 10px", borderRadius: 999, marginLeft: "auto",
            }}>
              {selectedGroups.size} selected
            </span>
          )}
          <button onClick={onClose} style={{
            border: "none", background: "rgba(255,255,255,.15)", color: "#fff",
            borderRadius: 8, width: 28, height: 28, cursor: "pointer", fontSize: 18, flexShrink: 0,
          }}>×</button>
        </div>

        {/* Group list */}
        <div style={{ padding: "14px 18px", borderBottom: "1px solid #f1f5f9", overflowY: "auto", flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 10 }}>
            Choose Groups
          </div>

          {loadingGroups && (
            <div style={{ textAlign: "center", color: "#94a3b8", fontSize: 13, padding: "12px 0" }}>
              Loading groups…
            </div>
          )}

          {!loadingGroups && groups.length === 0 && (
            <div style={{ textAlign: "center", color: "#94a3b8", fontSize: 13, padding: "12px 0" }}>
              No groups found
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {groups.map((g, idx) => {
              const dotColor = getDotColor(idx);
              const isSelected = selectedGroups.has(g._id);
              const isLoading = loadingEmails[g._id];
              const badge = getSendMailBadge(g.send_email);

              return (
                <button
                  key={g._id}
                  onClick={() => !isLoading && handleGroupSelect(g)}
                  disabled={isLoading}
                  style={{
                    border: isSelected ? `2px solid ${dotColor}` : "2px solid #f1f5f9",
                    background: isSelected ? `${dotColor}18` : "#f8fafc",
                    padding: "10px 14px", borderRadius: 10, cursor: isLoading ? "wait" : "pointer",
                    display: "flex", alignItems: "center", gap: 10, textAlign: "left",
                    transition: "all .15s", opacity: isLoading ? 0.7 : 1,
                  }}
                >
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: dotColor, flexShrink: 0 }} />

                  <span style={{ fontSize: 14, fontWeight: 700, color: isSelected ? "#334155" : "#64748b", flex: 1 }}>
                    {g.groupName}
                  </span>

                  {/* sendMail type badge */}
                  {badge && (
                    <span style={{
                      background: badge.bg, color: badge.color,
                      fontSize: 10, fontWeight: 700, padding: "2px 8px",
                      borderRadius: 999, whiteSpace: "nowrap", flexShrink: 0,
                    }}>
                      {badge.label}
                    </span>
                  )}

                  {/* Right status */}
                  {isLoading && (
                    <span style={{ fontSize: 11, color: "#94a3b8", flexShrink: 0 }}>Loading…</span>
                  )}
                  {!isLoading && isSelected && (
                    <span style={{ fontSize: 12, color: dotColor, fontWeight: 700, flexShrink: 0 }}>✓ added</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f1f5f9" }}>
          <span style={{ fontSize: 12, color: "#94a3b8" }}>
            {selectedGroups.size > 0
              ? `${selectedGroups.size} group${selectedGroups.size > 1 ? "s" : ""} selected`
              : "No groups selected"}
          </span>
          <button
            onClick={onClose}
            style={{
              border: "1px solid #e2e8f0", background: "#0f172a", color: "#fff",
              padding: "9px 22px", borderRadius: 9, fontWeight: 700, fontSize: 13, cursor: "pointer",
            }}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

// mail editor me agar emage upload crop kr ke kr dete h to upload croped image ho jata h lekin upload hone ke bad body me set nhi hota h place ya size of image to upload hone ke bad size or place change kr ske wais modify kro 
// and next agar button pr url dene ke bad jb priview me click krte h to o url open ho jata h lekin  fir usko back preview mw nhi ja pate usko bhi sahi kro 


// ═══════════════════════════════════════════════════
// EMAIL COMPOSER (ADVANCED)
// ═══════════════════════════════════════════════════

function EmailComposer({ onClose, onSend }) {
  const iframeRef = useRef(null);
  const fileInputRef = useRef(null);
  const cropCanvasRef = useRef(null);

  const [subject, setSubject] = useState("");
  const [toList, setToList] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState(new Set());
  const [toExpanded, setToExpanded] = useState(false);
  const [ccList, setCcList] = useState([]);
  const [toInput, setToInput] = useState("");
  const [ccInput, setCcInput] = useState("");
  const [showCc, setShowCc] = useState(false);
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState("design");
  const [htmlCode, setHtmlCode] = useState(TEMPLATES[0].html);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  // add alongside other useState declarations
  const [selectedGroupId, setSelectedGroupId] = useState(null);  // ← NEW

  // Crop state
  const [cropImage, setCropImage] = useState(null);
  const [cropRect, setCropRect] = useState({ x: 0, y: 0, w: 100, h: 100 });
  const [showCrop, setShowCrop] = useState(false);
  const cropDragging = useRef(null);

  const [fontSize, setFontSize] = useState("3");
  const [fontFamily, setFontFamily] = useState("Arial, sans-serif");
  const [fontColor, setFontColor] = useState("#1e293b");
  const [bgColor, setBgColor] = useState("");

  const syncToIframe = useCallback((html) => {
    const frame = iframeRef.current;
    if (!frame) return;
    try {
      const doc = frame.contentDocument || frame.contentWindow.document;
      doc.open();
      // doc.write(`<!DOCTYPE html><html><head><style>
      //   body{margin:0;padding:0;font-family:Arial,sans-serif;}*{box-sizing:border-box;}
      // </style></head><body>${html}</body></html>`);
      doc.write(`
<!DOCTYPE html>
<html>
<head>
<style>
  body{
    margin:0;
    padding:24px;
    font-family:Arial,sans-serif;
  }

  *{
    box-sizing:border-box;
  }

  img{
    max-width:100%;
  }
  .resizable-image{
  max-width:100%;
  transition:border .2s ease;
}

.resizable-image:hover{
  border:2px dashed #94a3b8 !important;
}
</style>
</head>

<body>
${html}

<script>
  document.addEventListener('click', function(e) {
    const link = e.target.closest('a');

    if(link){
      e.preventDefault();
      window.open(link.href, '_blank');
    }
  });
</script>

</body>
</html>
`);
      doc.close();
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => {
    if (activeTab === "preview") syncToIframe(htmlCode);
  }, [activeTab, htmlCode, syncToIframe]);

  const addEmail = (list, setList, email) => {
    if (EMAIL_REGEX.test(email) && !list.includes(email))
      setList((p) => [...p, email]);
  };
  const removeEmail = (list, setList, email) =>
    setList(list.filter((e) => e !== email));
  const handleKeyEmail = (e, list, setList, setInput) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = e.target.value.replace(",", "").trim();
      if (val) { addEmail(list, setList, val); setInput(""); }
    }
  };
  const handleBlurEmail = (val, list, setList, setInput) => {
    const v = val.trim();
    if (v) { addEmail(list, setList, v); setInput(""); }
  };

  const exec = (cmd, val = null) => {
    const frame = iframeRef.current;
    if (!frame) return;
    const doc = frame.contentDocument || frame.contentWindow.document;
    doc.execCommand(cmd, false, val);
    setHtmlCode(doc.body.innerHTML);
  };

  const getIframeDoc = () => {
    const f = iframeRef.current;
    return f ? (f.contentDocument || f.contentWindow?.document) : null;
  };

  const enableImageEditing = (doc) => {
    if (!doc) return;

    doc.querySelectorAll(".resizable-image").forEach((wrapper) => {
      if (wrapper.dataset.initialized) return;

      wrapper.dataset.initialized = "true";

      wrapper.setAttribute("contenteditable", "false");

      let translateX = 0;
      let translateY = 0;

      let isDragging = false;
      let startX = 0;
      let startY = 0;

      wrapper.style.cursor = "move";

      // select effect
      wrapper.addEventListener("click", () => {
        doc.querySelectorAll(".resizable-image").forEach((w) => {
          w.style.border = "2px dashed transparent";
        });

        wrapper.style.border = "2px dashed #3b82f6";
      });

      wrapper.addEventListener("mousedown", (e) => {
        const rect = wrapper.getBoundingClientRect();

        // resize handle detection
        const isResizeHandle =
          e.clientX > rect.right - 18 &&
          e.clientY > rect.bottom - 18;

        // resize → skip drag
        if (isResizeHandle) return;

        isDragging = true;

        startX = e.clientX;
        startY = e.clientY;

        wrapper.style.opacity = "0.7";

        e.preventDefault();
      });

      const onMove = (e) => {
        if (!isDragging) return;

        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        wrapper.style.transform = `
        translate(
          ${translateX + dx}px,
          ${translateY + dy}px
        )
      `;
      };

      const onUp = (e) => {
        if (!isDragging) return;

        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        translateX += dx;
        translateY += dy;

        wrapper.style.transform = `
        translate(${translateX}px, ${translateY}px)
      `;

        wrapper.style.opacity = "1";

        isDragging = false;
      };

      doc.addEventListener("mousemove", onMove);
      doc.addEventListener("mouseup", onUp);

      // deselect
      doc.body.addEventListener("click", (e) => {
        if (!wrapper.contains(e.target)) {
          wrapper.style.border = "2px dashed transparent";
        }
      });
    });
  };

  const enableButtonEditing = (doc) => {
    if (!doc) return;

    doc.querySelectorAll("a").forEach((btn) => {
      if (btn.dataset.btnInitialized) return;
      btn.dataset.btnInitialized = "true";

      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        // ── Remove old popup from PARENT window ──
        document.querySelectorAll(".btn-edit-popup-outer").forEach((p) => p.remove());

        // ── Button position relative to PARENT window ──
        const iframeEl = iframeRef.current;
        const iframeRect = iframeEl.getBoundingClientRect();
        const btnRect = btn.getBoundingClientRect(); // inside iframe coords

        // Actual position in parent window
        const top = iframeRect.top + btnRect.bottom + 8;
        const left = iframeRect.left + btnRect.left;

        const currentText = btn.innerText.trim();
        const currentHref = btn.getAttribute("href") || "";

        // ── Create popup in PARENT document ──
        const popup = document.createElement("div");
        popup.className = "btn-edit-popup-outer";
        popup.style.cssText = `
        position:fixed;
        top:${top}px;
        left:${left}px;
        background:#1e293b;
        border-radius:12px;
        padding:16px;
        box-shadow:0 8px 40px rgba(0,0,0,.6);
        z-index:9999999;
        display:flex;
        flex-direction:column;
        gap:12px;
        min-width:280px;
        font-family:Arial,sans-serif;
      `;

        popup.innerHTML = `
        <div style="font-size:11px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">✏️ Edit Button</div>
        <div>
          <div style="font-size:11px;color:#64748b;margin-bottom:5px;font-weight:600;">Button Text</div>
          <input
            class="btn-text-input"
            type="text"
            style="width:100%;padding:9px 11px;border-radius:7px;border:1px solid #334155;background:#0f172a;color:#fff;font-size:13px;outline:none;box-sizing:border-box;"
          />
        </div>
        <div>
          <div style="font-size:11px;color:#64748b;margin-bottom:5px;font-weight:600;">Button URL</div>
          <input
            class="btn-url-input"
            type="text"
            style="width:100%;padding:9px 11px;border-radius:7px;border:1px solid #334155;background:#0f172a;color:#fff;font-size:13px;outline:none;box-sizing:border-box;"
          />
        </div>
        <div style="display:flex;gap:8px;justify-content:flex-end;">
          <button class="btn-cancel" style="border:1px solid #475569;background:transparent;color:#94a3b8;padding:8px 16px;border-radius:7px;font-size:12px;font-weight:700;cursor:pointer;">Cancel</button>
          <button class="btn-apply" style="border:none;background:#7c3aed;color:#fff;padding:8px 16px;border-radius:7px;font-size:12px;font-weight:700;cursor:pointer;">Apply ✓</button>
        </div>
      `;

        // Append to PARENT document body
        document.body.appendChild(popup);

        // Set values after append
        popup.querySelector(".btn-text-input").value = currentText;
        popup.querySelector(".btn-url-input").value = currentHref;

        // Auto-flip: agar popup neeche cut ho raha ho toh upar dikhao
        const popupHeight = 220;
        const windowHeight = window.innerHeight;
        if (top + popupHeight > windowHeight) {
          const newTop = iframeRect.top + btnRect.top - popupHeight - 8;
          popup.style.top = `${Math.max(8, newTop)}px`;
        }

        // Auto-flip: agar popup right mein cut ho raha ho
        const popupWidth = 280;
        const windowWidth = window.innerWidth;
        if (left + popupWidth > windowWidth) {
          popup.style.left = `${windowWidth - popupWidth - 12}px`;
        }

        // Focus
        setTimeout(() => popup.querySelector(".btn-text-input")?.focus(), 50);

        // Apply
        popup.querySelector(".btn-apply").addEventListener("click", () => {
          const newText = popup.querySelector(".btn-text-input").value.trim();
          const newUrl = popup.querySelector(".btn-url-input").value.trim();

          if (newText) btn.innerText = newText;
          if (newUrl) btn.setAttribute("href", newUrl);

          popup.remove();

          // Save HTML without popup
          doc.querySelectorAll(".btn-edit-popup").forEach((p) => p.remove());
          setHtmlCode(doc.body.innerHTML);
        });

        // Cancel
        popup.querySelector(".btn-cancel").addEventListener("click", () => {
          popup.remove();
        });

        // Outside click close
        setTimeout(() => {
          const closeHandler = (ev) => {
            if (!popup.isConnected) {
              document.removeEventListener("mousedown", closeHandler);
              return;
            }
            if (!popup.contains(ev.target)) {
              popup.remove();
              document.removeEventListener("mousedown", closeHandler);
            }
          };
          document.addEventListener("mousedown", closeHandler);
        }, 150);
      });
    });
  };

  const makeEditable = () => {
    const doc = getIframeDoc();
    if (!doc) return;
    doc.body.contentEditable = "true";
    doc.body.style.outline = "none";
    doc.body.style.minHeight = "400px";
    doc.body.style.padding = "24px";

    doc.body.addEventListener("input", () => {
      setHtmlCode(doc.body.innerHTML);
      enableImageEditing(doc);
      enableButtonEditing(doc);
    });

    enableImageEditing(doc);
    enableButtonEditing(doc);
  };

  useEffect(() => {
    if (activeTab === "design" && iframeRef.current) {
      syncToIframe(htmlCode);
      setTimeout(() => {
        // ── Reset flags taaki buttons dobara editable ho jayein ──
        const doc = getIframeDoc();
        if (doc) {
          doc.querySelectorAll("a[data-btn-initialized]").forEach((btn) => {
            delete btn.dataset.btnInitialized;
          });
          doc.querySelectorAll(".resizable-image[data-initialized]").forEach((img) => {
            delete img.dataset.initialized;
          });
        }
        makeEditable();
      }, 100);
    }

    if (activeTab === "preview") {
      // ── Preview me parent window ke saare popups hatao ──
      document.querySelectorAll(".btn-edit-popup-outer").forEach((p) => p.remove());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const applyTemplate = (t) => {
    setHtmlCode(t.html);
    setShowTemplates(false);
    if (activeTab === "design") {
      setTimeout(() => { syncToIframe(t.html); setTimeout(makeEditable, 100); }, 50);
    }
  };

  const handleImageFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setCropImage({ src: ev.target.result, file });
      setCropRect({ x: 0, y: 0, w: 100, h: 100 });
      setShowCrop(true);
    };
    reader.readAsDataURL(file);
  };
  const handleFileChange = async (file) => {
    // const {  files } = e.target;
    // const file = files[0];
    if (!file) return;

    const files = {
      file: file
    };

    const result = await postApiWithFile(config.uploadEmailImage, { new: "No Data" }, files)

    console.log(result, "resultresult")
    if (result.statusCode == 201) {
      return result.data ?? result.result ?? [];
    }

  };
  const commitCrop = () => {
    const canvas = cropCanvasRef.current;
    if (!canvas || !cropImage) return;
    const img = new Image();
    img.onload = async () => {
      const scaleX = img.naturalWidth / 320;
      const scaleY = img.naturalHeight / 240;
      const ctx = canvas.getContext("2d");
      canvas.width = Math.round(cropRect.w * scaleX);
      canvas.height = Math.round(cropRect.h * scaleY);
      ctx.drawImage(img, cropRect.x * scaleX, cropRect.y * scaleY,
        cropRect.w * scaleX, cropRect.h * scaleY, 0, 0, canvas.width, canvas.height);
      // const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
      const blob = await new Promise(resolve =>
        canvas.toBlob(resolve, "image/jpeg", 0.9)
      );

      const file = new File([blob], "cropped.jpg", {
        type: "image/jpeg"
      });
      const dataUrl = await handleFileChange(file)
      console.log(dataUrl, "dataUrl")
      // exec("insertHTML", `<img src="${dataUrl}" style="max-width:100%;border-radius:8px;display:block;margin:16px auto;" alt="image"/>`);
      exec(
        "insertHTML",
        `
  <div style="margin:20px 0;">
    
    <div
      class="resizable-image"
      contenteditable="false"
      style="
        width:300px;
        min-width:80px;
        min-height:80px;
        resize:both;
        overflow:auto;
        display:inline-block;
        border:2px dashed transparent;
        position:relative;
      "
    >
      <img
        src="${dataUrl}"
        draggable="false"
        style="
          width:100%;
          height:100%;
          display:block;
          border-radius:8px;
          pointer-events:none;
          user-select:none;
        "
      />
    </div>

  </div>

  <p><br/></p>
`
      );
      setShowCrop(false); setCropImage(null);
    };
    img.src = cropImage.src;
  };

  const handleSend = async () => {
    if (!toList.length && !selectedGroupId) { alert("Please add at least one recipient or select a group"); return; }
    if (!subject.trim()) { alert("Please enter a subject"); return; }
    if (!htmlCode.trim()) { alert("Email body is empty"); return; }
    setSending(true);

    console.log(toList, "Sending email with data:", selectedGroupId, subject, "sssssssssssssss", htmlCode)
    if (toList?.length <= 0) {
      alert("Please add at least one email address or select a group.");
      setSending(false);
      return;
    }
    try {
      if (toList?.length > 0) {
        // ── send to entire group via dedicated API ──
        const res = await postApi(config.sendMailToGroup, {
          // groupId: selectedGroupId,
          emails: toList,
          subject,
          html: htmlCode,
        });

        console.log(res, "resresresresresresresresresresres")
        // const res = await postApi(config.sendMailToGroup, {
        //   groupId: selectedGroupId,
        //   subject,
        //   html: htmlCode,
        // });
        if (res?.statusCode === 200 || res?.statusCode === 201) {
          onSend({ to: toList, cc: ccList, subject, body: htmlCode }); // triggers parent toast/close
          window.location.reload();
        }
      } else {
        await onSend({ to: toList, cc: ccList, subject, body: htmlCode });
      }
    } finally {
      setSending(false);
    }
  };

  // Template categories for display
  const templateCategories = [
    { id: "general", label: "General" },
    { id: "marketing", label: "📣 Marketing" },
    { id: "member_user", label: "🏅 Member" },
    { id: "non_member_user", label: "🌟 Non-Member" },
    { id: "subscribed_user", label: "✅ Subscribed" },
    { id: "promotional_user", label: "⚡ Promotional" },
    { id: "subscription", label: "💌 Subscription" },
  ];
  const [activeTplCategory, setActiveTplCategory] = useState("general");

  const FONTS = [
    "Arial, sans-serif", "Georgia, serif", "Courier New, monospace",
    "Trebuchet MS, sans-serif", "Verdana, sans-serif", "Times New Roman, serif",
  ];

  return (
    <>
      <style>{`
        .ec2-overlay{position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;backdrop-filter:blur(6px);}
        .ec2-modal{width:100%;max-width:1240px;height:94vh;background:#f8fafc;border-radius:20px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 24px 80px rgba(0,0,0,.5);}
        .ec2-header{padding:14px 20px;background:#0f172a;color:#fff;display:flex;justify-content:space-between;align-items:center;flex-shrink:0;}
        .ec2-header-title{font-size:18px;font-weight:800;letter-spacing:-.3px;}
        .ec2-close{border:none;width:32px;height:32px;border-radius:8px;background:rgba(255,255,255,.12);color:#fff;cursor:pointer;font-size:20px;display:flex;align-items:center;justify-content:center;transition:background .15s;}
        .ec2-close:hover{background:rgba(255,255,255,.22);}
        .ec2-meta{background:#fff;border-bottom:1px solid #e2e8f0;flex-shrink:0;}
        .ec2-row{display:flex;border-bottom:1px solid #f1f5f9;align-items:center;}
        .ec2-lbl{width:72px;padding:12px 16px;font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.5px;background:#f8fafc;border-right:1px solid #f1f5f9;flex-shrink:0;}
        .ec2-chips{flex:1;display:flex;flex-wrap:wrap;gap:6px;padding:8px 12px;align-items:center;}
        .ec2-chip{background:#dbeafe;color:#1d4ed8;padding:4px 10px;border-radius:999px;font-size:13px;display:flex;align-items:center;gap:5px;}
        .ec2-chip button{border:none;background:none;color:#1d4ed8;cursor:pointer;font-size:15px;line-height:1;padding:0;}
        .ec2-in{border:none;outline:none;font-size:14px;min-width:180px;flex:1;background:transparent;}
        .ec2-row-actions{display:flex;gap:8px;padding:0 12px;flex-shrink:0;}
        .ec2-row-actions button{border:1px solid #e2e8f0;background:#fff;padding:5px 12px;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;color:#475569;transition:all .15s;}
        .ec2-row-actions button:hover{background:#f1f5f9;}
        .ec2-body{flex:1;display:flex;flex-direction:column;overflow:hidden;}
        .ec2-tabs{display:flex;gap:0;background:#fff;border-bottom:1px solid #e2e8f0;flex-shrink:0;padding:0 16px;}
        .ec2-tab{border:none;background:none;padding:12px 18px;font-size:13px;font-weight:700;cursor:pointer;color:#64748b;border-bottom:2px solid transparent;transition:all .15s;}
        .ec2-tab.active{color:#0f172a;border-bottom-color:#0f172a;}
        .ec2-toolbar{padding:10px 14px;background:#fff;border-bottom:1px solid #e2e8f0;display:flex;flex-wrap:wrap;gap:6px;align-items:center;flex-shrink:0;}
        .ec2-toolbar-sep{width:1px;height:28px;background:#e2e8f0;margin:0 2px;}
        .tb-btn{border:none;background:#f1f5f9;width:32px;height:32px;border-radius:7px;cursor:pointer;font-size:13px;font-weight:700;display:flex;align-items:center;justify-content:center;transition:all .12s;color:#334155;flex-shrink:0;}
        .tb-btn:hover{background:#dbeafe;color:#1d4ed8;}
        .tb-select{border:1px solid #e2e8f0;background:#f8fafc;border-radius:7px;padding:0 8px;height:32px;font-size:12px;cursor:pointer;color:#334155;outline:none;}
        .ec2-canvas{flex:1;overflow:auto;padding:0;position:relative;}
        .ec2-iframe{width:100%;height:100%;border:none;display:block;}
        .ec2-code-area{flex:1;font-family:monospace;font-size:13px;padding:20px;border:none;outline:none;resize:none;background:#0f172a;color:#e2e8f0;line-height:1.7;}
        .ec2-footer{padding:14px 20px;border-top:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center;background:#fff;flex-shrink:0;gap:12px;flex-wrap:wrap;}
        .ec2-send{border:none;background:#0f172a;color:#fff;padding:12px 24px;border-radius:10px;font-weight:700;cursor:pointer;font-size:14px;transition:opacity .15s;}
        .ec2-send:hover:not(:disabled){opacity:.85;}
        .ec2-send:disabled{opacity:.5;cursor:not-allowed;}
        .ec2-tpl-btn{border:1px solid #e2e8f0;background:#fff;padding:10px 16px;border-radius:10px;font-weight:700;cursor:pointer;font-size:13px;color:#334155;transition:all .15s;}
        .ec2-tpl-btn:hover{background:#f1f5f9;}
        .tpl-overlay{position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:99999;display:flex;align-items:center;justify-content:center;}
        .tpl-box{background:#fff;border-radius:18px;overflow:hidden;width:680px;max-height:82vh;display:flex;flex-direction:column;box-shadow:0 24px 60px rgba(0,0,0,.4);}
        .tpl-header{padding:20px 24px;background:#0f172a;color:#fff;font-size:18px;font-weight:800;display:flex;justify-content:space-between;align-items:center;}
        .tpl-cats{display:flex;gap:6px;padding:14px 20px;border-bottom:1px solid #f1f5f9;flex-wrap:wrap;}
        .tpl-cat{border:1px solid #e2e8f0;background:#f8fafc;padding:6px 14px;border-radius:999px;font-size:12px;font-weight:700;cursor:pointer;color:#64748b;transition:all .15s;}
        .tpl-cat.active{background:#0f172a;color:#fff;border-color:#0f172a;}
        .tpl-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;padding:20px;overflow:auto;}
        .tpl-card{border:2px solid #e2e8f0;border-radius:14px;padding:20px 14px;text-align:center;cursor:pointer;transition:all .15s;}
        .tpl-card:hover{border-color:#0f172a;background:#f8fafc;}
        .tpl-thumb{font-size:36px;margin-bottom:10px;}
        .tpl-name{font-size:13px;font-weight:700;color:#334155;}
        .crop-overlay{position:fixed;inset:0;background:rgba(0,0,0,.8);z-index:999999;display:flex;align-items:center;justify-content:center;}
        .crop-box{background:#1e293b;border-radius:16px;overflow:hidden;box-shadow:0 24px 60px rgba(0,0,0,.6);}
        .crop-header{padding:16px 20px;color:#fff;font-size:16px;font-weight:800;display:flex;justify-content:space-between;align-items:center;}
        .crop-stage{position:relative;width:320px;height:240px;cursor:crosshair;}
        .crop-stage img{width:100%;height:100%;object-fit:cover;display:block;}
        .crop-selection{position:absolute;border:2px solid #60a5fa;background:rgba(96,165,250,.15);pointer-events:none;}
        .crop-actions{padding:14px 20px;display:flex;justify-content:flex-end;gap:10px;}
        .crop-actions button{border:none;padding:9px 18px;border-radius:8px;font-weight:700;font-size:13px;cursor:pointer;}
        .crop-actions .cancel{background:#334155;color:#fff;}
        .crop-actions .apply{background:#3b82f6;color:#fff;}
      `}</style>

      <div className="ec2-overlay">
        <div className="ec2-modal">
          <div className="ec2-header">
            <div className="ec2-header-title">✉ Advanced Email Composer</div>
            <button className="ec2-close" onClick={onClose}>×</button>
          </div>

          {/* TO / CC / SUBJECT */}
          <div className="ec2-meta">
            <div className="ec2-row">
              <div className="ec2-lbl">To</div>
              <div className="ec2-chips">
                {(toExpanded ? toList : toList.slice(0, 10)).map((e) => (
                  <div className="ec2-chip" key={e}>
                    {e}
                    <button onClick={() => removeEmail(toList, setToList, e)}>×</button>
                  </div>
                ))}
                {toList.length > 10 && !toExpanded && (
                  <button
                    onClick={() => setToExpanded(true)}
                    style={{
                      background: "#f1f5f9", color: "#475569", border: "1px solid #cbd5e1",
                      padding: "4px 10px", borderRadius: 999, fontSize: 12, fontWeight: 700,
                      cursor: "pointer", whiteSpace: "nowrap",
                    }}
                  >
                    +{toList.length - 10} more ▾
                  </button>
                )}
                {toExpanded && toList.length > 10 && (
                  <button
                    onClick={() => setToExpanded(false)}
                    style={{
                      background: "#f1f5f9", color: "#475569", border: "1px solid #cbd5e1",
                      padding: "4px 10px", borderRadius: 999, fontSize: 12, fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    ▴ collapse
                  </button>
                )}
                <input
                  className="ec2-in"
                  placeholder="Enter email & press Enter"
                  value={toInput}
                  onChange={(ev) => setToInput(ev.target.value)}
                  onKeyDown={(ev) => handleKeyEmail(ev, toList, setToList, setToInput)}
                  onBlur={(ev) => handleBlurEmail(ev.target.value, toList, setToList, setToInput)}
                />
              </div>
              <div className="ec2-row-actions">
                <button onClick={() => setShowCc((p) => !p)}>CC</button>
                <button onClick={() => setShowGroupModal(true)}>👥 Group</button>
              </div>
            </div>

            {showCc && (
              <div className="ec2-row">
                <div className="ec2-lbl">Cc</div>
                <div className="ec2-chips">
                  {ccList.map((e) => (
                    <div className="ec2-chip" key={e}>
                      {e}
                      <button onClick={() => removeEmail(ccList, setCcList, e)}>×</button>
                    </div>
                  ))}
                  <input
                    className="ec2-in"
                    placeholder="Enter cc email"
                    value={ccInput}
                    onChange={(ev) => setCcInput(ev.target.value)}
                    onKeyDown={(ev) => handleKeyEmail(ev, ccList, setCcList, setCcInput)}
                    onBlur={(ev) => handleBlurEmail(ev.target.value, ccList, setCcList, setCcInput)}
                  />
                </div>
              </div>
            )}

            <div className="ec2-row">
              <div className="ec2-lbl">Subject</div>
              <div className="ec2-chips">
                <input
                  className="ec2-in"
                  placeholder="Enter subject"
                  value={subject}
                  onChange={(ev) => setSubject(ev.target.value)}
                />
              </div>
            </div>
          </div>

          {/* BODY */}
          <div className="ec2-body">
            <div className="ec2-tabs">
              {[
                { id: "design", label: "🎨 Design" },
                // { id: "code", label: "{ } HTML Code" },
                { id: "preview", label: "👁 Preview" },
              ].map((t) => (
                <button
                  key={t.id}
                  className={`ec2-tab${activeTab === t.id ? " active" : ""}`}
                  onClick={() => setActiveTab(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {activeTab === "design" && (
              <div className="ec2-toolbar">
                <button className="tb-btn" title="Bold" onClick={() => exec("bold")}><b>B</b></button>
                <button className="tb-btn" title="Italic" onClick={() => exec("italic")}><i>I</i></button>
                <button className="tb-btn" title="Underline" onClick={() => exec("underline")}><u>U</u></button>
                <button className="tb-btn" title="Strike" onClick={() => exec("strikeThrough")}><s>S</s></button>
                <div className="ec2-toolbar-sep" />
                <select className="tb-select" value={fontFamily} onChange={(e) => { setFontFamily(e.target.value); exec("fontName", e.target.value); }} style={{ width: 130 }}>
                  {FONTS.map((f) => <option key={f} value={f}>{f.split(",")[0]}</option>)}
                </select>
                <select className="tb-select" value={fontSize} onChange={(e) => { setFontSize(e.target.value); exec("fontSize", e.target.value); }} style={{ width: 56 }}>
                  {["1", "2", "3", "4", "5", "6", "7"].map((s) => <option key={s} value={s}>{[10, 13, 16, 18, 24, 32, 48][+s - 1]}px</option>)}
                </select>
                <div className="ec2-toolbar-sep" />
                <label className="tb-btn" title="Font Color" style={{ position: "relative", overflow: "hidden" }}>
                  <span style={{ fontSize: 14, borderBottom: `3px solid ${fontColor}` }}>A</span>
                  <input type="color" value={fontColor} style={{ position: "absolute", opacity: 0, width: "100%", height: "100%", top: 0, left: 0, cursor: "pointer" }} onChange={(e) => { setFontColor(e.target.value); exec("foreColor", e.target.value); }} />
                </label>
                <label className="tb-btn" title="Highlight" style={{ position: "relative", overflow: "hidden" }}>
                  <span style={{ fontSize: 14, background: bgColor || "#fef08a", padding: "0 2px", borderRadius: 2 }}>BG</span>
                  <input type="color" value={bgColor || "#fef08a"} style={{ position: "absolute", opacity: 0, width: "100%", height: "100%", top: 0, left: 0, cursor: "pointer" }} onChange={(e) => { setBgColor(e.target.value); exec("hiliteColor", e.target.value); }} />
                </label>
                <div className="ec2-toolbar-sep" />
                <button className="tb-btn" title="Align Left" onClick={() => exec("justifyLeft")}>≡</button>
                <button className="tb-btn" title="Align Center" onClick={() => exec("justifyCenter")}>☰</button>
                <button className="tb-btn" title="Align Right" onClick={() => exec("justifyRight")}>≡</button>
                <div className="ec2-toolbar-sep" />
                <button className="tb-btn" onClick={() => exec("insertUnorderedList")}>•</button>
                <button className="tb-btn" onClick={() => exec("insertOrderedList")}>1.</button>
                <div className="ec2-toolbar-sep" />
                <button className="tb-btn" title="Insert Link" onClick={() => { const url = prompt("Enter URL:"); if (url) exec("createLink", url.startsWith("http") ? url : `https://${url}`); }}>🔗</button>
                <button className="tb-btn" title="Upload Image" onClick={() => fileInputRef.current?.click()}>🖼</button>
                <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => handleImageFile(e.target.files?.[0])} />
                <button className="tb-btn" title="Image URL" onClick={() => { const url = prompt("Enter Image URL:"); if (url) exec("insertImage", url); }}>🌐</button>
                <button className="tb-btn" title="Divider" onClick={() => exec("insertHTML", '<hr style="border:none;border-top:2px solid #e2e8f0;margin:24px 0;"/>')}>—</button>
                <button className="tb-btn" style={{ width: "auto", padding: "0 10px", fontSize: 11 }} onClick={() => { const label = prompt("Button text:", "Click Here"); const url = prompt("Button URL:", "https://"); if (label && url) exec("insertHTML", `<div style="text-align:center;margin:24px 0;"><a href="${url}" style="background:#0f172a;color:#fff;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;">${label}</a></div>`); }}>+ Button</button>
                <div className="ec2-toolbar-sep" />
                <button className="tb-btn" onClick={() => exec("undo")}>↩</button>
                <button className="tb-btn" onClick={() => exec("redo")}>↪</button>
              </div>
            )}

            <div className="ec2-canvas">
              {(activeTab === "design" || activeTab === "preview") && (
                <iframe ref={iframeRef} className="ec2-iframe" title="email-editor" sandbox="allow-same-origin allow-scripts allow-popups" />
              )}
              {activeTab === "code" && (
                <textarea className="ec2-code-area" value={htmlCode} onChange={(e) => setHtmlCode(e.target.value)} spellCheck={false} />
              )}
            </div>
          </div>

          <div className="ec2-footer">
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <button className="ec2-tpl-btn" onClick={() => setShowTemplates(true)}>📐 Templates</button>
              <span style={{ fontSize: 13, color: "#64748b" }}>👥 {toList.length} recipient{toList.length !== 1 ? "s" : ""}</span>
            </div>
            <button className="ec2-send" onClick={handleSend} disabled={sending}>
              {sending ? "Sending…" : "✈ Send Email"}
            </button>
          </div>
        </div>
      </div>

      {/* TEMPLATE GALLERY with categories */}
      {showTemplates && (
        <div className="tpl-overlay">
          <div className="tpl-box">
            <div className="tpl-header">
              <span>📐 Choose a Template</span>
              <button style={{ border: "none", background: "rgba(255,255,255,.15)", color: "#fff", borderRadius: 8, width: 30, height: 30, cursor: "pointer", fontSize: 18 }} onClick={() => setShowTemplates(false)}>×</button>
            </div>
            <div className="tpl-cats">
              {templateCategories.map((c) => (
                <button
                  key={c.id}
                  className={`tpl-cat${activeTplCategory === c.id ? " active" : ""}`}
                  onClick={() => setActiveTplCategory(c.id)}
                >
                  {c.label}
                </button>
              ))}
            </div>
            <div className="tpl-grid">
              {TEMPLATES.filter((t) => t.category === activeTplCategory).map((t) => (
                <div key={t.id} className="tpl-card" onClick={() => applyTemplate(t)}>
                  <div className="tpl-thumb">{t.thumb}</div>
                  <div className="tpl-name">{t.label}</div>
                </div>
              ))}
              {TEMPLATES.filter((t) => t.category === activeTplCategory).length === 0 && (
                <div style={{ gridColumn: "1/-1", textAlign: "center", color: "#94a3b8", padding: 32, fontSize: 14 }}>
                  No templates in this category
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showGroupModal && (
        <GroupEmailModal
          onClose={() => setShowGroupModal(false)}
          selectedGroups={selectedGroups}
          onSelectedGroupsChange={setSelectedGroups}
          onAddEmails={(emails) => {
            setToList((prev) => [...new Set([...prev, ...emails])]);
          }}
          onRemoveEmails={(emails) => {
            // Remove only emails that came from this group
            // (keep any that were manually typed or came from other groups)
            setToList((prev) => prev.filter(e => !emails.includes(e)));
          }}
          onGroupSelected={(groupId) => {
            setSelectedGroupId(groupId);
          }}
        />
      )}
      {/* CROP MODAL */}
      {showCrop && cropImage && (
        <div className="crop-overlay">
          <div className="crop-box">
            <div className="crop-header">
              <span style={{ color: "#fff" }}>✂ Crop Image</span>
              <button style={{ border: "none", background: "rgba(255,255,255,.15)", color: "#fff", borderRadius: 8, width: 28, height: 28, cursor: "pointer", fontSize: 18 }} onClick={() => { setShowCrop(false); setCropImage(null); }}>×</button>
            </div>
            <div
              className="crop-stage"
              onMouseDown={(e) => { const rect = e.currentTarget.getBoundingClientRect(); cropDragging.current = { startX: e.clientX - rect.left, startY: e.clientY - rect.top }; }}
              onMouseMove={(e) => { if (!cropDragging.current) return; const rect = e.currentTarget.getBoundingClientRect(); const x = Math.min(cropDragging.current.startX, e.clientX - rect.left); const y = Math.min(cropDragging.current.startY, e.clientY - rect.top); const w = Math.abs(e.clientX - rect.left - cropDragging.current.startX); const h = Math.abs(e.clientY - rect.top - cropDragging.current.startY); setCropRect({ x: Math.max(0, x), y: Math.max(0, y), w: Math.min(w, 320 - x), h: Math.min(h, 240 - y) }); }}
              onMouseUp={() => { cropDragging.current = null; }}
            >
              <img src={cropImage.src} alt="crop-source" draggable={false} />
              {cropRect.w > 4 && cropRect.h > 4 && (
                <div className="crop-selection" style={{ left: cropRect.x, top: cropRect.y, width: cropRect.w, height: cropRect.h }} />
              )}
            </div>
            <div className="crop-actions">
              <button className="cancel" onClick={() => { setShowCrop(false); setCropImage(null); }}>Cancel</button>
              {/* <button className="cancel" onClick={() => { exec("insertHTML", `<img src="${cropImage.src}" style="max-width:100%;border-radius:8px;display:block;margin:16px auto;" alt="image"/>`); setShowCrop(false); setCropImage(null); }}>Insert Full</button> */}
              <button className="cancel" onClick={async () => {
                const response = await fetch(cropImage.src);
                const blob = await response.blob();
                const file = new File([blob],cropImage.file.name || "image.jpg",{type: blob.type});
                const uploadedUrl = await handleFileChange(file);
                if (uploadedUrl) {
                  exec("insertHTML", `<div style="margin:20px 0;"><img src="${uploadedUrl}" style="
             max-width:100%;
             border-radius:8px;
             display:block;
             margin:16px auto;"  alt="image"/> </div> `);}
                setShowCrop(false);
                setCropImage(null);
              }} > Insert Full</button>
              <button className="apply" onClick={commitCrop}>Apply Crop</button>
            </div>
          </div>
        </div>
      )}

      <canvas ref={cropCanvasRef} style={{ display: "none" }} />
    </>
  );
}


// ═══════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════

function SubscriberGroupModal() {

}

export default function SubscribersList() {
  const [emailType, setEmailType] = useState("subscription");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [subs, setSubs] = useState([]);
  const [users, setUsers] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);
  const [showComposer, setShowComposer] = useState(false);
  const [newModal, setNewModal] = useState(false);

  const debouncedSearch = useDebouncedValue(search, 400);

  const fetchTableData = useCallback(async () => {
    try {
      setLoading(true);
      let apiUrl = config.getAllSuscribe;
      let payload = { page, pageSize, ...(debouncedSearch ? { search: debouncedSearch } : {}) };

      if (emailType === "user") {
        apiUrl = `${config.getUsers}/${page - 1}`;
        payload = { page: page - 1, pageSize, search: debouncedSearch };
      }

      const res = await postApi(apiUrl, payload);
      if (res?.statusCode === 200 || res?.statusCode === 201) {
        const data = emailType === "subscription" ? res.result ?? [] : res.data ?? [];
        setSubs(data);
        const total = res.totalCount ?? res.total ?? 0;
        setTotalCount(total);
        setTotalPages(Math.max(1, Math.ceil(total / pageSize)));
      }
    } catch (err) {
      console.error("fetchTableData error:", err);
      setToast({ msg: "Failed to load data", type: "error" });
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, emailType, debouncedSearch]);

  const fetchAllUsers = useCallback(async () => {
    try {
      const res = await postApi(`${config.getUsers}/${0}`, { page: 0, pageSize: 1000, search: "" });
      if (res?.statusCode === 200 || res?.statusCode === 201) setUsers(res?.data ?? []);
    } catch (err) {
      console.error("fetchAllUsers error:", err);
    }
  }, []);

  useEffect(() => { fetchAllUsers(); }, [fetchAllUsers]);
  useEffect(() => { fetchTableData(); }, [fetchTableData]);
  useEffect(() => { setPage(1); }, [emailType, debouncedSearch]);

  const handleSendEmail = async ({ to, cc, subject, body }) => {
    try {
      // await postApi(config.sendBulkEmail, { to, cc, subject, body });
      setToast({ msg: "Email sent successfully!", type: "success" });
      setShowComposer(false);
    } catch (err) {
      console.error("send email error:", err);
      setToast({ msg: "Failed to send email. Please try again.", type: "error" });
      throw err;
    }
  };

  const colSpan = emailType === "user" ? 5 : 4;

  async function handleOpenNewModal() {
    setNewModal(true);
  }

  const handleEdit = async (id) => {
    const subscriber = subs.find((s) => s._id === id);

    const { value: email } = await Swal.fire({
      title: "Edit Email",
      input: "email",
      inputValue: subscriber?.email || "",
      showCancelButton: true,
      confirmButtonText: "Update",
      inputValidator: (value) => {
        if (!value) {
          return "Email is required";
        }
      },
    })
    if (email) {
      try {
        const res = await postApi(config.updateSubscribeEmail, {
          _id: id,
          email,
        });

        if (res?.statusCode === 200) {
          Swal.fire(res?.message || "Updated!", "Subscriber updated successfully.", "success");

          fetchTableData(page, pageSize, debouncedSearch, emailType);
        } else {
          Swal.fire("Error", res?.message || "Failed to update.", "error");
        }
      } catch (e) {
        console.error(e);
        Swal.fire("Error", "Something went wrong.", "error");
      }
    }
  }

  const handleDelete = (id) => {
    Swal.fire({
      title: "Delete subscriber?",
      text: "This email will be removed permanently.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await postApi(config.deleteSuscribe, { id }); // backend expects { id }
          if (res?.statusCode === 200) {
            Swal.fire("Deleted!", res.message || "Subscriber removed.", "success");
            fetchTableData(page, pageSize, debouncedSearch, emailType); // refresh
          } else {
            Swal.fire("Error", res?.message || "Failed to delete.", "error");
          }
        } catch (e) {
          console.error(e);
          Swal.fire("Error", "Something went wrong.", "error");
        }
      }
    });
  }


  return (
    <>
      <style>{`
        .sl-page{padding:30px;background:#f1f5f9;min-height:100vh;}
        .sl-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;gap:20px;flex-wrap:wrap;}
        .sl-title{font-size:30px;font-weight:800;color:#0f172a;}
        .sl-subtitle{font-size:14px;color:#64748b;margin-top:2px;}
        .sl-controls{display:flex;gap:12px;flex-wrap:wrap;align-items:center;}
        .sl-search{height:42px;padding:0 16px;border-radius:10px;border:1px solid #cbd5e1;min-width:240px;outline:none;font-size:14px;}
        .sl-btn{border:none;background:#0f172a;color:#fff;padding:0 18px;border-radius:10px;cursor:pointer;font-weight:700;height:42px;font-size:13px;transition:opacity .15s;}
        .sl-btn:hover:not(:disabled){opacity:.8;}
        .sl-btn:disabled{opacity:.45;cursor:not-allowed;}
        .grp-btn{border:none;background:#26499a;color:#fff;padding:0 18px;border-radius:10px;cursor:pointer;font-weight:700;height:42px;font-size:13px;transition:opacity .15s;}
        .grp-btn:hover:not(:disabled){opacity:.8;}
        .grp-btn:disabled{opacity:.45;cursor:not-allowed;}
        .sl-toggle{display:flex;background:#e2e8f0;padding:4px;border-radius:12px;gap:4px;}
        .sl-toggle button{border:none;padding:9px 16px;border-radius:8px;cursor:pointer;font-weight:700;background:none;font-size:13px;color:#64748b;transition:all .15s;}
        .sl-toggle button.active{background:#fff;color:#0f172a;box-shadow:0 1px 4px rgba(0,0,0,.1);}
        .sl-card{background:#fff;border-radius:18px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.07);}
        table{width:100%;border-collapse:collapse;}
        th{background:#f8fafc;padding:14px 16px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:.5px;color:#64748b;font-weight:700;}
        td{padding:14px 16px;border-top:1px solid #f1f5f9;font-size:14px;color:#334155;}
        tr:hover td{background:#f8fafc;}
        .sl-email{background:#eff6ff;color:#1d4ed8;padding:6px 12px;border-radius:999px;display:inline-flex;align-items:center;gap:5px;font-size:13px;font-weight:600;}
        .sl-footer{padding:18px 20px;display:flex;justify-content:space-between;align-items:center;border-top:1px solid #f8fafc;flex-wrap:wrap;gap:12px;}
        .sl-count{font-size:13px;color:#64748b;}
      `}</style>

      <div className="sl-page">
        <div className="sl-header">
          <div>
            <div className="sl-title">Email Subscribers</div>
            <div className="sl-subtitle">{totalCount} total records</div>
          </div>
          <div className="sl-controls">
            <button className="grp-btn" onClick={() => { handleOpenNewModal() }}>
              Group manage
            </button>
            <div className="sl-toggle">
              <button className={emailType === "subscription" ? "active" : ""} onClick={() => setEmailType("subscription")}>Subscribers</button>
              <button className={emailType === "user" ? "active" : ""} onClick={() => setEmailType("user")}>Users</button>
            </div>
            <input className="sl-search" placeholder="Search email..." value={search} onChange={(e) => setSearch(e.target.value)} />
            <button className="sl-btn" onClick={() => setShowComposer(true)}>✉ Compose Email</button>
          </div>
        </div>

        <div className="sl-card">
          <table>
            <thead>
              <tr>
                <th style={{ width: 50 }}>#</th>
                {emailType === "user" && <th>Name</th>}
                <th>Email</th>
                <th>Date</th>
                <th style={{ width: 180 }}>Group</th>
                {emailType === "subscription" && (<th style={{ width: 180 }}>Action</th>)}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={colSpan} style={{ textAlign: "center", padding: 48, color: "#94a3b8" }}>Loading…</td></tr>
              ) : subs.length === 0 ? (
                <tr><td colSpan={colSpan} style={{ textAlign: "center", padding: 48, color: "#94a3b8" }}>No records found</td></tr>
              ) : (
                subs.map((s, idx) => (
                  <tr key={s._id ?? `${s.email}-${idx}`}>
                    <td style={{ color: "#94a3b8" }}>{(page - 1) * pageSize + idx + 1}</td>
                    {emailType === "user" && (
                      <td>{`${s.name || ""} ${s.lastName || ""}`.trim() || "—"}</td>
                    )}
                    <td>
                      <span className="sl-email">✉ {s.email}</span>
                    </td>
                    <td style={{ color: "#64748b" }}>{formatDate(s.createdAt || s.date)}</td>
                    <td>
                      <GroupDropdown
                        email={s.email}
                        groupId={s.groupId}        // ← from API
                        groupName={s.groupName}    // ← from API
                        onToast={setToast}
                        onRefresh={fetchTableData}
                        id={s._id}
                      />
                    </td>
                    {emailType === "subscription" && (
                      <td style={{ display: "flex" }}>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleEdit(s._id)}
                          title="Edit subscriber"
                        >
                          <PencilSquare size={16} />
                        </Button>
                        <Button
                          className="ms-1"
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDelete(s._id)}
                          title="Delete subscriber"
                        >
                          <Trash size={16} />
                        </Button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="sl-footer">
            <div className="sl-count">
              {totalCount === 0
                ? "No results"
                : `Showing ${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, totalCount)} of ${totalCount}`}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="sl-btn" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>← Prev</button>
              <span style={{ display: "flex", alignItems: "center", fontSize: 13, color: "#64748b", padding: "0 8px" }}>
                {page} / {totalPages}
              </span>
              <button className="sl-btn" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next →</button>
            </div>
          </div>
        </div>
      </div>

      {showComposer && (
        <EmailComposer
          onClose={() => setShowComposer(false)}
          onSend={handleSendEmail}
        />
      )}

      {newModal && (
        <GroupEmailModal11
          onClose={() => setNewModal(false)}
          onSend={handleSendEmail}
        />
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}
