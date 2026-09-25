"use client";

import { useState, useRef } from "react";

export default function EmailTemplateComposer({ subscribers, users, onClose, onSend }) {
  const [toList, setToList] = useState([]);
  const [ccList, setCcList] = useState([]);
  const [showCc, setShowCc] = useState(false);
  const [subject, setSubject] = useState("");
  const [activeTab, setActiveTab] = useState("compose");
  const [showGroup, setShowGroup] = useState(false);
  const [groupType, setGroupType] = useState("subscriber");
  const [groupTarget, setGroupTarget] = useState("to");
  const [groupSearch, setGroupSearch] = useState("");
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [toInput, setToInput] = useState("");
  const [ccInput, setCcInput] = useState("");
  const [sending, setSending] = useState(false);

  const editorRef = useRef(null);

  const contacts =
    groupType === "subscriber"
      ? subscribers.map((s) => ({
          email: s.email,
          name: s.email,
          source: "Subscriber",
        }))
      : users.map((u) => ({
          email: u.email,
          name: `${u.name || ""} ${u.lastName || ""}`.trim(),
          source: "User",
        }));

  const filteredContacts = contacts.filter((contact) =>
    contact.email.toLowerCase().includes(groupSearch.toLowerCase()) ||
    contact.name.toLowerCase().includes(groupSearch.toLowerCase())
  );

  const exec = (cmd, val = null) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, val);
  };

  const addEmail = (list, setList, email) => {
    if (!/\S+@\S+\.\S+/.test(email)) return;
    if (!list.includes(email)) setList((p) => [...p, email]);
  };

  const removeEmail = (list, setList, email) => {
    setList(list.filter((item) => item !== email));
  };

  const handleKeyEmail = (e, list, setList, setInput) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const value = e.target.value.replace(",", "").trim();
      if (value) {
        addEmail(list, setList, value);
        setInput("");
      }
    }
  };

  const applyGroup = () => {
    if (groupTarget === "to") {
      setToList((p) => [...new Set([...p, ...selectedEmails])]);
    } else {
      setCcList((p) => [...new Set([...p, ...selectedEmails])]);
      setShowCc(true);
    }
    setSelectedEmails([]);
    setShowGroup(false);
  };

  const handleAttachment = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const url = URL.createObjectURL(file);
      if (file.type.startsWith("image/")) {
        exec("insertImage", url);
      } else {
        exec("insertHTML", `<a href="${url}" target="_blank">${file.name}</a>`);
      }
    };
    input.click();
  };

  const getBodyHtml = () => editorRef.current?.innerHTML || "";

  const handleSend = async () => {
    const body = getBodyHtml();
    if (!toList.length) {
      alert("Please add recipient.");
      return;
    }
    if (!subject.trim()) {
      alert("Please enter subject.");
      return;
    }
    if (!body.replace(/<[^>]*>/g, "").trim()) {
      alert("Please add email content.");
      return;
    }

    setSending(true);
    try {
      await onSend({ to: toList, cc: ccList, subject, body });
    } finally {
      setSending(false);
    }
  };

  const previewHtml = `
    <div style="font-family:Arial, sans-serif;max-width:680px;margin:0 auto;border-radius:18px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 18px 80px rgba(15,23,42,.1);background:#fff;">
      <div style="background:linear-gradient(135deg,#0f172a 0%,#1f2937 100%);padding:28px 32px;color:#fff;">
        <h2 style="margin:0;font-size:22px;line-height:1.2;font-weight:700;">${subject || "Your email preview"}</h2>
        <p style="margin:10px 0 0;color:rgba(255,255,255,.72);font-size:13px;">Designed in the editor with fonts, colors, images and email-friendly layout.</p>
      </div>
      <div style="padding:28px 32px;color:#1f2937;background:#fff;line-height:1.75;font-size:15px;">
        ${getBodyHtml() || `<p style='color:#6b7280;font-style:italic;'>Start designing your email in the editor above.</p>`}
      </div>
      <div style="padding:20px 32px;background:#f8fafc;color:#475569;font-size:12px;">
        <div><strong>To:</strong> ${toList.join(", ") || "—"}</div>
        ${ccList.length ? `<div><strong>Cc:</strong> ${ccList.join(", ")}</div>` : ""}
      </div>
    </div>`;

  const TEXT_COLORS = ["#1f2937", "#b91c1c", "#c2410c", "#65a30d", "#2563eb", "#7c3aed", "#db2777", "#0f766e", "#334155"];
  const BG_COLORS = ["#ffffff", "#f8fafc", "#fef3c7", "#d1fae5", "#dbeafe", "#ede9fe", "#fee2e2", "#ecfccb", "#fef2f2"];

  return (
    <>
      <style>{`
        .ec-overlay{position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:99999;display:flex;justify-content:center;align-items:center;padding:16px;}
        .ec-modal{width:100%;max-width:1040px;height:92vh;background:#fff;border-radius:18px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 24px 80px rgba(15,23,42,.2);}
        .ec-header{display:flex;justify-content:space-between;align-items:center;padding:18px 26px;background:linear-gradient(135deg,#0f172a,#203a43);color:#fff;}
        .ec-title{font-size:20px;font-weight:700;letter-spacing:.02em;}
        .ec-close{border:none;background:rgba(255,255,255,.12);color:#fff;width:36px;height:36px;border-radius:12px;cursor:pointer;font-size:20px;}
        .ec-toolbar{display:flex;flex-wrap:wrap;gap:8px;padding:14px 20px;background:#f8fafc;border-bottom:1px solid #e2e8f0;}
        .ec-toolbar button{border:none;background:#fff;color:#334155;padding:9px 12px;border-radius:10px;cursor:pointer;box-shadow:0 2px 8px rgba(15,23,42,.08);transition:.15s;}
        .ec-toolbar button:hover{background:#e2e8f0;}
        .ec-toolbar input[type=color]{width:34px;height:34px;padding:0;border:none;cursor:pointer;border-radius:8px;}
        .ec-toolbar select{border:1px solid #d1d5db;border-radius:10px;padding:8px 10px;background:#fff;color:#334155;cursor:pointer;}
        .ec-body{display:flex;flex:1;overflow:hidden;min-height:0;}
        .ec-sidebar{width:280px;background:#f8fafc;padding:20px;border-right:1px solid #e2e8f0;display:flex;flex-direction:column;gap:16px;overflow-y:auto;min-height:0;max-height:calc(92vh - 120px);}
        .ec-section{background:#fff;border:1px solid #e2e8f0;border-radius:18px;overflow:hidden;}
        .ec-section-body{padding:16px;display:flex;flex-direction:column;gap:12px;}
        .ec-section-title{margin:0;color:#0f172a;font-size:14px;font-weight:700;letter-spacing:.02em;}
        .ec-section-btn{width:100%;border:none;background:#eff6ff;color:#1d4ed8;padding:10px 14px;border-radius:12px;font-weight:700;cursor:pointer;text-align:left;}
        .ec-section-btn:hover{background:#dbeafe;}
        .ec-form-row{display:flex;flex-direction:column;gap:6px;}
        .ec-form-row label{font-size:12px;color:#64748b;}
        .ec-form-row input{border:1px solid #d1d5db;border-radius:12px;padding:10px 12px;font-size:14px;}
        .ec-recipient-row{display:flex;flex-direction:column;gap:8px;padding:12px 14px;border:1px solid #e2e8f0;border-radius:16px;background:#fff;}
        .ec-recipient-label{font-size:12px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:.08em;}
        .ec-recipient-chips{display:flex;flex-wrap:wrap;gap:8px;max-height:150px;overflow:auto;}
        .ec-recipient-chip{background:#eff6ff;color:#1d4ed8;padding:7px 12px;border-radius:999px;font-size:13px;display:inline-flex;align-items:center;gap:6px;}
        .ec-recipient-chip button{border:none;background:none;color:#1d4ed8;cursor:pointer;font-size:14px;}
        .ec-recipient-input{border:1px solid #d1d5db;border-radius:12px;padding:10px 12px;font-size:14px;width:100%;}
        .ec-recipient-actions{display:flex;flex-direction:column;gap:8px;}
        .ec-main{flex:1;display:flex;flex-direction:column;overflow:hidden;min-height:0;}
        .ec-compose-tabs{display:flex;gap:8px;padding:16px 20px;background:#fff;border-bottom:1px solid #e2e8f0;}
        .ec-tab{padding:10px 16px;border:none;background:#f1f5f9;color:#475569;border-radius:12px;cursor:pointer;font-weight:700;}
        .ec-tab.active{background:#0f172a;color:#fff;}
        .ec-editor{flex:1;padding:24px 26px;outline:none;overflow:auto;background:#fff;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.8;color:#1f2937;min-height:0;}
        .ec-editor:empty::before{content:attr(data-ph);color:#9ca3af;}
        .ec-preview-wrap{flex:1;padding:24px;background:#f0f4f8;overflow:auto;min-height:0;}
        .ec-footer{display:flex;align-items:center;justify-content:space-between;padding:16px 20px;background:#fff;border-top:1px solid #e2e8f0;}
        .ec-btn{border:none;padding:12px 18px;border-radius:12px;font-weight:700;cursor:pointer;}
        .ec-cancel{background:#f1f5f9;color:#334155;}
        .ec-send{background:#0f172a;color:#fff;}
        .group-overlay{position:fixed;inset:0;background:rgba(15,23,42,.55);z-index:100000;display:flex;align-items:center;justify-content:center;padding:18px;}
        .group-box{width:100%;max-width:560px;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 28px 90px rgba(15,23,42,.2);display:flex;flex-direction:column;max-height:calc(100vh - 36px);}
        .group-header{padding:18px 20px;background:#0f172a;color:#fff;display:flex;align-items:center;justify-content:space-between;}
        .group-search{width:100%;border:none;padding:12px 16px;border-bottom:1px solid #e2e8f0;font-size:14px;outline:none;color:#0f172a;}
        .ec-group-meta{padding:14px 16px;background:#f8fafc;border-bottom:1px solid #e2e8f0;color:#475569;font-size:13px;display:flex;align-items:center;gap:12px;}
        .group-type-tabs{display:flex;gap:8px;}
        .group-type-tab{border:none;padding:8px 12px;border-radius:999px;background:#fff;color:#475569;cursor:pointer;}
        .group-type-tab.active{background:#0f172a;color:#fff;}
        .ec-group-list{flex:1;overflow:auto;}
        .ec-contact-row{display:flex;align-items:center;gap:12px;padding:12px 16px;border-bottom:1px solid #f1f5f9;cursor:pointer;transition:.12s;}
        .ec-contact-row:hover{background:#f8fafc;}
        .ec-contact-row input{width:16px;height:16px;cursor:pointer;}
        .group-footer{padding:14px 16px;background:#f8fafc;border-top:1px solid #e2e8f0;display:flex;gap:10px;align-items:center;justify-content:flex-end;}
        .group-footer .ec-btn{padding:10px 14px;font-size:13px;}
      `}</style>

      <div className="ec-overlay">
        <div className="ec-modal">
          <div className="ec-header">
            <div className="ec-title">Email Template Designer</div>
            <button className="ec-close" onClick={onClose}>×</button>
          </div>

          <div className="ec-toolbar">
            <button onClick={() => exec("bold")}><strong>B</strong></button>
            <button onClick={() => exec("italic")}><em>I</em></button>
            <button onClick={() => exec("underline")}><u>U</u></button>
            <button onClick={() => exec("strikeThrough")}><s>S</s></button>
            <button onClick={() => exec("insertUnorderedList")}>• List</button>
            <button onClick={() => exec("insertOrderedList")}>1. List</button>
            <button onClick={() => exec("justifyLeft")}>⬅</button>
            <button onClick={() => exec("justifyCenter")}>↔</button>
            <button onClick={() => exec("justifyRight")}>➡</button>
            <button onClick={() => {
              const url = prompt("Enter URL");
              if (url) exec("createLink", url);
            }}>🔗</button>
            <button onClick={handleAttachment}>📎</button>
            <button onClick={() => {
              const url = prompt("Enter Image URL");
              if (url) exec("insertImage", url);
            }}>🖼</button>
            <input type="color" title="Text color" onChange={(e) => exec("foreColor", e.target.value)} />
            <input type="color" title="Highlight color" onChange={(e) => exec("hiliteColor", e.target.value)} />
            <select onChange={(e) => exec("fontName", e.target.value)}>
              <option value="Arial">Arial</option>
              <option value="Georgia">Georgia</option>
              <option value="Verdana">Verdana</option>
              <option value="Tahoma">Tahoma</option>
              <option value="Courier New">Courier New</option>
            </select>
            <select onChange={(e) => exec("fontSize", e.target.value)}>
              <option value="2">12px</option>
              <option value="3">14px</option>
              <option value="4">16px</option>
              <option value="5">18px</option>
              <option value="6">24px</option>
              <option value="7">32px</option>
            </select>
          </div>

          <div className="ec-body">
            <div className="ec-sidebar">
              <div className="ec-section">
                <div className="ec-section-body">
                  <h4 className="ec-section-title">Recipients</h4>
                  <div className="ec-recipient-row">
                    <div className="ec-recipient-label">To</div>
                    <div className="ec-recipient-chips">
                      {toList.map((email) => (
                        <span className="ec-recipient-chip" key={email}>
                          {email}
                          <button onClick={() => removeEmail(toList, setToList, email)}>×</button>
                        </span>
                      ))}
                    </div>
                    <input
                      className="ec-recipient-input"
                      placeholder="Type email and press Enter"
                      value={toInput}
                      onChange={(e) => setToInput(e.target.value)}
                      onKeyDown={(e) => handleKeyEmail(e, toList, setToList, setToInput)}
                    />
                  </div>
                  <div className="ec-recipient-row">
                    <div className="ec-recipient-label">Cc</div>
                    <div className="ec-recipient-chips">
                      {ccList.map((email) => (
                        <span className="ec-recipient-chip" key={email}>
                          {email}
                          <button onClick={() => removeEmail(ccList, setCcList, email)}>×</button>
                        </span>
                      ))}
                    </div>
                    <input
                      className="ec-recipient-input"
                      placeholder="Type email and press Enter"
                      value={ccInput}
                      onChange={(e) => setCcInput(e.target.value)}
                      onKeyDown={(e) => handleKeyEmail(e, ccList, setCcList, setCcInput)}
                    />
                  </div>
                  <div className="ec-recipient-actions">
                    <button className="ec-section-btn" onClick={() => { setGroupTarget("to"); setShowGroup(true); }}>Add group to To</button>
                    <button className="ec-section-btn" onClick={() => { setGroupTarget("cc"); setShowGroup(true); setShowCc(true); }}>Add group to Cc</button>
                  </div>
                </div>
              </div>

              <div className="ec-section">
                <div className="ec-section-body">
                  <h4 className="ec-section-title">Template Blocks</h4>
                  <button className="ec-section-btn" onClick={() => exec("insertHTML", `<div style=\"padding:24px 24px 0; background:#0f172a; color:#fff; text-align:center;\"><h2 style=\"margin:0;font-size:24px;\">Special Newsletter</h2><p style=\"margin:10px auto 0;max-width:560px;color:rgba(255,255,255,.72);\">Use this section to share your latest news and updates.</p></div><div style=\"padding:24px;\"><p>Write your message here. Use bold, colors, and lists to highlight important points.</p><ul><li>Beautiful email section</li><li>Responsive content</li><li>Easy editing</li></ul></div>`)}>Banner Style</button>
                  <button className="ec-section-btn" onClick={() => exec("insertHTML", `<div style=\"padding:20px;\"><img src=\"https://images.unsplash.com/photo-1536245025002-752f4c408c8a?auto=format&fit=crop&w=900&q=80\" style=\"width:100%;border-radius:16px;max-height:260px;object-fit:cover;\" /><div style=\"margin-top:18px;\"><h3 style=\"margin:0 0 12px;\">Eye-catching design</h3><p style=\"margin:0;color:#475569;\">Add a beautiful image to make your email shine, then continue with text below.</p></div></div>`)}>Image + Text</button>
                  <button className="ec-section-btn" onClick={() => exec("insertHTML", `<div style=\"padding:28px 32px;\"><h3 style=\"margin:0 0 12px;color:#111827;\">Minimal Announcement</h3><p style=\"margin:0 0 18px;color:#475569;\">Create a clean professional message with simple formatting and a call to action.</p><p style=\"margin:0;color:#1d4ed8;\"><strong>Tip:</strong> Use the editor toolbar to change fonts and colors.</p></div>`)}>Minimal</button>
                </div>
              </div>

              <div className="ec-section">
                <div className="ec-section-body">
                  <h4 className="ec-section-title">Email Settings</h4>
                  <div className="ec-form-row">
                    <label>Copy subject</label>
                    <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Email Subject" />
                  </div>
                  <div className="ec-form-row">
                    <label>Text color</label>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {TEXT_COLORS.map((color) => (
                        <button key={color} className="ec-section-btn" style={{ background: color, minHeight: 34 }} onClick={() => exec("foreColor", color)}>&nbsp;</button>
                      ))}
                    </div>
                  </div>
                  <div className="ec-form-row">
                    <label>Highlight color</label>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {BG_COLORS.map((color) => (
                        <button key={color} className="ec-section-btn" style={{ background: color, minHeight: 34 }} onClick={() => exec("hiliteColor", color)}>&nbsp;</button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="ec-main">
              <div className="ec-compose-tabs">
                <button className={`ec-tab ${activeTab === "compose" ? "active" : ""}`} onClick={() => setActiveTab("compose")}>Compose</button>
                <button className={`ec-tab ${activeTab === "preview" ? "active" : ""}`} onClick={() => setActiveTab("preview")}>Preview</button>
              </div>

              {activeTab === "compose" ? (
                <div ref={editorRef} className="ec-editor" contentEditable suppressContentEditableWarning data-ph="Start designing your email template here..."></div>
              ) : (
                <div className="ec-preview-wrap" dangerouslySetInnerHTML={{ __html: previewHtml }} />
              )}

              <div className="ec-footer">
                <div style={{ color: "#64748b", fontSize: 13 }}>{toList.length} recipient(s), cc {ccList.length}</div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button className="ec-btn ec-cancel" onClick={onClose}>Cancel</button>
                  <button className="ec-btn ec-send" onClick={handleSend} disabled={sending}>{sending ? "Sending..." : "Send Email"}</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showGroup && (
        <div className="group-overlay">
          <div className="group-box">
            <div className="group-header">
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ fontWeight: 700 }}>Select recipients</div>
                <div style={{ fontSize: 13, color: "#d1d5db" }}>
                  Add selected contacts to {groupTarget.toUpperCase()}.
                </div>
              </div>
              <button className="ec-close" onClick={() => setShowGroup(false)}>×</button>
            </div>
            <div className="ec-group-meta">
              <span>{filteredContacts.length} contacts</span>
              <span>{selectedEmails.length} selected</span>
              <div className="group-type-tabs">
                <button className={`group-type-tab ${groupType === "subscriber" ? "active" : ""}`} onClick={() => setGroupType("subscriber")}>Subscribers</button>
                <button className={`group-type-tab ${groupType === "user" ? "active" : ""}`} onClick={() => setGroupType("user")}>Users</button>
              </div>
              <button style={{ marginLeft: "auto", border: "none", background: "none", color: "#475569", fontSize: 12, cursor: "pointer", fontWeight: 700 }}
                onClick={() => setSelectedEmails(selectedEmails.length === filteredContacts.length ? [] : filteredContacts.map((c) => c.email))}>
                {selectedEmails.length === filteredContacts.length ? "Deselect All" : "Select All"}
              </button>
            </div>
            <input
              className="group-search"
              value={groupSearch}
              onChange={(e) => setGroupSearch(e.target.value)}
              placeholder="Search contacts..."
            />
            <div className="ec-group-list">
              {filteredContacts.length === 0 ? (
                <div style={{ padding: 24, color: "#94a3b8", textAlign: "center" }}>No contacts found.</div>
              ) : filteredContacts.map((contact) => {
                const checked = selectedEmails.includes(contact.email);
                return (
                  <div key={contact.email} className="ec-contact-row" onClick={() => {
                    if (checked) {
                      setSelectedEmails((prev) => prev.filter((email) => email !== contact.email));
                    } else {
                      setSelectedEmails((prev) => [...prev, contact.email]);
                    }
                  }}>
                    <input type="checkbox" checked={checked} readOnly />
                    <div>
                      <div style={{ fontWeight: 700, color: "#0f172a" }}>{contact.name}</div>
                      <div style={{ color: "#64748b", fontSize: 13 }}>{contact.email}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="group-footer">
              <button className="ec-btn ec-send" onClick={applyGroup} disabled={!selectedEmails.length}>
                Add to {groupTarget.toUpperCase()} ({selectedEmails.length})
              </button>
              <button className="ec-btn ec-cancel" onClick={() => setShowGroup(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
