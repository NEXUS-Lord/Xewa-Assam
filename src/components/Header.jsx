import React, { useState } from "react";
import { MapPin, Plus, User, Shield, ChevronDown, Database, LogOut, CheckCircle2 } from "lucide-react";
import { kAppName, kAppTagline, CITIES } from "../core/constants";
import { isSupabaseConfigured } from "../core/supabase";

export default function Header({
  selectedCity,
  onSelectCity,
  currentUser,
  onOpenSuggest,
  onOpenAuth,
  onOpenProfile,
  onOpenAdmin,
  onOpenSupabaseConfig
}) {
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const isConnected = isSupabaseConfigured();

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
            <MapPin size={15} color="#059669" />
            <span>{selectedCity.name}</span>
            <ChevronDown size={14} />
          </button>

          {cityDropdownOpen && (
            <div
              style={{
                position: "absolute",
                top: "115%",
                left: 0,
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "14px",
                boxShadow: "0 10px 25px rgba(0,0,0,0.12)",
                padding: "6px",
                zIndex: 200,
                minWidth: "160px",
                animation: "slideUp 0.15s ease-out"
              }}
            >
              <div style={{ padding: "6px 10px", fontSize: "11px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase" }}>
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
                    color: selectedCity.id === c.id ? "#047857" : "#1e293b",
                    background: selectedCity.id === c.id ? "#ecfdf5" : "transparent"
                  }}
                >
                  <span>{c.name}</span>
                  {selectedCity.id === c.id && <CheckCircle2 size={14} color="#059669" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Supabase status badge */}
        <button
          onClick={onOpenSupabaseConfig}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            fontSize: "11px",
            fontWeight: "600",
            padding: "5px 10px",
            borderRadius: "999px",
            background: isConnected ? "#ecfdf5" : "#fef3c7",
            color: isConnected ? "#047857" : "#b45309",
            border: `1px solid ${isConnected ? "#a7f3d0" : "#fde68a"}`
          }}
          title="Supabase Backend Status (Click to configure)"
        >
          <Database size={12} />
          <span>{isConnected ? "Supabase Active" : "Local Demo Mode"}</span>
        </button>
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
              background: "#f1f5f9",
              border: "1px solid #e2e8f0",
              fontWeight: "600",
              fontSize: "13px"
            }}
          >
            <div
              style={{
                width: "24px",
                height: "24px",
                borderRadius: "50%",
                background: "#059669",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "11px",
                fontWeight: "700"
              }}
            >
              {currentUser.full_name?.charAt(0).toUpperCase() || "U"}
            </div>
            <span style={{ maxWidth: "100px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
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
              padding: "7px 14px",
              borderRadius: "999px",
              background: "#ffffff",
              border: "1px solid #cbd5e1",
              fontSize: "13px",
              fontWeight: "600",
              color: "#334155"
            }}
          >
            <User size={15} />
            <span>Log In</span>
          </button>
        )}
      </div>
    </header>
  );
}
