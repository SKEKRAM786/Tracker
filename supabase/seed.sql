-- Supabase Seed SQL
-- Inserts 5 realistic sample jobs for a user
-- Note: Replace '00000000-0000-0000-0000-000000000000' with your auth.uid() or use auth.uid() in dashboard

insert into public.jobs (
  id,
  user_id,
  created_at,
  updated_at,
  company,
  role,
  job_url,
  location,
  salary,
  status,
  jd_text,
  resume_version,
  applied_on,
  source,
  referral_contact_name,
  referral_contact_role,
  referral_contact_linkedin_url,
  connection_status,
  connection_sent_on,
  next_followup_on,
  interview_dates,
  notes
) values
(
  'a1111111-1111-1111-1111-111111111111',
  coalesce(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
  now() - interval '8 days',
  now() - interval '8 days',
  'Stripe',
  'Senior Full Stack Engineer - Developer Infrastructure',
  'https://stripe.com/jobs/senior-fullstack-dev-infra',
  'Remote (US / Europe)',
  '$185,000 - $220,000 + Equity',
  'saved',
  'About Stripe: Stripe is a financial infrastructure platform for businesses. We are looking for an experienced full stack engineer to join our Developer Infrastructure organization.

Responsibilities:
- Build high-scale developer portals, web tools, and observability dashboards.
- Design resilient APIs with TypeScript, Node.js, React, and Go.
- Collaborate with security, data platform, and engineering teams globally.

Qualifications:
- 5+ years building production web applications.
- Strong proficiency with TypeScript, React, and server-side backend services.
- Experience with distributed systems and relational databases.',
  'Resume_FullStack_2026_v2.pdf',
  null,
  'LinkedIn',
  null,
  null,
  null,
  'none',
  null,
  null,
  '[]'::jsonb,
  'Saved over a week ago! High priority role, tailor resume before applying.'
),
(
  'b2222222-2222-2222-2222-222222222222',
  coalesce(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
  now() - interval '6 days',
  now() - interval '6 days',
  'Airbnb',
  'Staff Frontend Engineer - Host Experience',
  'https://careers.airbnb.com/positions/staff-fe-host',
  'San Francisco, CA / Remote',
  '$210,000 - $250,000 + RSUs',
  'awaiting_referral',
  'The Host Experience team at Airbnb crafts the end-to-end interface and mobile-web tooling for hosts worldwide.

Requirements:
- Deep expertise with modern web performance, React, Next.js, and design systems.
- Experience driving architectural direction across cross-functional teams.
- Passion for delighting users with intuitive micro-interactions and accessibility.',
  'Resume_Staff_FE_2026.pdf',
  null,
  'referral',
  'Sarah Chen',
  'Staff Software Engineer at Airbnb',
  'https://linkedin.com/in/sarah-chen-sample',
  'sent',
  (current_date - interval '6 days')::date,
  (current_date)::date,
  '[]'::jsonb,
  'Sent connection request 6 days ago with a warm note citing her tech talk on server components. Follow up due today!'
),
(
  'c3333333-3333-3333-3333-333333333333',
  coalesce(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
  now() - interval '3 days',
  now() - interval '3 days',
  'Vercel',
  'Senior Solutions Architect',
  'https://vercel.com/careers/solutions-architect',
  'Remote (Worldwide)',
  '$175,000 - $205,000',
  'applied',
  'Vercel enables developers to build and deploy web applications instantly.

Role:
- Help enterprise clients architect, optimize, and deploy Next.js and AI SDK applications.
- Bridge client technical requirements with product and engineering teams.
- Write guides, code samples, and technical demos.',
  'Resume_Architect_2026.pdf',
  (current_date - interval '3 days')::date,
  'company site',
  null,
  null,
  null,
  'none',
  null,
  (current_date + interval '7 days')::date,
  '[]'::jsonb,
  'Submitted direct application through greenhouse. Included sample repo link.'
),
(
  'd4444444-4444-4444-4444-444444444444',
  coalesce(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
  now() - interval '12 days',
  now() - interval '1 day',
  'Linear',
  'Product Engineer - Web & Desktop',
  'https://linear.app/careers/product-engineer',
  'Remote (US/EU)',
  '$190,000 - $230,000 + 0.1% Equity',
  'interviewing',
  'Linear is built for high-performance software teams. We value craft, speed, and clean code.

What you will do:
- Craft fluid keyboard-driven web applications.
- Optimize client-side caching, SQLite synchronization, and real-time multiplayer updates.
- Work directly with product designers to ship polished features weekly.',
  'Resume_ProductEng_2026.pdf',
  (current_date - interval '12 days')::date,
  'referral',
  'Marcus Vance',
  'Engineering Lead at Linear',
  'https://linkedin.com/in/marcus-vance-sample',
  'referral_given',
  (current_date - interval '14 days')::date,
  (current_date + interval '2 days')::date,
  jsonb_build_array(
    jsonb_build_object('date', (current_date - interval '4 days')::text, 'note', 'Recruiter phone screen - went great!'),
    jsonb_build_object('date', (current_date + interval '2 days')::text, 'note', 'Technical architecture & live coding with tech lead')
  ),
  'Marcus referred me internally. Recruiter screen loved the open-source projects. Prep offline-first architecture & state sync for Round 2.'
),
(
  'e5555555-5555-5555-5555-555555555555',
  coalesce(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
  now() - interval '20 days',
  now() - interval '2 days',
  'Figma',
  'Staff Engineer - Collaboration Infrastructure',
  'https://figma.com/careers/staff-collab-infra',
  'San Francisco / Hybrid',
  '$225,000 - $265,000 + Equity',
  'offer',
  'Figma connects everyone in the design process.

Role Overview:
- Scale multi-region multiplayer synchronization infrastructure.
- Build high-throughput WebAssembly & WebGPU collaborative canvases.
- Lead architecture reviews and mentor senior staff.',
  'Resume_Figma_Custom.pdf',
  (current_date - interval '20 days')::date,
  'company site',
  null,
  null,
  null,
  'none',
  null,
  (current_date + interval '4 days')::date,
  jsonb_build_array(
    jsonb_build_object('date', (current_date - interval '14 days')::text, 'note', 'Initial Recruiter Screen'),
    jsonb_build_object('date', (current_date - interval '8 days')::text, 'note', 'System Design Virtual Onsite (4 rounds)'),
    jsonb_build_object('date', (current_date - interval '2 days')::text, 'note', 'Offer discussion with VP Engineering')
  ),
  'Offer received! Base: $240k, $400k equity over 4 yrs. Written offer letter expires next Friday. Reviewing benefits.'
);

