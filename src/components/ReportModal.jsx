import React, { useState } from "react";
import { X, Flag, AlertCircle } from "lucide-react";
import { REPORT_REASONS } from "../core/constants";
import { reportsRepo } from "../data/reportsRepo";

export default function ReportModal({
  listing,
  currentUser,
  onClose,
  onShowToast
}) {
  const [reason, setReason] = useState("wrong_info");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const { error } = await reportsRepo.submitReport({
      listingId: listing.id,
      listingName: listing.name,
      userId: currentUser?.id || "guest",
      userName: currentUser?.full_name || "Community User",
      reason,
      details
    });

    setSubmitting(false);

    if (error) {
      onShowToast?.("Failed to submit report. Please try again.", "error");
    } else {
      onShowToast?.("Thank you! Our admins have received your report.", "success");
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "480px" }}>
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Flag size={18} color="#ef4444" />
            <h3 className="modal-title">Report Wrong Information</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "16px" }}>
            Help keep Xewa reliable. What is wrong with <strong>{listing.name}</strong>?
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Issue Reason</label>
              <select
                className="form-select"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              >
                {REPORT_REASONS.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Additional Details</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="e.g. Correct phone number is 98540..., or shop has moved to..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
              />
            </div>

            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? "Sending Report..." : "Submit Report"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
