# Xewa: Local Services, Found Fast

> **A local services directory dedicated to small towns of Assam, starting with Tezpur and Nagaon.**  
> *Semester Project for NEXUS | B.Voc IT, Gauhati University*

---

## 🌟 Features Built

- **City Switching**: Switch seamlessly between **Tezpur** and **Nagaon** with persistent selection.
- **Rich Categories**: Tutors & Coaching, PG & Rooms, Mess & Food, Repair Services, Delivery & Errands, and Other Services.
- **Instant Search**: 300ms debounced search matching service name, description, and locality with input sanitization.
- **Direct 1-Tap Contact**:
  - **Call Button**: `tel:+91...`
  - **WhatsApp Button**: Instant pre-filled chat message (`https://wa.me/91...`)
  - **Desktop Phone Copier**: Copies the 10-digit Indian mobile number to clipboard in 1 click.
- **Photo Carousel Gallery**: View high-resolution photos for each listing.
- **Suggest a Listing**: Community submission form with 10-digit phone validation (starts with 6–9), locality, pricing, hours, and up to 5 photos.
- **User Approval Gate**:
  - Unapproved accounts start in waiting status.
  - Visitors and unapproved users can freely browse and contact services.
  - Only approved contributor accounts can submit listings or report info.
- **My Submissions & Photo Management**: View status chips (*Approved*, *Under Review*, *Rejected*), add or remove photos on your own submissions.
- **Admin Management Portal**:
  - **Pending Listings Queue**: Review, edit, approve, or reject submissions.
  - **User Approvals**: Review signups, approve contributors, or revoke access.
  - **Community Reports**: Moderate reported inaccuracies and mark them resolved.
  - **All Listings Directory**: Full management over every listing.
- **Instant Test Logins**: 1-click test roles for **Admin (NEXUS)**, **Approved Contributor (Bikram)**, and **Unapproved User (Rupjyoti)**.
- **Dual Mode**: Runs with local mock storage out of the box, or connects directly to live **Supabase** via the in-app configuration button.

---

## 🚀 How to Run Locally

```bash
# 1. Install dependencies (already installed)
npm install

# 2. Start the development server
npm run dev
```

Visit **`http://localhost:5173/`** in your browser.

---

## 🗄️ Supabase Database Setup

All 3 SQL migrations are ready in `supabase/migrations/`:

1. [`0001_init.sql`](file:///c:/Users/nilam/Downloads/5th%20sem%20project/supabase/migrations/0001_init.sql): Core tables (`profiles`, `cities`, `categories`, `listings`, `listing_photos`, `reports`, `reviews`), RLS policies, and triggers.
2. [`0002_owner_photos.sql`](file:///c:/Users/nilam/Downloads/5th%20sem%20project/supabase/migrations/0002_owner_photos.sql): Policies allowing contributors to upload and delete photos on their own listings.
3. [`0003_user_approval.sql`](file:///c:/Users/nilam/Downloads/5th%20sem%20project/supabase/migrations/0003_user_approval.sql): Contributor approval gate and secure admin RPC `set_user_approval`.

### Connecting your Supabase Project:
1. Open the app at `http://localhost:5173/`.
2. Click the **"Local Demo Mode"** badge in the top navbar.
3. Paste your **Project URL** and **Anon Key**, then click **Save & Connect**.
4. (Or add them to `.env` as `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`).

---

## 🌐 Deploying to Netlify / Vercel

```bash
# Build the production bundle
npm run build
```

The output in `dist/` contains:
- `index.html` (with OpenGraph tags and PWA manifest)
- Optimized JS and CSS assets
- `_redirects` file pre-configured for SPA routing (`/* /index.html 200`)

Drag and drop the `dist/` folder directly to [Netlify Drop](https://app.netlify.com/drop) or push to GitHub to deploy!
