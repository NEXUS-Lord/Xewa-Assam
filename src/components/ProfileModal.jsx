import React, { useState, useEffect } from "react";
import {
  X, User, Mail, Phone, LogOut, Shield, Plus, Trash2,
  CheckCircle2, Clock, XCircle, Image as ImageIcon
} from "lucide-react";
import { listingsRepo } from "../data/listingsRepo";
import { authRepo } from "../data/authRepo";

export default function ProfileModal({
  currentUser,
  onClose,
  onLogout,
  onOpenAdmin,
  onOpenDetail,
  onShowToast
}) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [managingPhotosListing, setManagingPhotosListing] = useState(null);
  const [newPhotoUrl, setNewPhotoUrl] = useState("");

  const loadSubmissions = async () => {
    if (!currentUser) return;
    setLoading(true);
    const { data } = await listingsRepo.getMySubmissions(currentUser.id);
    if (data) setSubmissions(data);
    setLoading(false);
  };

  useEffect(() => {
    loadSubmissions();
  }, [currentUser]);

  const handleAddPhoto = async (listing) => {
    if (!newPhotoUrl.trim()) return;
    const currentPhotos = listing.photos || [];
    if (currentPhotos.length >= 5) {
      onShowToast?.("Maximum 5 photos allowed per listing", "error");
      return;
    }
    const updated = [...currentPhotos, newPhotoUrl.trim()];
    await listingsRepo.updateListingPhotos(listing.id, updated);
    setNewPhotoUrl("");
    onShowToast?.("Photo added to listing!", "success");
    loadSubmissions();
    setManagingPhotosListing({ ...listing, photos: updated });
  };

  const handleDeletePhoto = async (listing, photoIndex) => {
    const updated = (listing.photos || []).filter((_, i) => i !== photoIndex);
    await listingsRepo.updateListingPhotos(listing.id, updated);
    onShowToast?.("Photo removed", "info");
    loadSubmissions();
    setManagingPhotosListing({ ...listing, photos: updated });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "620px" }}>
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <User size={18} color="#059669" />
            <h3 className="modal-title">My Account & Submissions</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* User Profile Card */}
          <div
            style={{
              padding: "16px",
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "20px"
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <h4 style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a" }}>{currentUser.full_name}</h4>
                {currentUser.role === "admin" && (
                  <span style={{ fontSize: "10px", fontWeight: "800", background: "#fef3c7", color: "#b45309", padding: "2px 8px", borderRadius: "999px" }}>
                    ADMIN
                  </span>
                )}
                {currentUser.approved && (
                  <span style={{ fontSize: "10px", fontWeight: "700", background: "#ecfdf5", color: "#047857", padding: "2px 8px", borderRadius: "999px" }}>
                    APPROVED
                  </span>
                )}
              </div>
              <div style={{ fontSize: "12px", color: "#64748b" }}>
                {currentUser.email} • +91 {currentUser.phone || "No phone added"}
              </div>
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              {currentUser.role === "admin" && (
                <button
                  onClick={() => { onClose(); onOpenAdmin(); }}
                  style={{
                    padding: "7px 12px",
                    background: "#059669",
                    color: "#ffffff",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: "700",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px"
                  }}
                >
                  <Shield size={13} />
                  <span>Admin</span>
                </button>
              )}

              <button
                onClick={onLogout}
                style={{
                  padding: "7px 12px",
                  background: "#fee2e2",
                  color: "#b91c1c",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontWeight: "700",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px"
                }}
              >
                <LogOut size={13} />
                <span>Logout</span>
              </button>
            </div>
          </div>

          {/* Manage Photos Sub-view */}
          {managingPhotosListing ? (
            <div style={{ background: "#ffffff", padding: "16px", border: "1px solid #cbd5e1", borderRadius: "12px", marginBottom: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <h4 style={{ fontSize: "14px", fontWeight: "700", color: "#0f172a" }}>
                  Manage Photos: {managingPhotosListing.name}
                </h4>
                <button
                  onClick={() => setManagingPhotosListing(null)}
                  style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}
                >
                  ← Back to Submissions
                </button>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "14px" }}>
                {(managingPhotosListing.photos || []).map((photoUrl, idx) => (
                  <div key={idx} style={{ position: "relative", width: "90px", height: "90px", borderRadius: "8px", overflow: "hidden", border: "1px solid #e2e8f0" }}>
                    <img src={photoUrl} alt="Listing" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <button
                      onClick={() => handleDeletePhoto(managingPhotosListing, idx)}
                      style={{
                        position: "absolute",
                        top: "4px",
                        right: "4px",
                        background: "rgba(0,0,0,0.7)",
                        color: "#fff",
                        borderRadius: "50%",
                        width: "22px",
                        height: "22px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                      title="Delete photo"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>

              {(managingPhotosListing.photos || []).length < 5 && (
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="Paste image web link to add photo..."
                    value={newPhotoUrl}
                    onChange={(e) => setNewPhotoUrl(e.target.value)}
                  />
                  <button
                    onClick={() => handleAddPhoto(managingPhotosListing)}
                    style={{
                      background: "#059669",
                      color: "#ffffff",
                      padding: "8px 16px",
                      borderRadius: "8px",
                      fontSize: "13px",
                      fontWeight: "700"
                    }}
                  >
                    Add Photo
                  </button>
                </div>
              )}
            </div>
          ) : null}

          {/* Submissions Section */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <h4 style={{ fontSize: "15px", fontWeight: "800", color: "#0f172a" }}>
              My Submissions ({submissions.length})
            </h4>
          </div>

          {submissions.length === 0 ? (
            <div className="empty-state" style={{ padding: "30px 10px" }}>
              <div className="empty-state-title">No submissions yet</div>
              <div className="empty-state-desc">Suggest a local tutor, mess, or technician to help your neighbors!</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {submissions.map(sub => (
                <div
                  key={sub.id}
                  style={{
                    padding: "12px 16px",
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between"
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px" }}>
                      <span style={{ fontSize: "14px", fontWeight: "700", color: "#0f172a" }}>{sub.name}</span>
                      {sub.status === "approved" && (
                        <span style={{ fontSize: "11px", fontWeight: "700", padding: "2px 8px", background: "#ecfdf5", color: "#047857", borderRadius: "999px" }}>
                          Live / Approved
                        </span>
                      )}
                      {sub.status === "pending" && (
                        <span style={{ fontSize: "11px", fontWeight: "700", padding: "2px 8px", background: "#fef3c7", color: "#b45309", borderRadius: "999px" }}>
                          Under Review
                        </span>
                      )}
                      {sub.status === "rejected" && (
                        <span style={{ fontSize: "11px", fontWeight: "700", padding: "2px 8px", background: "#fee2e2", color: "#b91c1c", borderRadius: "999px" }}>
                          Rejected
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: "12px", color: "#64748b" }}>
                      {sub.city_name} • {sub.locality} • {(sub.photos || []).length} photo(s)
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => setManagingPhotosListing(sub)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        padding: "6px 10px",
                        background: "#f1f5f9",
                        color: "#334155",
                        borderRadius: "8px",
                        fontSize: "12px",
                        fontWeight: "600"
                      }}
                      title="Manage photos on this listing"
                    >
                      <ImageIcon size={14} />
                      <span>Photos</span>
                    </button>

                    <button
                      onClick={() => { onClose(); onOpenDetail(sub); }}
                      style={{
                        padding: "6px 10px",
                        background: "#059669",
                        color: "#ffffff",
                        borderRadius: "8px",
                        fontSize: "12px",
                        fontWeight: "600"
                      }}
                    >
                      View
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
