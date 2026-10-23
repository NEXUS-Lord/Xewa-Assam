import React, { useState } from "react";
import { X, Database, CheckCircle2, AlertCircle, ExternalLink, RefreshCw } from "lucide-react";
import { getSupabaseCredentials, saveCustomSupabaseConfig, isSupabaseConfigured } from "../core/supabase";

export default function SupabaseConfigModal({
  onClose,
  onConfigChanged,
  onShowToast
}) {
  const currentCreds = getSupabaseCredentials();
  const [url, setUrl] = useState(currentCreds.url || "");
  const [anonKey, setAnonKey] = useState(currentCreds.anonKey || "");
  const isConnected = isSupabaseConfigured();

  const handleSave = (e) => {
    e.preventDefault();
    if (!url.trim() || !anonKey.trim()) {
      saveCustomSupabaseConfig(null, null);
      onShowToast?.("Reset to Local Demo Mode.", "info");
    } else {
      saveCustomSupabaseConfig(url.trim(), anonKey.trim());
      onShowToast?.("Supabase credentials saved! Connecting...", "success");
    }
    onConfigChanged?.();
    onClose();
  };

  const handleResetDemo = () => {
    saveCustomSupabaseConfig(null, null);
    setUrl("");
    setAnonKey("");
    onShowToast?.("Reset to Local Demo Mode with sample Tezpur & Nagaon services.", "info");
    onConfigChanged?.();
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "540px" }}>
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Database size={18} color="#059669" />
            <h3 className="modal-title">Supabase Backend Configuration</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* Status Banner */}
          <div
            style={{
              padding: "12px 16px",
              borderRadius: "12px",
              background: isConnected ? "#ecfdf5" : "#fef3c7",
              border: `1px solid ${isConnected ? "#a7f3d0" : "#fde68a"}`,
              color: isConnected ? "#065f46" : "#92400e",
              fontSize: "13px",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "16px"
            }}
          >
            {isConnected ? <CheckCircle2 size={18} color="#059669" /> : <AlertCircle size={18} color="#f59e0b" />}
            <div>
              <strong>Current Status:</strong> {isConnected ? "Connected to live Supabase project" : "Running in Local Demo Mode (Mock Storage)"}
            </div>
          </div>

          <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "16px", lineHeight: "1.5" }}>
            Xewa is ready to connect to your Supabase project. The database migrations (<code>0001_init.sql</code>, <code>0002_owner_photos.sql</code>, <code>0003_user_approval.sql</code>) have been prepared in your <code>supabase/migrations/</code> folder.
          </p>

          <form onSubmit={handleSave}>
            <div className="form-group">
              <label className="form-label">Project URL (VITE_SUPABASE_URL)</label>
              <input
                type="url"
                className="form-input"
                placeholder="https://xyzcompany.supabase.co"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <span className="form-hint">Found in Supabase Dashboard &gt; Project Settings &gt; API</span>
            </div>

            <div className="form-group">
              <label className="form-label">Anon / Public API Key (VITE_SUPABASE_ANON_KEY)</label>
              <input
                type="password"
                className="form-input"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
              />
              <span className="form-hint">Safe to use in web client with Row Level Security</span>
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
              <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                Save & Connect
              </button>
              <button
                type="button"
                onClick={handleResetDemo}
                style={{
                  padding: "10px 16px",
                  background: "#f1f5f9",
                  border: "1px solid #cbd5e1",
                  borderRadius: "10px",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#334155"
                }}
              >
                Use Local Demo
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
