import { cleanPhone, formatWhatsAppUrl } from "./constants";

const ADMIN_STORAGE_KEY = "xewa_admin_whatsapp";
const DEFAULT_ADMIN_PHONE = import.meta.env.VITE_ADMIN_WHATSAPP || "9854011223";

/**
 * Gets the current Admin WhatsApp phone number.
 */
export function getAdminWhatsApp() {
  try {
    const saved = localStorage.getItem(ADMIN_STORAGE_KEY);
    return cleanPhone(saved || DEFAULT_ADMIN_PHONE);
  } catch (e) {
    return cleanPhone(DEFAULT_ADMIN_PHONE);
  }
}

/**
 * Saves a new Admin WhatsApp phone number.
 */
export function saveAdminWhatsApp(phone) {
  try {
    const cleaned = cleanPhone(phone);
    localStorage.setItem(ADMIN_STORAGE_KEY, cleaned);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * URL to notify a user when their account is approved by Admin.
 */
export function getUserApprovalWhatsAppUrl(user) {
  const targetNumber = cleanPhone(user.whatsapp || user.phone || "");
  if (!targetNumber) return "";

  const message = `Hello ${user.full_name || "there"}! 👋\n\nGreat news — your contributor account on *Xewa* has been approved by the Admin! 🎉\n\nYou can now log in, submit verified local services, and manage listings across Assam.\n\nVisit: https://xewa-assam.netlify.app`;
  return formatWhatsAppUrl(targetNumber, message);
}

/**
 * URL to alert Admin when a new user signs up.
 */
export function getAdminAlertWhatsAppUrl(user) {
  const adminPhone = getAdminWhatsApp();
  if (!adminPhone) return "";

  const message = `🔔 *New Registration on Xewa!*\n\n• *Name:* ${user.full_name || "New Contributor"}\n• *Email:* ${user.email || "N/A"}\n• *Calling:* +91 ${user.phone || "N/A"}\n• *WhatsApp:* +91 ${user.whatsapp || user.phone || "N/A"}\n\nPlease review and approve in the Admin Portal: https://xewa-assam.netlify.app`;
  return formatWhatsAppUrl(adminPhone, message);
}

/**
 * URL to alert Admin when a new service listing is submitted.
 */
export function getAdminListingAlertWhatsAppUrl(listing, user) {
  const adminPhone = getAdminWhatsApp();
  if (!adminPhone) return "";

  const message = `📋 *New Listing Submitted on Xewa!*\n\n• *Business:* ${listing.name || "Untitled Listing"}\n• *Category:* ${listing.category_slug || "Service"}\n• *Locality:* ${listing.city_name || "Assam"} (${listing.locality || ""})\n• *Phone:* +91 ${listing.phone || "N/A"}\n• *WhatsApp:* +91 ${listing.whatsapp || listing.phone || "N/A"}\n• *Submitted by:* ${user?.full_name || "Guest Contributor"}\n\nPlease review and publish in the Admin Portal: https://xewa-assam.netlify.app`;
  return formatWhatsAppUrl(adminPhone, message);
}

/**
 * Dispatches notification to user upon approval.
 */
export function notifyUserOnApproval(user) {
  const url = getUserApprovalWhatsAppUrl(user);
  if (url && typeof window !== "undefined") {
    window.open(url, "_blank");
    return true;
  }
  return false;
}

/**
 * Dispatches alert to Admin upon new user registration.
 */
export function notifyAdminOnSignup(user) {
  const url = getAdminAlertWhatsAppUrl(user);
  if (url && typeof window !== "undefined") {
    window.open(url, "_blank");
    return true;
  }
  return false;
}

/**
 * Dispatches alert to Admin upon new listing submission.
 */
export function notifyAdminOnListing(listing, user) {
  const url = getAdminListingAlertWhatsAppUrl(listing, user);
  if (url && typeof window !== "undefined") {
    window.open(url, "_blank");
    return true;
  }
  return false;
}

// Backwards-compatible aliases for existing code
export const sendAutomatedUserApprovalWhatsApp = async (user) => {
  const ok = notifyUserOnApproval(user);
  return { success: ok, direct: true };
};

export const sendAutomatedAdminSignupAlert = async (user) => {
  const ok = notifyAdminOnSignup(user);
  return { success: ok, direct: true };
};

export const sendAutomatedAdminListingAlert = async (listing, user) => {
  const ok = notifyAdminOnListing(listing, user);
  return { success: ok, direct: true };
};

export async function triggerAdminWhatsAppNotification(user) {
  return { success: true };
}
