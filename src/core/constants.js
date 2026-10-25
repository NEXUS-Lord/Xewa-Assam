export const kAppName = "Xewa";
export const kAppTagline = "Local Services, Found Fast";

export const CITIES = [
  { id: 1, name: "Tezpur", tag: "Sonitpur District", image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80" },
  { id: 2, name: "Nagaon", tag: "Central Assam", image: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=600&q=80" }
];

export const CATEGORIES = [
  { slug: "tutors", name: "Tutors & Coaching", icon: "GraduationCap", desc: "School, college, competitive exam & spoken English", count: 8 },
  { slug: "pg-rooms", name: "PG & Rooms", icon: "Home", desc: "Single/sharing student PGs, bachelor & family rentals", count: 12 },
  { slug: "mess-food", name: "Mess & Food", icon: "Utensils", desc: "Daily home thali, lunchboxes & student mess services", count: 9 },
  { slug: "repair", name: "Repair Services", icon: "Wrench", desc: "Electricians, plumbers, AC, fridge & mobile repairs", count: 14 },
  { slug: "delivery", name: "Delivery & Errands", icon: "Truck", desc: "Local courier, medicine pickup & market errands", count: 6 },
  { slug: "other", name: "Other Services", icon: "MoreHorizontal", desc: "Photography, events, tailoring & local specialists", count: 5 }
];

export const REPORT_REASONS = [
  { value: "wrong_info", label: "Wrong phone number or address" },
  { value: "closed", label: "Permanently closed / no longer active" },
  { value: "spam", label: "Spam, fraudulent or duplicate listing" },
  { value: "other", label: "Other problem" }
];

// Indian 10-digit mobile number validation (starts with 6, 7, 8, or 9)
export function isValidIndianPhone(phone) {
  if (!phone) return false;
  const cleaned = phone.replace(/[\s\-\(\)\+]/g, "");
  return /^[6-9]\d{9}$/.test(cleaned);
}

export function cleanPhone(phone) {
  if (!phone) return "";
  return phone.replace(/[\s\-\(\)\+]/g, "").slice(-10);
}

export function formatWhatsAppUrl(phone, listingNameOrCustomText = "") {
  const num = cleanPhone(phone);
  if (!num) return "";
  let text = "";
  if (!listingNameOrCustomText) {
    text = encodeURIComponent("Hi! I found your service on Xewa. Are your services available?");
  } else if (
    listingNameOrCustomText.includes("\n") ||
    listingNameOrCustomText.includes("*") ||
    listingNameOrCustomText.startsWith("Hi") ||
    listingNameOrCustomText.startsWith("Hello") ||
    listingNameOrCustomText.startsWith("🔔") ||
    listingNameOrCustomText.startsWith("📋")
  ) {
    text = encodeURIComponent(listingNameOrCustomText);
  } else {
    text = encodeURIComponent(`Hi! I found your listing "${listingNameOrCustomText}" on Xewa. Are your services available?`);
  }
  return `https://wa.me/91${num}?text=${text}`;
}

export function formatTelUrl(phone) {
  const num = cleanPhone(phone);
  return `tel:+91${num}`;
}
