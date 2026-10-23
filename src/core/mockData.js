export const INITIAL_DEMO_USERS = [
  {
    id: "usr-admin-01",
    email: "admin@xewa.local",
    full_name: "NEXUS (Admin)",
    phone: "9876543210",
    role: "admin",
    approved: true,
    created_at: "2026-10-03T10:00:00Z"
  },
  {
    id: "usr-user-02",
    email: "contributor@xewa.local",
    full_name: "Bikram Saikia",
    phone: "9876543211",
    role: "user",
    approved: true,
    created_at: "2026-10-04T12:00:00Z"
  },
  {
    id: "usr-user-03",
    email: "newuser@xewa.local",
    full_name: "Rupjyoti Bora",
    phone: "9876543212",
    role: "user",
    approved: false,
    created_at: "2026-10-15T09:30:00Z"
  }
];

export const INITIAL_DEMO_LISTINGS = [
  {
    id: "lst-tez-01",
    city_id: 1, // Tezpur
    city_name: "Tezpur",
    category_slug: "tutors",
    name: "[DEMO] Tezpur Science Academy Coaching",
    description: "Specialized batch and personal coaching for Class 9-12 CBSE and SEBA students. Physics, Chemistry and Advanced Mathematics by experienced faculty with proven state board rank results.",
    phone: "9854011223",
    whatsapp: "9854011223",
    locality: "Mission Chariali",
    address: "Near Baptist Church, 1st Floor, Gyan Bhawan",
    price_info: "₹1,500 / month per subject",
    opening_hours: "7:00 AM - 7:30 PM (Mon-Sat)",
    status: "approved",
    is_verified: true,
    avg_rating: 4.8,
    review_count: 14,
    owner_id: "usr-admin-01",
    photos: [
      "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80"
    ],
    created_at: "2026-10-05T08:00:00Z"
  },
  {
    id: "lst-tez-02",
    city_id: 1, // Tezpur
    city_name: "Tezpur",
    category_slug: "pg-rooms",
    name: "[DEMO] Green View Boys PG & Hostel",
    description: "Spacious, airy 2-seater and 3-seater rooms for college students and working bachelors. Includes high-speed Wi-Fi, 3-times hygienic Assamese home-cooked meals, 24/7 running water, and power backup inverter.",
    phone: "9854022334",
    whatsapp: "9854022334",
    locality: "Tribeni",
    address: "Tribeni Path, Near Ward No. 4 Community Hall",
    price_info: "₹4,500 / month (Food + Rent included)",
    opening_hours: "Gate closes at 9:30 PM",
    status: "approved",
    is_verified: true,
    avg_rating: 4.6,
    review_count: 9,
    owner_id: "usr-user-02",
    photos: [
      "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80"
    ],
    created_at: "2026-10-06T10:00:00Z"
  },
  {
    id: "lst-tez-03",
    city_id: 1, // Tezpur
    city_name: "Tezpur",
    category_slug: "mess-food",
    name: "[DEMO] Maa Kamakhya Home Tiffin & Mess",
    description: "Daily doorstep tiffin box delivery to university hostels, banks, and private residences. Traditional Assamese Joha rice, fish curry, chicken thali, and vegetarian options prepared in clean home kitchen.",
    phone: "9854033445",
    whatsapp: "9854033445",
    locality: "Court Chariali",
    address: "Behind SBI Main Branch, Court Road",
    price_info: "₹80 / standard thali (Monthly ₹2,200)",
    opening_hours: "11:30 AM - 3:00 PM & 6:30 PM - 9:30 PM",
    status: "approved",
    is_verified: true,
    avg_rating: 4.9,
    review_count: 22,
    owner_id: "usr-admin-01",
    photos: [
      "https://images.unsplash.com/photo-1613292443284-8d10ef9383fe?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80"
    ],
    created_at: "2026-10-07T11:30:00Z"
  },
  {
    id: "lst-tez-04",
    city_id: 1, // Tezpur
    city_name: "Tezpur",
    category_slug: "repair",
    name: "[DEMO] Tezpur QuickFix Electrical & AC Service",
    description: "Instant doorstep repair for home appliances: AC installation & gas refill, refrigerator cooling repair, washing machines, geysers, and emergency domestic house wiring.",
    phone: "9854044556",
    whatsapp: "9854044556",
    locality: "Idgah Road",
    address: "Shop #4, Near Tezpur Idgah Field",
    price_info: "₹250 minimum visit / inspection charge",
    opening_hours: "8:00 AM - 8:30 PM (Emergency calls 24/7)",
    status: "approved",
    is_verified: true,
    avg_rating: 4.7,
    review_count: 18,
    owner_id: "usr-user-02",
    photos: [
      "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80"
    ],
    created_at: "2026-10-08T09:00:00Z"
  },
  {
    id: "lst-nag-01",
    city_id: 2, // Nagaon
    city_name: "Nagaon",
    category_slug: "pg-rooms",
    name: "[DEMO] Borpukhuri Par Girls Hostel & PG",
    description: "Safe, CCTV-secured accommodation for college students and working women. Quiet lakeside atmosphere, furnished beds, study desks, and hygienic dining with filtered RO water.",
    phone: "9854055667",
    whatsapp: "9854055667",
    locality: "Borpukhuri Par",
    address: "Opposite Nehru Park, Ward No. 7",
    price_info: "₹5,000 / month (All inclusive)",
    opening_hours: "Visitor hours: 4:00 PM - 7:00 PM",
    status: "approved",
    is_verified: true,
    avg_rating: 4.8,
    review_count: 11,
    owner_id: "usr-admin-01",
    photos: [
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80"
    ],
    created_at: "2026-10-09T14:00:00Z"
  },
  {
    id: "lst-nag-02",
    city_id: 2, // Nagaon
    city_name: "Nagaon",
    category_slug: "delivery",
    name: "[DEMO] Nagaon City Express Delivery & Errands",
    description: "Fast on-demand intra-city 2-wheeler courier service in Nagaon town. Medicine pickups from pharmacies, urgent documents, parcel dispatch to bus counters, and local grocery shopping.",
    phone: "9854066778",
    whatsapp: "9854066778",
    locality: "Haibargaon",
    address: "Near Haibargaon Railway Gate",
    price_info: "Starts from ₹50 per trip within town",
    opening_hours: "7:00 AM - 9:30 PM Daily",
    status: "approved",
    is_verified: true,
    avg_rating: 4.9,
    review_count: 31,
    owner_id: "usr-user-02",
    photos: [
      "https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=800&q=80"
    ],
    created_at: "2026-10-10T12:00:00Z"
  },
  {
    id: "lst-nag-03",
    city_id: 2, // Nagaon
    city_name: "Nagaon",
    category_slug: "tutors",
    name: "[DEMO] Apex Commerce Classes Nagaon",
    description: "Comprehensive coaching for Class 11, 12 Accountancy, Business Studies, and Economics. Special weekend crash courses for CUET and professional foundation exams.",
    phone: "9854077889",
    whatsapp: "9854077889",
    locality: "Daccapatty",
    address: "Near Sishu Vidyapith, Daccapatty",
    price_info: "₹1,200 / month",
    opening_hours: "6:30 AM - 10:00 AM & 3:30 PM - 7:30 PM",
    status: "approved",
    is_verified: false,
    avg_rating: 4.5,
    review_count: 7,
    owner_id: "usr-user-02",
    photos: [
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80"
    ],
    created_at: "2026-10-11T16:00:00Z"
  },
  // A pending submission to test Admin review
  {
    id: "lst-pending-01",
    city_id: 1, // Tezpur
    city_name: "Tezpur",
    category_slug: "repair",
    name: "[DEMO] Dipok Plumber & Sanitary Works",
    description: "24-hour plumbing, water tank cleaning, leakage troubleshooting and bathroom sanitary fitting across Tezpur town.",
    phone: "9854088990",
    whatsapp: "9854088990",
    locality: "Ketekibari",
    address: "Near Ketekibari Namghar",
    price_info: "₹200 inspection charge",
    opening_hours: "8:00 AM - 7:00 PM",
    status: "pending",
    is_verified: false,
    avg_rating: 0,
    review_count: 0,
    owner_id: "usr-user-02",
    photos: [
      "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=800&q=80"
    ],
    created_at: "2026-10-22T09:15:00Z"
  }
];

export const INITIAL_DEMO_REPORTS = [
  {
    id: "rep-01",
    listing_id: "lst-tez-01",
    listing_name: "[DEMO] Tezpur Science Academy Coaching",
    user_id: "usr-user-02",
    user_name: "Bikram Saikia",
    reason: "wrong_info",
    details: "The evening batch timing on Saturday has shifted to 5:00 PM instead of 7:30 PM.",
    status: "open",
    created_at: "2026-10-21T11:00:00Z"
  }
];
