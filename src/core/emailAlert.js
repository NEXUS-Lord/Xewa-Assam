const STORAGE_KEY = "xewa_email_alerts_config";

export const DEFAULT_EMAIL_CONFIG = {
  adminEmail: import.meta.env.VITE_ADMIN_EMAIL || "nilamx3000@gmail.com",
  web3formsKey: import.meta.env.VITE_WEB3FORMS_KEY || "",
  enabled: true,
  alertOnSignup: true,
  alertOnListing: true
};

export function getEmailConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_EMAIL_CONFIG };
    return { ...DEFAULT_EMAIL_CONFIG, ...JSON.parse(raw) };
  } catch (e) {
    return { ...DEFAULT_EMAIL_CONFIG };
  }
}

export function saveEmailConfig(config) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    return true;
  } catch (e) {
    console.error("Failed to save email config:", e);
    return false;
  }
}

/**
 * Dispatches an automated email in the background via Web3Forms.
 */
async function dispatchEmail({ subject, message, senderName, senderEmail, accessKey, toEmail }) {
  const config = getEmailConfig();
  const key = (accessKey || config.web3formsKey || "").trim();

  // If access key is configured, send live email via Web3Forms API
  if (key) {
    try {
      const payload = {
        access_key: key,
        subject: subject,
        from_name: "Xewa Local Services",
        name: senderName || "Xewa Contributor",
        email: senderEmail || config.adminEmail,
        message: message
      };

      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        return { success: true, delivered: true, provider: "web3forms" };
      } else {
        return { success: false, error: data.message || "Email delivery failed" };
      }
    } catch (err) {
      console.warn("Automated email dispatch error:", err);
      return { success: false, error: err.message };
    }
  }

  // Graceful fallback when key is not yet pasted: log cleanly
  console.info("Automated email prepared:", { subject, to: toEmail || config.adminEmail });
  return {
    success: true,
    simulated: true,
    note: "Web3Forms Access Key not set. Configure in Admin Dashboard > Email Alerts."
  };
}

/**
 * Automatically sends email alert to Admin when someone registers.
 */
export async function sendAdminSignupEmailAlert(user) {
  const config = getEmailConfig();
  if (!config.enabled || !config.alertOnSignup) return { success: false, reason: "disabled" };

  const subject = `🔔 [Xewa Alert] New Contributor Registration: ${user.full_name || "New User"}`;
  const message = `Hello Admin,\n\nA new contributor has registered on Xewa and is waiting for your review & approval:\n\n• Full Name: ${user.full_name || "N/A"}\n• Email Address: ${user.email || "N/A"}\n• Calling Phone: +91 ${user.phone || "N/A"}\n• WhatsApp: +91 ${user.whatsapp || user.phone || "N/A"}\n\nPlease review and approve their contributor account in the Admin Portal:\nhttps://xewa-assam.netlify.app\n\n— Automated System, Xewa Local Services`;

  return await dispatchEmail({
    subject,
    message,
    senderName: user.full_name,
    senderEmail: user.email,
    toEmail: config.adminEmail
  });
}

/**
 * Automatically sends email alert to Admin when someone submits a new service listing.
 */
export async function sendAdminListingEmailAlert(listing, user) {
  const config = getEmailConfig();
  if (!config.enabled || !config.alertOnListing) return { success: false, reason: "disabled" };

  const subject = `📋 [Xewa Alert] New Listing Submitted: ${listing.name || "Untitled Service"}`;
  const message = `Hello Admin,\n\nA new local service listing has been submitted for review:\n\n• Service / Business: ${listing.name || "N/A"}\n• Category: ${listing.category_slug || "General"}\n• Location: ${listing.city_name || "Assam"} (${listing.locality || ""})\n• Contact Phone: +91 ${listing.phone || "N/A"}\n• WhatsApp: +91 ${listing.whatsapp || listing.phone || "N/A"}\n• Submitted By: ${user?.full_name || "Guest Contributor"} (${user?.email || "N/A"})\n\nPlease verify and publish the listing in the Admin Portal:\nhttps://xewa-assam.netlify.app\n\n— Automated System, Xewa Local Services`;

  return await dispatchEmail({
    subject,
    message,
    senderName: listing.name,
    senderEmail: user?.email || config.adminEmail,
    toEmail: config.adminEmail
  });
}

/**
 * Dispatches test email to confirm setup.
 */
export async function sendTestEmailAlert(toEmail) {
  const config = getEmailConfig();
  const target = toEmail || config.adminEmail;

  const subject = `✅ [Test Alert] Xewa Automated Email System Connected`;
  const message = `Hello Nilam,\n\nCongratulations! Your automated background email alert system for Xewa Local Services is connected and working perfectly.\n\nYou will automatically receive real-time notifications here whenever:\n1. A new user registers on Xewa.\n2. A new local service or business is submitted for review.\n\n— Xewa Automated Notifications (Dr. B.K.B. College 5th Sem Project)`;

  return await dispatchEmail({
    subject,
    message,
    senderName: "Xewa Notification Test",
    senderEmail: "noreply@xewa.local",
    toEmail: target
  });
}
