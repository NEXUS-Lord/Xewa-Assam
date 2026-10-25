import React, { useState, useEffect } from "react";
import {
  X, Shield, CheckCircle, XCircle, AlertTriangle, Users,
  ListFilter, Plus, RefreshCw, Trash2, Eye, ShieldAlert, Check, Database, MessageSquare
} from "lucide-react";
import { listingsRepo } from "../data/listingsRepo";
import { authRepo } from "../data/authRepo";
import { reportsRepo } from "../data/reportsRepo";
import { CITIES, CATEGORIES } from "../core/constants";
import { getUserApprovalWhatsAppUrl } from "../core/whatsappAlert";
import {
  getWhatsAppConfig,
  saveWhatsAppConfig,
  sendAutomatedUserApprovalWhatsApp,
  sendAutomatedWhatsApp
} from "../core/whatsappGateway";

export default function AdminDashboard({
  currentUser,
  onClose,
  onOpenListingDetail,
  onOpenSupabaseConfig,
  onShowToast
}) {
  const [activeTab, setActiveTab] = useState("pending"); // 'pending' | 'users' | 'reports' | 'allListings' | 'whatsapp'
  const [pendingListings, setPendingListings] = useState([]);
  const [allListings, setAllListings] = useState([]);
  const [users, setUsers] = useState([]);
  const [userSubTab, setUserSubTab] = useState("pendingUsers"); // 'pendingUsers' | 'approvedUsers'
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [waConfig, setWaConfig] = useState(() => getWhatsAppConfig());
  const [testingWa, setTestingWa] = useState(false);
  const [testNumber, setTestNumber] = useState("");

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
    await listingsRepo.updateListing(listingId, { status: "approved", is_verified: true });
    onShowToast?.("Listing approved and published! ✅", "success");
    loadData();
  };

  const handleRejectListing = async (listingId) => {
    await listingsRepo.updateListing(listingId, { status: "rejected" });
    onShowToast?.("Listing marked as rejected.", "info");
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
    const { error } = await authRepo.setUserApproval(targetUserId, approved);
    if (error) {
      onShowToast?.(error, "error");
    } else {
      onShowToast?.(approved ? "User approved! They can now contribute." : "User access revoked.", "success");
      loadData();
    }
  };

  const handleApproveAndNotifyWhatsApp = async (user) => {
    await handleToggleUserApproval(user.id, true);

    // 1. First attempt automated background delivery via Gateway
    onShowToast?.(`Approving ${user.full_name}...`, "info");
    const autoRes = await sendAutomatedUserApprovalWhatsApp(user);
    if (autoRes.success) {
      onShowToast?.(`User approved & automated WhatsApp sent to +91 ${user.whatsapp || user.phone}! 🚀`, "success");
      return;
    }

    // 2. If no gateway configured or failed, fallback to direct WhatsApp Web/App
    const waUrl = getUserApprovalWhatsAppUrl(user);
    if (waUrl) {
      window.open(waUrl, "_blank");
      onShowToast?.(`Approved! Opening WhatsApp to notify ${user.full_name}`, "success");
    }
  };

  const handleSaveWaConfig = (e) => {
    e.preventDefault();
    saveWhatsAppConfig(waConfig);
    onShowToast?.("WhatsApp Gateway settings saved! 🎉", "success");
  };

  const handleTestWaMessage = async () => {
    if (!testNumber.trim()) {
      onShowToast?.("Please enter a 10-digit phone number to test.", "error");
      return;
    }
    setTestingWa(true);
    const res = await sendAutomatedWhatsApp({
      to: testNumber.trim(),
      message: `✅ Test from *Xewa Local Services*!\nYour automated WhatsApp gateway is connected and working perfectly. 🚀`
    });
    setTestingWa(false);
    if (res.success) {
      onShowToast?.("Test WhatsApp delivered successfully! 🚀", "success");
    } else {
      onShowToast?.("Test failed: " + (res.error || "Please check your Instance ID & Token"), "error");
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

          <button
            onClick={() => setActiveTab("whatsapp")}
            style={{
              padding: "12px 16px",
              fontSize: "13px",
              fontWeight: "700",
              color: activeTab === "whatsapp" ? "#047857" : "#64748b",
              borderBottom: activeTab === "whatsapp" ? "2px solid #059669" : "2px solid transparent",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            <MessageSquare size={15} color="#16a34a" />
            <span>WhatsApp Gateway</span>
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

          {/* 5. WhatsApp Gateway Settings */}
          {activeTab === "whatsapp" && (
            <div style={{ maxWidth: "640px", margin: "0 auto" }}>
              <div style={{
                background: "linear-gradient(135deg, #f0fdf4, #ecfdf5)",
                border: "1px solid #bbf7d0",
                borderRadius: "14px",
                padding: "16px 20px",
                marginBottom: "20px"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <MessageSquare size={18} color="#16a34a" />
                  <h4 style={{ fontSize: "16px", fontWeight: "800", color: "#166534" }}>Automated WhatsApp Gateway</h4>
                </div>
                <p style={{ fontSize: "12px", color: "#15803d", lineHeight: "1.5" }}>
                  Connect an automated API gateway so WhatsApp messages are delivered automatically in the background without opening the WhatsApp app on your device.
                </p>
              </div>

              <form onSubmit={handleSaveWaConfig}>
                {/* Gateway Provider Selection */}
                <div className="form-group">
                  <label className="form-label">WhatsApp Gateway Provider</label>
                  <select
                    className="form-select"
                    value={waConfig.provider}
                    onChange={(e) => setWaConfig({ ...waConfig, provider: e.target.value })}
                  >
                    <option value="ultramsg">UltraMsg (Recommended — Easy QR Scan / No Business Verification Needed)</option>
                    <option value="twilio">Twilio WhatsApp API (Enterprise Cloud Gateway)</option>
                    <option value="webhook">Custom Webhook / CallMeBot / Zapier</option>
                  </select>
                </div>

                {/* UltraMsg Fields */}
                {waConfig.provider === "ultramsg" && (
                  <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", padding: "16px", borderRadius: "12px", marginBottom: "16px" }}>
                    <div style={{ fontSize: "13px", fontWeight: "700", color: "#0f172a", marginBottom: "4px" }}>
                      UltraMsg Credentials
                    </div>
                    <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "14px" }}>
                      Create a free instance at <a href="https://ultramsg.com" target="_blank" rel="noreferrer" style={{ color: "#059669", textDecoration: "underline", fontWeight: "700" }}>ultramsg.com</a>, scan the QR code with WhatsApp, and paste your details below:
                    </div>

                    <div className="form-grid-2">
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Instance ID</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. instance12345"
                          value={waConfig.ultramsgInstanceId || ""}
                          onChange={(e) => setWaConfig({ ...waConfig, ultramsgInstanceId: e.target.value })}
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Token</label>
                        <input
                          type="password"
                          className="form-input"
                          placeholder="UltraMsg Token"
                          value={waConfig.ultramsgToken || ""}
                          onChange={(e) => setWaConfig({ ...waConfig, ultramsgToken: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Twilio Fields */}
                {waConfig.provider === "twilio" && (
                  <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", padding: "16px", borderRadius: "12px", marginBottom: "16px" }}>
                    <div style={{ fontSize: "13px", fontWeight: "700", color: "#0f172a", marginBottom: "12px" }}>
                      Twilio WhatsApp Credentials
                    </div>
                    <div className="form-group">
                      <label className="form-label">Account SID</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxx"
                        value={waConfig.twilioAccountSid || ""}
                        onChange={(e) => setWaConfig({ ...waConfig, twilioAccountSid: e.target.value })}
                      />
                    </div>
                    <div className="form-grid-2">
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Auth Token</label>
                        <input
                          type="password"
                          className="form-input"
                          placeholder="Twilio Auth Token"
                          value={waConfig.twilioAuthToken || ""}
                          onChange={(e) => setWaConfig({ ...waConfig, twilioAuthToken: e.target.value })}
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Twilio WhatsApp Number</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="+14155238886"
                          value={waConfig.twilioFrom || ""}
                          onChange={(e) => setWaConfig({ ...waConfig, twilioFrom: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Webhook Fields */}
                {waConfig.provider === "webhook" && (
                  <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", padding: "16px", borderRadius: "12px", marginBottom: "16px" }}>
                    <div style={{ fontSize: "13px", fontWeight: "700", color: "#0f172a", marginBottom: "8px" }}>
                      Webhook / CallMeBot URL
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <input
                        type="url"
                        className="form-input"
                        placeholder="https://api.callmebot.com/whatsapp.php?phone=...&apikey=..."
                        value={waConfig.webhookUrl || ""}
                        onChange={(e) => setWaConfig({ ...waConfig, webhookUrl: e.target.value })}
                      />
                      <span className="form-hint">Supports [PHONE] and [TEXT] placeholders</span>
                    </div>
                  </div>
                )}

                {/* Admin Phone for instant alerts */}
                <div className="form-group">
                  <label className="form-label">Your (Admin) WhatsApp Number for New Signup Alerts</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="10-digit number (e.g. 9854012345)"
                    maxLength={10}
                    value={waConfig.adminPhone || ""}
                    onChange={(e) => setWaConfig({ ...waConfig, adminPhone: e.target.value })}
                  />
                  <span className="form-hint">Whenever someone registers on Xewa, an automated WhatsApp ping is sent to this number</span>
                </div>

                {/* Automation Toggles */}
                <div style={{ background: "#f8fafc", padding: "12px 16px", borderRadius: "10px", marginBottom: "20px", display: "flex", flexDirection: "column", gap: "10px", border: "1px solid #e2e8f0" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer", color: "#0f172a" }}>
                    <input
                      type="checkbox"
                      checked={waConfig.autoNotifyOnApproval ?? true}
                      onChange={(e) => setWaConfig({ ...waConfig, autoNotifyOnApproval: e.target.checked })}
                      style={{ accentColor: "#16a34a", width: "16px", height: "16px" }}
                    />
                    <span>Automatically send WhatsApp message to user when approved</span>
                  </label>

                  <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer", color: "#0f172a" }}>
                    <input
                      type="checkbox"
                      checked={waConfig.autoAlertOnSignup ?? true}
                      onChange={(e) => setWaConfig({ ...waConfig, autoAlertOnSignup: e.target.checked })}
                      style={{ accentColor: "#16a34a", width: "16px", height: "16px" }}
                    />
                    <span>Automatically alert Admin WhatsApp when a new user registers</span>
                  </label>
                </div>

                <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "24px" }}>
                  <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                    Save Gateway Settings
                  </button>
                </div>
              </form>

              {/* Test Delivery Section */}
              <div style={{
                background: "#ffffff",
                border: "1.5px dashed #cbd5e1",
                borderRadius: "14px",
                padding: "18px 20px"
              }}>
                <div style={{ fontSize: "14px", fontWeight: "700", color: "#0f172a", marginBottom: "4px" }}>
                  Test Automated WhatsApp Delivery
                </div>
                <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "12px" }}>
                  Send a live test message to your phone to confirm your gateway is working:
                </div>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <input
                    type="tel"
                    className="form-input"
                    style={{ flex: 1, minWidth: "180px" }}
                    placeholder="10-digit phone number"
                    maxLength={10}
                    value={testNumber}
                    onChange={(e) => setTestNumber(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={handleTestWaMessage}
                    disabled={testingWa}
                    style={{
                      background: "#16a34a",
                      color: "#ffffff",
                      padding: "10px 18px",
                      borderRadius: "8px",
                      fontSize: "13px",
                      fontWeight: "700",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px"
                    }}
                  >
                    <MessageSquare size={15} />
                    <span>{testingWa ? "Sending..." : "Send Test WhatsApp"}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
