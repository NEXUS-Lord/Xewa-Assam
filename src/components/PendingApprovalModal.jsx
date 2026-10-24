import React, { useState } from "react";
import { X, Clock, RefreshCw, LogOut, CheckCircle2 } from "lucide-react";
import { authRepo } from "../data/authRepo";

export default function PendingApprovalModal({
  currentUser,
  onClose,
  onLogout,
  onApproved,
  onShowToast
}) {
  const [checking, setChecking] = useState(false);

  const handleRefresh = async () => {
    setChecking(true);
    const { data } = await authRepo.fetchUserProfile(currentUser.id);
    setChecking(false);

    if (data?.approved || data?.role === "admin") {
      const updatedUser = { ...currentUser, ...data, approved: true };
      localStorage.setItem("xewa_current_user", JSON.stringify(updatedUser));
      onShowToast?.("Hooray! Your account has been approved by an administrator! 🎉", "success");
      onApproved?.(updatedUser);
      onClose();
    } else {
      onShowToast?.("Still waiting for admin review. Thank you for your patience!", "info");
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "460px", textAlign: "center" }}>
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Clock size={18} color="#f59e0b" />
            <h3 className="modal-title">Account Approval Pending</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: "30px 24px" }}>
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              background: "#fef3c7",
              color: "#d97706",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px"
            }}
          >
            <Clock size={32} />
          </div>

          <h3 style={{ fontSize: "20px", fontWeight: "800", color: "#0f172a", marginBottom: "8px" }}>
            Hello, {currentUser.full_name}!
          </h3>

          <p style={{ fontSize: "14px", color: "#475569", lineHeight: "1.5", marginBottom: "20px" }}>
            Your account is currently waiting for approval from a Xewa administrator.
            While unapproved, you can freely browse and contact any local service like a visitor. Once approved, you will be able to suggest listings, manage photos, and submit reports.
          </p>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={handleRefresh}
              className="btn-primary"
              disabled={checking}
              style={{ flex: 1 }}
            >
              <RefreshCw size={15} className={checking ? "spin-animation" : ""} />
              <span>{checking ? "Checking..." : "Refresh Status"}</span>
            </button>

            <button
              onClick={onLogout}
              style={{
                padding: "10px 16px",
                background: "#fee2e2",
                color: "#b91c1c",
                borderRadius: "10px",
                fontWeight: "700",
                fontSize: "13px",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              <LogOut size={15} />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
