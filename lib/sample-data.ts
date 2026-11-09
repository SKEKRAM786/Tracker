import { Job } from './types';
import { getTodayDateString } from './date-utils';

function daysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function daysAhead(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const INITIAL_SAMPLE_JOBS: Job[] = [
  {
    id: 'a1111111-1111-1111-1111-111111111111',
    user_id: 'default-user',
    created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    company: 'Stripe',
    role: 'Senior Full Stack Engineer - Developer Infrastructure',
    job_url: 'https://stripe.com/jobs/senior-fullstack-dev-infra',
    location: 'Remote (US / Europe)',
    salary: '$185,000 - $220,000 + Equity',
    status: 'saved',
    jd_text: `About Stripe: Stripe is a financial infrastructure platform for businesses. Millions of companies use Stripe to accept payments, grow revenue, and accelerate new business opportunities. We are looking for an experienced full stack engineer to join our Developer Infrastructure organization.

Responsibilities:
- Build high-scale developer portals, web tools, and observability dashboards.
- Design resilient APIs with TypeScript, Node.js, React, and Go.
- Collaborate with security, data platform, and engineering teams globally.
- Improve system telemetry and latency monitoring across production clusters.

Qualifications:
- 5+ years building production web applications.
- Strong proficiency with TypeScript, React, and server-side backend services.
- Experience with distributed systems and relational databases.`,
    resume_version: 'Resume_FullStack_2026_v2.pdf',
    applied_on: null,
    source: 'LinkedIn',
    referral_contact_name: null,
    referral_contact_role: null,
    referral_contact_linkedin_url: null,
    connection_status: 'none',
    connection_sent_on: null,
    next_followup_on: null,
    interview_dates: [],
    notes: 'Saved over a week ago! High priority role, need to tailor resume and see if I have 2nd-degree connections before applying.',
  },
  {
    id: 'b2222222-2222-2222-2222-222222222222',
    user_id: 'default-user',
    created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    company: 'Airbnb',
    role: 'Staff Frontend Engineer - Host Experience',
    job_url: 'https://careers.airbnb.com/positions/staff-fe-host',
    location: 'San Francisco, CA / Remote',
    salary: '$210,000 - $250,000 + RSUs',
    status: 'awaiting_referral',
    jd_text: `The Host Experience team at Airbnb crafts the end-to-end interface and mobile-web tooling for millions of hosts worldwide.

What You Will Do:
- Architect rich, interactive web applications with sub-second page loads.
- Pioneer new design systems and accessibility best practices across mobile and desktop.
- Mentor senior engineers and drive cross-team technical alignment.

Requirements:
- Deep expertise with modern web performance, React, Next.js, and CSS architecture.
- Experience driving architectural direction across cross-functional teams.
- Passion for delighting users with intuitive micro-interactions and accessibility.`,
    resume_version: 'Resume_Staff_FE_2026.pdf',
    applied_on: null,
    source: 'referral',
    referral_contact_name: 'Sarah Chen',
    referral_contact_role: 'Staff Software Engineer at Airbnb',
    referral_contact_linkedin_url: 'https://linkedin.com/in/sarah-chen-sample',
    connection_status: 'sent',
    connection_sent_on: daysAgo(6),
    next_followup_on: getTodayDateString(),
    interview_dates: [],
    notes: 'Sent connection request 6 days ago with a warm note citing her tech talk on server components. Follow up is due today!',
  },
  {
    id: 'c3333333-3333-3333-3333-333333333333',
    user_id: 'default-user',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    company: 'Vercel',
    role: 'Senior Solutions Architect',
    job_url: 'https://vercel.com/careers/solutions-architect',
    location: 'Remote (Worldwide)',
    salary: '$175,000 - $205,000',
    status: 'applied',
    jd_text: `Vercel enables developers to build and deploy web applications instantly.

Role:
- Help enterprise clients architect, optimize, and deploy Next.js and AI SDK applications.
- Bridge client technical requirements with product and engineering teams.
- Write guides, code samples, and technical demos.
- Troubleshoot edge runtime performance, edge caching, and serverless functions.`,
    resume_version: 'Resume_Architect_2026.pdf',
    applied_on: daysAgo(3),
    source: 'company site',
    referral_contact_name: null,
    referral_contact_role: null,
    referral_contact_linkedin_url: null,
    connection_status: 'none',
    connection_sent_on: null,
    next_followup_on: daysAhead(7),
    interview_dates: [],
    notes: 'Submitted direct application through Greenhouse. Included my open-source Next.js demo repository.',
  },
  {
    id: 'd4444444-4444-4444-4444-444444444444',
    user_id: 'default-user',
    created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    company: 'Linear',
    role: 'Product Engineer - Web & Desktop',
    job_url: 'https://linear.app/careers/product-engineer',
    location: 'Remote (US / EU)',
    salary: '$190,000 - $230,000 + 0.1% Equity',
    status: 'interviewing',
    jd_text: `Linear is built for high-performance software teams. We value craft, speed, and clean code.

What you will do:
- Craft fluid keyboard-driven web applications.
- Optimize client-side caching, SQLite synchronization, and real-time multiplayer updates.
- Work directly with product designers to ship polished features weekly.
- Ensure exceptional snappy performance (sub-50ms user interactions).`,
    resume_version: 'Resume_ProductEng_2026.pdf',
    applied_on: daysAgo(12),
    source: 'referral',
    referral_contact_name: 'Marcus Vance',
    referral_contact_role: 'Engineering Lead at Linear',
    referral_contact_linkedin_url: 'https://linkedin.com/in/marcus-vance-sample',
    connection_status: 'referral_given',
    connection_sent_on: daysAgo(14),
    next_followup_on: daysAhead(2),
    interview_dates: [
      {
        id: '1',
        date: daysAgo(4),
        note: 'Recruiter phone screen - went great!',
      },
      {
        id: '2',
        date: daysAhead(2),
        note: 'Technical architecture & live coding with tech lead',
      },
    ],
    notes: 'Marcus referred me internally. Recruiter screen loved the open-source projects. Prep offline-first architecture & state sync for Round 2 in 2 days.',
  },
  {
    id: 'e5555555-5555-5555-5555-555555555555',
    user_id: 'default-user',
    created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    company: 'Figma',
    role: 'Staff Engineer - Collaboration Infrastructure',
    job_url: 'https://figma.com/careers/staff-collab-infra',
    location: 'San Francisco / Hybrid',
    salary: '$225,000 - $265,000 + Equity',
    status: 'offer',
    jd_text: `Figma connects everyone in the design process.

Role Overview:
- Scale multi-region multiplayer synchronization infrastructure.
- Build high-throughput WebAssembly & WebGPU collaborative canvases.
- Lead architecture reviews and mentor senior staff.
- Ensure 99.99% uptime for synchronous collaborative editing.`,
    resume_version: 'Resume_Figma_Custom.pdf',
    applied_on: daysAgo(20),
    source: 'company site',
    referral_contact_name: null,
    referral_contact_role: null,
    referral_contact_linkedin_url: null,
    connection_status: 'none',
    connection_sent_on: null,
    next_followup_on: daysAhead(4),
    interview_dates: [
      {
        id: '1',
        date: daysAgo(14),
        note: 'Initial Recruiter Screen',
      },
      {
        id: '2',
        date: daysAgo(8),
        note: 'System Design Virtual Onsite (4 rounds)',
      },
      {
        id: '3',
        date: daysAgo(2),
        note: 'Offer discussion with VP Engineering',
      },
    ],
    notes: 'Offer received! Base: $240k, $400k equity over 4 yrs. Written offer letter expires next Friday. Reviewing benefits and health coverage.',
  },
];

