-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Define custom types/enums
do $$ begin
  create type job_status as enum (
    'saved',
    'awaiting_referral',
    'referred',
    'applied',
    'interviewing',
    'offer',
    'rejected',
    'withdrawn'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type connection_status as enum (
    'none',
    'sent',
    'accepted',
    'referral_given'
  );
exception
  when duplicate_object then null;
end $$;

-- Jobs table
create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  
  -- Job details
  company text not null,
  role text not null,
  job_url text,
  location text,
  salary text,
  status job_status not null default 'saved',
  jd_text text,
  resume_version text,
  applied_on date,
  source text default 'LinkedIn',
  
  -- Referral tracking
  referral_contact_name text,
  referral_contact_role text,
  referral_contact_linkedin_url text,
  connection_status connection_status not null default 'none',
  connection_sent_on date,
  next_followup_on date,
  
  -- Interview tracking & notes
  interview_dates jsonb default '[]'::jsonb,
  notes text
);

-- Row Level Security (RLS)
alter table public.jobs enable row level security;

-- Policies
create policy "Users can view their own jobs"
  on public.jobs for select
  using (auth.uid() = user_id);

create policy "Users can insert their own jobs"
  on public.jobs for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own jobs"
  on public.jobs for update
  using (auth.uid() = user_id);

create policy "Users can delete their own jobs"
  on public.jobs for delete
  using (auth.uid() = user_id);

-- Performance indexes
create index if not exists idx_jobs_user_status on public.jobs(user_id, status);
create index if not exists idx_jobs_next_followup on public.jobs(user_id, next_followup_on);
create index if not exists idx_jobs_created_at on public.jobs(user_id, created_at desc);

-- Automatic updated_at trigger
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_jobs_updated_at on public.jobs;
create trigger set_jobs_updated_at
  before update on public.jobs
  for each row
  execute function update_updated_at_column();

