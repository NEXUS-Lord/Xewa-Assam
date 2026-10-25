import {
  getAdminWhatsApp,
  saveAdminWhatsApp,
  getUserApprovalWhatsAppUrl,
  getAdminAlertWhatsAppUrl,
  getAdminListingAlertWhatsAppUrl,
  notifyUserOnApproval,
  notifyAdminOnSignup,
  notifyAdminOnListing,
  sendAutomatedUserApprovalWhatsApp,
  sendAutomatedAdminSignupAlert,
  sendAutomatedAdminListingAlert
} from "./whatsappAlert";
import { formatWhatsAppUrl, cleanPhone } from "./constants";

export {
  getAdminWhatsApp,
  saveAdminWhatsApp,
  getUserApprovalWhatsAppUrl,
  getAdminAlertWhatsAppUrl,
  getAdminListingAlertWhatsAppUrl,
  notifyUserOnApproval,
  notifyAdminOnSignup,
  notifyAdminOnListing,
  sendAutomatedUserApprovalWhatsApp,
  sendAutomatedAdminSignupAlert,
  sendAutomatedAdminListingAlert
};

export const DEFAULT_CONFIG = {
  provider: "direct",
  enabled: true,
  adminPhone: getAdminWhatsApp()
};

export function getWhatsAppConfig() {
  return {
    provider: "direct",
    enabled: true,
    adminPhone: getAdminWhatsApp()
  };
}

export function saveWhatsAppConfig(config) {
  if (config?.adminPhone) {
    saveAdminWhatsApp(config.adminPhone);
  }
  return true;
}

export async function sendAutomatedWhatsApp({ to, message }) {
  const url = formatWhatsAppUrl(to, message);
  if (url && typeof window !== "undefined") {
    window.open(url, "_blank");
    return { success: true, direct: true };
  }
  return { success: false, error: "Could not format WhatsApp link." };
}
