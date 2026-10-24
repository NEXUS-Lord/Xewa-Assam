import { cleanPhone, formatWhatsAppUrl } from "./constants";

// Optional automated WhatsApp webhook (e.g. CallMeBot, custom webhook, or Zapier/Make)
// Users can provide these in their .env or Supabase secrets:
// VITE_ADMIN_WHATSAPP=919876543210
// VITE_WHATSAPP_WEBHOOK_URL=https://api.callmebot.com/whatsapp.php?phone=...&apikey=...
const ADMIN_WHATSAPP = import.meta.env.VITE_ADMIN_WHATSAPP || "";
const WHATSAPP_WEBHOOK_URL = import.meta.env.VITE_WHATSAPP_WEBHOOK_URL || "";

/**
 * Generates a direct WhatsApp link to notify the user of account approval.
 */
export function getUserApprovalWhatsAppUrl(user) {
  const targetNumber = cleanPhone(user.whatsapp || user.phone || "");
  if (!targetNumber) return "";

  const message = `Hello ${user.full_name || "there"}! 👋\n\nGreat news — your contributor account on *Xewa* has been approved by the Admin! 🎉\n\nYou can now log in, submit verified local services, and manage listings across Assam.\n\nVisit: https://xewa-assam.netlify.app`;
  return formatWhatsAppUrl(targetNumber, message);
}

/**
 * Generates a direct WhatsApp link to alert Admin about a new registration.
 */
export function getAdminAlertWhatsAppUrl(user, adminPhone = ADMIN_WHATSAPP) {
  if (!adminPhone) return "";
  const cleanAdmin = cleanPhone(adminPhone);
  const message = `🔔 *New Registration on Xewa!*\n\n• *Name:* ${user.full_name}\n• *Email:* ${user.email}\n• *Calling:* +91 ${user.phone}\n• *WhatsApp:* +91 ${user.whatsapp || user.phone}\n\nPlease review and approve in the Admin Portal: https://xewa-assam.netlify.app`;
  return formatWhatsAppUrl(cleanAdmin, message);
}

/**
 * Attempts automated background notification to admin if webhook is set up.
 */
export async function triggerAdminWhatsAppNotification(user) {
  if (!WHATSAPP_WEBHOOK_URL) return { success: false, reason: "No webhook configured" };

  try {
    const text = encodeURIComponent(
      `🔔 New Xewa Signup:\n${user.full_name} (${user.email})\nPhone: +91 ${user.phone}\nWhatsApp: +91 ${user.whatsapp || user.phone}`
    );

    let url = WHATSAPP_WEBHOOK_URL;
    if (url.includes("[TEXT]")) {
      url = url.replace("[TEXT]", text);
    } else if (url.includes("callmebot.com")) {
      url = `${url}&text=${text}`;
    }

    const response = await fetch(url, { method: "GET", mode: "no-cors" });
    return { success: true };
  } catch (err) {
    console.warn("Automated WhatsApp webhook error:", err);
    return { success: false, error: err.message };
  }
}
