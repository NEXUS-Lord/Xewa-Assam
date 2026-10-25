import React, { useState, useEffect } from "react";
import {
  X, Shield, CheckCircle, XCircle, AlertTriangle, Users,
  ListFilter, Plus, RefreshCw, Trash2, Eye, ShieldAlert, Check, Database, MessageSquare, Mail, Send
} from "lucide-react";
import { listingsRepo } from "../data/listingsRepo";
import { authRepo } from "../data/authRepo";
import { reportsRepo } from "../data/reportsRepo";
import { CITIES, CATEGORIES } from "../core/constants";
import {
  getUserApprovalWhatsAppUrl,
  getAdminWhatsApp,
  saveAdminWhatsApp
} from "../core/whatsappAlert";
import {
  getEmailConfig,
  saveEmailConfig,
  sendTestEmailAlert,
  sendUserApprovalEmail,
  sendListingStatusEmail
} from "../core/emailAlert";

export default function AdminDashboard({
  currentUser,
  onClose,
  onOpenListingDetail,
  onOpenSupabaseConfig,
  onShowToast
}) {
  const [activeTab, setActiveTab] = useState("pending"); // 'pending' | 'users' | 'reports' | 'allListings'
  const [pendingListings, setPendingListings] = useState([]);
  const [allListings, setAllListings] = useState([]);
  const [users, setUsers] = useState([]);
  const [userSubTab, setUserSubTab] = useState("pendingUsers"); // 'pendingUsers' | 'approvedUsers'
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [adminPhone, setAdminPhone] = useState(() => getAdminWhatsApp());
  const [adminPhoneInput, setAdminPhoneInput] = useState(() => getAdminWhatsApp());
  const [emailConfig, setEmailConfig] = useState(() => getEmailConfig());
  const [showEmailSettings, setShowEmailSettings] = useState(false);
  const [sendingTestEmail, setSendingTestEmail] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pendingRes, allRes, usersRes, reportsRes] = await Promise.all([
        listingsRepo.getAdminPendingListings(),
        listingsRepo.getAllAdminListings(),
        authRepo.getAllProfiles(),
        reportsRepo.getReports()
      ]);

      if (pendingRes.data) setPendingListings(pendingRes.data);
      if (allRes.data) setAllListings(allRes.data);
      if (usersRes.data) setUsers(usersRes.data);
      if (reportsRes.data) setReports(reportsRes.data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApproveListing = async (listingId) => {
    const lst = pendingListings.find(l => l.id === listingId) || allListings.find(l => l.id === listingId);
    await listingsRepo.updateListing(listingId, { status: "approved", is_verified: true });
    if (lst) {
      sendListingStatusEmail(lst, lst.owner_email, true);
    }
    onShowToast?.("Listing approved & published! Automated email sent. ✅", "success");
    loadData();
  };

  const handleRejectListing = async (listingId) => {
    const lst = pendingListings.find(l => l.id === listingId) || allListings.find(l => l.id === listingId);
    await listingsRepo.updateListing(listingId, { status: "rejected" });
    if (lst) {
      sendListingStatusEmail(lst, lst.owner_email, false);
    }
    onShowToast?.("Listing rejected. Notification email sent.", "info");
    loadData();
  };

  const handleDeleteListing = async (listingId) => {
    if (confirm("Are you sure you want to permanently delete this listing?")) {
      await listingsRepo.deleteListing(listingId);
      onShowToast?.("Listing deleted.", "info");
      loadData();
    }
  };

  const handleToggleUserApproval = async (targetUserId, approved) => {
    const targetUser = users.find(u => u.id === targetUserId);
    const { error } = await authRepo.setUserApproval(targetUserId, approved);
    if (error) {
      onShowToast?.(error, "error");
    } else {
      if (targetUser) {
        sendUserApprovalEmail(targetUser, approved);
      }
      onShowToast?.(approved ? `User approved & confirmation email sent to ${targetUser?.email || "user"}! 🎉` : "User access revoked. Status email sent.", "success");
      loadData();
    }
  };

  const handleApproveAndNotifyWhatsApp = async (user) => {
    await handleToggleUserApproval(user.id, true);
    const waUrl = getUserApprovalWhatsAppUrl(user);
    if (waUrl) {
      window.open(waUrl, "_blank");
      onShowToast?.(`User approved! Opening WhatsApp notification for ${user.full_name} 💬`, "success");
    } else {
      onShowToast?.(`User approved: ${user.full_name} ✅`, "success");
    }
  };

  const handleSaveAdminPhone = () => {
    const cleaned = adminPhoneInput.replace(/\D/g, "").slice(-10);
    if (cleaned.length < 10) {
      onShowToast?.("Please enter a valid 10-digit mobile number.", "error");
      return;
    }
    saveAdminWhatsApp(cleaned);
    setAdminPhone(cleaned);
    onShowToast?.(`Admin WhatsApp updated to +91 ${cleaned}! ✅`, "success");
  };

  const handleSaveEmailConfig = () => {
    saveEmailConfig(emailConfig);
    onShowToast?.("Email alert settings saved! 📧", "success");
  };

  const handleSendTestEmail = async () => {
    if (!emailConfig.adminEmail) {
      onShowToast?.("Please enter a recipient email address.", "error");
      return;
    }
    setSendingTestEmail(true);
    const res = await sendTestEmailAlert(emailConfig.adminEmail);
    setSendingTestEmail(false);
    if (res.delivered) {
      onShowToast?.(`Test email delivered to ${emailConfig.adminEmail}! Check inbox/spam. 🚀`, "success");
    } else if (res.simulated) {
      onShowToast?.(`Alert generated! To receive it in Gmail, paste your free Web3Forms key.`, "info");
    } else {
      onShowToast?.("Test failed: " + (res.error || "Please check your key"), "error");
    }
  };

  const handleResolveReport = async (reportId) => {
    await reportsRepo.resolveReport(reportId);
    onShowToast?.("Report marked as resolved.", "success");
    loadData();
  };

  const pendingUsers = users.filter(u => !u.approved && u.role !== "admin");
  const approvedUsers = users.filter(u => u.approved || u.role === "admin");

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "860px" }}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#fef3c7", color: "#b45309", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Shield size={18} />
            </div>
            <div>
              <h3 className="modal-title">Admin Management Portal</h3>
              <span style={{ fontSize: "11px", color: "#64748b" }}>Control listings, users, and community reports</span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              className="btn-icon"
              onClick={() => setShowEmailSettings(!showEmailSettings)}
              title="Automated Email Alerts Configuration"
              style={{ color: emailConfig.web3formsKey ? "#059669" : "#0284c7" }}
            >
              <Mail size={15} />
            </button>
            <button
              className="btn-icon"
              onClick={onOpenSupabaseConfig}
              title="Database / Supabase Backend Settings"
              style={{ color: "#059669" }}
            >
              <Database size={15} />
            </button>
            <button className="btn-icon" onClick={loadData} title="Refresh data">
              <RefreshCw size={15} />
            </button>
            <button className="modal-close-btn" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Email Alert Configuration Panel */}
        {showEmailSettings && (
          <div style={{
            background: "#f0fdf4",
            borderBottom: "1.5px solid #86efac",
            padding: "16px 20px"
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Mail size={17} color="#16a34a" />
                <strong style={{ fontSize: "14px", color: "#166534" }}>Automated Background Email Alerts</strong>
              </div>
              <button
                onClick={() => setShowEmailSettings(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
              <div>
                <label style={{ fontSize: "11px", fontWeight: "700", color: "#166534", display: "block", marginBottom: "3px" }}>
                  Admin Alert Email
                </label>
                <input
                  type="email"
                  className="form-input"
                  value={emailConfig.adminEmail || ""}
                  onChange={(e) => setEmailConfig({ ...emailConfig, adminEmail: e.target.value })}
                  placeholder="nilamx3000@gmail.com"
                  style={{ background: "#ffffff", padding: "6px 10px", fontSize: "12px" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "11px", fontWeight: "700", color: "#166534", display: "block", marginBottom: "3px" }}>
                  Web3Forms Key (Admin Alerts)
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={emailConfig.web3formsKey || ""}
                  onChange={(e) => setEmailConfig({ ...emailConfig, web3formsKey: e.target.value })}
                  placeholder="e.g. 1a2b3c4d-5e6f-..."
                  style={{ background: "#ffffff", padding: "6px 10px", fontSize: "12px" }}
                />
              </div>
            </div>

            {/* EmailJS Outbound Configuration for User Notifications */}
            <div style={{ background: "#ffffff", border: "1px solid #bbf7d0", padding: "10px 14px", borderRadius: "10px", marginBottom: "12px" }}>
              <div style={{ fontSize: "12px", fontWeight: "700", color: "#166534", marginBottom: "6px" }}>
                📧 Outbound Emails to Users (EmailJS — Free 200/mo):
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
                <div>
                  <label style={{ fontSize: "10px", color: "#64748b", fontWeight: "600", display: "block", marginBottom: "2px" }}>Service ID</label>
                  <input
                    type="text"
                    className="form-input"
                    value={emailConfig.emailjsServiceId || ""}
                    onChange={(e) => setEmailConfig({ ...emailConfig, emailjsServiceId: e.target.value })}
                    placeholder="service_xxx"
                    style={{ padding: "4px 8px", fontSize: "11px" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "10px", color: "#64748b", fontWeight: "600", display: "block", marginBottom: "2px" }}>Template ID</label>
                  <input
                    type="text"
                    className="form-input"
                    value={emailConfig.emailjsTemplateId || ""}
                    onChange={(e) => setEmailConfig({ ...emailConfig, emailjsTemplateId: e.target.value })}
                    placeholder="template_xxx"
                    style={{ padding: "4px 8px", fontSize: "11px" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "10px", color: "#64748b", fontWeight: "600", display: "block", marginBottom: "2px" }}>Public Key</label>
                  <input
                    type="text"
                    className="form-input"
                    value={emailConfig.emailjsPublicKey || ""}
                    onChange={(e) => setEmailConfig({ ...emailConfig, emailjsPublicKey: e.target.value })}
                    placeholder="public_xxx"
                    style={{ padding: "4px 8px", fontSize: "11px" }}
                  />
                </div>
              </div>
              <span style={{ fontSize: "10px", color: "#64748b", marginTop: "4px", display: "block" }}>
                ⚡ Free setup at <a href="https://www.emailjs.com" target="_blank" rel="noreferrer" style={{ color: "#16a34a", textDecoration: "underline", fontWeight: "700" }}>emailjs.com</a>: Connects your Gmail to automatically email users when you accept/reject their account or listings!
              </span>
            </div>

            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <button
                type="button"
                onClick={handleSaveEmailConfig}
                className="btn-primary"
                style={{ padding: "7px 16px", fontSize: "12px" }}
              >
                Save Settings
              </button>
              <button
                type="button"
                onClick={handleSendTestEmail}
                disabled={sendingTestEmail}
                style={{
                  background: "#ffffff",
                  border: "1px solid #86efac",
                  borderRadius: "8px",
                  padding: "7px 14px",
                  fontSize: "12px",
                  fontWeight: "700",
                  color: "#166534",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  cursor: "pointer"
                }}
              >
                <Send size={13} color="#16a34a" />
                <span>{sendingTestEmail ? "Sending test..." : "Send Test Email to Inbox"}</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div style={{ display: "flex", borderBottom: "1px solid #e2e8f0", background: "#f8fafc", padding: "0 20px" }}>
          <button
            onClick={() => setActiveTab("pending")}
            style={{
              padding: "12px 16px",
              fontSize: "13px",
              fontWeight: "700",
              color: activeTab === "pending" ? "#047857" : "#64748b",
              borderBottom: activeTab === "pending" ? "2px solid #059669" : "2px solid transparent",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            <span>Pending Listings</span>
            {pendingListings.length > 0 && (
              <span style={{ background: "#ef4444", color: "#fff", borderRadius: "999px", padding: "1px 7px", fontSize: "11px" }}>
                {pendingListings.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("users")}
            style={{
              padding: "12px 16px",
              fontSize: "13px",
              fontWeight: "700",
              color: activeTab === "users" ? "#047857" : "#64748b",
              borderBottom: activeTab === "users" ? "2px solid #059669" : "2px solid transparent",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            <Users size={15} />
            <span>Users & Approvals</span>
            {pendingUsers.length > 0 && (
              <span style={{ background: "#f59e0b", color: "#fff", borderRadius: "999px", padding: "1px 7px", fontSize: "11px" }}>
                {pendingUsers.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("reports")}
            style={{
              padding: "12px 16px",
              fontSize: "13px",
              fontWeight: "700",
              color: activeTab === "reports" ? "#047857" : "#64748b",
              borderBottom: activeTab === "reports" ? "2px solid #059669" : "2px solid transparent",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            <AlertTriangle size={15} />
            <span>Reports</span>
            {reports.filter(r => r.status === "open").length > 0 && (
              <span style={{ background: "#ef4444", color: "#fff", borderRadius: "999px", padding: "1px 7px", fontSize: "11px" }}>
                {reports.filter(r => r.status === "open").length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("allListings")}
            style={{
              padding: "12px 16px",
              fontSize: "13px",
              fontWeight: "700",
              color: activeTab === "allListings" ? "#047857" : "#64748b",
              borderBottom: activeTab === "allListings" ? "2px solid #059669" : "2px solid transparent"
            }}
          >
            All Listings ({allListings.length})
          </button>

        </div>

        {/* Tab Contents */}
        <div className="modal-body">
          {/* 1. Pending Listings Queue */}
          {activeTab === "pending" && (
            <div>
              {pendingListings.length === 0 ? (
                <div className="empty-state">
                  <CheckCircle size={44} color="#059669" style={{ marginBottom: "10px" }} />
                  <div className="empty-state-title">No Pending Listings</div>
                  <div className="empty-state-desc">The submission queue is clean! All submissions have been moderated.</div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {pendingListings.map(listing => (
                    <div
                      key={listing.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "14px 16px",
                        background: "#ffffff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "12px",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
                      }}
                    >
                      <div style={{ flex: 1, marginRight: "16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                          <span style={{ fontSize: "15px", fontWeight: "700", color: "#0f172a" }}>{listing.name}</span>
                          <span style={{ fontSize: "11px", fontWeight: "600", padding: "2px 8px", background: "#fef3c7", color: "#b45309", borderRadius: "999px" }}>
                            {listing.city_name}
                          </span>
                        </div>
                        <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "4px" }}>
                          Locality: <strong>{listing.locality}</strong> • Phone: <strong>+91 {listing.phone}</strong>
                        </div>
                        <div style={{ fontSize: "12px", color: "#475569" }}>
                          {listing.description}
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <button
                          onClick={() => onOpenListingDetail(listing)}
                          className="btn-icon"
                          title="Preview details"
                        >
                          <Eye size={16} />
                        </button>

                        <button
                          onClick={() => handleApproveListing(listing.id)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                            background: "#059669",
                            color: "#ffffff",
                            padding: "8px 14px",
                            borderRadius: "8px",
                            fontSize: "12px",
                            fontWeight: "700"
                          }}
                        >
                          <Check size={14} />
                          <span>Approve</span>
                        </button>

                        <button
                          onClick={() => handleRejectListing(listing.id)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                            background: "#fee2e2",
                            color: "#b91c1c",
                            padding: "8px 12px",
                            borderRadius: "8px",
                            fontSize: "12px",
                            fontWeight: "700"
                          }}
                        >
                          <X size={14} />
                          <span>Reject</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 2. User Accounts & Approvals */}
          {activeTab === "users" && (
            <div>
              {/* Native Admin WhatsApp Alert Setting */}
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                padding: "10px 14px",
                borderRadius: "12px",
                marginBottom: "16px",
                flexWrap: "wrap",
                gap: "10px"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#166534" }}>
                  <MessageSquare size={16} />
                  <span>Your Admin WhatsApp: <strong>+91 {adminPhone || "9854011223"}</strong></span>
                  <span style={{ fontSize: "11px", color: "#64748b" }}>(Receives alerts for registrations & listings)</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <input
                    type="tel"
                    placeholder="10-digit number"
                    maxLength={10}
                    value={adminPhoneInput}
                    onChange={(e) => setAdminPhoneInput(e.target.value)}
                    style={{
                      padding: "5px 10px",
                      fontSize: "12px",
                      border: "1px solid #86efac",
                      borderRadius: "6px",
                      width: "125px",
                      background: "#ffffff"
                    }}
                  />
                  <button
                    onClick={handleSaveAdminPhone}
                    style={{
                      background: "#16a34a",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "6px",
                      padding: "5px 12px",
                      fontSize: "12px",
                      fontWeight: "700",
                      cursor: "pointer"
                    }}
                  >
                    Save
                  </button>
                </div>
              </div>

              <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
                <button
                  onClick={() => setUserSubTab("pendingUsers")}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "999px",
                    fontSize: "12px",
                    fontWeight: "700",
                    background: userSubTab === "pendingUsers" ? "#064e3b" : "#f1f5f9",
                    color: userSubTab === "pendingUsers" ? "#ffffff" : "#475569"
                  }}
                >
                  Pending Users ({pendingUsers.length})
                </button>
                <button
                  onClick={() => setUserSubTab("approvedUsers")}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "999px",
                    fontSize: "12px",
                    fontWeight: "700",
                    background: userSubTab === "approvedUsers" ? "#064e3b" : "#f1f5f9",
                    color: userSubTab === "approvedUsers" ? "#ffffff" : "#475569"
                  }}
                >
                  Approved Accounts ({approvedUsers.length})
                </button>
              </div>

              {userSubTab === "pendingUsers" ? (
                pendingUsers.length === 0 ? (
                  <div className="empty-state">
                    <CheckCircle size={40} color="#059669" style={{ marginBottom: "8px" }} />
                    <div className="empty-state-title">No pending users</div>
                    <div className="empty-state-desc">All user signups have been reviewed!</div>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {pendingUsers.map(u => (
                      <div
                        key={u.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "14px 16px",
                          background: "#ffffff",
                          border: "1px solid #fed7aa",
                          borderRadius: "12px",
                          gap: "12px",
                          flexWrap: "wrap"
                        }}
                      >
                        <div style={{ flex: 1, minWidth: "220px" }}>
                          <div style={{ fontSize: "15px", fontWeight: "700", color: "#0f172a", marginBottom: "4px" }}>
                            {u.full_name}
                          </div>
                          <div style={{ fontSize: "12px", color: "#64748b", display: "flex", flexDirection: "column", gap: "2px" }}>
                            <div>Email: <strong style={{ color: "#0f172a" }}>{u.email}</strong></div>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", marginTop: "2px" }}>
                              <span>📞 Call: <strong style={{ color: "#0f172a" }}>+91 {u.phone || "N/A"}</strong></span>
                              <span style={{ color: "#16a34a" }}>💬 WhatsApp: <strong>+91 {u.whatsapp || u.phone || "N/A"}</strong></span>
                            </div>
                          </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                          <button
                            onClick={() => handleApproveAndNotifyWhatsApp(u)}
                            style={{
                              background: "linear-gradient(135deg, #16a34a, #15803d)",
                              color: "#ffffff",
                              padding: "8px 14px",
                              borderRadius: "8px",
                              fontSize: "12px",
                              fontWeight: "700",
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              boxShadow: "0 2px 8px rgba(22, 163, 74, 0.25)"
                            }}
                            title="Approve user and send instant approval message on WhatsApp"
                          >
                            <MessageSquare size={14} />
                            <span>Approve & WhatsApp</span>
                          </button>

                          <button
                            onClick={() => handleToggleUserApproval(u.id, true)}
                            style={{
                              background: "#059669",
                              color: "#ffffff",
                              padding: "8px 14px",
                              borderRadius: "8px",
                              fontSize: "12px",
                              fontWeight: "700"
                            }}
                          >
                            Approve Only
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {approvedUsers.map(u => (
                    <div
                      key={u.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "12px 16px",
                        background: "#ffffff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "10px",
                        gap: "10px",
                        flexWrap: "wrap"
                      }}
                    >
                      <div style={{ flex: 1, minWidth: "200px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ fontSize: "14px", fontWeight: "700", color: "#0f172a" }}>{u.full_name}</span>
                          {u.role === "admin" && (
                            <span style={{ background: "#fef3c7", color: "#b45309", fontSize: "10px", padding: "2px 6px", borderRadius: "999px", fontWeight: "800" }}>
                              ADMIN
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: "12px", color: "#64748b", marginTop: "3px" }}>
                          {u.email} • Call: +91 {u.phone || "N/A"} • WA: +91 {u.whatsapp || u.phone || "N/A"}
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        {(u.whatsapp || u.phone) && (
                          <button
                            onClick={() => {
                              const num = (u.whatsapp || u.phone).replace(/\D/g, "");
                              window.open(`https://wa.me/91${num}`, "_blank");
                            }}
                            style={{
                              background: "rgba(37, 211, 102, 0.12)",
                              border: "1px solid rgba(37, 211, 102, 0.3)",
                              color: "#15803d",
                              padding: "6px 10px",
                              borderRadius: "8px",
                              fontSize: "11px",
                              fontWeight: "700",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px"
                            }}
                            title="Chat with user on WhatsApp"
                          >
                            <MessageSquare size={13} />
                            <span>WhatsApp</span>
                          </button>
                        )}

                        {u.role !== "admin" && (
                          <button
                            onClick={() => handleToggleUserApproval(u.id, false)}
                            style={{
                              background: "#fee2e2",
                              color: "#b91c1c",
                              padding: "6px 12px",
                              borderRadius: "8px",
                              fontSize: "12px",
                              fontWeight: "600"
                            }}
                          >
                            Revoke Access
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 3. Reports Queue */}
          {activeTab === "reports" && (
            <div>
              {reports.length === 0 ? (
                <div className="empty-state">
                  <ShieldCheck size={40} color="#059669" style={{ marginBottom: "8px" }} />
                  <div className="empty-state-title">No community reports</div>
                  <div className="empty-state-desc">No listings have been flagged for incorrect info.</div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {reports.map(rep => (
                    <div
                      key={rep.id}
                      style={{
                        padding: "14px 16px",
                        background: "#ffffff",
                        border: rep.status === "open" ? "1px solid #fecaca" : "1px solid #e2e8f0",
                        borderRadius: "12px"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                        <div style={{ fontSize: "14px", fontWeight: "700", color: "#0f172a" }}>
                          Listing: <strong>{rep.listing_name}</strong>
                        </div>
                        <span style={{
                          fontSize: "11px",
                          fontWeight: "700",
                          padding: "2px 8px",
                          borderRadius: "999px",
                          background: rep.status === "open" ? "#fee2e2" : "#ecfdf5",
                          color: rep.status === "open" ? "#b91c1c" : "#047857"
                        }}>
                          {rep.status.toUpperCase()}
                        </span>
                      </div>

                      <div style={{ fontSize: "13px", color: "#475569", marginBottom: "6px" }}>
                        Reason: <strong>{rep.reason}</strong> — "{rep.details}"
                      </div>

                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "11px", color: "#94a3b8" }}>
                        <span>Reported by: {rep.user_name || "Community member"}</span>
                        {rep.status === "open" && (
                          <button
                            onClick={() => handleResolveReport(rep.id)}
                            style={{
                              background: "#059669",
                              color: "#ffffff",
                              padding: "4px 10px",
                              borderRadius: "6px",
                              fontSize: "11px",
                              fontWeight: "700"
                            }}
                          >
                            Mark Resolved
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 4. All Directory Listings */}
          {activeTab === "allListings" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {allListings.map(lst => (
                <div
                  key={lst.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 14px",
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "10px"
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontSize: "14px", fontWeight: "700", color: "#0f172a" }}>{lst.name}</span>
                      <span style={{
                        fontSize: "10px",
                        fontWeight: "700",
                        padding: "1px 6px",
                        borderRadius: "999px",
                        background: lst.status === "approved" ? "#ecfdf5" : "#fef3c7",
                        color: lst.status === "approved" ? "#047857" : "#b45309"
                      }}>
                        {lst.status}
                      </span>
                    </div>
                    <div style={{ fontSize: "12px", color: "#64748b" }}>
                      {lst.city_name} • {lst.locality} • +91 {lst.phone}
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <button className="btn-icon" onClick={() => onOpenListingDetail(lst)}>
                      <Eye size={15} />
                    </button>
                    <button
                      className="btn-icon"
                      onClick={() => handleDeleteListing(lst.id)}
                      style={{ color: "#ef4444" }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
