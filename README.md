# Personal Job Application Tracker

A full-stack, mobile-friendly personal job application tracker built with Next.js (App Router), TypeScript, Tailwind CSS, and Supabase (Postgres + Auth with Row Level Security).

## Features

1. **Email & Password Authentication**: Supabase authentication with session exchange; includes offline/demo fallback mode for quick testing out-of-the-box.
2. **Board View (Kanban)**: Columns for each application stage (`saved`, `awaiting_referral`, `referred`, `applied`, `interviewing`, `offer`, `rejected`, `withdrawn`). Move jobs quickly using the status dropdown or drag-and-drop.
3. **List View**: Sortable and filterable table by company, role, status, and application date with an instant toggle between Board and List.
4. **Permanent Job Description (JD) Storage**: Large textarea for pasting long JDs so you never lose the requirements when a job posting expires.
5. **Job Detail Page**: Readable typography layout for pasted JDs with a one-click **"Copy JD"** button.
6. **Referral Tracking & 5+ Day Follow-up Highlight**: Tracks connection status (`none`, `sent`, `accepted`, `referral_given`) and days elapsed. If a request is waiting 5+ days, it highlights the card with an amber badge saying **"Follow up (X days)"**.
7. **"Today" Action Panel**: Surfaces follow-ups due, interviews scheduled in the next 7 days, and stale saved jobs (saved 7+ days ago but not yet applied to).
8. **Live Stats Row**: Interactive counts for total saved, waiting on referral, applied, interviewing, and offers. Clicking a stat instantly filters your board or table.
9. **Omni-Search**: Real-time search across company, role, contact name, and pasted JD text.
10. **CSV Export & Import**: Export all tracked applications to CSV and import existing records with RFC-4180 parsing and validation.
11. **Quick-Add (<10s)**: Minimal form (Company, Role, URL, JD) to save an opportunity in under 10 seconds.
12. **Design & UX**: Cool blue-grey palette with blue accent, amber for waiting states, light/dark mode following system preferences, accessible keyboard focus, and mobile-first responsive layout with a floating action button.

---

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database & Auth**: Supabase (PostgreSQL with Row Level Security & Email/Password Auth)
- **Validation**: Zod
- **Icons**: Lucide React

---

## Database Setup (Supabase)

1. Create a project at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** in your Supabase Dashboard.
3. Open `supabase/migrations/20261109000000_create_jobs.sql` and run the script to create the `jobs` table, custom enum types, indexes, and Row Level Security policies.
4. (Optional) Run `supabase/seed.sql` to populate 5 realistic sample jobs.

### Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> **Note**: If `.env.local` is omitted, the app automatically runs in **Local Demo Mode** using browser storage pre-seeded with 5 sample jobs, allowing you to test every feature without creating a Supabase project first.

---

## Local Development

Install dependencies and start the dev server:

```bash
pnpm install
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Deploying to Vercel

1. Push your repository to GitHub.
2. In the [Vercel Dashboard](https://vercel.com), click **Add New Project** and import this repository.
3. In **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase Project URL.
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase Anon public API key.
4. Click **Deploy**. Vercel will automatically build and deploy your app.

