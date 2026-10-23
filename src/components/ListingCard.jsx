import React from "react";
import { Phone, MessageSquare, MapPin, CheckCircle, Star, MoreVertical, Copy, Share2 } from "lucide-react";
import { formatWhatsAppUrl, formatTelUrl, cleanPhone } from "../core/constants";

export default function ListingCard({
  listing,
  onOpenDetail,
  onShare,
  onReport,
  onShowToast
}) {
  const photoUrl = listing.photos && listing.photos.length > 0
    ? listing.photos[0]
    : "https://images.unsplash.com/photo-1582650625119-3a31f8418b7d?auto=format&fit=crop&w=600&q=80";

  const copyPhoneNumber = (e) => {
    e.stopPropagation();
    const phone = cleanPhone(listing.phone);
    navigator.clipboard.writeText(phone);
    onShowToast?.("Phone number copied to clipboard! 📋", "success");
  };

  return (
    <div className="listing-card">
      {/* Photo Header */}
      <div className="listing-photo-box" onClick={() => onOpenDetail(listing)}>
        <img src={photoUrl} alt={listing.name} className="listing-photo-img" loading="lazy" />
        
        {listing.is_verified && (
          <div className="verified-badge">
            <CheckCircle size={13} fill="#ffffff" color="#059669" />
            <span>Verified</span>
          </div>
        )}

        {listing.locality && (
          <div className="category-pill-tag">
            {listing.locality}
          </div>
        )}
      </div>

      {/* Body Info */}
      <div className="listing-body">
        <div className="listing-header-row">
          <h3 className="listing-name" onClick={() => onOpenDetail(listing)}>
            {listing.name}
          </h3>
        </div>

        <div className="listing-locality">
          <MapPin size={14} color="#059669" />
          <span>{listing.locality ? `${listing.locality}, ` : ""}{listing.city_name || "Assam"}</span>
        </div>

        <p className="listing-desc">
          {listing.description || "No description provided."}
        </p>

        <div className="listing-meta-row">
          <span className="price-tag">
            {listing.price_info || "Contact for pricing"}
          </span>

          {listing.avg_rating > 0 && (
            <span className="rating-tag">
              <Star size={13} fill="#f59e0b" color="#f59e0b" />
              <span>{listing.avg_rating} ({listing.review_count})</span>
            </span>
          )}
        </div>
      </div>

      {/* Direct Contact Actions */}
      <div className="listing-actions-row">
        {/* Call button */}
        <a
          href={formatTelUrl(listing.phone)}
          className="btn-call"
          title={`Call ${listing.phone}`}
          onClick={(e) => {
            // If on desktop where tel may not work, also copy number
            if (!/Mobi|Android/i.test(navigator.userAgent)) {
              copyPhoneNumber(e);
            }
          }}
        >
          <Phone size={15} color="#0284c7" />
          <span>Call</span>
        </a>

        {/* WhatsApp button */}
        {listing.phone && (
          <a
            href={formatWhatsAppUrl(listing.whatsapp || listing.phone, listing.name)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp"
            title="Chat on WhatsApp"
          >
            <MessageSquare size={15} />
            <span>WhatsApp</span>
          </a>
        )}

        {/* Copy phone button */}
        <button
          className="btn-more-options"
          onClick={copyPhoneNumber}
          title="Copy phone number"
        >
          <Copy size={16} />
        </button>

        {/* View full details */}
        <button
          className="btn-more-options"
          onClick={() => onOpenDetail(listing)}
          title="View Details"
        >
          <MoreVertical size={16} />
        </button>
      </div>
    </div>
  );
}
