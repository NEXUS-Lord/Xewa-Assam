import { cleanPhone, formatWhatsAppUrl } from "./constants";

const STORAGE_KEY = "xewa_whatsapp_gateway_config";

export const DEFAULT_CONFIG = {
  provider: "ultramsg", // 'ultramsg' | 'twilio' | 'webhook'
  enabled: true,
  autoNotifyOnApproval: true,
  autoAlertOnSignup: true,
  adminPhone: import.meta.env.VITE_ADMIN_WHATSAPP || "",

  // UltraMsg configuration
  ultramsgInstanceId: import.meta.env.VITE_ULTRAMSG_INSTANCE_ID || "",
  ultramsgToken: import.meta.env.VITE_ULTRAMSG_TOKEN || "",

  // Twilio configuration
  twilioAccountSid: import.meta.env.VITE_TWILIO_ACCOUNT_SID || "",
  twilioAuthToken: import.meta.env.VITE_TWILIO_AUTH_TOKEN || "",
  twilioFrom: import.meta.env.VITE_TWILIO_FROM || "",

  // Webhook / CallMeBot configuration
  webhookUrl: import.meta.env.VITE_WHATSAPP_WEBHOOK_URL || ""
};

export function getWhatsAppConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_CONFIG };
    return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
  } catch (e) {
    return { ...DEFAULT_CONFIG };
  }
}

export function saveWhatsAppConfig(config) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    return true;
  } catch (e) {
    console.error("Failed to save whatsapp config:", e);
    return false;
  }
}

/**
 * Sends an automated WhatsApp message via the configured gateway.
 */
export async function sendAutomatedWhatsApp({ to, message }) {
  const config = getWhatsAppConfig();
  const cleanTo = cleanPhone(to);

  if (!cleanTo) {
    return { success: false, error: "Invalid recipient phone number." };
  }

  // Format with India 91 prefix if 10 digits
  const fullTo = cleanTo.length === 10 ? `91${cleanTo}` : cleanTo;

  // 1. UltraMsg Gateway
  if (config.provider === "ultramsg" && config.ultramsgInstanceId && config.ultramsgToken) {
    try {
      const url = `https://api.ultramsg.com/${config.ultramsgInstanceId.trim()}/messages/chat`;
      const body = new URLSearchParams({
        token: config.ultramsgToken.trim(),
        to: fullTo,
        body: message
      });

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString()
      });

      const json = await res.json();
      if (json.sent === "true" || json.sent === true || json.id) {
        return { success: true, provider: "ultramsg", id: json.id };
      } else {
        return { success: false, error: json.error || json.message || "UltraMsg delivery failed" };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  // 2. Twilio Gateway
  if (config.provider === "twilio" && config.twilioAccountSid && config.twilioAuthToken) {
    try {
      const url = `https://api.twilio.com/2010-04-01/Accounts/${config.twilioAccountSid.trim()}/Messages.json`;
      const fromNumber = config.twilioFrom.startsWith("+") ? config.twilioFrom : `+${config.twilioFrom}`;
      const toNumber = `+${fullTo}`;

      const params = new URLSearchParams({
        From: `whatsapp:${fromNumber}`,
        To: `whatsapp:${toNumber}`,
        Body: message
      });

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": `Basic ${btoa(`${config.twilioAccountSid.trim()}:${config.twilioAuthToken.trim()}`)}`,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: params.toString()
      });

      const json = await res.json();
      if (res.ok && json.sid) {
        return { success: true, provider: "twilio", sid: json.sid };
      } else {
        return { success: false, error: json.message || "Twilio delivery failed" };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  // 3. Generic Webhook Gateway
  if (config.webhookUrl) {
    try {
      let url = config.webhookUrl;
      const encodedMsg = encodeURIComponent(message);
      if (url.includes("[TEXT]")) {
        url = url.replace("[TEXT]", encodedMsg);
      } else if (url.includes("[PHONE]")) {
        url = url.replace("[PHONE]", fullTo);
      } else if (url.includes("callmebot.com")) {
        url = `${url}&phone=${fullTo}&text=${encodedMsg}`;
      }

      await fetch(url, { method: "GET", mode: "no-cors" });
      return { success: true, provider: "webhook" };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  return {
    success: false,
    notConfigured: true,
    error: "No automated WhatsApp gateway configured. Configure in Admin Portal > WhatsApp Gateway."
  };
}

/**
 * Dispatches automated approval notification to the user.
 */
export async function sendAutomatedUserApprovalWhatsApp(user) {
  const targetNumber = user.whatsapp || user.phone;
  const message = `Hello ${user.full_name || "there"}! 👋\n\nGreat news — your contributor account on *Xewa* has been approved by the Admin! 🎉\n\nYou can now log in, submit verified local services, and manage listings across Assam.\n\nVisit: https://xewa-assam.netlify.app`;

  const result = await sendAutomatedWhatsApp({ to: targetNumber, message });
  return result;
}

/**
 * Dispatches automated signup alert to Admin.
 */
export async function sendAutomatedAdminSignupAlert(user) {
  const config = getWhatsAppConfig();
  if (!config.adminPhone) return { success: false, reason: "No admin phone set" };

  const message = `🔔 *New Registration on Xewa!*\n\n• *Name:* ${user.full_name}\n• *Email:* ${user.email}\n• *Calling:* +91 ${user.phone}\n• *WhatsApp:* +91 ${user.whatsapp || user.phone}\n\nPlease review and approve in the Admin Portal: https://xewa-assam.netlify.app`;

  const result = await sendAutomatedWhatsApp({ to: config.adminPhone, message });
  return result;
}
