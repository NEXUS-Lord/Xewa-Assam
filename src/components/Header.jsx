import React, { useState } from "react";
import { MapPin, Plus, User, Shield, ChevronDown, LogOut, CheckCircle2 } from "lucide-react";
import { kAppName, kAppTagline, CITIES } from "../core/constants";

export default function Header({
  selectedCity,
  onSelectCity,
  currentUser,
  onOpenSuggest,
  onOpenAuth,
  onOpenProfile,
  onOpenAdmin
}) {
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);

  return (
    <header className="navbar">
      <div className="nav-brand" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
        <img src="/logo.svg" alt="Xewa Logo" className="brand-logo-img" />
        <div className="brand-text-block">
          <span className="brand-title">{kAppName}</span>
          <span className="brand-tagline">{kAppTagline}</span>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {/* City Switcher */}
        <div style={{ position: "relative" }}>
          <button
            className="city-pill"
            onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
            title="Switch City"
          >
            <MapPin size={15} color="#34d399" />
            <span>{selectedCity.name}</span>
            <ChevronDown size={14} />
          </button>

          {cityDropdownOpen && (
            <div
              style={{
                position: "absolute",
                top: "115%",
                left: 0,
                background: "rgba(15, 23, 42, 0.95)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "14px",
                boxShadow: "0 16px 40px rgba(0,0,0,0.35)",
                padding: "6px",
                zIndex: 200,
                minWidth: "160px",
                animation: "slideUp 0.15s ease-out"
              }}
            >
              <div style={{ padding: "6px 10px", fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Select Town
              </div>
              {CITIES.map(c => (
                <button
                  key={c.id}
                  onClick={() => {
                    onSelectCity(c);
                    setCityDropdownOpen(false);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: "600",
                    color: selectedCity.id === c.id ? "#34d399" : "#cbd5e1",
                    background: selectedCity.id === c.id ? "rgba(16,185,129,0.12)" : "transparent"
                  }}
                >
                  <span>{c.name}</span>
                  {selectedCity.id === c.id && <CheckCircle2 size={14} color="#34d399" />}
                </button>
              ))}
            </div>
          )}
        </div>

      </div>

      <div className="nav-actions">
        {/* Suggest a listing */}
        <button className="btn-suggest-nav" onClick={onOpenSuggest}>
          <Plus size={16} strokeWidth={2.5} />
          <span className="hide-on-mobile">Suggest Listing</span>
        </button>

        {/* Admin Portal Shortcut if Admin */}
        {currentUser?.role === "admin" && (
          <button className="admin-badge-btn" onClick={onOpenAdmin}>
            <Shield size={14} />
            <span>Admin Portal</span>
          </button>
        )}

        {/* Profile / Auth Button */}
        {currentUser ? (
          <button
            onClick={onOpenProfile}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 12px",
              borderRadius: "999px",
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.12)",
              fontWeight: "600",
              fontSize: "13px",
              color: "#e2e8f0"
            }}
          >
            <div
              style={{
                width: "26px",
                height: "26px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #10b981, #059669)",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "11px",
                fontWeight: "700",
                boxShadow: "0 2px 6px rgba(16,185,129,0.3)"
              }}
            >
              {currentUser.full_name?.charAt(0).toUpperCase() || "U"}
            </div>
            <span style={{ maxWidth: "100px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#e2e8f0" }}>
              {currentUser.full_name?.split(" ")[0]}
            </span>
          </button>
        ) : (
          <button
            onClick={onOpenAuth}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "7px 16px",
              borderRadius: "999px",
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.15)",
              fontSize: "13px",
              fontWeight: "600",
              color: "#e2e8f0"
            }}
          >
            <User size={15} color="#94a3b8" />
            <span>Log In</span>
          </button>
        )}
      </div>
    </header>
  );
}
