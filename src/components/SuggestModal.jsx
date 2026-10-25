import React, { useState } from "react";
import { X, Upload, Plus, Trash2, CheckCircle2, AlertCircle, Sparkles, MessageSquare } from "lucide-react";
import { CITIES, CATEGORIES, isValidIndianPhone, cleanPhone } from "../core/constants";
import { listingsRepo } from "../data/listingsRepo";
import { sendAutomatedAdminListingAlert } from "../core/whatsappAlert";

export default function SuggestModal({
  currentUser,
  defaultCityId,
  onClose,
  onSuccess,
  onShowToast
}) {
  const [formData, setFormData] = useState({
    name: "",
    city_id: defaultCityId || 1,
    category_slug: "tutors",
    locality: "",
    address: "",
    phone: "",
    whatsapp: "",
    price_info: "",
    opening_hours: "",
    description: ""
  });

  const [photos, setPhotos] = useState([]);
  const [photoInputUrl, setPhotoInputUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMsg("");
  };

  const handleAddPhotoUrl = () => {
    if (!photoInputUrl.trim()) return;
    if (photos.length >= 5) {
      onShowToast?.("Maximum 5 photos allowed per listing", "error");
      return;
    }
    setPhotos([...photos, photoInputUrl.trim()]);
    setPhotoInputUrl("");
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (photos.length >= 5) {
      onShowToast?.("Maximum 5 photos allowed per listing", "error");
      return;
    }

    // Convert to compressed Base64 data URL for preview and local storage
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const img = new Image();
      img.src = uploadEvent.target.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 1000;
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = (img.width > MAX_WIDTH) ? MAX_WIDTH : img.width;
        canvas.height = (img.width > MAX_WIDTH) ? (img.height * scaleSize) : img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.75);
        setPhotos([...photos, compressedBase64]);
      };
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = (index) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setErrorMsg("Please enter the business or service name.");
      return;
    }

    if (!isValidIndianPhone(formData.phone)) {
      setErrorMsg("Please enter a valid 10-digit Indian mobile number (starting with 6, 7, 8, or 9).");
      return;
    }

    if (formData.whatsapp && !isValidIndianPhone(formData.whatsapp)) {
      setErrorMsg("WhatsApp number must be a valid 10-digit mobile number.");
      return;
    }

    if (!formData.locality.trim()) {
      setErrorMsg("Please provide the locality (e.g. Mission Chariali, Haibargaon).");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    const categoryObj = CATEGORIES.find(c => c.slug === formData.category_slug);
    const cityObj = CITIES.find(c => c.id === Number(formData.city_id));

    const payload = {
      name: formData.name.trim(),
      city_id: Number(formData.city_id),
      city_name: cityObj?.name || "Assam",
      category_slug: formData.category_slug,
      category_id: 1, // mapping default
      locality: formData.locality.trim(),
      address: formData.address.trim(),
      phone: cleanPhone(formData.phone),
      whatsapp: formData.whatsapp ? cleanPhone(formData.whatsapp) : cleanPhone(formData.phone),
      price_info: formData.price_info.trim(),
      opening_hours: formData.opening_hours.trim(),
      description: formData.description.trim(),
      photos: photos
    };

    const { data, error } = await listingsRepo.createListing(payload, currentUser);
    setIsSubmitting(false);

    if (error) {
      setErrorMsg(error);
    } else {
      // Trigger automated WhatsApp alert to Admin in the background
      sendAutomatedAdminListingAlert(payload, currentUser);

      setSubmittedSuccess(true);
      onShowToast?.("Listing submitted! Our admins will review and publish it.", "success");
      onSuccess?.();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "620px" }}>
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Sparkles size={18} color="#059669" />
            <h3 className="modal-title">Suggest a Local Service</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {submittedSuccess ? (
            <div style={{ textAlign: "center", padding: "30px 10px" }}>
              <CheckCircle2 size={54} color="#059669" style={{ marginBottom: "16px" }} />
              <h3 style={{ fontSize: "20px", fontWeight: "800", color: "#064e3b", marginBottom: "8px" }}>
                Thank you for contributing!
              </h3>
              <p style={{ color: "#475569", fontSize: "14px", maxWidth: "440px", margin: "0 auto 16px", lineHeight: "1.5" }}>
                Your submission for "<strong>{formData.name}</strong>" has been queued for review. An alert has been prepared on WhatsApp for our administrators to verify and publish it!
              </p>
              <div style={{ display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap", marginTop: "12px" }}>
                <button
                  type="button"
                  onClick={() => {
                    sendAutomatedAdminListingAlert(formData, currentUser);
                    onClose();
                  }}
                  style={{
                    background: "#16a34a",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "8px",
                    padding: "10px 18px",
                    fontWeight: "700",
                    fontSize: "13px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    cursor: "pointer"
                  }}
                >
                  <MessageSquare size={16} />
                  <span>Notify Admin on WhatsApp</span>
                </button>
                <button className="btn-secondary" onClick={onClose} style={{ padding: "10px 18px" }}>
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {errorMsg && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", padding: "10px 14px", borderRadius: "10px", fontSize: "13px", marginBottom: "16px" }}>
                  <AlertCircle size={16} />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">
                  Service / Business Name <span className="required-star">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  placeholder="e.g. Apex Science Coaching or Borpukhuri PG"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Town / City <span className="required-star">*</span></label>
                  <select
                    name="city_id"
                    className="form-select"
                    value={formData.city_id}
                    onChange={handleChange}
                  >
                    {CITIES.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Category <span className="required-star">*</span></label>
                  <select
                    name="category_slug"
                    className="form-select"
                    value={formData.category_slug}
                    onChange={handleChange}
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat.slug} value={cat.slug}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">
                    Locality / Area <span className="required-star">*</span>
                  </label>
                  <input
                    type="text"
                    name="locality"
                    className="form-input"
                    placeholder="e.g. Mission Chariali / Haibargaon"
                    value={formData.locality}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Exact Address (Optional)</label>
                  <input
                    type="text"
                    name="address"
                    className="form-input"
                    placeholder="e.g. Near SBI Main Branch, Shop #5"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">
                    Mobile / Calling Phone <span className="required-star">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    className="form-input"
                    placeholder="10-digit number (e.g. 9854012345)"
                    value={formData.phone}
                    onChange={handleChange}
                    maxLength={10}
                    required
                  />
                  <span className="form-hint">10 digits starting with 6, 7, 8, or 9</span>
                </div>

                <div className="form-group">
                  <label className="form-label">WhatsApp Number</label>
                  <input
                    type="tel"
                    name="whatsapp"
                    className="form-input"
                    placeholder="Optional (leave blank if same as phone)"
                    value={formData.whatsapp}
                    onChange={handleChange}
                    maxLength={10}
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Pricing Info</label>
                  <input
                    type="text"
                    name="price_info"
                    className="form-input"
                    placeholder="e.g. ₹1,500/month or ₹250 visit charge"
                    value={formData.price_info}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Opening Hours</label>
                  <input
                    type="text"
                    name="opening_hours"
                    className="form-input"
                    placeholder="e.g. 8:00 AM - 7:00 PM Daily"
                    value={formData.opening_hours}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description / Offerings</label>
                <textarea
                  name="description"
                  className="form-textarea"
                  rows={3}
                  placeholder="Describe the service, specialties, facilities, or subjects taught..."
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>

              {/* Photos Section (Max 5) */}
              <div className="form-group">
                <label className="form-label">
                  Photos (Up to 5) — {photos.length}/5
                </label>

                {/* Thumbnail Previews */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "12px" }}>
                  {photos.map((url, i) => (
                    <div key={i} style={{ position: "relative", width: "70px", height: "70px", borderRadius: "10px", overflow: "hidden", border: "1px solid #cbd5e1" }}>
                      <img src={url} alt={`Preview ${i}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(i)}
                        style={{
                          position: "absolute",
                          top: "2px",
                          right: "2px",
                          background: "rgba(0,0,0,0.65)",
                          color: "#ffffff",
                          borderRadius: "50%",
                          width: "20px",
                          height: "20px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  ))}

                  {photos.length < 5 && (
                    <label
                      style={{
                        width: "70px",
                        height: "70px",
                        borderRadius: "10px",
                        border: "2px dashed #94a3b8",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        color: "#64748b",
                        fontSize: "11px",
                        fontWeight: "600"
                      }}
                    >
                      <Upload size={18} color="#059669" />
                      <span>Upload</span>
                      <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: "none" }} />
                    </label>
                  )}
                </div>

                {/* Or paste photo URL */}
                {photos.length < 5 && (
                  <div style={{ display: "flex", gap: "8px" }}>
                    <input
                      type="url"
                      className="form-input"
                      placeholder="Or paste an image web link..."
                      value={photoInputUrl}
                      onChange={(e) => setPhotoInputUrl(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={handleAddPhotoUrl}
                      style={{
                        padding: "8px 14px",
                        background: "#f1f5f9",
                        border: "1px solid #cbd5e1",
                        borderRadius: "10px",
                        fontWeight: "600",
                        fontSize: "13px"
                      }}
                    >
                      Add
                    </button>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="btn-primary"
                disabled={isSubmitting}
                style={{ marginTop: "14px" }}
              >
                {isSubmitting ? "Submitting listing..." : "Submit for Review"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
