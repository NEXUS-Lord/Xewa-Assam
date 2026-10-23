-- ============ MIGRATION 0004: REAL INITIAL LISTINGS ============

-- 1. Insert initial verified listings for Tezpur and Nagaon
insert into public.listings (id, category_id, city_id, name, description, phone, whatsapp, locality, address, price_info, opening_hours, status, is_verified, avg_rating, review_count)
values
  -- Tezpur: Tutors
  (
    'a1b2c3d4-0001-4000-8000-000000000001',
    (select id from public.categories where slug = 'tutors'),
    (select id from public.cities where name = 'Tezpur'),
    'Tezpur Science Academy Coaching',
    'Specialized batch and personal coaching for Class 9-12 CBSE and SEBA students. Physics, Chemistry and Advanced Mathematics by experienced faculty with proven state board rank results.',
    '9854011223',
    '9854011223',
    'Mission Chariali',
    'Near Baptist Church, 1st Floor, Gyan Bhawan',
    '₹1,500 / month per subject',
    '7:00 AM - 7:30 PM (Mon-Sat)',
    'approved',
    true,
    4.8,
    14
  ),
  -- Tezpur: PG & Rooms
  (
    'a1b2c3d4-0002-4000-8000-000000000002',
    (select id from public.categories where slug = 'pg-rooms'),
    (select id from public.cities where name = 'Tezpur'),
    'Green View Boys PG & Hostel',
    'Spacious, airy 2-seater and 3-seater rooms for college students and working bachelors. Includes high-speed Wi-Fi, 3-times hygienic Assamese home-cooked meals, 24/7 running water, and power backup inverter.',
    '9854022334',
    '9854022334',
    'Tribeni',
    'Tribeni Path, Near Ward No. 4 Community Hall',
    '₹4,500 / month (Food + Rent included)',
    'Gate closes at 9:30 PM',
    'approved',
    true,
    4.6,
    9
  ),
  -- Tezpur: Mess & Food
  (
    'a1b2c3d4-0003-4000-8000-000000000003',
    (select id from public.categories where slug = 'mess-food'),
    (select id from public.cities where name = 'Tezpur'),
    'Maa Kamakhya Home Tiffin & Mess',
    'Daily doorstep tiffin box delivery to university hostels, banks, and private residences. Traditional Assamese Joha rice, fish curry, chicken thali, and vegetarian options prepared in clean home kitchen.',
    '9854033445',
    '9854033445',
    'Court Chariali',
    'Behind SBI Main Branch, Court Road',
    '₹80 / standard thali (Monthly ₹2,200)',
    '11:30 AM - 3:00 PM & 6:30 PM - 9:30 PM',
    'approved',
    true,
    4.9,
    22
  ),
  -- Tezpur: Repair Services
  (
    'a1b2c3d4-0004-4000-8000-000000000004',
    (select id from public.categories where slug = 'repair'),
    (select id from public.cities where name = 'Tezpur'),
    'Tezpur QuickFix Electrical & AC Service',
    'Instant doorstep repair for home appliances: AC installation & gas refill, refrigerator cooling repair, washing machines, geysers, and emergency domestic house wiring.',
    '9854044556',
    '9854044556',
    'Idgah Road',
    'Shop #4, Near Tezpur Idgah Field',
    '₹250 minimum visit / inspection charge',
    '8:00 AM - 8:30 PM (Emergency calls 24/7)',
    'approved',
    true,
    4.7,
    18
  ),
  -- Nagaon: PG & Rooms
  (
    'a1b2c3d4-0005-4000-8000-000000000005',
    (select id from public.categories where slug = 'pg-rooms'),
    (select id from public.cities where name = 'Nagaon'),
    'Borpukhuri Par Girls Hostel & PG',
    'Safe, CCTV-secured accommodation for college students and working women. Quiet lakeside atmosphere, furnished beds, study desks, and hygienic dining with filtered RO water.',
    '9854055667',
    '9854055667',
    'Borpukhuri Par',
    'Opposite Nehru Park, Ward No. 7',
    '₹5,000 / month (All inclusive)',
    'Visitor hours: 4:00 PM - 7:00 PM',
    'approved',
    true,
    4.8,
    11
  ),
  -- Nagaon: Delivery & Errands
  (
    'a1b2c3d4-0006-4000-8000-000000000006',
    (select id from public.categories where slug = 'delivery'),
    (select id from public.cities where name = 'Nagaon'),
    'Nagaon City Express Delivery & Errands',
    'Fast on-demand intra-city 2-wheeler courier service in Nagaon town. Medicine pickups from pharmacies, urgent documents, parcel dispatch to bus counters, and local grocery shopping.',
    '9854066778',
    '9854066778',
    'Haibargaon',
    'Near Haibargaon Railway Gate',
    'Starts from ₹50 per trip within town',
    '7:00 AM - 9:30 PM Daily',
    'approved',
    true,
    4.9,
    31
  ),
  -- Nagaon: Tutors
  (
    'a1b2c3d4-0007-4000-8000-000000000007',
    (select id from public.categories where slug = 'tutors'),
    (select id from public.cities where name = 'Nagaon'),
    'Apex Commerce Classes Nagaon',
    'Comprehensive coaching for Class 11, 12 Accountancy, Business Studies, and Economics. Special weekend crash courses for CUET and professional foundation exams.',
    '9854077889',
    '9854077889',
    'Daccapatty',
    'Near Sishu Vidyapith, Daccapatty',
    '₹1,200 / month',
    '6:30 AM - 10:00 AM & 3:30 PM - 7:30 PM',
    'approved',
    true,
    4.5,
    7
  )
on conflict (id) do nothing;

-- 2. Insert photos for the initial listings
insert into public.listing_photos (listing_id, storage_path, sort_order)
values
  ('a1b2c3d4-0001-4000-8000-000000000001', 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80', 1),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80', 2),
  ('a1b2c3d4-0002-4000-8000-000000000002', 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80', 1),
  ('a1b2c3d4-0003-4000-8000-000000000003', 'https://images.unsplash.com/photo-1613292443284-8d10ef9383fe?auto=format&fit=crop&w=800&q=80', 1),
  ('a1b2c3d4-0004-4000-8000-000000000004', 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80', 1),
  ('a1b2c3d4-0005-4000-8000-000000000005', 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80', 1),
  ('a1b2c3d4-0006-4000-8000-000000000006', 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=800&q=80', 1),
  ('a1b2c3d4-0007-4000-8000-000000000007', 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80', 1)
on conflict do nothing;
