import { cleanPhone, formatWhatsAppUrl } from "./constants";

const STORAGE_KEY = "xewa_whatsapp_gateway_config";

export const DEFAULT_CONFIG = {
  provider: "callmebot", // 'callmebot' | 'ultramsg' | 'meta' | 'twilio' | 'webhook'
  enabled: true,
  autoNotifyOnApproval: true,
  autoAlertOnSignup: true,
  autoAlertOnListing: true,
  adminPhone: import.meta.env.VITE_ADMIN_WHATSAPP || "",

  // CallMeBot configuration (100% Free Forever)
  callmebotApiKey: import.meta.env.VITE_CALLMEBOT_API_KEY || "",

  // Meta WhatsApp Cloud API (1,000 Free conversations/month)
  metaPhoneNumberId: import.meta.env.VITE_META_PHONE_NUMBER_ID || "",
  metaAccessToken: import.meta.env.VITE_META_ACCESS_TOKEN || "",

  // UltraMsg configuration
  ultramsgInstanceId: import.meta.env.VITE_ULTRAMSG_INSTANCE_ID || "",
  ultramsgToken: import.meta.env.VITE_ULTRAMSG_TOKEN || "",

  // Twilio configuration
  twilioAccountSid: import.meta.env.VITE_TWILIO_ACCOUNT_SID || "",
  twilioAuthToken: import.meta.env.VITE_TWILIO_AUTH_TOKEN || "",
  twilioFrom: import.meta.env.VITE_TWILIO_FROM || "",

  // Webhook configuration
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

  // 1. CallMeBot (100% Free Forever for personal WhatsApp alerts)
  if (config.provider === "callmebot" && config.callmebotApiKey) {
    try {
      const encodedMsg = encodeURIComponent(message);
      const url = `https://api.callmebot.com/whatsapp.php?phone=${fullTo}&text=${encodedMsg}&apikey=${config.callmebotApiKey.trim()}`;
      await fetch(url, { method: "GET", mode: "no-cors" });
      return { success: true, provider: "callmebot" };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  // 2. Meta WhatsApp Cloud API (1,000 Free conversations/month)
  if (config.provider === "meta" && config.metaPhoneNumberId && config.metaAccessToken) {
    try {
      const url = `https://graph.facebook.com/v19.0/${config.metaPhoneNumberId.trim()}/messages`;
      const payload = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: fullTo,
        type: "text",
        text: { preview_url: true, body: message }
      };

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${config.metaAccessToken.trim()}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      if (res.ok && json.messages) {
        return { success: true, provider: "meta", messageId: json.messages[0]?.id };
      } else {
        return { success: false, error: json.error?.message || "Meta Cloud API delivery failed" };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  // 2. UltraMsg Gateway
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

  // 3. Twilio Gateway
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

  // 4. Generic Webhook Gateway
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

/**
 * Dispatches automated new listing alert to Admin.
 */
export async function sendAutomatedAdminListingAlert(listing, user) {
  const config = getWhatsAppConfig();
  if (!config.adminPhone) return { success: false, reason: "No admin phone set" };

  const message = `📋 *New Listing Submitted on Xewa!*\n\n• *Business:* ${listing.name}\n• *Category:* ${listing.category_slug}\n• *City/Locality:* ${listing.city_name || "Assam"} (${listing.locality})\n• *Phone:* +91 ${listing.phone}\n• *Submitted by:* ${user?.full_name || "Guest"}\n\nPlease review and publish in the Admin Portal: https://xewa-assam.netlify.app`;

  const result = await sendAutomatedWhatsApp({ to: config.adminPhone, message });
  return result;
}
