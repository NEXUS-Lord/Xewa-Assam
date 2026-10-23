import React, { useState } from "react";
import {
  X, Phone, MessageSquare, MapPin, Clock, Tag, CheckCircle2,
  Share2, Flag, Copy, ChevronLeft, ChevronRight, ShieldCheck
} from "lucide-react";
import { formatWhatsAppUrl, formatTelUrl, cleanPhone } from "../core/constants";

export default function ListingDetail({
  listing,
  onClose,
  onShare,
  onReport,
  onShowToast
}) {
  const [photoIndex, setPhotoIndex] = useState(0);
  const photos = listing.photos && listing.photos.length > 0
    ? listing.photos
    : ["https://images.unsplash.com/photo-1582650625119-3a31f8418b7d?auto=format&fit=crop&w=1000&q=80"];

  const copyPhone = () => {
    const num = cleanPhone(listing.phone);
    navigator.clipboard.writeText(num);
    onShowToast?.("Phone number copied: +91 " + num, "success");
  };

  const nextPhoto = () => setPhotoIndex((prev) => (prev + 1) % photos.length);
  const prevPhoto = () => setPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "680px" }}>
        {/* Header Actions */}
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "12px", fontWeight: "700", textTransform: "uppercase", color: "#059669", letterSpacing: "0.5px" }}>
              {listing.city_name || "Assam"} Directory
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <button
              className="btn-icon"
              onClick={() => onShare(listing)}
              title="Share listing"
            >
              <Share2 size={16} />
            </button>
            <button
              className="btn-icon"
              onClick={() => onReport(listing)}
              title="Report incorrect info"
            >
              <Flag size={16} />
            </button>
            <button className="modal-close-btn" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Photo Gallery Carousel */}
        <div style={{ position: "relative", height: "280px", background: "#0f172a" }}>
          <img
            src={photos[photoIndex]}
            alt={listing.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />

          {photos.length > 1 && (
            <>
              <button
                onClick={prevPhoto}
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "rgba(15, 23, 42, 0.7)",
                  color: "#ffffff",
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backdropFilter: "blur(4px)"
                }}
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={nextPhoto}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "rgba(15, 23, 42, 0.7)",
                  color: "#ffffff",
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backdropFilter: "blur(4px)"
                }}
              >
                <ChevronRight size={20} />
              </button>

              <div
                style={{
                  position: "absolute",
                  bottom: "12px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  display: "flex",
                  gap: "6px",
                  background: "rgba(0,0,0,0.5)",
                  padding: "4px 8px",
                  borderRadius: "999px"
                }}
              >
                {photos.map((_, i) => (
                  <span
                    key={i}
                    onClick={() => setPhotoIndex(i)}
                    style={{
                      width: i === photoIndex ? "16px" : "6px",
                      height: "6px",
                      borderRadius: "999px",
                      background: i === photoIndex ? "#10b981" : "#ffffff",
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                  />
                ))}
              </div>
            </>
          )}

          {listing.is_verified && (
            <div
              style={{
                position: "absolute",
                top: "14px",
                left: "14px",
                background: "#059669",
                color: "#ffffff",
                padding: "4px 12px",
                borderRadius: "999px",
                fontSize: "12px",
                fontWeight: "700",
                display: "flex",
                alignItems: "center",
                gap: "5px",
                boxShadow: "0 4px 10px rgba(0,0,0,0.3)"
              }}
            >
              <ShieldCheck size={15} />
              <span>Verified Listing</span>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="modal-body">
          <h2 style={{ fontSize: "24px", fontWeight: "800", marginBottom: "8px", color: "#0f172a" }}>
            {listing.name}
          </h2>

          <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#059669", fontWeight: "600", fontSize: "14px", marginBottom: "16px" }}>
            <MapPin size={16} />
            <span>{listing.locality ? `${listing.locality}, ` : ""}{listing.city_name}</span>
          </div>

          {/* Description */}
          <div style={{ marginBottom: "20px" }}>
            <h4 style={{ fontSize: "14px", fontWeight: "700", color: "#334155", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              About this service
            </h4>
            <p style={{ color: "#475569", fontSize: "14px", lineHeight: "1.6", whiteSpace: "pre-line" }}>
              {listing.description || "No detailed description provided."}
            </p>
          </div>

          {/* Service Details Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
              padding: "16px",
              background: "#f8fafc",
              borderRadius: "14px",
              border: "1px solid #e2e8f0",
              marginBottom: "20px"
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: "700", color: "#64748b", marginBottom: "4px" }}>
                <Tag size={13} color="#059669" />
                <span>Pricing Info</span>
              </div>
              <div style={{ fontSize: "14px", fontWeight: "700", color: "#0f172a" }}>
                {listing.price_info || "Contact for pricing"}
              </div>
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: "700", color: "#64748b", marginBottom: "4px" }}>
                <Clock size={13} color="#059669" />
                <span>Operating Hours</span>
              </div>
              <div style={{ fontSize: "14px", fontWeight: "600", color: "#0f172a" }}>
                {listing.opening_hours || "Flexible / On Demand"}
              </div>
            </div>

            {listing.address && (
              <div style={{ gridColumn: "1 / -1", paddingTop: "8px", borderTop: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: "700", color: "#64748b", marginBottom: "4px" }}>
                  <MapPin size={13} color="#059669" />
                  <span>Exact Address</span>
                </div>
                <div style={{ fontSize: "14px", color: "#1e293b" }}>
                  {listing.address}
                </div>
              </div>
            )}
          </div>

          {/* Desktop Phone display with Copy button */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 16px",
              background: "#ecfdf5",
              border: "1px solid #a7f3d0",
              borderRadius: "12px",
              marginBottom: "20px"
            }}
          >
            <div>
              <div style={{ fontSize: "11px", fontWeight: "700", color: "#047857", textTransform: "uppercase" }}>
                Phone Number
              </div>
              <div style={{ fontSize: "17px", fontWeight: "800", color: "#064e3b" }}>
                +91 {cleanPhone(listing.phone)}
              </div>
            </div>

            <button
              onClick={copyPhone}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                background: "#059669",
                color: "#ffffff",
                padding: "8px 14px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: "700"
              }}
            >
              <Copy size={14} />
              <span>Copy Number</span>
            </button>
          </div>

          {/* Sticky Bottom Actions */}
          <div style={{ display: "flex", gap: "10px" }}>
            <a
              href={formatTelUrl(listing.phone)}
              className="btn-call"
              style={{ padding: "14px", fontSize: "15px" }}
              title="Call directly"
            >
              <Phone size={18} color="#0284c7" />
              <span>Call Now</span>
            </a>

            {listing.phone && (
              <a
                href={formatWhatsAppUrl(listing.whatsapp || listing.phone, listing.name)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp"
                style={{ padding: "14px", fontSize: "15px" }}
                title="Chat on WhatsApp"
              >
                <MessageSquare size={18} />
                <span>Chat on WhatsApp</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
