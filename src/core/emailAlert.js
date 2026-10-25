const STORAGE_KEY = "xewa_email_alerts_config";

export const DEFAULT_EMAIL_CONFIG = {
  provider: "emailjs", // 'emailjs' | 'web3forms'
  adminEmail: import.meta.env.VITE_ADMIN_EMAIL || "nilamx3000@gmail.com",

  // EmailJS credentials (Free 200 emails/month forever — sends to ANY user's email)
  emailjsServiceId: import.meta.env.VITE_EMAILJS_SERVICE_ID || "service_52abcjs",
  emailjsTemplateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "template_d6ijl3a",
  emailjsPublicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "praneds1I8Lqt2QvL",

  // Web3Forms access key (Free unlimited form-to-inbox alerts for admin)
  web3formsKey: import.meta.env.VITE_WEB3FORMS_KEY || "",

  enabled: true,
  alertOnSignup: true,
  alertOnListing: true,
  alertOnApproval: true
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
 * Dispatches an automated email in the background via EmailJS REST API or Web3Forms.
 */
async function dispatchEmail({ toEmail, toName, subject, message, senderName, senderEmail }) {
  const config = getEmailConfig();
  if (!config.enabled) return { success: false, reason: "disabled" };

  const targetRecipient = toEmail || config.adminEmail;

  // 1. Primary: EmailJS REST API (Sends directly to arbitrary user emails)
  if (config.emailjsServiceId && config.emailjsTemplateId && config.emailjsPublicKey) {
    try {
      const payload = {
        service_id: config.emailjsServiceId.trim(),
        template_id: config.emailjsTemplateId.trim(),
        user_id: config.emailjsPublicKey.trim(),
        template_params: {
          to_email: targetRecipient,
          to_name: toName || "Valued User",
          from_name: "Xewa Local Services",
          subject: subject,
          message: message,
          reply_to: config.adminEmail,
          action_url: "https://xewa-assam.netlify.app"
        }
      };

      const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        return { success: true, delivered: true, provider: "emailjs", to: targetRecipient };
      } else {
        const errorText = await res.text();
        return { success: false, error: errorText || "EmailJS delivery failed" };
      }
    } catch (err) {
      console.warn("EmailJS error:", err);
      return { success: false, error: err.message };
    }
  }

  // 2. Secondary: Web3Forms (Sends form alert to Admin inbox)
  const web3Key = (config.web3formsKey || "").trim();
  if (web3Key) {
    try {
      const payload = {
        access_key: web3Key,
        subject: subject,
        from_name: "Xewa Local Services",
        name: senderName || toName || "Xewa System",
        email: senderEmail || config.adminEmail,
        message: `Recipient: ${targetRecipient}\n\n${message}`
      };

      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        return { success: true, delivered: true, provider: "web3forms", to: config.adminEmail };
      } else {
        return { success: false, error: data.message || "Web3Forms delivery failed" };
      }
    } catch (err) {
      console.warn("Web3Forms error:", err);
      return { success: false, error: err.message };
    }
  }

  // Graceful simulation when API keys are not yet entered
  console.info("Automated email queued (configure keys in Admin Dashboard):", {
    to: targetRecipient,
    subject
  });

  return {
    success: true,
    simulated: true,
    to: targetRecipient,
    note: "Configure EmailJS or Web3Forms in Admin Dashboard > Email Settings."
  };
}

/**
 * 1. Alert Admin when a new contributor registers.
 */
export async function sendAdminSignupEmailAlert(user) {
  const config = getEmailConfig();
  if (!config.enabled || !config.alertOnSignup) return { success: false, reason: "disabled" };

  const subject = `🔔 [Xewa Alert] New Contributor Registration: ${user.full_name || "New User"}`;
  const message = `Hello Admin,\n\nA new contributor has registered on Xewa and is waiting for your review & approval:\n\n• Full Name: ${user.full_name || "N/A"}\n• Email Address: ${user.email || "N/A"}\n• Calling Phone: +91 ${user.phone || "N/A"}\n• WhatsApp: +91 ${user.whatsapp || user.phone || "N/A"}\n\nPlease review and approve their account in the Admin Portal:\nhttps://xewa-assam.netlify.app\n\n— Automated System, Xewa Local Services`;

  return await dispatchEmail({
    toEmail: config.adminEmail,
    toName: "Admin",
    subject,
    message,
    senderName: user.full_name,
    senderEmail: user.email
  });
}

/**
 * 2. Alert Admin when a new listing is submitted.
 */
export async function sendAdminListingEmailAlert(listing, user) {
  const config = getEmailConfig();
  if (!config.enabled || !config.alertOnListing) return { success: false, reason: "disabled" };

  const subject = `📋 [Xewa Alert] New Listing Submitted: ${listing.name || "Untitled Service"}`;
  const message = `Hello Admin,\n\nA new local service listing has been submitted for review:\n\n• Service / Business: ${listing.name || "N/A"}\n• Category: ${listing.category_slug || "General"}\n• Location: ${listing.city_name || "Assam"} (${listing.locality || ""})\n• Contact Phone: +91 ${listing.phone || "N/A"}\n• WhatsApp: +91 ${listing.whatsapp || listing.phone || "N/A"}\n• Submitted By: ${user?.full_name || "Guest Contributor"} (${user?.email || "N/A"})\n\nPlease verify and publish the listing in the Admin Portal:\nhttps://xewa-assam.netlify.app\n\n— Automated System, Xewa Local Services`;

  return await dispatchEmail({
    toEmail: config.adminEmail,
    toName: "Admin",
    subject,
    message,
    senderName: listing.name,
    senderEmail: user?.email || config.adminEmail
  });
}

/**
 * 3. Notify User when Admin Approves or Rejects their Account.
 */
export async function sendUserApprovalEmail(user, isApproved = true) {
  if (!user?.email) return { success: false, reason: "No user email" };

  const subject = isApproved
    ? `🎉 Your Xewa Contributor Account Has Been Approved!`
    : `Notice Regarding Your Xewa Contributor Account`;

  const message = isApproved
    ? `Hello ${user.full_name || "there"}! 👋\n\nGreat news — your contributor account on Xewa has been reviewed and approved by the administrator! 🎉\n\nYou can now log in, submit verified local services, and manage your listings across Assam.\n\nLog in here: https://xewa-assam.netlify.app\n\nThank you for helping build Assam's trusted local directory!\n— Team Xewa`
    : `Hello ${user.full_name || "there"},\n\nYour contributor account application on Xewa could not be approved at this time. Please ensure your contact details and locality information are valid, or contact the admin for clarification.\n\n— Team Xewa`;

  return await dispatchEmail({
    toEmail: user.email,
    toName: user.full_name,
    subject,
    message
  });
}

/**
 * 4. Notify User when Admin Approves or Rejects their Listing.
 */
export async function sendListingStatusEmail(listing, ownerEmail, isApproved = true) {
  const targetEmail = ownerEmail || listing?.owner_email;
  if (!targetEmail) return { success: false, reason: "No owner email" };

  const subject = isApproved
    ? `✅ Your Listing "${listing.name}" is Now Live on Xewa!`
    : `Update Regarding Your Listing "${listing.name}" on Xewa`;

  const message = isApproved
    ? `Hello! 👋\n\nGreat news — your service listing "${listing.name}" has been verified and published by our local administrators! 🎉\n\nIt is now live, visible, and searchable by residents in ${listing.city_name || "Assam"}.\n\nView and manage listings: https://xewa-assam.netlify.app\n\n— Team Xewa`
    : `Hello,\n\nYour submitted service listing "${listing.name}" could not be approved at this time. Please ensure the phone number, address, and category details are accurate before re-submitting.\n\n— Team Xewa`;

  return await dispatchEmail({
    toEmail: targetEmail,
    toName: listing.name,
    subject,
    message
  });
}

/**
 * 5. Send Test Email to verify setup.
 */
export async function sendTestEmailAlert(toEmail) {
  const config = getEmailConfig();
  const target = toEmail || config.adminEmail;

  const subject = `✅ [Test Alert] Xewa Automated Email System Connected`;
  const message = `Hello Nilam,\n\nCongratulations! Your automated background email alert system for Xewa Local Services is connected and working perfectly.\n\nYou and your users will now automatically receive real-time notifications for registrations, listings, and approval status changes.\n\n— Xewa Automated System (Dr. B.K.B. College 5th Sem Project)`;

  return await dispatchEmail({
    toEmail: target,
    toName: "Nilam",
    subject,
    message
  });
}
