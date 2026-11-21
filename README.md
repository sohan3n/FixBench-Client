# FixBench (`fix-bench`) — Verified Repair & Home-Appliance Service Marketplace

**FixBench** is a full-stack repair and home-appliance service marketplace built with Next.js App Router, TypeScript, Tailwind CSS v4, BetterAuth, Express, MongoDB, and Stripe Checkout. Customers browse admin-moderated repair services, track jobs across a 4-stage lifecycle, pay securely via Stripe only after completion, download printable PDF invoices, and leave verified 1–5 star ratings.

---

## Live Links & Repositories

- **Live Client Application:** `https://fix-bench.vercel.app`
- **Live API Server:** `https://fix-bench-server.vercel.app`
- **Client Repository:** `https://github.com/sohan3n/fix-bench`
- **Server Repository:** `https://github.com/sohan3n/fix-bench-server`

---

## Examiner & Demo Credentials

| Role | Email | Password | Pre-Seeded Capabilities |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@fixbench.com` | `Admin@1234` | Platform KPIs & charts, user role management, pending service approval queue, all bookings, and Stripe revenue ledger |
| **Technician (Verified Pro)** | `tech.pro@fixbench.com` | `Tech@1234` | Verified Pro badge, unlimited service listings, ImgBB photo uploads, and 4-stage job pipeline |
| **Technician (Free Tier)** | `tech.free@fixbench.com` | `Tech@1234` | Free tier (up to 2 service listings) with Stripe Checkout upgrade flow |
| **Customer** | `customer@fixbench.com` | `Customer@1234` | Pre-loaded bookings across `Requested`, `Accepted`, `In Progress`, `Completed (Unpaid)`, and `Completed (Paid)` states |

---

## Key Features

- **Public Service Directory & Details:** Server-side keyword search, category filtering (`Smartphone`, `Laptop & PC`, `AC`, `Refrigerator`, `TV`, `Washing Machine`, `Electrical`), service mode filter (`Home Visit` / `Shop Drop-off`), price range filter, sorting (`Newest`, `Price: Low to High`, `Price: High to Low`), pagination, and verified customer review breakdowns.
- **Role-Based Dashboards:** Dedicated route-protected workspaces for **Customers** (`/dashboard/customer`), **Technicians** (`/dashboard/technician`), and **Admins** (`/dashboard/admin`) plus a shared profile editor (`/dashboard/profile`).
- **4-Stage Repair Job Lifecycle:** Structured progression (`Requested` -> `Accepted` -> `In Progress` -> `Completed`) with final bill entry by technicians and visual timeline tracking for customers.
- **Post-Completion Stripe Checkout & Printable Invoices:** Payment unlocks strictly after the technician marks a booking `Completed`. Includes Stripe Checkout (`4242 4242 4242 4242` in test mode), webhook + session verification, and printable PDF repair receipts.
- **Verified Post-Payment Ratings:** Customers can submit 1–5 star reviews only after completing and paying for a repair.
- **Verified Pro Technician Membership:** Free technicians can list up to 2 services or upgrade via Stripe Checkout (`$19.99`) for unlimited listings and a **Verified Pro** badge.
- **Full Light & Dark Mode Parity:** Persistent theme switching across all public pages, modals, tables, and dashboards.

---

## Environment Variables (`fix-bench/.env.local`)

```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?appName=FixBench
DB_NAME=fixbench
BETTER_AUTH_SECRET=<your_32_char_secret>
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_IMGBB_API_KEY=<your_imgbb_api_key>
GOOGLE_CLIENT_ID=<your_google_client_id>
GOOGLE_CLIENT_SECRET=<your_google_client_secret>

---

## NPM Packages Used

**Dependencies:** `@base-ui/react`, `better-auth`, `class-variance-authority`, `cn`, `lucide-react`, `mongodb`, `next`, `next-themes`, `react`, `react-dom`, `shadcn`, `sonner`, `swiper`, `tw-animate-css`

**Dev Dependencies:** `@tailwindcss/postcss`, `@types/node`, `@types/react`, `@types/react-dom`, `eslint`, `eslint-config-next`, `prettier`, `prettier-plugin-tailwindcss`, `tailwindcss`, `typescript`
