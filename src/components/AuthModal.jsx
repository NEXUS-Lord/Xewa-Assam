import React, { useState } from "react";
import { X, User, Lock, Mail, Phone, ShieldCheck, AlertCircle, Sparkles } from "lucide-react";
import { authRepo } from "../data/authRepo";
import { isValidIndianPhone, cleanPhone } from "../core/constants";

export default function AuthModal({
  onClose,
  onLoginSuccess,
  onShowToast
}) {
  const [tab, setTab] = useState("login"); // 'login' | 'signup'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const { data, error } = await authRepo.login(email.trim(), password);
    setLoading(false);

    if (error) {
      setErrorMsg(error);
    } else {
      onShowToast?.(`Welcome back, ${data.full_name}! 👋`, "success");
      onLoginSuccess(data);
      onClose();
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMsg("Please enter your full name.");
      return;
    }
    if (!isValidIndianPhone(phone)) {
      setErrorMsg("Please enter a valid 10-digit mobile number (starting with 6, 7, 8, or 9).");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    const { data, error } = await authRepo.signup({
      email: email.trim(),
      password,
      full_name: fullName.trim(),
      phone: cleanPhone(phone)
    });
    setLoading(false);

    if (error) {
      setErrorMsg(error);
    } else {
      onShowToast?.("Account created! Waiting for admin approval.", "success");
      onLoginSuccess(data);
      onClose();
    }
  };

  const handleQuickDemo = (demoEmail) => {
    const user = authRepo.quickSwitchDemoUser(demoEmail);
    if (user) {
      onShowToast?.(`Logged in as ${user.full_name} (${user.role})`, "success");
      onLoginSuccess(user);
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "440px" }}>
        <div className="modal-header">
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={() => { setTab("login"); setErrorMsg(""); }}
              style={{
                fontSize: "16px",
                fontWeight: "800",
                color: tab === "login" ? "#059669" : "#94a3b8",
                borderBottom: tab === "login" ? "2px solid #059669" : "2px solid transparent",
                paddingBottom: "4px"
              }}
            >
              Sign In
            </button>
            <button
              onClick={() => { setTab("signup"); setErrorMsg(""); }}
              style={{
                fontSize: "16px",
                fontWeight: "800",
                color: tab === "signup" ? "#059669" : "#94a3b8",
                borderBottom: tab === "signup" ? "2px solid #059669" : "2px solid transparent",
                paddingBottom: "4px"
              }}
            >
              Register
            </button>
          </div>

          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {errorMsg && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", padding: "10px 14px", borderRadius: "10px", fontSize: "13px", marginBottom: "16px" }}>
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {tab === "login" ? (
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div style={{ position: "relative" }}>
                  <input
                    type="email"
                    className="form-input"
                    style={{ paddingLeft: "36px" }}
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <Mail size={16} color="#94a3b8" style={{ position: "absolute", left: "12px", top: "13px" }} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div style={{ position: "relative" }}>
                  <input
                    type="password"
                    className="form-input"
                    style={{ paddingLeft: "36px" }}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Lock size={16} color="#94a3b8" style={{ position: "absolute", left: "12px", top: "13px" }} />
                </div>
              </div>

              <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: "10px" }}>
                {loading ? "Signing in..." : "Sign In to Xewa"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignup}>
              <div className="form-group">
                <label className="form-label">Full Name <span className="required-star">*</span></label>
                <div style={{ position: "relative" }}>
                  <input
                    type="text"
                    className="form-input"
                    style={{ paddingLeft: "36px" }}
                    placeholder="e.g. Pranab Sarma"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                  <User size={16} color="#94a3b8" style={{ position: "absolute", left: "12px", top: "13px" }} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Mobile Number <span className="required-star">*</span></label>
                <div style={{ position: "relative" }}>
                  <input
                    type="tel"
                    className="form-input"
                    style={{ paddingLeft: "36px" }}
                    placeholder="10 digits (e.g. 9854012345)"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    maxLength={10}
                    required
                  />
                  <Phone size={16} color="#94a3b8" style={{ position: "absolute", left: "12px", top: "13px" }} />
                </div>
                <span className="form-hint">Used for verification and community safety</span>
              </div>

              <div className="form-group">
                <label className="form-label">Email Address <span className="required-star">*</span></label>
                <div style={{ position: "relative" }}>
                  <input
                    type="email"
                    className="form-input"
                    style={{ paddingLeft: "36px" }}
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <Mail size={16} color="#94a3b8" style={{ position: "absolute", left: "12px", top: "13px" }} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password <span className="required-star">*</span></label>
                <div style={{ position: "relative" }}>
                  <input
                    type="password"
                    className="form-input"
                    style={{ paddingLeft: "36px" }}
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Lock size={16} color="#94a3b8" style={{ position: "absolute", left: "12px", top: "13px" }} />
                </div>
              </div>

              <div style={{ background: "#f8fafc", padding: "10px", borderRadius: "10px", fontSize: "12px", color: "#64748b", marginBottom: "14px", border: "1px solid #e2e8f0" }}>
                ℹ️ <strong>Account Approval:</strong> To maintain verified listings, new contributor accounts require admin activation before posting services.
              </div>

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>
          )}

          {/* Quick Demo Switcher for Evaluation */}
          <div style={{ marginTop: "24px", paddingTop: "18px", borderTop: "1px dashed #cbd5e1" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: "700", color: "#64748b", marginBottom: "10px" }}>
              <Sparkles size={14} color="#f59e0b" />
              <span>Instant Test Logins (1-Click)</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <button
                type="button"
                onClick={() => handleQuickDemo("admin@xewa.local")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  background: "#fef3c7",
                  border: "1px solid #fde68a",
                  color: "#92400e",
                  fontSize: "12px",
                  fontWeight: "700"
                }}
              >
                <span>👑 Admin (NEXUS)</span>
                <span style={{ fontSize: "11px", opacity: 0.8 }}>Full Control</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo("contributor@xewa.local")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  background: "#ecfdf5",
                  border: "1px solid #a7f3d0",
                  color: "#065f46",
                  fontSize: "12px",
                  fontWeight: "700"
                }}
              >
                <span>✅ Approved Contributor (Bikram)</span>
                <span style={{ fontSize: "11px", opacity: 0.8 }}>Can Post & Edit</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo("newuser@xewa.local")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  background: "#f1f5f9",
                  border: "1px solid #e2e8f0",
                  color: "#334155",
                  fontSize: "12px",
                  fontWeight: "600"
                }}
              >
                <span>⏳ Unapproved User (Rupjyoti)</span>
                <span style={{ fontSize: "11px", opacity: 0.8 }}>Waiting Approval</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
