import React, { useState } from "react";
import { X, User, Lock, Mail, Phone, MessageSquare, ShieldCheck, AlertCircle } from "lucide-react";
import { authRepo } from "../data/authRepo";
import { isValidIndianPhone, cleanPhone } from "../core/constants";
import { triggerAdminWhatsAppNotification } from "../core/whatsappAlert";
import { sendAutomatedAdminSignupAlert } from "../core/whatsappGateway";

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
  const [whatsapp, setWhatsapp] = useState("");
  const [sameAsPhone, setSameAsPhone] = useState(true);
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
      setErrorMsg("Please enter a valid 10-digit calling mobile number (starting with 6, 7, 8, or 9).");
      return;
    }
    const finalWhatsApp = sameAsPhone ? cleanPhone(phone) : cleanPhone(whatsapp);
    if (!sameAsPhone && !isValidIndianPhone(whatsapp)) {
      setErrorMsg("Please enter a valid 10-digit WhatsApp number (starting with 6, 7, 8, or 9).");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    const { data, error } = await authRepo.signup({
      email: email.trim(),
      password,
      full_name: fullName.trim(),
      phone: cleanPhone(phone),
      whatsapp: finalWhatsApp
    });
    setLoading(false);

    if (error) {
      setErrorMsg(error);
    } else {
      const userPayload = {
        full_name: fullName.trim(),
        email: email.trim(),
        phone: cleanPhone(phone),
        whatsapp: finalWhatsApp
      };

      // Trigger background alerts to Admin
      sendAutomatedAdminSignupAlert(userPayload);
      triggerAdminWhatsAppNotification(userPayload);

      onShowToast?.("Account created! Waiting for admin approval.", "success");
      onLoginSuccess(data);
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
                <label className="form-label">Calling Phone Number <span className="required-star">*</span></label>
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
                <span className="form-hint">Used for primary direct calls</span>
              </div>

              {/* WhatsApp Option */}
              <div className="form-group" style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "12px", borderRadius: "10px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "600", color: "#166534" }}>
                  <input
                    type="checkbox"
                    checked={sameAsPhone}
                    onChange={(e) => setSameAsPhone(e.target.checked)}
                    style={{ accentColor: "#16a34a", width: "16px", height: "16px", cursor: "pointer" }}
                  />
                  <span>WhatsApp number is the same as calling number</span>
                </label>

                {!sameAsPhone && (
                  <div style={{ marginTop: "10px" }}>
                    <label className="form-label" style={{ color: "#166534" }}>
                      WhatsApp Number <span className="required-star">*</span>
                    </label>
                    <div style={{ position: "relative" }}>
                      <input
                        type="tel"
                        className="form-input"
                        style={{ paddingLeft: "36px", borderColor: "#86efac", background: "#ffffff" }}
                        placeholder="10-digit WhatsApp number"
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value)}
                        maxLength={10}
                        required={!sameAsPhone}
                      />
                      <MessageSquare size={16} color="#16a34a" style={{ position: "absolute", left: "12px", top: "13px" }} />
                    </div>
                    <span className="form-hint" style={{ color: "#15803d" }}>Used for instant WhatsApp notifications and approval alerts</span>
                  </div>
                )}
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
        </div>
      </div>
    </div>
  );
}
